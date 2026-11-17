const pool = require('./db');

// Tablas de seguridad que crea el propio servidor al arrancar (idempotente).
//
// V6 — sesiones: cada token emitido (web o reloj) tiene una fila identificada por
//      su "jti". Cerrar sesión o desvincular un reloj marca la fila como revocada,
//      y el middleware rechaza el token aunque su firma y su expiración sigan siendo válidas.
// V2 — vinculaciones_reloj: códigos temporales para enlazar un reloj con una cuenta
//      de personal desde la web (abierta en el teléfono).
const SQL_ESQUEMA = `
CREATE TABLE IF NOT EXISTS sesiones (
    jti          UUID PRIMARY KEY,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo         VARCHAR(10) NOT NULL DEFAULT 'web',   -- 'web' | 'reloj'
    descripcion  VARCHAR(100),
    creada_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_en    TIMESTAMPTZ NOT NULL,
    revocada_en  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones (usuario_id);

CREATE TABLE IF NOT EXISTS vinculaciones_reloj (
    id             SERIAL PRIMARY KEY,
    codigo         CHAR(6) NOT NULL,
    secreto_hash   CHAR(64) NOT NULL,                  -- SHA-256 del secreto que guarda el reloj
    usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    creada_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_en      TIMESTAMPTZ NOT NULL,
    confirmada_en  TIMESTAMPTZ,
    entregada_en   TIMESTAMPTZ,
    intentos       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_vinculaciones_codigo ON vinculaciones_reloj (codigo);
`;

async function inicializarEsquema() {
    await pool.query(SQL_ESQUEMA);
}

// Borra filas que ya no sirven para nada (expiradas hace más de un día).
async function limpiarCaducados() {
    try {
        await pool.query(`DELETE FROM sesiones WHERE expira_en < NOW() - INTERVAL '1 day'`);
        await pool.query(`DELETE FROM vinculaciones_reloj WHERE expira_en < NOW() - INTERVAL '1 day'`);
    } catch (err) {
        console.error('Error al limpiar sesiones caducadas:', err.message);
    }
}

module.exports = { inicializarEsquema, limpiarCaducados };
