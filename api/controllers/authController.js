'use strict';

const mysql = require('mysql');

exports.login = function(req, res) {
	var requisicao = req.body;

	if (requisicao.usuario == '' || requisicao.senha == '') {
		res.json({status: 400, message: "Usuário ou senha em branco"})
	} else {
		mysql.conexao.query('SELECT * FROM tb_usuarios WHERE funcional = "'+ requisicao.usuario +'" AND senha = "'+ requisicao.senha +'"', (err, rows) => {
			if (err) throw err

			if (rows.length > 0) {
				res.json({status: 200, message: "Usuário autenticado"});
			} else {
				res.json({status: 400, message: "Usuário ou senha inválido!"})
			}
		})
	}
}