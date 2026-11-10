const { Pool } = require('pg');

// H6 (auditoría) — Por defecto se valida el certificado TLS de la base de datos
// (rejectUnauthorized: true), para evitar un ataque intermediario contra la BD.
// Si el proveedor usa una CA no estándar y la conexión fallara, se puede relajar
// temporalmente poniendo DB_SSL_REJECT_UNAUTHORIZED=false en el entorno.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  }
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL en Render'))
  .catch(err => console.error('❌ No se pudo conectar a PostgreSQL:', err));

module.exports = pool;