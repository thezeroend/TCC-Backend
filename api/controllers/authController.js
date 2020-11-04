'use strict';

const mysql = require('mysql');

exports.login = function(req, res) {
	var requisicao = req.body;

	if (requisicao.usuario == '' || requisicao.senha == '') {
		res.json({status: 400, message: "Usuário ou senha em branco"})
	} else {
		mysql.conexao.query('SELECT situacao, nivel_acesso FROM tb_usuarios WHERE funcional = "'+ requisicao.usuario +'" AND senha = "'+ requisicao.senha +'"', (err, rows) => {
			if (err) {
				res.json({status: 400, message:"Falha ao encontrar usuários!"});
			} else {
				if (rows.length > 0) {
					if (rows[0].situacao == 1) {
						res.json({status: 200, dados: rows[0]});
					} else {
						res.json({status: 400, message: "Usuário bloqueado"});
					}
				} else {
					res.json({status: 400, message: "Usuário ou senha inválido!"})
				}
			}
		})
	}
}