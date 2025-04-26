const express = require("express");
const mysql = require("mysql2");
const { Client } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Configuración de conexiones desde variables de entorno
const dbConfigMySQL = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: true,
  },
};

const dbConfigPostgres = {
  host: process.env.DB_HOST_PG,
  user: process.env.DB_USER_PG,
  password: process.env.DB_PASS_PG,
  port: process.env.DB_PORT_PG || 5432,
  database: "postgres", // <<< Usamos la base de datos default de PostgreSQL
  ssl: {
    rejectUnauthorized: true,
  },
};

app.get("/", async (req, res) => {
  let mysqlStatus = "Desconectado";
  let postgresStatus = "Desconectado";
  let mysqlResult = "";
  let postgresResult = "";

  try {
    const mysqlConnection = await mysql
      .createConnection(dbConfigMySQL)
      .promise();
    const [rows] = await mysqlConnection.query("SELECT NOW() AS datentime");
    mysqlStatus = "Conectado exitosamente a MySQL";
    mysqlResult = `Hora actual desde MySQL: ${rows[0].datentime}`;
    await mysqlConnection.end();
  } catch (error) {
    mysqlStatus = "Error en conexión a MySQL: " + error.message;
  }

  try {
    const pgClient = new Client(dbConfigPostgres);
    await pgClient.connect();
    const result = await pgClient.query("SELECT NOW() AS current_time");
    postgresStatus = "Conectado exitosamente a PostgreSQL";
    postgresResult = `Hora actual desde PostgreSQL: ${result.rows[0].current_time}`;
    await pgClient.end();
  } catch (error) {
    postgresStatus = "Error en conexión a PostgreSQL: " + error.message;
  }

  res.send(`
    <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Fck Conexiones - WebApp Azure</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #4e73df, #1cc88a);
      min-height: 100vh;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: center;
      color: #fff;
    }
    h1 {
      font-size: 36px;
      margin-bottom: 30px;
      letter-spacing: 1.5px;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
    }
    .status-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      width: 100%;
      max-width: 600px;
    }
    .db-status {
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 500px;
    }
    .db-status strong {
      font-size: 18px;
      font-weight: bold;
      color: #f1f1f1;
    }
    .status-info {
      font-size: 20px;
      margin-top: 10px;
    }
    .ok {
      color: #28a745;
      font-weight: bold;
    }
    .error {
      color: #dc3545;
      font-weight: bold;
    }
    .result {
      font-size: 14px;
      color: #ccc;
      margin-top: 5px;
    }
  </style>
</head>
<body>

  <h1>Conexiones</h1>
  
  <div class="status-container">
    <div class="db-status">
      <strong>MySQL:</strong>
      <div class="status-info ${mysqlStatus.includes('Conectado') ? 'ok' : 'error'}">${mysqlStatus}</div>
      <div class="result">${mysqlResult}</div>
    </div>

    <div class="db-status">
      <strong>PostgreSQL:</strong>
      <div class="status-info ${postgresStatus.includes('Conectado') ? 'ok' : 'error'}">${postgresStatus}</div>
      <div class="result">${postgresResult}</div>
    </div>
  </div>

</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
