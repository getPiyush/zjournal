import * as CryptoJS from "crypto-js";
import { applicationProperties } from "../ApplicationConstants";

const { appPassword } = applicationProperties;

export const encryptDataPhp = (stringData: string) => btoa(CryptoJSAesEncrypt(appPassword, stringData));

export const decryptDataPhp = (stringData: string) => CryptoJSAesDecrypt(appPassword, atob(stringData));

function CryptoJSAesDecrypt(passphrase: string, encrypted_json_string: string) {
  const obj_json = JSON.parse(encrypted_json_string);

  const encrypted = obj_json.ciphertext;
  const salt = CryptoJS.enc.Hex.parse(obj_json.salt);
  const iv = CryptoJS.enc.Hex.parse(obj_json.iv);

  const key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

function CryptoJSAesEncrypt(passphrase: string, plain_text: string) {
  const salt = CryptoJS.lib.WordArray.random(256);
  const iv = CryptoJS.lib.WordArray.random(16);

  const key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

  const encrypted = CryptoJS.AES.encrypt(plain_text, key, { iv });

  const data = {
    ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    salt: CryptoJS.enc.Hex.stringify(salt),
    iv: CryptoJS.enc.Hex.stringify(iv),
  };

  return JSON.stringify(data);
}
