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
///////////////////////////////NO REPUDIO/////////////////////////////
router.post('/addPostNoRepudio', casoControl.postCasoNoRepudio);




module.exports = router;