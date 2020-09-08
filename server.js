var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mysql = require('mysql'),
  bodyParser = require('body-parser');

mysql.conexao = mysql.createConnection({
	host: 'dbreconhecimento.cdqphiqba2oe.sa-east-1.rds.amazonaws.com',
	port: '3306',
	user: 'admin',
	password: 'admin1234',
	database: 'bd_facial'
})

mysql.conexao.connect((err) => {
    if (err) {
        console.log('Erro ao conectar no banco de dados...', err)
        return
    }
    console.log('Conexão com o banco realizada!')

    app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	//Importa as rotas
	var routes = require('./api/routes/faceRoutes');
	routes(app);

	//Retorno 404
	app.use(function(req, res) {
	  res.status(404).send({url: req.originalUrl + ' não encontrado'})
	});

	app.listen(port);

	console.log('API server inciado na porta: ' + port);
})


