import fs from 'fs';

const content = fs.readFileSync('./app/page.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/set[A-Z][a-zA-Z0-9]*\(/)) {
    // ignore definitions, useEffects, async/awaits, promise .then / .catch, or arrow functions, or inside JSX onClick=...
    if (
      line.includes('const [') || 
      line.includes('useEffect') || 
      line.includes('=>') || 
      line.includes('await') || 
      line.includes('.then') || 
      line.includes('function ') ||
      line.includes('onClick=') ||
      line.includes('onChange=') ||
      line.includes('onBlur=') ||
      line.includes('onKeyDown=')
    ) {
      continue;
    }
    console.log(`${i + 1}: ${line}`);
  }
}
