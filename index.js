const express = require('express');
const userRouter = require('./router/user.router.js')
const authRouter = require('./router/auth.router.js')
const postRouter = require('./router/post.router.js')
const cors = require('cors')

const app = express();
const port = 8888;

app.use(cors())
app.use(express.json());

app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/post', postRouter)

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});



