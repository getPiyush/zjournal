
const path = require('path')
var express = require('express')

var app = express()

app.use(express.static(path.join(__dirname)));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "./", "index.html"), err => {
        if (err) {
            console.log(err);
        }
    });
});

app.listen(80)