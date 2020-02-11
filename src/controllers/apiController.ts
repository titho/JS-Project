import { Router, Request, Response, request } from "express";
require("dotenv").config();
import { IUser } from "../models/user";
import { IRoom } from "../models/room";

import SpotifyManager from "../services/spotifyManager";
const SpotifyApi = new SpotifyManager();

const router: Router = Router();

require("dotenv").config();

let scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-modify-playback-state",
  "user-read-playback-state"
];

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

router.route("/play").post(
  async function(req: Request, res: Response) {
    try {
      if (req.query.uri && req.query.ms) {
        const uri = req.query.uri;
        const ms = req.query.ms;
        console.log("\x1b[35m", "Seek called");
        let result = await SpotifyApi.setPlayback("Seek", ms, uri);
        console.log(result);
        res.send(result);
      } else {
        console.log("\x1b[35m", "Play called");
        let result = await SpotifyApi.setPlayback("Play");
        console.log(result);
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
