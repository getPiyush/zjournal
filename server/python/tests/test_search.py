"""Runs the shared cases in server/search_cases.json, which every backend's tests run too."""

import json
import unittest
from pathlib import Path

from app.search import search

CASES = json.loads((Path(__file__).resolve().parents[2] / "search_cases.json").read_text())


class SearchCasesTest(unittest.TestCase):
    def test_shared_cases(self):
        for case in CASES["cases"]:
            with self.subTest(case["name"]):
                result = search(CASES["articles"], case["params"], case["public"])
                self.assertEqual([a["id"] for a in result["items"]], case["ids"])
                self.assertEqual(result["total"], case["total"])
                if "page" in case:
                    self.assertEqual(result["page"], case["page"])
                if "limit" in case:
                    self.assertEqual(result["limit"], case["limit"])


if __name__ == "__main__":
    unittest.main()
