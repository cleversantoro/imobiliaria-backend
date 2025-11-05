const { Router } = require('express');
const {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} = require('../controllers/categorias.controller');

const router = Router();

router.get('/', getCategorias);
router.get('/:id', getCategoria);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

module.exports = router;
