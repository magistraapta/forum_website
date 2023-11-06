const { prisma } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { hashToken } = require('../utils/hashToken');
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '3m' });
}

function generateRefreshToken(user, jti) {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '8h' }
  );
}

function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
}

function addRefreshTokenToWhitelist({ jti, refreshToken, userId }) {
  return prisma.token.create({
    data: {
      id: jti,
      token: hashToken(refreshToken),
      userId,
    },
  });
}

function findRefreshTokenById(id) {
  return prisma.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

function deleteRefreshToken(id) {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

function revokeTokens(userId) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

async function signup(req, res) {
  const { name, email, password } = req.body;

  try {
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (findUser) {
      res.status(403).json({ message: 'email already been use' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const createUser = await prisma.user.create({
      data: {
        name,
        password: hashPassword,
        email,
      },
    });

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(createUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: createUser.id });

    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.log(error);
  }
}

async function login(req, res) {
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET);

    if (isPasswordValid) {
      res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      res.status(403).json('wrong password');
    }
  } catch (error) {
    res.json(error);
  }
}

module.exports = { login, signup };
