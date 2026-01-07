import prisma from "../prisma.js";

// In-Memory Store for Simulation Mode
let simulatedSongs = [];

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const getSongs = async (req, res) => {
  try {
    const songs = await prisma.song.findMany();
    // Only return real songs now
    res.json(songs);
  } catch (error) {
    console.log("Database error fetching songs: ", error.message);

    // Fallback: If DB fails (like bad auth), return empty array or hardcoded sample to prevent 500 error
    res.json([
      {
        id: "sim-song-1",
        title: "Simulation Track",
        artist: "System Fallback",
        image: "https://placehold.co/400x400/gray/white.png?text=Offline",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 180
      }
    ]);
  }
};

export const addSong = async (req, res) => {
  const { title, artist, image, audioUrl, albumId } = req.body;
  try {
    // Clean up albumId: If it's an empty string, set it to null
    const data = {
      title,
      artist,
      image,
      audioUrl,
      albumId: (albumId && isValidObjectId(albumId)) ? albumId : null
    };

    const song = await prisma.song.create({ data });
    res.json(song);
  } catch (error) {
    console.error("DB Error adding song:", error.message);
    res.status(500).json({ msg: "Failed to add song to database", error: error.message });
  }
};

export const deleteSong = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ msg: "Invalid song ID format" });
  }

  try {
    await prisma.song.delete({ where: { id } });
    res.json({ msg: "Deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete song", error: error.message });
  }
};

export const updateSong = async (req, res) => {
  const { id } = req.params;
  const { title, artist, image, audioUrl, albumId } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ msg: "Invalid song ID format" });
  }

  try {
    const data = {
      title,
      artist,
      image,
      audioUrl,
      albumId: (albumId && isValidObjectId(albumId)) ? albumId : null
    };

    const updatedSong = await prisma.song.update({
      where: { id },
      data
    });
    res.json(updatedSong);
  } catch (error) {
    res.status(500).json({ msg: "Failed to update song", error: error.message });
  }
};
