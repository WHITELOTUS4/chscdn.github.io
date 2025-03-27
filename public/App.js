class App{
    constructor(){
        this.access_key = "3045dd712ffe6e702e3245525ac7fa38"
    }
    isHosted(req){
        const host = req.hostname;
        if(host === 'localhost' || host === '127.0.0.1'){
            return false;
        }else{
            return true;
        }
    }
}

module.exports = App;