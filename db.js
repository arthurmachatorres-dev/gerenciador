const mysql = require('mysql');

// Cria pool usando variáveis de ambiente
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // host do Aiven
  user: process.env.DB_USER,       // usuário do Aiven
  password: process.env.DB_PASS,   // senha do Aiven
  database: process.env.DB_NAME,   // database do Aiven
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
