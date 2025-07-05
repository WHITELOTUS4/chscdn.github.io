const path = require('path');

class Address{
    constructor(){
        this.address = true;
    }

    node_modules_path(){
        let node_modules_path;
        
        try{
            node_modules_path = String(path.join(require.main.path, '..')).endsWith('node_modules')?path.join(require.main.path, '..'):path.join(require.main.path, 'node_modules');
        }catch{
            node_modules_path = path.join(path.join(__dirname, '../'), '../');
        }
        return node_modules_path;
    }

    log_path(){
        let error_log_path;
        try{
            error_log_path = String(path.join(require.main.path, '..')).endsWith('node_modules')?path.join(require.main.path, '../dist/error_log.json'):path.join(require.main.path, 'node_modules/chscdn/dist/error_log.json');
        }catch{
            error_log_path = path.join(path.join(__dirname, '../'), '../chscdn/dist/error_log.json');
        }
        return error_log_path;
    }
}

module.exports = Address;
module.exports.default = Address;