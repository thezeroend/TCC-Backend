'use strict';
//require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const mysql = require('mysql');

const { Canvas, Image, ImageData } = canvas;

//Images reference
const REFERENCE_IMAGE = './src/fotos_teste/matheus.jpg'
const QUERY_IMAGE = './src/fotos_teste/salomao.jpg'

exports.get_all = function(req, res) {
	mysql.conexao.query('SELECT * FROM tb_usuarios', (err, rows) => {
		if (err) throw err
			
		res.json(rows);
	})
}

exports.teste = function (req, res) {
	async function run() {
		faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
		
		const minConfidence = 0.5
		const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence })

		await faceapi.nets.ssdMobilenetv1.loadFromDisk('./src/weights');
		await faceapi.nets.faceRecognitionNet.loadFromDisk('./src/weights')
		await faceapi.nets.faceLandmark68Net.loadFromDisk('./src/weights')

		//var _referenceImage = new canvas.Image;

		const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
		const queryImage = await canvas.loadImage(QUERY_IMAGE)

		const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
			.withFaceLandmarks()
			.withFaceDescriptors()

		const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
			.withFaceLandmarks()
			.withFaceDescriptors()

		const faceMatcher = new faceapi.FaceMatcher(resultsRef)

		/*console.log("1");
		console.log(resultsRef);
		console.log("2");
		console.log(resultsQuery); */

		console.log("Primeira Foto Dados: " + JSON.stringify(faceMatcher));
		const queryBestMatch = resultsQuery.map(res => {
			const bestMatch = faceMatcher.findBestMatch(res.descriptor)
			console.log("Comparação com a segunda: " + bestMatch.toString())
		})
		
		res.json("Sucesso");
	}
	
	run();
}



