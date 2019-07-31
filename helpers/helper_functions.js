var request = require("request");

function generateRandomString(length) {
  console.log("FROM THIS IMPORT, THIS STRING IS BEING PRINTED");
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42);
    }, 300);
  });
}

module.exports = {
  generateRandomString: generateRandomString,
  delay: delay
};
