import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from article_generator.builder import build_article
from article_generator.categorize import categorize
from article_generator.category_map import count_invalid, load_categorized_websites, update_site_status
from article_generator.db_profile import DbProfile
from article_generator.dedupe import (
    extract_urls_from_articles_file,
    load_seen_urls,
    save_seen_urls,
)
from article_generator.ids import generate_id
from article_generator.pipeline import parse_websites
from article_generator.scraper import ArticleMeta


class ParseWebsitesTests(unittest.TestCase):
    def test_splits_on_commas_and_whitespace(self):
        raw = "https://a.com, b.com\nhttps://c.com  d.com"
        self.assertEqual(
            parse_websites(raw),
            ["https://a.com", "https://b.com", "https://c.com", "https://d.com"],
        )

    def test_empty_string_yields_no_websites(self):
        self.assertEqual(parse_websites("   "), [])


class CategorizeTests(unittest.TestCase):
    def test_matches_keyword_heavy_category(self):
        title = "NASA telescope spots new galaxy near distant star"
        content = "Astronomers used the orbiting telescope to observe the cosmic event."
        category = categorize(title, content, ["Space", "Art", "Medicine"], default="Art")
        self.assertEqual(category, "Space")

    def test_falls_back_when_no_keywords_match(self):
        category = categorize("Untitled", "", ["Space", "Art"], default="Art")
        self.assertEqual(category, "Art")


class IdsTests(unittest.TestCase):
    def test_generate_id_length_and_alphabet(self):
        generated = generate_id(15)
        self.assertEqual(len(generated), 15)
        self.assertTrue(generated.isalnum())
        self.assertEqual(generated, generated.lower())


class DbProfileTests(unittest.TestCase):
    def test_analyze_extracts_categories_and_authors(self):
        db = {
            "articles": [
                {"id": "a" * 15, "author": "Sara", "categryId": "Science"},
                {"id": "b" * 15, "author": "Sara", "categryId": "Science"},
                {"id": "c" * 15, "author": "Dev", "categryId": "Art"},
            ]
        }
        with tempfile.TemporaryDirectory() as tmp:
            db_path = Path(tmp) / "db.json"
            db_path.write_text(json.dumps(db))
            profile = DbProfile.analyze(db_path)

        self.assertEqual(profile.categories[0], "Science")
        self.assertEqual(profile.default_author, "Sara")
        self.assertEqual(profile.id_length, 15)

    def test_analyze_missing_file_returns_defaults(self):
        profile = DbProfile.analyze(Path("/nonexistent/db.json"))
        self.assertIsNone(profile.default_author)
        self.assertIn("Science", profile.categories)


class BuildArticleTests(unittest.TestCase):
    def test_content_ends_with_link_to_source(self):
        meta = ArticleMeta(
            url="https://example.com/some-article",
            title="Some Article",
            author=None,
            published_at=None,
            snippet="First few lines of the article.",
            image=None,
        )
        article = build_article(meta, category="Science", author="Fallback Author")

        self.assertEqual(article["author"], "Fallback Author")
        self.assertEqual(article["categryId"], "Science")
        paragraph = article["content"][-1]["data"]
        self.assertIn("First few lines of the article.", paragraph)
        self.assertIn(meta.url, paragraph)
        self.assertTrue(paragraph.strip().endswith(f'">{meta.url}</a>'))

    def test_detected_author_overrides_fallback(self):
        meta = ArticleMeta(
            url="https://example.com/a",
            title="A",
            author="Byline Author",
            published_at=None,
            snippet="",
            image=None,
        )
        article = build_article(meta, category="Art", author="Fallback")
        self.assertEqual(article["author"], "Byline Author")


class LoadCategorizedWebsitesTests(unittest.TestCase):
    def _write(self, tmp: str) -> Path:
        payload = {
            "categories": [
                {
                    "categoryId": "Space",
                    "websites": [
                        {"name": "A", "url": "https://a.example"},
                        {"name": "B", "url": "https://b.example"},
                    ],
                },
                {
                    "categoryId": "Art",
                    "websites": [{"name": "C", "url": "https://c.example"}],
                },
            ]
        }
        path = Path(tmp) / "sites.json"
        path.write_text(json.dumps(payload))
        return path

    def test_loads_all_sites_with_category(self):
        with tempfile.TemporaryDirectory() as tmp:
            sites = load_categorized_websites(self._write(tmp))
        self.assertEqual(len(sites), 3)
        self.assertEqual({s.category_id for s in sites}, {"Space", "Art"})

    def test_filters_by_category(self):
        with tempfile.TemporaryDirectory() as tmp:
            sites = load_categorized_websites(self._write(tmp), only_categories=["Art"])
        self.assertEqual([s.url for s in sites], ["https://c.example"])

    def test_caps_sites_per_category(self):
        with tempfile.TemporaryDirectory() as tmp:
            sites = load_categorized_websites(self._write(tmp), sites_per_category=1)
        space_sites = [s for s in sites if s.category_id == "Space"]
        self.assertEqual(len(space_sites), 1)


class DedupeTests(unittest.TestCase):
    def test_save_then_load_round_trips(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "seen.json"
            save_seen_urls(path, {"https://a.example/1", "https://b.example/2"})
            loaded = load_seen_urls(path)
        self.assertEqual(loaded, {"https://a.example/1", "https://b.example/2"})

    def test_load_missing_file_returns_empty_set(self):
        self.assertEqual(load_seen_urls(Path("/nonexistent/seen.json")), set())

    def test_extract_urls_from_articles_file_pulls_source_links(self):
        db = {
            "articles": [
                {
                    "content": [
                        {"componenType": "Image", "data": "https://img.example/pic.jpg"},
                        {
                            "componenType": "Paragraph",
                            "data": 'Snippet <a href="https://source.example/story-one">link</a>',
                        },
                    ]
                }
            ]
        }
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "db.json"
            path.write_text(json.dumps(db))
            urls = extract_urls_from_articles_file(path)
        self.assertEqual(urls, {"https://source.example/story-one"})

    def test_extract_urls_from_missing_file_returns_empty_set(self):
        self.assertEqual(extract_urls_from_articles_file(Path("/nonexistent/db.json")), set())


class RunDedupeTests(unittest.TestCase):
    def test_run_skips_urls_already_in_seen_set(self):
        import article_generator.pipeline as pipeline_module

        already_seen = {"https://site.example/old-story"}

        def fake_fetch(url, throttle=None):
            return "<html>homepage</html>", False

        def fake_extract_links(homepage_url, html, max_links):
            return ["https://site.example/old-story", "https://site.example/new-story"]

        def fake_process_article(url, profile, author, throttle, forced_category=None):
            return {"id": "x", "title": url}

        original_fetch = pipeline_module.fetch
        original_extract_links = pipeline_module.extract_article_links
        original_process = pipeline_module._process_article
        pipeline_module.fetch = fake_fetch
        pipeline_module.extract_article_links = fake_extract_links
        pipeline_module._process_article = fake_process_article
        try:
            result = pipeline_module.run(
                ["https://site.example"],
                DbProfile(),
                "Author",
                seen_urls=already_seen,
            )
        finally:
            pipeline_module.fetch = original_fetch
            pipeline_module.extract_article_links = original_extract_links
            pipeline_module._process_article = original_process

        self.assertEqual(len(result.articles), 1)
        self.assertEqual(result.articles[0]["title"], "https://site.example/new-story")
        self.assertIn("https://site.example/new-story", already_seen)
        self.assertEqual(result.valid_sites, {"https://site.example"})
        self.assertEqual(result.invalid_sites, set())

    def test_run_reports_non_navigable_homepage_as_invalid(self):
        import article_generator.pipeline as pipeline_module

        def fake_fetch(url, throttle=None):
            return None, True  # robots.txt disallowed / connection-level failure

        original_fetch = pipeline_module.fetch
        pipeline_module.fetch = fake_fetch
        try:
            result = pipeline_module.run(["https://unreachable.example"], DbProfile(), "Author")
        finally:
            pipeline_module.fetch = original_fetch

        self.assertEqual(result.articles, [])
        self.assertEqual(result.invalid_sites, {"https://unreachable.example"})
        self.assertEqual(result.valid_sites, set())

    def test_run_does_not_mark_transient_failure_as_invalid(self):
        """A generic HTTP error / timeout is likely anti-bot throttling, not a dead site —
        it must not get persisted as "invalid" off a single bad run."""
        import article_generator.pipeline as pipeline_module

        def fake_fetch(url, throttle=None):
            return None, False  # e.g. a 403/429/503 or a read timeout

        original_fetch = pipeline_module.fetch
        pipeline_module.fetch = fake_fetch
        try:
            result = pipeline_module.run(["https://flaky.example"], DbProfile(), "Author")
        finally:
            pipeline_module.fetch = original_fetch

        self.assertEqual(result.articles, [])
        self.assertEqual(result.invalid_sites, set())
        self.assertEqual(result.valid_sites, set())


class SiteStatusTests(unittest.TestCase):
    def _write(self, tmp: str) -> Path:
        payload = {
            "categories": [
                {
                    "categoryId": "Space",
                    "websites": [
                        {"name": "A", "url": "https://a.example"},
                        {"name": "B", "url": "https://b.example", "invalid": True},
                    ],
                }
            ]
        }
        path = Path(tmp) / "sites.json"
        path.write_text(json.dumps(payload))
        return path

    def test_marks_failed_site_invalid_and_persists(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp)
            changed = update_site_status(path, invalid_urls={"https://a.example"}, valid_urls=set())
            reloaded = json.loads(path.read_text())

        self.assertEqual(changed, 1)
        sites = reloaded["categories"][0]["websites"]
        self.assertTrue(next(s for s in sites if s["url"] == "https://a.example")["invalid"])

    def test_clears_invalid_flag_when_site_succeeds_again(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp)
            changed = update_site_status(path, invalid_urls=set(), valid_urls={"https://b.example"})
            reloaded = json.loads(path.read_text())

        self.assertEqual(changed, 1)
        sites = reloaded["categories"][0]["websites"]
        self.assertNotIn("invalid", next(s for s in sites if s["url"] == "https://b.example"))

    def test_no_op_leaves_file_untouched(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp)
            before = path.read_text()
            changed = update_site_status(path, invalid_urls=set(), valid_urls=set())
            after = path.read_text()

        self.assertEqual(changed, 0)
        self.assertEqual(before, after)

    def test_load_categorized_websites_skips_invalid_by_default(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp)
            sites = load_categorized_websites(path)
            with_invalid = load_categorized_websites(path, include_invalid=True)

        self.assertEqual([s.url for s in sites], ["https://a.example"])
        self.assertEqual({s.url for s in with_invalid}, {"https://a.example", "https://b.example"})

    def test_count_invalid(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp)
            self.assertEqual(count_invalid(path), 1)
            self.assertEqual(count_invalid(path, only_categories=["Nonexistent"]), 0)


if __name__ == "__main__":
    unittest.main()
