import { applicationProperties } from "../ApplicationConstants";
import { decryptDataNode, decryptDataPhp, encryptDataNode, encryptDataPhp } from "../utils/crypto";

export const decryptData = (data) => {
  if (applicationProperties.serverMode === "node") {
    if (applicationProperties.enableEncryption) {
      return decryptDataNode(data.zjData);
    } else {
      return data.zjData;
    }
  } else if (applicationProperties.serverMode === "php") {
    const strData = data.ezjData;
    const decryptedData = JSON.parse(decryptDataPhp(strData));
    if (decryptedData) return decryptedData;
  }

  return data;
};

export const encryptOutData = (data) => {
  if (applicationProperties.serverMode === "php") {
    return { ezjData: encryptDataPhp(JSON.stringify(data)) };
  } else if (applicationProperties.serverMode === "node" && applicationProperties.enableEncryption) {
    return { ezjData: encryptDataNode(JSON.stringify(data)) };
  } else {
    return data;
  }
};
