import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  getSongs,
  addSong,
  deleteSong
} from "../controllers/song.controller.js";

const router = express.Router();

router.get("/", protect, getSongs);
router.post("/", protect, adminOnly, addSong);
router.delete("/:id", protect, adminOnly, deleteSong);

export default router;
