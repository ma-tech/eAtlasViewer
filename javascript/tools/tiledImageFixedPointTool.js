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
//   tiledImageFixedPointTool.js
//   Tool to manipulate FixedPoint in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageFixedPointTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageFixedPointTool = new Class ({
var tiledImageFixedPointTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageFixedPointTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "fixedPointTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.sliderLength = this.width - 25;

      var imagePath = this.model.getInterfaceImageDir();

      var allowClose = (typeof(params.params.allowClose) === 'undefined') ? false : params.params.allowClose;
      //console.log("tiledImageFixedPointTool allowClose %s",allowClose);
      this.targetId = params.params.targetId;
      this.drag = params.params.drag;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: imagePath,
					 allowClose: allowClose,
					 initiator:this});

      var x = parseInt(params.params.x);
      var y = parseInt(params.params.y);
      //console.log("layerTool: x ",x,", ",y);
      this.window.setPosition(x, y);

      this.currentFxPt;
      this.newFxPt;
      this.cancelFxPt;

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

      this.layerNames = [];

      this.createElements();

      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function(modelChanges) {
      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer5'
      });

      var win = $(this.shortName + '-win');
      var topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(topEdge, 'inside');

      this.titleTextContainer = new Element('div', {
         'class': 'titleTextContainer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'titleTextDiv'
      });
      this.titleTextDiv.set('text', 'set fixed point');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside');
      this.titleTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the containers for x,y,z values
      //----------------------------------------
      this.xContainer = new Element('div', {
	 'id': 'fixedPointToolXContainer',
	 'class':'fixedPointToolCoordDiv X'
      });

      this.xCoordLabelText = new Element('div', {
	 'id': 'fixedPointToolXLabelText',
	 'class':'fixedPointToolLabelText X'
      });
      this.xCoordLabelText.appendText('X');

      this.xCoordValueText = new Element('div', {
	 'id': 'fixedPointToolXValueText',
	 'class':'fixedPointToolValueText X'
      });
      //----------------------------------------
      this.yContainer = new Element('div', {
	 'id': 'fixedPointToolYContainer',
	 'class':'fixedPointToolCoordDiv Y'
      });

      this.yCoordLabelText = new Element('div', {
	 'id': 'fixedPointToolYLabelText',
	 'class':'fixedPointToolLabelText Y'
      });
      this.yCoordLabelText.appendText('Y');

      this.yCoordValueText = new Element('div', {
	 'id': 'fixedPointToolYValueText',
	 'class':'fixedPointToolValueText Y'
      });
      //----------------------------------------
      this.zContainer = new Element('div', {
	 'id': 'fixedPointToolZContainer',
	 'class':'fixedPointToolCoordDiv Z'
      });

      this.zCoordLabelText = new Element('div', {
	 'id': 'fixedPointToolZLabelText',
	 'class':'fixedPointToolLabelText Z'
      });
      this.zCoordLabelText.appendText('Z');

      this.zCoordValueText = new Element('div', {
	 'id': 'fixedPointToolZValueText',
	 'class':'fixedPointToolValueText Z'
      });

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      this.buttonContainer = new Element('div', {
	 'id': 'fixedPointToolButtonContainer'
      });

      this.okButton = new Element('div', {
         'id': 'fixedPointToolOKButton',
	 'class': 'fixedPointToolButton ok'
      });
      this.okButton.appendText('OK');

      this.defaultButton = new Element('div', {
         'id': 'fixedPointToolDefaultButton',
	 'class': 'fixedPointToolButton default'
      });
      this.defaultButton.appendText('Default');

      this.cancelButton = new Element('div', {
         'id': 'fixedPointToolCancelButton',
	 'class': 'fixedPointToolButton cancel'
      });
      this.cancelButton.appendText('Cancel');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      //this.messageText.inject(win, 'inside');

      //propertySpacerContainer.inject(win, 'inside');

      this.xCoordLabelText.inject(this.xContainer, 'inside');
      this.xCoordValueText.inject(this.xContainer, 'inside');
      this.xContainer.inject(win, 'inside');

      this.yCoordLabelText.inject(this.yContainer, 'inside');
      this.yCoordValueText.inject(this.yContainer, 'inside');
      this.yContainer.inject(win, 'inside');

      this.zCoordLabelText.inject(this.zContainer, 'inside');
      this.zCoordValueText.inject(this.zContainer, 'inside');
      this.zContainer.inject(win, 'inside');

      this.buttonContainer.inject(win, 'inside');
      //this.okButton.inject(this.buttonContainer, 'inside');
      this.defaultButton.inject(this.buttonContainer, 'inside');
      this.cancelButton.inject(this.buttonContainer, 'inside');
      //----------------------------------------

      //emouseatlas.emap.utilities.addButtonStyle('fixedPointToolOKButton');
      emouseatlas.emap.utilities.addButtonStyle('fixedPointToolDefaultButton');
      emouseatlas.emap.utilities.addButtonStyle('fixedPointToolCancelButton');

      //----------------------------------------
      // add event handlers
      //----------------------------------------
      /*
      this.okButton.addEvent('click',function() {
         if(!this.isSamePoint(this.currentFxPt, this.newFxPt)) {
            this.model.setFixedPoint({x:this.newFxPt.x, y:this.newFxPt.y, z:this.newFxPt.z});
         }
      }.bind(this));
      */

      this.defaultButton.addEvent('click',function() {
	 var point = this.model.getThreeDInfo().defaultFxp;
	 if(!this.isSamePoint(this.currentFxPt, point)) {
            this.setTextValues(point);
            this.model.setFixedPoint({x:point.x, y:point.y, z:point.z});
	 }
         this.setMarkerVisible(false);
      }.bind(this));

      this.cancelButton.addEvent('click',function() {
	 if(!this.isSamePoint(this.currentFxPt, this.cancelFxPt)) {
	    this.model.setFixedPoint({x:this.cancelFxPt.x, y:this.cancelFxPt.y, z:this.cancelFxPt.z});
	    this.setTextValues(this.cancelFxPt);
            this.setMarkerVisible(false);
	 }
	 //this.doClosed();
      }.bind(this));

      //----------------------------------------
      // the fixedPoint marker
      //----------------------------------------
      this.markerContainer = new Element('div', {
	 'id': 'fixedPointMarkerContainer',
	 'class': 'markerContainer'
      });
      this.markerContainer.inject($('emapIIPViewerDiv'), 'inside');

      this.markerArm0 = new Element('div', {
	 'id': 'fixedPointMarkerArm0',
	 'class': 'markerArm zero'
      });
      this.markerArm90 = new Element('div', {
	 'id': 'fixedPointMarkerArm90',
	 'class': 'markerArm ninety'
      });
      this.markerArm180 = new Element('div', {
	 'id': 'fixedPointMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      this.markerArm270 = new Element('div', {
	 'id': 'fixedPointMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      this.markerArm0.inject(this.markerContainer, 'inside');
      this.markerArm90.inject(this.markerContainer, 'inside');
      this.markerArm180.inject(this.markerContainer, 'inside');
      this.markerArm270.inject(this.markerContainer, 'inside');

   }, // createElements

   //---------------------------------------------------------------
   setTextValues: function(point) {
      var val;
      val = Math.round(point.x);
      this.xCoordValueText.set('text', val);
      val = Math.round(point.y);
      this.yCoordValueText.set('text', val);
      val = Math.round(point.z);
      this.zCoordValueText.set('text', val);
   }, // setTextValues

   //---------------------------------------------------------------
   isSamePoint: function(point1, point2) {
      if(point1.x === point2.x && point1.y === point2.y && point1.z === point2.z) {
         return true;
      } else {
         return false;
      }
   },

   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.setMarkerVisible(false);
      this.setFixedPointToolVisible(false);
      var modes = this.view.getModes();
      this.view.setMode(modes.move.name);
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("enter tiledImageOpacityTool modelUpdate:",modelChanges);
      if(modelChanges.initial === true) {
      }
      //console.log("exit tiledImageOpacityTool modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      //console.log("enter tiledImageFixedPointTool viewUpdate:",viewChanges);
      if(viewChanges.initial === true) {
	 this.setFixedPointToolVisible(false);
      }

      //...................................
      if(viewChanges.mode) {
         var mode = this.view.getMode();
         var modes = this.view.getModes();
         if(mode === modes['fixedPoint']) {
	    this.currentFxPt = this.model.getThreeDInfo().fxp;
            this.setTextValues(this.currentFxPt);
            this.setFixedPointToolVisible(true);
         } else {
            this.setMarkerVisible(false);
            this.setFixedPointToolVisible(false);
         }
      }

      //...................................
      if(viewChanges.selectFixedPoint === true) {
	 this.newFxPt = this.view.getPossibleFixedPoint();
         this.setTextValues(this.newFxPt);
         var clickPos = this.view.getMouseClickPosition();
         var viewerPos = this.view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x -12;
	 var top = clickPos.y - viewerPos.y -12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 this.markerContainer.setStyles({'left': left, 'top': top});
	 this.setMarkerVisible(true);
         if(!this.isSamePoint(this.currentFxPt, this.newFxPt)) {
            this.model.setFixedPoint({x:this.newFxPt.x, y:this.newFxPt.y, z:this.newFxPt.z});
         }
      }

      //console.log("exit tiledImageFixedPointTool viewUpdate:");
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

      var containerPos = this.view.getToolContainerPos();
      var left;
      var top;
      left = $(this.shortName + '-container').getPosition().x;
      top = $(this.shortName + '-container').getPosition().y;
      //console.log("showToolTip left %s, top %s",left,top);
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
   setFixedPointToolVisible: function(visible) {
      if(visible) {
	 var pt = this.model.getThreeDInfo().fxp;
	 this.cancelFxPt = {x:pt.x, y:pt.y, z:pt.z};
      }
      this.window.setVisible(visible);
   },

   //--------------------------------------------------------------
   setMarkerVisible: function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(this.markerContainer) {
         this.markerArm0.setStyle('visibility', viz);
         this.markerArm90.setStyle('visibility', viz);
         this.markerArm180.setStyle('visibility', viz);
         this.markerArm270.setStyle('visibility', viz);
      }
   }

});
