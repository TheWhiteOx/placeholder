var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var Students = db.Model.extend({
  tableName: 'students',
  hasTimestamps: true,
  initialize: function(){
    this.on('creating', this.hashPassword);
  },
  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },
  hashPassword: function(){
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null)
      .bind(this)
      .then(function(hash) {
        this.set('password', hash);
      });
  },
  studentVideos: function() {
    return this.hasMany('StudentVideos', 'student_id');
  },
  classes: function() {
    return this.belongsToMany('Classes');
  },
  // Jimmy, you gotta debug this:
  instructor: function(){
    return this.belongsToMany('Instructors').through('Classes');
  }

});


module.exports = db.model('Students', Students);