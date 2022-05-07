import HmacSHA1 from 'crypto-js/hmac-sha512';
import * as CryptoJS from "crypto-js";
import { applicationProperties } from "../ApplicationConstants";

const { appPassword } = applicationProperties;

export const decryptData = (data) => {

  /*
  if (process.env.NODE_ENV === "production") {
    const bytes = CryptoJS.AES.decrypt(data, appPassword);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
*/
  return data;
};

export const encryptAES = (stringData) => {
  return CryptoJS.AES.encrypt(stringData, appPassword).toString();
};

export const encryptAESFull = (stringData) => {
  return CryptoJS.AES.encrypt(stringData, appPassword);
};

export const encryptAESZeroPadding = (stringData) => CryptoJSAesEncrypt(appPassword,stringData);

export const encryptString = (data) => HmacSHA1(data, appPassword).toString();

export const getPassPhase = () => {
  const date = new Date();
  const message = date.getUTCHours() + "$" + date.getUTCDate() + "$" + date.getUTCMinutes() + "$" + date.getUTCDay();
  // // console.log("Client passphase ", message);
  return HmacSHA1(message, appPassword);
}

function CryptoJSAesDecrypt(passphrase,encrypted_json_string){

  var obj_json = JSON.parse(encrypted_json_string);

  var encrypted = obj_json.ciphertext;
  var salt = CryptoJS.enc.Hex.parse(obj_json.salt);
  var iv = CryptoJS.enc.Hex.parse(obj_json.iv);   

  var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999});


  var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv});

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// console.log(CryptoJSAesDecrypt('your passphrase','<?php echo $string_json_fromPHP?>'));

function CryptoJSAesEncrypt(passphrase, plain_text){

  var salt = CryptoJS.lib.WordArray.random(256);
  var iv = CryptoJS.lib.WordArray.random(16);
  //for more random entropy can use : https://github.com/wwwtyro/cryptico/blob/master/random.js instead CryptoJS random() or another js PRNG

  var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999 });

  var encrypted = CryptoJS.AES.encrypt(plain_text, key, {iv: iv});

  var data = {
      ciphertext : CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
      salt : CryptoJS.enc.Hex.stringify(salt),
      iv : CryptoJS.enc.Hex.stringify(iv)    
  }

  return JSON.stringify(data);
}