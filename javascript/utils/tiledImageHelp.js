//---------------------------------------------------------
//   tiledImageHelp.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageHelp
//---------------------------------------------------------

var tiledImageHelp = new Class ({

   initialize: function(params) {

      this.view = params.view;
      this.view.register(this, "tiledImageHelp");

      this.type = params.type;
      this.imagePath = params.imageDir;
      this.target = $(params.targetId);

      this.helpIFrame = $(this.type + "IFrame");

      this.hideOK = false;

      this.name = "tiledImageHelp";

      var closeDiv = $("wlzIIPViewerIFrameCloseDiv");
      var klass = closeDiv.className;

      /*
      console.log("klass %s",klass);
      emouseatlas.emap.utilities.addEvent(closeDiv, 'mouseover', doMouseOver, false);
      emouseatlas.emap.utilities.addEvent(closeDiv, 'mouseout', doMouseOut, false);
      */

   },

   //---------------------------------------------------------------
   viewUpdate: function (changes) {

      if(changes.showViewerHelp) {
         this.helpIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hideViewerHelp) {
         this.helpIFrame.setStyle('visibility', 'hidden');
      }
   },

   //---------------------------------------------------------------
   doMouseOver: function(e) {
      //console.log("over");
   },

   //---------------------------------------------------------------
   doMouseOut: function(e) {
      //console.log("out");
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

}); // end of class tiledImageHelp
//----------------------------------------------------------------------------
