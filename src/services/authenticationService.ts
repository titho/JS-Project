import { Request, Response } from "express";

var express = require('express');
var router = express.Router();


var SpotifyWebApi = require('spotify-web-api-node');
var scopes = ['user-read-private', 'user-read-email','playlist-modify-public','playlist-modify-private']

require('dotenv').config();

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_API_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL,
});

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: Function) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req: Request,res: Response) => {
  var html = spotifyApi.createAuthorizeURL(scopes)
  console.log(html)
  res.send(html+"&show_dialog=true")  
})

router.get('/callback', async (req: Request,    res: Response) => {
  const { code } = req.query;
  console.log(code)
  try {
    var data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect('http://localhost:3001/home');
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});

module.exports = router;