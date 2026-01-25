// Post-build script to add BigInt serialization
const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'dist', 'main.js');

if (!fs.existsSync(mainJsPath)) {
  console.error('❌ dist/main.js not found!');
  process.exit(1);
}

let content = fs.readFileSync(mainJsPath, 'utf8');

// Check if BigInt serialization already exists
if (content.includes('BigInt.prototype.toJSON')) {
  console.log('✅ BigInt serialization already exists in dist/main.js');
} else {
  // Add BigInt serialization right after "use strict"
  if (content.startsWith('"use strict";')) {
    content = '"use strict";\n// BigInt serialization fix\nBigInt.prototype.toJSON = function() { return this.toString(); };\n' + content.substring('"use strict";'.length);
  } else {
    // Add at the beginning if no "use strict"
    content = '// BigInt serialization fix\nBigInt.prototype.toJSON = function() { return this.toString(); };\n' + content;
  }
  fs.writeFileSync(mainJsPath, content, 'utf8');
  console.log('✅ BigInt serialization added to dist/main.js');
}
