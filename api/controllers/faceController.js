'use strict';
//require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const mysql = require('mysql');
const { writeFileSync } = require('fs')
const { join } = require('path')

const { Canvas, Image, ImageData } = canvas;

//Seta OPTIONS do faceapi
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const TINY_FACE_OPTIONS = new faceapi.TinyFaceDetectorOptions()

//Imagens de teste
const REFERENCE_IMAGE = './data/fotos_teste/matheus.jpg'
const QUERY_IMAGE = './data/fotos_teste/salomao.jpg'

//Pasta 
const rootPasta = join(__dirname, '../../')
const dataPasta = join(rootPasta, 'data')
const facesArquivo = 'faces.json'

exports.getAll = function(req, res) {
	res.header("Content-Type", "application/json")
	const faces = join(dataPasta, facesArquivo)
	delete require.cache[faces]
	const result = require(faces)
	res.send(result);
}

exports.save = function(req, res) {
	res.header("Content-Type", "application/json")
	const content = JSON.stringify(req.body.faces)
	writeFileSync(join(dataPasta, facesArquivo), content)
	res.send('ok')
}

exports.teste = function (req, res) {
	async function run() {
		const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
		const queryImage = await canvas.loadImage(QUERY_IMAGE)
		console.log("Deu loading nas imagens")

		const resultsRef = await faceapi.detectAllFaces(referenceImage, TINY_FACE_OPTIONS)
			.withFaceLandmarks()
			.withFaceDescriptors()

		console.log("Carregou a 1 imagen")

		const resultsQuery = await faceapi.detectAllFaces(queryImage, TINY_FACE_OPTIONS)
			.withFaceLandmarks()
			.withFaceDescriptors()

		console.log("Carregou a 2 imagen")

		const faceMatcher = new faceapi.FaceMatcher(resultsRef)

		console.log("Primeira Foto Dados: " + JSON.stringify(faceMatcher));

		const queryBestMatch = resultsQuery.map(res => {
			const bestMatch = faceMatcher.findBestMatch(res.descriptor)
			//console.log("Comparação com a segunda: " + JSON.stringify(bestMatch))
		})

		res.json("Sucesso");
	}

	run()
}




