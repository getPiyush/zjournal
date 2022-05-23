const process = require("process");
const { properties } = require("./properties");


const CryptoJS = require("crypto-js");
let sha512 = require("crypto-js/hmac-sha512");

const appPassword = properties.appPassword;



exports.encryptAES = function (stringData) {
  return CryptoJS.AES.encrypt(stringData, appPassword).toString();
};

exports.decryptDataNode = function (data) {
  const bytes = CryptoJS.AES.decrypt(data, appPassword);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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
