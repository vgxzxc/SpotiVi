var request = require("request");

//Global Vars
var g = "";

// var triggerEndpoint = async function(key, token) {
async function triggerEndpoint(key, token) {
  switch (key) {
    case " ":
      try {
        await playPause(token);
      } catch (error) {
        return error;
      }
      break;
    case "l":
      try {
        await skipForward(token);
      } catch (error) {
        return error;
      }
      break;
    case "h":
      try {
        await goBack(token);
      } catch (error) {
        return error;
      }
      break;
    case "s":
      try {
        await toggleShuffle(token);
      } catch (error) {
        return error;
      }
      break;
    case "r":
      try {
        await toggleRepeat(token);
      } catch (error) {
        return error;
      }
      break;
    case "g": // Not implemented
      firstSongOfPlaylist(token);
      break;
    case "x": // Not implemented
      removeSongFromPlaylist(token);
      break;
    case "/": // Not implemented
      search(token);
      break;
  }
}

function playPause(token) {
  var getOptions = {
    url: "https://api.spotify.com/v1/me/player",
    headers: { Authorization: "Bearer " + token },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.get(getOptions, function(err, res, body) {
      var putOptions = {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        json: true
      };
      if (body == null) {
        // This happens when there is no active device
        console.log("Body is null");
        reject();
      } else if ("error" in body) {
        console.log("An error has occured");
        reject();
      } else if (body["is_playing"] == true) {
        putOptions["url"] = "https://api.spotify.com/v1/me/player/pause";
        request.put(putOptions, function(err, res, body) {
          console.log("Song has been paused");
          resolve();
        });
      } else if (body["is_playing"] == false) {
        putOptions["url"] = "https://api.spotify.com/v1/me/player/play";
        request.put(putOptions, function(err, res, body) {
          console.log("Song is now playing");
          resolve();
        });
      } else {
        reject();
      }
    });
  });
}

function skipForward(token) {
  var options = {
    url: "https://api.spotify.com/v1/me/player/next",
    headers: {
      Authorization: "Bearer " + token
    },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.post(options, function(err, res, body) {
      if (err) {
        reject(err);
      } else {
        console.log("I have skipped to the next track");
        resolve("Success");
      }
    });
  });
}

var goBack = function(token) {
  var getOptions = {
    url: "https://api.spotify.com/v1/me/player",
    headers: { Authorization: "Bearer " + token },
    json: true
  };
  return new Promise((resolve, reject) => {
    request.get(getOptions, function(err, res, body) {
      var options = {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        json: true
      };

      if (err) {
        console.log("An error has occured");
        reject(err);
      }

      if (body["progress_ms"] < 3000) {
        options["url"] = "https://api.spotify.com/v1/me/player/previous";
        request.post(options, function(err, res, body) {
          console.log("I have gone to the previous track");
          resolve();
        });
      } else {
        options["url"] =
          "https://api.spotify.com/v1/me/player/seek?position_ms=0";
        request.put(options, function(err, res, body) {
          console.log("I have started at the beginning of this track");
          resolve();
        });
      }
    });
  });
};

var toggleShuffle = function(token) {
  var getOptions = {
    url: "https://api.spotify.com/v1/me/player",
    headers: { Authorization: "Bearer " + token },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(getOptions, function(err, res, body) {
      var putOptions = {
        url: "https://api.spotify.com/v1/me/player/shuffle",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        json: true
      };

      if (err) {
        console.log("An error has occurred");
        reject(err);
      }

      if (body["shuffle_state"] == true) {
        putOptions["url"] = putOptions["url"] + "?state=false";
        request.put(putOptions, function(err, res, body) {
          console.log("Shuffle is disabled");
          resolve();
        });
      } else if (body["shuffle_state"] == false) {
        putOptions["url"] = putOptions["url"] + "?state=true";
        request.put(putOptions, function(err, res, body) {
          console.log("Shuffle is enabled");
          resolve();
        });
      } else {
        console.log("Something weird happened");
        reject();
      }
    });
  });
};

var toggleRepeat = function(token) {
  var getOptions = {
    url: "https://api.spotify.com/v1/me/player",
    headers: { Authorization: "Bearer " + token },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(getOptions, function(err, res, body) {
      var putOptions = {
        url: "https://api.spotify.com/v1/me/player/repeat",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        json: true
      };

      if (err) {
        console.log("An error occurred");
        reject(err);
      }

      if (body["repeat_state"] == "off") {
        putOptions["url"] = putOptions["url"] + "?state=context";
        request.put(putOptions, function(err, res, body) {
          console.log("Context repeat has been enabled");
          resolve();
        });
      } else if (body["repeat_state"] == "context") {
        putOptions["url"] = putOptions["url"] + "?state=track";
        request.put(putOptions, function(err, res, body) {
          console.log("Track repeat has been enabled");
          resolve();
        });
      } else if (body["repeat_state"] == "track") {
        putOptions["url"] = putOptions["url"] + "?state=off";
        request.put(putOptions, function(err, res, body) {
          console.log("Repeat has been disabled");
          resolve();
        });
      } else {
        console.log("Something weird happened");
        reject();
      }
    });
  });
};

// WIP !!!!!!! This is not a priority
var firstSongOfPlaylist = function(token) {
  if (g === "g") {
    // Do all api calls
    var getOptions = {
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: { Authorization: "Bearer " + token },
      json: true
    };
    request.get(getOptions, function(err, res, body) {
      var putOptions = {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        json: true
      };
      if (body === null) {
        console.log("Body is null, don't throw exception");
      } else if ("error" in body) {
        console.log("An error has occured");
      } else {
        var playlist_id = body["context"]["uri"].split(":").pop();
        putOptions["url"] = "https://api.spotify.com/v1/me/player/pause";
        request.put(putOptions, function(err, res, body) {
          console.log("This worked.");
        });
      }
    });
    g = "";
  } else {
    g += "g";
  }
  console.log(g);
};

module.exports = triggerEndpoint;
