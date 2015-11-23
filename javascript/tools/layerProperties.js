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
//   layerProperties.js
//   Tool to manipulate Layer Properties in a tiled image
//   from an iip3D server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------
if(!emouseatlas) {
   var emouseatlas = {};
}
if(!emouseatlas.emap) {
   emouseatlas.emap = {};
}

//---------------------------------------------------------
// layerProperties
//---------------------------------------------------------
emouseatlas.emap.layerProperties = function() {

   var model;
   var view;
   var util;
   var trgt;
   var klass;
   var currentLayer;
   var prevLayer;
   var nLayers;
   var opacitySlider;
   var redSlider;
   var greenSlider;
   var blueSlider;
   var opacityNumber;
   var redNumber;
   var greenNumber;
   var blueNumber;
   var layerPropsTitleTextDiv;
   var layerPropsDragContainerId;
   var isVisible;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var EXISTS;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var targetId;
      var target;
      var layerData;
      var layer;
      var currentLayerName;
      var sliderLength;
      var isHorizontal;
      var layerPropsDragContainer;
      var layerPropsContainer;
      var layerPropsToolContainer;
      var layerPropsTitleTextContainer;
      var imgPath;
      var closeImg1;
      var closeImg2;
      var fs1;
      var fs2;
      var fs3;
      var legend1;
      var legend2;
      var legend3;
      //------------------------
      var renderModeSelect;
      var renderModes;
      //------------------------

      targetId = model.getProjectDivId();
      //console.log("layerProperties targetId %s",targetId);

      target = $(targetId);

      layerPropsDragContainer = $(layerPropsDragContainerId);

      if(layerPropsDragContainer) {
         layerPropsDragContainer.parentNode.removeChild(layerPropsDragContainer);
      }
      
      setLayerProperties();

      //----------------------------------------
      // the drag container
      //----------------------------------------
      layerPropsDragContainer = new Element('div', {
         'id': layerPropsDragContainerId,
	 'class': klass
      });

      //----------------------------------------
      // the slider & checkbox container
      //----------------------------------------
      layerPropsToolContainer = new Element('div', {
         'id': 'layerPropsToolContainer',
         'class': 'layerPropsToolContainer'
      });

      layerPropsTitleTextContainer = new Element('div', {
         'class': 'layerPropsTitleTextContainer'
      });

      layerPropsTitleTextDiv = new Element('div', {
         'class': 'layerPropsTitleTextDiv'
      });
      layerPropsTitleTextDiv.set('text', 'layer properties');

      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      imgPath = model.getInterfaceImageDir();
      closeImg1 = imgPath + "close_10x8.png";
      closeImg2 = imgPath + "close2_10x8.png";

      closeButton = new Element('div', {
	 'id': 'layerPropsCloseButton',
	 'class': 'closeButton layerProps'
      });

      closeImg = new Element( 'img', {
	 'id': 'layerPropsCloseImg',
	 'class': 'closeButtonImg',
	 'src': closeImg1
      });

      //----------------------------------------
      // add the elements
      //----------------------------------------

      layerPropsDragContainer.inject(target, 'inside');
      layerPropsToolContainer.inject(layerPropsDragContainer, 'inside');
      layerPropsTitleTextContainer.inject(layerPropsDragContainer, 'inside');
      layerPropsTitleTextDiv.inject(layerPropsTitleTextContainer, 'inside');

      closeImg.inject(closeButton, 'inside');
      closeButton.inject(layerPropsTitleTextContainer, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('layerPropsCloseButton');

      //--------------------------------
      // add event handlers
      //--------------------------------
      closeButton.addEvent('mouseup', function(event){
	 doClosed();
      }); 

      closeImg.addEvent('mouseover', function(){
	 closeImg.set('src', closeImg2);
      }); 
      
      closeImg.addEvent('mouseout', function(){
	 closeImg.set('src', closeImg1);
      }); 

      //-------------------------------------------------------------------------------
      if(hasOpacity) {

	 fs1 = new Element('fieldset', {
	    'id': 'opacityFieldset',
	    'name': 'opacityFieldset',
	    'class': 'opacity'
	 });

	 legend1 = new Element('legend', {
	    'id': 'opacityFieldsetLegend',
	    'name': 'opacityFieldsetLegend'
	 });
	 legend1.set('text', 'opacity');

	 opacitySlider = new Element('input', {
	    'id': 'opacitySlider',
	    'name': 'opacitySlider',
	    'class': 'opacity',
	    'type': 'range',
	    'min': '0.0',
	    'max': '255.0'
	 });
	 //opacitySlider.setCustomValidity("");
	 //opacitySlider.setAttribute("formnovalidate", "");

	 opacityNumber = new Element('input', {
	    'id': 'opacityNumber',
	    'class': 'layerProps',
	    'type': 'number',
	    'min': '0.0',
	    'max': '255.0'
	 });

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs1.inject(layerPropsToolContainer, 'inside');
	 legend1.inject(fs1, 'inside');
	 opacitySlider.inject(fs1, 'inside');
	 opacityNumber.inject(fs1, 'inside');

	 //--------------------------------
	 // add event handlers
	 //--------------------------------

	 opacitySlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 opacitySlider.addEvent('mousedown',function(e) {
	    enableLayerPropsDrag(false);
	 });
	 opacitySlider.addEvent('mouseup',function(e) {
	    enableLayerPropsDrag(true);
	 });
      
	 opacityNumber.addEvent('change',function(e) {
	    doLayerPropsNumberChanged(e);
	 });

      } // opacity

      //-------------------------------------------------------------------------------
      if(hasFilter) {

         //console.log("adding filter elements");

	 fs2 = new Element('fieldset', {
	    'id': 'filterFieldset',
	    'name': 'filterFieldset',
	    'class': 'filter'
	 });

	 legend2 = new Element('legend', {
	    'id': 'filterFieldsetLegend',
	    'name': 'filterFieldsetLegend'
	 });
	 legend2.set('text', 'colour filter');

	 redSlider = new Element('input', {
	    'id': 'redSlider',
	    'name': 'redSlider',
	    'class': 'red',
	    'type': 'range',
	    'min': 0,
	    'max': 255
	 });

	 greenSlider = new Element('input', {
	    'id': 'greenSlider',
	    'name': 'greenSlider',
	    'class': 'green',
	    'type': 'range',
	    'min': 0,
	    'max': 255
	 });

	 blueSlider = new Element('input', {
	    'id': 'blueSlider',
	    'name': 'blueSlider',
	    'class': 'blue',
	    'type': 'range',
	    'min': 0,
	    'max': 255
	 });

	 redNumber = new Element('input', {
	    'id': 'redNumber',
	    'class': 'layerProps',
	    'type': 'number',
	    'min': 0,
	    'max': 255
	 });

	 greenNumber = new Element('input', {
	    'id': 'greenNumber',
	    'class': 'layerProps',
	    'type': 'number',
	    'min': 0,
	    'max': 255
	 });

	 blueNumber = new Element('input', {
	    'id': 'blueNumber',
	    'class': 'layerProps',
	    'type': 'number',
	    'min': 0,
	    'max': 255
	 });

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs2.inject(layerPropsToolContainer, 'inside');
	 legend2.inject(fs2, 'inside');
	 redSlider.inject(fs2, 'inside');
	 redNumber.inject(fs2, 'inside');
	 greenSlider.inject(fs2, 'inside');
	 greenNumber.inject(fs2, 'inside');
	 blueSlider.inject(fs2, 'inside');
	 blueNumber.inject(fs2, 'inside');

	 //--------------------------------
	 // add event handlers
	 //--------------------------------
	 redSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 redSlider.addEvent('mousedown',function(e) {
	    enableLayerPropsDrag(false);
	 });
	 redSlider.addEvent('mouseup',function(e) {
	    enableLayerPropsDrag(true);
	 });
	 greenSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 greenSlider.addEvent('mousedown',function(e) {
	    enableLayerPropsDrag(false);
	 });
	 greenSlider.addEvent('mouseup',function(e) {
	    enableLayerPropsDrag(true);
	 });
	 blueSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 blueSlider.addEvent('mousedown',function(e) {
	    enableLayerPropsDrag(false);
	 });
	 blueSlider.addEvent('mouseup',function(e) {
	    enableLayerPropsDrag(true);
	 });
      
	 redNumber.addEvent('change',function(e) {
	    doLayerPropsNumberChanged(e);
	 });
	 greenNumber.addEvent('change',function(e) {
	    doLayerPropsNumberChanged(e);
	 });
	 blueNumber.addEvent('change',function(e) {
	    doLayerPropsNumberChanged(e);
	 });

      } // filter

      //-------------------------------------------------------------------------------
      if(hasRenderMode) {
      
         //----------------------------------------
         // the container for render mode radio buttons
         //----------------------------------------

	 fs3 = new Element('fieldset', {
	    'id': 'renderModeFieldset',
	    'name': 'renderModeFieldset',
	    'class': 'renderMode'
	 });

	 legend3 = new Element('legend', {
	    'id': 'renderModeFieldsetLegend',
	    'name': 'renderModeFieldsetLegend'
	 });
	 legend3.set('text', 'render mode');

	 renderModeSelect = new Element('select', {
	    'id': 'renderModeSelect',
	    'name': 'renderModeSelect',
	    'class': 'renderMode'
	 });

         currentLayerName = view.getCurrentLayer();
         layerData = model.getLayerData();
	 layer = layerData[currentLayerName];
	 renderModes = layer.props.renderModes;
	 //console.log("currentLayerName %s renderModes ",currentLayerName, renderModes);

	 option1 = new Element('option', {
	    'id': 'option1',
	    'class': 'renderMode',
	    'value': 'sect'
	 });
	 option1.set('text', 'section');

	 option2 = new Element('option', {
	    'id': 'option2',
	    'class': 'renderMode',
	    'value': 'prjn'
	 });
	 option2.set('text', 'projection');

	 option3 = new Element('option', {
	    'id': 'option3',
	    'class': 'renderMode',
	    'value': 'prjv'
	 });
	 option3.set('text', 'pseudo 3d');

	 option4 = new Element('option', {
	    'id': 'option4',
	    'class': 'renderMode',
	    'value': 'prjd'
	 });
	 option4.set('text', 'pseudo 3d');

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs3.inject(layerPropsToolContainer, 'inside');
	 legend3.inject(fs3, 'inside');
	 renderModeSelect.inject(fs3, 'inside');
	 len = renderModes.length;
	 for(i=0; i<len; i++) {
	    switch(renderModes[i]) {
	       case "sect":
		  option1.inject(renderModeSelect, 'inside');
	       break;
	       case "prjn":
		  option2.inject(renderModeSelect, 'inside');
	       break;
	       case "prjv":
		  option3.inject(renderModeSelect, 'inside');
	       break;
	       case "prjd":
		  option4.inject(renderModeSelect, 'inside');
	       break;
	    }
	 }

	 //--------------------------------
	 // add event handlers
	 //--------------------------------

	 renderModeSelect.addEvent('change',function(e) {
	    doRenderModeChanged(e);
	 });


      } // renderMode

   }; // createElements

   //---------------------------------------------------------
   var doLayerPropsSliderChanged = function (e) {

      var target;
      var id;
      var val;
      var indx;
      var prefix;
      var numb;
      var opacityVal;
      var colVal;
      var params;

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 //console.log("doLayerPropsSliderChanged no target.id");
	 return;
      }

      val = target.value;
      //console.log("doLayerPropsSliderChanged target.id %s %d",id, val);

      indx = id.indexOf("Slider");
      prefix = id.substring(0,indx);
      numb = $(prefix + "Number");
      numb.set('value', val);

      switch(prefix) {
         case "opacity":
	    opacityVal = val / 255;
	    opacityVal = opacityVal.toFixed(2);
	    params = {value:opacityVal, fromSlider: true};
	    view.setOpacity(params);
	    break;
         case "red":
         case "green":
         case "blue":
	    colVal = Number(val);
	    params = {type: prefix, value: colVal, fromSlider: true};
	    //console.log("doLayerPropsSliderChanged",params);
	    view.setFilter(params, "doLayerPropsSliderChanged");
	    break;
      }
   };

   //---------------------------------------------------------
   var doLayerPropsNumberChanged = function (e) {

      var target;
      var id;
      var indx;
      var prefix;
      var numb;
      var val;
      var opacityVal;
      var colVal;
      var params;

      if(EXT_CHANGE) {
         return false;
      }

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);
      id = target.id;
      val = target.value;

      indx = id.indexOf("Number");
      prefix = id.substring(0,indx);

      NUMBER_CHANGE = true;

      switch(prefix) {
         case "opacity":
	    val = validateInput(val);
	    opacityVal = val / 255;
	    opacityVal = opacityVal.toFixed(4);
            //console.log("number changed to %d for %s",val,prefix);
	    params = {value:opacityVal, fromSlider: true};
	    view.setOpacity(params);
	    break;
         case "red":
         case "green":
         case "blue":
	    colVal = validateInput(val);
	    params = {type: prefix, value: colVal, fromSlider: true};
	    //console.log("doLayerPropsSliderChanged",params);
	    view.setFilter(params, "doLayerPropsSliderChanged");
	    break;
      }

      return false;
   };

   //---------------------------------------------------------
   var doRenderModeChanged = function (e) {

      var target;
      var id;
      var mode;

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 console.log("doLayerPropsSliderChanged no target.id");
	 return;
      }

      mode = target.value;
      console.log("doRenderModeChanged target.id %s value %s",id, mode);

      currentLayer = view.getCurrentLayer();
      view.setLayerRenderMode({layer:currentLayer, mode:mode});

      return false;
   };

   //---------------------------------------------------------
   var validateInput = function (val) {

      var sane;

      sane = isNaN(val) ? 0 : val;
      sane = (sane < 0) ? 0 : sane;
      sane = (sane > 255) ? 255 : sane;

      return sane;
   };

   //---------------------------------------------------------------
   var enableLayerPropsDrag = function(draggable) {

      //console.log("enableRotToolDrag: %s",draggable);
      var dragContainer;

      dragContainer = $(layerPropsDragContainerId);
      dragContainer.setAttribute("draggable", draggable);

   };

   //---------------------------------------------------------
   var doLayerPropsSliderFocus = function (e) {
      //console.log("Focus");
   };

   //---------------------------------------------------------------
   var setLayerProperties = function () {

      var layers;
      var layer;
      var currentLayerName;
      var props;

      layers = model.getLayerData();
      currentLayerName = view.getCurrentLayer();
      layer = layers[currentLayerName];
      props = layer.props;

      //console.log(props);

      hasOpacity = props.opacity;
      hasFilter = props.filter;
      hasRenderMode = (props.renderModes === undefined || props.renderModes === "false") ? false : true;

   }; // setLayerProperties

   //---------------------------------------------------------------
   var doClickRadio = function(e) {

      var mode;
      var LRM;

      //console.log("%s doClickRadio:",name);
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }

      mode = target.value;

      view.setLayerRenderMode({layer:currentLayer, mode:mode});

      // just as a check ...
      if(_debug) {
	 LRM = view.getLayerRenderMode(currentLayer);
	 mode = LRM.mode;
	 console.log("doClickRadio: mode now ",mode);
      }

   };

   //--------------------------------------------------------------
   var setToCurrentLayer = function () {

      var currentLayerName;
      var layerData;
      var layer;
      var val;
      var opacity;
      var filter;
      var renderModes;
      var mode;
      var i;

      currentLayerName = view.getCurrentLayer();
      //console.log("setToCurrentLayer: %s ",currentLayerName);

      if(layerPropsTitleTextDiv) {
	 layerPropsTitleTextDiv.set('text', currentLayerName + " layer properties");
      }

      if(hasOpacity) {
         opacity = view.getOpacity(currentLayerName);
	 //console.log("layerProperties.setToCurrentLayer opacity ",opacity);
	 val = Math.round(opacity * 255);
	 opacitySlider.set('value', val);
	 opacityNumber.set('value', val);
      }

      if(hasFilter) {
	 filter = view.getFilter(currentLayerName);
	 val = parseInt(filter.red, 10);
	 redSlider.set('value', val);
	 redNumber.set('value', val);

	 val = parseInt(filter.green, 10);
	 greenSlider.set('value', val);
	 greenNumber.set('value', val);

	 val = parseInt(filter.blue, 10);
	 blueSlider.set('value', val);
	 blueNumber.set('value', val);
      }

      if(hasRenderMode) {
	 renderMode = view.getLayerRenderMode(currentLayerName);
	 //console.log("renderMode: ",renderMode);
	 renderModeSelect.set('value', renderMode.mode);
      }
   };   // setToCurrentLayer

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setPropertiesVisible(false, "doClosed");
      isVisible = false;
   };

   //---------------------------------------------------------------
   var setPropertiesVisible = function(show, from) {
      //console.log("setPropertiesVisible: %s, from %s",show, from);
      var props = $(layerPropsDragContainerId);
      var viz = show ? "visible" : "hidden";
      props.setStyle("visibility", viz);
   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      util = emouseatlas.emap.utilities;

      model.register(this, "layerProperties");
      view.register(this, "layerProperties");

      _debug = false;

      dropTargetId = model.getProjectDivId();
      //console.log("layerProperties dropTargetId %s",dropTargetId);

      nLayers = model.getLayerNames().length;
      //console.log("nLayers ",nLayers);

      layerPropsDragContainerId = "layerPropsDragContainer";

      klass = (params.klass === undefined) ? "" : params.klass; 

      EXISTS = false;

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;

      prevLayer = undefined;

   }; // initialise

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      if(modelChanges.initial === true) {
      }
   }; // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   var viewUpdate = function(viewChanges, from) {

      //console.log("enter tiledImagePropertiesTool viewUpdate:",viewChanges);

      var currentLayerData;
      var opacity;
      var filter;

      if(viewChanges.initial === true) {
         currentLayer = view.getCurrentLayer();
      }

      //...................................
      if(viewChanges.showProperties === true) {

	 //console.log("props: viewChanges.showProperties %s",viewChanges.showProperties);

	 if (prevLayer === undefined) {
	    isVisible = true;
	    prevLayer = currentLayer;
	 } else if (currentLayer === prevLayer) {
	    isVisible = !isVisible;
	 } else {
	    isVisible = true;
	    prevLayer = currentLayer;
	 }

	 EXISTS = true;
	 setPropertiesVisible(isVisible, "viewChanges.showProperties");
      }

      //...................................
      if(viewChanges.layer === true) {

         var XY;

	 //console.log("props: viewChanges.layer %s, EXISTS %s",viewChanges.layer, EXISTS);

	 if(nLayers === 1 && EXISTS) {
	    return false;
	 }

	 currentLayer = view.getCurrentLayer();
         createElements();
	 setToCurrentLayer();
         emouseatlas.emap.drag.register({drag:layerPropsDragContainerId, drop:dropTargetId}, "layerProperties");
	 XY = emouseatlas.emap.drag.getXY(layerPropsDragContainerId);
	 //console.log("viewChanges.layer XY ",XY);
	 if(XY) {
	    $(layerPropsDragContainerId).setStyle("left", XY.x + 'px');
	    $(layerPropsDragContainerId).setStyle("top", XY.y + 'px');
	 }

      }

      //...................................
      if(viewChanges.opacity === true) {

	 currentLayer = view.getCurrentLayer();
	 opacity = view.getOpacity(currentLayer);
	 //console.log("viewChanges.opacity  for layer %s to %d",currentLayer,opacity);
	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       opacitySlider.value = opacity * 255;
	       opacityNumber.value = Math.round(opacity * 255);
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }
      }

      //...................................
      if(viewChanges.filter === true) {

	 currentLayer = view.getCurrentLayer();
	 filter = view.getFilter(currentLayer);
	 //console.log("viewChanges.filter  for layer %s to ",currentLayer,filter);
	 if(NUMBER_CHANGE) {
	    EXT_CHANGE = true;
	       redSlider.value = filter.red;
	       redNumber.value = filter.red;
	       greenSlider.value = filter.green;
	       greenNumber.value = filter.green;
	       blueSlider.value = filter.blue;
	       blueNumber.value = filter.blue;
	    EXT_CHANGE = false;
            NUMBER_CHANGE = false;
	 }
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "layerProperties";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      getName: getName
   };

}();
