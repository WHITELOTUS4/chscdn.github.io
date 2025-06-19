// Variable declaration
let apilink = "https://chsapi.vercel.app";
let weblink = "https://chsweb.vercel.app";

// Document load and system setups
document.addEventListener("DOMContentLoaded",() => {
    if(!navigator.onLine){
        console.error("ERR_INTERNET_DISCONNECTED: Looks like you're not connected to the internet, Unable to establish connection with CHSAPI due to network issues.\n\nPlease verify your Wi-Fi or network connection is stable and try again.\n\n");
    }
    
    // Developer mode activate on localhost
    if(window.location.host==''){
        developermode(1441);
    }
});

// CDN class with basics initialisation
class CHSCDN{
    constructor(){
        this.apilink = apilink;
        this.apikey = '';
        this.weblink = weblink;
    }

    // Developermode method for activate/run cdn on localserver with localhost chsapi 
    developermode(){
        apilink = this.apilink = "http://127.0.0.1:8000";
        weblink = this.weblink = "http://127.0.0.1:5000";
    }
}

// CDN methods initialisation

CHSCDN.prototype.APICaller = async function(values){
    let response;
    if(this.inputVerified(values)){
        if(values.task=='deepfake detect'){
            response = await this.dfd(values);
        }else if(values.task=='image converter'){
            response = await this.imgconverter(values);
        }else if(values.task=='image compressor'){
            response = await this.imgcompressor(values);
        }else if(values.task=='text to image generator'){
            response = await this.imggenerator(values);
        }else if(values.task=='image to pdf'){
            response = await this.imgtopdf(values);
        }else{
            console.warn("Opeartion_Exception: Please use pre-define media operation.\nProvided information are not evaluate due to the undefine task!\n\nGiven task: "+values.task+"\nAbove task is not listed\n\n");
        }
        return response;
    }else{
        console.warn(`Structural_Exception: Please use required inputs structure to use chsapi\nfor understanding the basic structure of each api endpoint, must visit ${new URL('https://chsweb.vercel.app/docs?search=basemodel')}\n\tOR,\nwatch ${new URL('https://youtube.com/@whitelotus4')}\n\n`);
        return null;
    }
}

CHSCDN.prototype.inputVerified = function(values){
    if(values=={} || values==[] || values==undefined || values==''){
        return false;
    }
    if(!values?.task && !values?.media){
        return false;
    }
    return true;
}

CHSCDN.prototype.image2base64 = async function(link){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
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
        img.onerror = function (error) {
            reject(`Failed to load image: ${error}`);
        };
        img.src = link;
    });
}

CHSCDN.prototype.base64_size = function(base64_string){
    if(!base64_string.startsWith("data:")){
        console.warn(`TypeError:\n Expected a base64 string value for attribute 'base64_string', but got ${typeof(base64_string)} instead\n\n`);
        return null;
    }
    const blob = new Blob([base64_string], { type: 'text/plain' });
    const stringSizeInBytes = blob.size;
    const stringSizeInKB = Math.floor(stringSizeInBytes / 1024);
    return stringSizeInKB;
}

CHSCDN.prototype.getMediaExtension = function(base64_string) {
    const mimeType = base64_string.match(/^data:([a-z]+\/[a-z0-9-+.]+);/);
    if(mimeType){
      const extension = mimeType[1].split('/')[1];
      return extension;
    }else{
      return null;
    }
}

CHSCDN.prototype.load_media = async function(base64String){
    const parts = [];
    if(base64String==undefined){
        base64String='';
    }
    let limit = Math.floor(this.base64_size(base64String)/900)+2;
    const partLength = Math.ceil(base64String.length / limit);
    for(let i = 0; i < limit; i++){
        parts.push(base64String.slice(i * partLength, (i + 1) * partLength));
    }
    async function sendPart(part, index, limit, url, key){
        let attempts = 0;
        while(attempts < 3){
            attempts++;
            try{
                const response = await fetch(url+"/load/single", {
                    method: 'POST',
                    headers: {
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
                if(error?.cause?.errno==-4078 || error?.cause?.code=='ECONNREFUSED') return false;
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
            const response = await fetch(url, {
                method: 'POST',
                headers: {
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
        const connection = await this.load_media(values.media);
        if(this.noise_detect(connection)) return this.handle_error(connection);
            
        const response = await this.chsAPI(`${this.apilink}/api/dfdScanner`, {
            ext: this.getMediaExtension(values.media),
            media: '',
            load: 'true',
            key: this.apikey,
            heatmap: 'false'
        });
        if(this.noise_detect(response)) return this.handle_error(response);
        return response;
    }catch(e){
        console.error("APICallError:\n"+e+"\n\n");
    }
}

CHSCDN.prototype.imgconverter = async function(values){

}

CHSCDN.prototype.imgcompressor = async function(values){

}

CHSCDN.prototype.imggenerator = async function(values){

}

CHSCDN.prototype.imgtopdf = async function(values){

}

CHSCDN.prototype.noise_detect = function(data){
    if((data*1) - (data*1) == 0){
        return true;
    }else{
        return false;
    }
}

CHSCDN.prototype.handle_error = function(code){
    try{
        console.log(code);
        return;
    }catch(e){
        console.log("Error found to handle error\n",e);
    }
}

// Developermode function for activate/run cdn on localserver with localhost chsapi 
function developermode(key){
    if((key*1) - (key*1) == 0){
        apilink = "http://127.0.0.1:8000";
        weblink = "http://127.0.0.1:5000";
    }
}

// Test function for emergency testing
function test(){
    console.log("Ahoy hoy, this cdn worked!");
}
