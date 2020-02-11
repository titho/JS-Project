import { Router, Request, Response, request, response } from "express";
require("dotenv").config();

const SpotifyWebApi = require("spotify-web-api-node");
const sql = require("mssql/msnodesqlv8");
const router: Router = Router();

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

const SpotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URI
});

router.get("/login", async (req: Request, res: Response) => {
  var authenticationUrl = await SpotifyApi.createAuthorizeURL(scopes);
  console.log("-- login endpoint called");
  console.log(authenticationUrl);
  res.send(authenticationUrl + "&show_dialog=true");
});

router.get("/callback", async (req: Request, res: Response) => {
  console.log("-- callback endpoint called");
  var authorizationCode = req.query.code;

  console.log("req: " + req.query);
  console.log("using code: ");
  console.log(authorizationCode);
  try {
    await SpotifyApi.authorizationCodeGrant(authorizationCode).then(
      function(data: any) {
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        SpotifyApi.setAccessToken(data.body["access_token"]);
        SpotifyApi.setRefreshToken(data.body["refresh_token"]);
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );

    res.redirect("http://localhost:3000/api/me");
  } catch (err) {
    console.log("error: " + err);
    // res.redirect()
    // res.redirect('/invalid token');
  }
});

router.get("/current", async function(req: Request, res: Response) {
  await SpotifyApi.getMyCurrentPlaybackState().then(
    function(data: any) {
      const songProgress = data.body.progress_ms;
      const songName = data.body.name;
      console.log("\x1b[36m%s\x1b[0m", "Playback: ");
      console.log("Song: " + "\x1b[31m%s\x1b[0m", songName);
      console.log("Progress: " + "\x1b[31m%s\x1b[0m", songProgress);
      res.send(data.body);
    },
    function(err: Error) {
      console.log("Something went wrong!", err);
    }
  );
});

router.get("/pause", async function(req: Request, res: Response) {
  await SpotifyApi.pause().then(
    function(data: any) {
      console.log(data.body);
      res.send(data.body);
    },
    function(err: Error) {
      console.log("Something went wrong!", err);
    }
  );
});

router.get("/saved", async function(req: Request, res: Response) {
  await SpotifyApi.getMySavedTracks({
    limit: 50,
    offset: 1
  }).then(
    function(data: any) {
      console.log(data.body.items);
      const names: string[] = [];
      data.body.items.forEach((element: any) => {
        names.push(element.track.name);
      });
      res.send(names);
    },
    function(err: Error) {
      console.log("Something went wrong!", err);
    }
  );
});

router.get("/me", async function(req: Request, res: Response) {
  await SpotifyApi.getMe().then(
    function(data: any) {
      //   console.log("Name: " + data.body["display_name"]);
      //   console.log("Email:" + data.body.email);
      //   console.log("ImageURL: " + data.body.images[0].url);
      //   console.log("AccountType: " + data.body.product);
      //res.send(data.body);
      res.redirect(
        `http://localhost:3000/saveSpotifyUser?id=${data.body.id}&email=${data.body.email}`
      );
    },
    function(err: any) {
      console.log("Something went wrong!", err);
    }
  );
});

export const ApiController: Router = router;
