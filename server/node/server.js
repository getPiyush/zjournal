// server.js
const path = require('path')
const jsonServer = require("json-server");
const { encryptData, decryptData } = require("./crypto");
const { properties } = require("./properties");

const isEncryptedMethod = (method) =>{
  return method === 'PUT' || method === 'POST'
}

const router = jsonServer.router(path.join(__dirname, properties.dbFile))
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (properties.encryptionEnabled && isEncryptedMethod(req.method) && req.body && req.body.ezjData) {
    req.body = JSON.parse(decryptData(req.body.ezjData));
  }
  next();
});

server.use(middlewares);

server.use(router);
server.listen(properties.port, () => {
  console.log("zJournal is running on port ", properties.port);
});

router.render = (req, res) => {
  // json-server calls res.status(404) then leaves res.locals.data as {} when show/update/destroy
  // don't find a match (see json-server/lib/server/router/{index,plural}.js) — swap that empty
  // body for the structured error envelope the other three backends return on a 404.
  const data = res.statusCode === 404
    ? { error: { code: "NOT_FOUND", message: "No item with that id" } }
    : res.locals.data;

  if (!properties.encryptionEnabled) {
    res.jsonp(data);
    return;
  }
  const response = JSON.stringify(data);
  res.jsonp({
    ezjData: encryptData(response),
  });
};
