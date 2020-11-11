'use strict';
import crypto = require('crypto');
import { isConstructorDeclaration } from 'typescript';
import { PublicKey } from '../rsa/publicKey';
const bc = require('bigint-conversion');
import { RSA  as classRSA} from "../rsa/rsa";

let password = 'Lo que me de la gana';
let algorithm = 'aes-256-cbc';
let key = '89a1f34a907ff9f5d27309e73c113f8eb084f9da8a5fedc61bb1cba3f54fa5de'
let keyBuf =Buffer.from(key, "hex")
let rsa  = new classRSA;
let keyPair;
execrsa()   //ejecuta el generateRandomKeys() al iniciarse el program para tener las claves para todo el rato
let pubKeyClient;


///////////////////////AES//////////////////////////////
async function postCaso (req, res){  //AES

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

async function getFrase (req, res){ //me da datos de un estudiante especifico  AES
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
    };

//Para convertir de String a array buffer Necesario para el Post
    var stringToArrayBuffer=function(str){ 
        var bytes = new Uint8Array(str.length);
        for (var iii = 0; iii < str.length; iii++){
          if (str.charCodeAt(iii) !== ",")
          bytes[iii] = str.charCodeAt(iii);
        }
        return bytes;
      }


///////////////////////////////RSA/////////////////////////////

async function execrsa(){   //genera las keyPair
  keyPair= await rsa.generateRandomKeys();
  console.log(rsa.publicKey.e)
  console.log(rsa.privateKey.d)
  console.log("SE ESTA EJECUTANDO ESTO")
  //console.log(keyPair)
}

async function getPublicKeyRSA(req, res) {  

        try {
          //keyPair = await rsa.generateRandomKeys(); //NO PONER this.
          
          res.status(200).send({
            e: await bc.bigintToHex(rsa.publicKey.e),
            n: await bc.bigintToHex(rsa.publicKey.n)
          })
        }
        catch(err) {
          console.log("error recibiendo la public key"+ err)
          res.status(500).send ({ message: err})   
        }
      }

async function postpubKeyRSA(req, res) {   //el cliente me pasa su pubKey para encryptar el mensaje
  try {
    let e = req.body.e;
    let n = req.body.n;
    console.log("AHORA MOSTRARA LA PUBLICKEY DEL CLIENTE")
    e = bc.hexToBigint(e)
    n =  await bc.hexToBigint(n)
    console.log("esto es la e:" + e)
    console.log("esto es la n:" + n)
    pubKeyClient = new PublicKey (e, n)  //creo una nueva publicKey del cliente 
    return res.status(200).send({message: "el server ya tiene tu publicKey"})
  }
  catch(err) {
    res.status(500).send ({ message: err})
  }
}
      

async function postCasoRSA(req, res) {
  try {
    const c = req.body.msg;
    const m = await rsa.privateKey.decrypt(bc.hexToBigint(c))   //keyPair["privateKey"].decrypt(bc.hexToBigint(c));
    console.log(bc.bigintToText(m))
    return res.status(200).send({msg: bc.bigintToHex(m)})
  }
  catch(err) {
    res.status(500).send ({ message: err})
  }
}
      
async function signMsgRSA(req, res) {
    try {
      const m = bc.hexToBigint(req.body.msg);
      const s = await keyPair["privateKey"].sign(m);
      res.status(200).send({msg: bc.bigintToHex(s)})
    }
    catch(err) {
      res.status(500).send ({ message: err})
    }
  }

async function getFraseRSA(req, res) {
  let msgg= "Prueba"
  console.log(pubKeyClient.n)
  let encmsg= await pubKeyClient.encrypt(msgg)
    try {
      res.status(200).send({msg: encmsg})
    } 
    catch (err) {
      console.log(err)
      res.status(500).send({msg: err})
    }
  }
  
module.exports = {postCaso, getFrase, getFraseRSA, postCasoRSA, signMsgRSA, getPublicKeyRSA, postpubKeyRSA};



