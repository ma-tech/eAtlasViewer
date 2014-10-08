/*
 * Copyright (C) 2010 Medical research Council, UK.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be
 * useful but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301, USA.
 *
 */
//---------------------------------------------------------
//   distance.js
//   Tool to adjust distance from fixed point in a tiled image
//   from an iip3D server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

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
// dist
//---------------------------------------------------------
emouseatlas.emap.distance = function() {

   var model;
   var view;
   var util;
   var trgt;
   var distSlider;
   var distNumber;
   var distDragContainerId;
   var sliderStep;
   var maxVal;
   var minVal;
   var x_left;
   var y_top;
   var MOUSE_DOWN;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      //console.log("createElements");

      var targetId;
      var target;
      var sliderLength;
      var isHorizontal;
      var distDragContainer;
      var distContainer;
      var fs1;
      var legend1;
      //------------------------

      targetId = model.getProjectDivId();
      target = $(targetId);

      distDragContainer = $(distDragContainerId);

      if(distDragContainer) {
         distDragContainer.parentNode.removeChild(distDragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      distDragContainer = new Element('div', {
         'id': distDragContainerId
      });

      distDragContainer.setStyles({
         "top": y_top + "px",
         "left": x_left + "px"
      });

      //----------------------------------------
      // the slider container
      //----------------------------------------
      distSliderContainer = new Element('div', {
         'id': 'distSliderContainer',
         'class': 'distSliderContainer'
      });

      distDragContainer.inject(target, 'inside');
      distSliderContainer.inject(distDragContainer, 'inside');

      //-------------------------------------------------------------------------------
      fs1 = new Element('fieldset', {
         'id': 'distFieldset',
         'name': 'distFieldset',
         'class': 'dist'
      });
      
      legend1 = new Element('legend', {
         'id': 'distFieldsetLegend',
         'class': 'dist',
         'name': 'distFieldsetLegend'
      });
      legend1.set('text', 'distance');
      
      distSlider = new Element('input', {
         'id': 'distSlider',
         'name': 'distSlider',
         'class': 'dist',
         'type': 'range'
      });

      distNumber = new Element('input', {
         'id': 'distNumber',
         'class': 'dist',
         'type': 'number'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs1.inject(distSliderContainer, 'inside');
      legend1.inject(fs1, 'inside');
      distNumber.inject(fs1, 'inside');
      distSlider.inject(fs1, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      distSlider.addEvent('input',function(e) {
         doDistSliderChanged(e);
      });
      distSlider.addEvent('mousedown',function(e) {
         doDistSliderMouseUpDown(e);
      });
      distSlider.addEvent('mouseup',function(e) {
         doDistSliderMouseUpDown(e);
      });
      
      distNumber.addEvent('change',function(e) {
         doDistNumberChanged(e);
      });

   }; // createElements

   //---------------------------------------------------------
   var doDistSliderChanged = function (e) {

      var target;
      var val;
      var dist;
      var invDist;
      var distCur;

     // console.log("doDistSliderChanged: event ",e);

      if(EXT_CHANGE) {
        // console.log("returning - EXT_CHANGE %s",EXT_CHANGE);
         return false;
      }

      target = emouseatlas.emap.utilities.getTarget(e);
     // console.log("target ",target);
      val = target.valueAsNumber;
      distCur = distNumber.get('value');

      //console.log("target.value ",target.value);
      //console.log("target.valueAsNumber %d, distNumber.get('value') %d",val,distCur);
      
      if(val != distCur) {
         setSliderText(val, "doDistSliderChanged val != distCur");
	 model.modifyDistance(val);
      }

      return false;
   };

   //---------------------------------------------------------
   var doDistSliderMouseMoved = function (e) {

     // console.log("doDistSliderMouseMoved");
      var target;

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);

      if(!MOUSE_DOWN) {
         target.blur();
      }

      return false;

   };

   //---------------------------------------------------------
   var doDistNumberChanged = function (e) {

     // console.log("doDistNumberChanged");
      var target;
      var val;

      if(EXT_CHANGE) {
         return false;
      }

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);
      val = target.value;
      NUMBER_CHANGE = true;
      model.setDistance(val);

      return false;
   };

   //---------------------------------------------------------
   var updateDistance = function () {

      var val;

     // console.log("updateDistance");
      val = distNumber.get('value');
      model.setDistance(val);

      return false;
   };

   //---------------------------------------------------------
   var doDistSliderMouseUpDown = function (e) {

     // console.log("doDistSliderMouseUpDown");
      var target;

      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }


      if(e.type.toLowerCase() === "mousedown") {
         MOUSE_DOWN = true;
      } else if(e.type.toLowerCase() === "mouseup") {
         MOUSE_DOWN = false;
	 updateDistance();
      }

      return false;
   };

   //---------------------------------------------------------
   var doDistSliderFocus = function (e) {
      //console.log("Focus");
   };

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setDistVisible(false);
   };

   //---------------------------------------------------------------
   var setDistVisible = function(show) {
      var dst = $(distDragContainerId);
      var viz = show ? "visible" : "hidden";
      dst.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var initSlider = function() {

      var dst;

      dst = model.getDistance();

      minVal = dst.min;
      maxVal = dst.max;

      //console.log("initSlider: min %d, max %d, cur %d",minVal,maxVal,dst.cur);

      distSlider.set("min", minVal);
      distSlider.set("max", maxVal);
      distSlider.set("step", sliderStep);

      distNumber.set("min", minVal);
      distNumber.set("max", maxVal);

      distSlider.value = dst.cur;
      model.setDistance(dst.cur);

   }; // initSlider

   //---------------------------------------------------------------
   var setSliderText = function(dist, from) {

      //console.log("setSliderText %d from %s",dist,from);
      distNumber.set('value', dist);

   }; // setSliderText

   //---------------------------------------------------------------
   var getStepsGivenDist = function(dist) {

      var dst;

      dst = model.getDistance();
      minVal = dst.min;
      maxVal = dst.max;

      return (maxVal - minVal);

   }; // getStepsGivenDist

   //---------------------------------------------------------------
   var getDistFromSliderText = function() {

      var distCur;

      distCur = distNumber.get('value');
      //console.log("distCur ",distCur);

      return Number(distCur);

   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      util = emouseatlas.emap.utilities;

      model.register(this);
      view.register(this);

      _debug = false;

      dropTargetId = model.getProjectDivId();

      x_left = params.x; 
      y_top = params.y; 

      distDragContainerId = "distDragContainer";

      sliderStep = 1;
 
      createElements();
      initSlider();

      MOUSE_DOWN = false;

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;

      //emouseatlas.emap.drag.register({drag:distDragContainerId, drop:dropTargetId});

      // to help discover the arrow key codes
      //util.addEvent(document, "keydown", function(e) {discoverKeyCode(e);}, false);

      addHandlersForArrowKeys();

   }; // initialise

   //---------------------------------------------------------------
   var discoverKeyCode = function(e) {

      var code;
      code = emouseatlas.emap.utilities.getKeyCode(e);

      //console.log("key code %s",code);

   }; // discoverKeyCode

   //---------------------------------------------------------------
   var addHandlersForArrowKeys = function() {

      lmnt = $(distDragContainerId);
      lmnt.addEvent('keyup', doKeyUp, true);

   }; // addHandlersForArrowKeys

   //---------------------------------------------------------------
   var doKeyUp = function(e) {

      var code;
      var target;

      //console.log(e);

      code = emouseatlas.emap.utilities.getKeyCode(e);

      if(code >= 33 && code <= 40) {
         //console.log("key %s released",code);
	 updateDistance();
      }

   }; // doKeyUp

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      var dist;
      var invDist;
      var distCur;

      if(modelChanges.initial === true) {
      }

      //...................................
      if(modelChanges.sectionChanged === true) {

         dist = model.getDistance();
	 //console.log("dist ",dist);
         distCur = getDistFromSliderText();

	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }

	// console.log("modelUpdate sectionChanged: distFromSliderText %s, newdist %s",distCur, dist.cur);

	 if(dist.cur != distCur) {
	   // console.log("dst: setting slider value to newdist %s",dist.cur);
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
	 }
	 setSliderText(dist.cur, "modelChanges.dst");
      }

      /*
      //...................................
      if(modelChanges.dst === true) {

         dist = model.getDistance();
	 //console.log("dist ",dist);
         distCur = getDistFromSliderText();

	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }

	// console.log("modelUpdate dst: distFromSliderText %s, newdist %s",distCur, dist.cur);

	 if(dist.cur != distCur) {
	   // console.log("dst: setting slider value to newdist %s",dist.cur);
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
	 }
	 setSliderText(dist.cur, "modelChanges.dst");
      }
      */

      //...................................
      if(modelChanges.distanceRange === true) {

	 initSlider();

         dist = model.getDistance();
         distCur = getDistFromSliderText();

	// console.log("modelUpdate range: distFromSliderText %s, newdist %s",distCur, dist.cur);

	 if(dist.cur != distCur) {
	   // console.log("range: setting slider value to newdist %s",dist.cur);
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
	 }
	 setSliderText(dist.cur, "modelChanges.distanceRange");

      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      var initState;
      var dst;
      var invDist;
      var distCur;

      if(viewChanges.initial === true) {
         setDistVisible(true);
         initState = model.getInitialState();
	 dst = initState.distance;
         distCur = getDistFromSliderText();
	 //console.log("view: distCur %s, dst %s",distCur, dst);
	 if(dst != distCur) {
	    EXT_CHANGE = true;
	       distSlider.value = dst;
	    EXT_CHANGE = false;
	 }
	 setSliderText(dst, "viewChanges.initial");
      }

      //...................................
      if(viewChanges.showDist === true) {
         setDistVisible(true);
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "dist";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      getName: getName
   };

}();
