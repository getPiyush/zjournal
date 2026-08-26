"""Reimplements the CryptoJSAesEncrypt/CryptoJSAesDecrypt pair from server/php/crypto.php
(also reimplemented in server/java's CryptoService): PBKDF2-HMAC-SHA512 (999 iterations,
256-bit key) + AES-256-CBC, with a random 256-byte salt and 16-byte IV carried alongside the
ciphertext, the whole envelope base64-encoded once more.
"""

import base64
import json
import os

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app import config

_PBKDF2_ITERATIONS = 999
_KEY_LENGTH_BYTES = 32  # 256 bits
_SALT_LENGTH_BYTES = 256
_IV_LENGTH_BYTES = 16


def _derive_key(passphrase: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA512(),
        length=_KEY_LENGTH_BYTES,
        salt=salt,
        iterations=_PBKDF2_ITERATIONS,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def encrypt(plain_text: str, passphrase: str = config.APP_PASSWORD) -> str:
    salt = os.urandom(_SALT_LENGTH_BYTES)
    iv = os.urandom(_IV_LENGTH_BYTES)
    key = _derive_key(passphrase, salt)

    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded = padder.update(plain_text.encode("utf-8")) + padder.finalize()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()

    envelope = {
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
        "iv": iv.hex(),
        "salt": salt.hex(),
    }
    envelope_json = json.dumps(envelope)
    return base64.b64encode(envelope_json.encode("utf-8")).decode("ascii")


def decrypt(base64_envelope: str, passphrase: str = config.APP_PASSWORD) -> str:
    envelope_json = base64.b64decode(base64_envelope)
    envelope = json.loads(envelope_json)

    salt = bytes.fromhex(envelope["salt"])
    iv = bytes.fromhex(envelope["iv"])
    ciphertext = base64.b64decode(envelope["ciphertext"])

    key = _derive_key(passphrase, salt)

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    plain = unpadder.update(padded) + unpadder.finalize()
    return plain.decode("utf-8")
