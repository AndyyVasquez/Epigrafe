const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
// const env = require('./config/env');
const jwt = require('jsonwebtoken');
const pool = require('./models/db');
const contactoRoutes = require('./routes/contactoRoutes');

const app = express();
const JWT_SECRET = 'mi_clave_secreta_super_segura_para_epigrafe'; 

// Express genera un ETag automático para cada respuesta JSON. Eso está bien
// para contenido estático, pero es peligroso en una API con datos sensibles
// y cambiantes: el navegador puede terminar recibiendo un 304 "sin cambios"
// con cuerpo vacío en vez de los datos reales, o mostrar datos desactualizados
// después de habilitar/deshabilitar un usuario. Lo desactivamos globalmente.
app.disable('etag');
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ninguna respuesta de esta API debe guardarse en caché del navegador.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use('/api/contacto', contactoRoutes);


app.post('/api/auth/registro', async (req, res) => {
    const { nombre, apellidos, correo, password, telefono, genero, gusto_literario } = req.req_body || req.body;

    try {
        // Cifrado/Hash de contraseña con Salt de 10 rondas
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, apellidos, correo, password, telefono, genero, gusto_literario) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, correo`,
            [nombre, apellidos, correo, passwordHash, telefono, genero, gusto_literario]
        );

        const usuarioId = nuevoUsuario.rows[0].id;

        // Asignar rol por defecto: Usuario
        await pool.query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, 3)', [usuarioId]);

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente con rol de Usuario' });
    } catch (err) {
        // Manejo adecuado de errores
        if (err.code === '23505') { 
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
});


app.post('/api/auth/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Verificar si el usuario existe
       const usuarioRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (usuarioRes.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas (Correo no encontrado).' });
        }

        const usuario = usuarioRes.rows[0];

        // Verificación de estado de la cuenta: una cuenta deshabilitada
        // permanece guardada en el sistema (no se borra), pero no puede
        // iniciar sesión aunque la contraseña sea correcta.
        if (!usuario.habilitado) {
            return res.status(403).json({ error: 'Esta cuenta está deshabilitada. Contacta a un administrador.' });
        }

        // Validación de credenciales comparando hashes
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas (Contraseña incorrecta).' });
        }

        // Registrar el último inicio de sesión exitoso
        await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [usuario.id]);

        // Obtener el rol del usuario
        const rolRes = await pool.query(
            `SELECT r.nombre FROM roles r 
             JOIN usuario_rol ur ON r.id = ur.rol_id 
             WHERE ur.usuario_id = $1`, [usuario.id]
        );
        const rol = rolRes.rows[0].nombre;

        // Generar Token de Sesión (JWT)
        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: rol },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Inicio de sesión correcto',
            token: token,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: rol,
                requiereCambioPassword: usuario.requiere_cambio_password,
            }
        });

    } catch (err) {
        console.error("DETALLE DEL ERROR:", err);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión.' });
    }
});


const verificarTokenyRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(403).json({ error: 'Acceso denegado. No se proporcionó un token.' });
        }

        try {
            // Quitar el prefijo si existe
            const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
            
            // Validar sesión leyendo el JWT
            const verificado = jwt.verify(tokenLimpio, JWT_SECRET);
            req.usuario = verificado;

            // Validar si el rol del usuario tiene permiso para este módulo
            if (rolesPermitidos && !rolesPermitidos.includes(verificado.role || verificado.rol)) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos requeridos.' });
            }

            next();
        } catch (err) {
            res.status(401).json({ error: 'Token inválido o sesión expirada.' });
        }
    };
};

// Rutas Protegidas 
app.get('/api/admin/dashboard', verificarTokenyRol(['Administrador']), (req, res) => {
    res.json({ contenido: 'Bienvenido al panel de administración de Epígrafe.' });
});

app.get('/api/editor/catalogo', verificarTokenyRol(['Administrador', 'Editor']), (req, res) => {
    res.json({ contenido: 'Módulo de edición de catálogo disponible.' });
});


// Gestión de cuentas de usuario (solo Administrador)
// Equivalente web de habilitar/deshabilitar cuentas de un sistema operativo:
// una cuenta deshabilitada NUNCA se borra, solo se le impide iniciar sesión.

// Lista todos los usuarios con su estado, grupo (rol) y metadatos de cuenta.
app.get('/api/admin/usuarios', verificarTokenyRol(['Administrador']), async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT u.id, u.nombre, u.apellidos, u.correo, u.habilitado,
                    u.creado_en, u.ultimo_login, u.requiere_cambio_password,
                    r.nombre AS rol
             FROM usuarios u
             LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
             LEFT JOIN roles r ON r.id = ur.rol_id
             ORDER BY u.creado_en DESC`
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error('Error al listar usuarios:', err);
        res.status(500).json({ error: 'No se pudo obtener la lista de usuarios.' });
    }
});

// Habilita o deshabilita una cuenta. Nunca elimina al usuario ni sus datos.
app.patch('/api/admin/usuarios/:id/estado', verificarTokenyRol(['Administrador']), async (req, res) => {
    const { id } = req.params;
    const { habilitado } = req.body;

    if (typeof habilitado !== 'boolean') {
        return res.status(400).json({ error: 'El campo "habilitado" debe ser true o false.' });
    }

    // Un administrador no puede deshabilitarse a sí mismo, para evitar
    // quedarse fuera del sistema sin nadie que pueda revertirlo.
    if (Number(id) === req.usuario.id && habilitado === false) {
        return res.status(400).json({ error: 'No puedes deshabilitar tu propia cuenta.' });
    }

    try {
        const resultado = await pool.query(
            'UPDATE usuarios SET habilitado = $1 WHERE id = $2 RETURNING id, nombre, habilitado',
            [habilitado, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({
            mensaje: habilitado ? 'Cuenta habilitada correctamente.' : 'Cuenta deshabilitada correctamente.',
            usuario: resultado.rows[0],
        });
    } catch (err) {
        console.error('Error al cambiar estado del usuario:', err);
        res.status(500).json({ error: 'No se pudo actualizar el estado de la cuenta.' });
    }
});

app.put('/api/usuarios/cambiar-password', async (req, res) => {
    const { correo, passwordActual, nuevoPassword } = req.body;
    try {
        const usuario = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (usuario.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Aquí puedes validar con bcrypt si usas hash, o actualizar directamente:
        const bcrypt = require('bcryptjs');
        const match = await bcrypt.compare(passwordActual, usuario.rows[0].password);
        
        if (!match) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

        const salt = await bcrypt.genSalt(10);
        const hashNuevo = await bcrypt.hash(nuevoPassword, salt);

        await pool.query('UPDATE usuarios SET password = $1 WHERE correo = $2', [hashNuevo, correo]);
        res.json({ mensaje: '¡Contraseña actualizada con éxito!' });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor al cambiar contraseña' });
    }
});

//mensaje Escríbenos
app.post('/api/contacto', async (req, res) => {
    const { nombre, correo, asunto, mensaje } = req.body;
    try {
        const nuevoMensaje = await pool.query(
            'INSERT INTO mensajes_contacto (nombre, correo, asunto, mensaje) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correo, asunto, mensaje]
        );
        res.status(201).json({ mensaje: 'Mensaje enviado con éxito', id: nuevoMensaje.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno en el servidor' });
    }
});

//pedidos pickup
app.post('/api/pedidos', verificarTokenyRol(['Usuario', 'Administrador', 'Editor']), async (req, res) => {
    const { usuario_id, nombre_cliente, correo_cliente, telefono_cliente, productos, total } = req.body;

    if (!usuario_id || !correo_cliente) {
        return res.status(401).json({ error: 'Debes iniciar sesión para realizar un pedido de pickup.' });
    }

    try {
        await pool.query('BEGIN');

        for (let item of productos) {
            if (item.id) {
                const checkStock = await pool.query('SELECT stock FROM productos_catalogo WHERE id = $1', [item.id]);
                
                if (checkStock.rows.length > 0) {
                    const stockActual = checkStock.rows[0].stock;
                    if (stockActual <= 0) {
                        await pool.query('ROLLBACK');
                        return res.status(400).json({ error: `Lo sentimos, el producto "${item.titulo || item.nombre}" se ha agotado.` });
                    }
                    await pool.query('UPDATE productos_catalogo SET stock = stock - 1 WHERE id = $1', [item.id]);
                }
            }
        }

        const query = `
            INSERT INTO pedidos_pickup (usuario_id, nombre_cliente, correo_cliente, telefono_cliente, productos, total, estado) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Preparando en mostrador') RETURNING *;
        `;
        const values = [usuario_id, nombre_cliente, correo_cliente, telefono_cliente, JSON.stringify(productos), total];
        const nuevoPedido = await pool.query(query, values);

        await pool.query('COMMIT');
        
        res.status(201).json({ 
            mensaje: '¡Pedido confirmado! Te esperamos en mostrador.', 
            pedido: nuevoPedido.rows[0] 
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error en pickup:", err);
        res.status(500).json({ error: 'No se pudo procesar el pedido.', detalle: err.message });
    }
});

// OBTENER TODOS LOS PRODUCTOS O FILTRAR POR CATEGORÍA
app.get('/api/catalogo', async (req, res) => {
    const { categoria } = req.query;
    try {
        let query = 'SELECT * FROM productos_catalogo';
        let values = [];
        if (categoria) {
            query += ' WHERE categoria = $1';
            values.push(categoria);
        }
        const resultado = await pool.query(query, values);
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el catálogo' });
    }
});

// CREAR PRODUCTO (CRUD - Admin)
app.post('/api/catalogo', async (req, res) => {
    const { categoria, titulo, autor, descripcion, precio, stock, imagen, tipo_etiqueta } = req.body;
    try {
        const nuevo = await pool.query(
            `INSERT INTO productos_catalogo (categoria, titulo, autor, descripcion, precio, stock, imagen, tipo_etiqueta) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [categoria, titulo, autor, descripcion, precio, stock, imagen, tipo_etiqueta]
        );
        res.status(201).json({ mensaje: 'Producto creado con éxito', producto: nuevo.rows[0] });
    } catch (err) {
      console.error("DETALLE DEL ERROR:", err);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// ACTUALIZAR PRODUCTO (CRUD - Admin)
app.put('/api/catalogo/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria, titulo, autor, descripcion, precio, stock, imagen, tipo_etiqueta } = req.body;
    try {
        const actualizado = await pool.query(
            `UPDATE productos_catalogo 
             SET categoria = $1, titulo = $2, autor = $3, descripcion = $4, precio = $5, stock = $6, imagen = $7, tipo_etiqueta = $8 
             WHERE id = $9 RETURNING *`,
            [categoria, titulo, autor, descripcion, precio, stock, imagen, tipo_etiqueta, id]
        );

        if (actualizado.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado con éxito', producto: actualizado.rows[0] });
    } catch (err) {
        console.error("Error al actualizar:", err);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// ELIMINAR PRODUCTO (CRUD - Admin)
app.delete('/api/catalogo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos_catalogo WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});