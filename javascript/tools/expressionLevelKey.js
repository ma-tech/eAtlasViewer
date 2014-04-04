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
//   expressionLevelKey.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// expressionLevelKey
//---------------------------------------------------------
//emouseatlas.emap.expressionLevelKey = new Class ({
var expressionLevelKey = new Class ({

   initialize: function(params) {

      //console.log("enter expressionLevelKey.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.name = "expressionKey";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
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
      this.window.container.style.visibility = 'hidden';

      /* uncomment this if you want tool tips for the expression key.
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

      //----------------------------------------
      // the expression key image stuff
      //----------------------------------------

      this.image = new Element( 'img', {
	 'id': this.shortName + '-image',
	 'styles': { }
      });
      this.image.inject( this.window.win , 'inside');

      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

      this.layerNames = [];

      this.expressionTextContainer = new Element('div', {
	    'id': 'textContainer_expression'
	    });

      this.expressionTextDiv = new Element('div', {
	    'id': 'textDiv_expression'
	    });
      this.expressionTextDiv.set('text', 'expression level');

      var topEdge = $(this.shortName + '-topedge');

      this.expressionTextDiv.inject(this.expressionTextContainer, 'inside');
      this.expressionTextContainer.inject(topEdge, 'inside');

      if(this.model.modelReady()) {
	 this.image.src = this.model.getFullExpressionLevelKeyName();
	 this.image.addEvent('click',function() {
	    this.doKeyClicked();
	 }.bind(this));
	 //console.log("expressionLevelKey modelUpdate: %s",this.image.src);
      }

      //----------------------------------------
      // containers for the layer selectors
      //----------------------------------------

      var win = $(this.shortName + '-win');
      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var layerVisibility = this.view.getLayerVisibility();
      var i;
      var selected = '';

      for(i=0; i<numlayers; i++) {
         //if(i === numlayers - 1) {
         if(i === 0) {
	    selected = ' selected';
	 } else {
	    selected = '';
	 }
	 var left = 1 + i*175;
	 var layerDiv = new Element('div', {
	    'id': layerNames[i] + '_keyLayerDiv',
	    'class': 'layerDiv_key' + selected,
	    'styles': {
	       'left': left + 'px'
	    }
	 });

	 var layerTextContainer = new Element('div', {
	    'id': layerNames[i] + '_layerTextContainer',
	    'class': 'layerTextContainer_key'
	 });

	 var layerTextDiv = new Element('div', {
	    'id': layerNames[i] + '_layerTextDiv',
	    'class': 'layerTextDiv_key'
	 });

	 if(i === 0) {
	    layerTextDiv.set('text', 'raw data');
	 } 
	 if(i === numlayers - 1) {
	    layerTextDiv.set('text', 'expression level');
	 } 

         if(layerVisibility[layerNames[i]].visible === true || layerVisibility[layerNames[i]].visible === 'true') {
	    checked = 'checked';
	 } else {
	    checked = '';
	 }

	 var layerRadioDiv = new Element('div', {
	    'class': 'layerRadioDiv_key'
	 });

	 var layerRadio = new Element( 'input', {
	    'id': layerNames[i] + '_layerRadio',
	    'name': 'layerRadio',
	    'type': 'radio',
	    'checked': checked
	 });


	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 layerDiv.inject(win, 'inside');
	 layerTextDiv.inject(layerTextContainer, 'inside');
	 layerRadio.inject(layerRadioDiv, 'inside');
	 layerRadioDiv.inject(layerDiv, 'inside');
	 layerTextContainer.inject(layerDiv, 'inside');

	 //----------------------------------------
	 // add event handlers
	 //----------------------------------------

	 layerRadio.addEvent('change', function(e){
	    this.doRadioChanged(e);
	 }.bind(this));

	 layerDiv.addEvent('click', function(e){
	    this.doLayerClicked(e);
	 }.bind(this));
      }

   }, // initialize

   //---------------------------------------------------------------
   doRadioChanged: function(e) {

      //console.log("enter expressionLevelKey doRadioChanged:");
      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("expressionLevelKey target ",target);

      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var i;

      for(i=0; i<numlayers; i++) {
	 if(target.id.indexOf(layerNames[i]) >= 0) {
	    this.view.setLayerVisibility({layer:layerNames[i], value: true});
	 } else {
	    this.view.setLayerVisibility({layer:layerNames[i], value: false});
	 }
      }

      var clearParams = {scale: false, distance: false};
      this.view.clearTiles(clearParams);
      setTimeout("emouseatlas.emap.tiledImageView.requestImages()", 10);
   },

   //---------------------------------------------------------------
   doLayerClicked: function(e) {
      //console.log("enter expressionLevelKey doLayerClicked:");
      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("expressionLevelKey target ",target);

      // the radio button is in the layer div so ignore radio button events
      if(target.id.indexOf("_layerRadio") >= 0) {
	 //console.log("doLayerClicked returning: event from radio button ",target.id);
         return;
      }

      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var layerVisibility = this.view.getLayerVisibility();
      var i;
      var layerToClick;

      for(i=0; i<numlayers; i++) {
	 if(target.id.indexOf(layerNames[i]) >= 0) {
	    if(layerVisibility[layerNames[i]].visible === false || layerVisibility[layerNames[i]].visible === 'false') {
	       $(layerNames[i] + '_layerRadio').click();
	       break;
	    }
	 }
      }
   },

   //---------------------------------------------------------------
   doKeyClicked: function() {
      //console.log("enter expressionLevelKey doKeyClicked:");
      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var layerVisibility = this.view.getLayerVisibility();

      for(i=0; i<numlayers; i++) {
	 if(layerVisibility[layerNames[i]].visible === false || layerVisibility[layerNames[i]].visible === 'false') {
	    $(layerNames[i] + '_layerRadio').click();
	    break;
	 }
      }
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges, trigger) {

      //console.log("enter expressionLevelKey modelUpdate:");
      if(modelChanges.initial === true) {
	 //console.log("expressionLevelKey modelUpdate: initial");
	 this.image.src = this.model.getFullExpressionLevelKeyName();
	 //console.log("expressionLevelKey modelUpdate: %s",this.image.src);
      }
      if(modelChanges.layerNames === true) {
	 //console.log("expressionLevelKey modelUpdate: layerNames");
	 this.layerNames = this.model.getLayerNames();
      }
      //console.log("exit expressionLevelKey modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("enter expressionLevelKey viewUpdate:",viewChanges);

      if(viewChanges.initial === true) {
	 this.window.container.style.visibility = 'visible';
	 this.window.win.style.visibility = 'visible';
	 this.window.win.style.background = 'transparent';
      }

      //console.log("exit expressionLevelKey viewUpdate:");
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
