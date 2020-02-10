import bodyParser from 'body-parser';
import { UserController } from './controllers/userController';
import express, { Request, Response } from 'express';
require('dotenv').config();

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

const router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');

// Replace with your redirect URI, required scopes, and show_dialog preference
// var redirectUri = `http://localhost:3000/`;
// var scopes = ['user-top-read', 'streaming'];
// var showDialog = true;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use("/", UserController);

app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});

