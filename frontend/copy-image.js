import fs from 'fs';
import path from 'path';

const userUploadedDir = 'C:/Users/DELL/.gemini/antigravity/brain/cd8881e7-2e0d-4be0-b5d1-2dcb33e0a775/.user_uploaded';
const destPath = './public/assets/images/login-hero.jpg';

try {
  if (fs.existsSync(userUploadedDir)) {
    const files = fs.readdirSync(userUploadedDir);
    
    // Find all .jpg files, filtering out the mockup image by file size (< 270KB)
    const jpgFiles = files
      .filter(f => f.endsWith('.jpg') && f.startsWith('media__'))
      .map(f => {
        const filePath = path.join(userUploadedDir, f);
        return {
          name: f,
          size: fs.statSync(filePath).size,
          time: fs.statSync(filePath).mtime.getTime()
        };
      })
      .filter(f => f.size < 270000) // The clean car image is always < 270KB, while mockup is > 275KB
      .sort((a, b) => b.time - a.time);

    if (jpgFiles.length > 0) {
      const latestJpg = jpgFiles[0].name;
      const srcPath = path.join(userUploadedDir, latestJpg);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`Successfully copied clean login hero image: ${latestJpg} (Size: ${jpgFiles[0].size} bytes)`);
    } else {
      console.log('No clean JPG reference images found in .user_uploaded directory.');
    }
  } else {
    console.log('User uploaded directory does not exist at:', userUploadedDir);
  }
} catch (err) {
  console.error('Error copying image:', err);
}
