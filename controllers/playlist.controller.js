import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getPlaylists = async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: req.user.id },
            include: { songs: true }
        });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching playlists", error: error.message });
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
        res.status(500).json({ msg: "Error creating playlist", error: error.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
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
        res.status(500).json({ msg: "Error adding song to playlist", error: error.message });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
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
        res.status(500).json({ msg: "Error removing song from playlist", error: error.message });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.playlist.delete({
            where: { id }
        });
        res.json({ msg: "Playlist deleted" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting playlist", error: error.message });
    }
};

export const renamePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const playlist = await prisma.playlist.update({
            where: { id },
            data: { name },
            include: { songs: true }
        });
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ msg: "Error renaming playlist", error: error.message });
    }
};
