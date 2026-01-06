import { PrismaClient } from "@prisma/client";

// In-Memory Store for Simulation Mode
let simulatedSongs = [
  {
    id: "sim-song-1",
    title: "Midnight City",
    artist: "M83",
    image: "https://i.scdn.co/image/ab67616d0000b27329596489437b6058e575775c",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    albumId: null,
    duration: 240
  },
  {
    id: "sim-song-2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    image: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    albumId: null,
    duration: 200
  }
];

export const getSongs = async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const songs = await prisma.song.findMany();
    // Merge real and simulated songs for a seamless experience
    res.json([...songs, ...simulatedSongs]);
  } catch (error) {
    console.log("Database error fetching songs, returning simulated data.");
    res.json(simulatedSongs);
  } finally {
    await prisma.$disconnect();
  }
};

export const addSong = async (req, res) => {
  const prisma = new PrismaClient();
  const { title, artist, image, audioUrl } = req.body;

  try {
    const song = await prisma.song.create({ data: req.body });
    res.json(song);
  } catch (error) {
    console.error("DB Error adding song, falling back to simulation:", error.message);

    const newSong = {
      id: "sim-song-" + Math.random().toString(36).substr(2, 9),
      title,
      artist,
      image,
      audioUrl,
      albumId: req.body.albumId || null,
      duration: 0
    };
    simulatedSongs.push(newSong);
    res.json(newSong);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteSong = async (req, res) => {
  const { id } = req.params;

  // 1. Check if it's a simulated song first
  const simIndex = simulatedSongs.findIndex(s => s.id === id);
  if (simIndex !== -1 || id.startsWith("sim-song-")) {
    if (simIndex !== -1) simulatedSongs.splice(simIndex, 1);
    return res.json({ msg: "Simulation Delete Successful" });
  }

  const prisma = new PrismaClient();
  try {
    await prisma.song.delete({ where: { id } });
    res.json({ msg: "Deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete song", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};
