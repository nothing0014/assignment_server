import express from "express";

export default function (connection) {
  const router = express.Router();

  // Routes
  router.get("/", (req, res) => {
    const numPerPage = 15;
    const page = req.query.page;

    const teamName = req.query.teamname || ""; // 隊伍名稱的 query 參數，預設為空
    const playerName = req.query.playername || ""; // 球員名字的 query 參數，預設為空

    let sql = "SELECT * FROM players WHERE 1=1"; // 初始 SQL 語句，1=1 是為了方便添加條件

    // 若有隊伍名稱，添加隊伍篩選條件
    if (teamName && teamName != "ALL") {
      sql += " AND team_name = ?";
    }

    // 若有球員名字，添加球員名字的部分搜尋條件
    if (playerName) {
      sql += " AND name LIKE ?";
    }

    sql += " LIMIT ? OFFSET ?";

    // 準備 SQL 查詢的參數值
    const values = [];
    if (teamName) values.push(`${teamName}`);
    if (playerName) values.push(`%${playerName}%`); // 使用 % 來進行部分匹配
    values.push(numPerPage);
    values.push((page - 1) * numPerPage);

    // console.log(sql);
    // console.log(values);

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("資料讀取失敗:", err);
      } else {
        console.log("成功讀取資料: ", result);
        res.json(result);
      }
    });
  });

  router.get("/totalItems", (req, res) => {
    const teamName = req.query.teamname || ""; // 隊伍名稱的 query 參數，預設為空
    const playerName = req.query.playername || ""; // 球員名字的 query 參數，預設為空

    let sql = "SELECT COUNT(*) AS TotalItems FROM players WHERE 1=1"; // 初始 SQL 語句，1=1 是為了方便添加條件

    // 若有隊伍名稱，添加隊伍篩選條件
    if (teamName && teamName != "ALL") {
      sql += " AND team_name = ?";
    }

    // 若有球員名字，添加球員名字的部分搜尋條件
    if (playerName) {
      sql += " AND name LIKE ?";
    }

    // 準備 SQL 查詢的參數值
    const values = [];
    if (teamName) values.push(`${teamName}`);
    if (playerName) values.push(`%${playerName}%`); // 使用 % 來進行部分匹配

    // console.log(sql);
    // console.log(values);

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("資料讀取失敗:", err);
      } else {
        console.log("成功讀取資料: ", result);
        res.json(result);
      }
    });
  });

  // router.get("/:id", (req, res) => {
  //   let { id } = req.params;
  //   let sql = `SELECT * FROM players WHERE id=${id}`;

  //   connection.query(sql, (err, result) => {
  //     if (err) {
  //       console.error("資料讀取失敗:", err);
  //     } else {
  //       console.log("成功讀取資料: ", result);
  //       res.json(result);
  //     }
  //   });
  // });

  router.get("/team15", (req, res) => {
    let sql =
      "SELECT team_name, COUNT(*) AS player_count FROM players GROUP BY team_name HAVING COUNT(*) <= 15;";

    connection.query(sql, (err, result) => {
      if (err) {
        console.error("資料讀取失敗:", err);
      } else {
        console.log("成功讀取資料: ", result);
        res.json(result);
      }
    });
  });

  return router;
}
