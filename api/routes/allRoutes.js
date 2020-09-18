'use strict';

module.exports = function(app) {
	var faceController = require('../controllers/faceController');
	var userController = require('../controllers/userController');

	//Face Routes
	app.route('/face/getAll')
	    .get(faceController.getAll);
	    //.post(faceController.get_all)
	    //.put(faceController.get_all)
	    //.delete(faceController.get_all);
	app.route('/face/save')
		.post(faceController.save)

	app.route('/face/teste')
		.get(faceController.teste)

	//User Routes
	var userPrefix = '/user/';
	app.route(userPrefix + 'getUsers')
		.get(userController.getUsers);

	app.route(userPrefix + 'addUser')
		.post(userController.addUser);

	app.route(userPrefix + 'deleteUser/:userId')
		.put(userController.deleteUser);

	app.route(userPrefix + 'editUser/:userId')
		.put(userController.editUser);
};
