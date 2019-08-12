const request = require("request");

getCurrentPlayerState = access_token => {
  const getOptions = {
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

playerState = access_token => {
  let getPlayerStateInfo = getCurrentPlayerState(access_token);

  getPlayerStateInfo.then(result => {
    return new Promise((resolve, reject) => {
      let info = {
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

      resolve(info);
    });
  });
};

module.exports = playerState;
