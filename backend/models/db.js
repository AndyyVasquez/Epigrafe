// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',   
  host: 'localhost',
  database: 'epigrafe_db', 
  password: '21022003', 
  port: 5432,              // Puerto estándar de Postgres
});

// Probar la conexión
pool.connect((err, client, done) => {
  if (err) throw err;
  console.log('✅ Conexión a PostgreSQL establecida correctamente');
  done();
});

module.exports = pool;