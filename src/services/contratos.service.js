const { pool } = require('../db/pool');

const ALLOWED_TIPOS_CONTRATO = new Set(['aluguel', 'venda']);

const buildSelect = () => `
  SELECT
    ct.id,
    ct.imovel_id,
    ct.usuario_id,
    ct.tipo_contrato,
    ct.data_inicio,
    ct.data_fim,
    ct.valor,
    ct.criado_em,
    im.titulo AS imovel_titulo,
    us.nome AS usuario_nome,
    us.email AS usuario_email
  FROM contratos ct
  INNER JOIN imoveis im ON im.id = ct.imovel_id
  INNER JOIN usuarios us ON us.id = ct.usuario_id
`;

const listContratos = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.imovel_id) {
    conditions.push('ct.imovel_id = ?');
    params.push(Number(filters.imovel_id));
  }

  if (filters.usuario_id) {
    conditions.push('ct.usuario_id = ?');
    params.push(Number(filters.usuario_id));
  }

  if (filters.tipo_contrato && ALLOWED_TIPOS_CONTRATO.has(filters.tipo_contrato)) {
    conditions.push('ct.tipo_contrato = ?');
    params.push(filters.tipo_contrato);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      ${buildSelect()}
      ${whereClause}
      ORDER BY ct.criado_em DESC
    `,
    params,
  );

  return rows;
};

const getContratoById = async (id) => {
  const [rows] = await pool.query(
    `
      ${buildSelect()}
      WHERE ct.id = ?
    `,
    [id],
  );

  return rows[0] || null;
};

const createContrato = async (payload) => {
  const {
    imovel_id: imovelId,
    usuario_id: usuarioId,
    tipo_contrato: tipoContrato,
    data_inicio: dataInicio = null,
    data_fim: dataFim = null,
    valor,
  } = payload;

  const tipoFinal = ALLOWED_TIPOS_CONTRATO.has(tipoContrato) ? tipoContrato : null;

  const [result] = await pool.query(
    `
      INSERT INTO contratos
        (imovel_id, usuario_id, tipo_contrato, data_inicio, data_fim, valor)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `,
    [imovelId, usuarioId, tipoFinal, dataInicio, dataFim, valor],
  );

  return getContratoById(result.insertId);
};

const updateContrato = async (id, payload) => {
  const atual = await getContratoById(id);
  if (!atual) {
    return null;
  }

  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(payload, 'imovel_id')) {
    fields.push('imovel_id = ?');
    params.push(payload.imovel_id);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'usuario_id')) {
    fields.push('usuario_id = ?');
    params.push(payload.usuario_id);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'tipo_contrato')) {
    const tipoFinal = ALLOWED_TIPOS_CONTRATO.has(payload.tipo_contrato)
      ? payload.tipo_contrato
      : atual.tipo_contrato;
    fields.push('tipo_contrato = ?');
    params.push(tipoFinal);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data_inicio')) {
    fields.push('data_inicio = ?');
    params.push(payload.data_inicio);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data_fim')) {
    fields.push('data_fim = ?');
    params.push(payload.data_fim);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'valor')) {
    fields.push('valor = ?');
    params.push(payload.valor);
  }

  if (fields.length === 0) {
    return atual;
  }

  params.push(id);

  await pool.query(
    `
      UPDATE contratos
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    params,
  );

  return getContratoById(id);
};

const deleteContrato = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM contratos
      WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows > 0;
};

module.exports = {
  listContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
  ALLOWED_TIPOS_CONTRATO,
};
