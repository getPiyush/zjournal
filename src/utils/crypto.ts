import HmacSHA1 from 'crypto-js/hmac-sha512';
import * as CryptoJS from "crypto-js";
import { applicationProperties } from "../ApplicationConstants";

const { appPassword } = applicationProperties;

export const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, appPassword);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const encryptAES = (stringData) => {
  return CryptoJS.AES.encrypt(stringData, appPassword).toString();
};

export const encryptString = (data) => HmacSHA1(data, appPassword).toString();

export const getPassPhase = () => {
  const date = new Date();
  const message = date.getUTCHours() + "$" + date.getUTCDate() + "$" + date.getUTCMinutes() + "$" + date.getUTCDay();
  // // console.log("Client passphase ", message);
  return HmacSHA1(message, appPassword);
}