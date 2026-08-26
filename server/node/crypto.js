const { properties } = require("./properties");

const CryptoJS = require("crypto-js");

const appPassword = properties.appPassword;

function CryptoJSAesEncrypt(passphrase, plainText) {
  const salt = CryptoJS.lib.WordArray.random(256);
  const iv = CryptoJS.lib.WordArray.random(16);

  const key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  return JSON.stringify({
    ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    salt: CryptoJS.enc.Hex.stringify(salt),
    iv: CryptoJS.enc.Hex.stringify(iv),
  });
}

function CryptoJSAesDecrypt(passphrase, encryptedJsonString) {
  const jsondata = JSON.parse(encryptedJsonString);

  const salt = CryptoJS.enc.Hex.parse(jsondata.salt);
  const iv = CryptoJS.enc.Hex.parse(jsondata.iv);
  const key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

  const decrypted = CryptoJS.AES.decrypt(jsondata.ciphertext, key, { iv });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Same PBKDF2-HMAC-SHA512 (999 iterations) + AES-256-CBC scheme as server/php/crypto.php,
// server/java's CryptoService, and server/python's crypto.py — matches the frontend's
// encryptDataPhp/decryptDataPhp in web-app/src/utils/crypto.ts.
exports.encryptData = function (plainTextString) {
  return Buffer.from(CryptoJSAesEncrypt(appPassword, plainTextString)).toString("base64");
};

exports.decryptData = function (base64EnvelopeString) {
  return CryptoJSAesDecrypt(appPassword, Buffer.from(base64EnvelopeString, "base64").toString());
};
