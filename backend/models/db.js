const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL en Render'))
  .catch(err => console.error('❌ No se pudo conectar a PostgreSQL:', err));

module.exports = pool;