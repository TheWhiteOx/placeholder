////////////////////////////////////////
//Functions for query calls to the DB.//
////////////////////////////////////////

var db = require('../app/config');
var Class = require('../app/models/classes.js');
var Discipline = require('../app/models/disciplines.js');
var Feedback = require('../app/models/feedbacks.js');
var Instructor = require('../app/models/instructor.js');
var Level = require('../app/models/levels.js');
var Progress = require('../app/models/progress.js');
var Rank = require('../app/models/ranks.js');
var Student = require('../app/models/student.js');


var DBQuery = {

//Checklist:
  //Insert queries:
    // Student
    // Instructor
    // Classes
    // Rank 
    // Feedback *
    // Level 
    // Discipline
    // Progress 
  //Get Queries
    //
  

  /*===============================================================*/
                            /*Insert Queries*/
  /*===============================================================*/
   /**
   * Register a new student into the DB.
   * Will check if user already exists as Student or Instructor.
   * @username  {[Object]}  Contains info of user
   * @callback  {[Function]}  Callback function invoked on success if given
   */
  newStudent: function (user, callback) {
    //Make a DB query 
    //Check if username exists as student
    db.knex('students')
    .where('username', user.username)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){
        callback({
          result: false,
          message: 'Sorry, internal server error.'
        });
      }
    })
    .then(function(exist){
      if(!exist || exist.length===0){
        //Check if instructor uses that username
        db.knex('instructors')
        .where('username', user.username)
        .select('*')
        .then(function(exist){
          if(!exist || exist.length===0){
            new Student(user)
            .save()
            .catch(function(err){
              console.log('Error in newStudent: ',err);
              if(callback){
                callback({
                  result: false,
                  message: 'Sorry, internal server error.'
                });
              }
            })
            .then(function(data){
              console.log('Saved new student user to DB.');
              if(callback){
                callback({
                  result: true,
                });
              }
            });
          }else{
            // console.log('Instructor already used that username.');
            if(callback){
                callback({
                  result: false,
                  message: 'Instructor already used that username.'
                });
            }
          }
        });
      }else{
        // console.log('Student already used that username.');
        if(callback){
          callback({
            result: false,
            message: 'Student already used that username.'
          });
        }
      }
    });
  },

  /**
   * Register a new Instructor into the DB.
   * Will check if username already exists as Student or Instructor.
   * @username  {[Object]}  Contains info of user
   * @callback  {[Function]} Callback function
   */
  newInstructor: function (user, key, callback){
    db.knex('instructors')
    .where('username', user.username)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){
        callback({
          result: false,
          message: 'Sorry, internal server error.'
        });
      }
    })
    .then(function(exist){
      if(!exist || exist.length===0){
        //Check if instructor uses that username
        db.knex('students')
        .where('username', user.username)
        .select('*')
        .then(function(exist){
          if(!exist || exist.length===0){
            // db.knex('keys')
            // .where('key', key)
            // .then(function(exist){
            //   if(!exits || exist.length===0){
            //     if(callback){
            //       callback({
            //         result: false,
            //         message: 'Key does not exist. Make sure Key is proper.'
            //       });
            //     }
            //   }else{
            //     if(exist.used){
            //       if(callback){
            //         callback({
            //           result: false,
            //           message: 'That key has been used.'
            //         });
            //       }
            //     }else{
                  new Instructor(user)
                  .save()
                  .catch(function(err){
                    console.log('Error in newInstructor: ',err);
                    if(callback){
                      callback({
                        result: false,
                        message: 'Sorry, internal server error.'
                      });
                    }
                  })
                  .then(function(data){
                    console.log('Saved new Instructor user to DB.');
                    // exist.save( { used: true }, {patch: true} );
                    if(callback){
                      callback({
                        result: true,
                      });
                    }
                  });
            //     }
            //   }
            // });
          }else{
            // console.log('Instructor already used that username.');
            if(callback){
                callback({
                  result: false,
                  message: 'Student already used that username.'
                });
            }
          }
        });
      }else{
        // console.log('Student already used that username.');
        if(callback){
          callback({
            result: false,
            message: 'Instructor already used that username.'
          });
        }
      }
    });
  },

  setRank: function(userID, disciplineID, rankInfo, isInstructor, callback){
    if(!isInstructor){
      db.knex('students')
      .join('ranks', 'students.id', '=', 'ranks.student_id')
      .join('disciplines', 'ranks.discipline_id', '=', 'disciplines.id')
      .where({
        'students.id': userID,
        'disciplines.id': disciplineID
      })
      .then(function(exist){
        if(!exist || exist.length===0){
          new Rank({
            'student_id': userID,
            'discipline_id': disciplineID,
            rankTitle: rankInfo.rankTitle,
            rankNum: rankInfo.rankNum,
            rankIcon: rankInfo.rankIcon,
          }).save()
          .catch(function(err){
            console.log(err);
            if(callback){
              callback({
                result: false,
                message: 'Internal Server Error.'
              });
            }
          })
          .then(function(){
            if(callback){
              callback({
                result: true,
              });
            }
          });
        }else{
          db.knex('ranks')
          .where('id', exist[0].id)
          .update({
            rankTitle: rankInfo.rankTitle,
            rankNum: rankInfo.rankNum,
            rankIcon: rankInfo.rankIcon,
          })
          // exist[0].update({
          //   rankTitle: rankInfo.rankTitle,
          //   rankNum: rankInfo.rankNum,
          //   rankIcon: rankInfo.rankIcon,
          // })
          .catch(function(err){
            console.log(err);
            if(callback){
              callback({
                result: false,
                message: 'Internal Server Error.'
              });
            }
          })
          .then(function(){
            console.log('Rank updated');
            if(callback){
              callback({
                result: true,
              });
            }
          });
        }
      });
    }else{
      db.knex('instructors')
      .join('ranks', 'instructors.id', '=', 'ranks.instructor_id')
      .join('disciplines', 'ranks.discipline_id', '=', 'disciplines.id')
      .where({
        'instructors.id': userID,
        'disciplines.title': disciplineID
      })
      .then(function(exist){
        if(!exist || exist.length===0){
          new Rank({
            'instructor_id': userID,
            'discipline_id': disciplineID,
            rankTitle: rankInfo.rankTitle,
            rankNum: rankInfo.rankNum,
            rankIcon: rankInfo.rankIcon,
          }).save()
          .catch(function(err){
            console.log(err);
            if(callback){
              callback({
                result: false,
                message: 'Internal Server Error.'
              });
            }
          })
          .then(function(){
            if(callback){
              callback({
                result: true,
              });
            }
          });
        }else{
          exist.save(rankInfo, {patch: true})
          .catch(function(err){
            console.log(err);
            if(callback){
              callback({
                result: false,
                message: 'Internal Server Error.'
              });
            }
          })
          .then(function(){
            if(callback){
              callback({
                result: true,
              });
            }
          });
        }
      });
    }
  },

  /**
   * Create a new class. WIll check if class title already exists.
   * @classInfo  {[Object]} Object with new class info
   * @callback {[Function]}  Callback function
   */
  newClass: function(classInfo, discipline, instructor, callback){

    //Check if discipline exists
    var getInst = this.getInstructorUsing;

    this.getDiscipline(discipline, function(disc){
      if(!disc){
        console.log('Something went wrong.');
      }else{
        getInst('username', instructor, function(instr){
          if(instr){
            new Class({
              discipline_id: disc.id,
              classNum: classInfo.classNum,
            }).fetch().then(function(exists){
              if(!exists){
                new Class({
                  title: classInfo.title,
                  discipline_id: disc.id,
                }).fetch()
                .then(function(used){
                  if(!used){
                    new Class({
                      title: classInfo.title,
                      classNum: classInfo.classNum,
                      description: classInfo.description,
                      image: classInfo.image,
                      instructor_id: instr.id,
                      discipline_id: disc.id,
                    })
                    .save()
                    .catch(function(err){
                      console.log('Error in newClass: ', err);
                      if(callback){
                        callback({
                          result: false,
                          message: 'Internal server error.'
                        });
                      }
                    })
                    .then(function(){
                      console.log('Added new class to DB.');
                      if(callback){
                        callback({
                          result: true
                        });
                      }
                    });
                  }else{
                    console.log('Title already used.');
                    callback({
                      result: false,
                      message: 'Title already used.'
                    });
                  }
                });
              }else{
                console.log('Class Number already exist');
                //class of that title already exists
                // console.log('Class of that title already exist.');
                if(callback){
                  callback({
                    result: false,
                    message: 'Class of that number already exists.'
                  });
                }
              }
            });
          }
        });
      }
    });
    //check if class title already exists
  },

  /**
   * When student submits a video. Only one can exist at a time per student.
   * If student have submitted video to a class before, will overwrite that URL.
   * @vidInfo  {[Object]}
   * @callback {[Function]} 
   */
  submitFeedback: function(infoObject, callback){
    //check if a video under the students id already exists
    
  },

  /**
   * Submits instructor's video for a class. Will check and do nothing 
   * if same vid already exists in that class.
   * @vidInfo  {[Object]} Information on the new video.
   * @return {[Boolean]}  If successful
   */
  newLevel: function (infoObject, callback){
    if(infoObject.class_id){
      new Level({
        class_id: infoObject.class_id,
        levelNum: infoObject.levelNum,
      }).fetch()
      .then(function(exist){
        if(!exist){
          new Level({
            title: infoObject.title
          }).fetch()
          .then(function(used){
            if(!used){
              new Level(infoObject)
              .save()
              .catch(function(err){
                console.log(err);
                if(callback){
                  callback({
                    result: false,
                    message: 'Internal Server Error'
                  });
                }
              })
              .then(function(data){
                //Update level count for that class
                new Class({
                  id: infoObject.class_id
                }).fetch()
                .then(function(data){
                  data.save({levelCount: data.get('levelCount')+1}, {patch: true})
                  .then(function(){
                    if(callback){
                      callback({
                        result: true
                      });
                    }
                  });
                });
              });
            }else{
              console.log('Level title already used.');
            }
          });
        }else{
          console.log('Title number already used.');
          if(callback){
            callback({
              result: false,
              message: 'Title number already used.'
            });
          }
        }
      });
    }else{
      console.log('Internal Server Error: No class ID given.');
      if(callback){
        callback({
          result: false,
          message: 'Internal Server Error: No class ID given.'
        });
      }
    }

  },

  newDiscipline: function(discipline, callback){
    new Discipline({
      title: discipline.title
    }).fetch()
    .then(function(exist){
      if(!exist){
        new Discipline(discipline)
        .save()
        .catch(function(err){
          console.log(err);
          if(callback){
            callback({
              result: false,
              message: 'Internal Server Error.'
            });
          }
        })
        .then(function(){
          if(callback){
            callback({
              result:true
            });
          }
        });
      }else{
        if(callback){
          callback({
            result: false,
            message: 'That discipline of that title already exists.'
          });
        }
      }
    });
  },

  setProgress: function(username, classTitle, levelNum, callback){
    var studentID; 
    var classID;

    new Student({
      username: username
    }).fetch()
    .then(function(exist){
      if(exist){
        studentID =  exist.get('id');
        checkClass();
      }else{
        callback({
          result: false,
          message: 'Could not find student of that username.'
        });
      }
    });
    var checkClass = function(){
      new Class({
        title: classTitle
      }).fetch()
      .then(function(exist){
        if(exist){
          classID = exist.get('id');
          saveProgress();
        }else{
          callback({
            result: false,
            message: 'Could not find class of that title.'
          });
          return;
        }
      });
    };

    var saveProgress = function(){
      var newProgress = new Progress({
        student_id: studentID,
        class_id: classID,
        levelNum: levelNum
      });

      newProgress.fetch()
      .then(function(data){
        if(data){
          //update progress
          data.save({levelNum: levelNum}, {patch: true})
          .catch(function(err){
            console.log(err);
            callback({
              result:false,
              message: 'Internal Server Error.'
            });
          })
          .then(function(){
            console.log('Progress updated.');
            callback({
              result: true
            });
          });
        }else{
          newProgress.save()
          .catch(function(err){
            console.log(err);
            callback({
              result:false,
              message: 'Internal Server Error.'
            });
          })
          .then(function(){
            console.log('Progress saved.');
            callback({
              result: true
            });
          });
        }
      });

    };

    // newProgress = new Progress({
    //   student_id: studentID,
    //   class_id: classID,
    //   levelNum: 1,
    // });
    // new Progress({
    //   student_id: studentID,
    //   class_id: classID,
    // }).fetch()
    // .catch(function(err){
    //   console.log(err);
    //   if(callback){
    //     callback({
    //       result: false,
    //       message: 'Internal Server Error.'
    //     });
    //   }
    // })
    // .then(function(exist){
    //   if(!exist || exist.length===0){
    //     newProgress.save()
    //     .catch(function(err){
    //       console.log(err);
    //       if(callback){
    //         callback({
    //           result: false,
    //           message: 'Internal Server Error.'
    //         });
    //       }
    //     })
    //     .then(function(){
    //       if(callback){
    //         callback({
    //           result:true
    //         });
    //       }
    //     });
    //   }else{
    //     exist.save({levelNum: levelNum}, {patch: true});
    //   }
    // });
  },


  //============================================================================//
                                  //Get Queries//
  //============================================================================//
  
  getDiscipline: function(discipline, callback){
    new Discipline({
      title: discipline
    }).fetch()
    .then(function(exist){
      if(exist){
       callback(exist.attributes);
      }else{
        console.log('Discipline does not exist.');
      }
    });
  },

  /**
   * Gets a single student's info from DB
   * @param  {[String]} using [Property to search]
   * @param  {[]} info [Student's info]
   * @param  {[String]} callback [callback function (optional)]
   * @return {[Object]}   [Student information, or false if not found]
   */
  getStudentUsing: function(using, info, callback){
    db.knex('students')
    .where(using, info)
    .select('*')
    .catch(function(err){
      console.log('Error: ',err);
    })
    .then(function(data){
      if(!data || data.length===0){
        console.log('Student does not exist');
        if(callback){ callback(false); }
      }else if(data.length>1){
        console.log('Warning: More then one student found.');
        if(callback){ callback(data); }
      }else{
        if(callback){ callback(data[0]); }
      }
    });
  },

  getUserRankUsing: function(using, info, isInstructor, callback){
    if(!isInstructor){
      db.knex('disciplines')
      .join('disciplines_students', 'disciplines.id', '=', 'disciplines_students.discipline_id')
      .join('students', 'disciplines_students.student_id', '=', 'students.id')
      .where('students.'+using, info)
      .select('disciplines.*', 'students.username', 'students.firstName', 'students.lastName')
      .catch(function(err){
        console.log(err);
      })
      .then(function(data){
        if(callback){
          callback(data);
        }
      });
    }else{
      db.knex('disciplines')
      .join('disciplines_instructors', 'disciplines.id', '=', 'disciplines_instructors.discipline_id')
      .join('instructors', 'disciplines_instructors.instructor_id', '=', 'isntructors.id')
      .where('instructors.'+using, info)
      .select('disciplines.*', 'instructors.username', 'instructors.firstName', 'instructors.lastName')
      .catch(function(err){
        console.log(err);
      })
      .then(function(data){
        if(callback){
          callback(data);
        }
      });
    }
  },

  /**
   * Get's class info.
   * @param  {[String]} using [Property to search]
   * @param  {[]}   info  [Class info]
   * @param  {Function} callback [Callback function]
   * @return {[Object/Boolean]}  [Return false on failure, and data if any is found]
   */
  getClassUsing: function(using, info, callback){
    var result;
    db.knex('classes')
    .where(using, info)
    .select('*')
    .then(function(data){
      if(!data || data.length===0){
        console.log('Class does not exist');
        if(callback){ callback(false); }
        return false;
      }else if(data.length>1){
        console.log('Warning: More then one class found.');
        if(callback){ callback(data); }
        return data[0];
      }else{
        if(callback){ callback(data[0]); }
        return data[0];
      }
    });
  },

  /**
   * Get's Instructor info.
   * @param  {[String]} using [Property to search]
   * @param  {[]}   info  [The unique instructor info]
   * @param  {Function} callback [Callback function]
   * @return {[Object/Boolean]}  [Return false on failure, and data if any is found]
   */
  getInstructorUsing: function(using, info, callback){
    db.knex('instructors')
    .where(using, info)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){ callback(false); }
      return false;
    })
    .then(function(data){
      if(!data || data.length===0){
        console.log('Instructor does not exist');
        if(callback){ callback(false); }
        return false;
      }else if(data.length>1){
        console.log('Warning: More then one Instructor of this username is found.');
        if(callback){ callback(data); }
        return data[0];
      }else{
        if(callback){ callback(data[0]); }
        return data[0];
      }
    });
  },

  /**
   * Gets student video 
   * @param  {[String]} using [Property to search]
   * @param  {[]} info [unqiue info]
   * @param  {Function}  callback  [Callback function]
   * @return {[type]}  [Will return false on any failure, returns object if any data found]
   */
  getStudentVidUsing: function(using, info, callback){
    db.knex('studentVideos')
    .where(using, info)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){ callback(false); }
      return false;
    })
    .then(function(data){
      if(!data || data.length===0){
        console.log('No videos found.');
        if(callback){ callback(false); }
        return false;
      }else{
        if(callback){ callback(data); }
        return data;
      }
    })
    .catch(function(err){
      console.log('Error in getStudentVidUsing: \n',err);
    });
  },

  /**
   * Gets the instruction videos using the instructors ID
   * @param  {[String]} using [Property to search]
   * @param  {[]} info [unqiue info]
   * @param  {Function} callback     [Callback function]
   * @return {[type]}  [Will return false on any failure, returns object if any data found]
   */
  getInstVideoUsing: function(using, info, callback){
    db.knex('instrVideos')
    .where(using, info)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){ callback(false); }
      return false;
    })
    .then(function(data){
      if(!data || data.length===0){
        console.log('No videos found.');
        if(callback){ callback(false); }
        return false;
      }else{
        if(callback){ callback(data); }
        return data;
      }
    })
    .catch(function(err){
      console.log('Error in getInstVideoUsing: \n',err);
    });
  },

  /**
   * Gets all students under an instructor for all classes.
   * @param  {[String]} using [Property to search]
   * @param  {[]} info [unqiue info]
   * @param  {Function} callback     [Callback function]
   * @return {[Array]} An [] of {}, each {} being a student. Or false if invalid info or using.
   */
  getStudentsUnderInstUsing: function(using, info, callback){
    db.knex('instructors')
    .select('*')
    .where(using, info)
    .catch(function(err){
      console.log(err);
      if(callback){ callback(false); }
      return false;
    })
    .then(function(exists){
      if(!exists || exists.length===0){
        return false;
      }else{
        db.knex('instructors')
        .join('classes', 'instructors.id', '=', 'classes.instructor_id')
        .join('classes_students', 'classes.id', '=', 'classes_students.class_id')
        .join('students', 'students.id', '=', 'classes_students.student_id')
        .select('students.*', 'classes.title')
        .where('instructors.'+using, info)
        .then(function(data){
          if(callback){ callback(data); }
          return data;
        });
      }
    });
  },
  
  /**
   * Gets all Instructors for a student across all classes.
   * @param  {[String]} using [Property to search]
   * @param  {[]} info [unqiue info]
   * @param  {Function} callback     [Callback function]
   * @return {[Array]} An [] of {}, each {} being a Instructor. Or false if invalid info or using.
   */
  getInstOfStudentUsing: function(using, info, callback){
    db.knex('students')
    .select('*')
    .where(using, info)
    .catch(function(err){
      console.log(err);
      if(callback){ callback(false); }
      return false;
    })
    .then(function(exists){
      if(!exists || exists.length===0){
        return false;
      }else{
        db.knex('students')
        .join('classes_students', 'students.id', '=', 'classes_students.student_id')
        .join('classes', 'classes.id', '=', 'classes_students.class_id')
        .join('instructors', 'instructors.id', '=', 'classes.instructor_id')
        .select('instructors.*', 'classes.title')
        .where('students.'+using, info)
        .then(function(data){
          if(callback){ callback(data); }
          return data;
        });
      }
    });
  },

  /**
   * Get's info of all classes a student is in.
   * @param  {[String]}   using    [Unique info to search with.]
   * @param  {[String]}   info     [The actual info]
   * @param  {Function} callback [Callback function]
   * @return {[type]} [Will return [] of {}, or false on error.]
   */
  getClassesOfStudent: function(using, info, callback){
    db.knex('classes')
    .join('classes_students', 'classes_students.class_id', '=', 'classes.id')
    .join('students', 'students.id', '=', 'classes_students.student_id')
    .select('classes.*')
    .where('students.'+using, info)
    .catch(function(err){
      console.log('Error in getClassesOfStudent: ', err);
      return false;
    })
    .then(function(data){

    });
  },



  /////////////////////
  //Special functions//
  /////////////////////

  /**
   * Establish a relation between student to class using their ID.
   * Will return false if student already has relation to that class.
   * @studentID  {[String]} Student ID
   * @classID  {[String]}   Class ID
   * @return {[Boolean]}    If successful
   */
  studentToClass: function(studentUser, classTitle, callback){
    
    //check if studentID and classID are valid
    var student = new Student({username: studentUser});
    var classs = new Class({title: classTitle});

    student.fetch()
    .then(function(exists){
      if(!exists || exists.length===0){
        // console.log('studentToClass: Invalid studentUser');
        if(callback){
          callback({
            result: false,
            message: 'Invalid studentUser'
          });
        }
      }else{
        checkClass();
      }
    })
    .catch(function(err){
      console.log('Error in studentToClass: ', err);
      if(callback){
        callback({
          result: false,
          message: 'Internal Server Error'
        });
      }
    });

    var checkClass = function(){
      classs.fetch()
      .then(function(exists){
        if(!exists || exists.length===0){
          console.log('studentToClass: Invalid classTitle');
          if(callback){
            callback({
              result: false,
              message: 'Invalid classTitle'
            });
          }
        }else{
          asignStudent();
        }
      })
      .catch(function(err){
        console.log(err);
        if(callback){
          callback({
            result: false,
            message: 'Internal Server Error'
          });
        }
      });
    };

    var asignStudent = function(){
      //check if such a relation already exist
      db.knex('classes_students')
      .join('students', 'students.id', '=', 'classes_students.student_id')
      .join('classes', 'classes.id', '=', 'classes_students.class_id')
      .where({
        'students.username': studentUser,
        'classes.title': classTitle
      })
      .select('classes_students.id')
      .then(function(exist){
        if(!exist || exist.length===0){
          // console.log('Succesfully added student to class.');
          student.classes().attach(classs);
          if(callback){
            callback({
              result: true
            });
          }
        }else{
          // console.log('That student is already in that class.');
          if(callback){
            callback({
              result: false,
              message: 'That student is already in that class.'
            });
          }
        }
      })
      .catch(function(err){
        console.log('Error in studentToClass: '+err);
        if(callback){
          callback({
            result: false,
            message: 'Internal Server Error'
          });
        }
      });
    };
  },


  /////////////////////
  //Deletion Queries //
  //USE WITH CAUTION!//
  /////////////////////
  
  /**
   * Removes a student from the Students table
   * @param  {[String]}   username [Student's username.]
   * @param  {Function} callback [Optional callback]
   * @return {[Boolean]} [if no callback, will return true on successful del]
   */
  delStudent: function(username, callback){
    db.knex('students')
    .where('username', username)
    .del()
    .catch(function(err){
      console.log('Error in delStudent: ',err);
      if(callback){
        callback(false);
      }
    })
    .then(function(data){
      if(data!==0){
        // console.log(data,' removed from Instructor table.');
        if(callback){
          callback(data);
        }
      }else{
        callback(false);
      }
    });
  },

  /**
   * [delInstructor description]
   * @param  {[String]}   username [Instructor username]
   * @param  {Function} callback [Callback]
   * @return {[Boolean]}  [If no callback, will return boolean based on success]
   */
  delInstructor: function(username, callback){
    db.knex('instructors')
    .where('username', username)
    .del()
    .catch(function(err){
      console.log('Error in delInstructor: ',err);
      if(callback){
        callback(false);
      }
    })
    .then(function(data){
      if(data!==0){
        // console.log(data,' removed from Instructor table.');
        if(callback){
          callback(data);
        }
      }else{
        callback(false);
      }
    });
  },
  
  /**
   * Will delete all rows from a table is specified. 
   * Will clear ALL tables if tableName is not given.
   * @param  {[String]} tableName [Name of table to clear.]
   */
  clearTable: function(tableName){
    if(tableName){
      db.knex(tableName)
      .select('*')
      .del()
      .then(function(){
        console.log('Cleared Table: ', tableName);
      });
    }else{
      db.knex.raw('DELETE FROM "students";');
      db.knex.raw('DELETE FROM "instructors";');
      db.knex.raw('DELETE FROM "classes";');
      db.knex.raw('DELETE FROM "studentVideos";');
      db.knex.raw('DELETE FROM "instrVideos";');
      db.knex.raw('DELETE FROM "classes_students";');
      console.log('Cleared All Tables!');
    }
  },

};


module.exports = DBQuery;






