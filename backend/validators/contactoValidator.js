const { body, validationResult } = require('express-validator');

const validar = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const mensajeValidator = [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
    body('correo').trim().isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('asunto').trim().notEmpty().withMessage('El asunto es requerido')
        .isLength({ max: 150 }),
    body('mensaje').trim().notEmpty().withMessage('El mensaje no puede estar vacío')
        .isLength({ max: 2000 }).withMessage('El mensaje es demasiado largo (máx. 2000 caracteres)'),
    validar,
];

module.exports = { mensajeValidator };