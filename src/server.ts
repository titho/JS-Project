import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { ApiController } from "./controllers/apiController";
require("dotenv").config();
const sql = require("mssql/msnodesqlv8");

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


app.use("/api", ApiController);

app.post("/register", async (request: Request, response: Response) => {
  let userData = {
    Email: request.body.Email,
    Username: request.body.Username,
    Password: request.body.Password,
    RepeatedPassword: request.body.RepeatedPassword
  };

  const pool = new sql.ConnectionPool({
    server: "LAPTOP-6IFUU7D3",
    database: "SpotifyProject",
    options: {
      trustedConnection: true
    }
  });

  await pool.connect();

  try {
    const req = new sql.Request(pool);
    const passwordHash = require("password-hash");
    const hashedPassword = passwordHash.generate(userData.Password);
    const query = `INSERT INTO dbo.[User] (ID, Email, Username, Password)
                  VALUES(NEWID(), '${userData.Email}', '${userData.Username}', '${hashedPassword}')`;

    const result = await req.query(query);

    console.dir(result);
    response.redirect("http://localhost:3000/api/login");
  } catch (error) {
    response.send(error);
  }
});

app.get("/saveSpotifyUser", async (request: Request, response: Response) => {
  const pool = new sql.ConnectionPool({
    server: "LAPTOP-6IFUU7D3",
    database: "SpotifyProject",
    options: {
      trustedConnection: true
    }
  });

  await pool.connect();

  const req = new sql.Request(pool);

  try {
    const query = `UPDATE [User]
                SET SpotifyAccountID = '${request.query.id}'
                WHERE Email = '${request.query.email}'`;

    const result = await req.query(query);
    console.dir(result);

    response.redirect("http://localhost:3000/api/rooms");
  } catch (error) {
    response.send(error);
  }
});

app.get("/logout", function(req, res) {
  res.status(401).send("You are now logged out.");
});

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
