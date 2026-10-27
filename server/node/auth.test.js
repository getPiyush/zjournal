// Run with: npm run test:server:node (from the repo root)
const test = require("node:test");
const assert = require("node:assert/strict");
const { requiresAdmin, isPublicArticle, publicView, createAuthMiddleware, buildAuthMiddleware } = require("./auth");

const fakeReq = (method, path, authorization) => ({
  method,
  path,
  get: (name) => (name.toLowerCase() === "authorization" ? authorization : undefined),
});

const fakeRes = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
};

// Resolves to "next" if the middleware let the request through, otherwise to the response.
const run = async (middleware, req) => {
  const res = fakeRes();
  let passed = false;
  await middleware(req, res, () => (passed = true));
  return passed ? "next" : res;
};

const verifyToken = async (token) => {
  if (token === "admin-token") return { email: "Admin@Example.com", email_verified: true };
  if (token === "stranger-token") return { email: "someone@example.com", email_verified: true };
  if (token === "unverified-token") return { email: "admin@example.com", email_verified: false };
  throw new Error("bad token");
};

const middleware = createAuthMiddleware({ adminEmails: ["admin@example.com"], verifyToken });

test("public reads and the contact form need no sign-in", () => {
  assert.equal(requiresAdmin("GET", "/articles"), false);
  assert.equal(requiresAdmin("GET", "/articles/42"), false);
  assert.equal(requiresAdmin("GET", "/journal"), false);
  assert.equal(requiresAdmin("GET", "/qna"), false);
  assert.equal(requiresAdmin("POST", "/contacts"), false);
  assert.equal(requiresAdmin("OPTIONS", "/articles/42"), false);
});

test("writes, contact reads and unknown routes need an admin", () => {
  assert.equal(requiresAdmin("POST", "/articles"), true);
  assert.equal(requiresAdmin("PUT", "/articles/42"), true);
  assert.equal(requiresAdmin("PATCH", "/articles/42"), true);
  assert.equal(requiresAdmin("DELETE", "/articles/42"), true);
  assert.equal(requiresAdmin("PUT", "/journal"), true);
  assert.equal(requiresAdmin("POST", "/qna"), true);
  assert.equal(requiresAdmin("DELETE", "/qna/1"), true);
  assert.equal(requiresAdmin("GET", "/contacts"), true);
  assert.equal(requiresAdmin("DELETE", "/contacts/1"), true);
  assert.equal(requiresAdmin("GET", "/db"), true);
});

test("route matching ignores case and repeated slashes, like Express does", () => {
  assert.equal(requiresAdmin("GET", "/Contacts"), true);
  assert.equal(requiresAdmin("GET", "//contacts"), true);
  assert.equal(requiresAdmin("DELETE", "/ARTICLES/1"), true);
});

test("public requests pass straight through", async () => {
  assert.equal(await run(middleware, fakeReq("GET", "/articles")), "next");
});

test("rejects a protected request with no token with 401", async () => {
  const res = await run(middleware, fakeReq("PUT", "/journal"));
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error.code, "UNAUTHORIZED");
});

test("rejects an invalid token with 401", async () => {
  const res = await run(middleware, fakeReq("PUT", "/journal", "Bearer garbage"));
  assert.equal(res.statusCode, 401);
});

test("rejects a valid token for a non-admin account with 403", async () => {
  const res = await run(middleware, fakeReq("PUT", "/journal", "Bearer stranger-token"));
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error.code, "FORBIDDEN");
});

test("rejects an admin email that Google hasn't verified with 403", async () => {
  const res = await run(middleware, fakeReq("PUT", "/journal", "Bearer unverified-token"));
  assert.equal(res.statusCode, 403);
});

test("lets an allowlisted admin through, matching email case-insensitively", async () => {
  const req = fakeReq("DELETE", "/articles/42", "Bearer admin-token");
  assert.equal(await run(middleware, req), "next");
  assert.equal(req.adminEmail, "admin@example.com");
});

test("buildAuthMiddleware: disabled with a warning in development when unconfigured", () => {
  const warnings = [];
  const result = buildAuthMiddleware(
    { googleClientId: "", adminEmails: [] },
    { production: false, log: { warn: (msg) => warnings.push(msg) } }
  );
  assert.equal(result, null);
  assert.equal(warnings.length, 1);
});

test("buildAuthMiddleware: refuses to run in production when unconfigured", () => {
  assert.throws(
    () => buildAuthMiddleware({ googleClientId: "id", adminEmails: [] }, { production: true }),
    /ZJOURNAL_ADMIN_EMAILS/
  );
});

test("buildAuthMiddleware: enabled when configured", () => {
  const result = buildAuthMiddleware(
    { googleClientId: "id.apps.googleusercontent.com", adminEmails: ["admin@example.com"] },
    { production: true }
  );
  assert.equal(typeof result, "function");
});

test("only published, non-flagged articles are public", () => {
  assert.equal(isPublicArticle({ published: true, deleteFlag: false }), true);
  assert.equal(isPublicArticle({ published: true }), true);
  assert.equal(isPublicArticle({ published: false, deleteFlag: false }), false);
  assert.equal(isPublicArticle({ deleteFlag: false }), false);
  assert.equal(isPublicArticle({ published: true, deleteFlag: true }), false);
  assert.equal(isPublicArticle(null), false);
});

test("publicView filters article lists and hides unpublished single articles", () => {
  const list = [
    { id: "a", published: true, deleteFlag: false },
    { id: "draft", published: false, deleteFlag: false },
    { id: "flagged", published: true, deleteFlag: true },
  ];
  assert.deepEqual(publicView("/articles", list).data.map((a) => a.id), ["a"]);
  assert.deepEqual(publicView("/articles/a", list[0]), { data: list[0] });
  assert.deepEqual(publicView("/articles/draft", list[1]), { notFound: true });
  assert.deepEqual(publicView("/Articles/flagged", list[2]), { notFound: true });
});

test("publicView drops the journal's private fields", () => {
  const journal = { title: "J", currentArticle: { id: "draft" }, adminDetails: { id: "x", passPhase: "y" } };
  assert.deepEqual(publicView("/journal", journal).data, { title: "J" });
  assert.ok(journal.adminDetails, "doesn't modify the stored journal");
});

test("anonymous reads of articles and the journal get the public view", async () => {
  for (const path of ["/articles", "/articles/42", "/journal"]) {
    const req = fakeReq("GET", path);
    assert.equal(await run(middleware, req), "next");
    assert.equal(req.publicView, true, path);
  }
  const qna = fakeReq("GET", "/qna");
  await run(middleware, qna);
  assert.equal(qna.publicView, undefined);
});

test("an admin's reads get the full view", async () => {
  const req = fakeReq("GET", "/articles", "Bearer admin-token");
  assert.equal(await run(middleware, req), "next");
  assert.equal(req.publicView, undefined);
  assert.equal(req.adminEmail, "admin@example.com");
});

test("a public read carrying a bad or non-admin token is rejected, not downgraded", async () => {
  assert.equal((await run(middleware, fakeReq("GET", "/articles", "Bearer garbage"))).statusCode, 401);
  assert.equal((await run(middleware, fakeReq("GET", "/journal", "Bearer stranger-token"))).statusCode, 403);
});

