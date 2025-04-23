// Variable declaration
let apilink = "https://chsapi.vercel.app";

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
    }
}

// CDN methods initialisation

CHSCDN.prototype.APICaller = function(values){
    let responce;
    if(this.inputVerified(values)){
        if(values.task=='deepfake detect'){
            responce = this.dfd(values);
        }else if(values.task=='image converter'){
            responce = this.imgconverter(values);
        }else if(values.task=='image compressor'){
            responce = this.imgcompressor(values);
        }else if(values.task=='text to image generator'){
            responce = this.imggenerator(values);
        }else if(values.task=='image to pdf'){
            responce = this.imgtopdf(values);
        }else{
            console.warn("Opeartion_Exception: Please use pre-define media operation.\nProvided information are not evaluate due to the undefine task!\n\nGiven task: "+values.task+"\nAbove task is not listed\n\n");
        }
        return responce;
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

CHSCDN.prototype.image_to_base64 = function(link){
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
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = function (error) {
            reject(`Failed to load image: ${error}`);
        };
        img.src = link;
    });
}

CHSCDN.prototype.dfd = function(values){

}

CHSCDN.prototype.imgconverter = function(values){

}

CHSCDN.prototype.imgcompressor = function(values){

}

CHSCDN.prototype.imggenerator = function(values){

}

CHSCDN.prototype.imgtopdf = function(values){

}

// Developermode function for activate/run cdn on localserver with localhost chsapi 
function developermode(key){
    if((key*1) - (key*1) == 0){
        apilink = "http://127.0.0.1:8080";
    }
}

// Test function for emergency testing
function test(){
    console.log("Ahoy hoy, this cdn worked!");
}
