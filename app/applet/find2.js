const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /set[A-Z][a-zA-Z0-9]*\(/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const codeBefore = content.substring(Math.max(0, match.index - 60), match.index);
  if (
    !codeBefore.includes('=>') && 
    !codeBefore.includes('onClick') && 
    !codeBefore.includes('onChange') &&
    !codeBefore.includes('onBlur') &&
    !codeBefore.includes('onKeyDown') &&
    !codeBefore.includes('onMouseEnter') &&
    !codeBefore.includes('onMouseLeave') &&
    !codeBefore.includes('then(') &&
    !codeBefore.includes('finally(') &&
    !codeBefore.includes('catch(') &&
    !codeBefore.includes('setTimeout(') &&
    !codeBefore.includes('setInterval(') &&
    !codeBefore.includes('function') &&
    !codeBefore.includes('const [') &&
    !codeBefore.includes('let [')
  ) {
    console.log(`Match at ${match.index}: \\n...${codeBefore}>>>${content.substring(match.index, match.index + 50)}...\\n`);
  }
}
