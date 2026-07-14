const fs = require('fs');

function findBodySetters(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n');
  
  let inFunction = 0;
  let inEffectOrMemo = 0;
  let inJSX = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Simple block tracking
    if (line.includes('{')) inFunction += (line.match(/{/g) || []).length;
    
    const isSetter = line.match(/\bset[A-Z][a-zA-Z0-9]*\(/);
    const isInsideHook = line.includes('useEffect') || line.includes('useMemo') || line.includes('useCallback');
    const isInsideHandler = line.startsWith('const handle') || line.startsWith('const on') || line.match(/^[a-z]+[a-zA-Z0-9]* =.*=>/);

    // This is very naive but might catch something
    if (isSetter && !isInsideHook && !isInsideHandler && inFunction === 1) {
       console.log(`Potential body setter at line ${i + 1}: ${line}`);
    }

    if (line.includes('}')) inFunction -= (line.match(/}/g) || []).length;
  }
}

findBodySetters('app/page.tsx');
