

const UserController  = require("../controllers/userController");

var express = require('express');
var router = express.Router();

// At this point the url has /user at the end
router.post("/login", UserController.login)
router.get("/callback", UserController.callback)
router.get("/me", UserController.getMe)
router.post("/register", UserController.register)
router.get("/save-spotify-user", UserController.saveSpotifyUser)
router.get("/currently", UserController.getCurrentlyPlaying)
// Not for here but for now...
router.get("/get-song", UserController.getSong)

module.exports = router;

