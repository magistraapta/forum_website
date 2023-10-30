const post = require('../controller/post.controller');
const postRouter = require('express').Router();
const { accessValidation } = require('../middleware/validation.middleware');

postRouter.post('/create', accessValidation, post.createPost);
postRouter.get('/feed', post.showAllPosts);
postRouter.get('/:id', post.getPostById);

module.exports = postRouter;
