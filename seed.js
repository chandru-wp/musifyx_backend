import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const username = "admin@gmail.com";
    const password = "password123";
    const role = "ADMIN";

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        console.log("Admin user already exists");
        return;
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { username, password: hash, role }
    });

    console.log("Admin user created successfully!");
    console.log("Username: " + username);
    console.log("Password: " + password);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
