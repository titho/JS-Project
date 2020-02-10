import { Request, Response } from "express";

var SpotifyWebApi = require('spotify-web-api-node');

require('dotenv').config();

var SpotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_API_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL,
});

module.exports.default  = SpotifyApi;
  