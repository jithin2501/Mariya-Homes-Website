const express = require('express');
const {
  sendMessage,
  getMessages,
  deleteMessage
} = require('../controllers/contactController');

const router = express.Router();

// Public
router.post('/contact', sendMessage);

// Admin
router.get('/admin/messages', getMessages);
router.delete('/admin/messages/:id', deleteMessage);

module.exports = router;
