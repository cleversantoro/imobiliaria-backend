const {
  listCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} = require('../services/categorias.service');
const { mapMysqlError } = require('../utils/mysql');

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getCategorias = async (_req, res, next) => {
  try {
    const categorias = await listCategorias();
    return res.json(categorias);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const getCategoria = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const categoria = await getCategoriaById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    return res.json(categoria);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createCategoriaHandler = async (req, res, next) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
    if (!nome) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
    }

    const categoria = await createCategoria({ nome });
    return res.status(201).json(categoria);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const updateCategoriaHandler = async (req, res, next) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : undefined;
    if (typeof nome !== 'undefined' && !nome) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
    }

    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const categoria = await updateCategoria(id, { nome });
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    return res.json(categoria);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteCategoriaHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const deletado = await deleteCategoria(id);
    if (!deletado) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
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
  getCategorias,
  getCategoria,
  createCategoria: createCategoriaHandler,
  updateCategoria: updateCategoriaHandler,
  deleteCategoria: deleteCategoriaHandler,
};
