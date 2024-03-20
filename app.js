const express      = require("express"),
      bodyParser   = require("body-parser"),
      request      = require("request"),
      cors         = require("cors"),
      querystring  = require("querystring"),
      cookieParser = require("cookie-parser"),
      keypress     = require("keypress"),
      path         = require("path");

const app = express();
const routes = require("./helpers/endpoints");

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json());

app.use(routes);

app.listen(7900, () => { console.log("Listening on port 7900") });
