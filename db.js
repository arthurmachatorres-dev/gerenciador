const mysql = require('mysql2');
require('dotenv').config(); // carrega variáveis do .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // host do Aiven
  port: process.env.DB_PORT || 3306, // porta do banco (confirme no painel Aiven)
  user: process.env.DB_USER,       // usuário do Aiven
  password: process.env.DB_PASS,   // senha do Aiven
  database: process.env.DB_NAME,   // database do Aiven
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false // DESABILITA SSL no plano gratuito
});

module.exports = pool;
