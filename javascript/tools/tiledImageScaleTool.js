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
//   tiledImageScaleTool.js
//   Tool to adjust scale in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageScaleTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageScaleTool = new Class ({
var tiledImageScaleTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageScaleTool.initialize: ");
      this.model = params.model;
      this.view = params.view;

      this.view.register(this);

      this.isHorizontal = (params.isHorizontal === undefined) ? true : params.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "true") ? true : this.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "false") ? false : this.isHorizontal;
      var mode = (this.isHorizontal) ? "horizontal" : "vertical";

      this.isWlz = this.model.isWlzData();

      this.name = "ScaleTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;

      var imagePath = this.model.getInterfaceImageDir();
      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         title:this.name,
					 view:this.view,
					 imagePath: imagePath,
					 initiator:this});
      this.window.setPosition(params.params.x, params.params.y);

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

      this.imageRoot = 'images/';

      var sliderLength = (this.isHorizontal) ? this.width : this.height;

      this.slider = new SliderComponent({
                                           initiator: this,
					   targetId:this.shortName + '-win',
					   model:this.model,
					   view:this.view,
					   sliderLength: sliderLength, 
					   mode: mode
					});

      this.sliderRange = this.slider.getSliderRange();
      //console.log("this.sliderRange ",this.sliderRange);

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });

      var topEdge = $(this.shortName + '-topedge');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(topEdge, 'inside');

      this.slider.setUserChange(false);
      var curstep = this.getStepFromScale();
      this.slider.setStep(curstep);
      this.slider.setUserChange(true);

      this.window.setDimensions(params.params.width, params.params.height);
      this.setToolTip(this.toolTipText);
      //console.log("exit tiledImageScaleTool.initialize");

   }, // initialize

   //---------------------------------------------------------------
   doStepChanged: function(step) {

      //console.log("scale: doStepChanged: step %s",step);
      if(step === NaN) {
         return false;
      }

      var newscale = this.getScaleFromStep(step);

      this.view.setScale(newscale, 'scaletool');

   }, // doStepChanged

   //---------------------------------------------------------------
   doSliderCompleted: function(step,type) {

   }, // doSliderCompleted

   // this function is required by 'SliderComponent'
   //---------------------------------------------------------------
   doMouseUpSlider: function(type) {
      // no-op
   }, // doMouseUpSlider

   //---------------------------------------------------------------
   getStepFromScale: function() {

      var cur = this.getCurStep();
      var num = this.getNumScaleSteps();
      var interval = (this.sliderRange.max - this.sliderRange.min) / num;
      
      var sliderStep = interval * cur;
      //console.log("interval %d, sliderStep %d",interval,sliderStep);

      return sliderStep;
   },

   //---------------------------------------------------------------
   getScaleFromStep: function(step) {

      var scl = this.view.getScale();
      var log2Max = Math.log(scl.max) / Math.log(2); // should be 0 but you never know
      
      var num = this.getNumScaleSteps();
      var interval = (this.sliderRange.max - this.sliderRange.min) / num;

      var sclStep = Math.round(step / interval);

      var newScale = Math.pow(2, (sclStep - num + log2Max))
      //console.log("log2Max %d, sclStep %d, newScale %d",log2Max,sclStep, newScale);

      return newScale;
   },

   //---------------------------------------------------------------
   getNumScaleSteps: function() {

      var scl = this.view.getScale();
      var scaleMin = scl.min;
      var scaleMax = scl.max;
      var log2Min = Math.log(scaleMin) / Math.log(2);
      var log2Max = Math.log(scaleMax) / Math.log(2);

      //console.log("getNumScaleSteps scaleMax %d, scaleMin %d, log2Max %d, log2Min %d",scaleMax,scaleMin,log2Max,log2Min);
      return (log2Max - log2Min);
   },

   //---------------------------------------------------------------
   getCurStep: function() {

      var scl = this.view.getScale();
      var numSteps = this.getNumScaleSteps();
      var scaleCur = scl.cur;
      var scaleMax = scl.max;
      var log2Cur = Math.log(scaleCur) / Math.log(2);
      var log2Max = Math.log(scaleMax) / Math.log(2);

      var num = (log2Max - log2Cur);
      var curStep = numSteps - num;
      return curStep;
   },

   //---------------------------------------------------------------
   getSclText: function() {

      var cur = this.view.getScale().cur;
      //console.log("getSclText: scaleMax %d",this.view.getScale().max);
      var inv;
      var txt;

      if(cur < 1.0) {
         inv = (1 / cur);
         txt = "1:" + inv;
      } else {
         txt = cur + ":1";
      }
      //console.log("txt %s",txt);
      return txt;
   },

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      var sclTxt;
      var viz;
      var curStep;
      var numSteps;
      var sliderSteps;
      var sliderLength;
      var sliderTitleTxt;

      if(viewChanges.initial === true || viewChanges.scale === true) {
	 sliderLength = parseInt((this.slider.getSliderLength(), 10));
	 //console.log("slider : ",sliderLength);
         //console.log("scale.min %d, scale.max %d",scl.min, scl.max);
	 this.slider.setUserChange(false);
	 sclTxt = this.getSclText();
	 sliderTitleTxt = (sliderLength < 100) ? "magn: " : "magnification: ";
	 this.sliderTextDiv.set('text', sliderTitleTxt + sclTxt);
	 this.slider.setUserChange(true);
	 if (viewChanges.initial === true) {
	   this.window.setVisible(true);
	 }
      }

      if(viewChanges.toolbox === true) {
	viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }

      if(viewChanges.scale === true) {
         curStep = this.getCurStep();
         numSteps = this.getNumScaleSteps();
	 sliderSteps = (100.0 / numSteps) * curStep;
	 this.slider.setUserChange(false);
         this.slider.setStep(sliderSteps);
	 this.slider.setUserChange(true);
      }

   }, // viewUpdate

   //--------------------------------------------------------------
   setToolTip: function (text) {

      //console.log("%s setToolTip",this.shortName);
      // we only want 1 toolTip
      if(typeof(this.toolTip === 'undefined')) {
	 this.toolTip = new Element('div', {
	       'id': this.shortName + '-toolTipContainer',
	       'class': 'toolTipContainer'
	       });
	 this.toolTip.inject($(this.targetId).parentNode, 'inside');
      }
      $(this.shortName + '-toolTipContainer').set('text', this.toolTipText);
   },

   //--------------------------------------------------------------
   showToolTip: function (show) {

      //console.log("%s showToolTip %s: x %s, y %s",this.shortName,show,this.x,this.y);
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
      var left = $(this.shortName + '-container').getPosition().x + this.width + 10;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

});
