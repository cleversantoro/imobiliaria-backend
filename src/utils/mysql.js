const duplicateEntryPattern = /Duplicate entry '(.+)' for key '(.+)'/i;

const mysqlErrorMap = {
  ER_DATA_TOO_LONG: { status: 400, message: 'Dados inválidos para um dos campos enviados.' },
  ER_TRUNCATED_WRONG_VALUE: { status: 400, message: 'Formato de dado inválido para um dos campos enviados.' },
  ER_BAD_NULL_ERROR: { status: 400, message: 'Campos obrigatórios ausentes.' },
  ER_NO_REFERENCED_ROW: { status: 400, message: 'Referência inválida: registro relacionado não encontrado.' },
  ER_NO_REFERENCED_ROW_2: { status: 400, message: 'Referência inválida: registro relacionado não encontrado.' },
  ER_ROW_IS_REFERENCED: {
    status: 409,
    message: 'Não é possível excluir: existem registros relacionados a este recurso.',
  },
  ER_ROW_IS_REFERENCED_2: {
    status: 409,
    message: 'Não é possível excluir: existem registros relacionados a este recurso.',
  },
};

const mapMysqlError = (error) => {
  if (!error || !error.code) {
    return null;
  }

  if (error.code === 'ER_DUP_ENTRY') {
    const match = duplicateEntryPattern.exec(error.sqlMessage || '');
    if (match) {
      return {
        status: 409,
        message: `Valor '${match[1]}' já está em uso (${match[2]}).`,
      };
    }

    return {
      status: 409,
      message: 'Registro duplicado: o valor informado já está em uso.',
    };
  }

  const mapped = mysqlErrorMap[error.code];
  if (mapped) {
    return mapped;
  }

  if (error.sqlMessage) {
    return {
      status: 400,
      message: error.sqlMessage,
    };
  }

  return null;
};

module.exports = { mapMysqlError };
