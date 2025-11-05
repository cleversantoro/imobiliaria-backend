const { Router } = require('express');
const healthRoutes = require('./health.routes');
const usuariosRoutes = require('./usuarios.routes');
const categoriasRoutes = require('./categorias.routes');
const cidadesRoutes = require('./cidades.routes');
const imoveisRoutes = require('./imoveis.routes');
const contratosRoutes = require('./contratos.routes');

const router = Router();

router.use('/', healthRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/cidades', cidadesRoutes);
router.use('/imoveis', imoveisRoutes);
router.use('/contratos', contratosRoutes);

module.exports = router;
