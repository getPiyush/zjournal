const { getPassPhase } = require("./crypto");

exports.authenticatorMiddleWare = function(req, res, next) {
  const serverToken = getPassPhase();
  const headerToken = req.header("Zjournal-Secure-Token");

  // // console.log(headerToken, "\n", serverToken);

  if (headerToken === serverToken) {
    res.header("Zjournal-Secure-Authention", "true");
    next();
  } else {
    res.header("Zjournal-Secure-Authention", "true");

    res.status(500).jsonp({
      error: "Someething went wrong, please try again",
    });
  }
};