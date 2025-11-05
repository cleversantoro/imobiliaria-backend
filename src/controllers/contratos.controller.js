const {
  listContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
  ALLOWED_TIPOS_CONTRATO,
} = require('../services/contratos.service');
const { getImovelById } = require('../services/imoveis.service');
const { getUsuarioById } = require('../services/usuarios.service');
const { mapMysqlError } = require('../utils/mysql');

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');

const getContratos = async (req, res, next) => {
  try {
    const tipoContrato = typeof req.query.tipo_contrato === 'string'
      ? req.query.tipo_contrato.toLowerCase()
      : undefined;

    if (tipoContrato && !ALLOWED_TIPOS_CONTRATO.has(tipoContrato)) {
      return res.status(400).json({ message: 'Tipo de contrato inválido.' });
    }

    const imovelFiltroRaw = req.query.imovel_id;
    const imovelFiltro = parsePositiveInt(imovelFiltroRaw);
    if (
      imovelFiltroRaw !== undefined
      && imovelFiltroRaw !== null
      && imovelFiltroRaw !== ''
      && typeof imovelFiltro === 'undefined'
    ) {
      return res.status(400).json({ message: 'Filtro de imóvel deve ser numérico.' });
    }

    const usuarioFiltroRaw = req.query.usuario_id;
    const usuarioFiltro = parsePositiveInt(usuarioFiltroRaw);
    if (
      usuarioFiltroRaw !== undefined
      && usuarioFiltroRaw !== null
      && usuarioFiltroRaw !== ''
      && typeof usuarioFiltro === 'undefined'
    ) {
      return res.status(400).json({ message: 'Filtro de usuário deve ser numérico.' });
    }

    const filtros = {
      imovel_id: imovelFiltro,
      usuario_id: usuarioFiltro,
      tipo_contrato: tipoContrato,
    };

    const contratos = await listContratos(filtros);
    return res.json(contratos);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const getContrato = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const contrato = await getContratoById(id);
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato não encontrado.' });
    }
    return res.json(contrato);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createContratoHandler = async (req, res, next) => {
  try {
    const imovelIdRaw = req.body.imovel_id;
    const imovelId = parsePositiveInt(imovelIdRaw);
    if (typeof imovelId === 'undefined') {
      return res.status(400).json({ message: 'Imóvel é obrigatório.' });
    }

    const usuarioIdRaw = req.body.usuario_id;
    const usuarioId = parsePositiveInt(usuarioIdRaw);
    if (typeof usuarioId === 'undefined') {
      return res.status(400).json({ message: 'Usuário é obrigatório.' });
    }

    const tipoContrato = typeof req.body.tipo_contrato === 'string'
      ? req.body.tipo_contrato.toLowerCase()
      : '';
    if (!ALLOWED_TIPOS_CONTRATO.has(tipoContrato)) {
      return res.status(400).json({ message: 'Tipo de contrato inválido.' });
    }

    const valor = parseNumber(req.body.valor);
    if (typeof valor === 'undefined' || valor < 0) {
      return res.status(400).json({ message: 'Valor do contrato é obrigatório e deve ser válido.' });
    }

    if (req.body.data_inicio && !isValidDate(req.body.data_inicio)) {
      return res.status(400).json({ message: 'Data de início deve estar no formato YYYY-MM-DD.' });
    }

    if (req.body.data_fim && !isValidDate(req.body.data_fim)) {
      return res.status(400).json({ message: 'Data de término deve estar no formato YYYY-MM-DD.' });
    }

    const [imovelExiste, usuarioExiste] = await Promise.all([
      getImovelById(imovelId),
      getUsuarioById(usuarioId),
    ]);

    if (!imovelExiste) {
      return res.status(404).json({ message: 'Imóvel informado não existe.' });
    }

    if (!usuarioExiste) {
      return res.status(404).json({ message: 'Usuário informado não existe.' });
    }

    const contrato = await createContrato({
      imovel_id: imovelId,
      usuario_id: usuarioId,
      tipo_contrato: tipoContrato,
      data_inicio: req.body.data_inicio || null,
      data_fim: req.body.data_fim || null,
      valor,
    });

    return res.status(201).json(contrato);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const updateContratoHandler = async (req, res, next) => {
  try {
    const payload = {};
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'imovel_id')) {
      const imovelId = parsePositiveInt(req.body.imovel_id);
      if (typeof imovelId === 'undefined') {
        return res.status(400).json({ message: 'Imóvel deve ser informado com um identificador numérico.' });
      }
      payload.imovel_id = imovelId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'usuario_id')) {
      const usuarioId = parsePositiveInt(req.body.usuario_id);
      if (typeof usuarioId === 'undefined') {
        return res.status(400).json({ message: 'Usuário deve ser informado com um identificador numérico.' });
      }
      payload.usuario_id = usuarioId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'tipo_contrato')) {
      const tipoContrato = typeof req.body.tipo_contrato === 'string'
        ? req.body.tipo_contrato.toLowerCase()
        : '';
      if (!ALLOWED_TIPOS_CONTRATO.has(tipoContrato)) {
        return res.status(400).json({ message: 'Tipo de contrato inválido.' });
      }
      payload.tipo_contrato = tipoContrato;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'data_inicio')) {
      if (req.body.data_inicio && !isValidDate(req.body.data_inicio)) {
        return res.status(400).json({ message: 'Data de início deve estar no formato YYYY-MM-DD.' });
      }
      payload.data_inicio = req.body.data_inicio || null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'data_fim')) {
      if (req.body.data_fim && !isValidDate(req.body.data_fim)) {
        return res.status(400).json({ message: 'Data de término deve estar no formato YYYY-MM-DD.' });
      }
      payload.data_fim = req.body.data_fim || null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'valor')) {
      const valor = parseNumber(req.body.valor);
      if (typeof valor === 'undefined' || valor < 0) {
        return res.status(400).json({ message: 'Valor do contrato deve ser válido.' });
      }
      payload.valor = valor;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'imovel_id')) {
      const imovelExiste = await getImovelById(payload.imovel_id);
      if (!imovelExiste) {
        return res.status(404).json({ message: 'Imóvel informado não existe.' });
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'usuario_id')) {
      const usuarioExiste = await getUsuarioById(payload.usuario_id);
      if (!usuarioExiste) {
        return res.status(404).json({ message: 'Usuário informado não existe.' });
      }
    }

    const contrato = await updateContrato(id, payload);
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato não encontrado.' });
    }

    return res.json(contrato);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteContratoHandler = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const removido = await deleteContrato(id);
    if (!removido) {
      return res.status(404).json({ message: 'Contrato não encontrado.' });
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
  getContratos,
  getContrato,
  createContrato: createContratoHandler,
  updateContrato: updateContratoHandler,
  deleteContrato: deleteContratoHandler,
};
