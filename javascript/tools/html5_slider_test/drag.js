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
// module for drag
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.drag = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var utils = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var dragtest;
   var dragText;
   var targetDiv;


   //---------------------------------------------------------
   //   methods
   //---------------------------------------------------------
   var register = function (obj) {

      var todrag;
      var todrop;

      //console.log("trying %s",obj.drag);

      todrag = document.getElementById(obj.drag);
      todrop = document.getElementById(obj.drop);

      if(todrag === null || todrag === undefined) {
         return false;
      }

      todrag.setAttribute("draggable", "true");
      emouseatlas.emap.utilities.addEvent(todrag, 'dragstart', emouseatlas.emap.drag.doDragStart, false);
      emouseatlas.emap.utilities.addEvent(todrop, 'dragover', emouseatlas.emap.drag.doDragOver, false);
      emouseatlas.emap.utilities.addEvent(todrop, 'drop', emouseatlas.emap.drag.doDrop, false);

      //console.log("success for %s",obj.drag);

   }; // register

   //---------------------------------------------------------
   var remove = function (obj) {

      var todrag;
      var todrop;

      todrag = document.getElementById(obj.drag);
      todrop = document.getElementById(obj.drop);

      todrag.setAttribute("draggable", "false");
      emouseatlas.emap.utilities.removeEvent(todrag, 'dragstart', emouseatlas.emap.drag.doDragStart, false);
   }; // remove

   //---------------------------------------------------------
   var doDragStart = function (e) {
      if (!e) {
         var e = window.event;
      }
      var style;
      style = window.getComputedStyle(e.target, null);
      if(style === undefined) {
         console.log("No computed style");
	 e.dataTransfer.setData("text/plain", e.target.id + ',' + (- e.clientX) + ',' + (- e.clientY));
      } else {
	 e.dataTransfer.setData("text/plain", e.target.id + ',' + (parseInt(style.getPropertyValue("left"),10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - e.clientY));
      }
   }; 

   //---------------------------------------------------------
   var doDragOver = function (e) {
      if (!e) {
         var e = window.event;
      }
      // this is required  and must be visible
      // to allow the drop to occur
      e.preventDefault();
      return false;
   };

   //---------------------------------------------------------
   var doDrop = function (e) {
      if (!e) {
         var e = window.event;
      }
      var data = e.dataTransfer.getData("text/plain").split(',');
      var dm = document.getElementById(data[0]);
      dm.style.left = (e.clientX + parseInt(data[1],10)) + 'px';
      dm.style.top = (e.clientY + parseInt(data[2],10)) + 'px';
      e.preventDefault();  // required
      //console.log("%s, %s",dm.style.left, dm.style.top);
      return false;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      register: register,
      remove: remove,
      doDragStart: doDragStart,
      doDragOver: doDragOver,
      doDrop: doDrop
   };

}(); // end of module drag
