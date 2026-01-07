import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getPlaylists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    renamePlaylist
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.get("/", protect, getPlaylists);
router.post("/", protect, createPlaylist);
router.post("/add-song", protect, addSongToPlaylist);
router.post("/remove-song", protect, removeSongFromPlaylist);
router.put("/:id", protect, renamePlaylist);
router.delete("/:id", protect, deletePlaylist);

export default router;
