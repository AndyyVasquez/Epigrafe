const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
// const env = require('./config/env');
const jwt = require('jsonwebtoken');
const pool = require('./models/db');

const app = express();
const JWT_SECRET = 'mi_clave_secreta_super_segura_para_epigrafe'; 

app.use(cors());
app.use(express.json());


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

        // Validación de credenciales comparando hashes
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas (Contraseña incorrecta).' });
        }

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
            usuario: { nombre: usuario.nombre, correo: usuario.correo, rol: rol }
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

app.listen(3000, () => {
    console.log('Servidor seguro corriendo en http://localhost:3000');
});