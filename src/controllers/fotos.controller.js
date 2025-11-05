const {
  listFotosByImovel,
  createFoto,
  deleteFoto,
} = require('../services/fotos.service');
const { getImovelById } = require('../services/imoveis.service');
const { mapMysqlError } = require('../utils/mysql');

const ensureImovelExists = async (imovelId) => {
  const imovel = await getImovelById(imovelId);
  return Boolean(imovel);
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getFotos = async (req, res, next) => {
  try {
    const imovelId = parseId(req.params.imovelId);
    if (!imovelId) {
      return res.status(400).json({ message: 'Identificador de imóvel inválido.' });
    }
    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    const fotos = await listFotosByImovel(imovelId);
    return res.json(fotos);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createFotoHandler = async (req, res, next) => {
  try {
    const imovelId = parseId(req.params.imovelId);
    if (!imovelId) {
      return res.status(400).json({ message: 'Identificador de imóvel inválido.' });
    }
    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
    if (!url) {
      return res.status(400).json({ message: 'URL da foto é obrigatória.' });
    }

    const foto = await createFoto(imovelId, {
      url,
      descricao: typeof req.body.descricao === 'string' ? req.body.descricao : null,
    });

    return res.status(201).json(foto);
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
      return res.status(400).json({ message: 'Identificadores inválidos.' });
    }

    const existe = await ensureImovelExists(imovelId);
    if (!existe) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    const removida = await deleteFoto(imovelId, fotoId);
    if (!removida) {
      return res.status(404).json({ message: 'Foto não encontrada.' });
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
