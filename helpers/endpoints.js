const express      = require("express"),
  request          = require("request"),
  querystring      = require("querystring"),
  keypress         = require("keypress"),
  path             = require("path"),
  commands         = require("./command"),
  helperFuncs      = require("./helper_functions");

const router = express.Router();

const client_id = "";
const client_secret = "";
const redirect_uri = "http://localhost:8888/callback";

const stateKey = "spotify_auth_state";

let access_token = null;
let refresh_token = null;
let expiry_time = null;

// Login Route
router.get("/login", (req, res) => {
  let state = helperFuncs.generateRandomString(16);
  res.cookie(stateKey, state);

  //application request authorization
  const scope =
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
router.get("/callback", (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state != storedState) {
    res.redirect("/#" + querystring.stringify({ error: "state_mismatch" }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
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

    request.post(authOptions, (err, response, body) => {
      if (response.statusCode === 200 && !err) {
        let date = new Date();
        expiry_time = date.getTime() + 3590000;

        access_token = body.access_token;
        refresh_token = body.refresh_token;

        let options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true
        };

        request.get(options, (get_err, get_res, get_body) => {
          console.log(body);
          res.redirect("http://localhost:3000");
        });

      } else {
        res.redirect("/#" + querystring.stringify({ error: "invalid_token" }));
      }
    });
  }
});

// Refresh token
router.get("/refresh_token", (req, res) => {
  console.log("The access token before was: " + access_token);
  let initializeNewAccessToken = refreshTokenFunc(
    refresh_token,
    client_id,
    client_secret
  );
  initializeNewAccessToken.then(
    result => {
      access_token = result;
      console.log("The access token now is: " + access_token);
    },
    err => {
      console.log("The error callback happens");
      console.log(err);
    }
  );
  res.redirect("/test");
});

// Command, perform actual Spotify command
router.post("/command", async (req, res) => {
  // Handle refresh token capability
  let current_time = new Date().getTime();
  if (current_time > expiry_time) {
    console.log("The access token before was: " + access_token);
    var initializeNewAccessToken = helperFuncs.refreshTokenFunc(
      refresh_token,
      client_id,
      client_secret
    );
    initializeNewAccessToken.then(
      result => {
        access_token = result;
        console.log("The access token now is: " + access_token);
        expiry_time = new Date().getTime() + 3590000;
      },
      err => {
        console.log("The error callback happens");
        console.log(err);
      }
    );
  }

  // Perform command
  await commands(req.body["key"], req.body["device_id"], access_token);
  // Wait a little bit
  await helperFuncs.delay();

  // Return the new state of the player
  let getPlayerStateInfo = helperFuncs.getCurrentPlayerState(access_token);
  getPlayerStateInfo.then(
    result => res.json(result),
    rejection => res.json(rejection));

  // getPlayerStateInfo.then(
  //   result => {
  //     let info = {
  //       shuffle: null,
  //       repeat: null,
  //       playing: null,
  //       songName: null,
  //       songArtists: [],
  //       songAlbum: null,
  //       songImageURL: null,
  //       device_id: null
  //     };

  //     info["device_id"] = result["device"]["id"];
  //     info["shuffle"] = result["shuffle_state"];
  //     info["repeat"] = result["repeat_state"];
  //     info["playing"] = result["is_playing"];

  //     info["songName"] = result["item"]["name"];
  //     result["item"]["artists"].forEach(item => {
  //       info["songArtists"].push(item["name"]);
  //     });
  //     info["songAlbum"] = result["item"]["album"]["name"];
  //     info["songImageURL"] = result["item"]["album"]["images"][0]["url"];

  //     res.json(info);
  //   },
  //   err => {
  //     res.json(err);
  //   }
  // );
});

router.get("/player/playerstate", (req, res) => {
  let getPlayerStateInfo = helperFuncs.getCurrentPlayerState(access_token);
  getPlayerStateInfo.then(
    result => res.json(result),
    rejection => res.json(rejection));
  // getPlayerStateInfo.then(
  //   result => {
  //     let info = {
  //       shuffle: null,
  //       repeat: null,
  //       playing: null,
  //       songName: null,
  //       songArtists: [],
  //       songAlbum: null,
  //       songImageURL: null,
  //       device_id: null
  //     };

  //     info["device_id"] = result["device"]["id"];
  //     info["shuffle"] = result["shuffle_state"];
  //     info["repeat"] = result["repeat_state"];
  //     info["playing"] = result["is_playing"];

  //     info["songName"] = result["item"]["name"];
  //     result["item"]["artists"].forEach(item => {
  //       info["songArtists"].push(item["name"]);
  //     });
  //     info["songAlbum"] = result["item"]["album"]["name"];
  //     info["songImageURL"] = result["item"]["album"]["images"][0]["url"];

  //     res.json(info);
  //   },
  //   err => {
  //     res.json(err);
  //   }
  // );
});

router.get("/isAuthorized", (req, res) => {
  res.json({ access_token: access_token });
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

// This is a good debugging endpoint, if needed
router.get("/test", (req, res) => {
  console.log(access_token);
  res.sendFile("test.html", {
    root: path.join(__dirname, "../public/")
  });
});

module.exports = router;
