import * as CryptoJS from "crypto-js";
const appPassword = "JagaBaliaShreekhetra";

export const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, appPassword);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};