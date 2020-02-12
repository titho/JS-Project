import bodyParser from "body-parser";
import express, { Request, Response, request } from "express";
import { ApiController } from "./controllers/apiController";
import path from "path";
import { Socket } from "socket.io";
require("dotenv").config();

const sql = require("mssql/msnodesqlv8");
const socketIO = require("socket.io");
const axios = require("axios");
const pug = require("pug");


const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.set("/views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

var server = app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});

const io = socketIO(server);

app.use(express.static("public"));

// make connection with user from server side
io.on("connection", function(socket: Socket) {
  console.log("New client connected");

  setInterval(async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/currently"); // Getting the data from DarkSky
      // console.log("Progress: ", res.data.songProgress);
      socket.broadcast.emit("playback", res.data.songProgress); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }, 1000);

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

app.use("/api", ApiController);
// app.use(
//   "/player",
//   function(req: Request, res: Response) {
//     var player = Player();
//     res.render("index", player);
//   },
//   function(req: Request, res: Response) {}
// );

// socket.on("connected", function(msg: string) {
//   io.emit(
//     "playback",
//     setInterval(
//       () => async (socket: Socket) => {
//         try {
//           const res = await axios.get("http://localhost:3000/api/currently"); // Getting the data from DarkSky
//           socket.emit("playback", res.data.songProgress); // Emitting a new message. It will be consumed by the client
//         } catch (error) {
//           console.error(`Error: ${error.code}`);
//         }
//       },
//       500
//     )
//   );
//   console.log(msg);
// });

// app.get("/player", async (request: Request, response: Response) => {
  
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
