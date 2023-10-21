const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const newUser = await prisma.user.create({
    data: {
      name: 'testing',
      email: 'testing@gmail.com',
      Post: {
        create: {
          title: 'hello',
        },
      },
      Profile: {
        create: {
          bio: 'i like coding',
        },
      },
    },
  });

//   const findUser = await

  console.log(newUser)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
