let request = require("request");

let getCurrentPlayerState = access_token => {
  let getOptions = {
    url: "https://api.spotify.com/v1/me/player/",
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(getOptions, (err, response, body) => {
      if (response.statusCode === 200 && !err) {
        if (body !== null) {
          let info = {
            shuffle: null,
            repeat: null,
            playing: null,
            songName: null,
            songArtists: [],
            songAlbum: null,
            songImageURL: null,
            device_id: null
          };

          info["device_id"] = body["device"]["id"];
          info["shuffle"] = body["shuffle_state"];
          info["repeat"] = body["repeat_state"];
          info["playing"] = body["is_playing"];

          info["songName"] = body["item"]["name"];
          body["item"]["artists"].forEach(item => {
            info["songArtists"].push(item["name"]);
          });
          info["songAlbum"] = body["item"]["album"]["name"];
          info["songImageURL"] = body["item"]["album"]["images"][0]["url"];
          resolve(info)
        } else {
          reject(err)
        }
      } else {
        reject(err);
      }
    });
  });
};

let generateRandomString = length => {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

let delay = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42);
    }, 150);
  });
}

let getRefreshToken = (refresh_token, client_id, client_secret) => {
  console.log("First of all, this FUCKING shit happens");

  let newToken = null;

  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64")
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token
    },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.post(authOptions, function(err, response, body) {
      console.log("The request in refresh_token happens");
      if (response.statusCode === 200 && !err) {
        console.log("The 200 happens");
        resolve(body.access_token);
      } else {
        console.log("In the promise, the rejection happens");
        console.log(body);
        reject(err);
      }
    });
  });
};


module.exports = {
  getCurrentPlayerState: getCurrentPlayerState,
  generateRandomString: generateRandomString,
  delay: delay,
  refreshTokenFunc: getRefreshToken
};
