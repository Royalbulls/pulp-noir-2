import fs from 'fs';
const lines = fs.readFileSync('app/page.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/set[A-Z][a-zA-Z0-9]*\(/)) {
    if (
      line.includes('const [') || 
      line.includes('useEffect') || 
      line.includes('=>') || 
      line.includes('await') || 
      line.includes('.then') || 
      line.includes('function ') ||
      line.includes('onClick') ||
      line.includes('onChange') ||
      line.includes('onBlur') ||
      line.includes('onKeyDown') ||
      line.includes('onMouse') ||
      line.includes('setTimeout') ||
      line.includes('setInterval') ||
      line.includes('catch')
    ) {
      continue;
    }
    console.log(`${i + 1}: ${line.trim()}`);
  }
}
