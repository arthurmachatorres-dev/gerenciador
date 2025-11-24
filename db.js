const mysql = require('mysql2');


const pool = mysql.createPool({
host: 'localhost',
user: 'root',
password: '99156854',
database: 'gerencia_contas',
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});


module.exports = pool;