'use strict';

const mysql = require('mysql');
const { writeFileSync } = require('fs');
const fs = require('fs').promises;
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
		ra: requisicao.ra,
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

		res.json('{status: 200, message:"Usuário inserido com sucesso!"}');
	})
}


exports.deleteUser = function(req, res) {
	var id = req.params.userId;

	mysql.conexao.query('UPDATE tb_usuarios SET situacao = 0 WHERE id_usuario = ?',
		[id],
		(err, result) => {
		if (err) throw err

		res.json('{status: 200, message:"Situação alterada com sucesso!"}');
	})
}

exports.editUser = function(req, res) {
	var id = req.params.userId;
	var requisicao = req.body;
	//TODO: Mandar corpoRequisicao para validação 
	var corpoRequisicao = {
		funcional: requisicao.funcional,
		ra: requisicao.ra,
		nome: requisicao.nome,
		senha: requisicao.senha,
		cpf: requisicao.cpf,
		nivel_acesso: requisicao.nivel_acesso,
		situacao: 1
	}

	mysql.conexao.query('UPDATE tb_usuarios SET ? WHERE id_usuario = ?',
		[corpoRequisicao, id],
		(err, result) => {
		if (err) throw err

		res.json('{status: 200, message:"Usuário editado com sucesso!"}');
	})
}

exports.listaUsers = function (req, res) {
	mysql.conexao.query('SELECT funcional, ra, nome FROM tb_usuarios', (err, rows) => {
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
		console.log(listaDeAcessos)
		res.json(listaDeAcessos)
	}
	
	_getAcessos()
}

exports.addAcesso = function(req, res) {
	var requisicao = req.body;
	var novoUsuario = {
		funcional: requisicao.funcional,
		ra: requisicao.ra,
		nome: requisicao.nome,
		cpf: requisicao.cpf,
		nivel_acesso: null,
		situacao: 1
	}

	mysql.conexao.query('INSERT INTO tb_usuarios SET ?',
		novoUsuario,
		(err, rows) => {
		if (err) throw err

		res.json('{status: 200, message:"Acesso inserido com sucesso!"}');
	})
}


exports.deleteAcesso = function(req, res) {
	var id = req.params.userId;

	mysql.conexao.query('UPDATE tb_usuarios SET situacao = 0 WHERE id_usuario = ?',
		[id],
		(err, result) => {
		if (err) throw err

		res.json('{status: 200, message:"Situação alterada com sucesso!"}');
	})
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

exports.salvaFoto = function (req, res) {
	let foto = req.body.foto;

	let tmp_filename = Date.now()+".png";

	let errors = 0;

	const tmpFile = join(tmpPasta, tmp_filename)

	foto = foto.replace(/^data:image\/png;base64,/, "")

	writeFileSync(tmpFile, foto, {encoding: 'base64'}, function (err) {
		errors++;
	})

	if (errors == 0) {
		res.json({
			status: 200,
			nome_temp: tmp_filename
		})
	} else {
		res.json({
			status:403,
			message: "Error"
		})
	}
}


/*
*	FUNCTIONS A PARTE
*
*/

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