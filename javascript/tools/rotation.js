/*
 * Copyright (C) 2010 Medical research Council, UK.
 *
 * This program is free software; you can rerotribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is rotributed in the hope that it will be
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
//   rotation.js
//   Tool to adjust rotation from fixed point in a tiled image
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
// rot
//---------------------------------------------------------
emouseatlas.emap.rotation = function() {

   var model;
   var view;
   var util;
   var trgt;
   var pitchSlider;
   var pitchNumber;
   var yawSlider;
   var yawNumber;
   var rollSlider;
   var rollNumber;
   var rotTitleTextDiv;
   var rotDragContainerId;
   var sliderStep;
   var maxVal;
   var minVal;
   var x_left;
   var y_top;
   //var MOUSE_DOWN;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var IS_VISIBLE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var targetId;
      var target;
      var sliderLength;
      var isHorizontal;
      var rotDragContainer;
      var rotContainer;
      var rotToolsContainer;
      var rotTitleTextContainer;
      var fs1;
      var fs2;
      var fs3;
      var fs4;
      var legend1;
      var legend2;
      var legend3;
      var labels;
      //------------------------

      targetId = model.getProjectDivId();
      target = $(targetId);

      rotDragContainer = $(rotDragContainerId);

      if(rotDragContainer) {
         rotDragContainer.parentNode.removeChild(rotDragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      rotDragContainer = new Element('div', {
         'id': rotDragContainerId
      });

      rotDragContainer.setStyles({
         "top": y_top + "px",
         "left": x_left + "px"
      });

      //----------------------------------------
      // the tool container
      //----------------------------------------
      rotToolContainer = new Element('div', {
         'id': 'rotToolContainer',
         'class': 'rotToolContainer'
      });

      rotTitleTextContainer = new Element('div', {
         'class': 'rotTitleTextContainer'
      });

      rotTitleTextDiv = new Element('div', {
         'class': 'rotTitleTextDiv'
      });
      rotTitleTextDiv.set('text', 'section orientation');


      rotDragContainer.inject(target, 'inside');
      rotToolContainer.inject(rotDragContainer, 'inside');
      rotTitleTextContainer.inject(rotDragContainer, 'inside');
      rotTitleTextDiv.inject(rotTitleTextContainer, 'inside');

      //-----------------------------------------------------------------------
      // pitch
      //----------------------------------------
      fs1 = new Element('fieldset', {
         'id': 'pitchFieldset',
         'name': 'pitchFieldset',
         'class': 'rot pitch'
      });
      
      legend1 = new Element('legend', {
         'id': 'pitchFieldsetLegend',
         'class': 'rot pitch',
         'name': 'pitchFieldsetLegend'
      });
      legend1.set('text', 'pitch');
      
      pitchSlider = new Element('input', {
         'id': 'pitchSlider',
         'name': 'pitchSlider',
         'class': 'rot pitch',
         'type': 'range',
	 'min': '0',
	 'max': '180'
      });
      pitchSlider.setCustomValidity("");
      pitchSlider.setAttribute("formnovalidate", "");

      pitchNumber = new Element('input', {
         'id': 'pitchNumber',
         'class': 'rot pitch',
         'type': 'number'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs1.inject(rotToolContainer, 'inside');
      legend1.inject(fs1, 'inside');
      pitchNumber.inject(fs1, 'inside');
      pitchSlider.inject(fs1, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      //emouseatlas.emap.utilities.inputStopped(doInputStopped, 500
      pitchSlider.addEvent('input',function(e) {
         doRotSliderChanged(e);
      });
      pitchSlider.addEvent('mousedown',function(e) {
         doMouseUpDown(e);
      });
      pitchSlider.addEvent('mouseup',function(e) {
         doMouseUpDown(e);
      });
      
      pitchNumber.addEvent('change',function(e) {
         doRotNumberChanged(e);
      });
      
      pitchNumber.addEvent('input',function(e) {
         doRotNumberChanged(e);
      });

      //-----------------------------------------------------------------------
      // yaw
      //----------------------------------------
      fs2 = new Element('fieldset', {
         'id': 'yawFieldset',
         'name': 'yawFieldset',
         'class': 'rot yaw'
      });
      
      legend2 = new Element('legend', {
         'id': 'yawFieldsetLegend',
         'class': 'rot yaw',
         'name': 'yawFieldsetLegend'
      });
      legend2.set('text', 'yaw');
      
      yawSlider = new Element('input', {
         'id': 'yawSlider',
         'name': 'yawSlider',
         'class': 'rot yaw',
         'type': 'range',
	 'min': '0',
	 'max': '360'
      });
      yawSlider.setCustomValidity("");
      yawSlider.setAttribute("formnovalidate", "");

      yawNumber = new Element('input', {
         'id': 'yawNumber',
         'class': 'rot yaw',
         'type': 'number'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs2.inject(rotToolContainer, 'inside');
      legend2.inject(fs2, 'inside');
      yawNumber.inject(fs2, 'inside');
      yawSlider.inject(fs2, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      yawSlider.addEvent('input',function(e) {
         doRotSliderChanged(e);
      });
      yawSlider.addEvent('mousedown',function(e) {
         doMouseUpDown(e);
      });
      yawSlider.addEvent('mouseup',function(e) {
         doMouseUpDown(e);
      });
      
      yawNumber.addEvent('change',function(e) {
         doRotNumberChanged(e);
      });
      
      yawNumber.addEvent('input',function(e) {
         doRotNumberChanged(e);
      });

      //-----------------------------------------------------------------------
      // roll
      //----------------------------------------
      fs3 = new Element('fieldset', {
         'id': 'rollFieldset',
         'name': 'rollFieldset',
         'class': 'rot roll'
      });
      
      legend3 = new Element('legend', {
         'id': 'rollFieldsetLegend',
         'class': 'rot roll',
         'name': 'rollFieldsetLegend'
      });
      legend3.set('text', 'roll');
      
      rollSlider = new Element('input', {
         'id': 'rollSlider',
         'name': 'rollSlider',
         'class': 'rot roll',
         'type': 'range',
	 'min': '0',
	 'max': '360'
      });
      rollSlider.setCustomValidity("");
      rollSlider.setAttribute("formnovalidate", "");

      rollNumber = new Element('input', {
         'id': 'rollNumber',
         'class': 'rot roll',
         'type': 'number'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs3.inject(rotToolContainer, 'inside');
      legend3.inject(fs3, 'inside');
      rollNumber.inject(fs3, 'inside');
      rollSlider.inject(fs3, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      rollSlider.addEvent('input',function(e) {
         doRotSliderChanged(e);
      });
      rollSlider.addEvent('mousedown',function(e) {
         doMouseUpDown(e);
      });
      rollSlider.addEvent('mouseup',function(e) {
         doMouseUpDown(e);
      });
      
      rollNumber.addEvent('change',function(e) {
         doRotNumberChanged(e);
      });
      
      rollNumber.addEvent('input',function(e) {
         doRotNumberChanged(e);
      });

      //-----------------------------------------------------------------------
      // the orthogonal buttons
      //----------------------------------------
      fs4 = new Element('fieldset', {
         'id': 'buttonFieldset',
         'name': 'buttonFieldset',
         'class': 'rot button'
      });
      
      labels = model.getViewLabels();

      transverseDiv = new Element( 'div', {
	 'id': 'transverseDiv',
	 'class': 'orthogonalDiv transverse'
      });
      transverseDivText = new Element('div', {
         'id': 'transverseText',
	 'class': 'orthogonalText'
      });
      transverseDivText.appendText(labels.transverse);
      
      sagittalDiv = new Element( 'div', {
	 'id': 'sagittalDiv',
	 'class': 'orthogonalDiv sagittal'
      });
      sagittalDivText = new Element('div', {
         'id': 'sagittalText',
	 'class': 'orthogonalText'
      });
      sagittalDivText.appendText(labels.sagittal);

      coronalDiv = new Element( 'div', {
	 'id': 'coronalDiv',
	 'class': 'orthogonalDiv coronal'
      });
      coronalDivText = new Element('div', {
         'id': 'coronalText',
	 'class': 'orthogonalText'
      });
      coronalDivText.appendText(labels.coronal);

      //----------------------------------------
      // the fixed point button
      //----------------------------------------
      fixedPointDiv = new Element( 'div', {
	 'id': 'fixedPointDiv',
	 'class': 'fixedPointDiv'
      });
      fixedPointText = new Element('div', {
         'id': 'fixedPointText',
	 'class': 'fixedPointText'
      });
      fixedPointText.appendText('Fx Pt');

      //--------------------------------
      // add the elements
      //--------------------------------
      fs4.inject(rotToolContainer, 'inside');
      transverseDivText.inject(transverseDiv, 'inside');
      transverseDiv.inject(fs4, 'inside');
      sagittalDivText.inject(sagittalDiv, 'inside');
      sagittalDiv.inject(fs4, 'inside');
      coronalDivText.inject(coronalDiv, 'inside');
      coronalDiv.inject(fs4, 'inside');
      
      fixedPointText.inject(fixedPointDiv, 'inside');
      fixedPointDiv.inject(fs4, 'inside');

      //----------------------------------------
      // add the events
      //----------------------------------------
      transverseDiv.addEvent('mousedown',function() {
         setTransverse();
      });
      transverseDiv.addEvent('mouseup',function() {
         updateRotation();
      });
      coronalDiv.addEvent('mousedown',function() {
         setCoronal();
      });
      coronalDiv.addEvent('mouseup',function() {
         updateRotation();
      });
      sagittalDiv.addEvent('mousedown',function() {
         setSagittal();
      });
      sagittalDiv.addEvent('mouseup',function() {
         updateRotation();
      });

      fixedPointDiv.addEvent('click',function() {
	 doFixedPointDivClicked();
      });

      emouseatlas.emap.utilities.addButtonStyle("transverseDiv");
      emouseatlas.emap.utilities.addButtonStyle("sagittalDiv");
      emouseatlas.emap.utilities.addButtonStyle("coronalDiv");
      emouseatlas.emap.utilities.addButtonStyle("fixedPointDiv");

   }; // createElements

   //---------------------------------------------------------
   var doRotSliderChanged = function (e) {

      var rotTimer = null;
      var target;
      var id;
      var val;
      var rotVal;
      var indx;
      var prefix;
      var numb;
      var rot;
      var invDist;
      var rotCur;

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

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 //console.log("doLayerPropsSliderChanged no target.id");
	 return;
      }

      val = target.value;
      rotVal = Number(val);
      //console.log("doRotSliderChanged target.id %s val %s rotVal %d", id,val,rotVal);

      indx = id.indexOf("Slider");
      prefix = id.substring(0,indx);
      numb = $(prefix + "Number");
      numb.set('value', val);

      switch(prefix) {
         case "pitch":
	    model.modifyOrientation(rotVal, undefined, undefined);
	    break;
         case "yaw":
	    model.modifyOrientation(undefined, rotVal, undefined);
         case "roll":
	    model.modifyOrientation(undefined, undefined, rotVal);
	    break;
      }

      return false;
   };

   //---------------------------------------------------------
   var doRotNumberChanged = function (e) {

      var target;
      var type;
      var val;
      var slidr;

      if(EXT_CHANGE) {
         //console.log("doRotNumberChanged EXT_CHANGE, returning");
         return false;
      }

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);

      type = e.type;
      //console.log("doRotNumberChanged %",type);

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 //console.log("doRotNumberChanged no target.id");
	 return;
      }

      val = target.value;

      indx = id.indexOf("Number");
      prefix = id.substring(0,indx);
      //console.log("doRotNumberChanged prefix %s",prefix);

      slidr = $(prefix + "Slider");
      slidr.set('value', val);

      switch(prefix) {
         case "pitch":
	    if(type === "input") {
	       model.modifyOrientation(val, undefined, undefined);
	    } else if(type === "change") {
	       model.setOrientation(val, undefined, undefined);
	    }
	    break;
         case "yaw":
	    if(type === "input") {
	       model.modifyOrientation(undefined, val, undefined);
	    } else if(type === "change") {
	       model.setOrientation(undefined, val, undefined);
	    }
	    break;
         case "roll":
	    if(type === "input") {
	       model.modifyOrientation(undefined, undefined, val);
	    } else if(type === "change") {
	       model.setOrientation(undefined, undefined, val);
	    }
	    break;
      }
      //updateRotation();

      return false;

   };

   //---------------------------------------------------------------
   var setTransverse = function() {
      //console.log("setTransverse:");
      var viewAngles = model.getViewAngles();
      model.setOrientation(viewAngles.transverse.pitch, viewAngles.transverse.yaw, viewAngles.transverse.roll);
      updateSlider('all');
      //view.updateWlzRotation("tiledImageRotationTool: setTransverse:");
   };

   //---------------------------------------------------------------
   var setSagittal = function() {
      //console.log("setSagittal:");
      var viewAngles = model.getViewAngles();
      model.setOrientation(viewAngles.sagittal.pitch, viewAngles.sagittal.yaw, viewAngles.sagittal.roll);
      updateSlider('all');
      //view.updateWlzRotation("tiledImageRotationTool: setSagittal:");
   };

   //---------------------------------------------------------------
   var setCoronal = function() {
      //console.log("setCoronal:");
      var viewAngles = model.getViewAngles();
      model.setOrientation(viewAngles.coronal.pitch, viewAngles.coronal.yaw, viewAngles.coronal.roll);
      updateSlider('all');
      //view.updateWlzRotation("tiledImageRotationTool: setCoronal:");
   };

   //---------------------------------------------------------
   var updateRotation = function () {

      view.updateWlzRotation("rotation: updateRotation");
      return false;
   };

   //---------------------------------------------------------
   var doMouseUpDown = function (e) {

      var target;
      var dragContainer;
      //console.log(e);

      dragContainer = $(rotDragContainerId);
      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }
      //console.log("doMouseUpDown target.id ",target.id);

      dragContainer = $(rotDragContainerId);

      if(e.type.toLowerCase() === "mousedown") {
         //MOUSE_DOWN = true;
         dragContainer.setAttribute("draggable", false);
      } else if(e.type.toLowerCase() === "mouseup") {
         //MOUSE_DOWN = false;
         updateRotation();
         dragContainer.setAttribute("draggable", true);
      }

      return false;

   };

   //---------------------------------------------------------------
   var doFixedPointDivClicked = function() {
      var modes = view.getModes();
      var mode = view.getMode();
      //console.log("doFixedPointDivClicked mode %s",mode.name);
      if(mode.name.toLowerCase() === "fixedpoint") {
         view.setMode("move");
      } else {
         view.setMode(modes.fixedPoint.name);
      }
   };

   //---------------------------------------------------------
   var doRotSliderFocus = function (e) {
      //console.log("Focus");
   };

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setRotVisible(false);
   };

   //---------------------------------------------------------------
   var setRotVisible = function(show) {
      var rot = $(rotDragContainerId);
      var viz = show ? "visible" : "hidden";
      rot.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var setInitialConditions = function() {

      var initState;
      var pitch;
      var yaw;
      var roll;

      initState = model.getInitialState();

      pitchSlider.set('value', initState.pitch);
      yawSlider.set('value', initState.yaw);
      rollSlider.set('value', initState.roll);

      pitchNumber.set('value', initState.pitch);
      yawNumber.set('value', initState.yaw);
      rollNumber.set('value', initState.roll);

   }; // setInitialConditions

   //---------------------------------------------------------------
   var updateSlider = function(from) {

      var threeDInfo;
      var pitch;
      var yaw;
      var roll;

      threeDInfo = model.getThreeDInfo();

      EXT_CHANGE = true;

      if(from === 'pitch' || from === 'all') {
	 pitch = threeDInfo.pitch;
	 pitchSlider.set('value', pitch.cur);
	 pitchNumber.set('value', pitch.cur);
      }

      if(from === 'yaw' || from === 'all') {
	 yaw = threeDInfo.yaw;
	 yawSlider.set('value', yaw.cur);
	 yawNumber.set('value', yaw.cur);
      }

      if(from === 'roll' || from === 'all') {
	 roll = threeDInfo.roll;
	 rollSlider.set('value', roll.cur);
	 rollNumber.set('value', roll.cur);
      }

      EXT_CHANGE = false;
   };

   //---------------------------------------------------------------
   var addHandlersForArrowKeys = function() {

      lmnt = $(rotDragContainerId);
      lmnt.addEvent('keyup', doKeyUp, true);

   }; // addHandlersForArrowKeys

   //---------------------------------------------------------------
   var doKeyUp = function(e) {

      var code;
      var target;

      //console.log(e);

      code = emouseatlas.emap.utilities.getKeyCode(e);
      //console.log("doKeyUp ",code);

      if(code >= 33 && code <= 40) {
	 updateRotation();
      }

   }; // doKeyUp

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

      rotDragContainerId = "rotDragContainer";

      sliderStep = 1;
 
      createElements();

      //MOUSE_DOWN = false;

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;
      IS_VISIBLE = false;

      emouseatlas.emap.drag.register({drag:rotDragContainerId, drop:dropTargetId});

      addHandlersForArrowKeys();

   }; // initialise

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      var rot;
      var invDist;
      var rotCur;

      if(modelChanges.initial === true) {
      }

      /*
      //...................................
      if(modelChanges.sectionChanged === true) {

         rot = model.getDistance();
         rotCur = getDistFromSliderText();

	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       rotSlider.value = rot.cur;
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }

	 //console.log("model: rotCur %s, rot %s",rotCur, rot.cur);

	 if(rot.cur != rotCur) {
	    EXT_CHANGE = true;
	       rotSlider.value = rot.cur;
	    EXT_CHANGE = false;
	 }
	 setSliderText(rot.cur);
      }
      */

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      var initState;
      var rot;
      var invDist;
      var rotCur;

      if(viewChanges.initial === true) {
         setRotVisible(true);
	 setInitialConditions();
      }

      //.................................
      if(viewChanges.toolbox === true) {
	if(view.toolboxVisible()) {
           setRotVisible(true);
        } else {
           setRotVisible(false);
	}
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "rotation";
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
