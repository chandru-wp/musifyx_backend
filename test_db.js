import prisma from "./prisma.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("✅ Connection Success!");

        console.log("Fetching user count...");
        const count = await prisma.user.count();
        console.log("User count:", count);
    } catch (error) {
        console.error("❌ DB Error Details:");
        console.error(error.message);
        if (error.code) console.error("Error Code:", error.code);
    } finally {
        await prisma.$disconnect();
    }
}

test();
