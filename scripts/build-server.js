const fs = require('fs');
const path = require('path');

// Restaurar APIs desde fuera del directorio
const apiDir = path.join(__dirname, '../src/app/api');
const apiBackupDir = path.join(__dirname, '../api-backup');

if (fs.existsSync(apiBackupDir)) {
  fs.renameSync(apiBackupDir, apiDir);
  console.log('APIs restauradas para build servidor');
}

console.log('Listo para build servidor (con APIs)');