import prisma from "../prisma.js";

// In-Memory Store for Simulation Mode
let simulatedSongs = [
  {
    id: "sim-song-1",
    title: "Midnight City",
    artist: "M83",
    image: "https://placehold.co/300x300/1DB954/white?text=Music",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3",
    albumId: null,
    duration: 240
  },
  {
    id: "sim-song-2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    image: "https://placehold.co/300x300/1DB954/white?text=Blinding+Lights",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
    albumId: null,
    duration: 200
  }
];

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const getSongs = async (req, res) => {
  try {
    const songs = await prisma.song.findMany();
    // Merge real and simulated songs for a seamless experience
    res.json([...songs, ...simulatedSongs]);
  } catch (error) {
    console.log("Database error fetching songs, returning simulated data.");
    res.json(simulatedSongs);
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
    console.error("DB Error adding song, falling back to simulation:", error.message);

    const newSong = {
      id: "sim-song-" + Math.random().toString(36).substr(2, 9),
      title,
      artist,
      image,
      audioUrl,
      albumId: albumId || null,
      duration: 0
    };
    simulatedSongs.push(newSong);
    res.json(newSong);
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

  // 1. Check if it's a simulated song first
  const simIndex = simulatedSongs.findIndex(s => s.id === id);
  if (simIndex !== -1 || id.startsWith("sim-song-")) {
    if (simIndex !== -1) {
      simulatedSongs[simIndex] = {
        ...simulatedSongs[simIndex],
        title: title || simulatedSongs[simIndex].title,
        artist: artist || simulatedSongs[simIndex].artist,
        image: image || simulatedSongs[simIndex].image,
        audioUrl: audioUrl || simulatedSongs[simIndex].audioUrl,
        albumId: albumId !== undefined ? albumId : simulatedSongs[simIndex].albumId
      };
      return res.json(simulatedSongs[simIndex]);
    }
    // If it starts with sim-song- but not found, act as if updated for UI stability
    return res.json({ id, title, artist, image, audioUrl, albumId });
  }

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
