const pool = require('./db');

pool.query('SELECT 1 + 1 AS resultado', (err, rows) => {
  if (err) {
    console.error('Erro na conexão:', err);
  } else {
    console.log('Conexão OK:', rows);
  }
  pool.end(); // fecha o pool
});
