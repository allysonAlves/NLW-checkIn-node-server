import { prisma } from '../src/lib/prisma'

async function seed(){
    await prisma.event.create({
        data: {
            id: '4e198939-c40a-4b84-a02a-8f2ee8b75b66',
            title: 'Unite Summit',
            slug: 'unite-summit',
            details: 'Um evento p/ devs apaixonados(as) por código!',
            maximumAttendees: 120
        }
    })
}

seed().then(() => {
    console.log('database seeded')
    prisma.$disconnect()
})