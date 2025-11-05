const {
  listCidades,
  getCidadeById,
  createCidade,
  updateCidade,
  deleteCidade,
} = require('../services/cidades.service');
const { mapMysqlError } = require('../utils/mysql');

const isEstadoValido = (valor) => /^[A-Za-z]{2}$/.test(valor || '');
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getCidades = async (req, res, next) => {
  try {
    const estado = typeof req.query.estado === 'string' ? req.query.estado.toUpperCase() : undefined;
    if (estado && !isEstadoValido(estado)) {
      return res.status(400).json({ message: 'Estado deve ser informado com duas letras.' });
    }

    const cidades = await listCidades({ estado });
    return res.json(cidades);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const getCidade = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const cidade = await getCidadeById(id);
    if (!cidade) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
    }
    return res.json(cidade);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createCidadeHandler = async (req, res, next) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
    const estado = typeof req.body.estado === 'string' ? req.body.estado.toUpperCase() : '';

    if (!nome || !estado) {
      return res.status(400).json({ message: 'Nome e estado são obrigatórios.' });
    }

    if (!isEstadoValido(estado)) {
      return res.status(400).json({ message: 'Estado deve ser informado com duas letras.' });
    }

    const cidade = await createCidade({ nome, estado });
    return res.status(201).json(cidade);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const updateCidadeHandler = async (req, res, next) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : undefined;
    const estado = typeof req.body.estado === 'string' ? req.body.estado.toUpperCase() : undefined;

    if (typeof nome !== 'undefined' && !nome) {
      return res.status(400).json({ message: 'Nome não pode ser vazio.' });
    }

    if (typeof estado !== 'undefined' && !isEstadoValido(estado)) {
      return res.status(400).json({ message: 'Estado deve ser informado com duas letras.' });
    }

    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const cidade = await updateCidade(id, { nome, estado });
    if (!cidade) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
    }

    return res.json(cidade);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteCidadeHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const deletado = await deleteCidade(id);
    if (!deletado) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
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
  getCidades,
  getCidade,
  createCidade: createCidadeHandler,
  updateCidade: updateCidadeHandler,
  deleteCidade: deleteCidadeHandler,
};
