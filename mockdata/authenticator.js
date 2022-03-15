let sha512 = require('crypto-js/hmac-sha512');
const appPassword = "JagaBaliaShreekhetra"


module.exports = (req, res, next) => {
    const date = new Date();
    const message = date.getUTCFullYear()+"$"+date.getUTCDate()+"$"+date.getUTCMonth()+"$"+date.getUTCDay();
    const serverToken = sha512(message, appPassword).toString();


    const headerToken = req.header('Zjournal-Secure-Token');

  

    console.log(headerToken,"\n", serverToken);
    
    if (headerToken === serverToken) {
        res.header('Zjournal-Secure-Authention', 'true');
        next()
    } else {
        res.header('Zjournal-Secure-Authention', 'true');

        res.status(500).jsonp({
            error: "Someething went wrong, please try again"
          })
       //  next("Someething went wrong")
    }
}