const {
  listImoveis,
  getImovelById,
  createImovel,
  updateImovel,
  deleteImovel,
  ALLOWED_IMOVEL_TYPES,
  ALLOWED_IMOVEL_STATUS,
} = require('../services/imoveis.service');
const { listFotosByImovel } = require('../services/fotos.service');
const { mapMysqlError } = require('../utils/mysql');

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getImoveis = async (req, res, next) => {
  try {
    const tipo = typeof req.query.tipo === 'string' ? req.query.tipo.toLowerCase() : undefined;
    if (tipo && !ALLOWED_IMOVEL_TYPES.has(tipo)) {
      return res.status(400).json({ message: 'Tipo de imóvel inválido.' });
    }

    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : undefined;
    if (status && !ALLOWED_IMOVEL_STATUS.has(status)) {
      return res.status(400).json({ message: 'Status de imóvel inválido.' });
    }

    const filtros = {
      tipo,
      status,
      categoria_id: parseNumber(req.query.categoria_id),
      cidade_id: parseNumber(req.query.cidade_id),
      valor_min: parseNumber(req.query.valor_min),
      valor_max: parseNumber(req.query.valor_max),
      busca: typeof req.query.busca === 'string' ? req.query.busca : undefined,
    };

    const imoveis = await listImoveis(filtros);
    return res.json(imoveis);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const getImovel = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const imovel = await getImovelById(id);
    if (!imovel) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    const fotos = await listFotosByImovel(id);
    return res.json({ ...imovel, fotos });
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createImovelHandler = async (req, res, next) => {
  try {
    const tipo = typeof req.body.tipo === 'string' ? req.body.tipo.toLowerCase() : undefined;
    if (!tipo || !ALLOWED_IMOVEL_TYPES.has(tipo)) {
      return res.status(400).json({ message: 'Tipo de imóvel é obrigatório e deve ser válido.' });
    }

    const status = typeof req.body.status === 'string' ? req.body.status.toLowerCase() : undefined;
    if (status && !ALLOWED_IMOVEL_STATUS.has(status)) {
      return res.status(400).json({ message: 'Status de imóvel inválido.' });
    }

    const titulo = typeof req.body.titulo === 'string' ? req.body.titulo.trim() : '';
    if (!titulo) {
      return res.status(400).json({ message: 'Título é obrigatório.' });
    }

    const valor = parseNumber(req.body.valor);
    if (typeof valor === 'undefined' || valor < 0) {
      return res.status(400).json({ message: 'Valor do imóvel é obrigatório e deve ser válido.' });
    }

    const categoriaRaw = req.body.categoria_id;
    const categoriaId = parseNumber(categoriaRaw);
    if (
      typeof categoriaId === 'undefined'
      && categoriaRaw !== undefined
      && categoriaRaw !== null
      && categoriaRaw !== ''
    ) {
      return res.status(400).json({ message: 'Categoria deve ser informada com um identificador numérico.' });
    }

    const cidadeRaw = req.body.cidade_id;
    const cidadeId = parseNumber(cidadeRaw);
    if (
      typeof cidadeId === 'undefined'
      && cidadeRaw !== undefined
      && cidadeRaw !== null
      && cidadeRaw !== ''
    ) {
      return res.status(400).json({ message: 'Cidade deve ser informada com um identificador numérico.' });
    }

    const payload = {
      titulo,
      descricao: typeof req.body.descricao === 'string' ? req.body.descricao : null,
      tipo,
      categoria_id: categoriaId ?? null,
      cidade_id: cidadeId ?? null,
      endereco: typeof req.body.endereco === 'string' ? req.body.endereco : null,
      valor,
      status: status || 'disponivel',
    };

    const imovel = await createImovel(payload);
    return res.status(201).json(imovel);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const updateImovelHandler = async (req, res, next) => {
  try {
    const payload = {};
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'titulo')) {
      const titulo = typeof req.body.titulo === 'string' ? req.body.titulo.trim() : '';
      if (!titulo) {
        return res.status(400).json({ message: 'Título não pode ser vazio.' });
      }
      payload.titulo = titulo;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'descricao')) {
      payload.descricao = typeof req.body.descricao === 'string' ? req.body.descricao : null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'tipo')) {
      const tipo = typeof req.body.tipo === 'string' ? req.body.tipo.toLowerCase() : '';
      if (!ALLOWED_IMOVEL_TYPES.has(tipo)) {
        return res.status(400).json({ message: 'Tipo de imóvel inválido.' });
      }
      payload.tipo = tipo;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'categoria_id')) {
      const categoriaRaw = req.body.categoria_id;
      const categoriaId = parseNumber(categoriaRaw);
      if (
        typeof categoriaId === 'undefined'
        && categoriaRaw !== undefined
        && categoriaRaw !== null
        && categoriaRaw !== ''
      ) {
        return res.status(400).json({ message: 'Categoria deve ser informada com um identificador numérico.' });
      }
      payload.categoria_id = categoriaId ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'cidade_id')) {
      const cidadeRaw = req.body.cidade_id;
      const cidadeId = parseNumber(cidadeRaw);
      if (
        typeof cidadeId === 'undefined'
        && cidadeRaw !== undefined
        && cidadeRaw !== null
        && cidadeRaw !== ''
      ) {
        return res.status(400).json({ message: 'Cidade deve ser informada com um identificador numérico.' });
      }
      payload.cidade_id = cidadeId ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'endereco')) {
      payload.endereco = typeof req.body.endereco === 'string' ? req.body.endereco : null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'valor')) {
      const valor = parseNumber(req.body.valor);
      if (typeof valor === 'undefined' || valor < 0) {
        return res.status(400).json({ message: 'Valor do imóvel deve ser válido.' });
      }
      payload.valor = valor;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
      const status = typeof req.body.status === 'string' ? req.body.status.toLowerCase() : '';
      if (!ALLOWED_IMOVEL_STATUS.has(status)) {
        return res.status(400).json({ message: 'Status de imóvel inválido.' });
      }
      payload.status = status;
    }

    const imovel = await updateImovel(id, payload);
    if (!imovel) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    return res.json(imovel);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteImovelHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const removido = await deleteImovel(id);
    if (!removido) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
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
  getImoveis,
  getImovel,
  createImovel: createImovelHandler,
  updateImovel: updateImovelHandler,
  deleteImovel: deleteImovelHandler,
};
