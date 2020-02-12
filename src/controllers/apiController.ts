import { Router, Request, Response, request, response } from "express";
require("dotenv").config();
const axios = require("axios");
var http = require("http");

import { IUser } from "../models/user";
import { IRoom } from "../models/room";

import SpotifyManager from "../services/spotifyManager";
import { Socket } from "socket.io";
const SpotifyApi = new SpotifyManager();
const sql = require("mssql/msnodesqlv8");

const router: Router = Router();
const socketIO = require("socket.io");

require("dotenv").config();

router.get("/login", async (req: Request, res: Response) => {
  var authenticationUrl = await SpotifyApi.login();
  res.send(authenticationUrl + "&show_dialog=true");
});

router.get(
  "/callback",
  async (req: Request, res: Response) => {
    console.log("\x1b[33m", "Router" + "\x1b[37m", "callback endpoint called");
    var authorizationCode = req.query.code;

    await SpotifyApi.callback(authorizationCode);
    res.redirect(`http://localhost:3000/api/me`);
  },
  function(err: Error) {
    console.log("error: " + err);
  }
);

router.get("/me", async function(req: Request, res: Response) {
  try {
    let result = await SpotifyApi.GetMe();
    res.redirect(`http://localhost:3000/saveSpotifyUser?email=${result.email}&id=${result.id}`);

  } catch (err) {
    res.send(err);
  }
});

router.route("/pause").post(
  async function(req: Request, res: Response) {
    console.log("\x1b[35m", "Pause called");
    let result = await SpotifyApi.setPlayback("Pause");
    console.log(result);
    res.send(result);
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router.route("/next").post(
  async function(req: Request, res: Response) {
    try {
      let result = await SpotifyApi.nextSong();
      console.log(result);
      res.send(result);
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router.route("/prev").post(
  async function(req: Request, res: Response) {
    try {
      let result = await SpotifyApi.prevSong();
      console.log(result);
      res.send(result);
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router.route("/play").post(
  async function(req: Request, res: Response) {
    try {
      if (req.query.uri && req.query.ms) {
        const uri = req.query.uri;
        const ms = req.query.ms;
        console.log("\x1b[35m", "Seek called");
        let result = await SpotifyApi.setPlayback("Seek", ms, uri);
        // console.log(result);
        res.send(result);
      } else {
        console.log("\x1b[35m", "Play called");
        let result = await SpotifyApi.setPlayback("Play");
        // console.log(result);
        res.send(result);
      }
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router.route("/currently").get(
  async function(req: Request, res: Response) {
    try {
      let result = await SpotifyApi.getCurrentPlayback();
      // let progress = msToHMS(result.songProgress);
      if (!result.song_id) {
        res.send("Nothing playing currently");
      }
      res.send({
        song_id: result.song_id,
        uri: result.uri,
        songProgress: result.songProgress,
        image_url: result.image_url
      });
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

// export async function Player() {
//   try {
//     let result = await SpotifyApi.getCurrentPlayback();
//     let progress = msToHMS(result.songProgress);

//     let songinfo = await SpotifyApi.getSong(result.song_id).then(
//       (data: any) => {
//         return {
//           name: data.name,
//           artist: data.artists[0].name,
//           image: data.image_url
//         };
//       }
//     );
//     return({
//       artist: songinfo.artist,
//       songName: songinfo.name,
//       time_ms: progress
//     });
//   } catch (err) {
//     console.log("Something went wrong!", err);
//   }
// }
router.route("/player").get(
  async function(req: Request, res: Response) {
    try {
      let result = await SpotifyApi.getCurrentPlayback();
      let progress = msToHMS(result.songProgress);

      let songinfo = await SpotifyApi.getSong(result.song_id).then(
        (data: any) => {
          return {
            name: data.name,
            artist: data.artists[0].name,
            image: data.image_url
          };
        }
      );
      res.render("index", {
        artist: songinfo.artist,
        songName: songinfo.name,
        time_ms: progress
      });
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router
  .route("/player-refresh")
  .get(async function(req: Request, res: Response) {
    try {
      res.render("index", {
        time_ms: req.query.progress
      });
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  });

function msToHMS(millis: number) {
  var minutes = Math.floor(millis / 60000);
  var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export const ApiController: Router = router;

// router.get("/saved", async function(req: Request, res: Response) {
//   await _spotifyApi
//     .getMySavedTracks({
//       limit: 50,
//       offset: 1
//     })
//     .then(
//       function(data: any) {
//         console.log(data.body.items);
//         const names: string[] = [];
//         data.body.items.forEach((element: any) => {
//           names.push(element.track.name);
//         });
//         res.send(names);
//       },
//       function(err: Error) {
//         console.log("Something went wrong!", err);
//       }
//     );
// });
