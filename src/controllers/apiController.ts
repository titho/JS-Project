import { Router, Request, Response, request, response } from "express";
require("dotenv").config();
import { IUser } from "../models/user";
//import { IRoom } from "../models/room";

import SpotifyManager from "../services/spotifyManager";
const SpotifyApi = new SpotifyManager();
const sql = require("mssql/msnodesqlv8");

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
    res.redirect(
      `http://localhost:3000/saveSpotifyUser?email=${result.email}&id=${result.id}`
    );
  } catch (err) {
    res.send(err);
  }
});

router.post("/createRoom", async function(request: Request, response: Response) {
  let currentUser = await SpotifyApi.GetMe();
  console.log("Creating room.....");

  const data = {
    Name: request.body.Name,
    OwnerID: currentUser.id,
    IsPlaying: false
  };

  console.log(data);

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

    const query = `INSERT INTO dbo.[Room] (ID, Name, OwnerID, IsPlaying)
                  VALUES(NEWID(), '${data.Name}', '${data.OwnerID}', '${data.IsPlaying}')`;

    const result = await req.query(query);
    console.log("Room created");
    console.dir(result);
    response.redirect("http://localhost:3000/api/topTracks");
  } catch (error) {
    response.send(error);
  }
});

router.get("/topTracks", async function(req: Request, res: Response) {
  console.log("Getting top tracks.................");
  try {
    let topTracks = await SpotifyApi.getCurrentUsersTopTracks();
    let tracks: any = [];

    topTracks.body.items.forEach((track: any) =>
      tracks.push({
        id: track.id,
        artist: track.artists[0].name,
        name: track.name
      })
    );

    res.send(tracks);
  } catch (error) {
    console.log(error);
    res.send(error);
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
