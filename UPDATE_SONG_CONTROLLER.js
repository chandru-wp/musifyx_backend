// Update Song - Add after deleteSong in song.controller.js

export const updateSong = async (req, res) => {
    const { id } = req.params;
    const { title, artist, image, audioUrl, albumId } = req.body;

    // 1. Check if it's a simulated song first
    const simIndex = simulatedSongs.findIndex(s => s.id === id);
    if (simIndex !== -1 || id.startsWith("sim-song-")) {
        if (simIndex !== -1) {
            // Update simulated song
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
        // If ID starts with  sim-song- but not found, return error
        return res.status(404).json({ msg: "Simulated song not found" });
    }

    const prisma = new PrismaClient();
    try {
        const updatedSong = await prisma.song.update({
            where: { id },
            data: { title, artist, image, audioUrl, albumId }
        });
        res.json(updatedSong);
    } catch (error) {
        res.status(500).json({ msg: "Failed to update song", error: error.message });
    } finally {
        await prisma.$disconnect();
    }
};
