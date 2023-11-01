const {prisma} = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

    const hashPassword = await bcrypt.hash(password, 10)
    const createUser = await prisma.user.create({
      data: {
        name,
        password: hashPassword,
        email,
      },
    });

    res.status(200).json({ message: 'success', user: createUser });
  } catch (error) {
    console.log(error);
  }
}

async function login(req,res){
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
}

module.exports = {login, signup}
