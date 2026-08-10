import * as CryptoJS from "crypto-js";

import {
  encryptAES,
  decryptDataNode,
  encryptDataNode,
  encryptDataPhp,
  decryptDataPhp,
  encryptString,
  getPassPhase,
} from "./crypto";
import { applicationProperties } from "../ApplicationConstants";

const { appPassword } = applicationProperties;

describe("encryptAES / decryptDataNode", () => {
  test("round-trips a JSON payload", () => {
    const payload = { id: "1", title: "Test Article" };
    const ciphertext = encryptAES(JSON.stringify(payload));

    expect(decryptDataNode(ciphertext)).toEqual(payload);
  });

  test("produces different ciphertext for different plaintext", () => {
    expect(encryptAES(JSON.stringify({ a: 1 }))).not.toEqual(
      encryptAES(JSON.stringify({ a: 2 }))
    );
  });
});

describe("encryptDataNode", () => {
  test("base64-encodes an AES ciphertext decryptable with the app password", () => {
    const plainText = "hello world";
    const encoded = encryptDataNode(plainText);

    const ciphertext = atob(encoded);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, appPassword).toString(
      CryptoJS.enc.Utf8
    );

    expect(decrypted).toBe(plainText);
  });
});

describe("encryptDataPhp / decryptDataPhp", () => {
  test("round-trips a JSON payload through PBKDF2-derived AES", () => {
    const payload = { name: "Ada Lovelace", email: "ada@example.com" };
    const encrypted = encryptDataPhp(JSON.stringify(payload));

    expect(JSON.parse(decryptDataPhp(encrypted))).toEqual(payload);
  });

  test("uses a random salt/iv so repeated encryptions of the same data differ", () => {
    const plainText = JSON.stringify({ a: 1 });
    expect(encryptDataPhp(plainText)).not.toEqual(encryptDataPhp(plainText));
  });
});

describe("encryptString", () => {
  test("returns a deterministic hex HMAC for the same input", () => {
    const first = encryptString("some-data");
    const second = encryptString("some-data");

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]+$/i);
  });

  test("returns a different digest for different input", () => {
    expect(encryptString("some-data")).not.toBe(encryptString("other-data"));
  });
});

describe("getPassPhase", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-06-15T10:23:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("is deterministic within the same minute", () => {
    expect(getPassPhase()).toBe(getPassPhase());
  });

  test("changes when the minute changes", () => {
    const first = getPassPhase();
    jest.setSystemTime(new Date("2024-06-15T10:24:00Z"));
    expect(getPassPhase()).not.toBe(first);
  });
});
