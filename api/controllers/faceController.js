'use strict';

const mysql = require('mysql');

exports.get_all = function(req, res) {
	
mysql.conexao.query('SELECT * FROM tb_usuarios', (err, rows) => {
		if (err) throw err

		//var return_teste = {'teste': '123'};
		res.json(rows);
	})
}