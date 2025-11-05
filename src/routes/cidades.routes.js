const { Router } = require('express');
const {
  getCidades,
  getCidade,
  createCidade,
  updateCidade,
  deleteCidade,
} = require('../controllers/cidades.controller');

const router = Router();

router.get('/', getCidades);
router.get('/:id', getCidade);
router.post('/', createCidade);
router.put('/:id', updateCidade);
router.delete('/:id', deleteCidade);

module.exports = router;
