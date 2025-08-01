const fs = require('fs');
const path = require('path');

// Mover APIs fuera del directorio src/app
const apiDir = path.join(__dirname, '../src/app/api');
const apiBackupDir = path.join(__dirname, '../api-backup');

if (fs.existsSync(apiDir)) {
  fs.renameSync(apiDir, apiBackupDir);
  console.log('APIs movidas fuera de src/app para build estático');
}

console.log('Listo para build estático (GitHub Pages)');