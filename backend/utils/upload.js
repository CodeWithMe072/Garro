import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
      accessKeyId: process.env.R2_ACCESS_KEY,
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

// Upload a multipart file (from multer) to R2
export const uploadToR2 = async (file) => {
  const ext = path.extname(file.originalname);
  const filename = `${crypto.randomUUID()}${ext}`;
  const key = `garro/requests/${filename}`;

  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
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

/**
 * Upload a raw Buffer to R2 with a specific key and content type.
 * Used for PDF invoice uploads after Puppeteer generation.
 *
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} key    - The R2 object key, e.g. 'garro/invoices/invoice-GAR-2026-00001.pdf'
 * @param {string} contentType - MIME type, e.g. 'application/pdf'
 * @returns {string} Public URL to the uploaded file
 */
export const uploadBufferToR2 = async (buffer, key, contentType = 'application/pdf') => {
  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }));

    return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  } else {
    // Local fallback: save to public/uploads/
    const filename = key.split('/').pop();
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, buffer);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${filename}`;
  }
};

/**
 * Downloads a file from either R2 or the local fallback folder.
 * 
 * @param {string} url - The stored file URL
 * @returns {Promise<Buffer>} - File binary buffer
 */
export const downloadFile = async (url) => {
  // 1. If it's a local file URL
  if (url.includes('/uploads/')) {
    const filename = url.split('/').pop();
    const localPath = path.join(process.cwd(), 'public/uploads', filename);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    throw new Error('Local file not found');
  }

  // 2. Otherwise, download from R2 using s3 client
  if (s3) {
    const r2Domain = `.r2.cloudflarestorage.com/`;
    const index = url.indexOf(r2Domain);
    if (index === -1) throw new Error('Invalid R2 URL');
    const key = url.substring(index + r2Domain.length);

    const res = await s3.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    }));

    const chunks = [];
    for await (const chunk of res.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  throw new Error('No storage configured');
};
