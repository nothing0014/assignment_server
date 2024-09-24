const express = require("express");
const app = express();
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/playerdata", require("./Routes/playerRoutes")(connection));

app.listen(9999, () => {
  console.log("後端伺服器聆聽在port 9999...");
});
