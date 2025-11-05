const { pool } = require('../db/pool');

const listCategorias = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome
      FROM categorias
      ORDER BY nome ASC
    `,
  );

  return rows;
};

const getCategoriaById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        nome
      FROM categorias
      WHERE id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createCategoria = async (payload) => {
  const nome = payload.nome?.trim();

  const [result] = await pool.query(
    `
      INSERT INTO categorias (nome)
      VALUES (?)
    `,
    [nome],
  );

  return getCategoriaById(result.insertId);
};

const updateCategoria = async (id, payload) => {
  const atual = await getCategoriaById(id);
  if (!atual) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(payload, 'nome')) {
    return atual;
  }

  const nome = payload.nome?.trim();

  await pool.query(
    `
      UPDATE categorias
      SET nome = ?
      WHERE id = ?
    `,
    [nome, id],
  );

  return getCategoriaById(id);
};

const deleteCategoria = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM categorias
      WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
