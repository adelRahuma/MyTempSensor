const express = require("express");
const dotenv = require("dotenv").config();
const mysql = require("mysql2/promise"); // Using promise-based MySQL
const cors = require("cors");

const app = express();
const port =  3000; // Use the specified port in the environment or default to 3000

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.MYUSER,
  password: process.env.PASSWD,
  database: process.env.DATABASE,
  waitForConnections: true, // Wait for available connection if the limit is reached
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited queued connection requests
});
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.post("/arduino-data", async (req, res) => {
  try {
    const data = req.body.data;
    const connection = await pool.getConnection();
    await connection.changeUser({ database: process.env.DATABASE });
    const query = "INSERT INTO TempSensor(TEMP) VALUES (?)";
    const [results] = await connection.execute(query, [data]);
    connection.release();
    res.status(201).json({ result: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/data", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.changeUser({ database: process.env.DATABASE });
    const query = "SELECT * FROM TempSensor";
    const [results] = await connection.execute(query);
    connection.release();
    res.send({ data: results }); // Wrap the results in an object
  } catch (error) {
    console.error("Error:", error);
    res.send({ error: "Internal Server Error", details: error.message });
  }
});
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
