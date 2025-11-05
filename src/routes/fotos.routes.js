const { Router } = require('express');
const {
  getFotos,
  createFoto,
  deleteFoto,
} = require('../controllers/fotos.controller');

const router = Router({ mergeParams: true });

router.get('/', getFotos);
router.post('/', createFoto);
router.delete('/:fotoId', deleteFoto);

module.exports = router;
