const { pool } = require('../db/pool');

const listFotosByImovel = async (imovelId) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        imovel_id,
        url,
        descricao
      FROM fotos
      WHERE imovel_id = ?
      ORDER BY id ASC
    `,
    [imovelId],
  );

  return rows;
};

const getFotoById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        imovel_id,
        url,
        descricao
      FROM fotos
      WHERE id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createFoto = async (imovelId, payload) => {
  const { url, descricao = null } = payload;

  const [result] = await pool.query(
    `
      INSERT INTO fotos (imovel_id, url, descricao)
      VALUES (?, ?, ?)
    `,
    [imovelId, url, descricao],
  );

  return getFotoById(result.insertId);
};

const deleteFoto = async (imovelId, fotoId) => {
  const [result] = await pool.query(
    `
      DELETE FROM fotos
      WHERE id = ? AND imovel_id = ?
    `,
    [fotoId, imovelId],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listFotosByImovel,
  getFotoById,
  createFoto,
  deleteFoto,
};
