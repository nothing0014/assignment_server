const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2");
const fs = require("fs");

//匯出sql檔案用的
const mysqlDump = require("mysqldump");

//設定連到 nba database的資料
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
});

//讀取players,json
const playersData = JSON.parse(fs.readFileSync("players.json", "utf8"));

//此 function 將每一筆資料存進 players TABLE
const importData = () => {
  const sql = `INSERT INTO players
        (name, team_acronym, team_name, games_played, minutes_per_game,
        field_goals_attempted_per_game, field_goals_made_per_game, field_goal_percentage,
        free_throw_percentage, three_point_attempted_per_game, three_point_made_per_game,
        three_point_percentage, points_per_game, offensive_rebounds_per_game,
        defensive_rebounds_per_game, rebounds_per_game, assists_per_game, steals_per_game,
        blocks_per_game, turnovers_per_game, player_efficiency_rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  playersData.forEach((player) => {
    const values = [
      player.name,
      player.team_acronym,
      player.team_name,
      player.games_played,
      player.minutes_per_game,
      player.field_goals_attempted_per_game,
      player.field_goals_made_per_game,
      player.field_goal_percentage,
      player.free_throw_percentage,
      player.three_point_attempted_per_game,
      player.three_point_made_per_game,
      player.three_point_percentage,
      player.points_per_game,
      player.offensive_rebounds_per_game,
      player.defensive_rebounds_per_game,
      player.rebounds_per_game,
      player.assists_per_game,
      player.steals_per_game,
      player.blocks_per_game,
      player.turnovers_per_game,
      player.player_efficiency_rating,
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("資料匯入失敗:", err);
      } else {
        console.log("成功匯入資料: ", player.name);
      }
    });
  });
};

//連結到資料庫
connection.connect((err) => {
  if (err) {
    console.error("無法連接到資料庫:", err);
    return;
  }
  console.log("成功連接到資料庫");

  //執行匯入資料
  importData();

  //關閉連結時將TABLE匯出成 nba.sql
  connection.end(() => {
    console.log("資料插入完成，開始匯出資料庫");
    mysqlDump({
      connection: {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
      },
      dumpToFile: "./nba.sql",
    });
  });
});
