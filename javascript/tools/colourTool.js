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
//   colourTool.js
//   Tool to change colour of displayed (tree) elements
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
// module for colourTool
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.colourTool = function () {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var _debug;
   var model;
   var view;
   var utils;
   var targetId;
   var klass;
   var name;
   var shortName;
   var title;
   var imagePath;
   var layer;
   var x_side;
   var y_top;
   var dragContainerId;
   var dropTargetId;
   var colRange;
   var alphaRange;
   var redSlider;
   var greenSlider;
   var blueSlider;
   var alphaSlider;
   var redNumber;
   var greenNumber;
   var blueNumber;
   var alphaNumber;
   var patchDiv
   var titleText;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      _debug = false;

      //console.log("enter colourTool.initialize: ",params);
      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;

      model.register(this, "colourTool");
      view.register(this, "colourTool");

      utils = emouseatlas.emap.utilities;

      dragContainerId = "colourToolDragContainer";
      dropTargetId = model.getProjectDivId();
      //console.log("colourTool dropTargetId %s",dropTargetId);

      targetId = (params.targetId === undefined) ? model.getProjectDivId() : params.targetId;

      klass = (params.klass === undefined) ? "" : params.klass; 

      drag = params.drag;
      borders = params.borders;
      //console.log("drag %s",drag);

      colRange = {min:0, max:255};
      alphaRange = {min:0, max:100};

      name = "colourTool";
      shortName = name.toLowerCase().split(" ").join("");

      imagePath = model.getInterfaceImageDir();

      x_side = params.x; 
      y_top = params.y; 

      // we are reading in the params from a json file so they will be strings.
      title = params.title;
      //console.log("title ",title);
      if(title === undefined || title === null || title === "") {
         title = "Colour Tool";
      }

      imagePath = model.getInterfaceImageDir();

      layer = params.layer;
      //console.log("layer ",layer);

      createElements();
      showColourTool(false);
      emouseatlas.emap.drag.register({drag:dragContainerId, drop:dropTargetId}, "colourTool");

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function () {

      var target;
      var dragContainer;
      var mainDiv;
      //------------------------
      var topEdge;
      var tlCorner;
      var trCorner;
      var titleContainer;
      //------------------------
      var imgPath;
      var closeImg1;
      var closeImg2;
      var closeButton;
      //------------------------
      var colourToolCanvas;
      var colourToolImg;
      var cntxt;
      //------------------------
      var redControlDiv;
      var redSliderDiv;
      var redFieldset;
      var redLegend;
      //------------------------
      var greenControlDiv;
      var greenSliderDiv;
      var greenFieldset;
      var greenLegend;
      //------------------------
      var blueControlDiv;
      var blueSliderDiv;
      var blueFieldset;
      var blueLegend;
      //------------------------
      var alphaControlDiv;
      var alphaSliderDiv;
      var alphaFieldset;
      var alphaLegend;
      //------------------------

      target = $(targetId);

      dragContainer = $(dragContainerId);

      if(dragContainer) {
         dragContainer.parentNode.removeChild(dragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      dragContainer = new Element('div', {
         'id': dragContainerId,
	 'class': klass
      });
      dragContainer.setAttribute("draggable", true);

      //----------------------------------------
      // add the element
      //----------------------------------------
      dragContainer.inject(target, 'inside');

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // container for colourTool title
      //----------------------------------------
      titleContainer = new Element('div', {
         'id': 'colourToolTitleContainer'
      });

      titleText = new Element('div', {
         'id': 'colourToolTitleText'
      });
      titleText.appendText(title);

      topEdge = new Element('div', {
         'id': 'colourToolTopEdge',
	 'class': 'topEdge colourTool'
      });

      tlCorner = new Element('div', {
         'id': 'colourToolTopLeftCorner',
	 'class': 'topLeftCorner colourTool'
      });

      trCorner = new Element('div', {
         'id': 'colourToolTopRightCorner',
	 'class': 'topRightCorner colourTool'
      });

      titleText.inject(titleContainer, 'inside');
      titleContainer.inject(topEdge, 'inside');
      topEdge.inject(dragContainer, 'inside');
      tlCorner.inject(dragContainer, 'inside');
      trCorner.inject(dragContainer, 'inside');

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the main container for all the bits
      //----------------------------------------
      mainDiv = document.createElement('div');
      mainDiv.setAttribute('id', 'colourToolMainDiv');

      mainDiv.inject(dragContainer, 'inside');

      //-------------------------------------------------------------------------------
      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      imgPath = model.getInterfaceImageDir();
      closeImg1 = imgPath + "close_10x8.png";
      closeImg2 = imgPath + "close2_10x8.png";

      closeButton = new Element('div', {
	 'id': 'colourToolCloseButton',
	 'class': 'closeButton colourTool'
      });

      closeImg = new Element( 'img', {
	 'id': 'colourToolCloseImg',
	 'class': 'closeButtonImg',
	 'src': closeImg1
      });

      //----------------------------------------
      // add the elements
      //----------------------------------------
      closeImg.inject(closeButton, 'inside');
      closeButton.inject(topEdge, 'inside');
      emouseatlas.emap.utilities.addButtonStyle('colourToolCloseButton');

      //--------------------------------
      // add event handlers
      //--------------------------------
      closeButton.addEvent('mouseup', function(event){
	 doClosed();
      }); 

      closeImg.addEvent('mouseover', function(){
	 closeImg.set('src', closeImg2);
      }); 
      
      closeImg.addEvent('mouseout', function(){
	 closeImg.set('src', closeImg1);
      }); 
      
      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the canvas for the colour sphere
      // set the width and height of the canvas here
      // (setting it via css seems to screw up the width of the image)
      //----------------------------------------
      colourToolCanvas = document.createElement('canvas');
      colourToolCanvas.setAttribute('id', 'colourToolCanvas');
      colourToolCanvas.setAttribute('class', 'colourTool');
      colourToolCanvas.setAttribute('width', '150px');
      colourToolCanvas.setAttribute('height', '150px');

      colourToolCanvas.inject(colourToolMainDiv, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      emouseatlas.emap.utilities.addEvent(colourToolCanvas, 'mouseup', function(e) {
         //console.log("colourToolCanvas mouseup");
	 doMouseUpColourTool(e);
      }, false);

      cntxt = colourToolCanvas.getContext('2d');
      //console.log("cntxt ",cntxt);

      //----------------------------------------
      // the colour sphere image
      //----------------------------------------
      colourToolImg = new Image();
      colourToolImg.setAttribute('id', 'colourToolImg');
      colourToolImg.setAttribute('class', 'colourTool');
      colourToolImg.onload = function(){
         cntxt.drawImage(colourToolImg,0,0);
      }
      colourToolImg.src = imagePath + 'colourSphere150.png';

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the red control
      //----------------------------------------
      redControlDiv = new Element('div', {
	 'id': 'colourToolRedDiv',
	 'class':'colourToolControl'
      });


      redSliderDiv = new Element('div', {
         'id': 'colourToolRedSliderContainer',
         'class': 'sliderContainer colourTool '
      });


      redFieldset = new Element('fieldset', {
         'id': 'colourToolRedFieldset',
         'name': 'colourToolRedFieldset',
         'class': 'colourTool'
      });
      
      redLegend = new Element('legend', {
         'id': 'colourToolRedFieldsetLegend',
         'class': 'colourTool',
         'name': 'colourToolRedFieldsetLegend'
      });
      redLegend.set('text', 'R');
      
      redSlider = new Element('input', {
         'id': 'colourToolRedSlider',
         'class': 'colourTool',
         'name': 'colourToolRedSlider',
         'type': 'range',
	 'min': colRange.min,
	 'max': colRange.max
      });

      redNumber = new Element('input', {
         'id': 'colourToolRedNumber',
         'class': 'colourTool',
         'type': 'number',
	 'min': colRange.min,
	 'max': colRange.max
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      redControlDiv.inject(colourToolMainDiv, 'inside');
      redSliderDiv.inject(redControlDiv, 'inside');
      redFieldset.inject(redSliderDiv, 'inside');
      redLegend.inject(redFieldset, 'inside');
      redSlider.inject(redFieldset, 'inside');
      redNumber.inject(redFieldset, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      redSlider.addEvent('input',function(e) {
         doColourToolSliderChanged(e);
      });
      
      redNumber.addEvent('change',function(e) {
         doColourToolNumberChanged(e);
      });

      redSlider.addEvent('mousedown',function(e) {
         enableColourToolDrag(false);
      });

      redSlider.addEvent('mouseup',function(e) {
         enableColourToolDrag(true);
      });
      

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the green control
      //----------------------------------------
      greenControlDiv = new Element('div', {
	 'id': 'colourToolGreenDiv',
	 'class':'colourToolControl'
      });


      greenSliderDiv = new Element('div', {
         'id': 'colourToolGreenSliderContainer',
         'class': 'sliderContainer colourTool '
      });


      greenFieldset = new Element('fieldset', {
         'id': 'colourToolGreenFieldset',
         'name': 'colourToolGreenFieldset',
         'class': 'colourTool'
      });
      
      greenLegend = new Element('legend', {
         'id': 'colourToolGreenFieldsetLegend',
         'class': 'colourTool',
         'name': 'colourToolGreenFieldsetLegend'
      });
      greenLegend.set('text', 'G');
      
      greenSlider = new Element('input', {
         'id': 'colourToolGreenSlider',
         'class': 'colourTool',
         'name': 'colourToolGreenSlider',
         'type': 'range',
	 'min': colRange.min,
	 'max': colRange.max
      });

      greenNumber = new Element('input', {
         'id': 'colourToolGreenNumber',
         'class': 'colourTool',
         'type': 'number',
	 'min': colRange.min,
	 'max': colRange.max
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      greenControlDiv.inject(colourToolMainDiv, 'inside');
      greenSliderDiv.inject(greenControlDiv, 'inside');
      greenFieldset.inject(greenSliderDiv, 'inside');
      greenLegend.inject(greenFieldset, 'inside');
      greenSlider.inject(greenFieldset, 'inside');
      greenNumber.inject(greenFieldset, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      greenSlider.addEvent('input',function(e) {
         doColourToolSliderChanged(e);
      });
      
      greenNumber.addEvent('change',function(e) {
         doColourToolNumberChanged(e);
      });

      greenSlider.addEvent('mousedown',function(e) {
         enableColourToolDrag(false);
      });

      greenSlider.addEvent('mouseup',function(e) {
         enableColourToolDrag(true);
      });

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the blue control
      //----------------------------------------
      blueControlDiv = new Element('div', {
	 'id': 'colourToolBlueDiv',
	 'class':'colourToolControl'
      });


      blueSliderDiv = new Element('div', {
         'id': 'colourToolBlueSliderContainer',
         'class': 'sliderContainer colourTool '
      });


      blueFieldset = new Element('fieldset', {
         'id': 'colourToolBlueFieldset',
         'name': 'colourToolBlueFieldset',
         'class': 'colourTool'
      });
      
      blueLegend = new Element('legend', {
         'id': 'colourToolBlueFieldsetLegend',
         'class': 'colourTool',
         'name': 'colourToolBlueFieldsetLegend'
      });
      blueLegend.set('text', 'B');
      
      blueSlider = new Element('input', {
         'id': 'colourToolBlueSlider',
         'class': 'colourTool',
         'name': 'colourToolBlueSlider',
         'type': 'range',
	 'min': colRange.min,
	 'max': colRange.max
      });

      blueNumber = new Element('input', {
         'id': 'colourToolBlueNumber',
         'class': 'colourTool',
         'type': 'number',
	 'min': colRange.min,
	 'max': colRange.max
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      blueControlDiv.inject(colourToolMainDiv, 'inside');
      blueSliderDiv.inject(blueControlDiv, 'inside');
      blueFieldset.inject(blueSliderDiv, 'inside');
      blueLegend.inject(blueFieldset, 'inside');
      blueSlider.inject(blueFieldset, 'inside');
      blueNumber.inject(blueFieldset, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      blueSlider.addEvent('input',function(e) {
         doColourToolSliderChanged(e);
      });
      
      blueNumber.addEvent('change',function(e) {
         doColourToolNumberChanged(e);
      });

      blueSlider.addEvent('mousedown',function(e) {
         enableColourToolDrag(false);
      });

      blueSlider.addEvent('mouseup',function(e) {
         enableColourToolDrag(true);
      });

      //-------------------------------------------------------------------------------
      //----------------------------------------
      // the alpha control
      //----------------------------------------
      alphaControlDiv = new Element('div', {
	 'id': 'colourToolAlphaDiv',
	 'class':'colourToolControl'
      });


      alphaSliderDiv = new Element('div', {
         'id': 'colourToolAlphaSliderContainer',
         'class': 'sliderContainer colourTool '
      });


      alphaFieldset = new Element('fieldset', {
         'id': 'colourToolAlphaFieldset',
         'name': 'colourToolAlphaFieldset',
         'class': 'colourTool'
      });
      
      alphaLegend = new Element('legend', {
         'id': 'colourToolAlphaFieldsetLegend',
         'class': 'colourTool',
         'name': 'colourToolAlphaFieldsetLegend'
      });
      alphaLegend.set('text', 'A');
      
      alphaSlider = new Element('input', {
         'id': 'colourToolAlphaSlider',
         'class': 'colourTool',
         'name': 'colourToolAlphaSlider',
         'type': 'range',
	 'min': alphaRange.min,
	 'max': alphaRange.max
      });

      alphaNumber = new Element('input', {
         'id': 'colourToolAlphaNumber',
         'class': 'colourTool',
         'type': 'number',
	 'min': alphaRange.min,
	 'max': alphaRange.max
      });
      
      //--------------------------------
      // add the elements
      //--------------------------------
      alphaControlDiv.inject(colourToolMainDiv, 'inside');
      alphaSliderDiv.inject(alphaControlDiv, 'inside');
      alphaFieldset.inject(alphaSliderDiv, 'inside');
      alphaLegend.inject(alphaFieldset, 'inside');
      alphaSlider.inject(alphaFieldset, 'inside');
      alphaNumber.inject(alphaFieldset, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------
      
      alphaSlider.addEvent('input',function(e) {
         doColourToolSliderChanged(e);
      });
      
      alphaNumber.addEvent('change',function(e) {
         doColourToolNumberChanged(e);
      });

      alphaSlider.addEvent('mousedown',function(e) {
         enableColourToolDrag(false);
      });

      alphaSlider.addEvent('mouseup',function(e) {
         enableColourToolDrag(true);
      });

      //---------------------------------------------------------------------
      //----------------------------------------
      // the colour patch
      //----------------------------------------
      patchDiv = new Element('div', {
	 'id': 'colourToolPatch',
	 'class':'colourToolPatch'
      });
      //--------------------------------
      patchDiv.inject(colourToolMainDiv, 'inside');

   }; // createElements

   //---------------------------------------------------------------
   var doColourToolSliderChanged = function(e) {

      var target;
      //console.log("doColourToolSliderChanged  e ",e);
      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }

      switch (target.id) {
         case "colourToolRedSlider":
	    redNumber.value = target.value;
	    break;
         case "colourToolGreenSlider":
	    greenNumber.value = target.value;
	    break;
         case "colourToolBlueSlider":
	    blueNumber.value = target.value;
	    break;
         case "colourToolAlphaSlider":
	    alphaNumber.value = target.value;
	    break;
      }

      updatePatch();
      updateTitle();
      view.colourChange("colourTool");

   }; // doColourToolSliderChanged

   //---------------------------------------------------------------
   var doColourToolNumberChanged = function(e) {

      var target;

      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }

      switch (target.id) {
         case "colourToolRedNumber":
	    redSlider.value = target.value;
	    break;
         case "colourToolGreenNumber":
	    greenSlider.value = target.value;
	    break;
         case "colourToolBlueNumber":
	    blueSlider.value = target.value;
	    break;
         case "colourToolAlphaNumber":
	    alphaSlider.value = target.value;
	    break;
      }

      updatePatch();
      updateTitle();
      view.colourChange("colourTool");

   }; // doColourNumberChanged

   //---------------------------------------------------------------
   var doMouseUpColourTool = function(e) {

      var canv;
      var pos;
      var mx;
      var my;
      var col = {};
      var alphStep;
      var alph;
      var hex;

      canv = document.getElementById("colourToolCanvas");
      pos = emouseatlas.emap.utilities.getElementPosition(canv);

      mx = e.clientX - pos.x;
      my = e.clientY - pos.y;

      col = getColFromCanvas(mx, my);

      redSlider.value = col.R;;
      redNumber.value = col.R;;
      greenSlider.value = col.G;;
      greenNumber.value = col.G;;
      blueSlider.value = col.B;;
      blueNumber.value = col.B;;

      updatePatch();
      updateTitle();
      view.colourChange("colourTool");

   }; // doMouseUpColourTool:

   //---------------------------------------------------------------
   var updatePatch = function() {

      var red;
      var green;
      var blue;
      var alpha;

      red = redSlider.value;
      green = greenSlider.value;
      blue = blueSlider.value;
      alpha = alphaSlider.value / 100;

      if(patchDiv) {
	 patchDiv.setStyles({
	    background: 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')'
	 });
      }

   }; // updatePatch:

   //---------------------------------------------------------------
   var updateTitle = function() {

      var red;
      var green;
      var blue;
      var alpha100;
      var alpha255;
      var hexR;
      var hexG;
      var hexB;
      var hexA;
      var hexCol;

      red = redSlider.value;
      green = greenSlider.value;
      blue = blueSlider.value;
      alpha100 = alphaSlider.value;

      alpha255 = Math.round((alpha100 / 100.0) * 255);

      hexR = emouseatlas.emap.utilities.toHex(red);
      hexG = emouseatlas.emap.utilities.toHex(green);
      hexB = emouseatlas.emap.utilities.toHex(blue);
      hexA = emouseatlas.emap.utilities.toHex(alpha255);

      hexCol = hexR + " " + hexG + " " + hexB + " " + hexA;
      hexCol = hexCol.toLowerCase();
      titleText.set('text', 'rgba: 0x ' + hexCol);

   }; // updateTitle:

   //---------------------------------------------------------------
   var getColFromCanvas = function(x, y) {

      //console.log("getColFromCanvas:");
      var canv;
      var cntxt;
      var imgData;
      var data = [];
      var width;
      var height;
      var red;
      var green;
      var blue;
      var alpha;
      var indx;
      var col = {};

      canv = $('colourToolCanvas');
      width = canv.width;
      height = canv.height;

      cntxt = canv.getContext('2d');
      imgData = cntxt.getImageData(0,0,width,height);

      data = imgData.data;

      indx = y*width*4 + x*4;
      red = data[indx]; 
      green = data[parseInt(indx + 1*1)]; 
      blue = data[parseInt(indx + 2)]; 

      col = {R:red, G:green, B:blue};

      return col;

   }; // getColFromCanvas:

   //---------------------------------------------------------------
   var enableColourToolDrag = function(draggable) {

      //console.log("enableColourToolDrag: %s",draggable);
      var dragContainer;

      dragContainer = $(dragContainerId);
      dragContainer.setAttribute("draggable", draggable);

   };

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      showColourTool(false, "doClosed");
      isVisible = false;
   };

   //---------------------------------------------------------------
   var showColourTool = function(show, from) {
      //console.log("showColourTool: %s, from %s",show, from);
      var dragCon;
      var canv;
      var topEd;
      var leftCorn
      var rightCorn
      var viz;
      var len;
      var i;
      var found;

      viz = show ? "visible" : "hidden";

      dragCon = $(dragContainerId);
      dragCon.setStyle("visibility", viz);

      canv = document.getElementById("colourToolCanvas");
      if(canv) {
         canv.setStyle("visibility", viz);
      }

      topEd = document.getElementById("colourToolTopEdge");
      if(topEd) {
         topEd.setStyle("visibility", viz);
      }

      lCorn = document.getElementById("colourToolTopLeftCorner");
      if(lCorn) {
         lCorn.setStyle("visibility", viz);
      }

      rCorn = document.getElementById("colourToolTopRightCorner");
      if(rCorn) {
         rCorn.setStyle("visibility", viz);
      }

   };

   //---------------------------------------------------------------
   var getRGBA = function(hex) {

      var red;
      var green;
      var blue;
      var alpha1;
      var alpha100;
      var alpha255;
      var col;
      
      red = redSlider.value;
      green = greenSlider.value;
      blue = blueSlider.value;
      alpha100 = alphaSlider.value;

      alpha1 = alpha100 / 100.0;
      alpha255 = Math.round(alpha1 * 255);

      if(hex) {
         hexR = emouseatlas.emap.utilities.toHex(red);
         hexG = emouseatlas.emap.utilities.toHex(green);
         hexB = emouseatlas.emap.utilities.toHex(blue);
         hexA = emouseatlas.emap.utilities.toHex(alpha255);

         hexCol = hexR + " " + hexG + " " + hexB + " " + hexA;
         hexCol = hexCol.toLowerCase();
	 return hexCol;
      } else {
         col = {red:parseInt(red), green:parseInt(green), blue:parseInt(blue), alpha:parseFloat(alpha1)};
         return col;
      }

   }; // getRGBA

   //---------------------------------------------------------------
   var setRGBA = function(col) {

      if(redSlider) {
         redSlider.value = col.r;
      }
      if(greenSlider) {
         greenSlider.value = col.g;
      }
      if(blueSlider) {
         blueSlider.value = col.b;
      }
      if(alphaSlider) {
         alphaSlider.value = Math.round(col.a * 100);
      }

      //-----------------------------------------------
      if(redNumber) {
         redNumber.value = col.r;
      }
      if(greenNumber) {
         greenNumber.value = col.g;
      }
      if(blueNumber) {
         blueNumber.value = col.b;
      }
      if(alphaNumber) {
         alphaNumber.value = Math.round(col.a * 100);
      }

      //-----------------------------------------------
      updatePatch();
      updateTitle();

      return false;

   }; // setRGBA
      
   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges, from) {

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges) {

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "colourTool";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      showColourTool: showColourTool,
      setRGBA: setRGBA,
      getRGBA: getRGBA,
      getName: getName
   };

}(); // end of module colourTool
//----------------------------------------------------------------------------
