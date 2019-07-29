var express = require("express"),
  request = require("request"),
  querystring = require("querystring"),
  keypress = require("keypress"),
  path = require("path"),
  commands = require("./command"),
  refreshTokenFunc = require("./refresh_token_func");

var router = express.Router();

var client_id = "6887d234af53474bb73e2fc0811b0125";
var client_secret = "5ddc3339f3df4ce8a11912be0ac98a0b";
var redirect_uri = "http://localhost:8888/callback";

var stateKey = "spotify_auth_state";
var access_token = null;
var refresh_token = null;

var expiry_time = null;

var generateRandomString = function(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42);
    }, 300);
  });
}

// Login Route
router.get("/login", function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  //application request authorization
  var scope =
    "user-read-private, user-read-email, streaming, user-read-playback-state, user-modify-playback-state";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
  );
});

// Callback for authorization
router.get("/callback", function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state != storedState) {
    res.redirect("/#" + querystring.stringify({ error: "state_mismatch" }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64")
      },
      json: true
    };

    request.post(authOptions, function(err, response, body) {
      if (response.statusCode === 200 && !err) {
        //var access_token = body.access_token;
        //var refresh_token = body.refresh_token;
        var date = new Date();
        console.log("The current time is: " + date.getTime());
        expiry_time = date.getTime() + 3590000;
        console.log("The expiry time is: " + expiry_time);

        console.log(
          "When authorizing, this is the refresh_token: " + body.refresh_token
        );

        access_token = body.access_token;
        refresh_token = body.refresh_token;

        console.log("Refresh token now is: " + refresh_token);

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true
        };

        request.get(options, function(err, res, body) {
          console.log(body);
        });

        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
        );
      } else {
        res.redirect("/#" + querystring.stringify({ error: "invalid_token" }));
      }
    });
  }
});

// Getting a refresh token
// Might be deprecated
router.get("/refresh_token", function(req, res) {
  console.log("The access token before was: " + access_token);
  console.log("================================================");
  var initializeNewAccessToken = refreshTokenFunc(
    refresh_token,
    client_id,
    client_secret
  );
  initializeNewAccessToken.then(
    function(result) {
      access_token = result;
      console.log("The access token now is: " + access_token);
    },
    function(err) {
      console.log("The error callback happens");
      console.log(err);
    }
  );

  //access_token = refreshTokenFunc(refresh_token, client_id, client_secret);

  // //requesting access token from refresh token
  // var authOptions = {
  //   url: "https://accounts.spotify.com/api/token",
  //   headers: {
  //     Authorization:
  //       "Basic " +
  //       new Buffer(client_id + ":" + client_secret).toString("base64")
  //   },
  //   form: {
  //     grant_type: "refresh_token",
  //     refresh_token: refresh_token
  //   },
  //   json: true
  // };

  // request.post(authOptions, function(err, response, body) {
  //   console.log("The request in refresh_token happens");
  //   if (response.statusCode === 200 && !err) {
  //     access_token = body.access_token;
  //     console.log("The access token now is: " + access_token);
  //     var date = new Date();
  //     expiry_time = date.getTime() + 3590000;
  //   }
  // });
  res.redirect("/test");
});

// This is my actual app
router.get("/test", function(req, res) {
  console.log(access_token);
  res.sendFile("test.html", {
    root: path.join(__dirname, "../public/")
  });
});

// Post request for executing a command
router.post("/command", async (req, res) => {
  console.log("This endpoint was triggered");

  // Handle refresh token capability
  var current_time = new Date().getTime();
  if (current_time > expiry_time) {
    console.log("The access token before was: " + access_token);
    console.log("================================================");
    var initializeNewAccessToken = refreshTokenFunc(
      refresh_token,
      client_id,
      client_secret
    );
    initializeNewAccessToken.then(
      function(result) {
        access_token = result;
        console.log("The access token now is: " + access_token);
        expiry_time = new Date().getTime() + 3590000;
      },
      function(err) {
        console.log("The error callback happens");
        console.log(err);
      }
    );
  }

  // Perform actual command
  await commands(req.body["key"], access_token);
  // Wait a little bit
  await delay();

  // Return the new state of the player
  // This needs refactoring
  var getPlayerStateInfo = getCurrentPlayerState(access_token);

  getPlayerStateInfo.then(
    function(result) {
      var info = {
        shuffle: null,
        repeat: null,
        playing: null,
        songName: null,
        songArtists: [],
        songAlbum: null,
        songImageURL: null
      };

      info["shuffle"] = result["shuffle_state"];
      info["repeat"] = result["repeat_state"];
      info["playing"] = result["is_playing"];

      info["songName"] = result["item"]["name"];
      result["item"]["artists"].forEach(function(item) {
        info["songArtists"].push(item["name"]);
      });
      info["songAlbum"] = result["item"]["album"]["name"];
      info["songImageURL"] = result["item"]["album"]["images"][0]["url"];

      console.log(typeof info["playing"]);

      console.log("This is the info");
      console.log(info);

      res.json(info);
    },
    function(err) {
      res.json(err);
    }
  );
});

var getCurrentPlayerState = function(access_token) {
  var getOptions = {
    url: "https://api.spotify.com/v1/me/player/",
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.get(getOptions, function(err, response, body) {
      if (response.statusCode === 200 && !err) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
};

router.get("/player/playerstate", function(req, res) {
  var getPlayerStateInfo = getCurrentPlayerState(access_token);

  getPlayerStateInfo.then(
    function(result) {
      var info = {
        shuffle: null,
        repeat: null,
        playing: null,
        songName: null,
        songArtists: [],
        songAlbum: null,
        songImageURL: null
      };

      info["shuffle"] = result["shuffle_state"];
      info["repeat"] = result["repeat_state"];
      info["playing"] = result["is_playing"];

      info["songName"] = result["item"]["name"];
      result["item"]["artists"].forEach(function(item) {
        info["songArtists"].push(item["name"]);
      });
      info["songAlbum"] = result["item"]["album"]["name"];
      info["songImageURL"] = result["item"]["album"]["images"][0]["url"];

      console.log(typeof info["playing"]);

      res.json(info);
    },
    function(err) {
      res.json(err);
    }
  );
});

//var getPlaylists = function(access_token) {
//  var getOptions = {
//    url: "https://api.spotify.com/v1/me/playlists/",
//    headers: { Authorization: "Bearer " + access_token },
//    json: true
//  };
//
//  return new Promise(function(resolve, reject) {
//    request.get(getOptions, function(err, response, body) {
//      if (response.statusCode === 200 && !err) {
//        resolve(body);
//      } else {
//        reject(err);
//      }
//    });
//  });
//};
//
//router.get("/player/playlists", function(req, res) {
//  var getPlaylistInfo = getPlaylists(access_token);
//
//  getPlaylistInfo.then(
//    function(result) {
//      res.json(result);
//    },
//    function(err) {
//      res.json(err);
//    }
//  );
//});

module.exports = router;
