const fs = require('fs');
const path = require('path');

const srcFolder = path.join(__dirname, 'src');
const allFiles = [];
const imports = new Set();

function scanFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanFiles(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      allFiles.push(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/from ['"](.+?)['"]/g) || [];
      matches.forEach(match => {
        let importPath = match.match(/['"](.+?)['"]/)[1];
        const resolvedPath = path.resolve(path.dirname(fullPath), importPath);
        imports.add(resolvedPath);
        imports.add(resolvedPath + '.jsx');
        imports.add(resolvedPath + '.js');
      });
    }
  });
}

scanFiles(srcFolder);

const unused = allFiles.filter(f => !imports.has(f));
console.log('\n🔍 Archivos no referenciados (posiblemente sin uso):\n');
unused.forEach(f => console.log('- ' + path.relative(srcFolder, f)));
