var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var dotenv        = require('dotenv');
var SpotifyWebApi = require('spotify-web-api-node');

dotenv.load();

var spotifyApi = new SpotifyWebApi({
  clientId     : process.env.SPOTIFY_KEY,
  clientSecret : process.env.SPOTIFY_SECRET,
  redirectUri  : process.env.SPOTIFY_REDIRECT_URI
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  if (spotifyApi.getAccessToken()) {
    return res.send('Sesión iniciada :D');
  }
  return res.send('<button><a href="/authorise">Autorizame che!</a></button>');
});

app.get('/authorise', function(req, res) {
  var scopes = ['playlist-modify-public', 'playlist-modify-private'];
  var state  = new Date().getTime();
  var authoriseURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authoriseURL);
});

app.get('/callback', function(req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code)
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return res.redirect('/');
    }, function(err) {
      return res.send(err);
    });
});

app.use('/store', function(req, res, next) {
  if (req.body.token !== process.env.SLACK_TOKEN) {
    return res.status(500).send('Cross site request forgerizzle!');
  }
  next();
});

app.post('/store', function(req, res) {
  spotifyApi.refreshAccessToken()
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      if (data.body['refresh_token']) {
        spotifyApi.setRefreshToken(data.body['refresh_token']);
      }
      if(req.body.text.indexOf(' - ') === -1) {
        var query = 'track:' + req.body.text;
      } else {
        var pieces = req.body.text.split(' - ');
        var query = 'artist:' + pieces[0].trim() + ' track:' + pieces[1].trim();
      }
      spotifyApi.searchTracks(query)
        .then(function(data) {
          var results = data.body.tracks.items;
          if (results.length === 0) {
            return res.send('Canción no encontrada. Seguro que la escribiste bien? :|');
          }
          var track = results[0];
          spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_USERNAME, process.env.SPOTIFY_PLAYLIST_ID, ['spotify:track:' + track.id])
            .then(function(data) {
              return res.send('Canción agregada: *' + track.name + '* de *' + track.artists[0].name + '*');
            }, function(err) {
              return res.send(err.message);
            });
        }, function(err) {
          return res.send(err.message);
        });
    }, function(err) {
      return res.send('Mmmm, parece que Heroku te pateó! Probá re-autorizando tu acceso en https://snapmusic.herokuapp.com.');
    });
});

app.use('/get_tracks', function(req, res, next) {
  if (req.body.token !== process.env.SLACK_TOKEN_TRACKS) {
    return res.status(500).send('Cross site request forgerizzle!');
  }
  next();
});

app.post('/get_tracks', function(req, res){
  spotifyApi.refreshAccessToken()
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      if (data.body['refresh_token']) {
        spotifyApi.setRefreshToken(data.body['refresh_token']);
      }
      if(req.body.text.indexOf(' - ') === -1) {
        var query = 'track:' + req.body.text;
      } else {
        var pieces = req.body.text.split(' - ');
        var query = 'artist:' + pieces[0].trim() + ' track:' + pieces[1].trim();
      }
      spotifyApi.searchTracks(query)
        .then(function(data) {
          var results = data.body.tracks.items;
          if (results.length === 0) {
            return res.send('No se encontraron canciones. Seguro que escribiste bien? :|');
          }
          var tracks = results.slice(0, 9);
	  var response = '*CANCIONES ENCONTRADAS:* \n';
	  for(var index = 0; index < tracks.length; index++){
	   response = response.concat('*' + tracks[index].name + '* de *' + tracks[index].artists[0].name + '*\n');
	  }
	  return res.send(response);
        }, function(err) {
          return res.send(err.message);
        });
    }, function(err) {
      return res.send('Mmmm, parece que Heroku te pateó! Probá re-autorizando tu acceso en https://snapmusic.herokuapp.com.');
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
