//backend>src>routes>friends.js
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.post('/requests', friendController.sendRequest);
router.get('/requests/received', friendController.getReceivedRequests);
router.post('/requests/:id/accept', friendController.acceptRequest);
router.post('/requests/:id/reject', friendController.rejectRequest);

router.get('/', friendController.getFriends);
router.get('/:friendId/goals', friendController.getFriendGoals);
router.post('/:friendId/goals/:goalId/react', friendController.reactToGoal);

module.exports = router;