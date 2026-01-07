import prisma from "../prisma.js";

// In-Memory Store for Simulation Mode
let simulatedAlbums = [];

export const addAlbum = async (req, res) => {
    const { title, artist, desc, image, bgColor } = req.body;

    try {
        const album = await prisma.album.create({
            data: { title, artist, desc, image, bgColor }
        });
        res.json(album);
    } catch (error) {
        console.log("DB Error adding album:", error.message);
        res.status(500).json({ msg: "Failed to add album to database", error: error.message });
    }
};

export const getAlbums = async (req, res) => {
    try {
        const albums = await prisma.album.findMany({ include: { songs: true } });
        res.json(albums);
    } catch (error) {
        console.log("Database error fetching albums:", error.message);
        res.status(500).json({ msg: "Failed to fetch albums" });
    }
};
