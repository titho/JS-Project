
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

// Player controls
// router.post("/pause", RoomControler.pause)
// router.post("/next", RoomControler.play_next)
// router.post("/prev", RoomControler.play_prev)
// router.post("/play", RoomControler.play)
// router.post("/play/track", RoomControler.play_track)


module.exports = router;