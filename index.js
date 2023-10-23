const { PrismaClient } = require('@prisma/client');
const express = require('express');

const app = express();
const prisma = new PrismaClient();
const port = 3000;
app.use(express.json());

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});

app.get('/users', async (req, res) => {
  const findUser = await prisma.user.findMany();
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

    res.status(200).json({ message: 'user created successfully', user: createUser });
  } catch (error) {
    if ((error.code = 'P2002' && error.meta.target.includes('email'))) {
      res.status(400).json('email already exist');
    } else {
      res.status(500).json('create user failed');
    }
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
