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
//   tiledImageEquivalentSectionTool.js
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
// tiledImageEquivalentSectionTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageEquivalentSectionTool = new Class ({
var tiledImageEquivalentSectionTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageEquivalentSectionTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this, "tiledImageEquivalentSectionTool");
      this.view.register(this, "tiledImageEquivalentSectionTool");

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "equivalentSectionTool";
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

      this.boundingBox;

      this.visible = true;

      //console.log("tiledImageEquivalentSectionTool this.transparent ",this.transparent);

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         borders:this.borders,
                                         transparent:this.transparent,
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

      this.createElements();

      this.window.setDimensions(this.width, this.height);
      //this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function(modelChanges) {

      var win = $(this.shortName + '-win');

      this.titleTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.titleTextDiv.set('text', 'High Resolution Section');

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside', 'inside');
      this.titleTextContainer.inject(topEdge, 'inside', 'inside');

      //----------------------------------------
      // the info container
      //----------------------------------------
      this.infoDiv = new Element('div', {
	 'id':'equivalentSectionToolInfoDiv'
      });

      this.infoText = new Element('div', {
	 'id':'equivalentSectionToolInfoText'
      });
      this.infoText.appendText('click on image then <OK> to get high-res section through this point');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      this.buttonContainer = new Element('div', {
	 'id': 'equivalentSectionToolButtonContainer'
      });

      this.okButton = new Element('div', {
         'id': 'equivalentSectionToolOKButton',
	 'class': 'equivalentSectionToolButton ok'
      });
      this.okButton.appendText('OK');

      this.cancelButton = new Element('div', {
         'id': 'equivalentSectionToolCancelButton',
	 'class': 'equivalentSectionToolButton cancel'
      });
      this.cancelButton.appendText('Cancel');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      this.infoText.inject(this.infoDiv, 'inside');
      this.infoDiv.inject(win, 'inside');

      this.okButton.inject(this.buttonContainer, 'inside');
      this.cancelButton.inject(this.buttonContainer, 'inside');
      this.buttonContainer.inject(win, 'inside');
      emouseatlas.emap.utilities.addButtonStyle('equivalentSectionToolOKButton');
      emouseatlas.emap.utilities.addButtonStyle('equivalentSectionToolCancelButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      this.okButton.addEvent('click',function() {
         this.doOK();
      }.bind(this));

      this.cancelButton.addEvent('click',function() {
	 this.doClosed();
      }.bind(this));

      //----------------------------------------
      // the equivalentSection marker
      //----------------------------------------
      this.markerContainer = new Element('div', {
	 'id': 'equivalentSectionMarkerContainer',
	 'class': 'markerContainer'
      });
      this.markerContainer.inject($('emapIIPViewerDiv'), 'inside');

      this.markerArm0 = new Element('div', {
	 'id': 'equivalentSectionMarkerArm0',
	 'class': 'markerArm zero'
      });
      this.markerArm90 = new Element('div', {
	 'id': 'equivalentSectionMarkerArm90',
	 'class': 'markerArm ninety'
      });
      this.markerArm180 = new Element('div', {
	 'id': 'equivalentSectionMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      this.markerArm270 = new Element('div', {
	 'id': 'equivalentSectionMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      this.markerArm0.inject(this.markerContainer, 'inside');
      this.markerArm90.inject(this.markerContainer, 'inside');
      this.markerArm180.inject(this.markerContainer, 'inside');
      this.markerArm270.inject(this.markerContainer, 'inside');

   }, // createElements

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("enter tiledImageOpacityTool modelUpdate:",modelChanges);

      if(modelChanges.initial === true) {
      }

      if(modelChanges.boundingBox === true) {
         this.boundingBox = this.model.getBoundingBox();
	 //console.log('tiledImageEquivalentSectionTool  BB ',this.boundingBox);
      }

      if(modelChanges.dst === true) {
         this.setMarkerVisible(false);
      }

      //console.log("exit tiledImageOpacityTool modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   viewUpdate: function(viewChanges, from) {

      //console.log("enter tiledImageEquivalentSectionTool viewUpdate:",viewChanges);

      var dx;
      var dy;
      var dz;
      var dist;
      var origin;
      var point;
      var scale;
      var unit;

      if(viewChanges.initial) {
	 this.setEquivalentSectionToolVisible(false);
      }

      //...................................
      if(viewChanges.mode) {
	 var mode = this.view.getMode();
	 //console.log("mode ",mode);
	 if(mode.name === 'HRSection') {
	    this.setEquivalentSectionToolVisible(true);
	    this.setMarkerVisible(false);
	 } else {
	    this.setMarkerVisible(false);
	    this.setEquivalentSectionToolVisible(false);
	 }
      }

      if(viewChanges.HRSection) {
         var clickPos = this.view.getMouseClickPosition();
         var viewerPos = this.view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x -12;
	 var top = clickPos.y - viewerPos.y -12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 this.markerContainer.setStyles({'left': left, 'top': top});
	 this.setMarkerVisible(true);
	 this.model.setBoundingBox();
      }

      if(viewChanges.scale) {
         this.setMarkerVisible(false);
      }

      //console.log("exit tiledImageEquivalentSectionTool viewUpdate:");
   }, // viewUpdate

   //--------------------------------------------------------------
   // launch the high-res section
   //--------------------------------------------------------------
   doOK: function () {
      //console.log("launch the high-res section through ");
      var section = this.calcEquivSection();
      var url = this.getSectionUrl();
      var fullUrl = url + '?section=' + section;
      //console.log("tiledImageEquivalentSectionTool fullUrl %s",fullUrl);
      this.view.launchEquivalentSection(fullUrl);
   },

   //--------------------------------------------------------------
   calcEquivSection: function () {

      if(this.boundingBox === undefined || this.boundingBox === null) {
         this.boundingBox = this.model.getBoundingBox();
      }

      var offset;
      var HRPoint;
      var fxPt;
      var sectionOrderReversed;
      var section;

      offset = this.model.getEquivSectionOffset();
      HRPoint = this.view.getHRSectionPoint();
      fxPt = this.model.getThreeDInfo().fxp;
      sectionOrderReversed = this.model.getSectionOrderReversed();

      //console.log("calcEquivSection: HRPoint ",HRPoint);
      //console.log("calcEquivSection: fxPt ",fxPt);
      //console.log("calcEquivSection: this.boundingBox.z.max %d, this.boundingBox.z.min %d, HRPoint.z %d",this.boundingBox.z.max,this.boundingBox.z.min,HRPoint.z);
      if(sectionOrderReversed) {
         section = Math.abs(this.boundingBox.z.min - HRPoint.z + offset);
      } else {
         section = Math.abs(this.boundingBox.z.max - HRPoint.z + offset);
      }

      //console.log("calcEquivSection: offset ",offset);
      //console.log("calcEquivSection: sectionOrderReversed %s",sectionOrderReversed);
      //console.log("calcEquivSection: section  %d",section);
      return section;
   },

   //--------------------------------------------------------------
   getSectionUrl: function () {
      var metadataRoot;
      var webServer;
      var reg;
      var path1;
      var path2;
      var indx;
      var len;
      var url;

      metadataRoot = this.model.getMetadataRoot();
      webServer = this.model.getWebServer();

      // deprecated  04112014 ----- remove soon
      //reg = /data/;  // case sensitive regexp for "data"
      //path1 = metadataRoot.replace(reg, 'php');
      // deprecated ----- remove soon

      // deal with 3D anatomy files which have _3D (or anything) in their name before the /
      reg = /(^.*)(EMA[0-9][0-9]*).*(\/)/;  // case sensitive regexp for which remembers 3 groups
      path1 = metadataRoot.replace(reg, '$1$2$3');

      //console.log("getSectionUrl: metadataRoot %s, path1 %s",metadataRoot,path1);

      // hack to sort out equivalent section problem with anatomy models
      if(path1.indexOf("/anatomy/") !== -1) {
         reg = /anatomy/;
      } else {
         reg = /wlz/;
      }
      path2 = path1.replace(reg, 'sections');
      indx = path2.lastIndexOf('/');
      len = path2.length;
      url = webServer + path2.substring(0,len-1) + '.php';

      //console.log("getSectionUrl: path1 %s, path2 %s, len %d",path1,path2,len);
      //console.log("tiledImageEquivalentSectionTool.getSectionUrl: url %s",url);
      return url;
   },

   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.setMarkerVisible(false);
      this.setEquivalentSectionToolVisible(false);
      var modes = this.view.getModes();
      this.view.setMode(modes.move.name);
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
   setEquivalentSectionToolVisible: function(viz) {
      this.window.setVisible(viz);
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
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

});
