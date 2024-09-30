import express from "express";
import path from "path"; // 新增這一行來處理路徑
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import playerRoutes from "./Routes/playerRoutes.js";

const app = express();

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

// 提供靜態資源
const __dirname = path.resolve(); // 獲取當前目錄
app.use(express.static(path.join(__dirname, "build"))); // 使用 build 資料夾作為靜態資源

app.use("/playerdata", playerRoutes(connection));

// 所有其他路由重定向到 React 的 index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html")); // React 入口文件
});

export { app };
export { connection };
