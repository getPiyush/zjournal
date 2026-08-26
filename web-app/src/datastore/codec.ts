import { decryptDataPhp, encryptDataPhp } from "../utils/crypto";

export const decryptData = (data) => {
  return JSON.parse(decryptDataPhp(data.ezjData));
};

export const encryptOutData = (data) => {
  return { ezjData: encryptDataPhp(JSON.stringify(data)) };
};
