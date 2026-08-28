import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from article_generator.sync_db import KNOWN_BACKENDS, main, resolve_db_path, sync_articles_into


class ResolveDbPathTests(unittest.TestCase):
    def test_known_backend_resolves_under_server_dir(self):
        for backend in KNOWN_BACKENDS:
            path = resolve_db_path(backend)
            self.assertEqual(path.name, "db.json")
            self.assertEqual(path.parent.name, backend)
            self.assertEqual(path.parent.parent.name, "server")

    def test_arbitrary_path_passes_through(self):
        self.assertEqual(resolve_db_path("/tmp/custom/db.json"), Path("/tmp/custom/db.json"))


class SyncArticlesIntoTests(unittest.TestCase):
    def test_replaces_articles_and_reports_change(self):
        target = {"articles": [{"id": "old"}], "journal": {"title": "keep me"}}
        changed = sync_articles_into(target, [{"id": "new"}])
        self.assertTrue(changed)
        self.assertEqual(target["articles"], [{"id": "new"}])
        self.assertEqual(target["journal"], {"title": "keep me"})

    def test_no_change_when_already_identical(self):
        target = {"articles": [{"id": "a"}]}
        changed = sync_articles_into(target, [{"id": "a"}])
        self.assertFalse(changed)
        self.assertEqual(target["articles"], [{"id": "a"}])


class SyncDbMainTests(unittest.TestCase):
    def _write(self, tmp: str, name: str, articles, extra=None) -> Path:
        payload = {"articles": articles, "journal": extra or {"title": f"{name} journal"}}
        path = Path(tmp) / f"{name}.json"
        path.write_text(json.dumps(payload))
        return path

    def test_syncs_articles_leaves_journal_untouched(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = self._write(tmp, "source", [{"id": "1"}, {"id": "2"}])
            target = self._write(tmp, "target", [{"id": "1"}], extra={"title": "target-specific"})

            exit_code = main(["--source", str(source), "--targets", str(target)])

            reloaded = json.loads(target.read_text())

        self.assertEqual(exit_code, 0)
        self.assertEqual(reloaded["articles"], [{"id": "1"}, {"id": "2"}])
        self.assertEqual(reloaded["journal"], {"title": "target-specific"})

    def test_dry_run_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = self._write(tmp, "source", [{"id": "1"}, {"id": "2"}])
            target = self._write(tmp, "target", [{"id": "1"}])
            before = target.read_text()

            main(["--source", str(source), "--targets", str(target), "--dry-run"])

            after = target.read_text()

        self.assertEqual(before, after)

    def test_skips_target_that_is_same_file_as_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = self._write(tmp, "source", [{"id": "1"}])
            exit_code = main(["--source", str(source), "--targets", str(source)])
        self.assertEqual(exit_code, 0)

    def test_missing_target_reports_error_but_continues(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = self._write(tmp, "source", [{"id": "1"}])
            missing = Path(tmp) / "missing.json"
            ok_target = self._write(tmp, "target", [])

            exit_code = main(["--source", str(source), "--targets", str(missing), str(ok_target)])

            reloaded = json.loads(ok_target.read_text())

        self.assertEqual(exit_code, 1)
        self.assertEqual(reloaded["articles"], [{"id": "1"}])

    def test_missing_source_returns_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            exit_code = main(["--source", str(Path(tmp) / "nonexistent.json")])
        self.assertEqual(exit_code, 1)


if __name__ == "__main__":
    unittest.main()
