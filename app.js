const express = require('express');
const mysql = require('mysql2');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de conexiones desde variables de entorno
const dbConfigMySQL = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: true
  }
};

const dbConfigPostgres = {
  host: process.env.DB_HOST_PG,
  user: process.env.DB_USER_PG,
  password: process.env.DB_PASS_PG,
  port: process.env.DB_PORT_PG || 5432,
  database: 'postgres', // <<< Usamos la base de datos default de PostgreSQL
  ssl: {
    rejectUnauthorized: true
  }
};

app.get('/', async (req, res) => {
  let mysqlStatus = 'Desconectado';
  let postgresStatus = 'Desconectado';
  let mysqlResult = '';
  let postgresResult = '';

  try {
    const mysqlConnection = await mysql.createConnection(dbConfigMySQL).promise();
    const [rows] = await mysqlConnection.query('SELECT NOW() AS datentime');
    mysqlStatus = 'Conectado exitosamente a MySQL';
    mysqlResult = `Hora actual desde MySQL: ${rows[0].datentime}`;
    await mysqlConnection.end();
  } catch (error) {
    mysqlStatus = 'Error en conexión a MySQL: ' + error.message;
  }

  try {
    const pgClient = new Client(dbConfigPostgres);
    await pgClient.connect();
    const result = await pgClient.query('SELECT NOW() AS current_time');
    postgresStatus = 'Conectado exitosamente a PostgreSQL';
    postgresResult = `Hora actual desde PostgreSQL: ${result.rows[0].current_time}`;
    await pgClient.end();
  } catch (error) {
    postgresStatus = 'Error en conexión a PostgreSQL: ' + error.message;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Estado de Conexiones - WebApp Azure</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color:rgb(108, 167, 255);
          padding: 40px;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        .status {
          margin-top: 30px;
          display: inline-block;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
          max-width: 600px;
        }
        .ok {
          color: green;
          font-weight: bold;
        }
        .error {
          color: red;
          font-weight: bold;
        }
        .result {
          margin-top: 10px;
          font-size: 14px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <h1>Estado de conexiones a Bases de Datos</h1>
      <div class="status">
        <p><strong>MySQL:</strong> <span class="${mysqlStatus.includes('Conectado') ? 'ok' : 'error'}">${mysqlStatus}</span></p>
        <div class="result">${mysqlResult}</div>
        <p><strong>PostgreSQL:</strong> <span class="${postgresStatus.includes('Conectado') ? 'ok' : 'error'}">${postgresStatus}</span></p>
        <div class="result">${postgresResult}</div>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});