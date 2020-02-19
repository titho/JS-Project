import bodyParser from "body-parser";
import express, { Response, Request } from "express";
import path from "path";
import { Socket } from "socket.io";

import { msToHMS } from "./controllers/userController";
import { render } from "pug";

require("dotenv").config();

const room_router = require("./routes/room");
const user_router = require("./routes/user");

const socketIO = require("socket.io");
const axios = require("axios");

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.set("/views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static("public"));

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

app.use("/rooms", room_router);
app.use("/user", user_router);
app.get("/", (req: Request, res: Response) => {
  res.render("home");
});
app.get("/allrooms", (req: Request, res: Response) => {
  console.log(req);
  console.log(res);
  res.render("rooms", {asd: "asd"});
});
const io = socketIO(server);

// TODO
//   Fix this... You cant have a socket in the server file
io.on("connection", function(socket: Socket) {
  console.log("New client connected");
  setInterval(async () => {
    try {
      const curr = await axios.get(`${process.env.HOST_URL}/user/currently`);

      const song = await axios.get(
        `${process.env.HOST_URL}/user/get-song?id=${curr.data.song_id}`
      );

      socket.broadcast.emit("playback", {
        progress: msToHMS(curr.data.songProgress),
        name: song.data.name,
        artist: song.data.artist
      });
    } catch (error) {
      if (error.statusCode === 401) {
        await setTimeout(() => console.log(), 8000);
      } else {
        console.error(`Error: ${error}`);
      }
    }
  }, 1000);

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

// app.post("/register", async (request: Request, response: Response) => {
//   let userData = {
//     Email: request.body.Email,
//     Username: request.body.Username,
//     Password: request.body.Password,
//     RepeatedPassword: request.body.RepeatedPassword
//   };

//   const pool = new sql.ConnectionPool({
//     server: "localhost\SQLEXPRESS",
//     database: "SpotifyProject",
//     options: {
//       trustedConnection: true
//     }
//   });

//   await pool.connect();

//   try {
//     const req = new sql.Request(pool);
//     const passwordHash = require("password-hash");
//     const hashedPassword = passwordHash.generate(userData.Password);
//     const query = `INSERT INTO dbo.[User] (ID, Email, Username, Password)
//                   VALUES(NEWID(), '${userData.Email}', '${userData.Username}', '${hashedPassword}')`;

//     const result = await req.query(query);

//     console.dir(result);
//     response.redirect("http://localhost:3000/api/login");
//   } catch (error) {
//     response.send(error);
//   }
// });

// app.get("/saveSpotifyUser", async (request: Request, response: Response) => {
//   const pool = new sql.ConnectionPool({
//     server: "localhost\SQLEXPRESS",
//     database: "SpotifyProject",
//     options: {
//       trustedConnection: true
//     }
//   });

//   await pool.connect();

//   const req = new sql.Request(pool);

//   try {
//     const query = `UPDATE [User]
//                 SET SpotifyAccountID = '${request.query.id}'
//                 WHERE Email = '${request.query.email}'`;

//     const result = await req.query(query);
//     console.dir(result);

//     response.redirect("http://localhost:3000/api/rooms");
//   } catch (error) {
//     response.send(error);
//   }
// });

// app.get("/logout", function(req, res) {
//   res.status(401).send("You are now logged out.");
// });
