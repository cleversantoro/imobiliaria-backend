const { Router } = require('express');
const {
  getImoveis,
  getImovel,
  createImovel,
  updateImovel,
  deleteImovel,
} = require('../controllers/imoveis.controller');
const fotosRoutes = require('./fotos.routes');

const router = Router();

router.get('/', getImoveis);
router.get('/:id', getImovel);
router.post('/', createImovel);
router.put('/:id', updateImovel);
router.delete('/:id', deleteImovel);

router.use('/:imovelId/fotos', fotosRoutes);

module.exports = router;
