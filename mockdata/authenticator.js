let sha512 = require('crypto-js/hmac-sha512');
const appPassword = "JagaBaliaShreekhetra"

const getPassPhase = () => {
    const date = new Date();
    const message = date.getUTCHours() + "$" + date.getUTCDate() + "$" + date.getUTCMinutes() + "$" + date.getUTCDay();
    return sha512(message, appPassword).toString();
}

module.exports = (req, res, next) => {
    const serverToken = getPassPhase();
    const headerToken = req.header('Zjournal-Secure-Token');

    console.log(headerToken, "\n", serverToken);

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