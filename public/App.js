class App{
    constructor(){
        this.access_key = "3045dd*************7fa38"
    }
    isHosted(req){
        const host = req.hostname;
        if(host === 'localhost' || host === '127.0.0.1'){
            return false;
        }else{
            return true;
        }
    }
    modPow(base, exponent, modulus){
        let result = 1;
        base = base % modulus;
        while (exponent > 0) {
            if (exponent % 2 === 1) {
                result = (result * base) % modulus;
            }
            exponent = Math.floor(exponent / 2);
            base = (base * base) % modulus;
        }
        return result;
    }
    isPrime(n){
        if (n < 2) return false;
        if (n === 2 || n === 3) return true;
        if (n % 2 === 0) return false;

        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }
    getRandomPrimes(count, min, max){
        const primes = [];
        for(let i = min; i <= max; i++){
            if (this.isPrime(i)) primes.push(i);
        }

        const selectedPrimes = [];
        while(selectedPrimes.length < count){
            const randomPrime = primes[Math.floor(Math.random() * primes.length)];
            if (!selectedPrimes.includes(randomPrime)) selectedPrimes.push(randomPrime);
        }

        return selectedPrimes;
    }
    generateLargePrime(){
        const smallPrimes = this.getRandomPrimes(10, 3, 50);
        let num = smallPrimes.reduce((prod, prime) => prod * prime, 1);

        while(!this.isPrime(num)){
            num += 1;
        }
        return num;
    }
    findSmallerPrime(prime){
        if (prime <= 2) return 2

        let smallerPrime = prime - 1;
        while(smallerPrime > 1){
            if (this.isPrime(smallerPrime)) return smallerPrime;
            smallerPrime--;
        }
        return prime;
    }
    semi_rsa(p){
        let q = 7;
        let fn = (p-1)*(q-1);
        return fn;
    }
    public_key_genrator(secret){
        let fn = this.semi_rsa(secret);
        let a = '';
        let e = 2;
        while(String(a).indexOf('.')<0){
            a = fn/e;
            e++;
            if (e>100) return 1;
        }
        return (e-1);
    }
    key_pair_genrator(pub1, pub2){
        const secret1 = this.findSmallerPrime(pub1);
        const secret2 = this.findSmallerPrime(pub2);
        const public1 = this.public_key_genrator(secret2);
        const public2 = this.public_key_genrator(secret1);
        return [secret1, public1, secret2, public2];
    }
    Encoder(plain_txt, key){
        const vocabulary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!*+#%$&^,|?/";
        let cipher = "";
        key = key.repeat(Math.ceil(plain_txt.length / key.length));

        for(let i = 0; i < plain_txt.length; i++){
            let plain_txtIndex = vocabulary.indexOf(plain_txt[i]);
            let keyIndex = vocabulary.indexOf(key[i]);
            if(plain_txtIndex !== -1 && keyIndex !== -1){
                let newIndex = (plain_txtIndex + keyIndex) % vocabulary.length;
                cipher += vocabulary[newIndex];
            } else {
                cipher += plain_txt[i];
            }
        }
        return cipher;
    }
    Decoder(cipher, key){
        const vocabulary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!*+#%$&^,|?/";
        let plain_txt = "";
        key = key.repeat(Math.ceil(cipher.length / key.length));

        for(let i = 0; i < cipher.length; i++){
            let cipherIndex = vocabulary.indexOf(cipher[i]);
            let keyIndex = vocabulary.indexOf(key[i]);
            if (cipherIndex !== -1 && keyIndex !== -1) {
                let newIndex = (cipherIndex - keyIndex + vocabulary.length) % vocabulary.length;
                plain_txt += vocabulary[newIndex];
            } else {
                plain_txt += cipher[i];
            }
        }
        return plain_txt;
    }
    async get_choosen_one_of_api(url){
        try{
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds
            const response = await fetch(`${url}/key_exchange`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if(!response.ok){
                const errorDetails = await response.json();
                return errorDetails;
            }
            const result = await response.json();
            return result;
        }catch(error){
            if(error.name === 'AbortError'){
                return 3;
            }
            return 5;
        }
    }
    async return_key_to_api(url, token){
        try{
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds
            const response = await fetch(`${url}/set_key?token=${token}`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if(!response.ok){
                const errorDetails = await response.json();
                return errorDetails;
            }
            const result = await response.json();
            return result;
        }catch(error){
            return false;
        }
    }

}

module.exports = App;