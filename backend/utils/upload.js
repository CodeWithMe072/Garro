import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

let s3 = null;
const hasR2Credentials = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY && process.env.R2_BUCKET_NAME;

if (hasR2Credentials) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY
    }
  });
} else {
  console.warn('⚠️ Cloudflare R2 credentials are not configured in .env. Uploads will fallback to local folder: public/uploads');
}

// Memory storage — file stays in buffer, we push to R2
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadToR2 = async (file) => {
  const ext      = path.extname(file.originalname);
  const filename = `${crypto.randomUUID()}${ext}`;
  const key      = `garro/requests/${filename}`;

  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME,
      Key:         key,
      Body:        file.buffer,
      ContentType: file.mimetype
    }));

    return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  } else {
    // Local fallback for local testing
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, file.buffer);
    return `/uploads/${filename}`;
  }
};
