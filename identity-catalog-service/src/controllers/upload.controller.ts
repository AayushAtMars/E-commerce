import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../config/cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

// Use memory storage so we stream directly to Cloudinary (no temp files)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'auto',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// POST /api/upload  — accepts up to 6 files (field name: "files")
export async function uploadFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided.' });
    }

    const urls = await Promise.all(
      files.map((file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return uploadToCloudinary(file.buffer, 'reviews', isVideo ? 'video' : 'image');
      }),
    );

    res.json({ success: true, urls });
  } catch (err) {
    next(err);
  }
}
