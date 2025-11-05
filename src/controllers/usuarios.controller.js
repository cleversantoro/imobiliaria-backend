const {
  listUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  ALLOWED_USER_TYPES,
} = require('../services/usuarios.service');
const { mapMysqlError } = require('../utils/mysql');

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getUsuarios = async (req, res, next) => {
  try {
    const tipoUsuario = typeof req.query.tipo_usuario === 'string'
      ? req.query.tipo_usuario.toLowerCase()
      : undefined;

    if (tipoUsuario && !ALLOWED_USER_TYPES.has(tipoUsuario)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    }

    const usuarios = await listUsuarios({ tipo_usuario: tipoUsuario });
    return res.json(usuarios);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const getUsuario = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const usuario = await getUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.json(usuario);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const createUsuarioHandler = async (req, res, next) => {
  try {
    const tipoUsuario = typeof req.body.tipo_usuario === 'string'
      ? req.body.tipo_usuario.toLowerCase()
      : undefined;
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
    }

    if (tipoUsuario && !ALLOWED_USER_TYPES.has(tipoUsuario)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    }

    const usuario = await createUsuario({ nome, email, telefone, tipo_usuario: tipoUsuario });
    return res.status(201).json(usuario);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const updateUsuarioHandler = async (req, res, next) => {
  try {
    const { tipo_usuario: tipoUsuarioRaw, ...resto } = req.body;
    const tipoUsuario = typeof tipoUsuarioRaw === 'string' ? tipoUsuarioRaw.toLowerCase() : undefined;

    if (tipoUsuario && !ALLOWED_USER_TYPES.has(tipoUsuario)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    }

    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const usuario = await updateUsuario(id, {
      ...resto,
      ...(typeof tipoUsuario !== 'undefined' ? { tipo_usuario: tipoUsuario } : {}),
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.json(usuario);
  } catch (error) {
    const mapped = mapMysqlError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    return next(error);
  }
};

const deleteUsuarioHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Identificador inválido.' });
    }

    const removido = await deleteUsuario(id);
    if (!removido) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
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
  getUsuarios,
  getUsuario,
  createUsuario: createUsuarioHandler,
  updateUsuario: updateUsuarioHandler,
  deleteUsuario: deleteUsuarioHandler,
};
