'use strict';
import crypto = require('crypto');

let algorithm = 'aes-256-cbc';
let key = '89a1f34a907ff9f5d27309e73c113f8eb084f9da8a5fedc61bb1cba3f54fa5de'
    let keyBuf =Buffer.from(key, "hex")

async function postCaso (req, res){  //registrarse un usuario si el usuario ya existe da error
    let nombre = req.body.addcaso;
    let iv = req.body.iv; //convertir
    console.log("antes "+ iv)
    let ivBuf =stringToArrayBuffer(iv)
    console.log("despues "+ ivBuf)
    let nombreBuf = stringToArrayBuffer(nombre)
    console.log(req.body);
    const decipher = crypto.createDecipheriv(algorithm, keyBuf, ivBuf);
    let decrypted = '';
    let chunk;
    decipher.on('readable', () => {
         while (null !== (chunk = decipher.read())) {
             decrypted += chunk.toString('utf8');
        }
    });
    decipher.on('end', () => {
        console.log("resultado "+ decrypted);
        // Prints: some clear text data
    });

    // Encrypted with same algorithm, key and iv.
      ;
    decipher.write(nombreBuf, 'hex');
    decipher.end();
    
        try{
            
            console.log("Nombre recibido: "+ nombre)
            return res.status(201).send({message: "me has enviado: "+ decrypted}) 
            } 
        catch (err) {
            res.status(500).send(err);
            console.log(err);
            }
    }
async function getFrase (req, res){ //me da datos de un estudiante especifico
    //let key = crypto.scryptSync(password, 'salt', 24);
    //console.log('esto es la Key: ' + key.toString('hex'))
    //let keyhex = key.toString('hex')
    // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
    // shown here.
    let iv = Buffer.alloc(16, crypto.randomBytes(16)); // de momento todo 0 mas tarde pondremos el segundo numero aleatorio
    let ivhex = iv.toString('hex')
    let cipher = crypto.createCipheriv(algorithm, keyBuf, iv);

    let encrypted = '';
    cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
            encrypted += chunk.toString('hex');
        }
    });
    cipher.on('end', () => {
        console.log('esto es el encrypted: ' + encrypted);
        // Prints: e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa
    });

    cipher.write('LA FRASE FUNCIONA');

    cipher.end();
    console.log('esto es la frase: ' + encrypted)
    
    let encryptacion = {encrypted, ivhex}
    console.log(encryptacion)
    res.status(200).json(encryptacion);
   // console.log(this.frase)
    };
    var stringToArrayBuffer=function(str){ 
        var bytes = new Uint8Array(str.length);
        for (var iii = 0; iii < str.length; iii++){
          if (str.charCodeAt(iii) !== ",")
          bytes[iii] = str.charCodeAt(iii);
        }
        return bytes;
      }
      /* function str2ab(str) { //hace lo mismo que lo de arriba
        var buf = new ArrayBuffer(str.length); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return bufView;
      } */
    module.exports = {postCaso, getFrase};



