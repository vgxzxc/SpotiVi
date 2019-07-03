var express      = require('express'),
    // bodyParser   = require('body-parser')
    request      = require('request'),
    // cors         = require('cors'),
    querystring  = require('querystring'),
    // cookieParser = require('cookie-parser'),
    keypress     = require('keypress'),
    path         = require('path'),
    commands     = require('./command');

var router = express.Router();

var client_id     = '6887d234af53474bb73e2fc0811b0125'
var client_secret = '5ddc3339f3df4ce8a11912be0ac98a0b'
var redirect_uri  = 'http://localhost:8888/callback'

var stateKey = 'spotify_auth_state';
var access_token = null;
var refresh_token = null;

var generateRandomString = function(length){
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/login', function(req, res){
  var state = generateRandomString(16);
  res.cookie(stateKey, state)

  //application request authorization
  var scope = 'user-read-private, user-read-email, streaming, user-read-playback-state'
  res.redirect('https://accounts.spotify.com/authorize?' + 
                querystring.stringify({
                  response_type: 'code',
                  client_id: client_id,
                  scope: scope,
                  redirect_uri: redirect_uri,
                  state: state
    }));
});

router.get('/callback', function(req, res){
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state != storedState){
    res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + 
        (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(err, response, body){
      if (response.statusCode === 200 && !err){
        //var access_token = body.access_token;
        //var refresh_token = body.refresh_token;
        access_token = body.access_token;
        refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(options, function(err, res, body){
          console.log(body);
        });

        res.redirect('/#' + querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }));
      } else {
        res.redirect('/#' + querystring.stringify({error: 'invalid_token'}));
      };
    });
  }
});

router.get('/refresh_token', function(req, res){
  //requesting access token from refresh token
  refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic' + 
               (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(err, response, body){
    if (response.statusCode === 200 && !err){
      //var access_token = body.access_token;
      access_token = body.access_token;
      res.send({
        'access_token' : access_token
      });
    }
  });
});

router.get('/test', function(req, res){
  console.log(access_token)
  res.sendFile('test.html', {
    root: path.join(__dirname, '../public/')
  });
});

router.post('/command', function(req, res){
  console.log("This endpoint was triggered.");
  commands(req.body['key'], access_token);

  // var options = {
  //   //url: 'https://api.spotify.com/v1/me/player/pause',
  //   headers: { 'Authorization': 'Bearer ' + access_token,
  //              'Accept': 'application/json',
  //              'Content-Type': 'application/json'
  //              },
  //   json: true
  // };

  // if (req.body['key'] == 'p'){
  //   options['url'] = 'https://api.spotify.com/v1/me/player/play'
  // }
  // else if (req.body['key'] == 'k'){
  //   options['url'] = 'https://api.spotify.com/v1/me/player/pause'
  // } else if (req.body)
  // console.log("These are the options");
  // console.log(options);
  // request.put(options, function(err, res, body){
  //   console.log("The request request happened!");
  // });
  // console.log("And then this happens? Idk tho")

  res.redirect('/test');
});

module.exports = router;