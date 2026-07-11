//backend>src>routes>user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/search', userController.searchUsers);
router.patch('/me', userController.updateMe);

module.exports = router;