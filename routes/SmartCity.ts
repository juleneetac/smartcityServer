"use strict";

import express = require("express");
let router = express.Router();
let casoControl = require('../controllers/casoControl');


///////////////////////////////AES/////////////////////////////
router.post('/addPost', casoControl.postCaso);   
router.get('/getFrase', casoControl.getFrase);  

///////////////////////////////RSA/////////////////////////////
router.post('/addPostRSA', casoControl.postCasoRSA);
router.post('/sign', casoControl.signMsgRSA);
router.get('/getFraseRSA', casoControl.getFraseRSA);
router.post('/postpubKey', casoControl.postpubKeyRSA);
router.get('/publickey', casoControl.getPublicKeyRSA);  

///////////////////////////////FIRMA CIEGA/////////////////////////////      /postpaillierSum
router.post('/signCiega', casoControl.signMsgCiega);

///////////////////////////////NO REPUDIO/////////////////////////////
router.post('/addPostNoRepudio', casoControl.postCasoNoRepudio);

///////////////////////////////PAILLIER (homomorphic encryption) ///////////////////////////////////////////////
router.post('/postpaillierSum', casoControl.postSumPaillier);
router.get('/publickeypaillier', casoControl.getPublicKeyPaillier);  

/////////////////////////////// SECRET SHARING ///////////////////////////////////////////////
router.post('/postsecretsharing', casoControl.postSecretSharing);


module.exports = router;