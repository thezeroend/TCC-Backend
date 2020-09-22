var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000,
	mysql = require('mysql'),
	faceapi = require('face-api.js'),
	bodyParser = require('body-parser');

mysql.conexao = mysql.createConnection({
	host: 'dbreconhecimentotcc.cdqphiqba2oe.sa-east-1.rds.amazonaws.com',
	port: '3306',
	user: 'goku',
	password: '*DrgJX1wAk1M+kEw',
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
	var routes = require('./api/routes/allRoutes');
	routes(app);

	//Retorno 404
	app.use(function(req, res) {
	  res.status(404).send({url: req.originalUrl + ' não encontrado'})
	});

	app.listen(port);

	console.log('API server iniciado na porta: ' + port);

	console.log('Aguardando Chamadas de Reconhecimento');

	preloading()
})

async function preloading() {
	//await faceapi.nets.ssdMobilenetv1.loadFromDisk('./src/models');
	await faceapi.nets.tinyFaceDetector.loadFromDisk('./data/models');
	await faceapi.nets.faceRecognitionNet.loadFromDisk('./data/models')
	await faceapi.nets.faceLandmark68Net.loadFromDisk('./data/models')
	//TODO: Verificar como utilizar o faceLandmarkTiny
	//await faceapi.nets.faceLandmark68TinyNet.loadFromDisk('./src/models')
	//console.log(faceapi.nets)
}

