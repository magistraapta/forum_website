const auth = require('../controller/auth.controller')
const authRouter = require('express').Router()

authRouter.post('/login', auth.login);
authRouter.post('/signup', auth.signup);

module.exports = authRouter