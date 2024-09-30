// test/teamRoutes.test.js
import chai from "chai";
import chaiHttp from "chai-http";
import { app } from "../app.js"; // 你的Express app
import { connection } from "../app.js";
import { expect } from "chai";

chai.use(chaiHttp);

describe("Team Routes", () => {
  const numPerPage = 15; // 預設每頁顯示的球員數

  // 測試沒有隊伍名稱和球員名稱的請求
  it("should return players for the first page when no team or player name is provided", (done) => {
    chai
      .request(app)
      .get("/playerdata")
      .query({ page: 1 }) // 傳遞頁數
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.at.most(numPerPage);
        done();
      });
  });

  // 測試帶有隊伍名稱的請求
  it("should return players for a specific team and page", (done) => {
    chai
      .request(app)
      .get("/playerdata")
      .query({ teamname: "Los Angeles Lakers", page: 1 }) // 替換成你資料庫中的有效隊伍名稱
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.at.most(numPerPage);

        // 驗證每個球員的隊伍名稱是否符合查詢
        res.body.forEach((player) => {
          expect(player.team_name).to.equal("Los Angeles Lakers");
        });
        done();
      });
  });

  // 測試帶有球員名字的請求
  it("should return players with names partially matching a query", (done) => {
    chai
      .request(app)
      .get("/playerdata")
      .query({ playername: "James", page: 1 }) // 替換成資料庫中包含這個部分名字的球員
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.at.most(numPerPage);

        // 驗證每個球員名字部分匹配
        res.body.forEach((player) => {
          expect(player.name).to.include("James");
        });
        done();
      });
  });

  // 測試帶有隊伍名稱和球員名字的請求
  it("should return players for a specific team and partial player name", (done) => {
    chai
      .request(app)
      .get("/playerdata")
      .query({ teamname: "Los Angeles Lakers", playername: "LeBron", page: 1 }) // 替換成有效的隊伍和球員名字
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.at.most(numPerPage);

        // 驗證隊伍名稱和部分匹配的球員名字
        res.body.forEach((player) => {
          expect(player.team_name).to.equal("Los Angeles Lakers");
          expect(player.name).to.include("LeBron");
        });
        done();
      });
  });
  // 測試不帶隊伍名稱和球員名稱的請求
  it("should return total items for all teams and players", (done) => {
    chai
      .request(app)
      .get("/playerdata/totalItems")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.property("TotalItems");
        done();
      });
  });

  // 測試帶隊伍名稱的請求
  it("should return total items for a specific team", (done) => {
    chai
      .request(app)
      .get("/playerdata/totalItems")
      .query({ teamname: "Los Angeles Lakers" }) // 替換成你資料庫中的有效隊伍名稱
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.property("TotalItems");
        done();
      });
  });

  // 測試帶球員名字的請求
  it("should return total items for players matching a partial name", (done) => {
    chai
      .request(app)
      .get("/playerdata/totalItems")
      .query({ playername: "James" }) // 替換成資料庫中包含這個部分名字的球員
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.property("TotalItems");
        done();
      });
  });

  // 測試帶合法隊伍名稱和合法球員名字的請求，但組合不存在
  it("should return total items for a specific team and partial player name", (done) => {
    chai
      .request(app)
      .get("/playerdata/totalItems")
      .query({ teamname: "Los Angeles Lakers", playername: "LeBron" }) // 替換成你資料庫中有效的隊伍和球員名字
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.property("TotalItems");
        expect(res.body[0].TotalItems).to.equal(0);
        done();
      });
  });

  // 測試帶合法隊伍名稱和合法球員名字的請求
  it("should return total items for a specific team and partial player name", (done) => {
    chai
      .request(app)
      .get("/playerdata/totalItems")
      .query({ teamname: "Cleveland Cavaliers", playername: "LeBron" }) // 替換成你資料庫中有效的隊伍和球員名字
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.property("TotalItems");
        expect(res.body[0].TotalItems).to.not.equal(0);
        done();
      });
  });

  // 測試取得隊員<=15人的隊伍人數
  it("should return teams with 15 or fewer players", (done) => {
    chai
      .request(app)
      .get("/playerdata/team15") // 測試該 API 路徑
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");

        // 確認返回的資料格式
        res.body.forEach((team) => {
          expect(team).to.have.property("team_name");
          expect(team).to.have.property("player_count");
          expect(team.player_count).to.be.at.most(15); // 確保球員數量小於或等於 15
        });
        done();
      });
  });

  // 測試結束後關閉資料庫連接
  after((done) => {
    connection.end((err) => {
      if (err) {
        console.error("Error closing the database connection:", err);
        done(err);
      } else {
        console.log("Database connection closed");
        done();
      }
    });
  });
});
