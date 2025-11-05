const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const {
  getFotos,
  createFoto,
  deleteFoto,
} = require('../controllers/fotos.controller');
const {
  uploadRoot,
  maxFilesPerProperty,
  maxFileSize,
  allowedMimeTypes,
} = require('../config/uploads');
const { getImovelUploadDir } = require('../utils/uploads');

const router = Router({ mergeParams: true });

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const imovelId = req.params?.imovelId;
    if (!imovelId || Number.isNaN(Number(imovelId))) {
      callback(new Error('Identificador de imovel invalido.'), '');
      return;
    }

    const targetDir = getImovelUploadDir(imovelId);
    fs.mkdirSync(targetDir, { recursive: true });
    callback(null, targetDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || '.jpg';
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 10);
    callback(null, `${timestamp}-${randomPart}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: maxFilesPerProperty,
    fileSize: maxFileSize,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Formato de arquivo nao suportado.'));
      return;
    }

    callback(null, true);
  },
});

const handleUpload = (req, res, next) => {
  upload.array('fotos', maxFilesPerProperty)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Cada arquivo deve ter no maximo 5MB.'
          : error.code === 'LIMIT_FILE_COUNT'
            ? `Envie no maximo ${maxFilesPerProperty} arquivos por requisicao.`
            : error.message;
      res.status(400).json({ message });
      return;
    }

    res.status(400).json({ message: error.message || 'Falha ao processar upload.' });
  });
};

router.get('/', getFotos);
router.post('/', handleUpload, createFoto);
router.delete('/:fotoId', deleteFoto);

module.exports = router;
