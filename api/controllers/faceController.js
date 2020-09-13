'use strict';

const faceapi = require('face-api.js');
const canvas = require('canvas');

//Images reference
const REFERENCE_IMAGE = './src/fotos_teste/matheus.jpg'
const QUERY_IMAGE = './src/fotos_teste/salomao.jpg'

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

const mysql = require('mysql');

exports.get_all = function(req, res) {
	mysql.conexao.query('SELECT * FROM tb_usuarios', (err, rows) => {
		if (err) throw err
			
		res.json(rows);
	})
}

exports.teste = function (req, res) {
	// SsdMobilenetv1Options
	const minConfidence = 0.5

	const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence })

	async function run() {
		await faceDetectionNet.loadFromDisk('./src/weights');
		await faceapi.nets.faceLandmark68Net.loadFromDisk('./src/weights')
  		await faceapi.nets.faceRecognitionNet.loadFromDisk('./src/weights')

  		const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
  		const queryImage = await canvas.loadImage(QUERY_IMAGE)

  		console.log(queryImage);

  		/*const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
  			.withFaceLandmarks()
  			.withFaceDescriptors()

  		const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
  			.withFaceLandmarks()
  			.withFaceDescriptors()

  		const faceMatcher = new faceapi.faceMatcher(resultsRef) */

  		//console.log(faceMatcher);
	}

	//console.log(faceapi.nets)
	run();
	res.json("Sucesso");
}
