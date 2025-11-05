const { Router } = require('express');
const {
  getContratos,
  getContrato,
  createContrato,
  updateContrato,
  deleteContrato,
} = require('../controllers/contratos.controller');

const router = Router();

router.get('/', getContratos);
router.get('/:id', getContrato);
router.post('/', createContrato);
router.put('/:id', updateContrato);
router.delete('/:id', deleteContrato);

module.exports = router;
