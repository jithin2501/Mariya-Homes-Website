const express = require('express');
const { getMessages } = require('../controllers/contactController');

const router = express.Router();

router.get('/admin/messages', getMessages);

module.exports = router;
