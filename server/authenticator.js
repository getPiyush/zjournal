const { getPassPhase } = require("./crypto");

exports.authenticatorMiddleWare = function (req, res, next) {
  const serverToken = getPassPhase();
  const headerToken = req.header("Zjournal-Secure-Token");

  const env = (process.argv && process.argv.includes("--production")) ? "production" : "development";

  if (env === "development" || headerToken === serverToken) {
    res.header("Zjournal-Secure-Authention", "true");
    next();
  } else {
    res.header("Zjournal-Secure-Authention", "false");

    res.status(500).jsonp({
      error: "Someething went wrong, please try again",
    });
  }
};