'use strict';

const mysql = require('mysql');
const { writeFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, rmdirSync} = require('fs');
const fs = require('fs').promises;
const util = require('util')
const { join } = require('path');

const rootPasta = join(__dirname, '../../')
const dataPasta = join(rootPasta, 'data')
const tmpPasta = join(dataPasta, 'tmp')
const acessosPasta = join(dataPasta, 'fotos')

/*select * from tb_usuarios;
select id_usuario from tb_usuarios;
insert into tb_usuarios (id_usuario, funcional, senha, nivel_acesso, cpf) values (0, '', '', 0, 0);
update tb_usuarios SET funcional = '', senha = '', nivel_acesso = 0, cpf = 0 where id_usuario = 0; -- atualizar todos os campos
update tb_usuarios SET funcional = '' where id_usuario = 0; -- atualizar funcional
update tb_usuarios SET senha = '' where id_usuario = 0; -- atualizar senha
update tb_usuarios SET nivel_acesso = 0 where id_usuario = 0; -- atualiza nivel de acesso
update tb_usuarios SET cpf = 0 where id_usuario = 0; -- atualiza cpf
delete from tb_usuarios where id_usuario = 0; */

exports.getUsers = function(req, res) {
	mysql.conexao.query('SELECT * FROM tb_usuarios WHERE nivel_acesso IS NOT NULL', (err, rows) => {
		if (err) throw err

		res.json(rows);
	})
}

exports.addUser = function(req, res) {
	var requisicao = req.body;
	var novoUsuario = {
		funcional: requisicao.funcional,
		ra: requisicao.ra.toUpperCase(),
		nome: requisicao.nome,
		senha: requisicao.senha,
		cpf: requisicao.cpf,
		nivel_acesso: requisicao.nivel_acesso,
		situacao: 1
	}

	mysql.conexao.query('INSERT INTO tb_usuarios SET ?',
		novoUsuario,
		(err, rows) => {
		if (err) throw err

		res.json({status: 200, message:"Usuário inserido com sucesso!"});
	})
}


exports.deleteUser = function(req, res) {
	var id = req.params.userId;
	var requisicao = req.body;

	if (requisicao.situacao == 1) {
		mysql.conexao.query('UPDATE tb_usuarios SET situacao = 0 WHERE id_usuario = ?',
			[id],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Situação alterada com sucesso!"});
		})
	} else {
		mysql.conexao.query('UPDATE tb_usuarios SET situacao = 1 WHERE id_usuario = ?',
			[id],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Situação alterada com sucesso!"});
		})
	}
}

exports.getUser = function(req, res) {
	var id = req.params.userId;

	mysql.conexao.query('SELECT id_usuario, funcional, nome, cpf, nivel_acesso, situacao  FROM tb_usuarios WHERE id_usuario = "'+id+'" AND nivel_acesso IS NOT NULL', (err, rows) => {
		if (err) throw err

		if (rows.length > 0) {
			res.json(rows);
		} else {
			res.json({'status': 404, 'message': 'Usuário não encontrado'});
		}
	})
}

exports.editUser = function(req, res) {
	var id = req.params.userId;
	var requisicao = req.body;
	var errors = 0;
	var message = '';

	if (requisicao.senha != requisicao.senha_confirma) {
		errors++;
		message = "Senha não confere"
	}

	if (errors == 0) {
		var corpoRequisicao = {};
		if (requisicao.senha == '' || requisicao.senha == null) {
			corpoRequisicao = {
				funcional: requisicao.funcional,
				nome: requisicao.nome,
				cpf: requisicao.cpf,
				nivel_acesso: requisicao.nivel_acesso,
				situacao: requisicao.situacao
			}
		} else {
			corpoRequisicao = {
				funcional: requisicao.funcional,
				nome: requisicao.nome,
				senha: requisicao.senha,
				cpf: requisicao.cpf,
				nivel_acesso: requisicao.nivel_acesso,
				situacao: requisicao.situacao
			}
		}

		mysql.conexao.query('UPDATE tb_usuarios SET ? WHERE id_usuario = ?',
			[corpoRequisicao, id],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Usuário editado com sucesso!"});
		})
	} else {
		res.json({status: 400, message: message});
	}
}

exports.listaUsers = function (req, res) {
	mysql.conexao.query('SELECT id_usuario, funcional, nome FROM tb_usuarios WHERE nivel_acesso IS NOT NULL', (err, rows) => {
		if (err) throw err

		res.json(rows);
	})
}

/*
*	INICIO - CRUD
*	Acessos
*/

exports.getAcessos = function(req, res) {
	async function _getAcessos() {
		var listaDeAcessos = await listarAcessos(acessosPasta);
		var response = [];

		for (var i in listaDeAcessos) {
			await new Promise((res1, rej1) => {
				mysql.conexao.query('SELECT id_usuario, ra, nome, cpf FROM tb_usuarios WHERE ra LIKE "' + listaDeAcessos[i].ra + '" AND nivel_acesso IS NULL;', (err, rows) => {
					if (err) throw err

					if (rows.length > 0) {
						response.push(rows[0]);
					}
					res1(rows)
				});
			});
		}

		res.json(response);
	}
	
	_getAcessos()
}

exports.addAcesso = function(req, res) {
	var i = 0
	var errors = 0;
	var requisicao = req.body;
	var novoAcesso = {
		ra: requisicao.ra.toUpperCase(),
		nome: requisicao.nome,
		cpf: requisicao.cpf,
		nivel_acesso: null,
		situacao: 1
	}
	var fotos = req.body.fotos;
	
	let response = null;
	fotos.forEach(ft => {
		response = salvaFoto(ft, novoAcesso.ra, i)
		i++;
	});

	mysql.conexao.query('INSERT INTO tb_usuarios SET ?',
		novoAcesso,
		(err, rows) => {
		if (err) throw err

		res.json({"status": 200, "message":"Acesso inserido com sucesso!"});
	})
}

exports.getAcesso = function(req, res) {
	async function _getAcesso() {
		var id = req.params.userId;
		var response = [];

		await new Promise((res1, rej1) => {
			mysql.conexao.query('SELECT id_usuario, ra, nome, cpf, situacao FROM tb_usuarios WHERE id_usuario = "'+ id +'" AND nivel_acesso IS NULL', (err, rows) => {
				if (err) throw err

				if (rows.length > 0) {
					response[0] = {
						'id_usuario': rows[0].id_usuario,
						'ra': rows[0].ra,
						'nomeCompleto': rows[0].nome,
						'cpf': rows[0].cpf,
						'situacao': rows[0].situacao,
						'fotos' : []
					}
				}
				res1(rows)
			})
		});

		if (response.length > 0) {
			const acessoPasta = join(acessosPasta, response[0].ra)
			let fotos = await listarFotos(acessoPasta)
			
			for (var i in fotos) {
				let foto = join(acessoPasta, fotos[i])

				response[0].fotos.push(base64_encode(foto));
			}

			res.json(response);
		} else {
			res.json({'status': 404, 'message': 'Acesso não encontrado'});
		}
	}

	_getAcesso()
}

exports.editAcesso = function(req, res) {
	async function _editAcesso() {
		var id = req.params.userId;
		var i = 0;
		var requisicao = req.body;
		//TODO: Mandar corpoRequisicao para validação 
		var corpoRequisicao = {
			ra: requisicao.ra.toUpperCase(),
			nome: requisicao.nome,
			cpf: requisicao.cpf,
			situacao: requisicao.situacao
		}

		var fotos = req.body.fotos;
		let response = null;

		const acessoPasta = join(acessosPasta, corpoRequisicao.ra);

		const fotosAtuais = await listarFotos(acessoPasta)

		fotosAtuais.forEach(fa => {
			let dirFoto = join(acessoPasta, fa);

			unlinkSync(dirFoto)
		})

		fotos.forEach(ft => {
			response = salvaFoto(ft, corpoRequisicao.ra, i)
			i++;
		});

		mysql.conexao.query('UPDATE tb_usuarios SET ? WHERE id_usuario = "'+ id +'"',
			[corpoRequisicao],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Usuário editado com sucesso!"});
		})
	}

	_editAcesso()
}

exports.deleteAcesso = function(req, res) {
	var id = req.params.userId;
	var requisicao = req.body;

	if (requisicao.situacao == 1) {
		mysql.conexao.query('UPDATE tb_usuarios SET situacao = 0 WHERE id_usuario = ?',
			[id],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Situação alterada com sucesso!"});
		})
	} else {
		mysql.conexao.query('UPDATE tb_usuarios SET situacao = 1 WHERE id_usuario = ?',
			[id],
			(err, result) => {
			if (err) throw err

			res.json({status: 200, message:"Situação alterada com sucesso!"});
		})
	}
}

exports.listaAcessos = function (req, res) {
	var output = null;
	mysql.conexao.query('SELECT A.tipo_acesso, A.dt_hora, U.ra, U.funcional, U.nome FROM tb_acessos as A INNER JOIN tb_acessos_usuarios as AC ON AC.id_acesso = A.id_acesso INNER JOIN tb_usuarios as U ON U.id_usuario = AC.id_usuario;', (err, rows) => {
		if (err) throw err

		output = rows;

		output.forEach(out => {
			if (out.tipo_acesso == 1) {
				out.tipo_acesso = "Administrador";
			} else {
				out.tipo_acesso = "Catraca";
			}

			out.dt_hora = out.dt_hora.toISOString().replace(/T/, ' ').replace(/\..+/, '')
		})
		
		res.json(output);		
	})
}

/*
*	FUNCTIONS A PARTE
*
*/

function salvaFoto(foto, ra, index) {
	var res = {};
	let filename = ra+"_"+index+".png";

	let errors = 0;
	
	const dir = join(acessosPasta, ra)
	const file_path = join(dir, filename)

	if (!existsSync(dir)) {
		mkdirSync(dir, function (err) {
			errors++;
		})
	}

	writeFileSync(file_path, foto, {encoding: 'base64'} ,  function (err) {
		errors++;
	})

	if (errors == 0) {
		res = { status: 200 }
	} else {
		res = { status: 403 }
	} 

	return res
}

async function listarAcessos(diretorio) {
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

async function getDados(ra) {
	try{
		var retorno = null;
		await mysql.conexao.query('SELECT id_usuario, ra, nome, cpf FROM tb_usuarios WHERE ra LIKE "' + ra + '" AND nivel_acesso IS NULL;', (err, rows) => {
			if (err) throw err	

			return "rows";
		})
	} catch (err) {
		console.log(err)
	}
	
}	

function base64_encode(file) {
    // read binary data
    var bitmap = readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}