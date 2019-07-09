var express      = require('express'),
    request      = require('request');

var triggerEndpoint = function(key, token){
    switch(key){
        case ' ':
            playPause(token);
            break;
        case 'l':
            skipForward(token);
            break;
        case 'h':
            goBack(token);
            break;
        case 's':
            toggleShuffle(token);
            break;
        case 'r':
            toggleRepeat(token);
            break;
    }
};

var playPause = function(token){
    var getOptions = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: {'Authorization': 'Bearer ' + token},
        json: true
    };
    request.get(getOptions, function(err, res, body){
        var putOptions = {
          headers: { 'Authorization': 'Bearer ' + token,
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                     },
          json: true
        };
        if (body["is_playing"] == true){
            putOptions['url'] = "https://api.spotify.com/v1/me/player/pause"
            request.put(putOptions, function(err, res, body){
                console.log("This worked.");
            });
        }
        else if (body["is_playing"] == false){
            putOptions['url'] = "https://api.spotify.com/v1/me/player/play"
            request.put(putOptions, function(err, res, body){
                console.log("This NOW worked.");
            });
        }
        else {
            console.log(body)
            console.log(err);
            console.log("The else happens");
        }
    });
};

var skipForward = function(token){
    var options = {
      url: "https://api.spotify.com/v1/me/player/next",
      headers: { 'Authorization': 'Bearer ' + token
                //  'Accept': 'application/json',
                //  'Content-Type': 'application/json'
                 },
      json: true
    };
    request.post(options, function(err, res, body){
        console.log("I have skipped to the next track");
    });
};

var goBack = function(token){
    var getOptions = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: {'Authorization': 'Bearer ' + token},
        json: true
    };
    request.get(getOptions, function(err, res, body){
        var options = {
          headers: { 'Authorization': 'Bearer ' + token,
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                     },
          json: true
        };
        console.log(body["progress_ms"]);
        if (body["progress_ms"] < 3000){
            options['url'] = "https://api.spotify.com/v1/me/player/previous"
            request.post(options, function(err, res, body){
                console.log("I have gone to the previous track");
            });
        }
        else {
            options['url'] = "https://api.spotify.com/v1/me/player/seek?position_ms=0"
            request.put(options, function(err, res, body){
                console.log("I have started at the beginning of this track")
            });
        }
    });
};

var toggleShuffle = function(token){
    var getOptions = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: {'Authorization': 'Bearer ' + token},
        json: true
    };
    request.get(getOptions, function(err, res, body){
        var putOptions = {
          url: "https://api.spotify.com/v1/me/player/shuffle",
          headers: { 'Authorization': 'Bearer ' + token,
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                     },
          json: true
        };
        console.log(body["shuffle_state"]);
        if (body["shuffle_state"] == true){
            putOptions['url'] = putOptions['url'] + '?state=false';
            request.put(putOptions, function(err, res, body){
                console.log("I have disabled the shuffle");
            });
        }
        else if (body["shuffle_state"] == false){
            putOptions['url'] = putOptions['url'] + '?state=true';
            request.put(putOptions, function(err, res, body){
                console.log("I have enabled the shuffle");
            });
        }
        else {
            console.log(body)
            console.log(err);
            console.log("The else happens");
        }
    });
};

var toggleRepeat = function(token){
    var getOptions = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: {'Authorization': 'Bearer ' + token},
        json: true
    };
    request.get(getOptions, function(err, res, body){
        var putOptions = {
          url: "https://api.spotify.com/v1/me/player/repeat",
          headers: { 'Authorization': 'Bearer ' + token,
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                     },
          json: true
        };
        if (body["repeat_state"] == 'off'){
            putOptions['url'] = putOptions['url'] + '?state=context';
            request.put(putOptions, function(err, res, body){
                console.log("I have enabled context repeat");
            });
        }
        else if (body["repeat_state"] == 'context'){
            putOptions['url'] = putOptions['url'] + '?state=track';
            request.put(putOptions, function(err, res, body){
                console.log("I have enabled track repeat");
            });
        }
        else if (body["repeat_state"] == 'track'){
            putOptions['url'] = putOptions['url'] + '?state=off';
            request.put(putOptions, function(err, res, body){
                console.log("I have disabled repeat");
            });
        }
        else {
            console.log(body)
            console.log(err);
            console.log("The else happens");
        }
    });
};

module.exports = triggerEndpoint;
