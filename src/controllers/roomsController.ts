import { Request, Response } from "express";
require("dotenv").config();
const net = require('net');

import { Container } from "typedi";
import RoomService from "../services/roomService";

const _roomService = Container.get(RoomService);

export async function getAllRooms(req: Request, res: Response) {
  try {
    let result = await _roomService.getAllRooms();
    res.render("rooms", {data: result});
  } catch (error) {
    res.send("Error getting the rooms: " + error);
  }
}


export async function getRoomTracks(req: Request, res: Response) {
  try {
    let id = req.query.id;
    let result = await _roomService.getRoomTracks(id);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

export async function browseRooms(req: Request, res: Response) {
  let getsInfoFromEndpoint = await _roomService.browseRooms();

  

  res.render("rooms", { rooms: getsInfoFromEndpoint });
}

export async function joinRoom(req: Request, res: Response) {
  try {
    const id = req.query.id;
    let result = await _roomService.joinRoom(id);
    res.render("player", {isOwner: false, roomId: req.body.id})
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

export async function leaveRoom(req: Request, res: Response) {
  try {
    const id = req.query.id;
    let result = await _roomService.leaveRoom(id);
    res.redirect(`${process.env.HOST_URL}/rooms/browse`);
  } catch (error) {
    res.send(error);
  }
}

export async function activateRoom(req: Request, res: Response) {
  try {
    const id = req.query.id;
    let room = await _roomService.activateRoom(id);
    res.render("player", {isOwner: true, roomId: id})
  } catch (error) {
    console.log("Something went wrong!", error);
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    let name = req.body.Name;
    let result = await _roomService.createRoom(name);

    res.redirect(`${process.env.HOST_URL}/rooms/tracks?id=${result}`);
  } catch (error) {
    res.send(error);
  }
}

export async function changeRoomSong(req: Request, res: Response) {
  try {
    let roomId = req.query.roomId;
    let songId = req.query.songId;
    let ms = req.query.ms;
    let isPlaying = req.query.isPlaying;
    let result = await _roomService.changeRoomSong(roomId, songId, ms, isPlaying);

    res.send();
  } catch (error) {
    res.send(error);
  }
}


export async function getActiveRoom(req: Request, res: Response) {
  try {

    let result = await _roomService.getActiveRoom(req.query.id);

    // res.redirect(`${process.env.HOST_URL}/rooms/tracks?id=${result}`);
  } catch (error) {
    res.send(error);
  }
}
