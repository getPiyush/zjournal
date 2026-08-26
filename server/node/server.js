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
  if (isEncryptedMethod(req.method) && req.body && req.body.ezjData) {
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
  const response = JSON.stringify(res.locals.data);
  res.jsonp({
    ezjData: encryptData(response),
  });
};
