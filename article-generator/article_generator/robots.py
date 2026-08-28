from functools import lru_cache
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

USER_AGENT = "ArticleGeneratorBot/0.1 (+personal journal aggregator)"


@lru_cache(maxsize=None)
def _parser_for(origin: str) -> RobotFileParser:
    rp = RobotFileParser()
    rp.set_url(f"{origin}/robots.txt")
    try:
        rp.read()
    except Exception:
        pass
    return rp


def allowed(url: str) -> bool:
    parsed = urlparse(url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    try:
        return _parser_for(origin).can_fetch(USER_AGENT, url)
    except Exception:
        return True
