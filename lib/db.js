const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'eee_admin',
            password: process.env.DB_PASSWORD || 'eee_password',
            database: process.env.DB_NAME || 'eee',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        });
    }
    return pool;
}

async function query(sql, params) {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function getConnection() {
    const pool = getPool();
    return await pool.getConnection();
}

module.exports = {
    query,
    getConnection,
    getPool
};
