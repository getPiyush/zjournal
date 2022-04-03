const process = require("process");

const CryptoJS = require("crypto-js");
let sha512 = require("crypto-js/hmac-sha512");

const appPassword = "JagaBaliaShreekhetra";

exports.encryptAES = function (stringData) {
  return CryptoJS.AES.encrypt(stringData, appPassword).toString();
};

exports.getPassPhase = function () {
  const date = new Date();
  const message =
    date.getUTCHours() +
    "$" +
    date.getUTCDate() +
    "$" +
    date.getUTCMinutes() +
    "$" +
    date.getUTCDay();
  return sha512(message, appPassword).toString();
};
