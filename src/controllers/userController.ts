import { Router, Request, Response, request, response } from "express";
import { Container } from "typedi";

import UserService from "../services/userService";

require("dotenv").config();

// Dependency injection for the user service
const _userService = Container.get(UserService);

export async function login(req: Request, res: Response) {
  const userData = {
    Username: req.body.Username,
    Password: req.body.Password
  };

  const authenticationUrl = await _userService.login(userData);

  res.send(authenticationUrl + "&show_dialog=true");
}

export async function callback(req: Request, res: Response) {
  try {
    console.log("\x1b[33m", "Router" + "\x1b[37m", "callback endpoint called");
    var authorizationCode = req.query.code;

    await _userService.callback(authorizationCode);
    res.redirect(`${process.env.HOST_URL}/user/me`);
  } catch (err) {
    throw err;
  }
}

export async function register(request: Request, response: Response) {
  try {
    let userData = {
      Email: request.body.Email,
      Username: request.body.Username,
      Password: request.body.Password,
      RepeatedPassword: request.body.RepeatedPassword
    };

    await _userService.register(userData);
    
    //response.redirect(`${process.env.HOST_URL}/user/login`);
  } catch (error) {
    response.send(error);
  }
}

export async function saveSpotifyUser(request: Request, response: Response) {
  try {
    let id = request.query.id;
    let email = request.query.email;

    await _userService.saveSpotifyUser(id, email);

    response.redirect(`${process.env.HOST_URL}/allrooms`);
  } catch (error) {
    response.send(error);
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    let result = await _userService.getMe();
    res.redirect(
      `${process.env.HOST_URL}/user/save-spotify-user?email=${result.email}&id=${result.id}`
    );
  } catch (err) {
    res.send(err);
  }
}

export async function pause(req: Request, res: Response) {
  let result = await _userService.pause();
  console.log(result);
  res.send(result);
}

export async function play_next(req: Request, res: Response) {
  try {
    let result = await _userService.playNext();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
}
export async function play_prev(req: Request, res: Response) {
  try {
    let result = await _userService.playPrev();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
}

export async function play(req: Request, res: Response) {
  try {
    // console.log("\x1b[35m", "Play called");
    let result = await _userService.play();

    res.send(result);
  } catch (err) {
    console.log("Cannot resume song!", err);
  }
}

export async function playTrack(req: Request, res: Response) {
  try {
    const uri = req.query.uri;
    const ms = req.query.ms;
    
    let result = await _userService.playTrack(ms, uri);
    res.send(result);
  } catch (err) {
    console.log("Cannot play song!", err);
  }
}

// Try to make it to check if user is active, if not, get last played song
export async function getCurrentlyPlaying(req: Request, res: Response) {
  try {
    let result = await _userService.getCurrentlyPlaying();
    
    res.send(result);
  } catch (err) {
    console.log("Something went wrong!", err);
    res.status(401).send();
  }
}

// export async function shuffle(request: Request, response: Response) {
//   try {
//     let result = await SpotifyApi.shuffle();
//     response.send("Playback on shuffle");
//   } catch (error) {
//     console.log("Something went wrong!", error);
//   }
// }

export async function getSong(req: Request, res: Response) {
  let song_id = req.query.id;
  let result = await _userService.getSong(song_id);

  res.send(result);
}

export async function getPlayer(req: Request, res: Response) {
  try {
    let result = await _userService.getPlayer();
    res.render("index", result);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
}

export function msToHMS(millis: number) {
  var minutes = Math.floor(millis / 60000);
  var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
// import { Router, Request, Response, request, response } from "express";
// import { Container } from 'typedi';
// import SpotifyService from "../services/spotifyManager";
// const { poolPromise } = require('../db/db')
// require("dotenv").config();
// const sql = require("mssql/msnodesqlv8");

// // const axios = require("axios");
// // var http = require("http");

// // import SpotifyService from "../services/spotifyManager";
// // const SpotifyApi = new SpotifyService();
// const SpotifyApi = Container.get(SpotifyService);

// // const dbconfig = {
// //   server: process.env.SQL_SERVER,
// //   database: process.env.SQL_DATABASE,
// //   options: {
// //     trustedConnection: true
// //   }
// // };

// // const pool = new sql.ConnectionPool(dbconfig);

// export async function login(req: Request, res: Response) {
//   var authenticationUrl = await SpotifyApi.login();
//   res.send(authenticationUrl + "&show_dialog=true");
// }

// export async function callback(req: Request, res: Response) {
//   try {
//     console.log("\x1b[33m", "Router" + "\x1b[37m", "callback endpoint called");
//     var authorizationCode = req.query.code;

//     await SpotifyApi.callback(authorizationCode);
//     res.redirect(`${process.env.HOST_URL}/rooms/browse`);
//   } catch (err) {
//     throw err;
//   }
// }

// export async function register(request: Request, response: Response) {
//   let userData = {
//     Email: request.body.Email,
//     Username: request.body.Username,
//     Password: request.body.Password,
//     RepeatedPassword: request.body.RepeatedPassword
//   };

//   const pool = await poolPromise;

//   // await pool.connect((err: Error) => {
//   //   console.log("Error connection to db...");
//   // });

//   try {
//     const req = new sql.Request(pool);
//     const passwordHash = require("password-hash");
//     const hashedPassword = passwordHash.generate(userData.Password);
//     const query = `INSERT INTO dbo.[User] (ID, Email, Username, Password)
//                   VALUES(NEWID(), '${userData.Email}', '${userData.Username}', '${hashedPassword}')`;

//     const result = await req.query(query);

//     console.dir(result);
//     response.redirect(`${process.env.HOST_URL}/user/login`);
//   } catch (error) {
//     response.send(error);
//   }
// }

// export async function save_spotify_user(request: Request, response: Response) {

//   const pool = await poolPromise;

//   // await pool.connect();

//   const req = new sql.Request(pool);

//   try {
//     const query = `UPDATE [User]
//                 SET SpotifyAccountID = '${request.query.id}'
//                 WHERE Email = '${request.query.email}'`;

//     const result = await req.query(query);
//     console.dir(result);

//     response.redirect(`${process.env.HOST_URL}/rooms`);
//   } catch (error) {
//     response.send(error);
//   }
// }

// export async function getMe(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.GetMe();
//     res.redirect(
//       `${process.env.HOST_URL}/user/save-spotify-user?email=${result.email}&id=${result.id}`
//     );
//   } catch (err) {
//     res.send(err);
//   }
// }

// export async function pause(req: Request, res: Response) {
//   console.log("\x1b[35m", "Pause called");
//   let result = await SpotifyApi.setPlayback("Pause");
//   console.log(result);
//   res.send(result);
// }

// export async function play_next(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.nextSong();
//     console.log(result);
//     res.send(result);
//   } catch (err) {
//     console.log("Something went wrong!", err);
//   }
// }
// export async function play_prev(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.prevSong();
//     console.log(result);
//     res.send(result);
//   } catch (err) {
//     console.log("Something went wrong!", err);
//   }
// }

// export async function play(req: Request, res: Response) {
//   try {
//     // console.log("\x1b[35m", "Play called");
//     let result = await SpotifyApi.setPlayback("Play");

//     res.send(result);
//   } catch (err) {
//     console.log("Cannot resume song!", err);
//   }
// }

// export async function play_track(req: Request, res: Response) {
//   try {
//     const uri = req.query.uri;
//     const ms = req.query.ms;
//     console.log("\x1b[35m", "Seek called");
//     let result = await SpotifyApi.setPlayback("Seek", ms, uri);
//     res.send(result);
//   } catch (err) {
//     console.log("Cannot play song!", err);
//   }
// }

// // Try to make it to check if user is active, if not, get last played song
// export async function get_currently_playing(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.getCurrentPlayback();
//     // let progress = msToHMS(result.songProgress);
//     if (result == undefined) {
//       res.send({
//         song_id: "0h5m65o5KnMFB4Gq47mbKt",
//         uri: "spotify:track:0h5m65o5KnMFB4Gq47mbKt",
//         songProgress: 0,
//         image_url: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
//       });
//     }
//     res.send({
//       song_id: result.song_id,
//       uri: result.uri,
//       songProgress: result.songProgress,
//       image_url: result.image_url
//     });
//   } catch (err) {
//     console.log("Something went wrong!", err);
//     res.status(401).send();
//   }
// }

// export async function shuffle(request: Request, response: Response) {
//   try {
//     let result = await SpotifyApi.shuffle();
//     response.send("Playback on shuffle");
//   } catch (error) {
//     console.log("Something went wrong!", error);
//   }
// }

// export async function get_song(req: Request, res: Response) {
//   let song_id = req.query.id;

//   return await SpotifyApi.getSong(song_id).then((data: any) => {
//     res.send({
//       name: data.name,
//       artist: data.artist,
//       image: data.image,
//       id: song_id
//     });
//   });
// }

// export async function getPlayer(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.getCurrentPlayback();
//     let progress = msToHMS(result.songProgress);

//     let songinfo = await SpotifyApi.getSong(result.song_id).then(
//       (data: any) => {
//         if (data != undefined) {
//           return {
//             name: data.name,
//             artist: data.artists[0].name,
//             image: data.image_url
//           };
//         } else {
//           return {
//             name: "Candy Shop",
//             artist: "50 Cent",
//             image: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
//           };
//         }
//       }
//     );
//     res.render("index", {
//       artist: songinfo.artist,
//       songName: songinfo.name,
//       time_ms: progress
//     });
//   } catch (err) {
//     console.log("Something went wrong!", err);
//   }
// }

// export function msToHMS(millis: number) {
//   var minutes = Math.floor(millis / 60000);
//   var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
//   return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
// }

// router.get("/me", async function(req: Request, res: Response) {
//   try {
//     let result = await SpotifyApi.GetMe();
//     res.redirect(
//       `http://localhost:3000/saveSpotifyUser?email=${result.email}&id=${result.id}`
//     );
//   } catch (err) {
//     res.send(err);
//   }
// });

// router.post("/createRoom", async function(
//   request: Request,
//   response: Response
// ) {
//   let currentUser = await SpotifyApi.GetMe();
//   console.log("Creating room.....");

//   const data = {
//     Name: request.body.Name,
//     OwnerID: currentUser.id,
//     IsPlaying: false
//   };

//   let topTracks = await SpotifyApi.getCurrentUsersTopTracks();
//   let tracks: any = [];

//   topTracks.body.items.forEach((track: any) =>
//     tracks.push({
//       id: track.id,
//       artist: track.artists[0].name,
//       name: track.name
//     })
//   );

//   console.log(data);

//   const pool = new sql.ConnectionPool({
//     server: "localhost\\SQLEXPRESS",
//     database: "SpotifyProject",
//     options: {
//       trustedConnection: true
//     }
//   });

//   await pool.connect();

//   try {
//     const req = new sql.Request(pool);

//     const query = `INSERT INTO dbo.[Room] (ID, Name, OwnerID, IsPlaying)
//                   VALUES(NEWID(), '${data.Name}', '${data.OwnerID}', '${data.IsPlaying}')`;
//     const result = await req.query(query);

//     const roomIdQuery = `SELECT ID FROM dbo.[Room] WHERE Name = '${data.Name}' AND OwnerID = '${data.OwnerID}'`;
//     const idResult = await req.query(roomIdQuery);

//     console.log(idResult.recordset[0].ID);

//     console.log("Room created");

//     tracks.forEach(async (track: any) => {
//       const saveSongsQuery = `INSERT INTO dbo.Song(ID, Name, Artists, FK_Ref_Room)
//                               VALUES('${track.id}', '${track.name.replace(
//         "'",
//         ""
//       )}', '${track.artist.replace("'", "")}', '${idResult.recordset[0].ID}')`;

//       const result = await req.query(saveSongsQuery);
//     });

//     response.redirect(
//       `http://localhost:3000/api/roomTracks?id=${idResult.recordset[0].ID}`
//     );
//   } catch (error) {
//     response.send(error);
//   }
// });

// router.get("/rooms", async function(request: Request, response: Response) {
//   let currentUser = await SpotifyApi.GetMe();

//   // const pool = new sql.ConnectionPool({
//   //   server: "localhost\\SQLEXPRESS",
//   //   database: "SpotifyProject",
//   //   options: {
//   //     trustedConnection: true
//   //   }
//   // });

//   await pool.connect();
//   try {
//     const req = new sql.Request(pool);

//     const query = `SELECT Room.ID, [Name], Username, LastPlayed, PlaybackMS, IsPlaying
//                     FROM Room JOIN [User]
//                     ON [OwnerID] = [User].SpotifyAccountID`;

//     const result = await req.query(query);
//     let rooms: any = [];

//     result.recordset.forEach((room: any) => rooms.push(room));

//     console.dir(rooms);
//     response.send(rooms);
//   } catch (error) {
//     response.send(error);
//   }
// });

// router.get("/enterRoom", async function(request: Request, response: Response) {
//   let currentUser = await SpotifyApi.GetMe();
//   console.log("Entering room.....");

//   let topTracks = await SpotifyApi.getCurrentUsersTopTracks();
//   let tracks: any = [];

//   topTracks.body.items.forEach((track: any) =>
//     tracks.push({
//       id: track.id,
//       artist: track.artists[0].name,
//       name: track.name
//     })
//   );

//   // const pool = new sql.ConnectionPool({
//   //   server: "localhost\\SQLEXPRESS",
//   //   database: "SpotifyProject",
//   //   options: {
//   //     trustedConnection: true
//   //   }
//   // });

//   await pool.connect();
//   try {
//     const req = new sql.Request(pool);

//     const query = `INSERT INTO User_Room(ID, Ref_User_ID, Ref_Room_ID)
//                     VALUES(NEWID(), ${currentUser.id}, '${request.query.id}')`;

//     const result = await req.query(query);
//     console.log("Entered room successfully.");

//     tracks.forEach(async (track: any) => {
//       const saveSongsQuery = `INSERT INTO dbo.Song(ID, Name, Artists, FK_Ref_Room)
//                               VALUES('${track.id}', '${track.name.replace(
//         "'",
//         ""
//       )}', '${track.artist.replace("'", "")}', '${request.query.id}')`;
//       const result = await req.query(saveSongsQuery);
//     });

//     console.dir(result);
//     response.redirect(
//       `http://localhost:3000/api/roomTracks?id=${request.query.id}`
//     );
//   } catch (error) {
//     console.log(error);
//     response.send("You are already in this room!");
//   }
// });

// router.get("/leaveRoom", async function(request: Request, response: Response) {
//   let currentUser = await SpotifyApi.GetMe();
//   console.log("Leaving room.....");

//   // const pool = new sql.ConnectionPool({
//   //   server: "localhost\\SQLEXPRESS",
//   //   database: "SpotifyProject",
//   //   options: {
//   //     trustedConnection: true
//   //   }
//   // });

//   await pool.connect();
//   try {
//     const req = new sql.Request(pool);

//     const query = `DELETE FROM [User_Room]
//                     WHERE Ref_User_ID = '${currentUser.id}' AND Ref_Room_ID = '${request.query.id}'`;

//     const result = await req.query(query);
//     console.log("Left room successfully.");
//     console.dir(result);
//     response.redirect("http://localhost:3000/api/rooms");
//   } catch (error) {
//     response.send(error);
//   }
// });

// router.get("/roomTracks", async function(request: Request, response: Response) {
//   console.log("Getting room tracks.................");
//   try {
//     // const pool = new sql.ConnectionPool({
//     //   server: "localhost\\SQLEXPRESS",
//     //   database: "SpotifyProject",
//     //   options: {
//     //     trustedConnection: true
//     //   }
//     // });

//     await pool.connect();
//     const req = new sql.Request(pool);
//     console.log("connected....");

//     const roomTracks = `SELECT [Name], Artists FROM dbo.[Song]
//                         WHERE FK_Ref_Room = '${request.query.id}'`;

//     const result = await req.query(roomTracks);
//     response.send(result.recordset);
//   } catch (error) {
//     console.log(error);
//     response.send(error);
//   }
// });

// router.route("/next").post(
//   async function(req: Request, res: Response) {
//     try {
//       let result = await SpotifyApi.nextSong();
//       console.log(result);
//       res.send(result);
//     } catch (err) {
//       console.log("Something went wrong!", err);
//     }
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

// router.route("/prev").post(
//   async function(req: Request, res: Response) {
//     try {
//       let result = await SpotifyApi.prevSong();
//       console.log(result);
//       res.send(result);
//     } catch (err) {
//       console.log("Something went wrong!", err);
//     }
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

// router.route("/play").post(
//   async function(req: Request, res: Response) {
//     try {
//       if (req.query.uri && req.query.ms) {
//         const uri = req.query.uri;
//         const ms = req.query.ms;
//         console.log("\x1b[35m", "Seek called");
//         let result = await SpotifyApi.setPlayback("Seek", ms, uri);
//         // console.log(result);
//         res.send(result);
//       } else {
//         console.log("\x1b[35m", "Play called");
//         let result = await SpotifyApi.setPlayback("Play");
//         // console.log(result);
//         res.send(result);
//       }
//     } catch (err) {
//       console.log("Something went wrong!", err);
//     }
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

// router.route("/currently").get(
//   async function(req: Request, res: Response) {
//     try {
//       let result = await SpotifyApi.getCurrentPlayback();
//       // let progress = msToHMS(result.songProgress);
//       if (result == undefined) {
//         res.send({
//           song_id: "0h5m65o5KnMFB4Gq47mbKt",
//           uri: "spotify:track:0h5m65o5KnMFB4Gq47mbKt",
//           songProgress: 0,
//           image_url: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
//         });
//       }
//       res.send({
//         song_id: result.song_id,
//         uri: result.uri,
//         songProgress: result.songProgress,
//         image_url: result.image_url
//       });
//     } catch (err) {
//       console.log("Something went wrong!", err);
//       res.status(401).send();
//     }
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

// router
//   .route("/shuffle")
//   .put(async function(request: Request, response: Response) {
//     try {
//       let result = await SpotifyApi.shuffle();
//       response.send("Playback on shuffle");
//     } catch (error) {
//       console.log("Something went wrong!", error);
//     }
//   });

// router.put("/activateRoom", async function(
//   request: Request,
//   response: Response
// ) {
//   try {
//     // const pool = new sql.ConnectionPool({
//     //   server: "localhost\\SQLEXPRESS",
//     //   database: "SpotifyProject",
//     //   options: {
//     //     trustedConnection: true
//     //   }
//     // });

//     await pool.connect();
//     const req = new sql.Request(pool);

//     console.log("Activating room");

//     const activateQuery = `UPDATE [ROOM]
//                         SET IsPlaying = 1
//                         WHERE ID = '${request.query.id}'`;

//     const resultActivated = await req.query(activateQuery);

//     const roomTracks = `SELECT ID FROM dbo.[Song]
//                         WHERE FK_Ref_Room = '${request.query.id}'`;

//     const resultTracksIDs = await req.query(roomTracks);
//     let tracksIDs: any = [];

//     resultTracksIDs.recordset.forEach((track: any) => {
//       tracksIDs.push(`spotify:track:${track.ID}`);
//     });

//     //console.log(tracksIDs);
//     await SpotifyApi.play(tracksIDs);

//     response.redirect(
//       `http://localhost:3000/api/roomTracks?id=${request.query.id}`
//     );
//   } catch (error) {
//     console.log("Something went wrong!", error);
//   }
// });

// router.route("/getsong").get(
//   async function(req: Request, res: Response) {
//     let song_id = req.query.id;

//     let result = await SpotifyApi.getSong(song_id).then((data: any) => {
//       if (data != undefined) {
//         return {
//           name: data.name,
//           artist: data.artists[0].name,
//           image: data.album.images[0]
//         };
//       } else {
//         return {
//           name: "Candy Shop",
//           artist: "50 Cent",
//           image: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
//         };
//       }
//     });
//     res.send({
//       name: result.name,
//       artist: result.artist,
//       image: result.image,
//       id: song_id
//     });
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

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

// router.get("/browse", async (request: Request, response: Response) => {
//   let getsInfoFromEndpoint = [
//     {
//       id: "123-456",
//       roomname: "Room_A",
//       song: "50 Cent - P.I.M.P",
//       owner: "vasko",
//       image_url:
//         "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
//     },
//     {
//       id: "123-456",
//       roomname: "Room_B",
//       song: "50 Cent - P.I.M.P",
//       owner: "vasko",
//       image_url:
//         "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
//     },
//     {
//       id: "123-456",
//       roomname: "Room_C",
//       song: "50 Cent - P.I.M.P",
//       owner: "vasko",
//       image_url:
//         "https://images.theconversation.com/files/258026/original/file-20190208-174861-nms2kt.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip"
//     }
//   ];

//   response.render("chooseroom", { rooms: getsInfoFromEndpoint });
// });

// router.route("/player").get(
//   async function(req: Request, res: Response) {
//     try {
//       let result = await SpotifyApi.getCurrentPlayback();
//       let progress = msToHMS(result.songProgress);

//       let songinfo = await SpotifyApi.getSong(result.song_id).then(
//         (data: any) => {
//           if (data != undefined) {
//             return {
//               name: data.name,
//               artist: data.artists[0].name,
//               image: data.image_url
//             };
//           } else {
//             return {
//               name: "Candy Shop",
//               artist: "50 Cent",
//               image: "https://img.fruugo.com/product/6/31/82003316_max.jpg"
//             };
//           }
//         }
//       );
//       res.render("index", {
//         artist: songinfo.artist,
//         songName: songinfo.name,
//         time_ms: progress
//       });
//     } catch (err) {
//       console.log("Something went wrong!", err);
//     }
//   },
//   function(err: Error) {
//     console.log("Something went wrong!", err);
//   }
// );

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
