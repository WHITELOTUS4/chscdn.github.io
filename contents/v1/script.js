// Variable declaration
let apilink = "https://chsapi.vercel.app";
let weblink = "https://chsweb.vercel.app";
let cdnlink = "https://chscdn.vercel.app";

// Document load and system setups
document.addEventListener("DOMContentLoaded",() => {
    if(!navigator.onLine){
        console.error("ERR_INTERNET_DISCONNECTED: Looks like you're not connected to the internet, Unable to establish connection with CHSAPI due to network issues.\n\nPlease verify your Wi-Fi or network connection is stable and try again.\n\n");
    }

    // Developer mode activate on localhost
    if(window.location.host == ''){
        developermode(1441);
    }
});

// CDN class with basics initialisation
class CHSCDN{
    constructor(){
        this.apilink = apilink;
        this.apikey = '';
        this.weblink = weblink;
        this.cdnlink = cdnlink;
        this.img_extensions = ['.jpg', '.jpeg', '.png', '.peng', '.bmp', '.gif', '.webp', '.svg', '.jpe', '.jfif', '.tar', '.tiff', '.tga'];
        this.vdo_extensions = ['.mp4', '.mov', '.wmv', '.avi', '.avchd', '.flv', '.f4v', '.swf', '.mkv', '.webm', '.html5'];
        this.error_log = this.getLogs();
    }

    // Developermode method for activate/run cdn on localserver with localhost chsapi 
    developermode(){
        apilink = this.apilink = "http://127.0.0.1:8000";
        weblink = this.weblink = "http://127.0.0.1:5000";
        cdnlink = this.cdnlink = "http://127.0.0.1:8080";
    }

    // Fetching logs from CDN server
    async getLogs(){
        if(navigator.onLine){
            try{
                const response = await fetch(`${cdnlink}/logs`, {
                    method: 'GET'
                });
                if(!response.ok){
                    const errorDetails = await response.json();
                    console.error('API Error:', errorDetails);
                    return false;
                }
                const result = await response.json();
                return result;
            }catch(error){
                console.error('Error to fetching logs:', error);
            }
        }
        return undefined;
    }
}

// CDN methods initialisation

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
    if(values == {} || values == [] || values == undefined || values == ''){
        return false;
    }
    if(!values?.task && !values?.media){
        return false;
    }
    if(!values?.media.startsWith('data:')){
        return false;
    }
    return true;
}

// CHSCDN.prototBisValidBase64Media = function(link){
//     const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
//     if(!extMatch) return false;

//     const ext = '.' + extMatch[1].toLowerCase();
//     return this.img_extensions.includes(ext);
// }

CHSCDN.prototype.isValidImage = function(link){
    const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    if (!extMatch) return false;

    const ext = '.' + extMatch[1].toLowerCase();
    return this.img_extensions.includes(ext);
}

CHSCDN.prototype.isValidVideo = function(link){
    const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    if(!extMatch) return false;

    const ext = '.' + extMatch[1].toLowerCase();
    return this.vdo_extensions.includes(ext);
}

CHSCDN.prototype.mediaType = function(base64_str){
    let type = base64_str.split('/')[0].split(':')[1];
    if(type == 'image' || type == 'video'){
        return type;
    }else{
        return null;
    }
}

CHSCDN.prototype.isValidBase64Media = function(base64String){
    const regex = /^data:([a-zA-Z]+\/[a-zA-Z0-9\-+.]+);base64,/;
    const matches = base64String.match(regex);

    if (!matches) return false;

    const mimeType = matches[1].toLowerCase();
    const ext = '.' + mimeType.split('/')[1];

    if(mimeType.startsWith('image/')){
        if(!this.img_extensions.includes(ext)) return false;
        const size = this.base64_size(base64String);
        if(size < 4 || size > (30 * 1024)) return false;
        return true;
    }
    if(mimeType.startsWith('video/')){
        if(!this.vdo_extensions.includes(ext)) return false;
        const size = this.base64_size(base64String);
        if(size < 20 || size > (400 * 1024)) return false;
        return true;
    }
    return false;
}

CHSCDN.prototype.image2base64 = async function(link){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        if(!this.isValidImage(link)){
            console.error(`Extension_Exception: Provided media has unsupported image extension\nPlease provid the meida with valid extension, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')}to get extension list\n\n`);
            reject(false);
        }
        img.onload = function(){
            try{
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const base64String = canvas.toDataURL("image/png");
                canvas.remove();
                resolve(base64String);
            }catch(error){
                reject(error);
            }
        };
        img.onerror = function(error){
            reject(`Failed to load image: ${error}`);
        };
        img.src = link;
    });
}

CHSCDN.prototype.image_to_base64 = async function(link){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
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
        const ext = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
        const mimeType = mimeMap[ext];
        if(mimeType != undefined){
            console.error(`Extension_Exception: Provided media has unsupported image extension\nPlease provid the meida with valid extension, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')}to get extension list\n\n`);
            reject(false);
        }
        img.onload = function(){
            try{
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const base64String = canvas.toDataURL(mimeType);
                canvas.remove();
                resolve(base64String);
            }catch(error){
                reject(error);
            }
        };
        img.onerror = function(error){
            reject(`Failed to load image: ${error}`);
        };
        img.src = link;
    });
};

CHSCDN.prototype.video2base64 = async function(link){
    return new Promise(async(resolve, reject) => {
        if(!this.isValidVideo(link)){
            console.error(`Extension_Exception: Provided media has unsupported video extension\nPlease provid the meida with valid extension, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')}to get extension list\n\n`);
            reject(false);
        }
        const extMatch = link.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
        const ext = '.' + extMatch[1].toLowerCase();
        const mimeType = `video/${ext.replace('.', '')}`;
        try{
            const response = await fetch(link);
            if(!response.ok) throw new Error("Failed to get the video file from provided link");
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = function(){
                const base64String = `data:${mimeType};base64,${reader.result.split(',')[1]}`;
                resolve(base64String);
            };
            reader.onerror = function(error){
                reject(`Failed to read video as base64: ${error}`);
            };
            reader.readAsDataURL(blob);
        }catch(error){
            reject(`Error fetching or converting video: ${error}`);
        }
    });
};

CHSCDN.prototype.base64_size = function(base64_string){
    if(!base64_string.startsWith("data:")){
        console.warn(`TypeError:\n Expected a base64 string value for attribute 'base64_string', but got ${typeof(base64_string)}instead\n\n`);
        return null;
    }
    // const blob = new Blob([base64_string],{ type: 'text/plain' });
    // const stringSizeInBytes = blob.size;
    // const stringSizeInKB = Math.floor(stringSizeInBytes / 1024);
    // return stringSizeInKB;
    const base64Str = base64_string.split(',')[1] || base64_string;

    const padding = (base64Str.endsWith('==')) ? 2 : (base64Str.endsWith('=')) ? 1 : 0;
    const bytes = (base64Str.length * 3) / 4 - padding;

    return +(bytes / 1024).toFixed(2);
}

CHSCDN.prototype.getMediaExtension = function(base64_string){
    const mimeType = base64_string.match(/^data:([a-z]+\/[a-z0-9-+.]+);/);
    if(mimeType){
        const extension = mimeType[1].split('/')[1];
        return extension;
    }else{
        return null;
    }
}

CHSCDN.prototype.extractFramesFromBase64Video = async function(base64Video, fps = 1){
    return new Promise((resolve, reject) => {
        const frames = [];
        const video = document.createElement('video');
        video.src = base64Video;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.addEventListener('loadedmetadata',() => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            let currentTime = 0;
            function captureFrame(){
                video.currentTime = currentTime;
            }
            video.addEventListener('seeked',() => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Image = canvas.toDataURL('image/jpeg'); // or 'image/png'
                frames.push({ second: currentTime, image: base64Image });
                currentTime += 1;
                if(currentTime <= video.duration){
                    captureFrame();
                }else{
                    resolve(frames);
                }
            });
            captureFrame();
        });
        video.addEventListener('error',(e) => reject(`Video error: ${e.message || e}`));
    });
}

CHSCDN.prototype.compressBase64Image = async function(base64_image, maxSizeKB = 900, minSkipSizeKB = 600){
    function base64SizeKB(base64){
        let len = base64.length * (3 / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
        return len / 1024;
    }
    if(base64SizeKB(base64_image) < minSkipSizeKB){
        return base64_image;
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            let quality = 0.95;
            let compressedBase64;
            while(quality >= 0.1){
                compressedBase64 = canvas.toDataURL("image/jpeg", quality);
                const sizeKB = base64SizeKB(compressedBase64);
                if (sizeKB <= maxSizeKB) break;
                quality -= 0.05;
            }
            resolve(compressedBase64);
        };
        img.onerror = () => reject("Failed to load image for compression.");
        img.src = base64_image;
    });
}

CHSCDN.prototype.load_media = async function(base64String){
    const parts = [];
    if(base64String == undefined){
        base64String = '';
    }
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
                const response = await fetch(url + "/load/single",{
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
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
                    return "true";
                }
            }catch(error){
                if(error?.cause?.errno == -4078 || error?.cause?.code == 'ECONNREFUSED') return false;
                console.log(`Error on attempt ${attempts} for part ${index}:`, error);
            }
        }
        return false;
    }
    for(let i = 0; i < parts.length; i++){
        const isSuccess = await sendPart(parts[i], i + 1, limit, this.apilink, this.apikey);
        if(!isSuccess){
            return 24;
        }
    }
    return "true";
}

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
}

CHSCDN.prototype.dfd = async function(values){
    try{
        if(this.mediaType(values.media) == 'image' && this.isValidBase64Media(values.media)){
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
        }else if(this.mediaType(values.media) == 'video' && this.isValidBase64Media(values.media)){
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
                    if(first_failer == 0){
                        first_failer++;
                        i--;
                    }else{
                        responce_tree.push(loosParameterRecover());
                    }
                }
            }
            let responce_tree_summarize = summarizePrototypeResults(responce_tree);
            let result = analyzeClassificationSequence(prediction_list);
            result.responce_tree = responce_tree_summarize;
            let data = { 
                "result": result,
                "metadata": {
                    "version": "1.0.0",
                    "header": {
                        "Content-Type": "application/json"
                    }
                },
                "network": {
                    "url": "https://chsapi.vercel.app/api/",
                    "kernel": "inphant api",
                    "provider": "chsapi"
                },
                "source": "WHITE LOTUS Community",
            };
            return data;
        }else{
            console.error(`Media_Exception: Provided media has not pre-define media type\nPlease provid the valid media type as image or video, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')} to get extension list\n\n`);
            return null;
        }
    }catch(e){
        console.error("APICallError:\n" + e + "\n\n");
    }
}

function analyzeClassificationSequence(predictions){
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
                fakeSequences = [...currentSequence]; // copy
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

function loosParameterRecover(){
    return{
        "prototype_1":{ "class": "Real", "accuracy": 50 },
        "prototype_2":{ "class": "Fake", "accuracy": 50 },
        "prototype_3":{ "class": "Fake", "accuracy": 50 }
    }
}

function summarizePrototypeResults(response_tree){
    const summary ={};
    response_tree.forEach(entry => {
        for(let proto in entry){
            const result = entry[proto];
            const label = result.class.toLowerCase();
            const accuracy = result.accuracy;
            if(!summary[proto]){
                summary[proto] ={
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
		const validImage = this.isValidBase64Media(values.media);
		
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
        	console.error(`Media_Exception: Provided media has not pre-define media type\nPlease provid the valid media type as image or video, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')} to get extension list\n\n`);
            return null;
        }
	}catch(e){
        console.error("APICallError:\n" + e + "\n\n");
    }
}

CHSCDN.prototype.imgcompressor = async function(values){
    try{
		const mediaType = this.mediaType(values.media);
		const validImage = this.isValidBase64Media(values.media);
		
		if(mediaType === "image" && validImage){
			const connection = await this.load_media(values.media);
            if(this.noise_detect(connection)) return this.handle_error(connection);

            const response = await this.chsAPI(`${this.apilink}/api/imageCompressor`,{
                height: null,
                width: null,
                quality: values.quality || 70,
                img: '',
                load: 'true',
                key: this.apikey
            });

            if(this.noise_detect(response)) return this.handle_error(response);
            return response;
		}else{
        	console.error(`Media_Exception: Provided media has not pre-define media type\nPlease provid the valid media type as image or video, for more understanding visit ${new URL('https://chsweb.vercel.app/docs?search=Media%20Format')} to get extension list\n\n`);
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
    if((data * 1) -(data * 1) == 0){
        return true;
    }else{
        return false;
    }
}

CHSCDN.prototype.handle_error = function(code){
    try{
        return this.error_log.find((error) => error.error === code) || null;
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

// Developermode function for activate/run cdn on localserver with localhost chsapi 
function developermode(key){
    if((key * 1) -(key * 1) == 0){
        apilink = "http://127.0.0.1:8000";
        weblink = "http://127.0.0.1:5000";
        cdnlink = "http://127.0.0.1:8080";
    }
}

// Test function for emergency testing
function test(){
    console.log("Ahoy hoy, this cdn worked!");
}
