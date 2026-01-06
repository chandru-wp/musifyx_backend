import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    console.log("Current Users In Database:");
    console.log(JSON.stringify(users, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
