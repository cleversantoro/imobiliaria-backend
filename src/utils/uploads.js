const path = require('path');
const fs = require('fs/promises');
const { uploadRoot } = require('../config/uploads');

const getImovelUploadDir = (imovelId) =>
  path.join(uploadRoot, 'imoveis', String(imovelId));

const toPublicUrl = (imovelId, filename) =>
  path.posix.join('/uploads', 'imoveis', String(imovelId), filename);

const deleteFilesSafely = async (files = []) => {
  await Promise.all(
    files
      .filter((filePath) => !!filePath)
      .map((filePath) =>
        fs.unlink(filePath).catch(() => {
          // Silently ignore failures while cleaning up temporary files.
        }),
      ),
  );
};

module.exports = {
  getImovelUploadDir,
  toPublicUrl,
  deleteFilesSafely,
};
