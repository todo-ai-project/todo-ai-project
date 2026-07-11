//backend>src>routes>goal.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.patch('/:id/pin', goalController.togglePin);
router.patch('/:id/archive', goalController.toggleArchive);

module.exports = router;