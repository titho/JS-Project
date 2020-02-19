
const RoomControler = require("../controllers/roomsController");

var express = require('express');
var router = express.Router();

// TODO:
//     This is where the player will be
//     and is basically the room you are in right now.
// router.get("/", RoomControler.get_room)
// Get all rooms
router.get("/browse", RoomControler.getAllRooms)
// Get tracks for room
router.get("/tracks", RoomControler.getRoomTracks)
router.post("/create", RoomControler.createRoom)
// Enter room
router.post("/join", RoomControler.joinRoom)
router.post("/leave", RoomControler.leaveRoom)
router.put("/activate", RoomControler.activateRoom)
router.put("/set", RoomControler.changeRoomSong)
router.put("/get", RoomControler.getActiveRoom)

// Player controls



module.exports = router;