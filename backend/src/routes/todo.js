const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');
const aiController = require('../controllers/aiController');

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.post('/generate', aiController.generateTodoMate);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;