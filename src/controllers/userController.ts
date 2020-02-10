import { Router, Request, Response, request } from 'express';

const router: Router = Router();

let SpotifyApi = require('../services/spotifyService');
// var SpotifyApi = new SpotifyWebApi({
//     clientId: process.env.SPOTIFY_API_ID,
//     clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//     redirectUri: process.env.CALLBACK_URL,
//   });
  
let scopes = ['user-read-private', 'user-read-email','playlist-modify-public','playlist-modify-private']
let redirectUri = `http://localhost:3000/`;

router.get('/login', (req: Request,res: Response) => {
    var html = SpotifyApi.createAuthorizeURL(scopes)
    console.log(html)
    res.send(html+"&show_dialog=true")  
  })
  
router.get('/callback', async (req: Request,    res: Response) => {
    const { code } = req.query;
    console.log(code)
    try {
      var data = await SpotifyApi.authorizationCodeGrant(code)
      const { access_token, refresh_token } = data.body;
      SpotifyApi.setAccessToken(access_token);
      SpotifyApi.setRefreshToken(refresh_token);
  
      res.redirect(redirectUri);
    } catch(err) {
      res.redirect('/#/error/invalid token');
    }
});

router.get('/current', function(req: Request,    res: Response) {
    SpotifyApi
    .getMyCurrentPlaybackState
    .then(function(data: any) {
      console.log("Now Playing: ",data.body);
      res.send(data);
    }, function(err: any) {
      console.log('Something went wrong!', err);});
})

router.get('/me', function(req: Request,    res: Response) {
    SpotifyApi
    .getMe
    .then(function(data: any) {
    console.log('Name: ' + data.body['display_name']);
    console.log('Email:' + data.body.email);
    console.log('ImageURL: ' + data.body.images[0].url);
    console.log('AccountType: ' + data.body.product);
      res.send(data.body);
    }, function(err: any) {
      console.log('Something went wrong!', err);
    });
})

export const UserController: Router = router;