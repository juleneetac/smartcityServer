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
router.get('/publickey', casoControl.getPublicKeyRSA);


module.exports = router;