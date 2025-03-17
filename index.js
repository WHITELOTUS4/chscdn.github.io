const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
// const ejs = require('ejs');
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
const AppName = "Cavernous Hoax Scanner";
let cdn = new CDN(PORT);


/*app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));*/

app.use('/public',express.static(path.join(__dirname,'public')));


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

app.get('/cdn/v1/css/style.min.css', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/v1/style.css');
});

app.get('/cdn/v1/js/script.js', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/v1/script.js');
});

app.get('*', (req, res) => {
    res.status(404).json({error: 404, message: "Page not found on this url, check the source or report it"});
});

server.listen(PORT, (err) => {
    if(err) console.log("Oops an error occure:  "+err);
    console.log(`Compiled successfully!\n\nYou can now view \x1b[33m./${path.basename(__filename)}\x1b[0m in the browser.`);
    console.info(`\thttp://localhost:${PORT}`);
    console.log("\n\x1b[32mNode web compiled!\x1b[0m \n");
});
