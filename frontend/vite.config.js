import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

try {
  const src = "C:/Users/DELL/.gemini/antigravity/brain/cd8881e7-2e0d-4be0-b5d1-2dcb33e0a775/.user_uploaded/media__1785673521606.jpg";
  const dest = "./public/assets/images/login-hero.jpg";
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Successfully copied clean Burj Khalifa image to login-hero.jpg in vite.config.js!");
  }
} catch (e) {
  console.error("Error copying in vite.config.js:", e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
