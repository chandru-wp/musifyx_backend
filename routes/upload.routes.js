import express from 'express';
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
        res.status(500).json({ msg: 'Failed to upload image', error: error.message });
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
        res.status(500).json({ msg: 'Failed to upload audio', error: error.message });
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
        console.error('Video upload error:', error);
        res.status(500).json({ msg: 'Failed to upload video', error: error.message });
    }
});

export default router;
