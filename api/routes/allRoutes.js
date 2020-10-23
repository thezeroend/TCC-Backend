'use strict';

module.exports = function(app) {
	var faceController = require('../controllers/faceController');
	var userController = require('../controllers/userController');
	var authController = require('../controllers/authController');

	//Auth Route
	app.route('/auth')
		.post(authController.login);
	//Face Routes
	app.route('/face/getAll')
	    .get(faceController.getAll);
	app.route('/face/save')
		.post(faceController.save);

	app.route('/face/train')
		.post(faceController.train);

	app.route('/face/recognize')
		.post(faceController.recognize);

	//User Routes
	var userPrefix = '/user/';

	//CRUD Users
	app.route(userPrefix + 'getUsers')
		.get(userController.getUsers);

	app.route(userPrefix + 'addUser')
		.post(userController.addUser);

	app.route(userPrefix + 'deleteUser/:userId')
		.put(userController.deleteUser);

	app.route(userPrefix + 'editUser/:userId')
		.get(userController.getUser)
		.put(userController.editUser);

	app.route(userPrefix + 'listaUsers')
		.get(userController.listaUsers);

	//CRUD Acessos
	app.route(userPrefix + 'getAcessos')
		.get(userController.getAcessos);

	app.route(userPrefix + 'addAcesso')
		.post(userController.addAcesso);

	app.route(userPrefix + 'editAcesso/:userId')
		.get(userController.getAcesso)
		.put(userController.editAcesso);

	app.route(userPrefix + 'deleteAcesso/:userId')
		.put(userController.deleteAcesso);

	app.route(userPrefix + 'listaAcessos')
		.get(userController.listaAcessos);
};
