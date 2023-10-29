const { PrismaClient } = require('@prisma/client');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const prisma = new PrismaClient();
const port = 8888;

app.use(express.json());

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});

const accessValidation = (req,res,next) => {
  const {authorization} = req.headers

  if (!authorization) {
    return res.status(401).json({message: 'token diperlukan'})
  }

  const token = authorization.split(' ')[1];
  const secret = process.env.JWT_SECRET

  try {
    const jwtDecode = jwt.verify(token,secret)

    req.userData = jwtDecode
  } catch (error) {
    return res.status(401).json({message: "Unauthorized"})
  }
  next()
}

app.get('/users', accessValidation, async (req, res) => {
  const findUser = await prisma.user.findMany({
    include: { posts: { orderBy: { id: 'asc' } } },
  });
  res.json(findUser);
});

app.post('/sign-up', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const createUser = await prisma.user.create({
      data: {
        name,
        password,
        email,
      },
    });

    res.status(200).json({ message: 'success', user: createUser });
  } catch (error) {
    if ((error.code = 'P2002' && error.meta.target.includes('email'))) {
      res.status(400).json('email already exist');
    } else {
      res.status(500).json('create user failed');
    }
    console.log(error);
  }
});

app.get('/post/:id', accessValidation,async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        comments: { orderBy: { id: 'asc' } },
      },
    });
    res.status(200).json({
      message: 'success',
      post: result,
    });
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
});

app.post('/post', accessValidation,async (req, res) => {
  const { title, content, userEmail } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const result = await prisma.post.create({
      data: {
        title,
        content,
        author: { connect: { email: user.email } },
      },
    });
    res.status(200).json({ message: 'success create post', result });
  } catch (error) {
    console.log(error);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid email or password!' });
    }

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      } 

      const secret = process.env.JWT_SECRET
      const expireIn = 60 *60 *1
      const token = jwt.sign(payload, secret, {expiresIn: expireIn} )
      return res.json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          token: token
        },
      });
    } else {
      res.status(403).json({ message: 'wrong password' });
    }

  } catch (error) {
    res.json(error);
  }
});

app.get('/feed', async (req, res) => {
  try {
    const result = await prisma.post.findMany({
      include:{
        author: true
      }
    });
    res.status(200).json({ message: 'succes getting feed', result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'error getting feed' });
  }
});

app.post('/post/:id/comment', accessValidation,async (req, res) => {
  const { id } = req.params;
  const { comment, username } = req.body;
  try {
    const findPost = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!findPost) {
      res.status(404).json({ message: 'post no found' });
    }

    const result = await prisma.comment.create({
      data: {
        comment: comment,
        post: { connect: { id: findPost.id } },
        user: username,
      },
    });
    res.status(200).json({ message: 'success', response: result });
  } catch (error) {
    res.status(500).json({ message: error });
    console.log(error);
  }
});

