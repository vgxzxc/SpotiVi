var request = require("request");

var getRefreshToken = function(refresh_token, client_id, client_secret) {
  console.log("First of all, this FUCKING shit happens");

  var newToken = null;

  var authOptions = {
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
  // request.post(authOptions, function(err, response, body) {
  //   console.log("The request in refresh_token happens");
  //   if (response.statusCode === 200 && !err) {
  //     console.log("The 200 happens");
  //     newToken = body.access_token;
  //   } else {
  //     console.log("Nah bro there's an error");
  //   }
  // });
};

module.exports = getRefreshToken;
