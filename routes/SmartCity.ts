"use strict";

import express = require("express");
let router = express.Router();
let casoControl = require('../controllers/casoControl');


router.post('/addPost', casoControl.postCaso);   
router.get('/getFrase', casoControl.getFrase);  

module.exports = router;