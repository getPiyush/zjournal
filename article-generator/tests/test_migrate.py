import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from article_generator.migrate import build_template_data, merge_categories, migrate


def _article(id_, category, url, published=True, delete_flag=False):
    return {
        "id": id_,
        "author": "Someone",
        "title": f"Title {id_}",
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-01-01T00:00:00.000Z",
        "categryId": category,
        "content": [
            {
                "componentId": "c1",
                "componenType": "Paragraph",
                "data": f'Snippet <a href="{url}">link</a>',
                "numbered": False,
            }
        ],
        "origin": "server",
        "published": published,
        "deleteFlag": delete_flag,
    }


class MergeCategoriesTests(unittest.TestCase):
    def test_preserves_existing_order_and_appends_new_ones(self):
        existing = ["All", "Science", "Art"]
        articles = [
            _article("1", "Science", "https://a.example/1"),
            _article("2", "Technology", "https://a.example/2"),
        ]
        merged, added = merge_categories(existing, articles)
        self.assertEqual(merged, ["All", "Science", "Art", "Technology"])
        self.assertEqual(added, ["Technology"])

    def test_no_new_categories_when_all_already_present(self):
        existing = ["All", "Science"]
        articles = [_article("1", "Science", "https://a.example/1")]
        merged, added = merge_categories(existing, articles)
        self.assertEqual(merged, existing)
        self.assertEqual(added, [])

    def test_inserts_all_if_missing(self):
        merged, _ = merge_categories(["Science"], [])
        self.assertEqual(merged[0], "All")
        self.assertIn("Science", merged)


class BuildTemplateDataTests(unittest.TestCase):
    def test_shape_and_hero_row(self):
        articles = [_article(str(i), "Science", f"https://a.example/{i}") for i in range(10)]
        data = build_template_data(articles, shape=(1, 1, 2, 3))
        rows = data.split("\n")
        self.assertEqual(len(rows), 4)
        self.assertEqual(len(rows[0].split("|")), 1)
        self.assertEqual(len(rows[1].split("|")), 1)
        self.assertEqual(len(rows[2].split("|")), 2)
        self.assertEqual(len(rows[3].split("|")), 3)

    def test_no_duplicate_ids_when_enough_articles(self):
        articles = [_article(str(i), "Science", f"https://a.example/{i}") for i in range(10)]
        data = build_template_data(articles, shape=(1, 1, 2, 3))
        ids = [i for row in data.split("\n") for i in row.split("|")]
        self.assertEqual(len(ids), len(set(ids)))

    def test_excludes_unpublished_and_deleted_articles(self):
        articles = [
            _article("visible", "Science", "https://a.example/v", published=True),
            _article("hidden", "Science", "https://a.example/h", published=False),
            _article("deleted", "Science", "https://a.example/d", delete_flag=True),
        ]
        data = build_template_data(articles, shape=(1,))
        self.assertEqual(data, "visible")

    def test_empty_article_list_returns_empty_string(self):
        self.assertEqual(build_template_data([]), "")

    def test_deterministic_with_seed(self):
        import random

        articles = [_article(str(i), "Science", f"https://a.example/{i}") for i in range(10)]
        first = build_template_data(articles, shape=(1, 2), rng=random.Random(42))
        second = build_template_data(articles, shape=(1, 2), rng=random.Random(42))
        self.assertEqual(first, second)


class MigrateTests(unittest.TestCase):
    def test_skips_articles_already_present_by_url(self):
        db = {
            "articles": [_article("existing", "Science", "https://a.example/1")],
            "journal": {"categories": ["All", "Science"], "templateData": ""},
        }
        incoming = [
            _article("dup", "Science", "https://a.example/1"),  # same URL, different id
            _article("new", "Art", "https://a.example/2"),
        ]
        result = migrate(db, incoming, shape=(1,), seed=1)

        self.assertEqual(result.added, 1)
        self.assertEqual(result.skipped_duplicates, 1)
        self.assertEqual(len(db["articles"]), 2)
        self.assertEqual(result.new_categories, ["Art"])
        self.assertIn("Art", db["journal"]["categories"])

    def test_creates_journal_if_missing(self):
        db = {"articles": []}
        incoming = [_article("1", "Science", "https://a.example/1")]
        result = migrate(db, incoming, shape=(1,), seed=1)

        self.assertEqual(result.total_articles, 1)
        self.assertEqual(db["journal"]["categories"], ["All", "Science"])
        self.assertEqual(db["journal"]["templateData"], "1")

    def test_template_data_only_uses_post_merge_articles(self):
        db = {"articles": [], "journal": {}}
        incoming = [_article(str(i), "Science", f"https://a.example/{i}") for i in range(3)]
        result = migrate(db, incoming, shape=(1, 1), seed=7)

        picked = set(result.template_data.split("\n"))
        self.assertTrue(picked.issubset({"0", "1", "2"}))


if __name__ == "__main__":
    unittest.main()
