const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /on[A-Z][a-zA-Z]*=\{[ ]*(set|update|handle|toggle)[A-Za-z0-9]+\([^)]+\)[ ]*\}/g;

let match;
while ((match = regex.exec(content)) !== null) {
  console.log("Found bad handler block:", match[0]);
}
