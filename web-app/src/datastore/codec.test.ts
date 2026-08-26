jest.mock("../utils/crypto", () => ({
  decryptDataPhp: jest.fn(),
  encryptDataPhp: jest.fn(),
}));

import { decryptData, encryptOutData } from "./codec";
import { decryptDataPhp, encryptDataPhp } from "../utils/crypto";

const mockedDecryptDataPhp = decryptDataPhp as jest.Mock;
const mockedEncryptDataPhp = encryptDataPhp as jest.Mock;

describe("decryptData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("decrypts and JSON-parses the ezjData field", () => {
    mockedDecryptDataPhp.mockReturnValue(JSON.stringify({ id: "from-server" }));

    const data = { ezjData: "cipher-text" };
    expect(decryptData(data)).toEqual({ id: "from-server" });
    expect(mockedDecryptDataPhp).toHaveBeenCalledWith("cipher-text");
  });
});

describe("encryptOutData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("wraps the JSON-encrypted payload in ezjData", () => {
    mockedEncryptDataPhp.mockReturnValue("cipher-text");

    const data = { id: "1" };
    expect(encryptOutData(data)).toEqual({ ezjData: "cipher-text" });
    expect(mockedEncryptDataPhp).toHaveBeenCalledWith(JSON.stringify(data));
  });
});
