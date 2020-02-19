import bodyParser from "body-parser";
import express, { Response, Request } from "express";
import path from "path";
import { Socket } from "socket.io";

const axios = require("axios");

import { msToHMS } from "./controllers/userController";
import { render } from "pug";

require("dotenv").config();

const room_router = require("./routes/room");
const user_router = require("./routes/user");

const socketIO = require("socket.io");

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

const io = socketIO(server);

app.use("/rooms", room_router);
app.use("/user", user_router);

app.get("/", (req: Request, res: Response) => {
  res.render("home");
});

app.get("/player", (req: Request, res: Response) => {
  res.render("player", {roomId: req.body.id});
});

app.get("/allrooms", (req: Request, res: Response) => {
  res.render("rooms", { asd: "asd" });
});


app.post("/pause", (req: Request, res: Response) => {
  try {
    console.log("\x1b[35m", "Pause called");

    io.on("connection", function(socket: Socket) {
      socket.broadcast.emit("pause");
    })
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
});

app.post("/play", (req: Request, res: Response) => {
  try {
    console.log("\x1b[35m", "Pause called");

    io.on("connection", function(socket: Socket) {
      socket.broadcast.emit("play");
    })
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
});

// app.post("/next", async function () {
//   try {
//     let result = await this._spotifyService.nextSong();
//     console.log(result);

//     return Promise.resolve(result);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// })

// app.post("prev", function() {
//   try {
//     return Promise.resolve();
//   } catch (error) {
//     return Promise.reject(error);
//   }
// })

app.post("/play/track", function(req: Request) {
  try {
    // console.log("\x1b[35m", "Play called");
    io.on("connection", function(socket: Socket) {
      socket.broadcast.emit("play", {
        progress: msToHMS(req.query.ms),
        id: req.query.id
      });
    })
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
})

// app.use("/playback", playback_controller);

io.on("connection", function(socket: Socket) {
  console.log("New client connected");
  setInterval(async () => {
    try {
      const curr = await axios.get(`${process.env.HOST_URL}/user/currently`);

      const song = await axios.get(
        `${process.env.HOST_URL}/user/get-song?id=${curr.data.song_id}`
      );
      if (!curr.data.is_playing) {
        socket.broadcast.emit("pause");
      }
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
// TODO
//   Fix this... You cant have a socket in the server file
