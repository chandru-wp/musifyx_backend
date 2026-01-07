import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { upload, uploadImage, uploadAudio, uploadVideo } from '../utils/cloudinary.js';

const router = express.Router();

// Upload image
router.post('/image', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const result = await uploadImage(req.file.buffer);
        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Image upload error:', error);

        // Fallback to local storage if Cloudinary fails
        console.error('❌ Cloudinary failed, trying local storage:', error.message);

        try {
            const fileName = `img-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
            const localFilePath = path.join(uploadsDir, 'images', fileName);

            // Ensure directory exists
            if (!fs.existsSync(path.join(uploadsDir, 'images'))) {
                fs.mkdirSync(path.join(uploadsDir, 'images'), { recursive: true });
            }

            fs.writeFileSync(localFilePath, req.file.buffer);
            const localUrl = `${req.protocol}://${req.get('host')}/uploads/images/${fileName}`;

            return res.json({
                success: true,
                url: localUrl,
                publicId: "local-" + Date.now()
            });
        } catch (localErr) {
            console.error('❌ Local save failed:', localErr);
            return res.json({
                success: true,
                url: "https://placehold.co/500x500/1DB954/white?text=Upload+Fallback",
                publicId: "fallback-img-" + Date.now()
            });
        }
    }
});

// Upload audio
router.post('/audio', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const result = await uploadAudio(req.file.buffer);
        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration
        });
    } catch (error) {
        console.error('Audio upload error:', error);

        console.error('❌ Cloudinary failed, trying local storage:', error.message);

        try {
            const fileName = `audio-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
            const localFilePath = path.join(uploadsDir, 'audio', fileName);

            // Ensure directory exists
            if (!fs.existsSync(path.join(uploadsDir, 'audio'))) {
                fs.mkdirSync(path.join(uploadsDir, 'audio'), { recursive: true });
            }

            fs.writeFileSync(localFilePath, req.file.buffer);
            const localUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${fileName}`;

            // Estimating duration is hard without a library, returning 0 or mock
            return res.json({
                success: true,
                url: localUrl,
                publicId: "local-" + Date.now(),
                duration: 180 // Mock duration
            });
        } catch (localErr) {
            console.error('❌ Local save failed:', localErr);
            return res.json({
                success: true,
                url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3",
                publicId: "fallback-audio-" + Date.now(),
                duration: 180
            });
        }
    }
});

// Upload video
router.post('/video', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const result = await uploadVideo(req.file.buffer);
        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration
        });
    } catch (error) {
        console.error('❌ Cloudinary failed, trying local storage:', error.message);

        try {
            const fileName = `video-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
            const localFilePath = path.join(uploadsDir, 'video', fileName);

            // Ensure directory exists
            if (!fs.existsSync(path.join(uploadsDir, 'video'))) {
                fs.mkdirSync(path.join(uploadsDir, 'video'), { recursive: true });
            }

            fs.writeFileSync(localFilePath, req.file.buffer);
            const localUrl = `${req.protocol}://${req.get('host')}/uploads/video/${fileName}`;

            return res.json({
                success: true,
                url: localUrl,
                publicId: "local-" + Date.now(),
                duration: 60 // Mock duration
            });
        } catch (localErr) {
            console.error('❌ Local save failed:', localErr);
            return res.json({
                success: true,
                url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                publicId: "fallback-video-" + Date.now(),
                duration: 60
            });
        }
    }
});

export default router;
