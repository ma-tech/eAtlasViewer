//---------------------------------------------------------
//   x3domHelp.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// x3domHelp
//---------------------------------------------------------

var x3domHelp = new Class ({

   initialize: function(params) {

      this.view = params.view;
      this.view.register(this);

      this.type = params.type;
      this.imagePath = params.imageDir;
      this.target = $(params.targetId);

      this.helpIFrame = $(this.type + "IFrame");
      //console.log(this.type + "IFrame");

      this.hideOK = false;

      this.name = "x3domHelp";

   },

   //  Toggles visibility for the IFrame (not its container).
   //---------------------------------------------------------------
   viewUpdate: function (changes) {

      if(changes.showX3domHelp) {
         this.helpIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hideX3domHelp) {
         this.helpIFrame.setStyle('visibility', 'hidden');
      }
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

}); // end of class x3domHelp
//----------------------------------------------------------------------------
