//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------
if(!emouseatlas) {
   var emouseatlas = {};
}
if(!emouseatlas.emap) {
   emouseatlas.emap = {};
}

//---------------------------------------------------------
// module for tes4Webgl
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.test4Webgl = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var model;
   var view;
   var utils;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------

   var glContext;
   var targetId;
   var testCanvas;
   var glContext;


   //---------------------------------------------------------
   //   methods
   //---------------------------------------------------------
   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      utils = emouseatlas.emap.utilities;
      //console.log("test4Webgl.initialise params", params);
      targetId = params.targetId;

      createElements();

   }; // initialise

   //---------------------------------------------------------
   var createElements = function () {

      var target;

      target = document.getElementById(targetId);

      testCanvas = document.createElement('canvas');
      testCanvas.setAttribute('id', 'testCanvas');
      testCanvas.setStyles({
         'width': '50px',
         'height': '50px',
         'left': '0px',
	 'top': '0px',
	 'visibility': 'hidden'
      });

      target.appendChild(testCanvas);

   }; // createElements

   //---------------------------------------------------------
   var test = function () {

      var ret;

      testCanvas.setStyle('visibility', 'visible');

      if(testCanvas.getContext("webgl")) {
         ret = true;
      } else {
         ret = false;
      }

      testCanvas.setStyle('visibility', 'hidden');

      return ret;

   }; // test

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      test: test
   };

}(); // end of module tes4Webgl
