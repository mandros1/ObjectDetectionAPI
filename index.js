// POST localhost:3000/shelfobjectdetector/detect
// BODY imageBase64: base64 of processed image
// Base 64 example -> can be found in base64ExampleString.txt file;
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3100;
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.post("/shelfobjectdetector/detect", (req, res) => {
    const body = req.body;
    const token = body.token;
    let imageBase64 = body.imageBase64;
    if(token !== undefined){
        if(token.trim() !== process.env.TOKEN){
            return res.send('Invalid token');
        }
    } else {
        return res.send('Please provide token');
    }

    if(imageBase64 === undefined){
            return res.send('Please provide image in base 64 format');
    }
    let bufferData = Buffer.from(imageBase64, 'base64');
    let filename = `testImage${Math.ceil(Math.random()*1000)}.jpg`;
    fs.writeFile(filename, bufferData, {encoding: 'base64'}, function(err){
        if(err !== null) {
            console.log(`Error message: ${err}`);
        }
        const exec = require("child_process").exec;
        let command = "sh bashScript " + filename;
        exec(command, function (err, stdout, stderr) {
            if (err) {
                console.log('Error: ' + err);
            }

            fs.unlink(`./${filename}`, (err) => {
                if (err) {
                    console.log(`Error: ${err}`);
                }
            });
            return res.send(stdout);
        });

    });
});


app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});

module.exports = app;
