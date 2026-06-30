//backend>src>routes>todo.js
const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');
const aiController = require('../controllers/aiController'); 

router.get('/', todoController.getTodos);      // ✅ 이 줄 추가!
router.post('/', todoController.createTodo);
router.post('/generate', aiController.generateTodoMate);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;