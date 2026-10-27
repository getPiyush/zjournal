// server.js
const path = require('path')
const jsonServer = require("json-server");
const { encryptData, decryptData } = require("./crypto");
const { properties } = require("./properties");
const { buildAuthMiddleware, publicView } = require("./auth");
const { search } = require("./search");

const isEncryptedMethod = (method) =>{
  return method === 'PUT' || method === 'POST'
}

const router = jsonServer.router(path.join(__dirname, properties.dbFile))
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

let authMiddleware;
try {
  // Development only when explicitly asked for (`npm run server` passes --development and sets
  // ZJOURNAL_ENV), so a bare `node server.js` never starts with an open API.
  const development =
    process.argv.includes("--development") || process.env.ZJOURNAL_ENV === "development";
  authMiddleware = buildAuthMiddleware(properties.auth, { production: !development });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

server.use(jsonServer.bodyParser)
// defaults() includes CORS, so it runs before the auth check — otherwise a 401/403 would reach
// the browser without CORS headers and surface as an opaque network error.
server.use(middlewares);
if (authMiddleware) server.use(authMiddleware);
server.use((req, res, next) => {
  if (properties.encryptionEnabled && isEncryptedMethod(req.method) && req.body && req.body.ezjData) {
    req.body = JSON.parse(decryptData(req.body.ezjData));
  }
  next();
});

// Ahead of the router, which would otherwise read "search" as an article id. Anonymous callers
// (req.publicView) only search published articles; see server/SEARCH.md.
server.get("/articles/search", (req, res) => {
  send(res, search(router.db.get("articles").value(), req.query, Boolean(req.publicView)));
});

server.use(router);
server.listen(properties.port, () => {
  console.log("zJournal is running on port ", properties.port);
});

router.render = (req, res) => {
  // json-server calls res.status(404) then leaves res.locals.data as {} when show/update/destroy
  // don't find a match (see json-server/lib/server/router/{index,plural}.js) — swap that empty
  // body for the structured error envelope the other three backends return on a 404.
  // Anonymous reads of articles/journal get the public view (see auth.js).
  let { data } = res.locals;
  if (req.publicView && res.statusCode < 400) {
    const view = publicView(req.path, data);
    if (view.notFound) res.status(404);
    data = view.data;
  }
  if (res.statusCode === 404) {
    data = { error: { code: "NOT_FOUND", message: "No item with that id" } };
  }

  send(res, data);
};

function send(res, data) {
  if (!properties.encryptionEnabled) {
    res.jsonp(data);
    return;
  }
  res.jsonp({
    ezjData: encryptData(JSON.stringify(data)),
  });
}
