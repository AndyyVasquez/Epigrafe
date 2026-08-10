const pool = require('../models/db');

// Recibe un mensaje del formulario de "Contáctanos" y lo guarda en la BD.
// Este endpoint es público (no requiere sesión) porque cualquier visitante,
// tenga o no cuenta, debe poder escribirle a la cafebrería.
const enviarMensaje = async (req, res, next) => {
    const { nombre, correo, asunto, mensaje } = req.body;

    try {
        const resultado = await pool.query(
            `INSERT INTO mensajes_contacto (nombre, correo, asunto, mensaje)
             VALUES ($1, $2, $3, $4) RETURNING id, creado_en`,
            [nombre, correo, asunto, mensaje]
        );

        res.status(201).json({
            mensaje: 'Tu mensaje fue enviado correctamente. Te responderemos pronto.',
            id: resultado.rows[0].id,
            recibidoEn: resultado.rows[0].creado_en,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { enviarMensaje };