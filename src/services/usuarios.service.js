const { pool } = require('../db/pool');

const ALLOWED_USER_TYPES = new Set(['admin', 'cliente', 'corretor']);

const listUsuarios = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.tipo_usuario) {
    conditions.push('tipo_usuario = ?');
    params.push(filters.tipo_usuario);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome,
        email,
        telefone,
        tipo_usuario,
        criado_em
      FROM usuarios
      ${whereClause}
      ORDER BY criado_em DESC
    `,
    params,
  );

  return rows;
};

const getUsuarioById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome,
        email,
        telefone,
        tipo_usuario,
        criado_em
      FROM usuarios
      WHERE id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createUsuario = async (payload) => {
  const {
    nome,
    email,
    telefone = null,
    tipo_usuario: tipoUsuario = 'cliente',
  } = payload;

  const novoTipo = ALLOWED_USER_TYPES.has(tipoUsuario) ? tipoUsuario : 'cliente';

  const [result] = await pool.query(
    `
      INSERT INTO usuarios (nome, email, telefone, tipo_usuario)
      VALUES (?, ?, ?, ?)
    `,
    [nome, email, telefone, novoTipo],
  );

  return getUsuarioById(result.insertId);
};

const updateUsuario = async (id, payload) => {
  const atual = await getUsuarioById(id);
  if (!atual) {
    return null;
  }

  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(payload, 'nome')) {
    fields.push('nome = ?');
    params.push(payload.nome);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
    fields.push('email = ?');
    params.push(payload.email);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'telefone')) {
    fields.push('telefone = ?');
    params.push(payload.telefone);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'tipo_usuario')) {
    const tipoAtualizado = ALLOWED_USER_TYPES.has(payload.tipo_usuario)
      ? payload.tipo_usuario
      : atual.tipo_usuario;
    fields.push('tipo_usuario = ?');
    params.push(tipoAtualizado);
  }

  if (fields.length === 0) {
    return atual;
  }

  params.push(id);

  await pool.query(
    `
      UPDATE usuarios
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    params,
  );

  return getUsuarioById(id);
};

const deleteUsuario = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM usuarios
      WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  ALLOWED_USER_TYPES,
};
