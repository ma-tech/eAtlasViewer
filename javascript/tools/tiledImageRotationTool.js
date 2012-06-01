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
//   tiledImageRotationTool.js
//   Tool to adjust Rotation in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageRotationTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageRotationTool = new Class ({
var tiledImageRotationTool = new Class ({


   initialize: function(params) {

      //console.log("enter tiledImageRotationTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.pitchMax = this.model.getThreeDInfo().pitch.max;
      this.pitchMin = this.model.getThreeDInfo().pitch.min;
      this.yawMax = this.model.getThreeDInfo().yaw.max;
      this.yawMin = this.model.getThreeDInfo().yaw.min;
      this.rollMax = this.model.getThreeDInfo().roll.max;
      this.rollMin = this.model.getThreeDInfo().roll.min;
      //console.log("this.pitchMax %d ",this.pitchMax);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "RotationTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);
      //console.log("tiledImageRotationTool: this.height %s",this.height);

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
      var transverse = imagePath + "transverse.png";
      var coronal = imagePath + "coronal.png";
      var sagittal = imagePath + "sagittal.png";

      //----------------------------------------
      // containers for the up/down arrows
      //----------------------------------------
      this.pitchArrowsDiv = new Element( 'div', {
	 'id': 'pitchArrowsDiv',
	 'class': 'arrowsDiv',
	 'styles': {
	    'left' : this.width - 30
	 }
      });

      this.yawArrowsDiv = new Element( 'div', {
	 'id': 'yawArrowsDiv',
	 'class': 'arrowsDiv',
	 'styles': {
	    'left' : this.width - 30
	 }
      });

      this.rollArrowsDiv = new Element( 'div', {
	 'id': 'rollArrowsDiv',
	 'class': 'arrowsDiv',
	 'styles': {
	    'left' : this.width - 30
	 }
      });

      //.................................................
      // to move feedback text away from left edge
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer30'
      });

      var win = $(this.shortName + '-win');
      var topEdge = $(this.shortName + '-topedge');
      //this.spacer.inject(topEdge, 'inside');

      //--------------------------------------------------------------------------
      var sliderLength = (this.isHorizontal) ? this.width - 30 : this.height - 30;
      //----------------------------------------
      // the slider for pitch
      //----------------------------------------
      var pitch = this.model.getThreeDInfo().pitch;
      this.sliderTarget = this.shortName + '-win';
      this.pitchSlider = new SliderComponent({
                                              initiator: this,
                                              targetId: this.sliderTarget,
                                              model:this.model,
                                              view:this.view,
                                              sliderLength: sliderLength, 
                                              isHorizontal: this.isHorizontal,
                                              type:"pitch",
					      cursorCompensation: 2,
                                              range: {min:this.pitchMin, max:this.pitchMax}
					     });

      this.pitchSliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer_rotation'
      });

      this.pitchSliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv_rotation'
      });
      this.pitchSliderTextDiv.set('text', 'p: -');

      this.pitchSliderTextDiv.inject(this.pitchSliderTextContainer, 'inside');
      this.pitchSliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the up/down arrows for pitch
      //----------------------------------------
      this.pitchIncDiv = new Element( 'div', {
         'id': 'pitchIncDiv',
	 'class': 'incDiv'
      });
      this.pitchIncImg = new Element( 'img', {
         'id': 'pitchIncImg',
	 'class': 'incImg',
	 'src': rightarr
      });

      this.pitchIncImg.inject(this.pitchIncDiv, 'inside');
      this.pitchIncImg.addEvent('mousedown',function() {
         this.doIncPitch();
      }.bind(this));
      this.pitchIncImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('pitch');
      }.bind(this));

      this.pitchDecDiv = new Element( 'div', {
	 'class': 'decDiv'
      });
      this.pitchDecImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': leftarr
      });

      this.pitchDecImg.inject(this.pitchDecDiv, 'inside');
      this.pitchDecImg.addEvent('mousedown',function() {
         this.doDecPitch();
      }.bind(this));
      this.pitchDecImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('pitch');
      }.bind(this));

      this.pitchIncDiv.inject(this.pitchArrowsDiv, 'inside');
      this.pitchDecDiv.inject(this.pitchArrowsDiv, 'inside');
      this.pitchArrowsDiv.inject($('pitch_sliderContainer'), 'inside');

      //--------------------------------------------------------------------------
      //----------------------------------------
      // the slider for yaw
      //----------------------------------------
      var yaw = this.model.getThreeDInfo().yaw;
      //console.log("yaw ",yaw);
      this.yawSlider = new SliderComponent({
                                              initiator: this,
                                              targetId: this.sliderTarget,
                                              model:this.model,
                                              view:this.view,
                                              sliderLength: sliderLength, 
                                              isHorizontal: this.isHorizontal,
                                              type:"yaw",
					      cursorCompensation: 4,
                                              range: {min:this.yawMin, max:this.yawMax}
					     });

      this.yawSliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer_rotation'
      });

      this.yawSliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv_rotation'
      });
      this.yawSliderTextDiv.set('text', 'y: -');

      this.yawSliderTextDiv.inject(this.yawSliderTextContainer, 'inside');
      this.yawSliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the up/down arrows for yaw
      //----------------------------------------
      this.yawIncDiv = new Element( 'div', {
	 'class': 'incDiv'
      });
      this.yawIncImg = new Element( 'img', {
	 'class': 'incImg',
	 'src': rightarr
      });

      this.yawIncImg.inject(this.yawIncDiv, 'inside');
      this.yawIncImg.addEvent('mousedown',function() {
         this.doIncYaw();
      }.bind(this));
      this.yawIncImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('yaw');
      }.bind(this));

      this.yawDecDiv = new Element( 'div', {
	 'class': 'decDiv'
      });
      this.yawDecImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': leftarr
      });

      this.yawDecImg.inject(this.yawDecDiv, 'inside');
      this.yawDecImg.addEvent('mousedown',function() {
         this.doDecYaw();
      }.bind(this));
      this.yawDecImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('yaw');
      }.bind(this));

      this.yawIncDiv.inject(this.yawArrowsDiv, 'inside');
      this.yawDecDiv.inject(this.yawArrowsDiv, 'inside');
      this.yawArrowsDiv.inject($('yaw_sliderContainer'), 'inside');

      //--------------------------------------------------------------------------
      //----------------------------------------
      // the slider for roll
      //----------------------------------------
      var roll = this.model.getThreeDInfo().roll;
      //console.log("roll ",roll);
      this.rollSlider = new SliderComponent({
                                              initiator: this,
                                              targetId: this.sliderTarget,
                                              model:this.model,
                                              view:this.view,
                                              sliderLength: sliderLength, 
                                              isHorizontal: this.isHorizontal,
                                              type:"roll",
					      cursorCompensation: 4,
                                              range: {min:this.rollMin, max:this.rollMax}
					     });

      this.rollSliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer_rotation'
      });

      this.rollSliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv_rotation'
      });
      this.rollSliderTextDiv.set('text', 'r: -');

      this.rollSliderTextDiv.inject(this.rollSliderTextContainer, 'inside');
      this.rollSliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the up/down arrows for roll
      //----------------------------------------
      this.rollIncDiv = new Element( 'div', {
	 'class': 'incDiv'
      });
      this.rollIncImg = new Element( 'img', {
	 'class': 'incImg',
	 'src': rightarr
      });

      this.rollIncImg.inject(this.rollIncDiv, 'inside');
      this.rollIncImg.addEvent('mousedown',function() {
         this.doIncRoll();
      }.bind(this));
      this.rollIncImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('roll');
      }.bind(this));

      this.rollDecDiv = new Element( 'div', {
	 'class': 'decDiv'
      });
      this.rollDecImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': leftarr
      });

      this.rollDecImg.inject(this.rollDecDiv, 'inside');
      this.rollDecImg.addEvent('mousedown',function() {
         this.doDecRoll();
      }.bind(this));
      this.rollDecImg.addEvent('mouseup',function() {
         this.doMouseUpRotation('roll');
      }.bind(this));

      this.rollIncDiv.inject(this.rollArrowsDiv, 'inside');
      this.rollDecDiv.inject(this.rollArrowsDiv, 'inside');
      this.rollArrowsDiv.inject($('roll_sliderContainer'), 'inside');

      //----------------------------------------
      // the container for orthogonal buttons
      //----------------------------------------
      this.orthogonalContainer = new Element( 'div', {
	 'id': 'orthogonalContainer'
      });
      this.transverseDiv = new Element( 'div', {
	 'id': 'transverseButtonDiv',
	 'class': 'orthogonalButtonDiv transverse'
      });
      this.transverseDivText = new Element('div', {
         'id': 'transverseButtonText',
	 'class': 'orthogonalButtonText'
      });
      this.transverseDivText.appendText('Trans');
      
      this.sagittalDiv = new Element( 'div', {
	 'id': 'sagittalButtonDiv',
	 'class': 'orthogonalButtonDiv sagittal'
      });
      this.sagittalDivText = new Element('div', {
         'id': 'sagittalButtonText',
	 'class': 'orthogonalButtonText'
      });
      this.sagittalDivText.appendText('Sagit');

      this.coronalDiv = new Element( 'div', {
	 'id': 'coronalButtonDiv',
	 'class': 'orthogonalButtonDiv coronal'
      });
      this.coronalDivText = new Element('div', {
         'id': 'coronalButtonText',
	 'class': 'orthogonalButtonText'
      });
      //this.coronalDivText.appendText('Coron');
      this.coronalDivText.appendText('Front');

      this.orthogonalContainer.inject(win, 'inside');
      this.transverseDivText.inject(this.transverseDiv, 'inside');
      this.transverseDiv.inject(this.orthogonalContainer, 'inside');
      this.sagittalDivText.inject(this.sagittalDiv, 'inside');
      this.sagittalDiv.inject(this.orthogonalContainer, 'inside');
      this.coronalDivText.inject(this.coronalDiv, 'inside');
      this.coronalDiv.inject(this.orthogonalContainer, 'inside');
      
      //----------------------------------------
      // the container for fixed point button
      //----------------------------------------
      this.fixedPointButtonDiv = new Element( 'div', {
	 'id': 'fixedPointButtonDiv',
	 'class': 'fixedPointButtonDiv'
      });
      this.fixedPointButtonText = new Element('div', {
         'id': 'fixedPointButtonText',
	 'class': 'fixedPointButtonText'
      });
      this.fixedPointButtonText.appendText('Fx Pt');

      this.fixedPointButtonDiv.inject(win, 'inside');
      this.fixedPointButtonText.inject(this.fixedPointButtonDiv, 'inside');

      //----------------------------------------
      // add the events
      //----------------------------------------
      this.transverseDiv.addEvent('mousedown',function() {
         this.setTransverse();
      }.bind(this));
      this.transverseDiv.addEvent('mouseup',function() {
         this.doMouseUpRotation('transverse');
      }.bind(this));
      this.coronalDiv.addEvent('mousedown',function() {
         this.setCoronal();
      }.bind(this));
      this.coronalDiv.addEvent('mouseup',function() {
         this.doMouseUpRotation('coronal');
      }.bind(this));
      this.sagittalDiv.addEvent('mousedown',function() {
         this.setSagittal();
      }.bind(this));
      this.sagittalDiv.addEvent('mouseup',function() {
         this.doMouseUpRotation('sagittal');
      }.bind(this));

      this.fixedPointButtonDiv.addEvent('click',function() {
	 this.doFixedPointButtonDivClicked();
      }.bind(this));

      emouseatlas.emap.utilities.addButtonStyle("transverseButtonDiv");
      emouseatlas.emap.utilities.addButtonStyle("sagittalButtonDiv");
      emouseatlas.emap.utilities.addButtonStyle("coronalButtonDiv");
      emouseatlas.emap.utilities.addButtonStyle("fixedPointButtonDiv");


      //-----------------------------------------
      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

      if(this.model.modelReady()) {
	 var threeDInfo = this.model.getThreeDInfo();
	 var pitch = threeDInfo.pitch;
	 this.pitchSlider.setUserChange(false,"initialize");
	 //this.pitchSlider.setPosition(pitch.cur);
	 this.pitchSliderTextDiv.set('text', 'p: ' + pitch.cur);
	 this.pitchSlider.setUserChange(true,"initialize");

	 var yaw = threeDInfo.yaw;
	 this.yawSlider.setUserChange(false,"initialize");
	 //this.yawSlider.setPosition(yaw.cur);
	 this.yawSliderTextDiv.set('text', 'y: ' + yaw.cur);
	 this.yawSlider.setUserChange(true,"initialize");

	 var roll = threeDInfo.roll;
	 this.rollSlider.setUserChange(false,"initialize");
	 //this.rollSlider.setPosition(roll.cur);
	 this.rollSliderTextDiv.set('text', 'r: ' + roll.cur);
	 this.rollSlider.setUserChange(true,"initialize");
      }

      this.layerNames = [];

   }, // initialize

   //---------------------------------------------------------------
   doStepChanged: function(step,type) {

      //console.log("%s: doStepChanged: %d",type,step);
      //console.log("rotation: doStepChanged: step %s, type %s",step, type);

      if(type.toLowerCase() === "pitch") {
	this.model.modifyOrientation(step, undefined, undefined);
         this.updateSlider('pitch');
      }
      if(type.toLowerCase() === "yaw") {
	this.model.modifyOrientation(undefined, step, undefined);
         this.updateSlider('yaw');
      }
      if(type.toLowerCase() === "roll") {
	this.model.modifyOrientation(undefined, undefined, step);
         this.updateSlider('roll');
      }

      return false;

   }, // doStepChanged

   //---------------------------------------------------------------
   doSliderCompleted: function(step,type) {
      //console.log("%s: doSliderCompleted: %d",type,step);
   }, // doSliderCompleted

   //---------------------------------------------------------------
   // Catch mouseUp events from the tiledImageRotationTool
   // This is called from 'SliderComponent'
   //---------------------------------------------------------------
   doMouseUpSlider: function(type) {

      if(type === 'pitch' || type === 'yaw' || type === 'roll') {
         this.view.updateWlzRotation("tiledImageRotationTool: doMouseUpSlider");
      }

      return false;

   }, // doMouseUpSlider

   //---------------------------------------------------------------
   // Catch mouseDown events from the incPitch arrow
   //---------------------------------------------------------------
   doIncPitch: function() {

      var pitch = this.model.getThreeDInfo().pitch;
      var val = (pitch.cur === 'undefined') ? 1 : 1 * pitch.cur;
      this.model.setOrientation(val + 1, undefined, undefined);
      this.updateSlider('pitch');

      return false;

   }, // doIncPitch

   //---------------------------------------------------------------
   // Catch mouseDown events from the decPitch arrow
   //---------------------------------------------------------------
   doDecPitch: function() {

      var pitch = this.model.getThreeDInfo().pitch;
      var val = (pitch.cur === 'undefined') ? 1 : 1 * pitch.cur;
      this.model.setOrientation(val - 1, undefined, undefined);
      this.updateSlider('pitch');

      return false;

   }, // doIncPitch

   //---------------------------------------------------------------
   // Catch mouseDown events from the incPitch arrow
   //---------------------------------------------------------------
   doIncYaw: function() {

      var yaw = this.model.getThreeDInfo().yaw;
      var val = (yaw.cur === 'undefined') ? 1 : 1 * yaw.cur;
      this.model.setOrientation(undefined, val + 1, undefined);
      this.updateSlider('yaw');

      return false;

   }, // doIncYaw

   //---------------------------------------------------------------
   // Catch mouseDown events from the decPitch arrow
   //---------------------------------------------------------------
   doDecYaw: function() {

      var yaw = this.model.getThreeDInfo().yaw;
      var val = (yaw.cur === 'undefined') ? 1 : 1 * yaw.cur;
      this.model.setOrientation(undefined, val - 1, undefined);
      this.updateSlider('yaw');

      return false;

   }, // doIncYaw

   //---------------------------------------------------------------
   // Catch mouseDown events from the incPitch arrow
   //---------------------------------------------------------------
   doIncRoll: function() {

      var roll = this.model.getThreeDInfo().roll;
      var val = (roll.cur === 'undefined') ? 1 : 1 * roll.cur;
      this.model.setOrientation(undefined, undefined, val + 1);
      this.updateSlider('roll');

      return false;

   }, // doIncRoll

   //---------------------------------------------------------------
   // Catch mouseDown events from the decPitch arrow
   //---------------------------------------------------------------
   doDecRoll: function() {

      var roll = this.model.getThreeDInfo().roll;
      var val = (roll.cur === 'undefined') ? 1 : 1 * roll.cur;
      this.model.setOrientation(undefined, undefined, val - 1);
      this.updateSlider('roll');

      return false;

   }, // doIncRoll

   /*
   //---------------------------------------------------------------
   // Catch mouseUp events from the pitch/yaw/roll arrows
   //---------------------------------------------------------------
   doMouseUpRotationArrow: function(type) {

      if(type === 'pitch' || type === 'yaw' || type === 'roll') {
         this.view.updateWlzRotation("tiledImageRotationTool: doMouseUpRotationArrow");
      }

      return false;

   }, // doMouseUpRotationArrow

   //---------------------------------------------------------------
   // Catch mouseUp events from the transverse/coronal/sagittal buttons
   //---------------------------------------------------------------
   doMouseUpRotationButton: function(type) {

      if(type === 'transverse' || type === 'coronal' || type === 'sagittal') {
         this.view.updateWlzRotation("tiledImageRotationTool: doMouseUpRotationButton");
      }

      return false;

   }, // doMouseUpRotationArrow
   */

   //---------------------------------------------------------------
   // Catch mouseUp events from the rotation controls
   //---------------------------------------------------------------
   doMouseUpRotation: function(type) {

      if(type === 'pitch' ||
         type === 'yaw' ||
	 type === 'roll' ||
	 type === 'transverse' ||
	 type === 'coronal' ||
	 type === 'sagittal') {
         this.view.updateWlzRotation("tiledImageRotationTool: doMouseUpRotation");
      }

      return false;

   }, // doMouseUpRotation

   //---------------------------------------------------------------
   doFixedPointButtonDivClicked: function() {
      var modes = this.view.getModes();
      this.view.setMode(modes.fixedPoint.name);
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("rotation: modelUpdate");
      var threeDInfo = this.model.getThreeDInfo();

      if(modelChanges.initial ||
         modelChanges.initialState ||
	 modelChanges.locator ||
	 modelChanges.setSectioN) {

	 var pitch = threeDInfo.pitch;
	 this.pitchSlider.setUserChange(false,"modelUpdate");
	 this.pitchSlider.setStep(pitch.cur);
	 this.pitchSliderTextDiv.set('text', 'p: ' + pitch.cur);
	 this.pitchSlider.setUserChange(true,"modelUpdate");

	 var yaw = threeDInfo.yaw;
	 this.yawSlider.setUserChange(false,"modelUpdate");
	 this.yawSlider.setStep(yaw.cur);
	 this.yawSliderTextDiv.set('text', 'y: ' + yaw.cur);
	 this.yawSlider.setUserChange(true,"modelUpdate");

	 var roll = threeDInfo.roll;
	 this.rollSlider.setUserChange(false,"modelUpdate");
	 this.rollSlider.setStep(roll.cur);
	 this.rollSliderTextDiv.set('text', 'r: ' + roll.cur);
	 this.rollSlider.setUserChange(true,"modelUpdate");
      }

      //console.log("exit tiledImageRotationTool modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

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
   updateSlider: function(from) {

      var threeDInfo = this.model.getThreeDInfo();

      if(from === 'pitch' || from === 'all') {
	 var pitch = threeDInfo.pitch;
	 this.pitchSlider.setUserChange(false,"updateSlider pitch");
	 this.pitchSlider.setStep(pitch.cur);
	 this.pitchSliderTextDiv.set('text', 'p: ' + pitch.cur);
	 this.pitchSlider.setUserChange(true,"updateSlider pitch");
      }

      if(from === 'yaw' || from === 'all') {
	 var yaw = threeDInfo.yaw;
	 this.yawSlider.setUserChange(false,"updateSlider yaw");
	 this.yawSlider.setStep(yaw.cur);
	 this.yawSliderTextDiv.set('text', 'y: ' + yaw.cur);
	 this.yawSlider.setUserChange(true,"updateSlider yaw");
      }

      if(from === 'roll' || from === 'all') {
	 var roll = threeDInfo.roll;
	 this.rollSlider.setUserChange(false,"updateSlider roll");
	 this.rollSlider.setStep(roll.cur);
	 this.rollSliderTextDiv.set('text', 'r: ' + roll.cur);
	 this.rollSlider.setUserChange(true,"updateSlider roll");
      }
   },

   //---------------------------------------------------------------
   setTransverse: function() {
      //console.log("setTransverse:");
      var viewAngles = this.model.getViewAngles();
      this.model.setOrientation(viewAngles.transverse.pitch, viewAngles.transverse.yaw, viewAngles.transverse.roll);
      this.updateSlider('all');
      //this.view.updateWlzRotation("tiledImageRotationTool: setTransverse:");
   },

   //---------------------------------------------------------------
   setSagittal: function() {
      //console.log("setSagittal:");
      var viewAngles = this.model.getViewAngles();
      this.model.setOrientation(viewAngles.sagittal.pitch, viewAngles.sagittal.yaw, viewAngles.sagittal.roll);
      this.updateSlider('all');
      //this.view.updateWlzRotation("tiledImageRotationTool: setSagittal:");
   },

   //---------------------------------------------------------------
   setCoronal: function() {
      //console.log("setCoronal:");
      var viewAngles = this.model.getViewAngles();
      this.model.setOrientation(viewAngles.coronal.pitch, viewAngles.coronal.yaw, viewAngles.coronal.roll);
      this.updateSlider('all');
      //this.view.updateWlzRotation("tiledImageRotationTool: setCoronal:");
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
   }


});
