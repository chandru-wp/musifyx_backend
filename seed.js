import prisma from "./prisma.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("🌱 Database Seeding Started...");

    // 1. Clear existing data
    console.log("Cleaning up old data...");
    await prisma.playlist.deleteMany({});
    await prisma.song.deleteMany({});
    await prisma.album.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create Admin User
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
        data: {
            username: "admin@gmail.com",
            password: adminPassword,
            name: "Super Admin",
            role: "ADMIN"
        }
    });
    console.log("✅ Admin user created: admin@gmail.com / admin123");

    // 3. Create Sample Album
    const album = await prisma.album.create({
        data: {
            title: "Top Hits 2026",
            artist: "Various Artists",
            desc: "The hottest tracks of the year",
            image: "https://placehold.co/400x400/1DB954/white.png?text=Top+Hits",
            bgColor: "#1DB954"
        }
    });
    console.log("✅ Sample album created");

    // 4. Create Sample Songs
    const song1 = await prisma.song.create({
        data: {
            title: "Midnight City",
            artist: "M83",
            image: "https://placehold.co/400x400/purple/white.png?text=Midnight",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: 240,
            albumId: album.id
        }
    });

    const song2 = await prisma.song.create({
        data: {
            title: "Starboy",
            artist: "The Weeknd",
            image: "https://placehold.co/400x400/red/white.png?text=Starboy",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            duration: 230,
            albumId: album.id
        }
    });
    console.log("✅ Sample songs added");

    // 5. Create Sample Playlist
    const playlist = await prisma.playlist.create({
        data: {
            name: "My Favorites",
            userId: admin.id,
            songIds: [song1.id, song2.id]
        }
    });
    console.log("✅ Sample playlist created");

    console.log("🎉 Seeding Successful!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
