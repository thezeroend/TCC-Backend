'use strict';
//require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const mysql = require('mysql');
const fs = require('fs').promises;
const { writeFileSync } = require('fs');
const { join } = require('path');

const { Canvas, createCanvas, Image, ImageData } = canvas;

//Imagens de teste
const REFERENCE_IMAGE = './data/fotos_teste/matheus.jpg'
const QUERY_IMAGE = './data/fotos_teste/salomao.jpg'

//Pasta 
const rootPasta = join(__dirname, '../../')
const dataPasta = join(rootPasta, 'data')
const tmpPasta = join(dataPasta, 'tmp')
const fotosPasta = join(dataPasta, 'fotos')
const facesArquivo = 'faces.json'

//Seta OPTIONS do faceapi
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const TINY_FACE_OPTIONS = new faceapi.TinyFaceDetectorOptions({
	scoreThreshold: 0.5
})

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

exports.recognize = function(req, res) {
	async function recognize () {
		let foto = req.body.foto;
		let tmp_filename = Date.now()+".png";
		let errors = 0;

		const tmpFile = join(tmpPasta, tmp_filename)

		foto = foto.replace(/^data:image\/png;base64,/, "")

		writeFileSync(tmpFile, foto, {encoding: 'base64'}, function (err) {
			errors++;
		})
 		
 		if (errors == 0) {
			const options = {
				landmarksEnabled: true,
				descriptorsEnabled: true
			}

			const possiveis = [];
			const referenceImage = await canvas.loadImage(tmpFile)
			const resultsRef = await faceapi.detectAllFaces(referenceImage, TINY_FACE_OPTIONS)
				.withFaceLandmarks()
				.withFaceDescriptors()

			console.log(resultsRef.length)
			if (resultsRef.length > 0) {
				let resultadoFinal = null;

				const faceMatcher = new faceapi.FaceMatcher(resultsRef)

				const faces = join(dataPasta, facesArquivo)
				delete require.cache[faces]
				const results = require(faces)

				results.forEach(fd => {
					let descriptor = Object.keys(fd.descriptors[0].descriptor).map((key) => [fd.descriptors[0].descriptor[key]]);
					
					descriptor = new Float32Array(descriptor)
					
					const bestMatch = faceMatcher.findBestMatch(descriptor)

					if (bestMatch._label == 'person 1') {
						possiveis.push({
							"ra": fd.ra,
							"nome": "",
							"label": true,
							"possibilidade": bestMatch._distance
						});
					}
					/*  else {
						possiveis.push({
							"ra": fd.ra,
							"nome": "Nome de Teste",
							"label": false,
							"possibilidade": bestMatch._distance
						});
					} */
				})

				console.log(possiveis)
				possiveis.forEach(ps => {
					if (ps.possibilidade == 0 || ps.possibilidade >= 0.3) {
						resultadoFinal = ps;
					}
				})

				mysql.conexao.query('SELECT nome FROM tb_usuarios WHERE ra = "'+ resultadoFinal.ra +'"', 
					(err, rows) => {
					if (err) throw err

					resultadoFinal.nome = rows[0].nome;
					console.log("Dentro da consulta")
					console.log(resultadoFinal)
					res.json(resultadoFinal)	
				})
			} else {
				console.log("teste")

				let response = {
					status: 404,
					message: 'Não foi possivel encontrar rosto'
				}

				res.json(response)
			}
		} else {
			let response = {
				status: 400,
				message: 'Não foi possivel encontrar rosto'
			}
			
			res.json(response)
		}
	}

	recognize()
}

exports.train = function(req, res) {
	async function train () {
		const faces = [];
		const options = {
			landmarksEnabled: true,
			descriptorsEnabled: true
		}	

		let users = await listarUsuarios(fotosPasta)

		for(let k in users) {
			const userPasta = join(fotosPasta, users[k].ra);

			for(let j in users[k].fotos) {
				const descriptors = [];
				let fotoUserPasta = join(userPasta, users[k].fotos[j]);

				const detections = await getFaceDetections(fotoUserPasta, options);

				detections.forEach((d) => {
					if (d.descriptor.length > 0) {
						descriptors.push({
							path: fotoUserPasta,
							descriptor: d.descriptor
						})
					}
				})

				faces.push({
					ra: users[k].ra,
					descriptors
				})
			}
		}

		res.header("Content-Type", "application/json")
		const content = JSON.stringify(faces)
		writeFileSync(join(dataPasta, facesArquivo), content)
		res.send('ok')
    }

    train()
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

async function getFaceDetections (fotoDir, options) {
	const queryImage = await canvas.loadImage(fotoDir)

    let detections = faceapi.detectAllFaces(queryImage, TINY_FACE_OPTIONS)

    if (options && (options.landmarksEnabled || options.descriptorsEnabled)) {
      detections = detections.withFaceLandmarks()
    }

    if (options && options.descriptorsEnabled) {
      detections = detections.withFaceDescriptors()
    }

    detections = await detections

    return detections
}

async function test() {
    let arquivos = await listarUsuarios('./data/fotos'); // coloque o caminho do seu diretorio
    console.log(arquivos);
    return arquivos;
}

async function listarUsuarios(diretorio) {
	let listaDeUsuarios = [];
    let listaDeArquivos = await fs.readdir(diretorio);

    for(let k in listaDeArquivos) {
        let stat = await fs.stat(diretorio + '/' + listaDeArquivos[k]);
        if(stat.isDirectory()) {
            let fotos = await listarFotos(diretorio + '/' + listaDeArquivos[k])

            if (fotos.length > 0) {
            	listaDeUsuarios.push({"ra": listaDeArquivos[k], "fotos": fotos})
            }
        }
    }

    return listaDeUsuarios;
}

async function listarFotos(diretorio) {
	let fotos = [];
	let listaDeFotos = await fs.readdir(diretorio);
    
    for(let k in listaDeFotos) {
        let stat = await fs.stat(diretorio);

   		fotos.push(listaDeFotos[k]);
    }

    return fotos;
}