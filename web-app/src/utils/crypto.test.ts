import {
  encryptDataPhp,
  decryptDataPhp,
  encryptString,
} from "./crypto";

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
