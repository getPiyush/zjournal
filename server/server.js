// server.js
const path = require('path')
const jsonServer = require("json-server");
const auth = require("./authenticator");
const { encryptAES, decryptDataNode } = require("./crypto");
const { properties } = require("./properties");

const atob = (b64Encoded) => {
  return Buffer.from(b64Encoded, 'base64').toString()
}

const isEncryptedMethod = (method) =>{
  return method === 'PUT' || method === 'POST' 
}

const router = jsonServer.router(path.join(__dirname, properties.dbFile))
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// const env = (process.argv && process.argv.includes("--production")) ? "production" : "development";
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (isEncryptedMethod(req.method) &&  properties.encrypted) {
    const decryptedData = decryptDataNode(atob(req.body.ezjData));
    req.body = decryptedData;
  }
  next();
});

server.use(middlewares);
server.use(auth.authenticatorMiddleWare);


server.use(router);
server.listen(properties.port, () => {
  console.log("zJournal is running on port ", properties.port);
});

router.render = (req, res) => {
  const response = JSON.stringify(res.locals.data);
  const encryptedData = properties.encrypted ? encryptAES(response) : res.locals.data;
  res.jsonp({
    zjData: encryptedData,
  });
};
