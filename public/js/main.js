requirejs.config({
  baseUrl: "js",
  paths: {
    backbone: "vendor/backbone",
    "backbone.picky": "vendor/backbone.picky",
    "backbone.syphon": "vendor/backbone.syphon",
    jquery: "vendor/jquery",
    "jquery-ui": "vendor/jquery-ui",
    json2: "vendor/json2",
    localstorage: "vendor/backbone.localstorage",
    marionette: "vendor/backbone.marionette",
    spin: "vendor/spin",
    "spin.jquery": "vendor/spin.jquery",
    text: "vendor/text",
    tpl: "vendor/underscore-tpl",
    underscore: "vendor/underscore",
    chroma: "vendor/chroma"
  },

  shim: {
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ["jquery", "underscore", "json2"],
      exports: "Backbone"
    },
    "backbone.picky": ["backbone"],
    "backbone.syphon": ["backbone"],
    marionette: {
      deps: ["backbone"],
      exports: "Marionette"
    },
    "jquery-ui": ["jquery"],
    localstorage: ["backbone"],
    "spin.jquery": ["spin", "jquery"],
    tpl: ["text"]
  }
});

// Initialize App

UTConfig = {};

require(
  [
    "app",
    "apps/Auth/auth_app",
    "apps/Dashboard/dashboard_app",
    "apps/Sidenav/sidenav_app",
    "apps/TrainingCenter/trainingCenter_app",
    "apps/Class/class_app",
    "apps/Level/level_app",
    "apps/Feedback/feedback_app",
  ],
  function(VirtualDojo){
    VirtualDojo.start();
  }
);
