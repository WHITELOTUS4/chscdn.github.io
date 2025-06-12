const express = require('express');
const http = require('http');
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const tar = require("tar");
const jsonfile = require('jsonfile');
const SYSTEM = require('./public/App.js');
require('./public/App.test.js');
require('dotenv').config();

class CDN{
    constructor(port){
        this.active = true;
        this.port = port;
        this.latest = "v2";
        this.webLink = undefined;
        this.apiLink = undefined;
        this.appInfo = jsonfile.readFileSync('./public/manifest.json');
        this.public_key = this.appInfo.icons[1].sizes.replace('x1500','')*1;
    }
}

const app = express();
let server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const AppName = "Cavernous Hoax Scanner CDN";
let cdn = new CDN(PORT);
let system = new SYSTEM();

app.use('/public', express.static(path.join(__dirname,'public')));
app.use('/contents', express.static(path.join(__dirname,'contents')));
app.use('/packets', express.static(path.join(__dirname,'packets')));

app.use((req, res, next) => {
    try{
        if(!system.isHosted(req)){
            cdn.webLink = 'http://127.0.0.1:5000';
            cdn.apiLink = 'http://127.0.0.1:8000';
        }else{
            cdn.webLink = 'https://chsweb.vercel.app';
            cdn.apiLink = 'https://chsapi.vercel.app';
        }
        next();
    }catch(e){
        res.status(401).json({error: 401, message: "Unauthorize entry not allow, check the source or report it"});
    }
});

app.get('/', async (req, res) => {
    try{
        await fetch(cdn.webLink+'/cdn_raw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"access_key": system.access_key})
        }).then(response => response.text()).then(html => {
            res.set("Content-Type", "text/html");
            res.send(html);
        }).catch((e) => {
            console.log("New Error: "+e);
            res.status(200).send("<h1 style='text-align: center; margin: 20% auto; color: #6e13aff2; font-family: sans-serif;'>Ahoy hoy User, CHSCDN greet you without any custome page!<h1>");
        });
    }catch(e){
        const redirectUrl = new URL('https://chsweb.vercel.app/cdn');
        res.status(200).redirect(redirectUrl.href);
    }
});

app.get('/index', (req, res) => {
    res.redirect('/');
});

app.get('/varchar', async (req, res) => {
    try{
        await fetch(cdn.webLink+'/varchar').then(response => response.json()).then(data => {
            res.status(200).json({varchar: data.varchar, navi: data.navi, hex: data.hex, security: data.security});
        }).catch(e=>console.log(e));
    }catch(e){
        console.log("Error occure when fetch varchar from chsweb");
        res.status(400).json({varchar: '', navi: '', hex: '', security: ''});
    }
});

app.get('/compiler', async (req, res) => {
    try{
        await fetch(cdn.webLink+'/compiler').then(response => response.json()).then(data => {
            res.status(200).json({compiler: data.compiler});
        }).catch(e=>console.log(e));
    }catch(error){
        res.status(500).json({ error: 'Failed to load configuration', details: error.message });
    }
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

app.get('/doc', (req, res) => {
    const redirectUrl = new URL('https://chsweb.vercel.app/doc');
    res.status(200).redirect(redirectUrl.href);
});

app.get('/docs', (req, res) => {
    res.redirect('/doc');
});

// Download zip archive folder
app.get("/download/zip/:version", (req, res) => {
    const version = req.params.version=='latest'?cdn.latest:req.params.version;
    const folderPath = path.join(__dirname, "contents", version);
    if(!fs.existsSync(folderPath)){
        return res.status(404).json({error: 404, message: "Version compress directory not found! Verify the download link or visit https://chsweb.vercel.app/docs"});
    }
    res.setHeader("Content-Disposition", `attachment; filename=chscdn@${version}.zip`);
    res.setHeader("Content-Type", "application/zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(folderPath, false);
    archive.finalize();
});

// Download tgz archive folder
app.get("/download/tgz/:version", async (req, res) => {
    const version = req.params.version=='latest'?cdn.latest:req.params.version;
    const folderPath = path.join(__dirname, "contents", version);
    const tarFilePath = path.join(__dirname, `${version}.tgz`);
    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({error: 404, message: "Version compress directory not found! Verify the download link or visit https://chsweb.vercel.app/docs"});
    }
    await tar.c(
        {
            gzip: true,
            file: tarFilePath,
            cwd: folderPath,
        },
        fs.readdirSync(folderPath)
    );
    res.setHeader("Content-Disposition", `attachment; filename=chscdn@${version}.tgz`);
    res.setHeader("Content-Type", "application/gzip");
    res.sendFile(tarFilePath, (err) => {
        if(err){
            res.status(500).json({ error: "Failed to send file", message: err });
        }
        fs.unlinkSync(tarFilePath);
    });
});

// Default download route to the zip download
app.get("/download/:version", (req, res) => {
    const version = req.params.version=='latest'?cdn.latest:req.params.version;
    res.status(200).redirect(`/download/zip/${version}`);
});

// Default install route to the package setup
app.get("/install/:package/chscdn", async (req, res) => {
    const package = req.params.package=='pip'?'pip':'npm';
    const folderPath = path.join(__dirname, "packets", package);
    if(!fs.existsSync(folderPath)){
        return res.status(404).json({error: 404, message: "Package not found! Verify the installation link or visit https://chsweb.vercel.app/docs"});
    }
    if(package == 'npm'){
        const tarFilePath = path.join(__dirname, `${package}.tgz`);
        await tar.c(
            {
                gzip: true,
                file: tarFilePath,
                cwd: folderPath,
            },
            fs.readdirSync(folderPath)
        );
        res.setHeader("Content-Disposition", `attachment; filename=chscdn.tgz`);
        res.setHeader("Content-Type", "application/gzip");
        res.sendFile(tarFilePath, (err) => {
            if(err){
                res.status(500).json({ error: "Failed to send file", message: err });
            }
            fs.unlinkSync(tarFilePath);
        });
    }else{
        res.setHeader("Content-Disposition", `attachment; filename=chscdn.zip`);
        res.setHeader("Content-Type", "application/zip");
        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.pipe(res);
        archive.directory(folderPath, false);
        archive.finalize();
    }
});

// Key exchange route for secure communication
app.get('/key_exchange', async (req, res) => {
    let p = system.generateLargePrime();
    let g = system.findSmallerPrime(p - Math.floor(Math.random()*100));
    
    let a = 7;
    let b = 5;

    if(req?.query){
        a = req?.query?.a || a;
    }

    b = await system.get_choosen_one_of_api(system.isHosted(req)==true?'https://chsapi.vercel.app':'http://127.0.0.1:8000');

    const A = Math.pow(g, a) % p;
    const B = Math.pow(g, b) % p;

    const k1 = Math.pow(B, a) % p;
    const k2 = Math.pow(A, b) % p;

    const [secret1, public1, secret2, public2] = system.key_pair_genrator(k1, k2);

    let web = {secret: system.Encoder(String(secret1), String(cdn.public_key-59)), public: public2};
    let api = {secret: system.Encoder(String(secret2), String(cdn.public_key-59)), public: public1};

    await system.return_key_to_api(system.isHosted(req)==true?'https://chsapi.vercel.app':'http://127.0.0.1:8000',api);

    res.status(200).json(web);
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
