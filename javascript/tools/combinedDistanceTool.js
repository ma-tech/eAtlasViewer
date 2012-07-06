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
//   combinedDistanceTool.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// combinedDistanceTool
//---------------------------------------------------------
var combinedDistanceTool = new Class ({

   initialize: function(params) {

      this.view = params.view;
      this.model = params.model;

      //this.model.register(this);
      //this.view.register(this);

      this.isHorizontal = (params.isHorizontal === undefined) ? true : params.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "true") ? true : this.isHorizontal;
      this.isHorizontal = (this.isHorizontal === "false") ? false : this.isHorizontal;

      this.name = "CombinedDistanceTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;
      this.borders = params.params.borders;
      this.transparent = params.params.transparent;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
					 transparent:this.transparent,
					 borders:this.borders,
					 toBottom: false,
                                         title:this.name,
					 view:this.view,
					 imagePath: this.imagePath,
					 initiator:this});

      this.window.setDimensions(this.width, this.height);
      this.window.setPosition(params.params.x, params.params.y);

      /*
      //this.setToolTip(this.toolTipText);

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
      */

      this.createElements_forSectionTool();
      this.createElements_forKeySectionTool();

      this.keySectionArr = undefined;

      this.model.register(this);
      this.view.register(this);

   }, // initialize

   //---------------------------------------------------------------
   createElements_forSectionTool: function () {

      var leftarr = this.imagePath + "leftArrow_10.png";
      var rightarr = this.imagePath + "rightArrow_10.png";

      //----------------------------------------
      // containers for the slider & up/down arrows
      //----------------------------------------
      this.dstSliderDiv = new Element('div', {
         'id': 'dstSliderDiv',
         'class': 'sliderDiv_rotation'
      });
      this.dstArrowsDiv = new Element( 'div', {
	 'id': 'dstArrowsDiv',
	 'class': 'arrowsDiv',
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
      this.sliderTextDiv.set('text', 'section: -');

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

      return false;
   }, // createElements_forSectionTool

   //---------------------------------------------------------------
   createElements_forKeySectionTool: function () {

      var win = $(this.shortName + '-win');

      var firstImgSrc = this.imagePath + "firstIcon_10x12.png";
      var lastImgSrc = this.imagePath + "lastIcon_10x12.png";
      var prevImgSrc = this.imagePath + "prevIcon_10x12.png";
      var nextImgSrc = this.imagePath + "nextIcon_10x12.png";

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      this.buttonContainer = new Element('div', {
	 'id': 'keySectionButtonContainer'
      });

      this.firstButton = new Element('div', {
         'id': 'keySectionFirstButton',
	 'class': 'keySectionButton first'
      });
      this.firstImgDiv = new Element( 'div', {
	 'id': 'firstImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      this.firstImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': firstImgSrc
      });
      //this.firstButton.appendText('<<');

      this.lastButton = new Element('div', {
         'id': 'keySectionLastButton',
	 'class': 'keySectionButton last'
      });
      this.lastImgDiv = new Element( 'div', {
	 'id': 'lastImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      this.lastImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': lastImgSrc
      });
      //this.lastButton.appendText('>>');

      this.prevButton = new Element('div', {
         'id': 'keySectionPrevButton',
	 'class': 'keySectionButton prev'
      });
      this.prevImgDiv = new Element( 'div', {
	 'id': 'prevImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      this.prevImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': prevImgSrc
      });
      //this.prevButton.appendText('<');

      this.nextButton = new Element('div', {
         'id': 'keySectionNextButton',
	 'class': 'keySectionButton next'
      });
      this.nextImgDiv = new Element( 'div', {
	 'id': 'nextImgDiv',
	 'class': 'keySectionButtonDiv'
      });
      this.nextImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': nextImgSrc
      });
      //this.nextButton.appendText('>');

      //----------------------------------------
      // button description
      //----------------------------------------
      this.keySectionTextContainer = new Element('div', {
         'id': 'keySectionTextContainer'
      });

      this.keySectionTextSpacer = new Element('div', {
         'id': 'keySectionTextSpacer'
      });

      this.keySectionTextDiv = new Element('div', {
         'id': 'keySectionText'
      });
      this.keySectionTextDiv.set('text', 'key sections');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      this.buttonContainer.inject(win, 'inside');
      this.firstButton.inject(this.buttonContainer, 'inside');
      this.prevButton.inject(this.buttonContainer, 'inside');

      this.keySectionTextDiv.inject(this.keySectionTextContainer, 'inside', 'inside');
      //this.keySectionTextSpacer.inject(this.buttonContainer, 'inside', 'inside');
      this.keySectionTextContainer.inject(this.buttonContainer, 'inside', 'inside');

      this.nextButton.inject(this.buttonContainer, 'inside');
      this.lastButton.inject(this.buttonContainer, 'inside');

      this.firstImg.inject(this.firstImgDiv, 'inside');
      this.firstImgDiv.inject(this.firstButton, 'inside');

      this.lastImg.inject(this.lastImgDiv, 'inside');
      this.lastImgDiv.inject(this.lastButton, 'inside');
      
      this.nextImg.inject(this.nextImgDiv, 'inside');
      this.nextImgDiv.inject(this.nextButton, 'inside');

      this.prevImg.inject(this.prevImgDiv, 'inside');
      this.prevImgDiv.inject(this.prevButton, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('keySectionFirstButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionLastButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionPrevButton');
      emouseatlas.emap.utilities.addButtonStyle('keySectionNextButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      this.firstButton.addEvent('click',function() {
	 this.doFirstKeySection();
      }.bind(this));

      this.lastButton.addEvent('click',function() {
	 this.doLastKeySection();
      }.bind(this));

      this.prevButton.addEvent('click',function() {
	 this.doPrevKeySection();
      }.bind(this));

      this.nextButton.addEvent('click',function() {
	 this.doNextKeySection();
      }.bind(this));

      return false;
   }, // createElements_forKeySectionTool

   //---------------------------------------------------------------
   modelUpdate: function (modelChanges) {

      if(modelChanges.initial) {
         //console.log("dst: modelUpdate.initial");
	 var mdst = this.model.getDistance();
	 var step = parseInt(mdst.cur);
	 //this.slider.setUserChange(false);
	 this.slider.setPosition(step);
	 this.sliderTextDiv.set('text', 'section: ' + step);
	 //this.slider.setUserChange(true);
      }

      if(modelChanges.locator) {
	 this.updateSlider("modelUpdate");
      }

/*
      if(modelChanges.dst) {
         console.log("Dst.modelUpdate: modelChanges.dst");
	 var mdst = this.model.getDistance();
	 this.sliderTextDiv.set('text', 'dst: ' + mdst.cur);
      }
*/

      if(modelChanges.distanceRange ||
         modelChanges.setSection) {

         //console.log("Dst.modelUpdate: modelChanges.distanceRange || modelChanges.setSection");
	 var mdst = this.model.getDistance();
	 var step = parseInt(mdst.cur);
	 this.slider.setNewRange({max:mdst.max, min:mdst.min});
	 //this.slider.setUserChange(false);
	 this.slider.setStep(step);
	 this.sliderTextDiv.set('text', 'section: ' + step);
	 //this.slider.setUserChange(true);
      }

   },

   //---------------------------------------------------------------
   viewUpdate: function (viewChanges) {

      if(viewChanges.initial === true) {
	 this.window.setVisible(true);
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   },

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
   doFirstKeySection: function () {

      //console.log("doFirstKeySection:");
      if(this.keySectionArr === undefined) {
         this.keySectionArr = this.model.getKeySectionArr();
      }

      if(this.keySectionArr === null || this.keySectionArr === undefined || this.keySectionArr.length <= 0) {
         return false;
      }

      //dist = this.model.getDistance();
      this.model.setDistance(this.keySectionArr[0]);
   },

   //---------------------------------------------------------------
   doLastKeySection: function () {

      var len;
      //console.log("doLastKeySection:");
      if(this.keySectionArr === undefined) {
         this.keySectionArr = this.model.getKeySectionArr();
      }
      //console.log(this.keySectionArr);

      if(this.keySectionArr === null || this.keySectionArr === undefined || this.keySectionArr.length <= 0) {
         return false;
      }

      len = this.keySectionArr.length;
      this.model.setDistance(this.keySectionArr[len-1]);
   },

   //---------------------------------------------------------------
   doPrevKeySection: function () {

      var dist;
      var len;
      var i;

      //console.log("doPrevKeySection:");
      if(this.keySectionArr === undefined) {
         this.keySectionArr = this.model.getKeySectionArr();
      }

      if(this.keySectionArr === null || this.keySectionArr === undefined || this.keySectionArr.length <= 0) {
         return false;
      }

      //console.log(this.keySectionArr);

      len = this.keySectionArr.length - 1;
      dist = this.model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=len; i>-1; i--) {
         val = this.keySectionArr[i];
	 //console.log("val %d",val);
         if(val < dist.cur) {
	    this.model.setDistance(val);
	    return;
	 }
      }
   },

   //---------------------------------------------------------------
   doNextKeySection: function () {
      
      var dist;
      var len;
      var val;
      var i;

      //console.log("doNextKeySection:");
      if(this.keySectionArr === undefined) {
         this.keySectionArr = this.model.getKeySectionArr();
      }

      //console.log(this.keySectionArr.reverse());

      len = this.keySectionArr.length;
      dist = this.model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=0; i<len; i++) {
	 //console.log("val %d",val);
         val = this.keySectionArr[i];
         if(val > dist.cur) {
	    this.model.setDistance(val);
	    return;
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
	 this.sliderTextDiv.set('text', 'section: ' + mdst.cur);
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
   }

});
