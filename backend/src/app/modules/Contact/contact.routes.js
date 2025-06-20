const express = require('express');
const router = express.Router();
const ContactController = require('./contact.controller');

router.post('/', ContactController.create);
router.get('/', ContactController.getAll); 

module.exports = router;
