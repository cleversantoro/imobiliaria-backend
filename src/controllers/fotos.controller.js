const path = require('path');
const {
  listFotosByImovel,
  createFoto,
  deleteFoto,
  getFotoById,
} = require('../services/fotos.service');
const { getImovelById } = require('../services/imoveis.service');
const { mapMysqlError } = require('../utils/mysql');
const { maxFilesPerProperty, uploadRoot } = require('../config/uploads');
const { toPublicUrl, deleteFilesSafely } = require('../utils/uploads');

const ensureImovelExists = async (imovelId) => {
  const imovel = await getImovelById(imovelId);
  return Boolean(imovel);
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const mapFotoToResponse = (foto) => {
  if (!foto) {
    return null;
  }

  const filename =
    typeof foto.url === 'string' && foto.url.includes('/')
      ? foto.url.split('/').pop()
      : undefined;

  return {
    id: foto.id,
    imovel_id: foto.imovel_id,
    url: foto.url,
    descricao: foto.descricao,
    filename,
  };
};

const cleanupUploadedFiles = (uploadedFiles = []) =>
  deleteFilesSafely(uploadedFiles.map((file) => file?.path).filter(Boolean));

const toAbsoluteFilePath = (foto) => {
  if (!foto?.url || typeof foto.url !== 'string') {
    return null;
  }

  const prefix = '/uploads/';
  if (!foto.url.startsWith(prefix)) {
    return null;
  }

  const relative = foto.url.slice(prefix.length);
  return path.join(uploadRoot, relative);
};

const getFotos = async (req, res, next) => {
  try {
    const imovelId = parseId(req.params.imovelId);
    if (!imovelId) {
      return res.status(400).json({ message: 'Identificador de imovel invalido.' });
    }

    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      return res.status(404).json({ message: 'Imovel nao encontrado.' });
    }

    const fotos = await listFotosByImovel(imovelId);
    return res.json({
      fotos: fotos.map((foto) => mapFotoToResponse(foto)),
    });
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createFotoHandler = async (req, res, next) => {
  const uploadedFiles = Array.isArray(req.files) ? req.files : [];

  try {
    const imovelId = parseId(req.params.imovelId);
    if (!imovelId) {
      await cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({ message: 'Identificador de imovel invalido.' });
    }

    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      await cleanupUploadedFiles(uploadedFiles);
      return res.status(404).json({ message: 'Imovel nao encontrado.' });
    }

    const descricao = typeof req.body.descricao === 'string' ? req.body.descricao : null;

    if (!uploadedFiles.length) {
      const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
      if (!url) {
        return res
          .status(400)
          .json({ message: 'Envie ao menos uma foto ou forneca uma URL valida.' });
      }

      const foto = await createFoto(imovelId, { url, descricao });
      return res.status(201).json({
        fotos: [mapFotoToResponse(foto)],
      });
    }

    const fotosExistentes = await listFotosByImovel(imovelId);
    if (fotosExistentes.length + uploadedFiles.length > maxFilesPerProperty) {
      await cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({
        message: `Cada imovel pode conter no maximo ${maxFilesPerProperty} fotos.`,
      });
    }

    const createdIds = [];

    try {
      const novasFotos = [];
      for (const file of uploadedFiles) {
        const url = toPublicUrl(imovelId, file.filename);
        const foto = await createFoto(imovelId, { url, descricao });
        createdIds.push(foto.id);

        novasFotos.push({
          ...mapFotoToResponse(foto),
          originalName: file.originalname,
          size: file.size,
        });
      }

      return res.status(201).json({ fotos: novasFotos });
    } catch (error) {
      await cleanupUploadedFiles(uploadedFiles);
      if (createdIds.length) {
        await Promise.all(
          createdIds.map((fotoId) =>
            deleteFoto(imovelId, fotoId).catch(() => {
              // Ignore failures during rollback.
            }),
          ),
        );
      }
      throw error;
    }
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteFotoHandler = async (req, res, next) => {
  try {
    const imovelId = parseId(req.params.imovelId);
    const fotoId = parseId(req.params.fotoId);

    if (!imovelId || !fotoId) {
      return res.status(400).json({ message: 'Identificadores invalidos.' });
    }

    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      return res.status(404).json({ message: 'Imovel nao encontrado.' });
    }

    const foto = await getFotoById(fotoId);
    if (!foto || foto.imovel_id !== imovelId) {
      return res.status(404).json({ message: 'Foto nao encontrada.' });
    }

    const removida = await deleteFoto(imovelId, fotoId);
    if (!removida) {
      return res.status(404).json({ message: 'Foto nao encontrada.' });
    }

    const absolutePath = toAbsoluteFilePath(foto);
    if (absolutePath) {
      await deleteFilesSafely([absolutePath]);
    }

    return res.status(204).send();
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

module.exports = {
  getFotos,
  createFoto: createFotoHandler,
  deleteFoto: deleteFotoHandler,
};
