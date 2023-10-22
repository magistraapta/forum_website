const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()

const initUser = [
    {
        name:'user1234',
        email:'user1234@email.com',
        password:'user1234',
        posts: {
            create:[
                {
                    title: 'how to use prisma',
                    content: 'this is how to use prisma',
                    published: true
                }
            ]
        }
    },
    {
        name:'user2',
        email:'user2@email.com',
        password:'user2',
        posts:{
            create: [
                {
                    title:'this is a title',
                    published: true
                }
            ]
        }
    },
]

async function main() {
  console.log('start seeding...')
  for(const u of initUser){
    const user = prisma.user.create({
        data: u
    })
    console.log(`created user with id: ${(await user).id}`)
  }
  console.log('seeding finished')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })