const { PrismaClient } = require('@prisma/client');
const express = require('express');

const app = express();
const prisma = new PrismaClient();
const port = 8888;
app.use(express.json());

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});

app.get('/users', async (req, res) => {
  const findUser = await prisma.user.findMany({
    include: {posts: {orderBy: {id:'asc'}}}
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

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        comments: {orderBy:{id: 'asc'}}
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

app.post('/post', async (req, res) => {
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
  const { name, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        name: name,
        password: password,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid name or password!' });
    }

    res.json('success login');
  } catch (error) {
    res.json(error);
  }
});

app.get('/feed', async (req, res) => {
  try {
    const result = await prisma.post.findMany();
    res.status(200).json({ message: 'succes getting feed', result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'error getting feed' });
  }
});

app.post('/post/:id/comment', async (req, res) => {
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


