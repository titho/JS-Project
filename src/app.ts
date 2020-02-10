import express, { Request, Response } from 'express';
require('dotenv').config();

const app = express();
const router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');

// Replace with your redirect URI, required scopes, and show_dialog preference
var redirectUri = `http://localhost:3000/`;
var scopes = ['user-top-read'];
var showDialog = true;

app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.send('The sedulous hyena ate the antelope!');
// });

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request: Request, response: Response) {
    response.sendFile(__dirname + '../public/index.html');
  });

// The API object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : redirectUri
});

app.get("/authorize", async function (request: Request, response: Response) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  console.log(authorizeURL)
  response.send(authorizeURL);
});

// Exchange Authorization Code for an Access Token
app.get("/callback", function (request: Request, response: Response) {
  var authorizationCode = request.query.code;
  
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data: any) {
    console.log(data)
    response.redirect(`/#access_token=${data.body['access_token']}&refresh_token=${data.body['refresh_token']}`)
  }, function(err: Error) {
    console.log('Something went wrong when retrieving the access token!', err.message);
  });
});

app.get("/logout", function (request: Request, response: Response) {
  response.redirect('/'); 
});

app.get('/myendpoint', async function (request: Request, response: Response) {

//   var loggedInSpotifyApi = new SpotifyWebApi();

  if(request.headers['authorization']){
    console.log(request.headers['authorization'].split(' ')[1]);
    spotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  
//     setTimeout(function() {
//         console.log("Sup ma nugga?" + request.headers['authorization']);
//         //your code to be executed after 1 second
//       }, 5000);
//    }
  
  // Search for a track!
  spotifyApi.getMyTopTracks()
    .then(function(data: any) {
      console.log(data.body);
      response.send(data.body);
    }, function(err: Error) {
      console.error(err);
    });
  
});


//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + process.env.PORT);
});
