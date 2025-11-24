
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================
// Conexão com MySQL
// ==========================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '99156854',
    database: 'gerencia_contas'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL conectado');
});

// ===============================
// Criar salário do mês
// ===============================
app.post('/salario', (req, res) => {
    const { mes, ano, salario } = req.body;

    if (!mes || !ano || !salario) {
        return res.status(400).json({ error: 'mes, ano e salario são obrigatórios' });
    }

    const sql = `INSERT INTO salarios (mes, ano, salario) VALUES (?,?,?) 
                 ON DUPLICATE KEY UPDATE salario = VALUES(salario)`;

    db.query(sql, [mes, ano, salario], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Salário registrado/atualizado com sucesso' });
    });
});

// ===============================
// Listar salários
// ===============================
app.get('/salario/:mes/:ano', (req, res) => {
    const { mes, ano } = req.params;

    db.query('SELECT salario FROM salarios WHERE mes=? AND ano=?', [mes, ano], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows[0] || { salario: 0 });
    });
});


// ===============================
// Cadastrar conta
// ===============================
app.post('/contas', (req, res) => {
    const { nome, tipo, valor, data_vencimento, mes, ano } = req.body;

    if (!nome || !valor || !mes || !ano) {
        return res.status(400).json({ error: 'nome, valor, mes e ano são obrigatórios' });
    }

    const sql = `
      INSERT INTO contas (nome, tipo, valor, data_vencimento, status, mes, ano)
      VALUES (?,?,?,?, 'PENDENTE', ?, ?)
    `;

    db.query(
        sql,
        [nome, tipo || null, valor, data_vencimento || null, mes, ano],
        (err) => {
            if (err) {
                console.error('Erro ao inserir conta:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Conta registrada com sucesso' });
        }
    );
});


// ===============================
// Listar contas por mês/ano
// ===============================
app.get('/contas/:mes/:ano', (req, res) => {
    const { mes, ano } = req.params;

    const sql = `
      SELECT id, nome, tipo, valor, 
             DATE_FORMAT(data_vencimento, '%Y-%m-%d') AS data_vencimento,
             status, mes, ano
      FROM contas
      WHERE mes=? AND ano=?
      ORDER BY id DESC
    `;

    db.query(sql, [mes, ano], (err, results) => {
        if (err) {
            console.error('Erro ao buscar contas:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// ===============================
// Atualizar conta
// ===============================
app.put('/contas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, tipo, valor, data_vencimento, status, mes, ano } = req.body;

    if (!nome || !valor || !mes || !ano) {
        return res.status(400).json({ error: 'nome, valor, mes e ano são obrigatórios' });
    }

    const sql = `
      UPDATE contas
      SET nome=?, tipo=?, valor=?, data_vencimento=?, status=?, mes=?, ano=?
      WHERE id=?
    `;

    db.query(
        sql,
        [nome, tipo || null, valor, data_vencimento || null, status || 'PENDENTE', mes, ano, id],
        (err) => {
            if (err) {
                console.error('Erro ao atualizar conta:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Conta atualizada com sucesso' });
        }
    );
});


// ===============================
// Atualizar status da conta (PENDENTE/PAGO)
// ===============================
app.put('/contas/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDENTE', 'PAGO'].includes(status)) {
        return res.status(400).json({ error: 'status inválido' });
    }

    db.query('UPDATE contas SET status=? WHERE id=?', [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status atualizado' });
    });
});

// ===============================
// Deletar conta
// ===============================
app.delete('/contas/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM contas WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Conta removida' });
    });
});

// ===============================
// Resumo do mês: salário, total, pagos, pendentes, saldo
// ===============================
app.get('/resumo/:mes/:ano', (req, res) => {
    const { mes, ano } = req.params;

    const sqlContas = `
        SELECT
        COALESCE(SUM(valor),0) AS total,
        COALESCE(SUM(CASE WHEN status='PAGO' THEN valor ELSE 0 END),0) AS pagos,
        COALESCE(SUM(CASE WHEN status='PENDENTE' THEN valor ELSE 0 END),0) AS pendentes
        FROM contas
        WHERE mes=? AND ano=?
    `;

    db.query(sqlContas, [mes, ano], (err, contaRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('SELECT salario FROM salarios WHERE mes=? AND ano=?', [mes, ano], (err, salRows) => {
            if (err) return res.status(500).json({ error: err.message });

            const salario = salRows[0]?.salario || 0;
            const total = contaRows[0]?.total || 0;
            const pagos = contaRows[0]?.pagos || 0;
            const pendentes = contaRows[0]?.pendentes || 0;

            res.json({
                salario,
                total_contas: total,
                pagos,
                pendentes,
                saldo_final: salario - total
            });
        });
    });
});

// ===============================
// Health Check
// ===============================
app.get('/', (req, res) => res.send('API gerencia-contas OK'));

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`API rodando na porta http://localhost:4001 ${PORT}`));