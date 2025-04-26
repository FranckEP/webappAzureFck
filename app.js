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
  <title>Estado de Conexiones - WebApp Azure</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #6da3ff, #91c8ff);
      min-height: 100vh;
      margin: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    h1 {
      color: #ffffff;
      margin-bottom: 30px;
      font-size: 36px;
    }
    .card {
      background: #fff;
      padding: 30px 40px;
      border-radius: 15px;
      box-shadow: 0px 8px 20px rgba(0,0,0,0.15);
      max-width: 500px;
      width: 90%;
    }
    .db-status {
      margin: 20px 0;
      font-size: 18px;
    }
    .ok {
      color: #2ecc71;
      font-weight: bold;
    }
    .error {
      color: #e74c3c;
      font-weight: bold;
    }
    .result {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
  </style>
</head>
<body>

  <h1>Estado de Conexiones</h1>
  
  <div class="card">
    <div class="db-status">
      <strong>MySQL:</strong> <span class="${
        mysqlStatus.includes("Conectado") ? "ok" : "error"
      }">${mysqlStatus}</span>
      <div class="result">${mysqlResult}</div>
    </div>

    <div class="db-status">
      <strong>PostgreSQL:</strong> <span class="${
        postgresStatus.includes("Conectado") ? "ok" : "error"
      }">${postgresStatus}</span>
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
