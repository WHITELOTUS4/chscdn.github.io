require('./index.test.js');
const fs = require('fs');
const path = require('path');
let fetch; // node fetch version overload approch
try{
    fetch = require('node-fetch'); // get as CommonJS (CJS) approch 
}catch{
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // get as ESM-only module approch
}
const sharp = require('sharp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Core Constants
let apilink = "https://chsapi.vercel.app";
let weblink = "https://chsweb.vercel.app";

// CDN Class
class CHSCDN{
    constructor(){
        this.apilink = apilink;
        this.apikey = '';
        this.weblink = weblink;
        this.img_extensions = ['.jpg', '.jpeg', '.png', '.peng', '.bmp', '.gif', '.webp', '.svg', '.jpe', '.jfif', '.tar', '.tiff', '.tga'];
        this.vdo_extensions = ['.mp4', '.mov', '.wmv', '.avi', '.avchd', '.flv', '.f4v', '.swf', '.mkv', '.webm', '.html5'];

        // Optional: Check if running offline(Node.js version)
        this.checkInternet();

        // Optional: Activate dev mode if running in local environment
        if(process.env.NODE_ENV === 'development'){
            this.developermode();
        }
    }

    // Simulate developer mode
    developermode(){
        this.apilink = "http://127.0.0.1:8000";
        this.weblink = "http://127.0.0.1:5000";
    }

    // Internet check(Node.js version)
    async checkInternet(){
        const https = require('https');
        https.get("https://www.google.com", res => {
            if(res.statusCode !== 200){
                console.error("ERR_INTERNET_DISCONNECTED: Unable to reach the internet.");
            }
        }).on("error", err => {
            console.error("ERR_INTERNET_DISCONNECTED: Looks like you're not connected to the internet, Unable to establish connection with CHSAPI due to network issues.\n\nPlease verify your Wi-Fi or network connection is stable and try again.\n\n");
        });
    }
}

CHSCDN.prototype.APICaller = async function(values){
    let response;
    if(this.inputVerified(values)){
        if(values.task == 'deepfake detect'){
            response = await this.dfd(values);
        }else if(values.task == 'image converter'){
            response = await this.imgconverter(values);
        }else if(values.task == 'image compressor'){
            response = await this.imgcompressor(values);
        }else if(values.task == 'text to image generator'){
            response = await this.imggenerator(values);
        }else if(values.task == 'image to pdf'){
            response = await this.imgtopdf(values);
        }else{
            console.warn("Opeartion_Exception: Please use pre-define media operation.\nProvided information are not evaluate due to the undefine task!\n\nGiven task: " + values.task + "\nAbove task is not listed\n\n");
        }
        return response;
    }else{
        console.warn(`Structural_Exception: Please use required inputs structure to use chsapi\nfor understanding the basic structure of each api endpoint, must visit ${new URL('https://chsweb.vercel.app/docs?search=basemodel')}\n\tOR,\nwatch ${new URL('https://youtube.com/@whitelotus4')}\n\n`);
        return null;
    }
}

CHSCDN.prototype.inputVerified = function(values){
    if(values =={}|| values == [] || values == undefined || values == ''){
        return false;
    }
    if(!values?.task && !values?.media){
        return false;
    }
    return true;
}

CHSCDN.prototype.isValidImage = function(link){
    const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    if (!extMatch) return false;

    const ext = '.' + extMatch[1].toLowerCase();
    return this.img_extensions.includes(ext);
};

CHSCDN.prototype.isValidVideo = function(link){
    const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    if (!extMatch) return false;

    const ext = '.' + extMatch[1].toLowerCase();
    return this.vdo_extensions.includes(ext);
};

CHSCDN.prototype.mediaType = function(base64_str){
    let type = base64_str.split('/')[0].split(':')[1];
    if(type == 'image' || type == 'video'){
        return type;
    }else{
        return null;
    }
}

CHSCDN.prototype.image2base64 = async function(filePath){
    return new Promise((resolve, reject) => {
        if(!this.isValidImage(filePath)){
            console.error(
                `Extension_Exception: Provided media has unsupported image extension.\n` +
                `Please provide the media with a valid extension. For more understanding visit:\n` +
                `${new URL('https://chsweb.vercel.app/docs?search=extension')}\n\n`
            );
            return reject(false);
        }

        try{
            const ext = path.extname(filePath).toLowerCase().replace('.', '');
            const data = fs.readFileSync(filePath);
            const base64 = `data:image/${ext};base64,` + data.toString('base64');
            resolve(base64);
        }catch(err){
            reject(`FileRead_Exception: Unable to read image - ${err.message}`);
        }
    });
};

CHSCDN.prototype.image_to_base64 = async function(link){
    return new Promise((resolve, reject) => {
        const mimeMap ={
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            jpe: 'image/jpeg',
            jfif: 'image/jpeg',
            png: 'image/png',
            peng: 'image/png',
            bmp: 'image/bmp',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            tiff: 'image/tiff',
            tga: 'image/x-tga',
            tar: 'application/x-tar'
        };

        const ext = path.extname(link).toLowerCase().replace('.', '');

        const mimeType = mimeMap[ext];

        if(!mimeType){
            console.error(
                `Extension_Exception: Provided media has unsupported image extension.\n` +
                `Please provide the media with valid extension.\n\nVisit:\n` +
                `${new URL('https://chsweb.vercel.app/docs?search=extension')}\n\n`
            );
            return reject(false);
        }

        try{
            const buffer = fs.readFileSync(link);
            const base64String = `data:${mimeType};base64,` + buffer.toString('base64');
            resolve(base64String);
        }catch(err){
            reject(`FileRead_Exception: Failed to read file - ${err.message}`);
        }
    });
};

CHSCDN.prototype.video2base64 = async function(link){
    return new Promise(async(resolve, reject) => {
        // Validate extension
        if(!this.isValidVideo(link)){
            console.error(
                `Extension_Exception: Provided media has unsupported video extension\n` +
                `Please provide a valid extension. Visit:\n` +
                `${new URL('https://chsweb.vercel.app/docs?search=extension')}\n\n`
            );
            return reject(false);
        }

        // Extract file extension and MIME type
        const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
        const ext = '.' + extMatch[1].toLowerCase();
        const mimeType = `video/${ext.replace('.', '')}`;

        try{
            let buffer;

            // Check if link is an online URL
            if(/^https?:\/\//.test(link)){
                const response = await fetch(link);
                if(!response.ok) throw new Error("Failed to fetch video from URL");
                buffer = Buffer.from(await response.arrayBuffer());
            }else{
                // Handle local file
                buffer = fs.readFileSync(link);
            }

            // Convert buffer to base64 string
            const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;
            resolve(base64String);
        }catch(err){
            reject(`VideoRead_Exception: ${err.message}`);
        }
    });
};

CHSCDN.prototype.base64_size = function(base64_string){
    if(!base64_string.startsWith("data:")){
        console.warn(`TypeError:\n Expected a base64 string value for attribute 'base64_string', but got ${typeof(base64_string)}instead\n\n`);
        return null;
    }
    const blob = new Blob([base64_string],{ type: 'text/plain' });
    const stringSizeInBytes = blob.size;
    const stringSizeInKB = Math.floor(stringSizeInBytes / 1024);
    return stringSizeInKB;
};

CHSCDN.prototype.getMediaExtension = function(base64_string){
    const mimeType = base64_string.match(/^data:([a-z]+\/[a-z0-9-+.]+);/);
    if(mimeType){
        const extension = mimeType[1].split('/')[1];
        return extension;
    }else{
        return null;
    }
};

CHSCDN.prototype.extractFramesFromBase64Video = async function(base64Video, fps = 1){
    return new Promise(async(resolve, reject) => {
        try{
            // Step 1: Decode base64 and save to temp file
            const matches = base64Video.match(/^data:video\/\w+;base64,(.*)$/);
            if(!matches || matches.length < 2) return reject("Invalid base64 video format.");

            const buffer = Buffer.from(matches[1], 'base64');
            const tempVideoPath = path.join(__dirname, 'temp_input_video.mp4');
            fs.writeFileSync(tempVideoPath, buffer);

            // Step 2: Create output directory
            const outputDir = path.join(__dirname, 'frames_output');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            // Step 3: Extract frames using ffmpeg
            const outputPattern = path.join(outputDir, 'frame-%03d.jpg');
            ffmpeg(tempVideoPath)
                .outputOptions([`-vf fps=${fps}`])
                .output(outputPattern)
                .on('end',() => {
                    const frames = [];
                    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
                    files.sort(); // ensure frames are in order
                    files.forEach((file, index) => {
                        const framePath = path.join(outputDir, file);
                        const frameBuffer = fs.readFileSync(framePath);
                        const base64Image = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`;
                        frames.push({ second: index, image: base64Image });
                        fs.unlinkSync(framePath); // optional: cleanup frame file
                    });
                    fs.unlinkSync(tempVideoPath); // cleanup temp video
                    fs.rmdirSync(outputDir); // cleanup dir
                    resolve(frames);
                })
                .on('error',(err) => reject(`ffmpeg error: ${err.message}`))
                .run();
        }catch(err){
            reject(`FrameExtractionError: ${err.message}`);
        }
    });
};

CHSCDN.prototype.compressBase64Image = async function(base64_image, maxSizeKB = 900, minSkipSizeKB = 600){
    function base64SizeKB(base64){
        const len = base64.length *(3 / 4) -(base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
        return len / 1024;
    }

    // Skip compression if already small enough
    if(base64SizeKB(base64_image) < minSkipSizeKB){
        return base64_image;
    }

    // Strip the base64 header and get buffer
    const base64Data = base64_image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    let quality = 95;
    let outputBuffer;

    while(quality >= 10){
        try{
            outputBuffer = await sharp(buffer)
                .jpeg({ quality: quality })  // compress as jpeg
                .toBuffer();

            const base64Compressed = outputBuffer.toString('base64');
            const sizeKB = base64SizeKB(base64Compressed);

            if(sizeKB <= maxSizeKB){
                return `data:image/jpeg;base64,${base64Compressed}`;
            }

            quality -= 5;
        }catch(err){
            throw new Error(`ImageCompressionError: ${err.message}`);
        }
    }

    // Return best-effort compressed result
    return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
};

CHSCDN.prototype.load_media = async function(base64String){
    const parts = [];

    // Handle undefined
    if(base64String === undefined){
        base64String = '';
    }

    // Function to estimate base64 size in KB
    this.base64_size = function(b64){
        const len = b64.length *(3 / 4) -(b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
        return len / 1024;
    };

    let limit = Math.floor(this.base64_size(base64String) / 900) + 2;
    const partLength = Math.ceil(base64String.length / limit);

    for(let i = 0; i < limit; i++){
        parts.push(base64String.slice(i * partLength,(i + 1) * partLength));
    }

    async function sendPart(part, index, limit, url, key){
        let attempts = 0;
        while(attempts < 3){
            attempts++;
            try{
                const response = await fetch(`${url}/load/single`,{
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        img: part,
                        limit: limit,
                        index: index,
                        key: key
                    })
                });

                const data = await response.json();
                if(data.ack === index){
                    return true;
                }
            }catch(error){
                if(error?.cause?.errno === -4078 || error?.cause?.code === 'ECONNREFUSED'){
                    return false;
                }
                console.log(`Error on attempt ${attempts}for part ${index}:`, error);
            }
        }
        return false;
    }

    for(let i = 0; i < parts.length; i++){
        const isSuccess = await sendPart(parts[i], i + 1, limit, this.apilink, this.apikey);
        if(!isSuccess){
            return 24; // Failed to send one of the parts
        }
    }

    return true;
};

CHSCDN.prototype.chsAPI = async function(uri, token){
    const url = uri;
    try{
        const response = await fetch(url,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(token)
        });

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('API Error:', errorDetails);
            return false;
        }

        const result = await response.json();
        return result;

    }catch(error){
        console.error('Error calling API:', error);
        return false;
    }
};

CHSCDN.prototype.dfd = async function(values){
    try{
        const mediaType = this.mediaType(values.media);

        if(mediaType === 'image' && this.isValidImage(values.media)){
            const connection = await this.load_media(values.media);
            if(this.noise_detect(connection)) return this.handle_error(connection);

            const response = await this.chsAPI(`${this.apilink}/api/dfdScanner`,{
                ext: this.getMediaExtension(values.media),
                media: '',
                load: 'true',
                key: this.apikey,
                heatmap: 'false'
            });

            if(this.noise_detect(response)) return this.handle_error(response);
            return response;

        }else if(mediaType === 'video' && this.isValidVideo(values.media)){
            const frames = await this.extractFramesFromBase64Video(values.media);
            let prediction_list = [];
            let responce_tree = [];
            let first_failer = 0;

            for(let i = 0; i < frames.length; i++){
                let image_data = frames[i].image;

                image_data = await this.compressBase64Image(image_data);

                try{
                    const connection = await this.load_media(image_data);
                    if(this.noise_detect(connection)) return this.handle_error(connection);

                    const response = await this.chsAPI(`${this.apilink}/api/dfdScanner`,{
                        ext: this.getMediaExtension(image_data),
                        media: '',
                        load: 'true',
                        key: this.apikey,
                        heatmap: 'false'
                    });

                    if(this.noise_detect(response)) return this.handle_error(response);

                    const data = response;
                    prediction_list.push({
                        second: frames[i].second,
                        ...data?.result
                    });

                    responce_tree.push(data?.result?.responce_tree);
                }catch(error){
                    console.error(`Error on frame ${i}:`, error);

                    if(first_failer === 0){
                        first_failer++;
                        i--;
                    }else{
                        responce_tree.push(this.loosParameterRecover());
                    }
                }
            }

            const responce_tree_summarize = this.summarizePrototypeResults(responce_tree);
            const result = this.analyzeClassificationSequence(prediction_list); 
            result.responce_tree = responce_tree_summarize;

            const data ={
                result: result,
                metadata:{
                    version: "1.0.0",
                    header:{
                        "Content-Type": "application/json"
                    }
                },
                network:{
                    url: "https://chsapi.vercel.app/api/",
                    kernel: "inphant api",
                    provider: "chsapi"
                },
                source: "WHITE LOTUS Community"
            };

            return data;

        }else{
            console.error(`Media_Exception: Provided media has not pre-define media type\nPlease provide the valid media type as image or video.\nVisit: https://chsweb.vercel.app/docs?search=extension`);
            return null;
        }
    }catch(e){
        console.error("APICallError:\n" + e + "\n\n");
    }
};

CHSCDN.prototype.analyzeClassificationSequence = function(predictions){
    if(!predictions || predictions.length === 0){
        return{ error: "Empty prediction list" };
    }
    let resultClass = "Real";
    let fakeSequences = [];
    let currentSequence = [];
    for(let i = 0; i < predictions.length; i++){
        const item = predictions[i];
        const label =(item.class || "").toLowerCase();
        if(label === "fake"){
            currentSequence.push(item);
            if(currentSequence.length >= 2){
                fakeSequences = [...currentSequence];
            }
        }else{
            currentSequence = [];
        }
    }
    if(fakeSequences.length > 0){
        const totalAccuracy = fakeSequences.reduce((sum, f) => sum + f.accuracy, 0);
        const avgAccuracy = +(totalAccuracy / fakeSequences.length).toFixed(2);
        const startTime = fakeSequences[0].second;
        const endTime = fakeSequences[fakeSequences.length - 1].second;
        return{
            class: "Fake",
            accuracy: avgAccuracy,
            period: [startTime, endTime]
        };
    }
    const realPreds = predictions.filter(p => (p.class || "").toLowerCase() === "real");
    if(realPreds.length > 0){
        const totalAccuracy = realPreds.reduce((sum, p) => sum + p.accuracy, 0);
        const avgAccuracy = +(totalAccuracy / realPreds.length).toFixed(2);
        const startTime = realPreds[0].second;
        const endTime = realPreds[realPreds.length - 1].second;
        return{
            class: "Real",
            accuracy: avgAccuracy,
            period: [startTime, endTime]
        };
    }
    return{ error: "No valid classification data" };
}

CHSCDN.prototype.loosParameterRecover = function(){
    return{
        "prototype_1":{ "class": "Real", "accuracy": 50 },
        "prototype_2":{ "class": "Fake", "accuracy": 50 },
        "prototype_3":{ "class": "Fake", "accuracy": 50 }
    }
}

CHSCDN.prototype.summarizePrototypeResults = function(response_tree){
    const summary = {};
    response_tree.forEach(entry => {
        for(let proto in entry){
            const result = entry[proto];
            const label = result.class.toLowerCase();
            const accuracy = result.accuracy;
            if(!summary[proto]){
                summary[proto] = {
                    real:{ count: 0, totalAccuracy: 0 },
                    fake:{ count: 0, totalAccuracy: 0 }
                };
            }
            if(label === "real"){
                summary[proto].real.count += 1;
                summary[proto].real.totalAccuracy += accuracy;
            }else if(label === "fake"){
                summary[proto].fake.count += 1;
                summary[proto].fake.totalAccuracy += accuracy;
            }
        }
    });
    const resultList = [];
    for(let proto in summary){
        const real = summary[proto].real;
        const fake = summary[proto].fake;
        let finalClass, finalAccuracy;
        if(fake.count > real.count){
            finalClass = "Fake";
            finalAccuracy = +(fake.totalAccuracy / fake.count).toFixed(2);
        }else{
            finalClass = "Real";
            finalAccuracy = +(real.totalAccuracy / real.count).toFixed(2);
        }

        resultList[proto] ={
            class: finalClass,
            accuracy: finalAccuracy
        };
    }
    return resultList;
}

CHSCDN.prototype.imgconverter = async function(values){
	try{
		const mediaType = this.mediaType(values.media);
		const validImage = this.isValidImage(values.media);
		
        if(mediaType === 'image' && validImage){
        	const connection = await this.load_media(values.media);
            if(this.noise_detect(connection)) return this.handle_error(connection);

            const response = await this.chsAPI(`${this.apilink}/api/imageConverter`,{
                form: values.extension,
                img: '',
                load: 'true',
                key: this.apikey
            });

            if(this.noise_detect(response)) return this.handle_error(response);
            return response;
        }else{
        	console.error(`Media_Exception: Provided media has not pre-define media type,\nPlease provide the valid media type as image only.\nVisit: https://chsweb.vercel.app/docs?search=extension`);
            return null;
        }
	}catch(e){
        console.error("APICallError:\n" + e + "\n\n");
    }
}

CHSCDN.prototype.imgcompressor = async function(values){
	try{
		const mediaType = this.mediaType(values.media);
		const validImage = this.isValidImage(values.media);
		
		if(mediaType === "image" && validImage){
			
		}else{
        	console.error(`Media_Exception: Provided media has not pre-define media type\nPlease provide the valid media type as image only.\nVisit: https://chsweb.vercel.app/docs?search=extension`);
            return null;
        }
	}catch(e){
        console.error("APICallError:\n" + e + "\n\n");
    }
}

CHSCDN.prototype.imggenerator = async function(values){
	return "This feature is not supported on this version, please wait until the next version of CHSAPI release";
}

CHSCDN.prototype.imgtopdf = async function(values){

}

CHSCDN.prototype.noise_detect = function(data){
    if(((data * 1) - (data * 1) == 0) && data != true){
        return true;
    }else{
        return false;
    }
}

CHSCDN.prototype.handle_error = function(code){
    try{
        if(code!=true){
            console.log(code);
            return;
        }
    }catch(e){
        console.log("Error found to handle error\n", e);
    }
}

CHSCDN.prototype.error_detect = function(response, permite_to_speck){
    if((response * 1) -(response * 1) == 0){
        if(permite_to_speck != 'mute'){
            console.error(`APICallError:\nYou are hitting a unexpected error, when process the API response\nError pointer: ${(response * 1)}\n\nPlease check out the error logs of CHS(${new URL('https://chsweb.vercel.app/docs?search=error%20log')}) for understand this better. \n\n`);
        }
        return true;
    }else{
        if(response?.result && response?.metadata && response?.network){
            if(permite_to_speck != 'mute'){
                console.info('No error detected, You are good to go.\n');
            }
        }else{
            if(permite_to_speck != 'mute'){
                console.warn('Response_Exception: Some parameters are missing on this response.\nPlease ensure that the provided response is not include any error or the sender is CHSAPI\n\n');
            }
        }
        return false;
    }
}


// Export the class as a Node.js module
module.exports = CHSCDN;


// Developermode function for activate/run cdn on localserver with localhost chsapi 
function developermode(key){
    if((key * 1) -(key * 1) == 0){
        apilink = "http://127.0.0.1:8080";
    }
}

// Test function for emergency testing
function test(){
    console.log("Ahoy hoy, this cdn worked!");
}



