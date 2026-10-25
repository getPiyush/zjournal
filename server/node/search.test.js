// Run with: npm run test:server:node (from the repo root)
// Runs the shared cases in server/search_cases.json, which every backend's tests run too.
const test = require("node:test");
const assert = require("node:assert/strict");
const { search } = require("./search");
const { articles, cases } = require("../search_cases.json");

for (const c of cases) {
  test(c.name, () => {
    const result = search(articles, c.params, c.public);
    assert.deepEqual(result.items.map((a) => a.id), c.ids);
    assert.equal(result.total, c.total);
    if ("page" in c) assert.equal(result.page, c.page);
    if ("limit" in c) assert.equal(result.limit, c.limit);
  });
}
