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
    res.render(result);
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
      if (result == undefined) {
        res.send({
          song_id: "0h5m65o5KnMFB4Gq47mbKt",
          uri: "spotify:track:0h5m65o5KnMFB4Gq47mbKt",
          songProgress: 0,
          image_url: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
        });
      }
      res.send({
        song_id: result.song_id,
        uri: result.uri,
        songProgress: result.songProgress,
        image_url: result.image_url
      });
    } catch (err) {
      console.log("Something went wrong!", err);
      res.status(401).send();
    }
  },
  function(err: Error) {
    console.log("Something went wrong!", err);
  }
);

router.route("/getsong").get(
  async function(req: Request, res: Response) {
    let song_id = req.query.id;

    let result = await SpotifyApi.getSong(song_id).then((data: any) => {
      if (data != undefined) {
        return {
          name: data.name,
          artist: data.artists[0].name,
          image: data.album.images[0]
        };
      } else {
        return {
          name: "Candy Shop",
          artist: "50 Cent",
          image: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
        };
      }
    });
    res.send({
      name: result.name,
      artist: result.artist,
      image: result.image,
      id: song_id
    });
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
router.route("/browse").get(
  async function(req: Request, res: Response) {
    res.render("chooseRoom");
  }
)

router.get("/browse", async (request: Request, response: Response) => {
  
  let getsInfoFromEndpoint = [
    {
      id: "123-456",
      roomname: "Room_A",
      song: "50 Cent - P.I.M.P",
      owner: "vasko",
      image_url:
        "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
    },
    {
      id: "123-456",
      roomname: "Room_B",
      song: "50 Cent - P.I.M.P",
      owner: "vasko",
      image_url:
        "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
    },
    {
      id: "123-456",
      roomname: "Room_C",
      song: "50 Cent - P.I.M.P",
      owner: "vasko",
      image_url:
        "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
    }
  ];

  response.render("chooseroom", { rooms: getsInfoFromEndpoint });
});

router.route("/player").get(
  async function(req: Request, res: Response) {
    try {
      let result = await SpotifyApi.getCurrentPlayback();
      let progress = msToHMS(result.songProgress);

      let songinfo = await SpotifyApi.getSong(result.song_id).then(
        (data: any) => {
          if (data != undefined) {
            return {
              name: data.name,
              artist: data.artists[0].name,
              image: data.image_url
            };
          } else {
            return {
              name: "Candy Shop",
              artist: "50 Cent",
              image: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
            };
          }
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

export function msToHMS(millis: number) {
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
