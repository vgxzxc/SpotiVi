var express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request"),
  cors = require("cors"),
  querystring = require("querystring"),
  cookieParser = require("cookie-parser"),
  keypress = require("keypress"),
  path = require("path");

var app = express();
var routes = require("./helpers/endpoints");

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json());

app.use(routes);

console.log("Listening on port 8888");
app.listen(8888);
