const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\DELL\\Downloads\\garro_final_updated (2) (1)\\garro_site\\garro_site\\garro_api\\core\\static\\core\\images';
const destDir = 'e:\\Garro\\public\\assets\\images';

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry.name}`);
    }
  }
}

try {
  copyDir(srcDir, destDir);
  console.log('Images copied successfully!');
} catch (error) {
  console.error('Error copying images:', error);
}
