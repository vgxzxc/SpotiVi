var express      = require('express'),
    request      = require('request');

var triggerEndpoint = function(key, token){
    //var options = {
    //  headers: { 'Authorization': 'Bearer ' + token,
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //             },
    //  json: true
    //};
    console.log("This function was triggered");

    switch(key){
        case ' ':
            playPause(token);
            break
        case 'l':
            skipForward(token);
    }
};

var playPause = function(token){
    var getOptions = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: {'Authorization': 'Bearer ' + token},
        json: true
    };
    var playing = 20;
    request.get(getOptions, function(err, res, body){
        var options = {
          headers: { 'Authorization': 'Bearer ' + token,
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                     },
          json: true
        };
        if (body["is_playing"] == true){
            
        }
        else if (body["is_playing"] == false){
            console.log("False");
        }
        else {
            console.log("The else happens");
        }
    });
};

module.exports = triggerEndpoint;