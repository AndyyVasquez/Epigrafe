const express = require('express');
const rateLimit = require('express-rate-limit');
const { enviarMensaje } = require('../controllers/contactoController');
const { mensajeValidator } = require('../validators/contactoValidator');

const router = express.Router();

// Evita que alguien haga spam al formulario: máx. 5 mensajes cada 10 min por IP
const contactoLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Has enviado demasiados mensajes. Intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', contactoLimiter, mensajeValidator, enviarMensaje);

module.exports = router;