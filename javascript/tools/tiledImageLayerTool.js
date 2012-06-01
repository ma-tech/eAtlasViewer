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
//   tiledImageLayerTool.js
//   Tool to manipulate Layers in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageLayerTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageLayerTool = new Class ({
var tiledImageLayerTool = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter tiledImageLayerTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "LayerTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;
      this.propertiesToolTipText = 'open properties dialogue';

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);

      // the base height (with no layers).
      //this.baseHeight = 18; // with slider
      this.baseHeight = 0;
      this.heightOfOneLayer = 25;

      var imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:params.params.drag,
					 thinTopEdge:params.params.thinTopEdge,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: imagePath,
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

      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer5'
      });

      var win = $(this.shortName + '-win');
      var topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(topEdge, 'inside');

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.sliderTextDiv.set('text', 'Layers');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // containers for the layer indicators
      //----------------------------------------

      var layerNames = this.model.getLayerNames();
      var currentLayer = this.view.getCurrentLayer();
      var layerData = this.model.getLayerData();
      var numlayers = layerNames.length;
      this.height = this.baseHeight + numlayers * this.heightOfOneLayer;
      var layerVisibility = this.view.getLayerVisibility();

      var i;
      var selected = '';

      for(i=0; i<numlayers; i++) {
         if(layerNames[i] === currentLayer) {
	    selected = ' selected';
	 } else {
	    selected = '';
	 }
         //var top = 20 + i*25; // with slider
         var top = 2 + i*25;
	 var wid = this.width - 4;
	 var txtwid = this.width - 30;

	 var layerDiv = new Element('div', {
	    'id': layerNames[i] + '_layerDiv',
	    'class': 'layerDiv' + selected
	 });
	 layerDiv.setStyles({
                             'width':wid+'px',
                             'top': top + 'px'
                            });

	 var layerTextContainer = new Element('div', {
	    'id': layerNames[i] + '_layerTextContainer',
	    'class': 'layerTextContainer'
	 });

	 var layerTextDiv = new Element('div', {
	    'id': layerNames[i] + '_layerTextDiv',
	    'class': 'layerTextDiv' + selected
	 });

	 layerTextDiv.set('text', layerNames[i]);
	 layerTextDiv.setStyle('width',txtwid+'px');

	 /*
	 var layerForm = new Element( 'form', {
	    'id': layerNames[i] + '_layerForm',
	 });
	 */

	 var layerCheckboxContainer = new Element('div', {
	    'id': layerNames[i] + '_checkboxContainer',
	    'class': 'checkboxDiv_layer'
	 });
         if(layerVisibility[layerNames[i]].visible === "true") {
	    checked = 'checked';
	 } else {
	    checked = '';
	 }
	 var layerCheckbox = new Element( 'input', {
	    'id': layerNames[i] + '_layerCheckbox',
	    'type': 'checkbox',
	    'checked': checked
	 });

	 //----------------------------------------
	 // container for properties button stuff
	 //----------------------------------------
	 var propertiesButtonDiv;
	 var propertiesIndicatorDiv;
	 var propertiesButtonText;
	 propertiesButtonDiv = new Element( 'div', {
	    'id': layerNames[i] + '_propertiesDiv',
	    'class': 'propertiesButtonDiv_layer'
	 });

	 propertiesButtonText = new Element('div', {
	    'id': layerNames[i] + '_propertiesText',
	    'class': 'propertiesButtonText_layer'
	 });
	 propertiesButtonText.appendText('Props');

	 propertiesIndicatorDiv = new Element('div', {
	    'id': layerNames[i] + '_propertiesIndicator',
	    'class': 'propertiesIndicatorDiv_layer'
	 });

	 propertiesIndicatorDiv.inject(propertiesButtonDiv, 'inside');
	 propertiesButtonText.inject(propertiesButtonDiv, 'inside');

	 /*
	 // tooltips for properties button
	 propertiesButtonDiv.addEvent('mouseover', function(e){

	    this.propTipX = e.client.x;
	    this.propTipY = e.client.y;

	    this.pttchain = new Chain();
	    var showTip = function () {
	       this.showPropertiesToolTip(true);
	       this.pttchain.callChain.delay(1000, this.pttchain);
	    }.bind(this);
	    var hideTip = function () {
	       this.showPropertiesToolTip(false);
	    }.bind(this);
	    this.pttchain.chain(showTip).chain(hideTip);
	    this.pttchain.callChain.delay(250, this.pttchain);
	 }.bind(this));

	 propertiesButtonDiv.addEvent('mouseout', function(){
	    if(typeof(this.pttchain) === 'undefined') {
	       this.showPropertiesToolTip(false);
	    } else {
	       this.pttchain.clearChain();
	       this.showPropertiesToolTip(false);
	    }
	 }.bind(this));
	 */

	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 layerDiv.inject(win, 'inside');

	 //layerForm.inject(layerDiv, 'inside');
	 layerCheckbox.inject(layerCheckboxContainer, 'inside');
	 layerCheckboxContainer.inject(layerDiv, 'inside');

	 layerTextDiv.inject(layerTextContainer, 'inside');
	 layerTextContainer.inject(layerDiv, 'inside');

	 if(this.model.hasPropertiesTool() === true || this.model.hasPropertiesTool() === "true") {
	    propertiesButtonDiv.inject(layerDiv, 'inside');
	 }

	 //----------------------------------------
	 // add event handlers
	 //----------------------------------------

	 layerCheckbox.addEvent('change', function(e){
	    this.doCheckboxChanged(e);
	 }.bind(this));

	 layerDiv.addEvent('click', function(e){
	    this.doLayerClicked(e);
	 }.bind(this));

	 propertiesButtonDiv.addEvent('click', function(e){
	    this.doPropertiesDivClicked(e);
	 }.bind(this));

         emouseatlas.emap.utilities.addButtonStyle(layerNames[i] + '_propertiesDiv');
      } // for

      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);
      this.setPropertiesToolTip(this.propertiesToolTipText);

      if(this.model.modelReady()) {
	 //this.slider.setUserChange(false);
	 //this.slider.setPosition(1.0);
	 //this.slider.setUserChange(true);
      }

   }, // initialize

   //---------------------------------------------------------------
   // If checkbox is checked the layer will be loaded and displayed
   //---------------------------------------------------------------
   doCheckboxChanged: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doCheckboxChanged: target ",target);
      //var type = emouseatlas.emap.utilities.getEventType(e);

      // the checkbox is in the layer div so ignore layer click events
      if(target.id.indexOf("_layerCheckbox") === -1) {
	 //console.log("doCheckboxChanged returning: event not from checkbox ",target.id);
         return;
      }

      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var i;

      for(i=0; i<numlayers; i++) {
	 if($(layerNames[i] + '_layerCheckbox') === target) {
	    //console.log(target," checked ",target.checked);
	    this.view.setLayerVisibility({layer:layerNames[i], value:target.checked});
	    break;
	 }
      }

      if(!target.checked) {
	 var clearParams = {scale: false, distance: false};
	 //console.log("doCheckboxChanged: about to clearTiles");
	 this.view.clearTiles(clearParams);
      }
      //console.log("doCheckboxChanged: about to request images");
      setTimeout("emouseatlas.emap.tiledImageView.requestImages()", 10);
   },

   //---------------------------------------------------------------
   // If layer is clicked it becomes the current layer (blue)
   //---------------------------------------------------------------
   doLayerClicked: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //var type = emouseatlas.emap.utilities.getEventType(e);
      // the checkbox is in the layer div so ignore checkbox events
      if(target.id.indexOf("_layerText") === -1) {
	 //console.log("doLayerClicked returning: event not from text ",target.id);
	 return;
      }

      var layerNames = this.model.getLayerNames();
      var numlayers = layerNames.length;
      var i;

      for(i=0; i<numlayers; i++) {
	 //if($(layerNames[i] + '_layerTextDiv') === target) {
	 if(target.id.indexOf(layerNames[i]) !== -1) {
	    this.view.setCurrentLayer(layerNames[i]);
	 }
      }
   },

   //---------------------------------------------------------------
   // If propertiesDiv is clicked a 'properties' dialogue is opened.
   // It also becomes the current layer.
   //---------------------------------------------------------------
   doPropertiesDivClicked: function(e) {

      //this.pttchain.clearChain();
      //this.showPropertiesToolTip(false);

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doPropertiesDivClicked: target ",target);
      //var type = emouseatlas.emap.utilities.getEventType(e);

      var layerNames = this.model.getLayerNames();
      var layer;
      var layerData = this.model.getLayerData();
      var numlayers = layerNames.length;
      var i;

      for(i=0; i<numlayers; i++) {
	 if($(layerNames[i] + '_propertiesText') === target) {
	    //console.log("doPropertiesDivClicked: layer %s",layerNames[i]);
	    layer = layerData[layerNames[i]];
	    this.view.setCurrentLayer(layerNames[i]);
	    this.view.showLayerProperties(layerNames[i]);
	 }
      }
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("enter tiledImageOpacityTool modelUpdate:",modelChanges);

      //if(modelChanges.initial === true) {
      //}

      //console.log("exit tiledImageOpacityTool modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   viewUpdate: function(viewChanges, from) {

      var currentLayer = this.view.getCurrentLayer();

      if(viewChanges.initial === true) {
	 this.window.setVisible(true);
      }

      if(viewChanges.layer === true) {
	 var layerNames = this.model.getLayerNames();
	 var numlayers = layerNames.length;
	 var i;

	 for(i=0; i<numlayers; i++) {
	    if(layerNames[i] === currentLayer) {
	       $(layerNames[i] + '_layerDiv').set('class', 'layerDiv selected');
	       $(layerNames[i] + '_layerTextDiv').set('class', 'layerTextDiv selected');
	    } else {
	       $(layerNames[i] + '_layerDiv').set('class', 'layerDiv');
	       $(layerNames[i] + '_layerTextDiv').set('class', 'layerTextDiv');
	    }
	 }
      }

      if(viewChanges.filter === true) {
         var filter = this.view.getFilter(currentLayer);
	 var red = (filter.red === 0) ? '00' : filter.red.toString(16);
	 var green = (filter.green === 0) ? '00' : filter.green.toString(16);
	 var blue = (filter.blue === 0) ? '00' : filter.blue.toString(16);
	 var bgrnd = "none repeat scroll 0 0 #" + red + green + blue;
	 //console.log("bgrnd %d",bgrnd);
	 $(currentLayer + '_propertiesIndicator').setStyles({'background':bgrnd});
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   }, // viewUpdate

   //--------------------------------------------------------------
   setToolTip: function (text) {
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
      //console.log("showToolTip left %s, top %s",left,top);
      left = $(this.shortName + '-container').getPosition().x;
      top = $(this.shortName + '-container').getPosition().y;
      if(show === true) {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'visible'});
      } else {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'hidden'});
      }
   },

   //--------------------------------------------------------------
   setPropertiesToolTip: function (text) {
      // we only want 1 toolTip
      if(typeof(this.propertiesToolTip === 'undefined')) {
	 this.propertiesToolTip = new Element('div', {
	    'id': this.shortName + '-propertiesToolTipContainer',
	    'class': 'toolTipContainer'
	 });
	 this.propertiesToolTip.inject($(this.targetId).parentNode, 'inside');
      }
      $(this.shortName + '-propertiesToolTipContainer').set('text', this.propertiesToolTipText);
   },

   //--------------------------------------------------------------
   showPropertiesToolTip: function (show) {
      var containerPos = this.view.getToolContainerPos();
      if(containerPos === undefined) {
         containerPos = {x:0};
      }
      var div = $(this.shortName + '-container')
      var toolPos = emouseatlas.emap.utilities.findPos(div);
      var left = toolPos.x - containerPos.x + parseInt(div.getStyle('width')) - 50;
      var top = toolPos.y - 5;

      if(show === true) {
	 $(this.shortName + '-propertiesToolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'visible'});
      } else {
	 $(this.shortName + '-propertiesToolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'hidden'});
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
