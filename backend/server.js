// Carga variables de entorno desde un archivo .env en desarrollo local.
// En producción (Render) las variables se definen en el panel y dotenv no hace falta.
try { require('dotenv').config(); } catch (_) { /* dotenv es opcional en producción */ }

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pool = require('./models/db');
const { inicializarEsquema, limpiarCaducados } = require('./models/esquema');
const contactoRoutes = require('./routes/contactoRoutes');

const app = express();

// Render pone un proxy delante: sin esto todas las peticiones parecen venir de la
// misma IP y los límites de peticiones (rate limit) serían globales en vez de por cliente.
app.set('trust proxy', 1);

// H1 (auditoría) — El secreto de firma de los JWT ya NO va escrito en el código.
// Se lee de la variable de entorno JWT_SECRET. Si falta, el servidor no arranca
// (fail-closed): es preferible caer a arrancar firmando tokens con un valor conocido.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FALTA la variable de entorno JWT_SECRET. Defínela antes de iniciar el servidor.');
    process.exit(1);
}

// Express genera un ETag automático para cada respuesta JSON. Eso está bien
// para contenido estático, pero es peligroso en una API con datos sensibles
// y cambiantes: el navegador puede terminar recibiendo un 304 "sin cambios"
// con cuerpo vacío en vez de los datos reales, o mostrar datos desactualizados
// después de habilitar/deshabilitar un usuario. Lo desactivamos globalmente.
app.disable('etag');
// Oculta la cabecera X-Powered-By: Express (no anunciar la tecnología del servidor).
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// H3 (auditoría) — Cabeceras de seguridad HTTP (HSTS, X-Content-Type-Options,
// X-Frame-Options, etc.). helmet ya estaba importado pero nunca se activaba.
app.use(helmet());

// H4 (auditoría) — CORS restringido a los orígenes permitidos en vez de "*".
// Se definen en la variable CORS_ORIGINS (separados por comas). Las peticiones
// sin cabecera Origin (app Wear con OkHttp, curl, apps móviles) se permiten,
// porque CORS solo protege a los navegadores.
const origenesPermitidos = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.length === 0 || origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ninguna respuesta de esta API debe guardarse en caché del navegador.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use('/api/contacto', contactoRoutes);

// Roles de cuentas de personas. El rol "Reloj" es solo para tokens de dispositivo (V2)
// y únicamente se acepta en las rutas que lo nombran de forma explícita.
const ROLES_WEB = ['Usuario', 'Administrador', 'Editor'];
const DURACION_SESION_WEB_H = 2;
const DURACION_SESION_RELOJ_DIAS = 30;

/**
 * V6 — Emite un JWT con un identificador único (jti) y registra la sesión en la BD.
 * Mientras la fila exista y no esté revocada, el token es aceptado.
 */
async function emitirToken({ usuarioId, correo, rol, tipo, duracionSeg, descripcion = null }) {
    const jti = crypto.randomUUID();
    await pool.query(
        `INSERT INTO sesiones (jti, usuario_id, tipo, descripcion, expira_en)
         VALUES ($1, $2, $3, $4, NOW() + make_interval(secs => $5))`,
        [jti, usuarioId, tipo, descripcion, duracionSeg]
    );
    return jwt.sign({ id: usuarioId, correo, rol, tipo }, JWT_SECRET, {
        expiresIn: duracionSeg,
        jwtid: jti,
    });
}

const hashSha256 = (texto) => crypto.createHash('sha256').update(texto).digest('hex');


app.post('/api/auth/registro', async (req, res) => {
    const { nombre, apellidos, correo, password, telefono, genero, gusto_literario } = req.req_body || req.body;

    // Validaciones de formato en el servidor
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Mínimo 9 caracteres, al menos una minúscula, una mayúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{9,}$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(correo)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 9 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.' });
    }

    if (telefono && !phoneRegex.test(telefono)) {
        return res.status(400).json({ error: 'El teléfono debe contener exactamente 10 dígitos numéricos.' });
    }

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
            // H5 (auditoría) — Mismo mensaje que cuando la contraseña es incorrecta,
            // para no revelar si un correo está registrado (evita enumeración de usuarios).
            return res.status(401).json({ error: 'Credenciales inválidas.' });
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
            return res.status(401).json({ error: 'Credenciales inválidas.' });
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

        // Generar Token de Sesión (JWT) y registrarlo (V6: revocable al cerrar sesión)
        const token = await emitirToken({
            usuarioId: usuario.id,
            correo: usuario.correo,
            rol,
            tipo: 'web',
            duracionSeg: DURACION_SESION_WEB_H * 3600,
        });

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


/**
 * Valida el JWT y, además (V6), que su sesión siga activa en la BD: no revocada
 * (cierre de sesión / reloj desvinculado) y con la cuenta habilitada.
 * Sin lista de roles se acepta cualquier rol de persona, pero nunca un token de reloj.
 */
const verificarTokenyRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(403).json({ error: 'Acceso denegado. No se proporcionó un token.' });
        }

        let verificado;
        try {
            // Quitar el prefijo si existe
            const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
            verificado = jwt.verify(tokenLimpio, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Token inválido o sesión expirada.' });
        }

        // Tokens emitidos antes de este cambio no traen jti: no se pueden revocar, se rechazan.
        if (!verificado.jti) {
            return res.status(401).json({ error: 'Token inválido o sesión expirada.' });
        }

        try {
            const sesion = await pool.query(
                `SELECT s.revocada_en, s.expira_en, u.habilitado
                 FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
                 WHERE s.jti = $1`,
                [verificado.jti]
            );
            const fila = sesion.rows[0];
            if (!fila || fila.revocada_en || new Date(fila.expira_en) <= new Date() || !fila.habilitado) {
                return res.status(401).json({ error: 'Token inválido o sesión expirada.' });
            }
        } catch (err) {
            console.error('Error al validar la sesión:', err);
            return res.status(500).json({ error: 'No se pudo validar la sesión.' });
        }

        req.usuario = verificado;
        const rol = verificado.role || verificado.rol;
        const permitidos = rolesPermitidos || ROLES_WEB;
        if (!permitidos.includes(rol)) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos requeridos.' });
        }

        next();
    };
};

// V6 — Cerrar sesión: revoca el token actual (web o reloj). A partir de aquí,
// aunque alguien lo haya copiado y no haya expirado, el servidor lo rechaza.
app.post('/api/auth/logout', verificarTokenyRol([...ROLES_WEB, 'Reloj']), async (req, res) => {
    try {
        await pool.query(
            'UPDATE sesiones SET revocada_en = NOW() WHERE jti = $1 AND revocada_en IS NULL',
            [req.usuario.jti]
        );
        res.json({ mensaje: 'Sesión cerrada.' });
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
        res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
    }
});

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

        // V6 — Al deshabilitar, se revocan sus sesiones abiertas (web y relojes vinculados),
        // para que al volver a habilitarla no "reviva" ningún token anterior.
        if (!habilitado) {
            await pool.query(
                'UPDATE sesiones SET revocada_en = NOW() WHERE usuario_id = $1 AND revocada_en IS NULL',
                [id]
            );
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

// H2 (auditoría) — Requiere sesión válida (cualquier rol) para cambiar contraseña.
app.put('/api/usuarios/cambiar-password', verificarTokenyRol(), async (req, res) => {
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

// V1 — Listar pedidos requiere sesión. Un cliente (rol Usuario) solo ve SUS pedidos;
// el personal (Administrador/Editor) y los relojes vinculados ven los 15 más recientes.
app.get('/api/pedidos', verificarTokenyRol([...ROLES_WEB, 'Reloj']), async (req, res) => {
    try {
        const columnas = `id, usuario_id, nombre_cliente, correo_cliente, telefono_cliente, productos, total, estado, creado_en`;
        const esCliente = req.usuario.rol === 'Usuario';
        const resultado = esCliente
            ? await pool.query(
                `SELECT ${columnas} FROM pedidos_pickup WHERE usuario_id = $1 ORDER BY id DESC LIMIT 15`,
                [req.usuario.id]
            )
            : await pool.query(
                `SELECT ${columnas} FROM pedidos_pickup ORDER BY id DESC LIMIT 15`
            );
        res.status(200).json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener los pedidos:", err);
        res.status(500).json({ error: 'No se pudieron obtener los pedidos.' });
    }
});
// pedidos pickup con hora de México Centro
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

        // Obtener la fecha y hora exacta en la zona horaria de México Centro
        const fechaHoraMexico = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
        const fechaLocal = new Date(fechaHoraMexico);

        const query = `
            INSERT INTO pedidos_pickup (usuario_id, nombre_cliente, correo_cliente, telefono_cliente, productos, total, estado, creado_en) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Preparando en mostrador', $7) RETURNING *;
        `;
        const values = [usuario_id, nombre_cliente, correo_cliente, telefono_cliente, JSON.stringify(productos), total, fechaLocal];
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

// Cambiar el estatus de un pedido (Panel de Administración)
// H2 (auditoría) — Solo personal autorizado puede cambiar el estado de un pedido.
// V2 — También un reloj vinculado por personal autorizado.
app.patch('/api/pedidos/:id/estado', verificarTokenyRol(['Administrador', 'Editor', 'Reloj']), async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // Ej: "Preparando en mostrador", "Listo para recoger", "Entregado"

    try {
        const resultado = await pool.query(
            'UPDATE pedidos_pickup SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        res.json({
            mensaje: 'Estatus del pedido actualizado con éxito.',
            pedido: resultado.rows[0]
        });
    } catch (err) {
        console.error('Error al actualizar estatus:', err);
        res.status(500).json({ error: 'No se pudo actualizar el estatus.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// V2 — Vinculación del reloj (flujo "código en pantalla", como en una smart TV)
//
//  1. El reloj llama POST /api/reloj/vinculacion  -> recibe { id, codigo, secreto }.
//     Muestra el código de 6 dígitos y guarda id + secreto en memoria.
//  2. Una persona del personal, con sesión iniciada en la web desde su teléfono,
//     escribe el código en el panel -> POST /api/reloj/vinculacion/confirmar.
//  3. El reloj consulta POST /api/reloj/vinculacion/token { id, secreto } cada pocos
//     segundos; cuando ya está confirmado recibe UNA sola vez su token (rol "Reloj").
//
// El código solo sirve 10 minutos y únicamente puede confirmarlo alguien con sesión
// de Administrador/Editor. El secreto evita que otro dispositivo que vea el código
// en pantalla se lleve el token.
// ─────────────────────────────────────────────────────────────────────────────
const VIGENCIA_CODIGO_MIN = 10;

const limiteSolicitudReloj = rateLimit({
    windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes de vinculación. Intenta más tarde.' },
});
const limiteConfirmarReloj = rateLimit({
    windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Demasiados intentos de código. Intenta más tarde.' },
});
const limiteTokenReloj = rateLimit({
    windowMs: 10 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Demasiadas consultas. Intenta más tarde.' },
});

app.post('/api/reloj/vinculacion', limiteSolicitudReloj, async (req, res) => {
    try {
        const secreto = crypto.randomBytes(32).toString('hex');
        // Código de 6 dígitos que no coincida con otro pendiente en este momento
        for (let intento = 0; intento < 5; intento++) {
            const codigo = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
            const choque = await pool.query(
                `SELECT 1 FROM vinculaciones_reloj
                 WHERE codigo = $1 AND expira_en > NOW() AND entregada_en IS NULL`,
                [codigo]
            );
            if (choque.rows.length > 0) continue;

            const nueva = await pool.query(
                `INSERT INTO vinculaciones_reloj (codigo, secreto_hash, expira_en)
                 VALUES ($1, $2, NOW() + make_interval(mins => $3))
                 RETURNING id, expira_en`,
                [codigo, hashSha256(secreto), VIGENCIA_CODIGO_MIN]
            );
            return res.status(201).json({
                id: nueva.rows[0].id,
                codigo,
                secreto,
                expiraEn: nueva.rows[0].expira_en,
            });
        }
        res.status(503).json({ error: 'No se pudo generar un código. Intenta de nuevo.' });
    } catch (err) {
        console.error('Error al iniciar vinculación:', err);
        res.status(500).json({ error: 'No se pudo iniciar la vinculación.' });
    }
});

app.post('/api/reloj/vinculacion/confirmar', limiteConfirmarReloj,
    verificarTokenyRol(['Administrador', 'Editor']), async (req, res) => {
    const codigo = String(req.body?.codigo || '').trim();
    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({ error: 'El código debe tener 6 dígitos.' });
    }
    try {
        const resultado = await pool.query(
            `UPDATE vinculaciones_reloj
             SET usuario_id = $1, confirmada_en = NOW()
             WHERE id = (
                 SELECT id FROM vinculaciones_reloj
                 WHERE codigo = $2 AND expira_en > NOW() AND confirmada_en IS NULL
                 ORDER BY id DESC LIMIT 1
             )
             RETURNING id`,
            [req.usuario.id, codigo]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Código inválido o expirado.' });
        }
        res.json({ mensaje: 'Reloj vinculado. En unos segundos mostrará los pedidos.' });
    } catch (err) {
        console.error('Error al confirmar vinculación:', err);
        res.status(500).json({ error: 'No se pudo confirmar la vinculación.' });
    }
});

app.post('/api/reloj/vinculacion/token', limiteTokenReloj, async (req, res) => {
    const id = Number(req.body?.id);
    const secreto = String(req.body?.secreto || '');
    if (!Number.isInteger(id) || !/^[0-9a-f]{64}$/.test(secreto)) {
        return res.status(400).json({ error: 'Solicitud inválida.' });
    }
    try {
        const consulta = await pool.query(
            `SELECT secreto_hash, usuario_id, confirmada_en, entregada_en, expira_en > NOW() AS vigente
             FROM vinculaciones_reloj WHERE id = $1`,
            [id]
        );
        const v = consulta.rows[0];
        const secretoOk = v && crypto.timingSafeEqual(
            Buffer.from(v.secreto_hash, 'hex'), Buffer.from(hashSha256(secreto), 'hex')
        );
        if (!secretoOk) {
            return res.status(404).json({ error: 'Vinculación no encontrada.' });
        }
        if (v.entregada_en) {
            return res.status(410).json({ error: 'Este código ya se usó. Genera uno nuevo.' });
        }
        if (!v.confirmada_en) {
            if (!v.vigente) return res.status(410).json({ error: 'El código expiró. Genera uno nuevo.' });
            return res.status(202).json({ estado: 'pendiente' });
        }

        // Marcar como entregado de forma atómica: el token se entrega una sola vez
        const marcado = await pool.query(
            `UPDATE vinculaciones_reloj SET entregada_en = NOW()
             WHERE id = $1 AND entregada_en IS NULL RETURNING usuario_id`,
            [id]
        );
        if (marcado.rows.length === 0) {
            return res.status(410).json({ error: 'Este código ya se usó. Genera uno nuevo.' });
        }
        const usuario = await pool.query('SELECT correo FROM usuarios WHERE id = $1', [v.usuario_id]);

        const token = await emitirToken({
            usuarioId: v.usuario_id,
            correo: usuario.rows[0]?.correo,
            rol: 'Reloj',
            tipo: 'reloj',
            duracionSeg: DURACION_SESION_RELOJ_DIAS * 24 * 3600,
            descripcion: `Reloj vinculado (código ${id})`,
        });
        res.json({ token });
    } catch (err) {
        console.error('Error al entregar token de reloj:', err);
        res.status(500).json({ error: 'No se pudo completar la vinculación.' });
    }
});

// Relojes vinculados y activos. El Administrador ve todos; un Editor, solo los suyos.
app.get('/api/reloj/dispositivos', verificarTokenyRol(['Administrador', 'Editor']), async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'Administrador';
        const resultado = await pool.query(
            `SELECT s.jti, s.descripcion, s.creada_en, s.expira_en, u.nombre, u.correo
             FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
             WHERE s.tipo = 'reloj' AND s.revocada_en IS NULL AND s.expira_en > NOW()
               AND ($1::boolean OR s.usuario_id = $2)
             ORDER BY s.creada_en DESC`,
            [esAdmin, req.usuario.id]
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error('Error al listar relojes:', err);
        res.status(500).json({ error: 'No se pudo obtener la lista de relojes.' });
    }
});

// Desvincular (revocar) un reloj desde la web, p. ej. si se pierde.
app.delete('/api/reloj/dispositivos/:jti', verificarTokenyRol(['Administrador', 'Editor']), async (req, res) => {
    const { jti } = req.params;
    if (!/^[0-9a-f-]{36}$/i.test(jti)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }
    try {
        const esAdmin = req.usuario.rol === 'Administrador';
        const resultado = await pool.query(
            `UPDATE sesiones SET revocada_en = NOW()
             WHERE jti = $1 AND tipo = 'reloj' AND revocada_en IS NULL
               AND ($2::boolean OR usuario_id = $3)
             RETURNING jti`,
            [jti, esAdmin, req.usuario.id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Reloj no encontrado.' });
        }
        res.json({ mensaje: 'Reloj desvinculado. Ya no puede consultar ni modificar pedidos.' });
    } catch (err) {
        console.error('Error al desvincular reloj:', err);
        res.status(500).json({ error: 'No se pudo desvincular el reloj.' });
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
// H2 (auditoría) — Crear producto: solo Administrador o Editor.
app.post('/api/catalogo', verificarTokenyRol(['Administrador', 'Editor']), async (req, res) => {
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
// H2 (auditoría) — Actualizar producto: solo Administrador o Editor.
app.put('/api/catalogo/:id', verificarTokenyRol(['Administrador', 'Editor']), async (req, res) => {
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
// H2 (auditoría) — Eliminar producto: solo Administrador.
app.delete('/api/catalogo/:id', verificarTokenyRol(['Administrador']), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos_catalogo WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});


// Se crean las tablas de sesiones/vinculación antes de aceptar peticiones.
// Si no se pueden crear, el servidor no arranca (fail-closed): sin ellas
// ningún token podría validarse.
inicializarEsquema()
    .then(() => {
        limpiarCaducados();
        setInterval(limpiarCaducados, 60 * 60 * 1000);
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('No se pudo preparar el esquema de sesiones:', err);
        process.exit(1);
    });