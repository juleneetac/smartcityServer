'use strict';
import crypto = require('crypto');

let algorithm = 'aes-192-cbc';
let password = 'Lo que me de la gana';


async function postCaso (req, res){  //registrarse un usuario si el usuario ya existe da error
    let nombre = req.body.addcaso;
    console.log(req.body);
        try{
            console.log("Nombre recibido: "+ nombre)
            return res.status(201).send({message: "Nuevo Post añadido"}) 
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
    let key = '89a1f34a907ff9f5d27309e73c113f8eb084f9da8a5fedc6'

    // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
    // shown here.
    let iv = Buffer.alloc(16, 0); // de momento todo 0 mas tarde pondremos el segundo numero aleatorio

    let cipher = crypto.createCipheriv(algorithm, key, iv);

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

    cipher.write('some clear text data');
    cipher.end();
    console.log('esto es la frase: ' + encrypted)
    let encryptacion = {encrypted, iv}
    console.log(encryptacion)
    res.status(200).json(encryptacion);
   // console.log(this.frase)
    };

    module.exports = {postCaso, getFrase};



