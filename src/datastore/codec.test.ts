jest.mock("../ApplicationConstants", () => ({
  applicationProperties: {
    serverMode: "node",
    enableEncryption: false,
  },
}));

jest.mock("../utils/crypto", () => ({
  decryptDataNode: jest.fn(),
  decryptDataPhp: jest.fn(),
  encryptDataNode: jest.fn(),
  encryptDataPhp: jest.fn(),
}));

import { decryptData, encryptOutData } from "./codec";
import { applicationProperties } from "../ApplicationConstants";
import {
  decryptDataNode,
  decryptDataPhp,
  encryptDataNode,
  encryptDataPhp,
} from "../utils/crypto";

const mockedDecryptDataNode = decryptDataNode as jest.Mock;
const mockedDecryptDataPhp = decryptDataPhp as jest.Mock;
const mockedEncryptDataNode = encryptDataNode as jest.Mock;
const mockedEncryptDataPhp = encryptDataPhp as jest.Mock;

describe("decryptData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("node mode without encryption returns the raw zjData field", () => {
    applicationProperties.serverMode = "node";
    applicationProperties.enableEncryption = false;

    const data = { zjData: { id: "1" } };
    expect(decryptData(data)).toBe(data.zjData);
    expect(mockedDecryptDataNode).not.toHaveBeenCalled();
  });

  test("node mode with encryption decrypts the zjData field", () => {
    applicationProperties.serverMode = "node";
    applicationProperties.enableEncryption = true;
    mockedDecryptDataNode.mockReturnValue({ id: "decrypted" });

    const data = { zjData: "cipher-text" };
    expect(decryptData(data)).toEqual({ id: "decrypted" });
    expect(mockedDecryptDataNode).toHaveBeenCalledWith("cipher-text");
  });

  test("php mode decrypts and JSON-parses the ezjData field", () => {
    applicationProperties.serverMode = "php";
    mockedDecryptDataPhp.mockReturnValue(JSON.stringify({ id: "from-php" }));

    const data = { ezjData: "cipher-text" };
    expect(decryptData(data)).toEqual({ id: "from-php" });
    expect(mockedDecryptDataPhp).toHaveBeenCalledWith("cipher-text");
  });

  test("falls back to returning the input unchanged for an unknown server mode", () => {
    // @ts-expect-error intentionally exercising the fallback branch
    applicationProperties.serverMode = "unknown";

    const data = { some: "payload" };
    expect(decryptData(data)).toBe(data);
  });
});

describe("encryptOutData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("php mode wraps the JSON-encrypted payload in ezjData", () => {
    applicationProperties.serverMode = "php";
    mockedEncryptDataPhp.mockReturnValue("php-cipher-text");

    const data = { id: "1" };
    expect(encryptOutData(data)).toEqual({ ezjData: "php-cipher-text" });
    expect(mockedEncryptDataPhp).toHaveBeenCalledWith(JSON.stringify(data));
  });

  test("node mode with encryption wraps the JSON-encrypted payload in ezjData", () => {
    applicationProperties.serverMode = "node";
    applicationProperties.enableEncryption = true;
    mockedEncryptDataNode.mockReturnValue("node-cipher-text");

    const data = { id: "1" };
    expect(encryptOutData(data)).toEqual({ ezjData: "node-cipher-text" });
    expect(mockedEncryptDataNode).toHaveBeenCalledWith(JSON.stringify(data));
  });

  test("node mode without encryption returns the payload unchanged", () => {
    applicationProperties.serverMode = "node";
    applicationProperties.enableEncryption = false;

    const data = { id: "1" };
    expect(encryptOutData(data)).toBe(data);
    expect(mockedEncryptDataNode).not.toHaveBeenCalled();
  });
});
