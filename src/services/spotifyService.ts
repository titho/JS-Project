import { Request, Response } from "express";

const SpotifyWebApi = require("spotify-web-api-node");

require("dotenv").config();

const SpotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_API_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL
});

module.exports.default = SpotifyApi;
