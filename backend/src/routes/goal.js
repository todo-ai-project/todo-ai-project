//backend>src>routes>goal.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.post('/', goalController.createGoal); 

module.exports = router;