const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const ejs = require('ejs');
const jsonfile = require('jsonfile');
require('./public/App.test.js');
require('dotenv').config();

class WEB{
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
let web = new WEB(PORT);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/assets',express.static(path.join(__dirname,'assets')));
app.use('/config',express.static(path.join(__dirname,'config')));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/public',express.static(path.join(__dirname,'public')));


app.use((req, res, next) => {
    try{
        next();
    }catch(e){
        res.status(401).render('notfound',{error: 401, message: "Unauthorize entry not allow, check the source or report it"});
    }
});

/*const promises = [
    ejs.renderFile('./views/header.ejs'),
    ejs.renderFile('./views/footer.ejs'),
    ejs.renderFile('./views/service.ejs'),
    ejs.renderFile('./views/feed.ejs'),
    ejs.renderFile('./views/faq.ejs')
];

app.get('/', (req, res) => {
    Promise.all(promises).then(([header, footer, services, feed, faq]) => {
        res.status(200).render('index',{header, services, feed, faq, footer});
    });
});

app.get('/index', (req, res) => {
    res.redirect('/');
});
*/

app.get('/', (req, res) => {
    res.status(200).render('<h1>Welcome to CHSCDN utility system!</h1><small>This website under development, Please visit our main website for more information</small>');
});

app.get('/cdn/v1/css/style.css', (req, res) => {
  res.status(200).sendFile(__dirname + '/cdn/v1/style.min.css');
});

app.get('/cdn/v1/js/script.js', (req, res) => {
  res.status(200).sendFile(__dirname + '/cdn/v1/script.js');
});

app.get('*', (req, res) => {
    res.status(404).render('notfound',{error: 404, message: "Page not found on this url, check the source or report it"});
});

server.listen(PORT, (err) => {
    if(err) console.log("Oops an error occure:  "+err);
    console.log(`Compiled successfully!\n\nYou can now view \x1b[33m./${path.basename(__filename)}\x1b[0m in the browser.`);
    console.info(`\thttp://localhost:${PORT}`);
    console.log("\n\x1b[32mNode web compiled!\x1b[0m \n");
});
