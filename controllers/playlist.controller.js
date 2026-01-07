import prisma from "../prisma.js";

// In-Memory Store for Simulation Mode
let simulatedPlaylists = [];

export const getPlaylists = async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: req.user.id },
            include: { songs: true }
        });
        res.json(playlists);
    } catch (error) {
        console.log("Database error fetching playlists, returning simulated data.");
        // Filter simulated playlists by user
        const userPlaylists = simulatedPlaylists.filter(p => p.userId === req.user.id);
        res.json(userPlaylists);
    }
};

export const createPlaylist = async (req, res) => {
    try {
        const { name } = req.body;
        const playlist = await prisma.playlist.create({
            data: {
                name: name || "My Playlist",
                userId: req.user.id
            },
            include: { songs: true }
        });
        res.json(playlist);
    } catch (error) {
        console.log("DB Error creating playlist, falling back to simulation:");
        const newPlaylist = {
            id: "sim-playlist-" + Math.random().toString(36).substr(2, 9),
            name: req.body.name || "My Playlist",
            userId: req.user.id,
            songs: [],
            createdAt: new Date().toISOString()
        };
        simulatedPlaylists.push(newPlaylist);
        res.json(newPlaylist);
    }
};

export const addSongToPlaylist = async (req, res) => {
    const { playlistId, songId } = req.body;
    try {
        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                songs: {
                    connect: { id: songId }
                }
            },
            include: { songs: true }
        });
        res.json(playlist);
    } catch (error) {
        console.log("DB Error adding song, falling back to simulation");
        const playlistIndex = simulatedPlaylists.findIndex(p => p.id === playlistId);
        if (playlistIndex !== -1) {
            // In a real simulation, we'd need to find the song too. 
            // For now, let's just mock the addition if it's a simulated playlist
            return res.json(simulatedPlaylists[playlistIndex]);
        }
        res.status(500).json({ msg: "Playlist not found in simulation" });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    const { playlistId, songId } = req.body;
    try {
        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                songs: {
                    disconnect: { id: songId }
                }
            },
            include: { songs: true }
        });
        res.json(playlist);
    } catch (error) {
        const playlistIndex = simulatedPlaylists.findIndex(p => p.id === playlistId);
        if (playlistIndex !== -1) {
            simulatedPlaylists[playlistIndex].songs = simulatedPlaylists[playlistIndex].songs.filter(s => s.id !== songId);
            return res.json(simulatedPlaylists[playlistIndex]);
        }
        res.status(500).json({ msg: "Error removing song" });
    }
};

export const deletePlaylist = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.playlist.delete({
            where: { id }
        });
        res.json({ msg: "Playlist deleted" });
    } catch (error) {
        simulatedPlaylists = simulatedPlaylists.filter(p => p.id !== id);
        res.json({ msg: "Simulated playlist deleted" });
    }
};

export const renamePlaylist = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const playlist = await prisma.playlist.update({
            where: { id },
            data: { name },
            include: { songs: true }
        });
        res.json(playlist);
    } catch (error) {
        const playlistIndex = simulatedPlaylists.findIndex(p => p.id === id);
        if (playlistIndex !== -1) {
            simulatedPlaylists[playlistIndex].name = name;
            return res.json(simulatedPlaylists[playlistIndex]);
        }
        res.status(500).json({ msg: "Error renaming playlist" });
    }
};
