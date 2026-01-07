import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage (memory for uploading to cloudinary)
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        // Allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        // Allow audio
        else if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        // Allow video
        else if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only images, audio, and video files are allowed!'), false);
        }
    }
});

// Upload image to Cloudinary
export const uploadImage = async (fileBuffer, folder = 'musifyx/images') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 500, height: 500, crop: 'fill' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Upload audio to Cloudinary
export const uploadAudio = async (fileBuffer, folder = 'musifyx/audio') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'video', // Cloudinary uses 'video' for audio too
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Upload video to Cloudinary
export const uploadVideo = async (fileBuffer, folder = 'musifyx/videos') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'video',
                eager: [
                    { width: 720, crop: 'scale' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

export default cloudinary;
