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
//   comboDistance.js
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
// comboDistance
//---------------------------------------------------------
emouseatlas.emap.comboDistance = function() {

   var model;
   var view;
   var util;
   var targetId;
   var keySections;
   var comboDistDragContainerId;
   var x_left;
   var y_top;
   var keySlider;
   var keySliderNumber;
   var keySliderStep;
   var keySliderMaxVal;
   var keySliderMinVal;
   var MOUSE_DOWN;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {
      createSectionElements();
      createKeySectionElements();
   };

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createSectionElements = function () {

      var target;
      var comboDistDragContainer;
      var keySliderContainer;
      var keyNumberContainer;
      var fs1;
      var fs2;
      var legend1;
      var legend2;
      //------------------------

      targetId = (targetId) ? targetId : model.getProjectDivId();
      target = $(targetId);

      comboDistDragContainer = $(comboDistDragContainerId);

      if(comboDistDragContainer) {
         comboDistDragContainer.parentNode.removeChild(comboDistDragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      comboDistDragContainer = new Element('div', {
         'id': comboDistDragContainerId
      });

      comboDistDragContainer.setStyles({
         "top": y_top + "px",
         "left": x_left + "px"
      });

      //----------------------------------------
      // the slider container
      //----------------------------------------
      keySliderContainer = new Element('div', {
         'id': 'keySliderContainer',
         'class': 'keySliderContainer'
      });

      comboDistDragContainer.inject(target, 'inside');
      keySliderContainer.inject(comboDistDragContainer, 'inside');

      //-------------------------------------------------------------------------------
      fs1 = new Element('fieldset', {
         'id': 'keySliderFieldset',
         'name': 'keySliderFieldset',
         'class': 'dist'
      });
      
      legend1 = new Element('legend', {
         'id': 'keySliderFieldsetLegend',
         'class': 'keySlider',
         'name': 'keySliderFieldsetLegend'
      });
      legend1.set('text', 'section');
      
      keySlider = new Element('input', {
         'id': 'keySlider',
         'name': 'keySlider',
         'class': 'keySlider',
         'type': 'range'
      });
      keySlider.setCustomValidity("");
      keySlider.setAttribute("formnovalidate", "");

      keySliderNumber = new Element('input', {
         'id': 'keySliderNumber',
         'class': 'keySlider',
         'type': 'number'
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      fs1.inject(keySliderContainer, 'inside');
      legend1.inject(fs1, 'inside');
      keySliderNumber.inject(fs1, 'inside');
      keySlider.inject(fs1, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      keySlider.addEvent('input',function(e) {
         doKeySliderChanged(e);
      });
      keySlider.addEvent('mousemove',function(e) {
         doKeySliderMouseMoved(e);
      });
      keySlider.addEvent('mousedown',function(e) {
         enableDrag(e);
      });
      keySlider.addEvent('mouseup',function(e) {
         enableDrag(e);
      });
      
      keySliderNumber.addEvent('change',function(e) {
         doKeySliderNumberChanged(e);
      });

   }; // createSectionElements

   //---------------------------------------------------------------
   var createKeySectionElements = function () {

      var keyButtonContainer;
      var firstButton;
      var firstImgDiv;
      var firstImg;
      var nextButton;
      var nextImgDiv;
      var nextImg;
      var lastButton;
      var lastImgDiv;
      var lastImg;
      var prevButton;
      var prevImgDiv;
      var prevImg;
      var imgPath;
      var firstImgSrc;
      var lastImgSrc;
      var prevImgSrc;
      var nextImgSrc;
      var keySectionTextContainer;
      var keySectionTextDiv;
      var keySectionTextSpacer;

      //----------------------------------------
      // the button container
      //----------------------------------------
      keyButtonContainer = new Element('div', {
         'id': 'keyButtonContainer',
         'class': 'keyButtonContainer'
      });

      keyButtonContainer.inject(comboDistDragContainer, 'inside');
      //-------------------------------------------------------------------------------
      imagePath = model.getInterfaceImageDir();
      firstImgSrc = imagePath + "firstIcon_10x12.png";
      lastImgSrc = imagePath + "lastIcon_10x12.png";
      prevImgSrc = imagePath + "prevIcon_10x12.png";
      nextImgSrc = imagePath + "nextIcon_10x12.png";

      firstButton = new Element('div', {
         'id': 'keySectionFirstButton',
	 'class': 'keySectionButton first'
      });
      firstImgDiv = new Element( 'div', {
	 'id': 'firstImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      firstImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': firstImgSrc
      });
      //firstButton.appendText('<<');

      lastButton = new Element('div', {
         'id': 'keySectionLastButton',
	 'class': 'keySectionButton last'
      });
      lastImgDiv = new Element( 'div', {
	 'id': 'lastImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      lastImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': lastImgSrc
      });
      //lastButton.appendText('>>');

      prevButton = new Element('div', {
         'id': 'keySectionPrevButton',
	 'class': 'keySectionButton prev'
      });
      prevImgDiv = new Element( 'div', {
	 'id': 'prevImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      prevImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': prevImgSrc
      });
      //prevButton.appendText('<');

      nextButton = new Element('div', {
         'id': 'keySectionNextButton',
	 'class': 'keySectionButton next'
      });
      nextImgDiv = new Element( 'div', {
	 'id': 'nextImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      nextImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': nextImgSrc
      });
      //nextButton.appendText('>');

      //----------------------------------------
      // button description
      //----------------------------------------
      keySectionTextContainer = new Element('div', {
         'id': 'keySectionTextContainer'
      });

      keySectionTextSpacer = new Element('div', {
         'id': 'keySectionTextSpacer'
      });

      keySectionTextDiv = new Element('div', {
         'id': 'keySectionText'
      });
      keySectionTextDiv.set('text', 'key sections');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      firstButton.inject(keyButtonContainer, 'inside');
      prevButton.inject(keyButtonContainer, 'inside');

      keySectionTextDiv.inject(keySectionTextContainer, 'inside', 'inside');
      //keySectionTextSpacer.inject(keyButtonContainer, 'inside', 'inside');
      keySectionTextContainer.inject(keyButtonContainer, 'inside', 'inside');

      nextButton.inject(keyButtonContainer, 'inside');
      lastButton.inject(keyButtonContainer, 'inside');

      firstImg.inject(firstImgDiv, 'inside');
      firstImgDiv.inject(firstButton, 'inside');

      lastImg.inject(lastImgDiv, 'inside');
      lastImgDiv.inject(lastButton, 'inside');
      
      nextImg.inject(nextImgDiv, 'inside');
      nextImgDiv.inject(nextButton, 'inside');

      prevImg.inject(prevImgDiv, 'inside');
      prevImgDiv.inject(prevButton, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('keySectionFirstButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionLastButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionPrevButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionNextButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      firstButton.addEvent('click',function() {
	 doFirstKeySection();
      });

      lastButton.addEvent('click',function() {
	 doLastKeySection();
      });

      prevButton.addEvent('click',function() {
	 doPrevKeySection();
      });

      nextButton.addEvent('click',function() {
	 doNextKeySection();
      });

      return false;
   }; // createKeySectionElements


   //---------------------------------------------------------
   var doKeySliderChanged = function (e) {

      var target;
      var val;
      var dist;
      var invDist;
      var distCur;

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
      val = target.valueAsNumber;
      distCur = keySliderNumber.get('value');

      if(val != distCur) {
         setKeySliderText(val);
	 model.modifyDistance(val);
      }

      return false;
   };

   //---------------------------------------------------------
   var doKeySliderMouseMoved = function (e) {

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
   var doKeySliderNumberChanged = function (e) {

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
   var doKeyNumberChanged = function (e) {

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
//====================================================================
   //---------------------------------------------------------------
   var doFirstKeySection = function () {

      //console.log("doFirstKeySection:");
      if(keySections === undefined) {
         keySections = model.getKeySections();
      }

      if(keySections === null || keySections === undefined || keySections.length <= 0) {
         return false;
      }

      //dist = model.getDistance();
      model.setDistance(keySections[0]);
   };

   //---------------------------------------------------------------
   var doLastKeySection = function () {

      var len;
      //console.log("doLastKeySection:");
      if(keySections === undefined) {
         keySections = model.getKeySections();
      }
      //console.log(keySections);

      if(keySections === null || keySections === undefined || keySections.length <= 0) {
         return false;
      }

      len = keySections.length;
      console.log(keySections[len-1]);
      model.setDistance(keySections[len-1]);
   };

   //---------------------------------------------------------------
   var doPrevKeySection = function () {

      var dist;
      var len;
      var i;

      //console.log("doPrevKeySection:");
      if(keySections === undefined) {
         keySections = model.getKeySections();
      }

      if(keySections === null || keySections === undefined || keySections.length <= 0) {
         return false;
      }

      //console.log(keySections);

      len = keySections.length - 1;
      dist = model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=len; i>-1; i--) {
         val = keySections[i];
	 //console.log("val %d",val);
         if(val < dist.cur) {
	    model.setDistance(val);
	    return;
	 }
      }
   };

   //---------------------------------------------------------------
   var doNextKeySection = function () {
      
      var dist;
      var len;
      var val;
      var i;

      //console.log("doNextKeySection:");
      if(keySections === undefined) {
         keySections = model.getKeySections();
      }

      len = keySections.length;
      dist = model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=0; i<len; i++) {
	 //console.log("val %d",val);
         val = keySections[i];
         if(val > dist.cur) {
	    model.setDistance(val);
	    return;
	 }
      }

   };
//====================================================================

   //---------------------------------------------------------
   var updateDistance = function () {

      var val;

      //console.log("updateDistance");
      val = keySliderNumber.get('value');
      model.setDistance(val);

      return false;
   };

   //---------------------------------------------------------
   var enableDrag = function (e) {

      var target;
      var dragContainer;
      //console.log(e);

      dragContainer = $(comboDistDragContainerId);
      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }
      //console.log("enableDrag target.id ",target.id);

      //emouseatlas.emap.distance.updateDistance();
      updateDistance();

      dragContainer = $(comboDistDragContainerId);

      if(e.type.toLowerCase() === "mousedown") {
         MOUSE_DOWN = true;
         dragContainer.setAttribute("draggable", false);
      } else if(e.type.toLowerCase() === "mouseup") {
         MOUSE_DOWN = false;
         //target.blur();
         dragContainer.setAttribute("draggable", true);
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
      var dst = $(comboDistDragContainerId);
      var viz = show ? "visible" : "hidden";
      dst.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var initComboDistSlider = function() {

      var dst;

      dst = model.getDistance();
      keySliderMinVal = dst.min;
      keySliderMaxVal = dst.max;

      //console.log("initSlider: min %d, max %d",sliderMinVal,sliderMaxVal);

      keySlider.set("min", keySliderMinVal);
      keySlider.set("max", keySliderMaxVal);
      keySlider.set("step", keySliderStep);

      keySliderNumber.set("min", keySliderMinVal);
      keySliderNumber.set("max", keySliderMaxVal);

   }; // initComboDistSlider

   //---------------------------------------------------------------
   var setKeySliderText = function(dist) {

      //console.log("setKeySliderText ",dist);
      keySliderNumber.set('value', dist);

   }; // setKeySliderText

   //---------------------------------------------------------------
/*
   var initKeyNumber = function() {

      var dst;
      var min;
      var max;
      var step;

      keySections = model.getKeySections();

      console.log(keySections);

      min = 0;
      max = 100;
      step = 1;

      keyNumber.set("min", min);
      keyNumber.set("max", max);

   }; // initKeyNumber
*/

   //---------------------------------------------------------------
   var setKeyNumberText = function(dist) {

      //console.log("setKeySliderText ",dist);
      keyNumber.set('value', dist);

   }; // setKeyNumberText


   //---------------------------------------------------------------
   var getStepsGivenDist = function(dist) {

      var dst;

      dst = model.getDistance();

      return (dist.max - dist.min);

   }; // getStepsGivenDist

   //---------------------------------------------------------------
   var getDistFromSliderText = function() {

      var distCur;

      distCur = keySliderNumber.get('value');
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
      width = (params.width === undefined) ? undefined : params.width;
      targetId = (params.targetId === undefined) ? undefined : params.targetId;

      comboDistDragContainerId = "comboDistDragContainer";
      keySections = model.getKeySections();

      sliderStep = 1;
 
      createElements();
      initComboDistSlider();
      //initKeyNumber();

      MOUSE_DOWN = false;

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;

      emouseatlas.emap.drag.register({drag:comboDistDragContainerId, drop:dropTargetId});

      // to help discover the arrow key codes
      //util.addEvent(document, "keydown", function(e) {discoverKeyCode(e);}, false);

      addHandlersForArrowKeys();

   }; // initialise

   //---------------------------------------------------------------
   var discoverKeyCode = function(e) {

      var code;
      code = emouseatlas.emap.utilities.getKeyCode(e);

      console.log("key code %s",code);

   }; // discoverKeyCode

   //---------------------------------------------------------------
   var addHandlersForArrowKeys = function() {

      lmnt = $(comboDistDragContainerId);
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
	 //emouseatlas.emap.distance.updateDistance();
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
      if(modelChanges.dst === true) {

         dist = model.getDistance();
	 //console.log("dist ",dist);
         distCur = getDistFromSliderText();

	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       keySlider.value = dist.cur;
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }

	 //console.log("model: distCur %s, dist %s",distCur, dist.cur);

	 if(dist.cur != distCur) {
	    EXT_CHANGE = true;
	       keySlider.value = dist.cur;
	    EXT_CHANGE = false;
	 }
	 setKeySliderText(dist.cur);
      }

      //...................................
      if(modelChanges.distanceRange === true) {

	 initComboDistSlider();

         dist = model.getDistance();
         distCur = getDistFromSliderText();
	 //console.log("model: distCur %s, dist %s",distCur, dist.cur);

	 if(dist.cur != distCur) {
	    EXT_CHANGE = true;
	       distSlider.value = dist.cur;
	    EXT_CHANGE = false;
	 }
	 setKeySliderText(dist.cur);

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
	       keySlider.value = dst;
	    EXT_CHANGE = false;
	 }
	 setKeySliderText(dst);
      }

      //...................................
      if(viewChanges.showDist === true) {
         setDistVisible(true);
      }

      //.................................
      if(viewChanges.toolbox === true) {
	if(view.toolboxVisible()) {
           setDistVisible(true);
        } else {
           setDistVisible(false);
	}
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "comboDist";
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

}(); // comboDistance
