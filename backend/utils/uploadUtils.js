import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import config from '../config/config.js';

// ─── Cloudinary Configuration ─────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// ─── Multer Memory Storage ────────────────────────────────────────────────────
// Files are held in memory as Buffer — then we pipe them to Cloudinary.
// We never write files to disk.

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PNG, JPG, JPEG, WEBP`), false);
    }
};

export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter,
}).single('screenshot');

// ─── Cloudinary Upload Helper ─────────────────────────────────────────────────

/**
 * Uploads a file buffer to Cloudinary under the support/screenshots folder.
 * @param {Buffer} buffer       - File buffer from multer memoryStorage
 * @param {string} originalName - Original filename (used for display only)
 * @returns {Promise<{ url: string, publicId: string, sizeBytes: number, mimeType: string, fileName: string }>}
 */
export const uploadToCloudinary = (buffer, originalName, mimeType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'support/screenshots',
                resource_type: 'image',
                // Use original filename sanitised as public_id suffix
                use_filename: false,
                unique_filename: true,
                overwrite: false,
                // Limit transformations on upload (raw storage)
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    sizeBytes: result.bytes,
                    mimeType,
                    fileName: originalName,
                });
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * Used when a ticket is deleted or screenshot is removed.
 * @param {string} publicId
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (err) {
        // Log but don't throw — deletion failure shouldn't block main flow
        console.error('[Cloudinary] Failed to delete asset:', publicId, err.message);
    }
};
