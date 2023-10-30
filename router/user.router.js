const user = require('../controller/user.controller')
const userRouter = require('express').Router()

userRouter.get('/', user.getAllUsers);
userRouter.get('/:id', user.getUserById);


module.exports = userRouter