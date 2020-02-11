import { Router, Request, Response, request } from "express";
require("dotenv").config();
import { IUser } from "../models/user";
import { IRoom } from "../models/room";

import SpotifyManager from "../services/spotifyManager";
const SpotifyApi = new SpotifyManager();

const router: Router = Router();

const SpotifyWebApi = require("spotify-web-api-node");
const _spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.CALLBACK_URI
  });


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
//   console.log("-- login endpoint called");
//   console.log(authenticationUrl);
//   res.send(authenticationUrl + "&show_dialog=true");
    var authenticationUrl = await SpotifyApi.login();
    res.send(authenticationUrl + "&show_dialog=true");
});

router.get("/callback", async (req: Request, res: Response) => {
    console.log("\x1b[33m", "Router" + "\x1b[37m", "callback endpoint called");
    var authorizationCode = req.query.code;
    
    await SpotifyApi.callback(authorizationCode);
    res.statusCode = 200;
    res.send();   
}, function(err: Error){
    console.log("error: " + err);
  });
//   console.log("req: " + req.query);
//   console.log("using code: ");
//   console.log(authorizationCode);
//   try {
//     await _spotifyApi.authorizationCodeGrant(authorizationCode).then(
//       function(data: any) {
//         console.log("The token expires in " + data.body["expires_in"]);
//         console.log("The access token is " + data.body["access_token"]);
//         console.log("The refresh token is " + data.body["refresh_token"]);

//         // Set the access token on the API object to use it in later calls
//         _spotifyApi.setAccessToken(data.body["access_token"]);
//         _spotifyApi.setRefreshToken(data.body["refresh_token"]);
//       },
//       function(err: Error) {
//         console.log("Something went wrong!", err);
//       }
//     );

//     res.redirect("http://localhost:3000/api/me");
//   } catch (err) {
//     console.log("error: " + err);
//   

router.get("/current", async function(req: Request, res: Response) {
    let playback = await SpotifyApi.getCurrentPlayback();
    res.send(playback);
    },
    function(err: Error) {
      console.log("Something went wrong!", err);
    }
  );

// router.post("/createroom", async function(req: Request, res: Response) {
//   await _spotifyApi.getMyCurrentPlaybackState().then(
//     function(data: any) {
//       const songProgress = data.body.progress_ms;
//       const songName = data.body.name;
//       console.log("\x1b[36m%s\x1b[0m", "Playback: ");
//       console.log("Song: " + "\x1b[31m%s\x1b[0m", songName);
//       console.log("Progress: " + "\x1b[31m%s\x1b[0m", songProgress);
//       res.send(data.body);
//     },
//     function(err: Error) {
//       console.log("Something went wrong!", err);
//     }
//   );
// });

// router.get("/pause", async function(req: Request, res: Response) {
//   await _spotifyApi.pause().then(
//     function(data: any) {
//       console.log(data.body);
//       res.send(data.body);
//     },
//     function(err: Error) {
//       console.log("Something went wrong!", err);
//     }
//   );
// });

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

router.get("/me", async function(req: Request, res: Response) {
  let result = await SpotifyApi.GetMe();
  res.send(result);
});

export const ApiController: Router = router;