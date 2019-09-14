const express = require('express');
const router = express.Router();
const authorization = require('../middleaware/check-auth');

const UserController = require('../controllers/user')


router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/', authorization, UserController.get_all);

router.get('/:userId', authorization, UserController.get_single);

router.patch('/:userId', authorization, UserController.update);

router.delete('/:userId', authorization, UserController.delete);


module.exports = router;