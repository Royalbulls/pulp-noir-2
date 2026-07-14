const fs = require('fs');

const code = fs.readFileSync('app/page.tsx', 'utf8');
const lines = code.split('\n');

const setters = new Set();
lines.forEach(line => {
  const match = line.match(/\b(set[A-Z][A-Za-z0-9]+)\s*\(/);
  if (match) setters.add(match[1]);
});

console.log("Setters found:", Array.from(setters).join(', '));

// For each setter, check if it's used nakedly (not after => or function or handle)
// Actually, let's just find anything like `setSomething(` not inside a known boundary.
