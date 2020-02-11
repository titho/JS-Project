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

app.post("/saveSpotifyUser", async (request: Request, response: Response) => {
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

    response.send("Successfully loged in.");
  } catch (error) {
    response.send(error);
  }
});

// app.get("/loginSite", async (request: Request, response: Response) => {
//   let userData = {
//     Username: request.body.Username,
//     Password: request.body.Password
//   };

//   const pool = new sql.ConnectionPool({
//     server: "LAPTOP-6IFUU7D3",
//     database: "SpotifyProject",
//     options: {
//       trustedConnection: true
//     }
//   });

//   await pool.connect();

//   const req = new sql.Request(pool);

//   const query = `SELECT Password FROM [User]
//                     WHERE ID IN
//                     (SELECT ID FROM [User]
//                         WHERE Username = '${userData.Username}')`;

//   const result = await req.query(query);
//   const passwordHash = require("password-hash");

//   if (passwordHash.verify(userData.Password, result.recordset[0].Password)) {
//     response.send("User successfully loged in");
//   } else {
//     response.send("Log in failed!");
//   }
// });

app.get("/logout", function(req, res) {
  res.status(401).send("You are now logged out.");
});

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
