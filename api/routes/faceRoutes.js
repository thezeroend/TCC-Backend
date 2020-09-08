'use strict';
module.exports = function(app) {
  var faceController = require('../controllers/faceController');

  // Face Routes
  app.route('/get-all')
    .get(faceController.get_all);
    //.post(faceController.get_all)
    //.put(faceController.get_all)
    //.delete(faceController.get_all);
};
