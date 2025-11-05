const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const routes = require('./routes');
const { uploadRoot } = require('./config/uploads');

const swaggerDocument = yaml.load(path.resolve(__dirname, '..', 'swagger.yaml'));

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  '/uploads',
  express.static(uploadRoot, {
    index: false,
    maxAge: '1d',
  }),
);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.get('/docs/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, _next) => {
  // Basic error handler to avoid exposing implementation details.
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
