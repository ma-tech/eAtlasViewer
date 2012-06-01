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
      this.view.register(this);

      this.type = params.type;
      this.imagePath = params.imageDir;
      this.target = $(params.targetId);

      this.helpIFrame = $(this.type + "IFrame");

      this.hideOK = false;

   },

   //---------------------------------------------------------------
   viewUpdate: function (changes) {

      if(changes.showViewerHelp) {
         this.helpIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hideViewerHelp) {
         this.helpIFrame.setStyle('visibility', 'hidden');
      }
   }

}); // end of class tiledImageHelp
//----------------------------------------------------------------------------
