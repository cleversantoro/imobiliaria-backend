const { pool } = require('../db/pool');

const ALLOWED_IMOVEL_TYPES = new Set(['casa', 'apartamento', 'terreno', 'comercial']);
const ALLOWED_IMOVEL_STATUS = new Set(['disponivel', 'alugado', 'vendido']);

const buildSelect = () => `
  SELECT
    i.id,
    i.titulo,
    i.descricao,
    i.tipo,
    i.categoria_id,
    i.cidade_id,
    i.endereco,
    i.valor,
    i.status,
    i.criado_em,
    c.nome AS categoria_nome,
    cd.nome AS cidade_nome,
    cd.estado AS cidade_estado
  FROM imoveis i
  LEFT JOIN categorias c ON c.id = i.categoria_id
  LEFT JOIN cidades cd ON cd.id = i.cidade_id
`;

const listImoveis = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.tipo && ALLOWED_IMOVEL_TYPES.has(filters.tipo)) {
    conditions.push('i.tipo = ?');
    params.push(filters.tipo);
  }

  if (filters.status && ALLOWED_IMOVEL_STATUS.has(filters.status)) {
    conditions.push('i.status = ?');
    params.push(filters.status);
  }

  if (filters.categoria_id) {
    conditions.push('i.categoria_id = ?');
    params.push(Number(filters.categoria_id));
  }

  if (filters.cidade_id) {
    conditions.push('i.cidade_id = ?');
    params.push(Number(filters.cidade_id));
  }

  if (filters.valor_min) {
    conditions.push('i.valor >= ?');
    params.push(Number(filters.valor_min));
  }

  if (filters.valor_max) {
    conditions.push('i.valor <= ?');
    params.push(Number(filters.valor_max));
  }

  if (filters.busca) {
    conditions.push('(i.titulo LIKE ? OR i.descricao LIKE ?)');
    const term = `%${filters.busca}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      ${buildSelect()}
      ${whereClause}
      ORDER BY i.criado_em DESC
    `,
    params,
  );

  return rows;
};

const getImovelById = async (id) => {
  const [rows] = await pool.query(
    `
      ${buildSelect()}
      WHERE i.id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createImovel = async (payload) => {
  const {
    titulo,
    descricao = null,
    tipo,
    categoria_id: categoriaId = null,
    cidade_id: cidadeId = null,
    endereco = null,
    valor,
    status = 'disponivel',
  } = payload;

  const tipoFinal = ALLOWED_IMOVEL_TYPES.has(tipo) ? tipo : null;
  const statusFinal = ALLOWED_IMOVEL_STATUS.has(status) ? status : 'disponivel';

  const [result] = await pool.query(
    `
      INSERT INTO imoveis
        (titulo, descricao, tipo, categoria_id, cidade_id, endereco, valor, status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [titulo, descricao, tipoFinal, categoriaId, cidadeId, endereco, valor, statusFinal],
  );

  return getImovelById(result.insertId);
};

const updateImovel = async (id, payload) => {
  const atual = await getImovelById(id);
  if (!atual) {
    return null;
  }

  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(payload, 'titulo')) {
    fields.push('titulo = ?');
    params.push(payload.titulo);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'descricao')) {
    fields.push('descricao = ?');
    params.push(payload.descricao);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'tipo')) {
    const novoTipo = ALLOWED_IMOVEL_TYPES.has(payload.tipo) ? payload.tipo : atual.tipo;
    fields.push('tipo = ?');
    params.push(novoTipo);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'categoria_id')) {
    fields.push('categoria_id = ?');
    params.push(payload.categoria_id ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'cidade_id')) {
    fields.push('cidade_id = ?');
    params.push(payload.cidade_id ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'endereco')) {
    fields.push('endereco = ?');
    params.push(payload.endereco);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'valor')) {
    fields.push('valor = ?');
    params.push(payload.valor);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const novoStatus = ALLOWED_IMOVEL_STATUS.has(payload.status) ? payload.status : atual.status;
    fields.push('status = ?');
    params.push(novoStatus);
  }

  if (fields.length === 0) {
    return atual;
  }

  params.push(id);

  await pool.query(
    `
      UPDATE imoveis
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    params,
  );

  return getImovelById(id);
};

const deleteImovel = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM imoveis
      WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listImoveis,
  getImovelById,
  createImovel,
  updateImovel,
  deleteImovel,
  ALLOWED_IMOVEL_TYPES,
  ALLOWED_IMOVEL_STATUS,
};
