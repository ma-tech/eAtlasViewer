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
//   magnification.js
//   Tool to adjust scale in a tiled image
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
// mag
//---------------------------------------------------------
emouseatlas.emap.magnification = function() {

   var model;
   var view;
   var util;
   var targetId;
   var magSlider;
   var magValText;
   var magDragContainerId;
   var paramklass;
   var sliderStep;
   var maxVal;
   var minVal;
   var EXT_CHANGE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var project;
      var klass;
      var target;
      var sliderLength;
      var isHorizontal;
      var magDragContainer;
      var magContainer;
      var fs1;
      var legend1;
      //------------------------

      project = model.getProject();
      //console.log("magnification project %s", project);

      klass = "mag";

      if (project === "kaufman_atlas" || project === "kaufman_supplement") {
         klass = "mag ehist";
      }
      //console.log("magnification klass %s", klass);

      targetId = (targetId) ? targetId : model.getProjectDivId();
      target = $(targetId);

      magDragContainer = $(magDragContainerId);

      if(magDragContainer) {
         magDragContainer.parentNode.removeChild(magDragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      magDragContainer = new Element('div', {
         'id': magDragContainerId,
	 'class': paramklass
      });

      //----------------------------------------
      // the slider container
      //----------------------------------------
      magSliderContainer = new Element('div', {
         'id': 'magSliderContainer',
         'class': 'magSliderContainer'
      });

      magDragContainer.inject(target, 'inside');
      magSliderContainer.inject(magDragContainer, 'inside');

      //-------------------------------------------------------------------------------
      fs1 = new Element('fieldset', {
         'id': 'magFieldset',
         'name': 'magFieldset',
         'class': 'mag'
      });
      
      legend1 = new Element('legend', {
         'id': 'magFieldsetLegend',
         'class': 'mag',
         'name': 'magFieldsetLegend'
      });
      legend1.set('text', 'magnification');
      
      magSlider = new Element('input', {
         'id': 'magSlider',
         'name': 'magSlider',
         'class': klass,
         'type': 'range',
	 'min': '0',
	 'step': '1'
      });
      magSlider.set("value", "0");
      magSlider.setCustomValidity("");
      magSlider.setAttribute("formnovalidate", "");

      /*
      if(width) {
         magSlider.setStyle("width", (width - 4) + "px");
      }
      */

      magList = new Element('datalist', {
         'id': 'magList',
         'name': 'magList'
      });
      option1 = new Element('option', {
         'id': 'magListOption1',
	 'value': "0.25"
      });

      option2 = new Element('option', {
         'id': 'magListOption2',
	 'value': "0.5"
      });

      option3 = new Element('option', {
         'id': 'magListOption3',
	 'value': "1.0"
      });

      option4 = new Element('option', {
         'id': 'magListOption4',
	 'value': "2.0"
      });
      
      magValText = new Element('input', {
         'id': 'magValText',
         'class': 'mag',
         'type': 'text',
         'readOnly': 'readonly'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs1.inject(magSliderContainer, 'inside');
      legend1.inject(fs1, 'inside');
      magValText.inject(fs1, 'inside');
      magSlider.inject(fs1, 'inside');

      magList.inject(fs1, 'inside');
      option1.inject(magList, 'inside');
      option2.inject(magList, 'inside');
      option3.inject(magList, 'inside');
      option4.inject(magList, 'inside');
      
      //--------------------------------
      // add event handlers
      //--------------------------------
      
      magSlider.addEvent('input',function(e) {
         doMagSliderChanged(e);
      });
      magSlider.addEvent('mousedown',function(e) {
         enableMagToolDrag(false);
      });
      magSlider.addEvent('mouseup',function(e) {
         enableMagToolDrag(true);
      });

   }; // createElements

   //---------------------------------------------------------
   var doMagSliderChanged = function (e) {

      var target;
      var val;
      var mag;
      var invMag;
      var magCur;

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
      mag = minVal * (Math.pow(2,val));
      magCur = magValText.get('value');

      if(mag != magCur) {
         setSliderText(mag);
	 view.setScale(mag);
      }

      return false;
   };

   //---------------------------------------------------------------
   var enableMagToolDrag = function(draggable) {

      //console.log("enableMagToolDrag: %s",draggable);
      var dragContainer;

      dragContainer = $(magDragContainerId);
      dragContainer.setAttribute("draggable", draggable);

   };

   //---------------------------------------------------------
   var doMagSliderFocus = function (e) {
      //console.log("Focus");
   };

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setMagVisible(false);
   };

   //---------------------------------------------------------------
   var setMagVisible = function(show) {
      var scl = $(magDragContainerId);
      var viz = show ? "visible" : "hidden";
      scl.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var initSlider = function() {

      var mscl;
      var rat;
      var steps;

      mscl = model.getScaleMaxMin();
      //console.log("mag initSlider mscl ",mscl);
      maxVal = mscl.max;
      minVal = mscl.min;
      rat = maxVal / minVal;
      steps = Math.log(rat) / Math.log(2);

      magSlider.set("max", steps);

   }; // initSlider

   //---------------------------------------------------------------
   var setSliderText = function(mag) {

      var invMag;

      //console.log("setSliderText ",mag);

      if(mag < 1.0) {
	 invMag = 1 / mag;
	 magValText.set('value', '1:' + invMag);
      } else {
	 magValText.set('value', mag + ':1');
      }

   }; // setSliderText

   //---------------------------------------------------------------
   var getStepsGivenMag = function(mag) {

      var mscl;
      var rat;
      var nsteps;

      mscl = model.getScaleMaxMin();
      minVal = mscl.min;
      rat = mag / minVal;
      nsteps = Math.log(rat) / Math.log(2);

      return nsteps;

   }; // getStepsGivenMag

   //---------------------------------------------------------------
   var getMagFromSliderText = function() {

      var magCur;
      var parts;

      magCur = magValText.get('value');
      parts = magCur.split(':');

      //console.log("parts ",parts);

      if(parts[0] === parts[1]) {
         return 1.0;
      } else if(parts[0] === "1") {
         return 1.0 / parseInt(parts[1]);
      } else if(parts[1] === "1") {
         return parseInt(parts[0]);
      }

   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      util = emouseatlas.emap.utilities;

      model.register(this, "magnification");
      view.register(this, "magnification");

      _debug = false;

      dropTargetId = model.getProjectDivId();

      targetId = (params.targetId === undefined) ? undefined : params.targetId;

      paramklass = (params.klass === undefined) ? "" : params.klass; 
      //console.log("paramklass %s",paramklass);

      magDragContainerId = "magDragContainer";
 
      createElements();
      initSlider();

      EXT_CHANGE = false;

      emouseatlas.emap.drag.register({drag:magDragContainerId, drop:dropTargetId}, "magnification");

      //console.log("leaving mag.initialise");

   }; // initialise

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      if(modelChanges.initial === true) {
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      var initState;
      var mag;
      var invMag;
      var magCur;
      var scale;
      var nsteps;
      var this_nsteps;
      var new_nsteps;

      if(viewChanges.initial === true) {
         setMagVisible(true);
         initState = model.getInitialState();
	 mag = initState.scale;
	 nsteps = getStepsGivenMag(mag);
         magSlider.stepUp(nsteps);
	 setSliderText(mag);
      }

      //...................................
      if(viewChanges.showMag === true) {
         setMagVisible(true);
      }

      //...................................
      if(viewChanges.scale === true) {
         scale = view.getScale();
         magCur = getMagFromSliderText();
	 //console.log("scale %s, mag %s",scale.cur, magCur);
	 if(scale.cur != magCur) {
	    setSliderText(scale.cur);
	    this_nsteps = getStepsGivenMag(magCur);
	    new_nsteps = getStepsGivenMag(scale.cur);
	    nsteps = (new_nsteps - this_nsteps);
	    //console.log("nsteps %d",nsteps);
	    EXT_CHANGE = true;
	    if(nsteps > 0) {
               magSlider.stepUp(nsteps);
	    } else {
               magSlider.stepDown(Math.abs(nsteps));
	    }
	    EXT_CHANGE = false;
	 }
      }

      //.................................
      if(viewChanges.toolbox === true) {
	if(view.toolboxVisible()) {
           setMagVisible(true);
        } else {
           setMagVisible(false);
	}
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "mag";
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
