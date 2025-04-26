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
};

const dbConfigPostgres = {
  host: process.env.DB_HOST_PG,
  user: process.env.DB_USER_PG,
  password: process.env.DB_PASS_PG,
  port: process.env.DB_PORT_PG || 5432,
  database: process.env.DB_NAME_PG || 'postgres'
};

app.get('/', async (req, res) => {
  let mysqlConnectionStatus = 'Desconectado';
  let postgresConnectionStatus = 'Desconectado';

  try {
    const mysqlConnection = await mysql.createConnection(dbConfigMySQL).promise();
    await mysqlConnection.query('SELECT 1');
    mysqlConnectionStatus = 'Conectado exitosamente a MySQL';
    await mysqlConnection.end();
  } catch (error) {
    mysqlConnectionStatus = 'Error en conexión a MySQL: ' + error.message;
  }

  try {
    const pgClient = new Client(dbConfigPostgres);
    await pgClient.connect();
    await pgClient.query('SELECT 1');
    postgresConnectionStatus = 'Conectado exitosamente a PostgreSQL';
    await pgClient.end();
  } catch (error) {
    postgresConnectionStatus = 'Error en conexión a PostgreSQL: ' + error.message;
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
          background-color: #f0f2f5;
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
        }
        .ok {
          color: green;
          font-weight: bold;
        }
        .error {
          color: red;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>Estado de conexiones a Bases de Datos</h1>
      <div class="status">
        <p><strong>MySQL:</strong> <span class="${mysqlConnectionStatus.includes('Conectado') ? 'ok' : 'error'}">${mysqlConnectionStatus}</span></p>
        <p><strong>PostgreSQL:</strong> <span class="${postgresConnectionStatus.includes('Conectado') ? 'ok' : 'error'}">${postgresConnectionStatus}</span></p>
      </div>
    </body>
    </html>
  `);
  
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
