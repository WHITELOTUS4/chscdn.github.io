const express = require('express');
const http = require('http');
const path = require('path');
const jsonfile = require('jsonfile');
require('./public/App.test.js');
require('dotenv').config();

class CDN{
    constructor(port){
        this.active = true;
        this.port = port;
        this.filename = path.basename(__filename);
        this.appInfo = jsonfile.readFileSync('./public/manifest.json');
    }
}

const app = express();
let server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const AppName = "Cavernous Hoax Scanner CDN";
let cdn = new CDN(PORT);

app.use('/public', express.static(path.join(__dirname,'public')));
app.use('/contents', express.static(path.join(__dirname,'contents')));

app.use((req, res, next) => {
    try{
        next();
    }catch(e){
        res.status(401).json({error: 401, message: "Unauthorize entry not allow, check the source or report it"});
    }
});

app.get('/', (req, res) => {
    const redirectUrl = new URL('https://chsweb.vercel.app/cdn');
    res.status(200).redirect(redirectUrl.href);
});

app.get('/index', (req, res) => {
    res.redirect('/');
});

// Version 1.0 resource distribution code block
app.get('/cdn/v1/css/chscdn.min.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/contents/v1/style.css');
});

app.get('/cdn/v1/css/chscdn.css', (req, res) => {
    res.redirect('/cdn/v1/css/chscdn.min.css');
});

app.get('/cdn/v1/js/chscdn.js', (req, res) => {
    res.status(200).sendFile(__dirname + '/contents/v1/script.js');
});

// Version 2.0 resource distribution code block
app.get('/cdn/v2/css/chscdn.min.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/contents/v2/style.css');
});

app.get('/cdn/v2/css/chscdn.css', (req, res) => {
    res.redirect('/cdn/v2/css/chscdn.min.css');
});

app.get('/cdn/v2/js/chscdn.js', (req, res) => {
    res.status(200).sendFile(__dirname + '/contents/v2/script.js');
});

app.get('*', (req, res) => {
    res.status(404).json({error: 404, message: "Resource not found on this url, check the source or report it"});
});

server.listen(PORT, (err) => {
    if(err) console.log("Oops an error occure:  "+err);
    console.log(`Compiled successfully!\n\nYou can now view \x1b[33m./${path.basename(__filename)}\x1b[0m in the browser.`);
    console.info(`\thttp://localhost:${PORT}`);
    console.log("\n\x1b[32mNode web compiled!\x1b[0m \n");
});
