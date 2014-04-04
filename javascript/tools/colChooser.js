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
//   tiledImage3DFeedback.js
//   Tool to change pitch and yaw of plane through 3D wlz object tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// colChooser
//---------------------------------------------------------
//emouseatlas.emap.colChooser = new Class ({
var colChooser = new Class ({

   initialize: function(params) {

      //console.log("enter colChooser.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.toRight = (typeof(params.params.toRight) === 'undefined') ? false : params.params.toRight;

      this._debug = false;

      this.colChooserBuilt = false;
      this.fromCanvas = false;
      this.slidersInitialised = false;

      this.width = params.params.width;
      this.height = params.params.height;
      this.sliderLength = this.width - 50;

      this.drag = params.params.drag;
      this.borders = params.params.borders;
      //console.log("drag %s",this.drag);

      var allowClose = (typeof(params.params.allowClose) === 'undefined') ? false : params.params.allowClose;

      this.targetId = params.params.targetId;

      this.name = "colChooser";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      this.toolTipText = this.shortName;

      this.imagePath = this.model.getInterfaceImageDir();

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         borders:this.borders,
                                         toRight:this.toRight,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: this.imagePath,
					 allowClose: allowClose,
					 initiator:this });

      //console.log("x %s, y %s",params.params.x, params.params.y);
      this.window.setPosition(params.params.x, params.params.y);

      /*
      this.window.handle.addEvent('mouseover', function(){
	 this.ttchain = new Chain();
	 var showTip = function () {
	    this.showToolTip(true);
	 }.bind(this);
	 this.ttchain.chain(showTip);
	 this.ttchain.callChain.delay(500, this.ttchain);
      }.bind(this));
      this.window.handle.addEvent('mouseout', function(){
         if(typeof(this.ttchain) === 'undefined') {
	    this.showToolTip(false);
	 } else {
	    this.ttchain.clearChain();
	    this.showToolTip(false);
	 }
      }.bind(this));

      this.setToolTip(this.toolTipText);
      */

      this.clchsrCanvas;
      this.colRange = {min:0, max:255};
      this.alphaRange = {min:0, max:100};
      this.redValDiv;
      this.greenValDiv;
      this.blueValDiv;
      this.alphaValDiv;
      this.colPatchDiv;

      this.createElements();

      this.colChooserBuilt = true;
   },

   //---------------------------------------------------------------
   createElements: function () {

      var win;
      var topEdge;
      var spacer;
      var ctxt;
      var clchsrDiv;
      var clchsrImg;
      var clchsrCanvasCtxt;
      var clchsrRedDiv;
      var clchsrGreenDiv;
      var clchsrBlueDiv;
      var clchsrAlphaDiv;
      var redControlDiv;
      var redLabelDiv;
      var greenControlDiv;
      var greenLabelDiv;
      var blueControlDiv;
      var blueLabelDiv;
      var alphaControlDiv;
      var alphaLabelDiv;

      //.................................................
      win = $(this.shortName + '-win');
      topEdge = $(this.shortName + '-topedge');


      //----------------------------------------
      // the container for all the bits
      //----------------------------------------
      clchsrDiv = document.createElement('div');
      clchsrDiv.setAttribute('id', 'clchsrDiv');

      //console.log(win);
      //console.log(clchsrDiv);

      //win.appendChild(clchsrDiv);
      clchsrDiv.inject(win, 'inside');

      //.................................................
      // text for top edge of tool
      //.................................................
      this.titleTextContainer = new Element('div', {
         'class': 'colChoose'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'colChoose topEdgeText'
      });
      this.titleTextDiv.set('text', 'colour:');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside');
      this.titleTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the canvas for the colour sphere
      //----------------------------------------
      this.clchsrCanvas = document.createElement('canvas');
      this.clchsrCanvas.setAttribute('id', 'clchsrCanvas');
      this.clchsrCanvas.setAttribute('width', '150px');
      this.clchsrCanvas.setAttribute('height', '150px');

      //console.log(this.clchsrCanvas);
      //clchsrDiv.appendChild(this.clchsrCanvas);
      this.clchsrCanvas.inject(clchsrDiv, 'inside');

      ctxt = this.clchsrCanvas.getContext('2d');
      //console.log("ctxt ",ctxt);
      emouseatlas.emap.utilities.addEvent(this.clchsrCanvas, 'mouseup', function(e) {
	 this.doMouseUpColChooser(e);
      }.bind(this), false);

      //----------------------------------------
      // the colour sphere image
      //----------------------------------------
      clchsrImg = new Image();
      clchsrImg.src = this.imagePath + 'colourSphere150.png';
      clchsrImg.onload = function(){
         ctxt.drawImage(clchsrImg,0,0);
      }

      //---------------------------------------------------------------------
      //----------------------------------------
      // the red control container
      //----------------------------------------
      redControlDiv = new Element('div', {
	 'id': 'clchsrRDiv',
	 'class':'colChoose control'
      });

      redControlDiv.inject(clchsrDiv, 'inside');

      //----------------------------------------
      // the label & val for red control
      //----------------------------------------
      redLabelDiv = new Element('div', {
	 'id': 'clchsrRLabelDiv',
	 'class':'colChoose label'
      });

      redLabelDiv.inject(redControlDiv, 'inside');
      redLabelDiv.set('text', 'R');

      //----------------------------------------
      // the slider for red control
      //----------------------------------------
      this.redSlider = new SliderComponent({
                                             initiator: this,
                                             targetId:'clchsrRDiv',
                                             model:this.model,
                                             view:this.view,
                                             sliderLength: this.sliderLength,
                                             isHorizontal: this.isHorizontal,
					     cursorColour: "red",
                                             type:"ccRed",
					     float:'left',
                                             range: {min:this.colRange.min, max:this.colRange.max}
					   });

      //----------------------------------------
      // the val for red control
      //----------------------------------------
      this.redValDiv = new Element('div', {
         "type": "text",
         "id": "redValDiv",
         "name": "redValDiv",
         "class": "colChoose val"
      });

      this.redValDiv.inject(redControlDiv, 'inside');
      this.redValDiv.set('text', '-');

      //---------------------------------------------------------------------
      //----------------------------------------
      // the green control container
      //----------------------------------------
      greenControlDiv = new Element('div', {
	 'id': 'clchsrGDiv',
	 'class':'colChoose control'
      });

      greenControlDiv.inject(clchsrDiv, 'inside');

      //----------------------------------------
      // the label & val for green control
      //----------------------------------------
      greenLabelDiv = new Element('div', {
	 'id': 'clchsrRLabelDiv',
	 'class':'colChoose label'
      });

      greenLabelDiv.inject(greenControlDiv, 'inside');
      greenLabelDiv.set('text', 'G');

      //----------------------------------------
      // the slider for green control
      //----------------------------------------
      this.greenSlider = new SliderComponent({
                                             initiator: this,
                                             targetId:'clchsrGDiv',
                                             model:this.model,
                                             view:this.view,
                                             sliderLength: this.sliderLength,
                                             isHorizontal: this.isHorizontal,
					     cursorColour: "green",
                                             type:"ccGreen",
					     float:'left',
                                             range: {min:this.colRange.min, max:this.colRange.max}
					   });

      //----------------------------------------
      // the val for green control
      //----------------------------------------
      this.greenValDiv = new Element('div', {
         "type": "range",
         "id": "greenValDiv",
         "name": "greenValDiv",
         "class": "colChoose val"
      });

      this.greenValDiv.inject(greenControlDiv, 'inside');
      this.greenValDiv.set('text', '-');

      //---------------------------------------------------------------------
      //----------------------------------------
      // the blue control container
      //----------------------------------------
      blueControlDiv = new Element('div', {
	 'id': 'clchsrBDiv',
	 'class':'colChoose control'
      });

      blueControlDiv.inject(clchsrDiv, 'inside');

      //----------------------------------------
      // the label & val for blue control
      //----------------------------------------
      blueLabelDiv = new Element('div', {
	 'id': 'clchsrRLabelDiv',
	 'class':'colChoose label'
      });

      blueLabelDiv.inject(blueControlDiv, 'inside');
      blueLabelDiv.set('text', 'B');

      //----------------------------------------
      // the slider for blue control
      //----------------------------------------
      this.blueSlider = new SliderComponent({
                                             initiator: this,
                                             targetId:'clchsrBDiv',
                                             model:this.model,
                                             view:this.view,
                                             sliderLength: this.sliderLength,
                                             isHorizontal: this.isHorizontal,
                                             cursorColour: "blue",
                                             type:"ccBlue",
					     float:'left',
                                             range: {min:this.colRange.min, max:this.colRange.max}
					   });

      //----------------------------------------
      // the val for blue control
      //----------------------------------------
      this.blueValDiv = new Element('div', {
         "type": "range",
         "id": "blueValDiv",
         "name": "blueValDiv",
         "class": "colChoose val"
      });

      this.blueValDiv.inject(blueControlDiv, 'inside');
      this.blueValDiv.set('text', '-');

      //---------------------------------------------------------------------
      //----------------------------------------
      // the alpha control container
      //----------------------------------------
      alphaControlDiv = new Element('div', {
	 'id': 'clchsrADiv',
	 'class':'colChoose control'
      });

      alphaControlDiv.inject(clchsrDiv, 'inside');

      //----------------------------------------
      // the label & val for alpha control
      //----------------------------------------
      alphaLabelDiv = new Element('div', {
	 'id': 'clchsrRLabelDiv',
	 'class':'colChoose label'
      });

      alphaLabelDiv.inject(alphaControlDiv, 'inside');
      alphaLabelDiv.set('text', 'A');

      //----------------------------------------
      // the slider for alpha control
      //----------------------------------------
      this.alphaSlider = new SliderComponent({
                                             initiator: this,
                                             targetId:'clchsrADiv',
                                             model:this.model,
                                             view:this.view,
                                             sliderLength: this.sliderLength,
                                             isHorizontal: this.isHorizontal,
                                             cursorColour: "alpha",
                                             type:"ccAlpha",
					     float:'left',
                                             range: {min:this.alphaRange.min, max:this.alphaRange.max}
					   });

      //----------------------------------------
      // the val for alpha control
      //----------------------------------------
      this.alphaValDiv = new Element('div', {
         "type": "range",
         "id": "alphaValDiv",
         "name": "alphaValDiv",
         "class": "colChoose val"
      });

      this.alphaValDiv.inject(alphaControlDiv, 'inside');
      this.alphaValDiv.set('text', '75');

      //---------------------------------------------------------------------

      //----------------------------------------
      // the colour patch
      //----------------------------------------
      this.colPatchDiv = new Element('div', {
	 'id': 'clchsrPatchDiv',
	 'class':'colChoose patch'
      });

      this.colPatchDiv.inject(clchsrDiv, 'inside');

      //------------------------------------------------------------------
      //console.log("finished creating x3d elements");

      return false;

   }, // createElements

   //---------------------------------------------------------------
   setColFromSliders: function() {

      var red;
      var green;
      var blue;
      var alpha;
      var hex;
      
      red = (this.redValDiv) ? this.redValDiv.get('text') : 255;
      green = (this.greenValDiv) ? this.greenValDiv.get('text') : 255;
      blue = (this.blueValDiv) ? this.blueValDiv.get('text') : 255;
      alpha = (this.alphaValDiv) ? this.alphaValDiv.get('text') : 1;

      //this.currentCol = {red:parseInt(red), green:parseInt(green), blue:parseInt(blue), alpha:parseFloat(alpha)};
      //console.log("current colour ",this.currentCol);

      if(this.colPatchDiv) {
	 this.colPatchDiv.setStyles({
	    background: 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')'
	 });
      }

      hex = emouseatlas.emap.utilities.RGBtoHex(red,green,blue);
      this.titleTextDiv.set('text', 'colour: ' + hex);

      //console.log("setColFromSliders: this.fromCanvas ",this.fromCanvas);
      if(this.colChooserBuilt && this.slidersInitialised && !this.fromCanvas) {
         this.view.colourChange("slider");
      }

   }, // setColFromSliders

   //---------------------------------------------------------------
   doStepChanged: function(step, type) {

      //console.log("colChooser: %s doStepChanged: type %s, step %d",this.shortName,type,step);
      var hue;
      var alpha;

      if(type === "ccRed") {
         hue = this.getHueFromStep(step);
	 this.redValDiv.set('text', hue);
         //console.log("red, hue ",hue);
      }

      if(type === "ccGreen") {
         hue = this.getHueFromStep(step);
	 this.greenValDiv.set('text', hue);
         //console.log("green, hue ",hue);
      }

      if(type === "ccBlue") {
         hue = this.getHueFromStep(step);
	 this.blueValDiv.set('text', hue);
         //console.log("blue, hue ",hue);
      }

      if(type === "ccAlpha") {
         alpha = this.getAlphaFromStep(step);
	 this.alphaValDiv.set('text', alpha);
         //console.log("alpha ",alpha);
      }

      this.setColFromSliders();

   }, // doStepChanged

   //---------------------------------------------------------------
   doSliderCompleted: function(step,type) {

      //console.log("%s: doSliderCompleted: %d",type,step);
      this.setColFromSliders();

   }, // doSliderCompleted

   //---------------------------------------------------------------
   // Catch mouseUp events from the colChooser slider
   //---------------------------------------------------------------
   doMouseUpSlider: function(type) {

      //console.log(type);
      return;

   }, // doMouseUpSlider

   //---------------------------------------------------------------
   // opacity ranges from 0 to 1.0
   getAlphaFromStep: function(step) {
      var range = this.alphaRange.max - this.alphaRange.min;
      return (step / range);
   },

   //---------------------------------------------------------------
   // colour value ranges from 0 to 255
   getHueFromStep: function(step) {
      var cursorW = this.redSlider.getCursorWidth(); // all the filters will have same width cursor & range
      var range = (this.colRange.max - cursorW) - this.colRange.min;
      var val =  Math.round((step / range) * 255);
      //console.log("getFilterValueFromStep: range %d, val %d",range,val);

      return val;
   },

   //---------------------------------------------------------------
   doMouseUpColChooser: function(e) {

      var win;
      var pos;
      var mx;
      var my;
      var col = {};
      var alphStep;
      var alph;
      var hex;

      this.fromCanvas = true;

      win = $(this.shortName + '-win');
      pos = emouseatlas.emap.utilities.getElementPosition(win);

      mx = e.clientX - pos.x;
      my = e.clientY - pos.y;

      col = this.getColFromCanvas(mx, my);

      alphStep = this.alphaSlider.getStep();
      alph = parseFloat(alphStep / 100);

      //....................
      this.redSlider.setUserChange(false);
      this.redSlider.setStep(col.R);
      this.redValDiv.set('text', col.R);
      this.redSlider.setUserChange(true);
      //....................
      this.greenSlider.setUserChange(false);
      this.greenSlider.setStep(col.G);
      this.greenValDiv.set('text', col.G);
      this.greenSlider.setUserChange(true);
      //....................
      this.blueSlider.setUserChange(false);
      this.blueSlider.setStep(col.B);
      this.blueValDiv.set('text', col.B);
      this.blueSlider.setUserChange(true);
      //....................
      if(this.colPatchDiv) {
	 this.colPatchDiv.setStyles({
	    background: 'rgba(' + col.R + ', ' + col.G + ', ' + col.B + ', ' + alph + ')'
	 });
      }

      hex = emouseatlas.emap.utilities.RGBtoHex(col.R,col.G,col.B);
      this.titleTextDiv.set('text', 'colour: ' + hex);

      if(this.colChooserBuilt) {
         this.view.colourChange("sphere");
         this.fromCanvas = false;
      }

   }, // doMouseUpColChooser:

   //---------------------------------------------------------------
   getColFromCanvas: function(x, y) {

      //console.log("getColFromCanvas:");
      var canvas;
      var ctxt;
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

      canvas = $('clchsrCanvas');
      width = canvas.width;
      height = canvas.height;

      ctxt = this.clchsrCanvas.getContext('2d');
      imgData = ctxt.getImageData(0,0,width,height);

      data = imgData.data;

      indx = y*width*4 + x*4;
      red = data[indx]; 
      green = data[parseInt(indx + 1*1)]; 
      blue = data[parseInt(indx + 2)]; 

      col = {R:red, G:green, B:blue};

      return col;

   }, // getColFromCanvas:

   //---------------------------------------------------------------
   getRGBA: function() {

      var red;
      var green;
      var blue;
      var alpha;
      var hex;
      var col;
      
      if(!this.alphaValDiv) {
         return undefined;
      }

      red = this.redValDiv.get('text');
      green = this.greenValDiv.get('text');
      blue = this.blueValDiv.get('text');
      alpha = this.alphaValDiv.get('text');

      col = {red:parseInt(red), green:parseInt(green), blue:parseInt(blue), alpha:parseFloat(alpha)};

      return col;

   }, // getRGBA

   //---------------------------------------------------------------
   setRGBA: function(col) {

      var red;
      var green;
      var blue;
      var alpha;

      //console.log("setRGBA: ",col);
      
      if(!this.alphaValDiv) {
         return;
      }

      red = parseInt(col.r);
      green = parseInt(col.g);
      blue = parseInt(col.b);
      alpha = parseFloat(col.a);

      this.redSlider.setUserChange(false);
      this.greenSlider.setUserChange(false);
      this.blueSlider.setUserChange(false);
      this.alphaSlider.setUserChange(false);
      //....................
      this.redSlider.setStep(red);
      this.redValDiv.set('text', red);
      //....................
      this.greenSlider.setStep(green);
      this.greenValDiv.set('text', green);
      //....................
      this.blueSlider.setStep(blue);
      this.blueValDiv.set('text', blue);
      //....................
      this.alphaSlider.setStep(alpha*100);
      this.alphaValDiv.set('text', alpha);

      if(this.colPatchDiv) {
         //console.log("****setRGBA: this.colPatchDiv ",this.colPatchDiv);
	 //this.colPatchDiv.setStyles({
	    //background: 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')'
	 //});
	 this.colPatchDiv.setStyles({
	    background: 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')'
	 });
      }

      hex = emouseatlas.emap.utilities.RGBtoHex(red,green,blue);
      this.titleTextDiv.set('text', 'colour: ' + hex);

      this.redSlider.setUserChange(true);
      this.greenSlider.setUserChange(true);
      this.blueSlider.setUserChange(true);
      this.alphaSlider.setUserChange(true);

      return false;

   }, // setRGBA

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges, from) {

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("colChooser viewUpdate:");
      var step = 0;

      // do the setting up stuff
      if(viewChanges.initial === true) {
	 this.showColChooser(false);
	 this.window.setDimensions(this.width,this.height);
	 //....................
         this.redSlider.setUserChange(false);
         this.redSlider.setStep(step);
         this.redValDiv.set('text', step);
         this.redSlider.setUserChange(true);
	 //....................
         this.greenSlider.setUserChange(false);
         this.greenSlider.setStep(step);
         this.greenValDiv.set('text', step);
         this.greenSlider.setUserChange(true);
	 //....................
         this.blueSlider.setUserChange(false);
         this.blueSlider.setStep(step);
         this.blueValDiv.set('text', step);
         this.blueSlider.setUserChange(true);
	 //....................
	 step = 100;
         this.alphaSlider.setUserChange(false);
         this.alphaSlider.setStep(step);
         this.alphaValDiv.set('text', "1");
         this.alphaSlider.setUserChange(true);
	 //....................
	 this.slidersInitialised = true;
      } // viewChanges.initial
      
   }, // viewUpdate

   //---------------------------------------------------------------
   showColChooser: function(show) {
      this.window.setVisible(show);
   }, // showColChooser:

   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.showColChooser(false);
   },

   //--------------------------------------------------------------
   setToolTip: function (text) {

      //console.log("%s setToolTip",this.shortName);
      // we only want 1 toolTip
      if(typeof(this.toolTip === 'undefined')) {
	 this.toolTip = new Element('div', {
	       'id': this.shortName + '-toolTipContainer',
	       'class': 'toolTipContainer'
	       });
	 //this.toolTip.inject($(this.targetId), 'inside');
	 this.toolTip.inject($(this.targetId).parentNode, 'inside');
      }
      $(this.shortName + '-toolTipContainer').set('text', this.toolTipText);
   },

   //--------------------------------------------------------------
   showToolTip: function (show) {

      var containerPos = this.view.getToolContainerPos();
      var left;
      var top;
      left = $(this.shortName + '-container').getPosition().x;
      top = $(this.shortName + '-container').getPosition().y;
      if(show === true) {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'visible'});
      } else {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'hidden'});
      }
   },

   //---------------------------------------------------------------
   doCollapsed: function() {
      //console.log("%s doCollapsed:",this.name);
      this.isCollapsed = true;
      var left = $(this.shortName + '-container').getPosition().x + 45;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   doExpanded: function() {
      //console.log("%s doExpanded:",this.name);
      this.isCollapsed = false;
      var left = $(this.shortName + '-container').getPosition().x + this.navwidth + 10;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   getName: function() {
      return "colChooser";
   }

}); // end of class colChooser
//----------------------------------------------------------------------------
