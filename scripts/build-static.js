const fs = require('fs');
const path = require('path');

// Renombrar archivos para build estático
const apiDir = path.join(__dirname, '../src/app/api');
const apiBackupDir = path.join(__dirname, '../src/app/api-backup');

if (fs.existsSync(apiDir)) {
  fs.renameSync(apiDir, apiBackupDir);
  console.log('APIs movidas a backup para build estático');
}

console.log('Listo para build estático (GitHub Pages)');