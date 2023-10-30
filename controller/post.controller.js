const {prisma} = require('../utils/db');

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
    res.status(200).json({ message: 'succes getting feed', result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'error getting feed' });
  }
}

module.exports = {getPostById,createPost, showAllPosts }
