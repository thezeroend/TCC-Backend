var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/faceRoutes'); //Importa as rotas
routes(app);

app.listen(port);

console.log('API server inciado na porta: ' + port);