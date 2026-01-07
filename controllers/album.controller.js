import prisma from "../prisma.js";

// In-Memory Store for Simulation Mode
let simulatedAlbums = [
    { id: "sim-alb-1", title: "Essentials", artist: "Various Artists", desc: "Must-have tracks", image: "https://placehold.co/300x300/1DB954/white?text=Essentials", bgColor: "#535353" }
];

export const addAlbum = async (req, res) => {
    const { title, artist, desc, image, bgColor } = req.body;

    try {
        const album = await prisma.album.create({
            data: { title, artist, desc, image, bgColor }
        });
        res.json(album);
    } catch (error) {
        console.log("DB Error adding album, falling back to simulation:", error.message);
        const newAlbum = {
            id: "sim-alb-" + Math.random().toString(36).substr(2, 9),
            title,
            artist,
            desc,
            image,
            bgColor: bgColor || "#121212"
        };
        simulatedAlbums.push(newAlbum);
        res.json(newAlbum);
    }
};

export const getAlbums = async (req, res) => {
    try {
        const albums = await prisma.album.findMany({ include: { songs: true } });
        res.json([...albums, ...simulatedAlbums]);
    } catch (error) {
        console.log("Database error fetching albums, returning simulated data.");
        res.json(simulatedAlbums);
    }
};
