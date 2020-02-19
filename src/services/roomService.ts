import { Service, Container } from "typedi";
import SpotifyService from "./spotifyService";
import Room from "../models/room";
import User from "../models/user";
import UserService from "./userService";
require("dotenv").config();

var { poolPromise, sql } = require("../db/db");

@Service()
export default class RoomService {
  private _spotifyService: any;
  private _userService: any;
  private activeRooms: Room[];

  constructor() {
    this._spotifyService = Container.get(SpotifyService);
    this._userService =  Container.get(UserService);
    this.activeRooms = [];
  }

  public async getRoom(id: string) {
    const pool = await poolPromise;
    try {
      const sqlreq = new sql.Request(pool);

      const query = `SELECT *  FROM Room WHERE ID = ${id}`;

      const result = await sqlreq.query(query);

      console.log(JSON.stringify(result));

      const room: Room = {
        Id: id,
        Name: result.recordset.Name,
        OwnerID: result.recordset.OwnerID,
        LastPlayed: result.recordset.LastPlayed,
        PlaybackMS: result.recordset.PlaybackMS,
        IsPlaying: result.recordset.IsPlaying,
        Participants: [],
        Queue: []
      }

      return Promise.resolve(room);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getActiveRooms() {
    return this.activeRooms;
  }

  public async getAllRooms() {
    const pool = await poolPromise;
    try {
      const sqlreq = new sql.Request(pool);

      const query = `SELECT Room.ID, [Name], Username, LastPlayed, PlaybackMS, IsPlaying  
                          FROM Room JOIN [User] 
                          ON [OwnerID] = [User].SpotifyAccountID`;

      const result = await sqlreq.query(query);

      let rooms: any = [];

      result.recordset.forEach((room: any) => rooms.push(room));

      console.dir(rooms);

      return Promise.resolve(rooms);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getRoomTracks(id: string) {
    // Stuff that this endpoint needs to send: 
    // Array of objects with these params:
    //  - Id
    //  - roomName
    //  - owner
    //  - currentlyPlayingInRoom
    //  - participants

    console.log("Getting room tracks.................");
    try {
      const pool = await poolPromise;

      const sqlreq = new sql.Request(pool);

      const roomTracks = `SELECT [Name], Artists FROM dbo.[Song]
                              WHERE FK_Ref_Room = '${id}'`;

      const result = await sqlreq.query(roomTracks);
      return Promise.resolve(result.recordset);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async browseRooms() {
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

    return Promise.resolve({ rooms: getsInfoFromEndpoint });
  }

  public async joinRoom(id: string) {
    let currentUser = await this._spotifyService.GetMe();

    console.log("Entering room.....");
    const pool = await poolPromise;

    let topTracks = await this._spotifyService.getCurrentUsersTopTracks();
    let tracks: any = [];

    topTracks.body.items.forEach((track: any) =>
      tracks.push({
        id: track.id,
        artist: track.artists[0].name,
        name: track.name
      })
    );

    try {
      const sqlreq = new sql.Request(pool);
      console.log(currentUser.id);
      console.log(id);
      const query = `INSERT INTO User_Room(ID, Ref_User_ID, Ref_Room_ID)
                          VALUES(NEWID(), '${currentUser.id}', '${id}')`;
      console.log(query);
      const result = await sqlreq.query(query);
      console.log("Entered room successfully.");

      tracks.forEach(async (track: any) => {
        const saveSongsQuery = `INSERT INTO dbo.Song(ID, Name, Artists, FK_Ref_Room)
                                    VALUES('${track.id.toString()}', '${track.name.replace(
          "'",
          ""
        )}', '${track.artist.replace("'", "")}', '${id}')`;
        const result = await sqlreq.query(saveSongsQuery);
      });

      this.addToActiveRoom(currentUser.id, id);

      console.dir(result);
      return Promise.resolve();
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  public async leaveRoom(id: string) {
    let currentUser = await this._spotifyService.GetMe();
    console.log("Leaving room.....");
    const pool = await poolPromise;

    try {
      const sqlreq = new sql.Request(pool);

      const query = `DELETE FROM [User_Room] 
                          WHERE Ref_User_ID = '${currentUser.id}' AND Ref_Room_ID = '${id}'`;

      const result = await sqlreq.query(query);
      
      console.log("Left room successfully.");
      console.dir(result);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async activateRoom(id: string) {
    try {
      const pool = await poolPromise;
      const sqlreq = new sql.Request(pool);

      console.log("Activating room");

      const activateQuery = `UPDATE [ROOM]
                              SET IsPlaying = 1
                              WHERE ID = '${id}'`;

      const resultActivated = await sqlreq.query(activateQuery);

      const roomTracks = `SELECT ID FROM dbo.[Song]
                              WHERE FK_Ref_Room = '${id}'`;

      const resultTracksIDs = await sqlreq.query(roomTracks);
      let tracksIDs: any = [];

      resultTracksIDs.recordset.forEach((track: any) => {
        tracksIDs.push(`spotify:track:${track.ID}`);
      });
      
      //console.log(tracksIDs);
      await this._spotifyService.play(tracksIDs);

      const room = await this.getRoom(id);
      room.Queue = tracksIDs;
      this.activeRooms.push(room);

      return Promise.resolve(room);
    } catch (error) {
      return Promise.reject();
    }
  }

  public async deactivateRoom(id: string) {
    try {
      const pool = await poolPromise;
      const sqlreq = new sql.Request(pool);

      console.log("Deactivating room");

      const activateQuery = `UPDATE [ROOM]
                              SET IsPlaying = 0
                              WHERE ID = '${id}'`;

      const resultActivated = await sqlreq.query(activateQuery);
      
      //console.log(tracksIDs);

      this.activeRooms.splice(this.activeRooms.findIndex(a=> a.Id === id),1);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject();
    }
  }

  public async createRoom(name: string) {
    let currentUser = await this._spotifyService.GetMe();
    console.log("Creating room.....");
    console.log("Current user is: " + currentUser);
    // console.log("Access token: " + this._spotifyService);

    const data = {
      Name: name,
      OwnerID: currentUser.id,
      IsPlaying: false
    };

    let topTracks = await this._spotifyService.getCurrentUsersTopTracks();
    let tracks: any = [];

    topTracks.body.items.forEach((track: any) =>
      tracks.push({
        id: track.id,
        artist: track.artists[0].name,
        name: track.name
      })
    );

    console.log(data);
    const pool = await poolPromise;

    try {
      const sqlreq = new sql.Request(pool);

      const query = `INSERT INTO dbo.[Room] (ID, Name, OwnerID, IsPlaying)
                        VALUES(NEWID(), '${data.Name}', '${data.OwnerID}', '${data.IsPlaying}')`;
      const result = await sqlreq.query(query);

      const roomIdQuery = `SELECT ID FROM dbo.[Room] WHERE Name = '${data.Name}' AND OwnerID = '${data.OwnerID}'`;
      const idResult = await sqlreq.query(roomIdQuery);

      console.log(idResult.recordset[0].ID);

      console.log("Room created");

      tracks.forEach(async (track: any) => {
        const saveSongsQuery = `INSERT INTO dbo.Song(ID, Name, Artists, FK_Ref_Room)
                                    VALUES('${track.id}', '${track.name.replace(
          "'",
          ""
        )}', '${track.artist.replace("'", "")}', '${
          idResult.recordset[0].ID
        }')`;

        const result = await sqlreq.query(saveSongsQuery);
      });

      return Promise.resolve(idResult.recordset[0].ID);
    } catch (error) {
      return Promise.reject();
    }
  }

  public async getRoomQueue(id: string){
    let room = this.getActiveRoom(id);
    return room.Queue;
  }

  public getActiveRoom(id: string){
    let room = this.activeRooms[this.activeRooms.findIndex(a => a.Id === id)];
    return room;
  }

  public changeRoomSong(roomId: string, songId: string, ms: string, isPlaying: boolean){
    this.activeRooms[this.activeRooms.findIndex(a => a.Id === roomId)].PlaybackMS = ms;
    this.activeRooms[this.activeRooms.findIndex(a => a.Id === roomId)].LastPlayed = songId;
    this.activeRooms[this.activeRooms.findIndex(a => a.Id === roomId)].IsPlaying = isPlaying;
  }

  public setActiveRoom(room: Room){
    this.activeRooms[this.activeRooms.findIndex(a => a.Id === room.Id)] = room;
  }

  private addToActiveRoom(user: string, id: string){
    let room = this.getActiveRoom(id);

    room.Participants.push(user);

    this.setActiveRoom(room);
  }

}
