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
   var dragObjs;


   //---------------------------------------------------------
   //   methods
   //---------------------------------------------------------
   var register = function (obj, from) {

      //console.log("drag.register from %s", from);

      var todrag;
      var todrop;
      var doc;

      if(dragObjs === undefined) {
         dragObjs = {};
      }

      if(from === "tiledImageView" && obj.drag === "threeDAnatomyHelpIFrameContainer") {
         //console.log("drag.register ",obj.drag);
	 if(emouseatlas.emap.threeDAnatomy) {
	    doc = emouseatlas.emap.threeDAnatomy.getDocument();
	    todrag = doc.getElementById(obj.drag);
	 }
      } else {
         todrag = document.getElementById(obj.drag);
      }

      todrop = document.getElementById(obj.drop);

      if(todrag === null || todrag === undefined) {
         //console.log("drag.register returning as todrag  from %s is ",from,todrag);
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
      //console.log("doDragStart ",e.target.id);
      if (!e) {
         var e = window.event;
      }
      var style;
      style = window.getComputedStyle(e.target, null);
      if(style === undefined) {
         //console.log("No computed style");
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

      var draggedObj;
      var id;
      var data;
      var X;
      var Y;

      if (!e) {
         var e = window.event;
      }

      data = e.dataTransfer.getData("text/plain").split(',');
      id = data[0];
      X = e.clientX + parseInt(data[1],10);
      Y = e.clientY + parseInt(data[2],10);
      //console.log("doDrop %s, %d, %d",id,X,Y);
      draggedObj = document.getElementById(id);
      draggedObj.style.left = X + 'px';
      draggedObj.style.top = Y + 'px';

      e.preventDefault();  // required
      //console.log("%s, %s",dm.style.left, dm.style.top);

      if(dragObjs[id]) {
         dragObjs[id].x = X;
         dragObjs[id].y = Y;
      } else {
         dragObjs[id] = {id:id, x:X, y:Y}
      }

      //console.log("dragObjs ",dragObjs);

      return false;
   };

   //---------------------------------------------------------
   var getXY = function (id) {

      var dragObj;
      var XY;

      if(dragObjs[id] === undefined) {
         return undefined;
      } else {
         dragObj = dragObjs[id];
	 XY = {x:dragObj.x, y:dragObj.y};
      }

      //console.log("XY ",XY);

      return XY;
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
      doDrop: doDrop,
      getXY: getXY
   };

}(); // end of module drag
