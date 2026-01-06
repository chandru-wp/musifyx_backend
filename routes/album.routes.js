import express from "express";
import { addAlbum, getAlbums } from "../controllers/album.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, addAlbum);
router.get("/", getAlbums);

export default router;
