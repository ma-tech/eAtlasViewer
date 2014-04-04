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
   var project;
   var currentLayer;
   var prevLayer;
   var opacitySlider;
   var redSlider;
   var greenSlider;
   var blueSlider;
   var opacityValText;
   var redValText;
   var greenValText;
   var blueValText;
   var layerPropsTitleTextDiv;
   var layerPropsDragContainerId;
   var isVisible;
   var H_OPACITY;
   var H_OPACITY_FILTER;
   var H_OPACITY_RENDERMODE;
   var H_OPACITY_FILTER_RENDERMODE;
   var height;
   var MOUSE_DOWN;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var targetId;
      var target;
      var sliderLength;
      var isHorizontal;
      var layerPropsDragContainer;
      var layerPropsContainer;
      var layerPropsTitleTextContainer;
      var layerPropsForm;
      var fs1;
      var fs2;
      var fs3;
      var legend1;
      var legend2;
      var legend3;
      //------------------------
      var sectionRadioLabel;
      var shadowRadioLabel;
      var domintRadioLabel;
      var voxintRadioLabel;
      var sectionRadio;
      var shadowRadio;
      var domintRadio;
      var voxintRadio;

      targetId = model.getProjectDivId();
      target = $(targetId);

      layerPropsDragContainer = $("layerPropsDragContainer");

      if(layerPropsDragContainer) {
         layerPropsDragContainer.parentNode.removeChild(layerPropsDragContainer);
      }
      
      setLayerProperties();

      //----------------------------------------
      // the drag container
      //----------------------------------------
      layerPropsDragContainer = new Element('div', {
         'id': 'layerPropsDragContainer'
      });
      layerPropsDragContainer.setStyle('height', height);

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

      layerPropsForm = new Element('form', {
         'id': 'layerPropsForm',
	 'name': 'layerPropsForm'
      });

      layerPropsDragContainer.inject(target, 'inside');
      layerPropsToolContainer.inject(layerPropsDragContainer, 'inside');
      layerPropsTitleTextContainer.inject(layerPropsDragContainer, 'inside');
      layerPropsTitleTextDiv.inject(layerPropsTitleTextContainer, 'inside');
      layerPropsForm.inject(layerPropsToolContainer, 'inside');

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
	    'min': 0,
	    'max': 255
	 });

	 opacityValText = new Element('input', {
	    'id': 'opacityValText',
	    'class': 'layerProps opacity',
	    'type': 'text',
	    'readOnly': 'readonly'
	 });
	 opacityValText.set('value', "178");

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs1.inject(layerPropsForm, 'inside');
	 legend1.inject(fs1, 'inside');
	 opacitySlider.inject(fs1, 'inside');
	 opacityValText.inject(fs1, 'inside');

	 //--------------------------------
	 // add event handlers
	 //--------------------------------

	 opacitySlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 opacitySlider.addEvent('mousemove',function(e) {
	    doLayerPropsSliderMouseMoved(e);
	 });
	 opacitySlider.addEvent('mousedown',function(e) {
	    enableDrag(e);
	 });
	 opacitySlider.addEvent('mouseup',function(e) {
	    enableDrag(e);
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

	 redValText = new Element('input', {
	    'id': 'redValText',
	    'class': 'layerProps red',
	    'type': 'text',
	    'readOnly': 'readonly'
	 });

	 greenValText = new Element('input', {
	    'id': 'greenValText',
	    'class': 'layerProps green',
	    'type': 'text',
	    'readOnly': 'readonly'
	 });

	 blueValText = new Element('input', {
	    'id': 'blueValText',
	    'class': 'layerProps blue',
	    'type': 'text',
	    'readOnly': 'readonly'
	 });

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs2.inject(layerPropsForm, 'inside');
	 legend2.inject(fs2, 'inside');
	 redSlider.inject(fs2, 'inside');
	 redValText.inject(fs2, 'inside');
	 greenSlider.inject(fs2, 'inside');
	 greenValText.inject(fs2, 'inside');
	 blueSlider.inject(fs2, 'inside');
	 blueValText.inject(fs2, 'inside');

	 //--------------------------------
	 // add event handlers
	 //--------------------------------
	 redSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 redSlider.addEvent('mousedown',function(e) {
	    enableDrag(e);
	 });
	 redSlider.addEvent('mousemove',function(e) {
	    doLayerPropsSliderMouseMoved(e);
	 });
	 redSlider.addEvent('mouseup',function(e) {
	    enableDrag(e);
	 });
	 greenSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 greenSlider.addEvent('mousedown',function(e) {
	    enableDrag(e);
	 });
	 greenSlider.addEvent('mousemove',function(e) {
	    doLayerPropsSliderMouseMoved(e);
	 });
	 greenSlider.addEvent('mouseup',function(e) {
	    enableDrag(e);
	 });
	 blueSlider.addEvent('input',function(e) {
	    doLayerPropsSliderChanged(e);
	 });
	 blueSlider.addEvent('mousedown',function(e) {
	    enableDrag(e);
	 });
	 blueSlider.addEvent('mousemove',function(e) {
	    doLayerPropsSliderMouseMoved(e);
	 });
	 blueSlider.addEvent('mouseup',function(e) {
	    enableDrag(e);
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

         sectionRadioLabel = new Element('label', {
   	 'id': 'layerPropsSectionRadioLabel',
   	 'class':'renderMode section',
   	 'for': 'render_mode'
         });
         sectionRadio = new Element('input', {
   	 'id': 'layerPropsSectionRadio',
   	 'class':'renderMode section',
   	 'type': 'radio',
   	 'value': 'sect',
   	 'name': 'renderMode',
   	 'checked': 'true'
         });
   
         shadowRadioLabel = new Element('label', {
   	 'id': 'layerPropsShadowRadioLabel',
   	 'class':'renderMode shadow',
   	 'for': 'render_mode'
         });
         shadowRadio = new Element('input', {
   	 'id': 'layerPropsShadowRadio',
   	 'class':'renderMode shadow',
   	 'type': 'radio',
   	 'value': 'prjn',
   	 'name': 'renderMode',
         });
   
         domintRadioLabel = new Element('label', {
   	 'id': 'layerPropsDomintRadioLabel',
   	 'class':'renderMode domint',
   	 'for': 'render_mode'
         });
         domintRadio = new Element('input', {
   	 'id': 'layerPropsDomintRadio',
   	 'class':'renderMode domint',
   	 'type': 'radio',
   	 'value': 'prjd',
   	 'name': 'renderMode',
   	 'checked': 'true'
         });
   
         voxintRadioLabel = new Element('label', {
   	 'id': 'layerPropsVoxintRadioLabel',
   	 'class':'renderMode voxint',
   	 'for': 'render_mode'
         });
         voxintRadio = new Element('input', {
   	 'id': 'layerPropsVoxintRadio',
   	 'class':'renderMode voxint',
   	 'type': 'radio',
   	 'value': 'prjv',
   	 'name': 'renderMode',
         });
   
         sectionRadioLabel.set('text', 'section');
         shadowRadioLabel.set('text', 'shadow');
         domintRadioLabel.set('text', 'domint');
         voxintRadioLabel.set('text', 'voxint');

	 //--------------------------------
	 // add the elements
	 //--------------------------------
	 fs3.inject(layerPropsForm, 'inside');
	 legend3.inject(fs3, 'inside');
         sectionRadioLabel.inject(fs3, 'inside');
         shadowRadioLabel.inject(fs3, 'inside');
         domintRadioLabel.inject(fs3, 'inside');
         voxintRadioLabel.inject(fs3, 'inside');
         sectionRadio.inject(sectionRadioLabel, 'inside');
         shadowRadio.inject(shadowRadioLabel, 'inside');
         domintRadio.inject(domintRadioLabel, 'inside');
         voxintRadio.inject(voxintRadioLabel, 'inside');
   
   

	 //--------------------------------
	 // add event handlers
	 //--------------------------------
         sectionRadio.addEvent('click',function(e) {
            doClickRadio(e);
         });
   
         shadowRadio.addEvent('click',function(e) {
            doClickRadio(e);
         });
   
         domintRadio.addEvent('click',function(e) {
            doClickRadio(e);
         });
   
         voxintRadio.addEvent('click',function(e) {
            doClickRadio(e);
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
      var textIp;
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
      textIp = $(prefix + "ValText");
      textIp.set('value', val);

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
	    view.setFilter(params);
	    break;
      }
   };

   //---------------------------------------------------------
   var doLayerPropsSliderMouseMoved = function (e) {

      var target;
      var id;

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
      if(!MOUSE_DOWN) {
         target.blur();
      }

   };

   //---------------------------------------------------------
   var enableDrag = function (e) {

      var target;
      var dragContainer;
      //console.log(e);
      dragContainer = $("layerPropsDragContainer");
      target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }
      //console.log("enableDrag target.id ",target.id);

      dragContainer = $("layerPropsDragContainer");

      if(e.type.toLowerCase() === "mousedown") {
         MOUSE_DOWN = true;
         dragContainer.setAttribute("draggable", false);
      } else if(e.type.toLowerCase() === "mouseup") {
         MOUSE_DOWN = false;
         //target.blur();
         dragContainer.setAttribute("draggable", true);
      }

   };

   //---------------------------------------------------------
   var doLayerPropsSliderFocus = function (e) {
      //console.log("Focus");
   };

   //---------------------------------------------------------
   var doLayerPropsSliderFormChange = function (e) {
      //console.log("Form");
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

      hasOpacity = props.opacity;
      hasFilter = props.filter;
      hasRenderMode = props.renderMode;

      if(hasOpacity && !hasFilter && !hasRenderMode) {
         height = H_OPACITY;
      } else if(hasOpacity && hasFilter && !hasRenderMode) {
         height = H_OPACITY_FILTER;
      } else if(hasOpacity && !hasFilter && hasRenderMode) {
         height = H_OPACITY_RENDERMODE;
      } else if(hasOpacity && hasFilter && hasRenderMode) {
         height = H_OPACITY_FILTER_RENDERMODE;
      }

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
      var val;
      var opacity;
      var filter;
      var renderMode;
      var mode;
      var radios;
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
	 opacityValText.set('value', (val));
      }

      if(hasFilter) {
	 filter = view.getFilter(currentLayerName);
	 val = parseInt(filter.red, 10);
	 redSlider.set('value', val);
	 redValText.set('value', val);

	 val = parseInt(filter.green, 10);
	 greenSlider.set('value', val);
	 greenValText.set('value', val);

	 val = parseInt(filter.blue, 10);
	 blueSlider.set('value', val);
	 blueValText.set('value', val);
      }

      if(hasRenderMode) {
	 renderMode = view.getLayerRenderMode(currentLayerName);
	 mode = renderMode.mode.toLowerCase();
	 radios = document.getElementsByName("renderMode");
	 for( i = 0; i < radios.length; i++ ) {
	    radio = radios[i];
	    if(radio.value === mode) {
	       radio.checked = true;
	    }
	 }
	 //console.log("setToCurrentLayer layer %s, renderMode ",currentLayerName,mode);
         view.setLayerRenderMode({layer:currentLayerName, mode:mode});
      }
   };   // setToCurrentLayer

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setPropertiesVisible(false);
   };

   //---------------------------------------------------------------
   var setPropertiesVisible = function(show) {
      //console.log("properties setPropertiesVisible: ",show);
      var props = $("layerPropsDragContainer");
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

      model.register(this);
      view.register(this);

      _debug = false;

      project = (params.project === undefined) ? "emap" : params.project;

      dropTargetId = model.getProjectDivId();

      layerPropsDragContainerId = "layerPropsDragContainer";

      H_OPACITY = 30;
      H_OPACITY_FILTER = 100;
      H_OPACITY_RENDERMODE = 124;
      H_OPACITY_FILTER_RENDERMODE = 190;

      MOUSE_DOWN = false;

      emouseatlas.emap.drag.register({drag:layerPropsDragContainerId, drop:dropTargetId});

      prevLayer = undefined;
      isVisible = false;

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

	 if (prevLayer === undefined) {
	    setPropertiesVisible(true);
	    isVisible = !isVisible;
	    prevLayer = currentLayer;
	 } else if (currentLayer === prevLayer) {
	    isVisible = !isVisible;
	    setPropertiesVisible(isVisible);
	 } else {
	    setPropertiesVisible(true);
	    isVisible = true;
	    prevLayer = currentLayer;
	 }
      }

      //...................................
      if(viewChanges.layer === true) {

         var XY;

	 currentLayer = view.getCurrentLayer();
         createElements();
	 setToCurrentLayer();
         emouseatlas.emap.drag.register({drag:layerPropsDragContainerId, drop:dropTargetId});
	 XY = emouseatlas.emap.drag.getXY(layerPropsDragContainerId);
	 //console.log("viewChanges.layer XY ",XY);
	 if(XY) {
	    $(layerPropsDragContainerId).setStyle("left", XY.x + 'px');
	    $(layerPropsDragContainerId).setStyle("top", XY.y + 'px');
	 }
      }

      //console.log("exit tiledImagePropertiesTool viewUpdate:");
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
