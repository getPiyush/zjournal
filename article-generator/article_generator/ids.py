import secrets
import string

_ALPHABET = string.ascii_lowercase + string.digits


def generate_id(length: int = 15) -> str:
    """Lowercase alphanumeric id in the same style as the ids already in db.json."""
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))
