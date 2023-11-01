const { prisma } = require('../utils/db');

async function createPost(req, res) {
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
}

async function getPostById(req, res) {
  const { id } = req.params;
  try {
    const result = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        comments: {
          orderBy: { id: 'asc' },
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
        author: {
          select: {
            name: true,
          },
        },
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
}

async function showAllPosts(req, res) {
  try {
    const result = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
        comments: true,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'error getting feed' });
  }
}

async function createComment(req, res) {
  const { id } = req.params;
  const { comment, userEmail } = req.body;
  try {
    const findPost = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!findPost) {
      res.status(404).json({ message: 'post not found' });
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!findUser) {
      res.status(404).json({ message: 'post not found' });
    }

    const result = await prisma.comment.create({
      data: {
        comment: comment,
        post: { connect: { id: findPost.id } },
        author: { connect: { email: findUser.email } },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'internal server error' });
  }
}

module.exports = { getPostById, createPost, showAllPosts, createComment };
