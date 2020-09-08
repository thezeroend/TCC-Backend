'use strict';

const mysql = require('mysql');

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
	mysql.conexao.query('SELECT * FROM tb_usuarios', (err, rows) => {
		if (err) throw err

		res.json(rows);
	})
}

exports.addUser = function(req, res) {
	var requisicao = req.body;
	var novoUsuario = {ra: requisicao.ra, nome: requisicao.nome, senha: requisicao.senha, cpf: requisicao.cpf, nivel_acesso: requisicao.nivel_acesso, situacao: 1}

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