const { prisma } = require('../utils/db');

async function getAllUsers(req, res) {
  try {
    const findUser = await prisma.user.findMany({
      include: { posts: { orderBy: { id: 'asc' } } },
    });
    res.json(findUser);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
    console.log(error);
  }
}

async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const result = await prisma.user.findUnique({
      where: id,
    });

    if (!result) {
      res.status(404).json({ message: 'user not found' });
    }
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'internal server error' });
  }
}

module.exports = { getAllUsers, getUserById };
