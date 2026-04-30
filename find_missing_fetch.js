import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fetch(') && lines[i].includes('/api/')) {
    // Check next 10 lines for 'credentials'
    let found = false;
    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
      if (lines[j].includes('credentials')) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`Potential missing credentials at line ${i + 1}: ${lines[i].trim()}`);
    }
  }
}
