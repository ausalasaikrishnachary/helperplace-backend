const express = require('express');
const router = express.Router();
const userModule = require('../modules/user');

router.get('/', userModule.getUsers);
router.get('/:id', userModule.getUserById);
router.post('/', userModule.createUser);
router.put('/:id', userModule.updateUser);
router.delete('/:id', userModule.deleteUser);

module.exports = router;
