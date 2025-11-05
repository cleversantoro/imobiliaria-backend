const path = require('path');

const uploadRoot = path.resolve(process.cwd(), 'uploads');
const maxFilesPerProperty = 10;
const maxFileSize = 5 * 1024 * 1024; // 5 MB per file
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

module.exports = {
  uploadRoot,
  maxFilesPerProperty,
  maxFileSize,
  allowedMimeTypes,
};
