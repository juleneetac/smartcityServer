'use strict';
import crypto = require('crypto');
import { isConstructorDeclaration } from 'typescript';
import { PublicKey } from '../rsa/publicKey';
const bc = require('bigint-conversion');
import { RSA  as classRSA} from "../rsa/rsa";
import * as objectSha from 'object-sha'
import { bigintToHex, bigintToText, hexToBigint, textToBigint } from 'bigint-conversion';
import { Console } from 'console';
const got = require('got');
const paillierBigint = require('paillier-bigint')
const sss = require('shamirs-secret-sharing')

let password = 'Lo que me de la gana';//no se usa
let algorithm = 'aes-256-cbc';
let key = '89a1f34a907ff9f5d27309e73c113f8eb084f9da8a5fedc61bb1cba3f54fa5de'
let keyBuf =Buffer.from(key, "hex")
let rsa  = new classRSA;
let keyPair; //no se usa
execrsa()   //ejecuta el generateRandomKeys() al iniciarse el program para tener las claves para todo el rato
let pubKeyClient:PublicKey;
let ttp;
let norepudioMessage;
let intID;
let ttpPubKey: PublicKey;
let ivc;
let publicKeyPaill;
let privateKeyPaill;
//secretSharing()

///////////////////////AES//////////////////////////////
async function postCaso (req, res){  //AES

    let nombre = req.body.addcaso;
    let iv = req.body.iv; //convertir
    let ivBuf =stringToArrayBuffer(iv)
    let nombreBuf = stringToArrayBuffer(nombre)
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
  keyPair = await rsa.generateRandomKeys();  //generqa keys RSA
  const keyPairPaill = await paillierBigint.generateRandomKeys(3072) //generam keys de paillier
  publicKeyPaill =  keyPairPaill.publicKey
  privateKeyPaill =  keyPairPaill.privateKey
  console.log("ok")
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
    e = bc.hexToBigint(e)
    n =  await bc.hexToBigint(n)
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
      console.log("Yo firmo el mensaje "+ m + " del cliente:")
      const s = await rsa.privateKey.sign(m);
      res.status(200).send({msg: bc.bigintToHex(s)})
      
    }
    catch(err) {
      res.status(500).send ({ message: err})
    }
  }

async function getFraseRSA(req, res) {
  let msgg= "Prueba"
  let encmsg= await pubKeyClient.encrypt(msgg)
    try {
      res.status(200).send({msg: encmsg})
    } 
    catch (err) {
      console.log(err)
      res.status(500).send({msg: err})
    }
  }
  ///////////////////////////////FIRMA CIEGA ///////////////////////////////////////////////
  
  async function signMsgCiega(req, res) {   // aquí el servidor firma lo que le llega pero sin saber que es lo que le ha llegado y lo devuelve firmado
    try {
      console.log("firmo cegadamente: " + req.body.msg)
      const m = bc.hexToBigint(req.body.msg);
      const signedbm = rsa.privateKey.sign(m)
      //const s = await rsa.privateKey.sign(m);
      res.status(200).send({msg: bc.bigintToHex(signedbm)})
    }
    catch(err) {
      res.status(500).send ({ message: err})
    }
  }

  ///////////////////////////////NO REPUDIO ///////////////////////////////////////////////
  async function postCasoNoRepudio(req,res){
    try {
      await getTTPKey()
      //req.body.body.msg= bc.bigintToText(bc.hexToBigint(req.body.body.msg))
      const body = req.body.body; 
      ivc = req.body.iv
      const proof =bc.hexToBigint(req.body.proof.proof)
       let e = await VerifyProof(proof,body)
      if(e== "zi")
      {        
      
        ttp= body.ttp
        norepudioMessage = bigintToText(rsa.privateKey.decrypt(bc.hexToBigint(body.msg))) 
        let d = new Date();
        const unixtime = d.valueOf();
        let body2= {type:"2",src:"A",dst:"B",ttp:body.ttp,ts:unixtime}//el body sin mensaje?
        let prueba = await digitalSignature(body2);                 //PARA ELLO COPIAR LA FUNCION DE PROOF DE EL OTRO SITIO YM TAL       
        let obj:Object  = {
          body:body2,
          proof:{type:"reception",proof: prueba, fields:["type","src","dst","ttp","ts"]}
        }
        intID=setInterval(getNoRepudio, 1000)
        return res.status(200).send({obj:obj}) //ESTO ESE PUTADA
        

      }
      else console.log("proof : " + proof + "body: " + body)
      res.status(501).send ({ message: "sa jodio la cosa"})
      
    }
    catch(err) {
      console.log(err)
      res.status(500).send ({ message: err})
    }

  }

  async function getNoRepudio() {
      
        const cosaget = await getTTPobj()
        const body = cosaget.object.body;
        const proof =bc.hexToBigint(cosaget.object.proof.proof)
        let e = await VerifyProof(proof,body)
        clearInterval(intID)
       if(e== "zi")
       { 
         //Esto es la clave K, tenemos que decriptar el rsa
        let clave= bigintToText(rsa.privateKey.decrypt(bc.hexToBigint(body.msg))) 
        let claveBuf =Buffer.from(clave, "hex")
        //Aqui empezamos a decriptar el AES del primer mensaje con la K
        let msg = norepudioMessage;
        let iv = ivc; //convertir
        let ivBuf =stringToArrayBuffer(iv)
        let msgBuf = stringToArrayBuffer(msg)
        const decipher = crypto.createDecipheriv(algorithm, claveBuf, ivBuf);
        let decrypted = '';
        let chunk;
        decipher.on('readable', () => {
           while (null !== (chunk = decipher.read())) {
             decrypted += chunk.toString('utf8');
        }
        });
        decipher.on('end', () => {
            console.log("resultado de NO REPUDIO : "+ decrypted);
        // Prints: some clear text data
       });

    // Encrypted with same algorithm, key and iv.
      ;
        decipher.write(msgBuf, 'hex');
      
        decipher.end();

       }
      }   
  
  async function getTTPobj(){
    let response = (await got('http://localhost:7800/caso/getTTPobj'));
    response = JSON.parse(response.body);
    return response
}
async function getTTPKey(){
  let response = (await got('http://localhost:7800/caso/publickey'));
  response = JSON.parse(response.body);
  ttpPubKey = new PublicKey (bc.hexToBigint(response.e), bc.hexToBigint(response.n)) 

}


  async function digitalSignature(obj:Object){
    const digest = await objectSha.digest(obj)
    return bc.bigintToHex(rsa.privateKey.sign(bc.hexToBigint(digest))); //si no va cambiar a hex
  }

  async function VerifyProof(proof:Object, body)
  {
    const hashobj= await objectSha.digest(body)
    let hashproof
    if(body.type === "5") //esto es para que si el proof es de la ttp se verifique con la pub de ttp
      {
        console.log("esto es de la ttp ↨")
         hashproof= await bc.bigintToHex(ttpPubKey.verify(proof))
      }
    else  hashproof= await bc.bigintToText(pubKeyClient.verify(proof)) //verify de B
    console.log("1 hash del body que nos llega: "+ hashobj)
    console.log("2 proof: "+ hashproof)
    console.log(hashobj==hashproof)
    if (hashobj==hashproof)
    return "zi"
    else return "no"
  }

///////////////////////////////PAILLIER (homomorphic encryption) ///////////////////////////////////////////////
async function getPublicKeyPaillier(req, res) {  
  
  try {
    //keyPair = await rsa.generateRandomKeys(); //NO PONER this.
    res.status(200).send({
      n: await bc.bigintToHex(publicKeyPaill.n),
      g: await bc.bigintToHex(publicKeyPaill.g)
    })
  }
  catch(err) {
    console.log("error recibiendo la public key de paillier"+ err)
    res.status(500).send ({ message: err})   
  }
}


async function postSumPaillier(req, res) {
  
  try {
    const encryptedsum = req.body.encryptedsum;
    console.log("Se ha recibido la suma ecriptada: " + encryptedsum)
    const suma = await privateKeyPaill.decrypt(bc.hexToBigint(encryptedsum))   //keyPair["privateKey"].decrypt(bc.hexToBigint(c));
    console.log("la suma desencriptada es: " + suma)
    return res.status(200).send({sum: bc.bigintToHex(suma)})
    
  }
  catch(err) {
    console.log(err)
    res.status(500).send ({ message: err})
  }
}

/////////////////////////////// SECRET SHARING ///////////////////////////////////////////////
async function postSecretSharing(req, res) {
  // const secret = "secret key"
  // const shares = sss.split(secret, { shares: 7, threshold: 4 })
  // let i = 0                                          //Ya hemos generado las partes de la clave ya no nos hace falta
  // while (i < 7){
  //   console.log(buf2hex(shares[i]))
  //   i++;
  // }
  try {
    const shares = req.body.shares;
    const recovered = sss.combine([shares[0], shares[1], shares[2], shares[3]])

    console.log("las claves del threshold que nos envia el cliente son: ")
    console.log([shares[0], shares[1], shares[2], shares[3]])
    console.log("el combine de las claves funciona: " + recovered.toString()) // 'secret key' 
    return res.status(200).send({recovered: recovered.toString()})
    
  }
  catch(err) {
    console.log(err)
    res.status(500).send ({ message: err})
  }
}

function ab2str(buf) { //Array Buffer to string
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function buf2hex(buffer) { // ArrayBuffer to hex
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}




module.exports = {postCaso, 
                  getFrase, 
                  getFraseRSA, 
                  postCasoRSA, 
                  signMsgRSA, 
                  signMsgCiega,
                  getPublicKeyRSA, 
                  postpubKeyRSA,
                  postCasoNoRepudio, 
                  postSumPaillier,
                  getPublicKeyPaillier,
                  postSecretSharing
                };



