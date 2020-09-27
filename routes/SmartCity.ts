"use strict";

import express = require("express");
let router = express.Router();
let casoControl = require('../controllers/casoControl');


router.post('/addPost', casoControl.postCaso);   

module.exports = router;