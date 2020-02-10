import bodyParser from "body-parser";
import { UserController } from "./controllers/userController";
import express, { Request, Response, response } from "express";
import { request } from "http";
import { threadId } from "worker_threads";
import { verify } from "crypto";
require("dotenv").config();

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

const sql = require("mssql/msnodesqlv8");

// const router = express.Router();

const SpotifyWebApi = require("spotify-web-api-node");

// Replace with your redirect URI, required scopes, and show_dialog preference
// var redirectUri = `http://localhost:3000/`;
// var scopes = ['user-top-read', 'streaming'];
// var showDialog = true;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

//app.use("/", UserController);
//let SpotifyApi = require('spotify-web-api-node');
let redirectUri = `http://localhost:${process.env.PORT}/`;

const SpotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
});

let scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private"
];

app.post("/register", async (request: Request, response: Response) => {
  console.log("Entering register");
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

  const req = new sql.Request(pool);
  const passwordHash = require("password-hash");
  const hashedPassword = passwordHash.generate(userData.Password);
  const query = `INSERT INTO dbo.[User] (ID, Email, Username, Password, RepeatedPassword)
                  VALUES(NEWID(), '${userData.Email}', '${userData.Username}', '${hashedPassword}', '${hashedPassword}')`;

  const result = await req.query(query);

  console.dir(result);
});

app.get("/login", async (request: Request, response: Response) => {
  let userData = {
    Username: request.body.Username,
    Password: request.body.Password
  };

  const pool = new sql.ConnectionPool({
    server: "LAPTOP-6IFUU7D3",
    database: "SpotifyProject",
    options: {
      trustedConnection: true
    }
  });

  await pool.connect();

  const req = new sql.Request(pool);

  const query = `SELECT Password FROM [User] 
                    WHERE ID IN 
                    (SELECT ID FROM [User] 
                        WHERE Username = '${userData.Username}')`;

  const result = await req.query(query);
  const passwordHash = require("password-hash");

  if (passwordHash.verify(userData.Password, result.recordset[0].Password)) {
    response.send("User successfully loged in");
  } else {
    response.send("Log in failed!");
  }
});

app.get("/logout", function(req, res) {
  res.status(401).send("You are now logged out.");
});

app.get("/loginToSpotify", (req: Request, res: Response) => {
  let html = SpotifyApi.createAuthorizeURL(scopes);
  console.log(html);
  res.send(html + "&show_dialog=true");
});

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});