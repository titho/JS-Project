require("dotenv").config();

const SpotifyWebApi = require("spotify-web-api-node");

class SpotifyManager {
  private _spotifyApi: any;
  private _currentUser: string;

  constructor() {
    this._spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.CALLBACK_URI
    });
    this._currentUser = "";
  }

  public async login() {
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

    var authenticationUrl = await this._spotifyApi.createAuthorizeURL(scopes);
    return authenticationUrl;
  }

  public async callback(code: string) {
    try {
      var tokens = await this._spotifyApi.authorizationCodeGrant(code).then(
        function(data: any) {
          console.log("The token expires in " + data.body["expires_in"]);
          console.log("The access token is " + data.body["access_token"]);
          console.log("The refresh token is " + data.body["refresh_token"]);

          // Set the access token on the API object to use it in later calls

          return {
            access_token: data.body["access_token"],
            refresh_token: data.body["refresh_token"]
          };
        },
        function(err: Error) {
          console.log("Something went wrong!", err);
        }
      );

      this._spotifyApi.setAccessToken(tokens.access_token);
      this._spotifyApi.setRefreshToken(tokens.refresh_token);

      return Promise.resolve();
    } catch (err) {
      console.log("error: " + err);
      throw err;
    }
  }
  //   router.get("/callback", async (req: Request, res: Response) => {
  //     console.log("-- callback endpoint called");
  //     var authorizationCode = req.query.code;

  //     console.log("req: " + req.query);
  //     console.log("using code: ");
  //     console.log(authorizationCode);
  //     try {
  //       await _spotifyApi.authorizationCodeGrant(authorizationCode).then(
  //         function(data: any) {
  //           console.log("The token expires in " + data.body["expires_in"]);
  //           console.log("The access token is " + data.body["access_token"]);
  //           console.log("The refresh token is " + data.body["refresh_token"]);

  //           // Set the access token on the API object to use it in later calls
  //           _spotifyApi.setAccessToken(data.body["access_token"]);
  //           _spotifyApi.setRefreshToken(data.body["refresh_token"]);
  //         },
  //         function(err: Error) {
  //           console.log("Something went wrong!", err);
  //         }
  //       );

  //       res.redirect("http://localhost:3000/api/me");
  //     } catch (err) {
  //     }
  //   });

  public async getCurrentPlayback() {
    await this._spotifyApi.getMyCurrentPlaybackState().then(
      function(data: any) {
        const songProgress = data.body.progress_ms;
        const songName = data.body.name;
        console.log("\x1b[36m%s\x1b[0m", "Playback: ");
        console.log("Song: " + "\x1b[31m%s\x1b[0m", songName);
        console.log("Progress: " + "\x1b[31m%s\x1b[0m", songProgress);
        return {
            name: songName,
            progress: songProgress,
        };
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );
  }

  //   router.post("/createroom", async function(req: Request, res: Response) {
  //     await _spotifyApi.getMyCurrentPlaybackState().then(
  //       function(data: any) {
  //         const songProgress = data.body.progress_ms;
  //         const songName = data.body.name;
  //         console.log("\x1b[36m%s\x1b[0m", "Playback: ");
  //         console.log("Song: " + "\x1b[31m%s\x1b[0m", songName);
  //         console.log("Progress: " + "\x1b[31m%s\x1b[0m", songProgress);
  //         res.send(data.body);
  //       },
  //       function(err: Error) {
  //         console.log("Something went wrong!", err);
  //       }
  //     );
  //   });

  //   router.get("/pause", async function(req: Request, res: Response) {
  //     await _spotifyApi.pause().then(
  //       function(data: any) {
  //         console.log(data.body);
  //         res.send(data.body);
  //       },
  //       function(err: Error) {
  //         console.log("Something went wrong!", err);
  //       }
  //     );
  //   });

  //   router.get("/saved", async function(req: Request, res: Response) {
  //     await _spotifyApi
  //       .getMySavedTracks({
  //         limit: 50,
  //         offset: 1
  //       })
  //       .then(
  //         function(data: any) {
  //           console.log(data.body.items);
  //           const names: string[] = [];
  //           data.body.items.forEach((element: any) => {
  //             names.push(element.track.name);
  //           });
  //           res.send(names);
  //         },
  //         function(err: Error) {
  //           console.log("Something went wrong!", err);
  //         }
  //       );
  //   });

  public async GetMe() {
    var result = await this._spotifyApi.getMe().then(
      function(data: any) {
        console.log("Name: " + "\x1b[31m%s\x1b[0m", data.body.display_name);
        console.log("Email:" + "\x1b[31m%s\x1b[0m", data.body.email);
        console.log(
          "ImageURL: " + "\x1b[31m%s\x1b[0m",
          data.body.images[0].url
        );
        console.log("Id:" + "\x1b[31m%s\x1b[0m", data.body.id);
        console.log("AccountType: " + "\x1b[31m%s\x1b[0m", data.body.product);

        return {
          id: data.body.id,
          name: data.body.display_name,
          email: data.body.email,
          image_url: data.body.images[0].url
        };
      },
      function(err: any) {
        console.log("Something went wrong!", err);
      }
    );
    console.log(result);
    this._currentUser = result.id;

    return result;
  }

  public async SetCurrentUser() {}
}

export default SpotifyManager;
