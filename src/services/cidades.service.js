const { pool } = require('../db/pool');

const listCidades = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.estado) {
    conditions.push('estado = ?');
    params.push(filters.estado.toUpperCase());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome,
        estado
      FROM cidades
      ${whereClause}
      ORDER BY nome ASC
    `,
    params,
  );

  return rows;
};

const getCidadeById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome,
        estado
      FROM cidades
      WHERE id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createCidade = async (payload) => {
  const nome = payload.nome?.trim();
  const estado = payload.estado?.toUpperCase();

  const [result] = await pool.query(
    `
      INSERT INTO cidades (nome, estado)
      VALUES (?, ?)
    `,
    [nome, estado],
  );

  return getCidadeById(result.insertId);
};

const updateCidade = async (id, payload) => {
  const atual = await getCidadeById(id);
  if (!atual) {
    return null;
  }

  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(payload, 'nome')) {
    fields.push('nome = ?');
    params.push(payload.nome?.trim());
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'estado')) {
    fields.push('estado = ?');
    params.push(payload.estado?.toUpperCase());
  }

  if (fields.length === 0) {
    return atual;
  }

  params.push(id);

  await pool.query(
    `
      UPDATE cidades
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    params,
  );

  return getCidadeById(id);
};

const deleteCidade = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM cidades
      WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listCidades,
  getCidadeById,
  createCidade,
  updateCidade,
  deleteCidade,
};
