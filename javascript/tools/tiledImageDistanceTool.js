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
//   tiledImageDistanceTool.js
//   Tool to adjust Distance in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageDistanceTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageDistanceTool = new Class ({
var tiledImageDistanceTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageDistanceTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      //this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;
      this.isHorizontal = (params.isHorizontal === undefined) ? true : params.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "true") ? true : this.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "false") ? false : this.isHorizontal;

      this.name = "DistanceTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      var imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         title:this.name,
					 view:this.view,
					 imagePath: imagePath,
					 initiator:this});

      this.window.setPosition(params.params.x, params.params.y);

      // for tooltips
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

      var leftarr = imagePath + "leftArrow_10.png";
      var rightarr = imagePath + "rightArrow_10.png";

      //----------------------------------------
      // containers for the slider & up/down arrows
      //----------------------------------------
      this.dstSliderDiv = new Element('div', {
         'id': 'dstSliderDiv',
         'class': 'sliderDiv_rotation'
      });
      this.dstArrowsDiv = new Element( 'div', {
	 'id': 'dstArrowsDiv',
	 'class': 'distanceArrows',
	 'styles': {
	    'left' : this.width - 30
	 }
      });

      //.................................................
      var win = $(this.shortName + '-win');
      var topEdge = $(this.shortName + '-topedge');

      //--------------------------------------------------------------------------
      var sliderLength = (this.isHorizontal) ? this.width - 30 : this.height - 30;
      //var sliderLength = (this.isHorizontal) ? this.width - 2 : this.height - 2;

      var mdst = this.model.getDistance();
      //console.log("distance tool: dst = ",mdst);
      //----------------------------------------
      // the slider for distance
      //----------------------------------------

      //--------------------------------------------------------------------------
      var sliderTarget = this.shortName + '-win';
      //console.log("dst tool, sliderTarget %s",sliderTarget);

      //--------------------------------------------------------------------------
      this.slider = new SliderComponent({initiator: this,
                                        targetId:sliderTarget,
					model:this.model,
                                        view:this.view,
					sliderLength: sliderLength, 
					isHorizontal: this.isHorizontal,
					type:"dst",
					range: {min:mdst.min, max:mdst.max}});

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.sliderTextDiv.set('text', 'distance: -');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the up/down arrows for distance
      //----------------------------------------
      this.dstIncDiv = new Element( 'div', {
	 'class': 'incDiv'
      });
      this.dstIncImg = new Element( 'img', {
	 'class': 'incImg',
	 'src': rightarr
      });

      this.dstIncImg.inject(this.dstIncDiv, 'inside');
      this.dstIncImg.addEvent('mousedown', function() {
         this.doIncDst();
      }.bind(this));
      this.dstIncImg.addEvent('mouseup', function() {
         this.doMouseUpArrow('dst');
      }.bind(this));

      this.dstDecDiv = new Element( 'div', {
	 'class': 'decDiv'
      });
      this.dstDecImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': leftarr
      });

      this.dstDecImg.inject(this.dstDecDiv, 'inside');
      this.dstDecImg.addEvent('mousedown', function() {
         this.doDecDst();
      }.bind(this));
      this.dstDecImg.addEvent('mouseup', function() {
         this.doMouseUpArrow('dst');
      }.bind(this));

      this.dstIncDiv.inject(this.dstArrowsDiv, 'inside');
      this.dstDecDiv.inject(this.dstArrowsDiv, 'inside');
      this.dstArrowsDiv.inject($('dst_sliderContainer'), 'inside');
      //-------------------------------------------

      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

      if(this.model.modelReady()) {
         //console.log("dst: initialize modelReady");
	 var mdst = this.model.getDistance();
	 var step = parseInt(mdst.cur);
	 this.slider.setUserChange(false);
	 this.slider.setStep(step);
	 this.sliderTextDiv.set('text', 'dst: ' + step);
	 this.slider.setUserChange(true);
      }

      this.layerNames = [];

   }, // initialize

   //---------------------------------------------------------------
   getSampleRate: function() {

      /*
      var resData;
      var sampleRate = 1;

      resData = this.view.getResolutionData();
      if(resData) {
         if(resData.sampleRate) {
	    sampleRate = resData.sampleRate;
	 }
      }

      return sampleRate;
      */

      return 1.0;

   }, // getSampleRate

   //---------------------------------------------------------------
   // Called on mousedown on inc arrow button
   //---------------------------------------------------------------
   doIncDst: function() {

      //console.log("doIncDst");
      var rate = this.getSampleRate();
      var delta = (rate === undefined) ? 1*1 : rate;
      
      this.model.setDistance(1* this.model.getDistance().cur + delta);
      this.updateSlider('dstTool');

   }, // doIncDst

   //---------------------------------------------------------------
   // Called on mousedown on dec arrow button
   //---------------------------------------------------------------
   doDecDst: function() {

      //console.log("doDecDst");
      var rate = this.getSampleRate();
      var delta = (rate === undefined) ? 1*1 : rate;
      
      this.model.setDistance(1* this.model.getDistance().cur - delta);
      this.updateSlider('dstTool');

   }, // doDecDst

   //---------------------------------------------------------------
   // Called on mouseup on an arrow button
   //---------------------------------------------------------------
   doMouseUpArrow: function(type) {

      //console.log("doMouseUpArrow %s",type);

   }, // doMouseUpArrow

   //---------------------------------------------------------------
   doStepChanged: function(step, type) {

      //console.log("distance: doStepChanged: step %s, type %s",step, type);
      if(type.toLowerCase() === "dst") {
         this.model.modifyDistance(step, 'dstTool');
         this.updateSlider('dstTool');
      }

      return false;

   }, // doStepChanged

   //---------------------------------------------------------------
   doSliderCompleted: function(step) {
      //console.log("doSliderCompleted");
   }, // doSliderCompleted
   
   //---------------------------------------------------------------
   // Catch mouseUp events from the tiledImageDistanceTool slider
   //---------------------------------------------------------------
   doMouseUpSlider: function(type) {

      //console.log(type);
      if(type === 'dst') {
         this.model.setDistance(1* this.model.getDistance().cur);
      }

      return;

   }, // doMouseUpSlider

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      if(modelChanges.initial) {
         //console.log("dst: modelUpdate.initial");
	 var mdst = this.model.getDistance();
	 var step = parseInt(mdst.cur);
	 //this.slider.setUserChange(false);
	 this.slider.setPosition(step);
	 this.sliderTextDiv.set('text', 'dst: ' + step);
	 //this.slider.setUserChange(true);
      }

      if(modelChanges.locator) {
	 this.updateSlider("modelUpdate");
      }

      if(modelChanges.distanceRange ||
         modelChanges.setSection) {

         //console.log("Dst.modelUpdate: modelChanges.distanceRange || modelChanges.setSection");
	 var mdst = this.model.getDistance();
	 var step = parseInt(mdst.cur);
	 this.slider.setNewRange({max:mdst.max, min:mdst.min});
	 //this.slider.setUserChange(false);
	 this.slider.setStep(step);
	 this.sliderTextDiv.set('text', 'dst: ' + step);
	 //this.slider.setUserChange(true);
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      if(viewChanges.initial) {
	 this.window.setVisible(true);
      }

      if(viewChanges.toolbox) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }

   },

   //---------------------------------------------------------------
   updateSlider: function(from) {

      //console.log("dst: updateSlider from %s",from);

      if(from === 'dstTool' || from === 'modelUpdate') {
	 //console.log("dst: updateSlider %s",from);
	 var mdst = this.model.getDistance();
	 this.slider.setUserChange(false);
	 this.slider.setStep(mdst.cur);
	 this.sliderTextDiv.set('text', 'dst: ' + mdst.cur);
	 this.slider.setUserChange(true);
      }
   },

   //---------------------------------------------------------------
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
