// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',   
  host: 'localhost',
  database: 'epigrafe_db', 
  password: '21022003', 
  port: 5432,              // Puerto estándar de Postgres
});

// Probar la conexión (sin tumbar el servidor si falla: solo lo registramos)
pool.connect((err, client, done) => {
  if (err) {
    console.error('❌ No se pudo conectar a PostgreSQL:', err.message);
    return;
  }
  console.log('✅ Conexión a PostgreSQL establecida correctamente');
  done();
});

module.exports = pool;