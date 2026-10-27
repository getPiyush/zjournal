"""Run with: npm run test:server:python (from the repo root), or `.venv/bin/python -m unittest`
from server/python."""

import unittest

from app.auth import (
    AuthError,
    auth_middleware_options,
    authenticate,
    is_public_article,
    public_journal,
    requires_admin,
)

ADMINS = ["admin@example.com"]


def fake_verify(token):
    payloads = {
        "admin-token": {"email": "Admin@Example.com", "email_verified": True},
        "stranger-token": {"email": "someone@example.com", "email_verified": True},
        "unverified-token": {"email": "admin@example.com", "email_verified": False},
    }
    if token not in payloads:
        raise ValueError("bad token")
    return payloads[token]


class RequiresAdminTest(unittest.TestCase):
    def test_public_reads_and_contact_form(self):
        for method, path in [
            ("GET", "/"),
            ("GET", "/health"),
            ("GET", "/articles"),
            ("GET", "/articles/42"),
            ("GET", "/journal"),
            ("GET", "/qna"),
            ("GET", "/docs"),
            ("POST", "/contacts"),
            ("OPTIONS", "/articles/42"),
        ]:
            self.assertFalse(requires_admin(method, path), f"{method} {path}")

    def test_writes_contact_reads_and_unknown_routes(self):
        for method, path in [
            ("POST", "/articles"),
            ("PUT", "/articles/42"),
            ("DELETE", "/articles/42"),
            ("PUT", "/journal"),
            ("POST", "/qna"),
            ("DELETE", "/qna/1"),
            ("GET", "/contacts"),
            ("GET", "/contacts/1"),
            ("DELETE", "/contacts/1"),
            ("GET", "/db"),
        ]:
            self.assertTrue(requires_admin(method, path), f"{method} {path}")

    def test_ignores_case_and_repeated_slashes(self):
        self.assertTrue(requires_admin("GET", "/Contacts"))
        self.assertTrue(requires_admin("GET", "//contacts"))


class AuthenticateTest(unittest.TestCase):
    def assert_rejected(self, authorization, status):
        with self.assertRaises(AuthError) as ctx:
            authenticate(authorization, fake_verify, ADMINS)
        self.assertEqual(ctx.exception.status, status)

    def test_missing_token(self):
        self.assert_rejected(None, 401)
        self.assert_rejected("Basic abc", 401)

    def test_invalid_token(self):
        self.assert_rejected("Bearer garbage", 401)

    def test_non_admin_and_unverified_accounts(self):
        self.assert_rejected("Bearer stranger-token", 403)
        self.assert_rejected("Bearer unverified-token", 403)

    def test_admin_matched_case_insensitively(self):
        self.assertEqual(authenticate("Bearer admin-token", fake_verify, ADMINS), "admin@example.com")


class AuthMiddlewareOptionsTest(unittest.TestCase):
    def test_disabled_in_development_when_unconfigured(self):
        with self.assertLogs("zjournal.auth", level="WARNING"):
            self.assertIsNone(auth_middleware_options("", [], development=True))

    def test_refuses_production_when_unconfigured(self):
        with self.assertRaisesRegex(RuntimeError, "ZJOURNAL_ADMIN_EMAILS"):
            auth_middleware_options("client-id", [], development=False)

    def test_enabled_when_configured(self):
        options = auth_middleware_options("client-id", ADMINS, development=False)
        self.assertEqual(options["admin_emails"], ADMINS)
        self.assertTrue(callable(options["verify_token"]))


class PublicViewTest(unittest.TestCase):
    def test_only_published_non_flagged_articles_are_public(self):
        self.assertTrue(is_public_article({"published": True, "deleteFlag": False}))
        self.assertTrue(is_public_article({"published": True}))
        self.assertFalse(is_public_article({"published": False}))
        self.assertFalse(is_public_article({"deleteFlag": False}))
        self.assertFalse(is_public_article({"published": True, "deleteFlag": True}))
        self.assertFalse(is_public_article(None))

    def test_public_journal_drops_private_fields_without_touching_the_original(self):
        journal = {"title": "J", "currentArticle": {"id": "draft"}, "adminDetails": {"id": "x"}}
        self.assertEqual(public_journal(journal), {"title": "J"})
        self.assertIn("adminDetails", journal)


if __name__ == "__main__":
    unittest.main()
