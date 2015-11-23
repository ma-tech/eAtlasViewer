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
//   tiledImageMeasuringTool.js
//   Tool to manipulate Measure in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageMeasuringTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageMeasuringTool = new Class ({
var tiledImageMeasuringTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageMeasuringTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this, "tiledImageMeasuringTool");
      this.view.register(this, "tiledImageMeasuringTool");

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "measuringTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.sliderLength = this.width - 25;

      this.imagePath = this.model.getInterfaceImageDir();
      //console.log(this.imagePath);

      var allowClose = (params.params.allowClose === undefined) ? true : params.params.allowClose;
      allowClose = (allowClose === 'true' || allowClose === true) ? true : false;

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;
      this.borders = params.params.borders;
      this.transparent = params.params.transparent;

      this.bgc = (params.params.bgc === undefined) ? "#fff" : params.params.bgc;

      this.visible = true;

      //console.log("tiledImageMeasuringTool this.transparent ",this.transparent);

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         borders:this.borders,
                                         transparent:this.transparent,
					 bgc:this.bgc,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: this.imagePath,
					 allowClose: true,
					 initiator:this});

      var x = parseInt(params.params.x);
      var y = parseInt(params.params.y);
      //console.log("layerTool: x ",x,", ",y);
      this.window.setPosition(x, y);

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

      this.voxel = this.model.getVoxelSize(false);
      //console.log("tiledImageMeasuringTool: voxel ",this.voxel);

      this.createElements();

      this.window.setDimensions(this.width, this.height);
      //this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function(modelChanges) {

      var win = $(this.shortName + '-win');

      this.titleTextContainer = new Element('div', {
         'class': 'measuringTitleTextContainer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'measuringTitleTextDiv'
      });
      this.titleTextDiv.set('text', 'distance');

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside');
      this.titleTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the container for distance
      //----------------------------------------
      this.distContainer = new Element('div', {
	 'id':'measuringToolDistCoordDiv',
	 'class':'measuringToolCoordDiv'
      });

      this.distValueContainer = new Element('div', {
	 'id':'measuringToolValueContainerDiv',
	 'class':'measuringToolCoordDiv'
      });

      this.distValueText = new Element('div', {
	 'class':'measuringToolValueText'
      });
      if(this.voxel !== undefined) {
         this.distValueText.appendText('0 ' + this.voxel.units[0]);
      }

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      this.distValueText.inject(this.distValueContainer, 'inside');
      this.distValueContainer.inject(this.distContainer, 'inside');
      this.distContainer.inject(win, 'inside');

      //----------------------------------------
      // the measurement origin marker
      //----------------------------------------
      this.originMarkerContainer = new Element('div', {
	 'id': 'measurementOriginMarkerContainer',
	 'class': 'markerContainer'
      });
      this.originMarkerContainer.inject($('emapIIPViewerDiv'), 'inside');

      this.originMarkerArm0 = new Element('div', {
	 'id': 'measurementOriginMarkerArm0',
	 'class': 'markerArm zero'
      });
      this.originMarkerArm90 = new Element('div', {
	 'id': 'measurementOriginMarkerArm90',
	 'class': 'markerArm ninety'
      });
      this.originMarkerArm180 = new Element('div', {
	 'id': 'measurementOriginMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      this.originMarkerArm270 = new Element('div', {
	 'id': 'measurementOriginMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      this.originMarkerArm0.inject(this.originMarkerContainer, 'inside');
      this.originMarkerArm90.inject(this.originMarkerContainer, 'inside');
      this.originMarkerArm180.inject(this.originMarkerContainer, 'inside');
      this.originMarkerArm270.inject(this.originMarkerContainer, 'inside');

      //----------------------------------------
      // the measurement target marker
      //----------------------------------------
      this.targetMarkerContainer = new Element('div', {
	 'id': 'measurementTargetMarkerContainer',
	 'class': 'markerContainer'
      });
      this.targetMarkerContainer.inject($('emapIIPViewerDiv'), 'inside');

      this.targetMarkerArm0 = new Element('div', {
	 'id': 'measurementTargetMarkerArm0',
	 'class': 'markerArm zero'
      });
      this.targetMarkerArm90 = new Element('div', {
	 'id': 'measurementTargetMarkerArm90',
	 'class': 'markerArm ninety'
      });
      this.targetMarkerArm180 = new Element('div', {
	 'id': 'measurementTargetMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      this.targetMarkerArm270 = new Element('div', {
	 'id': 'measurementTargetMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      this.targetMarkerArm0.inject(this.targetMarkerContainer, 'inside');
      this.targetMarkerArm90.inject(this.targetMarkerContainer, 'inside');
      this.targetMarkerArm180.inject(this.targetMarkerContainer, 'inside');
      this.targetMarkerArm270.inject(this.targetMarkerContainer, 'inside');

   }, // createElements

   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.setOriginMarkerVisible(false);
      this.setTargetMarkerVisible(false);
      this.setMeasuringToolVisible(false);
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
   // if the opacity has been changed, update the slider text
   viewUpdate: function(viewChanges, from) {

      //console.log("enter tiledImageMeasuringTool viewUpdate:",viewChanges);

      var dx;
      var dy;
      var dz;
      var dist;
      var origin;
      var point;
      var scale;
      var unit;

      if(viewChanges.initial) {
	 this.setMeasuringToolVisible(false);
         this.setOriginMarkerVisible(false);
         this.setTargetMarkerVisible(false);
      }

      //...................................
      if(viewChanges.mode) {
	 var mode = this.view.getMode();
	 //console.log("mode ",mode);
	 if(mode.name === 'measuring') {
	    this.setMeasuringToolVisible(true);
            this.setOriginMarkerVisible(false);
            this.setTargetMarkerVisible(false);
	 } else {
	    this.setMeasuringToolVisible(false);
            this.setOriginMarkerVisible(false);
            this.setTargetMarkerVisible(false);
	 }
      }

      if(viewChanges.measuringOrigin) {
         this.setOriginMarkerVisible(false);
         this.setTargetMarkerVisible(false);
         var clickPos = this.view.getMouseClickPosition();
         var viewerPos = this.view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x -12;
	 var top = clickPos.y - viewerPos.y -12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 this.originMarkerContainer.setStyles({'left': left, 'top': top});
         this.setOriginMarkerVisible(true);
         this.distValueText.set('text', '0 ' + this.voxel.units[0]);
      }

      if(viewChanges.measuringTarget) {
	 var isWlz = this.model.isWlzData();
         var clickPos = this.view.getMouseClickPosition();
         var viewerPos = this.view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x - 12;
	 var top = clickPos.y - viewerPos.y - 12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 this.targetMarkerContainer.setStyles({'left': left, 'top': top});
         this.setTargetMarkerVisible(true);
	 origin = this.view.getMeasurementOrigin();
	 point = this.view.getMeasurementTarget();
	 if(isWlz) {
	    dx = (point.x - origin.x) * this.voxel.x;
	    dx = (Math.round(dx * 100))/100;
	    dy = (point.y - origin.y) * this.voxel.y;
	    dy = (Math.round(dy * 100))/100;
	    dz = (point.z - origin.z) * this.voxel.z;
	    dz = (Math.round(dz * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
	    dist = (Math.round(dist * 100))/100;
	    //console.log("distb targ %d",dist);
	 } else {
	    scale = this.view.getScale();
	    dx = point.x - origin.x;
	    dx = dx * this.voxel.x / scale.cur;
	    dx = (Math.round(dx * 100))/100;
	    dy = point.y - origin.y;
	    dy = dy * this.voxel.y / scale.cur;
	    dy = (Math.round(dy * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy);
	    //dist = (Math.round(dist * 100))/100;
	    dist = Math.round(dist);
	 }
	 if(dist < 1000) {
	    unit = this.voxel.units[0];
	 } else {
	    unit = this.voxel.units[1];
	    dist = (Math.round(dist / 10))/100;
	 }
         this.distValueText.set('text', dist + ' ' + unit);
      }

      if(viewChanges.measuring) {
	 var isWlz = this.model.isWlzData();
	 origin = this.view.getMeasurementOrigin();
	 point = this.view.getMeasurementPoint();
	 if(isWlz) {
	    dx = (point.x - origin.x) * this.voxel.x;
	    dx = (Math.round(dx * 100))/100;
	    dy = (point.y - origin.y) * this.voxel.y;
	    dy = (Math.round(dy * 100))/100;
	    dz = point.z - origin.z;
	    dz = (point.z - origin.z) * this.voxel.z;
	    dz = (Math.round(dz * 100))/100;
	    //console.log("dx %d, dy %d, dz %d",dx,dy,dz);
	    dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
	    dist = (Math.round(dist * 100))/100;
	 } else {
	    scale = this.view.getScale();
	    dx = point.x - origin.x;
	    dx = dx * this.voxel.x / scale.cur;
	    dx = (Math.round(dx * 100))/100;
	    dy = point.y - origin.y;
	    dy = dy * this.voxel.y / scale.cur;
	    dy = (Math.round(dy * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy);
	    //dist = (Math.round(dist * 100))/100;
	    dist = Math.round(dist);
	 }
	 if(dist < 1000) {
	    unit = this.voxel.units[0];
	 } else {
	    unit = this.voxel.units[1];
	    dist = (Math.round(dist / 10))/100;
	 }
         this.distValueText.set('text', dist + ' ' + unit);
      }

      if(viewChanges.scale) {
         this.setOriginMarkerVisible(false);
         this.setTargetMarkerVisible(false);
      }

      //console.log("exit tiledImageMeasuringTool viewUpdate:");
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
      
      return false;

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
   setMeasuringToolVisible: function(visible) {
      this.window.setVisible(visible);
   },

   //--------------------------------------------------------------
   setOriginMarkerVisible: function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(this.originMarkerContainer) {
         this.originMarkerArm0.setStyle('visibility', viz);
         this.originMarkerArm90.setStyle('visibility', viz);
         this.originMarkerArm180.setStyle('visibility', viz);
         this.originMarkerArm270.setStyle('visibility', viz);
      }
   },

   //--------------------------------------------------------------
   setTargetMarkerVisible: function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(this.targetMarkerContainer) {
         this.targetMarkerArm0.setStyle('visibility', viz);
         this.targetMarkerArm90.setStyle('visibility', viz);
         this.targetMarkerArm180.setStyle('visibility', viz);
         this.targetMarkerArm270.setStyle('visibility', viz);
      }
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

});
