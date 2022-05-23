// server.js
const path = require('path')
const jsonServer = require("json-server");
const auth = require("./authenticator");
const { encryptAES } = require("./crypto");
const { properties } = require("./properties");


const router = jsonServer.router(path.join(__dirname, properties.dbFile))

const server = jsonServer.create();
// const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// const env = (process.argv && process.argv.includes("--production")) ? "production" : "development";

server.use(middlewares);
server.use(auth.authenticatorMiddleWare);
server.use(router);
server.listen(properties.port, () => {
  // console.log("JSON Server is running");
});

router.render = (req, res) => {
  const response = JSON.stringify(res.locals.data);
  const encryptedData = properties.encrypted ? encryptAES(response) : res.locals.data;
  res.jsonp({
    zjData: encryptedData,
  });
};
