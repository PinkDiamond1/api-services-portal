const fs = require('fs');
const express = require('express');
const { RegisterRoutes } = require('./controllers/routes');
const specFile = fs.realpathSync('controllers/openapi.yaml');
const spec = fs.readFileSync(specFile);

const { Register } = require('./controllers/ioc/registry');

class ApiOpenapiApp {
  constructor() {}

  prepareMiddleware({ keystone }) {
    const app = express();
    app.use(express.json());

    Register(keystone);

    RegisterRoutes(app);

    app.get('/ds/api/openapi.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(spec);
    });

    return app;
  }
}

module.exports = {
  ApiOpenapiApp,
};
