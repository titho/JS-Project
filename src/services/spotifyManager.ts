require("dotenv").config();

const SpotifyWebApi = require("spotify-web-api-node");

class SpotifyManager {
  private _spotifyApi: any;

  constructor() {
    this._spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.CALLBACK_URI
    });
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
          console.log("The access token is " + data.body["access_token"]);
          console.log("The refresh token is " + data.body["refresh_token"]);

          return {
            access_token: data.body["access_token"],
            refresh_token: data.body["refresh_token"]
          };
        },
        function(err: Error) {
          console.log("Something went wrong with token authorization!");
          console.log(err);
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
  public async setPlayback(action: string, ms?: number, uri?: string) {
    try {
      switch (action) {
        case "Play":
          return await this._spotifyApi.play().then(
            function(data: any) {
            //   console.log(data);
              return Promise.resolve(data);
            },
            function(err: any) {
              // Throws if its currently playing something
              console.log("\x1b[39m", err);
            }
          );
        case "Pause":
          console.log("\x1b[33m", "Pausing");
          return await this._spotifyApi.pause().then(function(data: any) {
            // console.log(data);
            return Promise.resolve(data);
          });
        case "Seek":
          //   console.log("Changing song to " + "\x1b[33m", uri + " at " + ms);
          return await this._spotifyApi
            .play({
              uris: [uri],
              position_ms: ms
            })
            .then(function(data: any) {
              console.log("\x1b[38m", "Success: " + data);
              return Promise.resolve(data);
            });
      }
    } catch (err) {
      console.log(err);
      return Promise.resolve();
    }
  }

  private isEmptyObject(obj: any) {
    return !Object.keys(obj).length;
  }



  public async getCurrentPlayback() {
    let that = this;
    return await this._spotifyApi.getMyCurrentPlaybackState().then(
      function(data: any) {
        if(!Object.keys(data.body).length){
            return "";
        }
        return {
          song_id: data.body.item.id,
          uri: data.body.item.uri,
          songProgress: data.body.progress_ms,
          image_url: data.body.item.album.images[0].url
        };
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );
  }

  public async getSong(song_id: number) {
    return await this._spotifyApi.getTrack(song_id).then(
      function(data: any) {
        // console.log(data.body);

        return data.body;
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );
  }

  public async nextSong() {
    return await this._spotifyApi.skipToNext().then(
      function(data: any) {
        console.log("Playing next...");
        // console.log(data.body);

        return data.body;
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );
  }

  public async prevSong() {
    return await this._spotifyApi.skipToPrevious().then(
      function(data: any) {
        console.log("Playing previous...");
        // console.log(data.body);

        return data.body;
      },
      function(err: Error) {
        console.log("Something went wrong!", err);
      }
    );
  }

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
        // console.log("Name: " + "\x1b[31m%s\x1b[0m", data.body.display_name);
        // console.log("Email:" + "\x1b[31m%s\x1b[0m", data.body.email);
        // console.log(
        //   "ImageURL: " + "\x1b[31m%s\x1b[0m",
        //   data.body.images[0].url
        // );
        // console.log("Id:" + "\x1b[31m%s\x1b[0m", data.body.id);
        // console.log("AccountType: " + "\x1b[31m%s\x1b[0m", data.body.product);

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

    return result;
  }

  public async SetCurrentUser() {}
}

export default SpotifyManager;
