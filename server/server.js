// server.js
const path = require('path')
const jsonServer = require("json-server");
const auth = require("./authenticator");
const { encryptAES } = require("./crypto");

const router = jsonServer.router(path.join(__dirname, 'db.json'))

const server = jsonServer.create();
// const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(auth.authenticatorMiddleWare);
server.use(router);
server.listen(8080, () => {
  // console.log("JSON Server is running");
});

router.render = (req, res) => {
  const response = JSON.stringify(res.locals.data);
  const encryptedData = encryptAES(response);
  res.jsonp({
    zjData: encryptedData,
  });
};
