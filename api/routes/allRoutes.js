'use strict';

module.exports = function(app) {
	var faceController = require('../controllers/faceController');
	var userController = require('../controllers/userController');

	//Face Routes
	app.route('/face/get-all')
	    .get(faceController.get_all);
	    //.post(faceController.get_all)
	    //.put(faceController.get_all)
	    //.delete(faceController.get_all);

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
