import fs from 'fs';
import path from 'path';

const frontendDir = 'd:/Clients Projects/Garro_Monorepo/frontend/src';

function walkAndClean(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndClean(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("lang === 'ur'")) {
        // Replace regex patterns like: (lang === 'ur' ? 'ur_text' : 'en_text') with 'en_text'
        // Or: lang === 'ar' ? 'ar_text' : (lang === 'ur' ? 'ur_text' : 'en_text')
        const updated = content.replace(/lang === 'ar' \? ([^:]+) : \(\s*lang === 'ur' \? [^:]+ : ([^\)]+)\)/g, "lang === 'ar' ? $1 : $2");
        if (updated !== content) {
          fs.writeFileSync(fullPath, updated, 'utf8');
          console.log(`Cleaned ur ternaries from: ${entry.name}`);
        }
      }
    }
  }
}

walkAndClean(frontendDir);
console.log('Urdu cleanup complete.');
