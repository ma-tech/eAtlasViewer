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
//   tiledImageView.js
//   High resolution tiled image from an iip server
//   Using the 'module' pattern of Crockford, slightly modified by Christian Heilmann into the 'Revealing Module Pattern'
//---------------------------------------------------------

//---------------------------------------------------------
//---------------------------------------------------------
//   Dependencies:
//   none
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
// module for tiledImageView
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.tiledImageView = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var util = emouseatlas.emap.utilities;
   var busyIndicator = emouseatlas.emap.busyIndicator;
   var info = emouseatlas.emap.viewerInfo;

   // private members

   var _debug = false; // if true send lots of info to console
   var that = this;
   var registry = []; // allows the view to notify observers of changes to layer, viewport size etc.
   var viewChanges = { 
      initial: false,
      viewport: false,
      maximise: false,
      toolbox: false,
      scale: false,
      focalPoint: false,
      locatorMoved: false,
      layer: false,
      showProperties: false,
      mode: false,
      selectFixedPoint: false,
      debugPoint: false,
      debugWindow: false,
      measuringTool: false,
      measuringOrigin: false,
      measuringTarget: false,
      measuring: false,
      movePCPoint: false,
      mouseOut: false,
      HRSection: false,
      pointClick: false,
      editorPointClick: false,
      startDrawing: false,
      draw: false,
      endDrawing: false,
      endPCDrag: false,
      deleteMarkerLocation: false,
      addQueryTerm: false,
      visibility: false,
      opacity: false,
      filter: false,
      selections: false,
      wlzUpdated: false,
      locator: false,
      dblClick: false,
      showViewerHelp: false,
      hideViewerHelp: false,
      showX3domHelp: false,
      hideX3domHelp: false,
      showX3domUnsupported: false,
      hideX3domUnsupported: false,
      showViewerInfo: false,
      hideViewerInfo: false,
      showMarkerPopup: false,
      hideMarkerPopup: false,
      show3dAnatomyHelp: false,
      hide3dAnatomyHelp: false,
      threeD: false,
      hideMenu: false,
      contextMenuOn: false,
      contextMenuOff: false,
      threeDAnatomyWarning: false
   };
   var targetContainer;
   var model;
   var view;
   var query;
   var pointClick;
   var supplementPointClick;
   var gudmapPointClick;
   var eventCapturingContainer;
   var tileFrameContainers = {};
   var image = {};
   var fullImage = {};
   var viewport = {};
   var viewable = {};
   //var resolutionData = {};
   //var locatorData = {};
   //var selectorData = {};
   var resolution;
   var scale = {};
   var focalPoint = {x:0.5, y:0.5};
   var oldDst;
   var xfits;
   var yfits;
   var startx;
   var starty;
   var endx;
   var endy;
   var mouseDownInImage = false;
   var RIGHT_CLICK = false;
   var mousewheelIsSupported = false;
   var keepViewerHelpFrame = false;
   var keepViewerInfoFrame = false;
   var imageIsMaximised = false;
   var tileHasBorder = false;
   var tools = {};
   var toolsVisible = true;
   var measuring = false;
   var measuringOrigin = false;
   var measuringTarget = false;
   var movingPCPoint = false;
   var indexName = false;
   var overlay = false;
   var pointClickEditor = false;
   var debugWindow = false;
   var gettingDebugPoint = false;
   var contextMenu = false;
   var allowViewerInfo = false;
   var initialMousePoint;
   var initialFocalPoint;
   var layerNames = [];
   var numLayers;
   var currentLayer;
   var layerData = {};
   var layerVisibility = {};
   var layerRenderMode = {};
   var layerOpacity = {};
   var layerFilter = {};
   var currentSectionName = undefined;
   var sectionNames = [];
   var possibleFixedPoint = {};
   var measurementOrigin = {};
   var measurementTarget = {};
   var measurementPoint = {};
   var HRSectionPoint = {};
   var drawOrigin = {};
   var drawPoint = {};
   var debugPoint = {};
   var pointClickPoint = {};
   var initialPointClickPoint = {};
   var mouseDownTarget;
   var equivalentSectionId;
   var threeDId;
   var queryType = 0;
   var openWindows = [];
   var open3dWindows = [];
   var threeDLoaded = false;
   var max3dToShow;
   var origMax3dToShow;
   var SHOW_3D_ANATOMY_WARNING_DIALOG;
   var modes = {
                move:{name:'move', cursor:'move'},
                measuring:{name:'measuring', cursor:'pointer'},
                HRSection:{name:'HRSection', cursor:'pointer'},
                fixedPoint:{name:'fixedPoint', cursor:'crosshair'},
                pointClick:{name:'pointClick', cursor:'pointer'},
                query:{name:'query', cursor:'pointer'}
                //debug:{name:'debug', cursor:'pointer'},
	       }
   //var mode = {name:'move', cursor:'pointer'};
   var mode = {};
   var modeSubType = 0;
   var defaultModeName = 'move';
   var indexArray;
   var compObjIndxArr;
   var treeSelections = "";
   var skip = ["locator-container", "selector-container", "layertool-container", "expressionkey-container", "rotationtool-container"];
   var docX; // position of mouse click relative to document.
   var docY;
   var greyValue;
   var mouseMoveTimeStamp;
   var mouseMoveTimeout;
   var mouseMoveDelay = 200;
   var imgLabels_enabled;
   //var indexDataToolTip;
   //var indexDataToolTipText;

   var imageContextMenu;
   var tableContextMenu;

   var initialised = false;
   var imagePosition = {};

   var draw = undefined;
   var measure = undefined;
   var plateDropDown = undefined;
   var subPlateDropDown = undefined;
   var imageDropDown = undefined;
   var imgLabel;
   var colourChooser;
   var elementIdToColour;

   var stackofs = 0;
   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   var buildTileFrameContainer  = function () {

      //util.printNodes(targetContainer, 1, "   ");
      layerData = model.getLayerData();
      layerNames = model.getLayerNames();
      numLayers = layerNames.length;

      var data = undefined;
      var initialOpacity = 1.0;

      var tileFrameContainer;
      var tileFrame;
      var i,j;


      // Firefox doesn't support the 'mousewheel' event so we have to test for its support.
      // from http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
      //.................................................
      var testDiv = document.createElement('div');
      mousewheelIsSupported = 'mousewheel' in testDiv;
      if(!mousewheelIsSupported) {
	 testDiv.setAttribute('onmousewheel', 'return;');
	 if(typeof(testDiv.onmousewheel) !== 'undefined') {
	    mousewheelIsSupported = true;
	 }
      }
      //.................................................

      for(i=0; i<numLayers; i++) {
	 if(typeof(layerData[layerNames[i]]) !== 'undefined') {
	    data = layerData[layerNames[i]];
	    //console.log(data);
	    // make the tileFrameContainer
	    tileFrameContainer = document.createElement("div");
	    tileFrameContainer.id = layerNames[i] + "_tileFrameContainer";
	    tileFrameContainer.className = "tiledImgLayer";
	    //targetContainer.appendChild(tileFrameContainer);

	    // make the tileFrame
	    tileFrame = document.createElement("div");
	    tileFrame.id = layerNames[i] + "_tileFrame";
	    tileFrame.className = "tiledImgDiv";
	    //tileFrame.id = "tileframe";
	    tileFrameContainer.appendChild(tileFrame);

	    setLayerVisibility({layer:layerNames[i], value:data.visible});

	    if(data.props) {
	       //console.log("layer  %s ",layerNames[i], data.props);
	       if(data.props.opacity) {
		  setInitialOpacity(layerNames[i], data.props.initialOpacity);
	       }
	       if(data.props.filter) {
		  setInitialFilter(layerNames[i], data.props.initialFilter);
	       }
	       if(data.props.initialRenderMode) {
		  setInitialRenderMode(layerNames[i], data.props.initialRenderMode);
	       }
	    }

	    // set up the event handlers (we need to do it for each layer)
	    // only add/remove 'mousemove' on mousedown/mouseup (ie not here)
	    util.addEvent(tileFrame, 'click', doMouseClick, false);
	    util.addEvent(tileFrame, 'dblclick', doMouseDblClick, false);
	    util.addEvent(tileFrame, 'mousedown', doMouseDownInImage, false);
	    util.addEvent(tileFrame, 'mouseup', doMouseUpInImage, false);
	    util.addEvent(tileFrame, 'mouseover', doMouseOver, true);
	    util.addEvent(tileFrame, 'mouseout', doMouseOut, false);
	    util.addEvent(tileFrame, 'mousemove', doMouseMove, false);
	    //util.addEvent(window, 'mousedown', doMouseDown, false);
	    //util.addEvent(window, 'mouseup', doMouseUp, false);
	    //var wheel = mousewheelIsSupported ? 'mousewheel' : 'DOMMouseScroll';
	    //util.addEvent(window, wheel, doMouseWheel, false);
	    //util.addEvent(tileFrame, wheel, doMouseWheel, false);

	 }

	 if(typeof(tileFrameContainers[layerNames[i]]) === 'undefined') {
	    tileFrameContainers[layerNames[i]] = tileFrameContainer;
	    //util.printNodes(tileFrameContainer.firstChild, 1, "   ");
	 }

      } // for

      var current = model.getInitialCurrentLayer();
      setCurrentLayer(current);

      //util.printNodes(targetContainer, 1, "   ");

   }; // buildTileFrameContainer

   //---------------------------------------------------------
   var buildHelpIconContainer  = function () {
      //..............
      // the HelpFrame icon
      //..............
      var helpIconContainer = document.getElementById("helpIconContainer");

      util.addEvent(helpIconContainer, 'click', doViewerHelpIconClicked, false);
      util.addEvent(helpIconContainer, 'mouseover', showViewerHelpFrame, false);
      util.addEvent(helpIconContainer, 'mouseout', hideViewerHelpFrame, false);

   };

   //---------------------------------------------------------
   var buildInfoIconContainer  = function () {
      //..............
      // the InfoFrame icon
      //..............
      var infoIconContainer = document.getElementById("infoIconContainer");

      util.addEvent(infoIconContainer, 'click', doViewerInfoIconClicked, false);
      util.addEvent(infoIconContainer, 'mouseover', showViewerInfoFrame, false);
      util.addEvent(infoIconContainer, 'mouseout', hideViewerInfoFrame, false);

   };

   //---------------------------------------------------------------
   // called when help icon clicked
   //---------------------------------------------------------------
   var doViewerHelpIconClicked = function (event) {
      if(keepViewerHelpFrame === false) {
         keepViewerHelpFrame = true;
         showViewerHelp();
      } else {
         hideViewerHelp();
      }
   };

   //---------------------------------------------------------------
   // called when info icon clicked
   //---------------------------------------------------------------
   var doViewerInfoIconClicked = function (event) {
      if(keepViewerInfoFrame === false) {
         keepViewerInfoFrame = true;
         showViewerInfo();
      } else {
         hideViewerInfo();
      }
   };

   //---------------------------------------------------------------
   // called on mouseover help icon
   //---------------------------------------------------------------
   var showViewerHelpFrame = function (event) {
      showViewerHelp();
   };

   //---------------------------------------------------------------
   // called on mouseout help icon
   //---------------------------------------------------------------
   var hideViewerHelpFrame = function (event) {
      if(keepViewerHelpFrame) {
         return false;
      }
      hideViewerHelp();
      keepViewerHelpFrame = false;
   };

   //---------------------------------------------------------------
   // called on mouseover info icon
   //---------------------------------------------------------------
   var showViewerInfoFrame = function (event) {
      showViewerInfo();
   };

   //---------------------------------------------------------------
   // called on mouseout info icon
   //---------------------------------------------------------------
   var hideViewerInfoFrame = function (event) {
      if(keepViewerInfoFrame) {
         return false;
      }
      hideViewerInfo();
      keepViewerInfoFrame = false;
   };

   //---------------------------------------------------------
   var setInitialRenderMode = function (layer, renderMode) {

      //console.log("setInitialRenderMode for %s to %s",layer,layerData[layer].props.initialRenderMode);
      if(renderMode) {
         //console.log("hasRenderMode %s",layerData[layer].props.renderMode);
	 if(typeof(layerRenderMode[layer]) === 'undefined') {
	    layerRenderMode[layer] = {layer:layer, mode:renderMode};
	 } else {
	    layerRenderMode[layer].mode = {mode:renderMode};
	 }
      }
   };

   //---------------------------------------------------------
   var setInitialOpacity = function (layer, opacity) {

      //console.log("setInitialOpacity for layer %s to %s",layer,layerData[layer].props.initialOpacity);
      //console.log("layerData for layer %s ",layer,layerData[layer]);

      if(opacity) {
         //console.log("hasOpacity %s",layerData[layer].props.opacity);
	 if(typeof(layerOpacity[layer]) === 'undefined') {
	    layerOpacity[layer] = {name:layer, opacity:opacity};
	 } else {
	    layerOpacity[layer].opacity = {opacity:opacity};
	 }
	 applyTileFrameOpacity(layer);
      }
   };

   //---------------------------------------------------------
   var setInitialFilter = function (layer, filter) {

      //console.log("setInitialFilter for layer %s to ",layer,layerData[layer].props.initialFilter);
      if(filter) {
         //console.log("hasFilter %s",layerData[layer].props.filter);
	 if(typeof(layerFilter[layer]) === 'undefined') {
	    layerFilter[layer] = {name:layer, filter:filter};
	 } else {
	    layerFilter[layer].filter = {filter:filter};
	 }
	 //setFilter(filter, "setInitialFilter");
      }
   };

   //---------------------------------------------------------
   var printAllImages = function (msg) {
      var i,j;
      var tileFrameContainer;
      var children;
      var numChildren;
      var numImgs;
      var imgs

      for(i=0; i<numLayers; i++) {
	 if(typeof(tileFrameContainers[layerNames[i]]) !== 'undefined') {
	    tileFrameContainer = tileFrameContainers[layerNames[i]];
	    imgs = tileFrameContainer.getElementsByTagName('img');
	 }
      }
   };

   //---------------------------------------------------------
   var printTiles = function (layer) {
      var tileFrameContainer = tileFrameContainers[layer];
      var child = tileFrameContainer.firstChild;
      util.printNodes(child, 1, "   ", skip);
   };

   //---------------------------------------------------------
   var addLayerToView = function (layer) {
      //util.printNodes(targetContainer, 1, "   ", skip);
      var tileFrameContainer = tileFrameContainers[layer];
      targetContainer.appendChild(tileFrameContainer);
      //util.printNodes(targetContainer, 1, "   ", skip);
   };

   //---------------------------------------------------------
   var addAllLayersToView = function () {
      //util.printNodes(targetContainer, 1, "   ", skip);
      var i;

      for(i=0; i<numLayers; i++) {
         addLayerToView(layerNames[i]);
      }
   };

   //---------------------------------------------------------
   var removeLayerFromView = function (layer) {
      var tileFrameContainer = tileFrameContainers[layer];
      //targetContainer.removeChild(tileFrameContainer);
      //util.printNodes(targetContainer, 1, "   ", skip);
   };

   //---------------------------------------------------------
   var setTileFrameVisibility = function(layer, show) {

      var visibility = show ? "visible" : "hidden";
      var tileFrameContainer;
      var containerId;
      var found = false;
      var i;

      for(i=0; i<numLayers; i++) {
         if(layerNames[i] === layer) {
	    found = true;
	    break;
	 }
      }

      if(!found) {
         return false;
      }

      containerId = layer + "_tileFrameContainer";
      if(typeof(document.getElementById(containerId)) !== 'undefined' && document.getElementById(containerId) !== null) {
	 tileFrameContainer = document.getElementById(containerId);
	 tileFrameContainer.style.visibility = visibility;
      }
   };

   //---------------------------------------------------------
   var getTopVisibleLayer = function() {

      var tileFrameContainer;
      var visibility;
      var containerId;
      var layer;
      var style;
      var i;
      var ret;

      for(i=numLayers; i>0; i--) {
         layer = layerNames[i-1];
	 containerId = layer + "_tileFrameContainer";
	 if(document.getElementById(containerId) !== 'undefined' && document.getElementById(containerId) !== null) {
	    tileFrameContainer = document.getElementById(containerId);
	    if(layerVisibility[layer].visible === 'true' || layerVisibility[layer].visible === true) {
	       ret = layer;
	       break;
	    }
	 }
      }

      return ret;
   };

   //---------------------------------------------------------
   var setTileFramePosition = function(caller) {

      //console.log("setTileFramePosition ",caller);

      var tileFrameContainer;
      var tileFrame;
      var containerId;
      var tileFrameId;
      var i;

      var vpleft = 0;
      if (image.width > viewport.width) {
	 vpleft = getViewportLeftEdge();
      }
      vpleft = isNaN(vpleft) ? 0 : vpleft;

      var vptop = 0;
      if (image.height > viewport.height) {
	 vptop = getViewportTopEdge();
      }
      vptop = isNaN(vptop) ? 0 : vptop;

      for(i=0; i<numLayers; i++) {

         containerId = layerNames[i] + "_tileFrameContainer";
         tileFrameId = layerNames[i] + "_tileFrame";

	 if(typeof(document.getElementById(containerId)) !== 'undefined' && document.getElementById(containerId) !== null) {

	    tileFrameContainer = document.getElementById(containerId);
	    tileFrame= document.getElementById(tileFrameId);

	    if (xfits) {
	       tileFrameContainer.style.left = (viewport.width - image.width)/2 + 'px';
	       tileFrame.style.left = 0 + "px";
	    } else {
	       tileFrameContainer.style.left = viewport.width - image.width + 'px';
	       tileFrame.style.left = -vpleft + image.width - viewport.width + "px";
	    }
	    if (yfits) {
	       tileFrameContainer.style.top = (viewport.height - image.height)/2 + 'px';
	       tileFrame.style.top = 0 + "px";
	    } else {
	       tileFrameContainer.style.top = viewport.height - image.height + 'px';
	       tileFrame.style.top = -vptop + image.height - viewport.height + "px";
	    }

	 } // if

	 //console.log("setTileFramePosition: tileFrameContainer left %d, top %d, tileFrame left %d, top %d",tileFrameContainer.style.left,tileFrameContainer.style.top,tileFrame.style.left,tileFrame.style.top);

      } // for

   }; // setTileFramePosition

   //---------------------------------------------------------
   // set opacity for currentLayer
   //---------------------------------------------------------
   var setTileFrameOpacity = function(val) {

      //console.log("setTileFrameOpacity ",val);

      var tileFrameContainer;
      var containerId;

      containerId = currentLayer + "_tileFrameContainer";
      if(typeof(document.getElementById(containerId)) !== 'undefined' && document.getElementById(containerId) !== null) {
	 tileFrameContainer = document.getElementById(containerId);
	 tileFrameContainer.style.opacity = parseFloat(val);
      }
      layerOpacity[currentLayer].opacity = parseFloat(val);
   };

   //---------------------------------------------------------
   // apply opacity for specified layer
   //---------------------------------------------------------
   var applyTileFrameOpacity = function(layerName) {

      //console.log("applyTileFrameOpacity %s",layerName);

      var tileFrameContainer;
      var containerId;

      containerId = layerName + "_tileFrameContainer";
      //console.log("applyTileFrameOpacity containerId %s",containerId);
      if(typeof(document.getElementById(containerId)) !== 'undefined' && document.getElementById(containerId) !== null) {
	 tileFrameContainer = document.getElementById(containerId);
	 if(layerOpacity && layerOpacity[layerName] && layerOpacity[layerName].opacity) {
	    tileFrameContainer.style.opacity = layerOpacity[layerName].opacity;
	 } else {
	    tileFrameContainer.style.opacity = 1.0;
	 }
      } else {
         if(_debug) console.log("applyTileFrameOpacity tileFrameContainer for layer %s undefined",layerName);
      }
   };

   //--------------
   var isSameImagePosition=function() {
     var threeDInfo = model.getThreeDInfo();

     if (imagePosition.x === undefined ||
	 1 * imagePosition.x != 1 * threeDInfo.fxp.x) {
       return false;
     }
     if (imagePosition.y === undefined ||
	 1 * imagePosition.y != 1 * threeDInfo.fxp.y) {
       return false;
     }
     if (imagePosition.z === undefined ||
	 1 * imagePosition.z !=  1 * threeDInfo.fxp.z) {
       return false;
     }
     if (imagePosition.pitch === undefined ||
	 1 * imagePosition.pitch != 1 * threeDInfo.pitch.cur) {
       return false;
     }
     if (imagePosition.yaw === undefined ||
	 1 * imagePosition.yaw != 1 * threeDInfo.yaw.cur) {
       return false;
     }
     if (imagePosition.dst === undefined ||
	 1 * imagePosition.dst != 1 * threeDInfo.dst.cur) {
       return false;
     }
     if (imagePosition.roll === undefined ||
	 1 * imagePosition.roll != 1 * threeDInfo.roll.cur) {
       return false;
     }
     if (imagePosition.scale === undefined ||
	 1 * imagePosition.scale != 1 * scale.cur) {
       return false;
     }

     return true;
   };

   //---------------------------------------------------------
   var setImagePosition=function() {

     var threeDInfo = model.getThreeDInfo();
     
     imagePosition.x = threeDInfo.fxp.x;
     imagePosition.y = threeDInfo.fxp.y;
     imagePosition.z = threeDInfo.fxp.z;
     imagePosition.pitch = threeDInfo.pitch.cur;
     imagePosition.yaw = threeDInfo.yaw.cur;
     imagePosition.roll = threeDInfo.roll.cur;
     imagePosition.dst = threeDInfo.dst.cur;
     imagePosition.scale = scale.cur;
   };

   //---------------------------------------------------------
   /**
   * Load new tiles, remove old ones
   *
   * @author Tom Perry
   */
   var getDraggedTiles = function() {

      var tileSize = model.getTileSize();

      if (!xfits) {
	 while (getViewportLeftEdge() + viewport.width > (endx+1) * tileSize.width) {
	    getTiles(endx+1, endx+1, starty, endy);
	    removeTiles(startx, startx, starty, endy);
	    startx++;
	    endx++;
	 }
	 while (getViewportLeftEdge() < startx * tileSize.width) {
	    getTiles(startx-1, startx-1, starty, endy);
	    removeTiles(endx, endx, starty, endy);
	    startx--;
	    endx--;
	 }
      }

      if (!yfits) {

	 while (getViewportTopEdge() + viewport.height > (endy+1) * tileSize.height) {
	    getTiles(startx, endx, endy+1, endy+1);
	    removeTiles(startx, endx, starty, starty);
	    starty++;
	    endy++;
	 }
	 while (getViewportTopEdge() < starty * tileSize.height) {
	    getTiles(startx, endx, starty-1, starty-1);
	    removeTiles(startx, endx, endy, endy);
	    starty--;
	    endy--;
	 }
      }

   }; // getDraggedTiles

   //---------------------------------------------------------

   /*
   * If we're requesting a Woolz image, we need to specify
   * additional parameters
   *
   * @author Tom Perry
   */
   var getTileSrc = function(layerName, k, highQual) {

      var deb;
      var layer;
      var selectedIndexes;
      var greyFilter;
      var renderMode;
      var map;
      var lfilter;
      var indexData;
      var col; 
      var i;
      var src;
      var qlt;
      var imgType;
      var threeDInfo;
      var sampleRate;
      var fullname;

      //var layerData = model.getLayerData();
      layer = layerData[layerName];
      if(typeof(layer) === 'undefined') {
         return false;
      }

      selectedIndexes = "";
      greyFilter = "";
      renderMode = "";
      map = "";

      if(layer.type === 'label') {
	 // treeTool is the new non-mooTools version
	 if(typeof(tools.tree) === 'undefined' && typeof(tools.treeTool) === 'undefined') {
	    //selectedIndexes = getAllSelections(layerName);
	 } else {
	    selectedIndexes = getSelections();
	    //console.log("getTileSrc: selectedIndexes  ",selectedIndexes);
	    // if no domains are selected we can either:
	    // make the anatomy layer transparent or
	    // don't get tiles for the anatomy layer
	    // un-comment as required
	    if(selectedIndexes === undefined || selectedIndexes === null || selectedIndexes === "") {
	       //selectedIndexes = "&selectedIndexes=0,0,0,0,0";
	       return undefined;
	    }
	 }
      } else if(layer.type === 'greyLevel' || layer.type === 'rgba') {
         if(layer.props.filter) {
	    lfilter = layerFilter[layerName];
	    greyFilter = "&sel=0," + lfilter.filter.red + "," + lfilter.filter.green + "," + lfilter.filter.blue +",255";
	 }
      } else if(layer.type === 'compound') {
	 indexData = model.getIndexData(layerName);
	 for(i=0; i<numLayers; i++) {
	    if(layerName === indexData[i].name) {
               col = indexData[i].colour;
	       selectedIndexes = "&sel=" + indexData[i].domainId + "," + col[0] + "," + col[1] + "," + col[2] + "," + col[3];
	       break;
	    }
	 }
      } else   // try expression layer
	if(layer.type === 'expression') {
	  selectedIndexes = "&sel=1,255,0,0,255";
	  selectedIndexes = selectedIndexes+"&sel=2,255,255,0,255";
	  selectedIndexes = selectedIndexes+"&sel=3,0,0,255,255";
	  selectedIndexes = selectedIndexes+"&sel=4,0,255,0,255";
	  selectedIndexes = selectedIndexes+"&sel=5,0,255,255,255";
      }

      if(layer.props.initialRenderMode) {
         //console.log("layerName ",layerName);
         renderMode = getLayerRenderMode(layerName).mode;
	 if(layer.map && (renderMode == "prjd" || renderMode == "prjv")) {
	    map = "&map=" + layer.map;
	 }
	 renderMode = "&rmd=" + renderMode;
      }

      //console.log("getTileSrc: selectedIndexes ",selectedIndexes);

      qlt = (highQual) ? model.getImgQuality().cur : 1;

      if (model.isWlzData()) {
         //imgType = (layer.type === 'greyLevel') ? "&jtl=0" : "&ptl=0";
         imgType = "&ptl=";
         threeDInfo = model.getThreeDInfo();
	 //var sampleRate = resolutionData.sampleRate;
	 sampleRate = 1.0;

	 src = model.getIIPServer() + "?wlz=" + layer.imageDir + layer.imageName
	 + "&mod=" + threeDInfo.wlzMode
	 + "&fxp=" + (threeDInfo.fxp.x / sampleRate) + ',' + (threeDInfo.fxp.y / sampleRate) + ','+ (threeDInfo.fxp.z / sampleRate)
	 + "&scl=" + (scale.cur * sampleRate)
	 + "&dst=" + (threeDInfo.dst.cur - stackofs) * scale.cur
	 + "&pit=" + threeDInfo.pitch.cur
	 + "&yaw=" + threeDInfo.yaw.cur
	 + "&rol=" + threeDInfo.roll.cur
	 + "&qlt=" + qlt
	 + selectedIndexes
	 + map
	 + renderMode
	 + greyFilter
	 + imgType
	 + k;
      } else {
         imgType = (layer.type === 'greyLevel') ? "&jtl=" : "&ptl=";
	 fullname = model.getFullImgFilename(layerName);
	 if(fullname === undefined) {
	    src = undefined;
	 } else {
            src = model.getIIPServer() + "?fif=" + model.getFullImgFilename(layerName) + "&qlt=" + qlt + imgType + resolution + "," + k;
	 }
      }

      if(_debug) {
	 console.log("view.getTileSrc: ",src);
      }

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (model.isEurexpressData() &&
	  -1 != src.indexOf("/fcgi-bin/wlziipsrv.fcgi"))
	  src = src.replace("emage_iipviewer", "eAtlasViewer");
      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data

      return src;
   }; // getTileSrc

   //---------------------------------------------------------
   var getTiles = function(sx,ex,sy,ey) {

      var deb;

      var layer;
      var tileFrameContainer;
      var tileFrame;
      var tile;
      //var i;
      var j;
      var k;

      var counter = 0;
      
      var tileCollection={};
      var y;
      var z;
      var tile;
      var tilenum;
      var tilenumText;

      deb = _debug;
      //_debug = true;

      if(_debug) console.log("getTiles: sx %d, ex %d, sy %d, ey %d",sx,ex,sy,ey);

      for(i=0; i<numLayers; i++) {
         layer = layerNames[i];
	 //console.log("getTiles for %s",layer);
	 if(layerVisibility[layer].visible === 'false' || layerVisibility[layer].visible === false) {
            if(_debug) console.log("layer %s not visible",layer);
	    continue;
	 }
	 applyTileFrameOpacity(layer);

	 tileFrameContainer = tileFrameContainers[layer];
	 if(typeof(tileFrameContainer) === 'undefined') {
            if(_debug) console.log("tileFrameContainer undefined");
	    return false;
	 } else {
	    tileFrame = tileFrameContainer.firstChild;

	    // different k+sx, j+sy may result in the same tile
	    // in order to reduce unnecessary repetition,
	    // only append net tile

	    tileCollection={};
	    for (j=0; j <= ey-sy; j++) {
	      for (k=0; k <= ex-sx; k++) {
		y = k+sx + ((j+sy)*xtiles);
		z = ""+y;
		tile = tileCollection[z];
		if (typeof(tile) !== 'undefined' && tile !== 'undefined') {
                  if(_debug) console.log("tileFrameContainer undefined");
		  continue;
	       }

		tile = getTile(layer, k+sx, j+sy);
		if(typeof(tile) === 'undefined' || tile === 'undefined') {
                  if(_debug) console.log("tile undefined");
		  continue;
	       }

		tileCollection[z] = tile;
		//console.log(tile);
		
		tileFrame.appendChild(tile);
		counter++;
		if(tileHasBorder) {
		  tile.style.border = "solid 1px #f0f";
		   tilenum = document.createElement('div');
		   tilenum.className = "tilenum";
		   tilenum.style.left = tile.style.left;
		   tilenum.style.top = tile.style.top;
		   tilenum.style.border = "solid 1px #7f0";
		   tilenumText = document.createTextNode((k+sx)+","+(j+sy));
		   tilenum.appendChild(tilenumText);
		   tileFrame.appendChild(tilenum);
		} else {
		  tile.style.border = "none";
		}
	      }
	    }

            if(_debug) {
	       console.log("getTiles: counter = %d",counter);
	       console.log("tileCollection ",tileCollection);
	    }
	    counter = 0;
            //_debug = deb;
	 } 
      } // for 

      //util.printNodes(targetContainer, 1, "   ", skip);

   }; // getTiles

   //---------------------------------------------------------
   /**
   * arguments given, sets its absolute position, and other
   * useful stuff.  See requestImages() for a function that
   * creates all starting tiles appropriately
   *
   * @author Tom Perry
   */
   var getTile = function(layer, i, j) {

      if (i < 0 || i >= xtiles || j < 0 || j >= ytiles) {
         //console.log("getTile i %d, xtiles %d, j %d, ytiles %d",i,xtiles,j,ytiles);
	 return;
      }

      var k = i + (j*xtiles);
      var src = getTileSrc(layer, k, true);
      if(src === undefined) {
         //console.log("getTile: src undefined");
         model.updateBusyIndicator({isBusy:false});
         return undefined;
      }

      var tileId = 'x' + i + 'y' + j;
      var dst = model.getDistance();
      var tileSize = model.getTileSize();
      var tileClass = 's' + scale.cur + 'd' + dst.cur;

      var img = document.createElement("img");
      img.id = tileId;
      img.src = src;
      img.className = "tile " + tileClass;
      img.useMap = "#components_" + tileId;
      var left = i * tileSize.width;
      var top = j * tileSize.height;
      img.style.left = i * tileSize.width + "px";
      img.style.top = j * tileSize.height + "px";

      //console.log("zzzz "+img.src);
      return img;

   };

   //---------------------------------------------------------
   var setImageCursor = function(cursor) {

      var layer;
      var tileFrameContainer;
      var tileFrame;
      var tile;
      var i;
      
      for(i=0; i<numLayers; i++) {
         layer = layerNames[i];
	 if(layerVisibility[layer].visible === 'false' || layerVisibility[layer].visible === false) {
	    continue;
	 }

	 tileFrameContainer = tileFrameContainers[layer];
	 if(typeof(tileFrameContainer) === 'undefined') {
	    return false;
	 } else {
	    tileFrame = tileFrameContainer.firstChild;
	    //console.log("cursor ",cursor);
	    tileFrame.style.cursor = cursor;
	 } 
      } // for 

   }; // setImageCursor


   //---------------------------------------------------------
   // Called when image is much bigger than viewport and we are moving the visible part around
   var removeTiles = function(sx,ex,sy,ey) {

      for (var j=0; j<=ey-sy; j++) {
	 for (var i=0; i<=ex-sx; i++) {
	    removeTile(i+sx,j+sy);
	 }
      }
   };

   //---------------------------------------------------------

   /**
   * Deletes an <img> element.  See clearTiles() for a tile frame clearing
   * function.
   *
   * @author Tom Perry
   */
   var removeTile = function(i, j) {

      var tileId = 'x' + i + 'y' + j;
      var tile = document.getElementById(tileId);
      if (tile) {
	 tile.parentNode.removeChild(tile);
      }
   };

   //---------------------------------------------------------
   /* 
   * Refresh function to avoid the problem of tiles not loading
   * properly in Firefox/Mozilla
   *
   * @author Ruven Pillay
   */
   var refresh = function() {

      var unloaded = 0;

      if(document.getElementById("tileframe")) {
	 var children = document.getElementById("tileframe").getChildren();
	 for(var i in children) {
	    // If our tile has not yet been loaded, give it a prod 
	    if(i.width === 0 || i.height === 0 ){
	       i.src = i.src;
	       unloaded = 1;
	    }
	 }
      }

      /*
      * If no tiles are missing, destroy our refresher timer, fade
      * out our loading animation and and reset our cursor
      */
      if(unloaded === 0) {
	 //$clear(refresher);
	 refresher = null;
	 if(document.getElementById("tileframe")) {
	    document.getElementById("tileframe").style.cursor = 'move';
	 }
      }
   };

   //---------------------------------------------------------
   /**
    *   Informs registered observers of a change to the view.
    */
   var notify = function (from) {

      var i;
      var name;
      //console.log("enter tiledImageView.notify ",from);

      for (i = 0; i < registry.length; i++) {
         if(registry[i].getName) {
            name = registry[i].getName();
	    //if(name === "x3domHelp") {
	       //console.log("register %s",registry[i].getName());
	    //}
	 }
         registry[i].viewUpdate(viewChanges);
      }

      resetViewChanges();
      //console.log("exit tiledImageView.notify ",from);
   }; // notify

   //---------------------------------------------------------
   /**
    *   Prints the state of observable changes to the view.
    */
   var printViewChanges = function() {
      if(viewChanges.initial) console.log("viewChanges.initial ",viewChanges.initial);
      if(viewChanges.viewport) console.log("viewChanges.viewport ",viewChanges.viewport);
      if(viewChanges.maximise) console.log("viewChanges.maximise ",viewChanges.maximise);
      if(viewChanges.toolbox) console.log("viewChanges.toolbox ",viewChanges.toolbox);
      if(viewChanges.scale) console.log("viewChanges.scale ",viewChanges.scale);
      if(viewChanges.focalPoint) console.log("viewChanges.focalPoint ",viewChanges.focalPoint);
      if(viewChanges.locatorMoved) console.log("viewChanges.locatorMoved ",viewChanges.locatorMoved);
      if(viewChanges.layer) console.log("viewChanges.layer ",viewChanges.layer);
      if(viewChanges.showProperties) console.log("viewChanges.showProperties ",viewChanges.showProperties);
      if(viewChanges.mode) console.log("viewChanges.mode ",viewChanges.mode);
      if(viewChanges.addQueryTermAnatomy) console.log("viewChanges.addQueryTermAnatomy ",viewChanges.addQueryTermAnatomy);
      if(viewChanges.selectFixedPoint) console.log("viewChanges.selectFixedPoint ",viewChanges.selectFixedPoint);
      if(viewChanges.debugPoint) console.log("viewChanges.debugPoint ",viewChanges.debugPoint);
      if(viewChanges.debugWindow) console.log("viewChanges.debugWindow ",viewChanges.debugWindow);
      if(viewChanges.measuringOrigin) console.log("viewChanges.measuringOrigin ",viewChanges.measuringOrigin);
      if(viewChanges.measuringTarget) console.log("viewChanges.measuringTarget ",viewChanges.measuringTarget);
      if(viewChanges.measuring) console.log("viewChanges.measuring",viewChanges.measuring);
      if(viewChanges.movingPCPoint) console.log("viewChanges.movingPCPoint",viewChanges.movingPCPoint);
      if(viewChanges.mouseOut) console.log("viewChanges.mouseOut ",viewChanges.mouseOut);
      if(viewChanges.HRSection) console.log("viewChanges.HRSection ",viewChanges.HRSection);
      if(viewChanges.pointClick) console.log("viewChanges.pointClick ",viewChanges.pointClick);
      if(viewChanges.editorPointClick) console.log("viewChanges.editorPointClick ",viewChanges.editorPointClick);
      if(viewChanges.startDrawing) console.log("viewChanges.startDrawing ",viewChanges.startDrawing);
      if(viewChanges.draw) console.log("viewChanges.draw ",viewChanges.draw);
      if(viewChanges.endDrawing) console.log("viewChanges.endDrawing ",viewChanges.endDrawing);
      if(viewChanges.endPCDrag) console.log("viewChanges.endPCDrag ",viewChanges.endPCDrag);
      if(viewChanges.deleteMarkerLocation) console.log("viewChanges.deleteMarkerLocation ",viewChanges.deleteMarkerLocation);
      if(viewChanges.visibility) console.log("viewChanges.visibility ",viewChanges.visibility);
      if(viewChanges.opacity) console.log("viewChanges.opacity ",viewChanges.opacity);
      if(viewChanges.filter) console.log("viewChanges.filter ",viewChanges.filter);
      if(viewChanges.selections) console.log("viewChanges.selections ",viewChanges.selections);
      if(viewChanges.wlzUpdated) console.log("viewChanges.wlzUpdated ",viewChanges.wlzUpdated);
      if(viewChanges.locator) console.log("viewChanges.locator ",viewChanges.locator);
      if(viewChanges.dblClick) console.log("viewChanges.dblClick ",viewChanges.dblClick);
      if(viewChanges.showViewerHelp) console.log("viewChanges.showViewerHelp ",viewChanges.showViewerHelp);
      if(viewChanges.hideViewerHelp) console.log("viewChanges.hideViewerHelp ",viewChanges.hideViewerHelp);
      if(viewChanges.showX3domHelp) console.log("viewChanges.showX3domHelp ",viewChanges.showX3domHelp);
      if(viewChanges.hideX3domHelp) console.log("viewChanges.hideX3domHelp ",viewChanges.hideX3domHelp);
      if(viewChanges.showX3domUnsupported) console.log("viewChanges.showX3domUnsupported ",viewChanges.showX3domUnsupported);
      if(viewChanges.hideX3domUnsupported) console.log("viewChanges.hideX3domUnsupported ",viewChanges.hideX3domUnsupported);
      if(viewChanges.showViewerInfo) console.log("viewChanges.showViewerInfo ",viewChanges.showViewerInfo);
      if(viewChanges.hideViewerInfo) console.log("viewChanges.hideViewerInfo ",viewChanges.hideViewerInfo);
      if(viewChanges.showMarkerPopup) console.log("viewChanges.showMarkerPopup ",viewChanges.showMarkerPopup);
      if(viewChanges.hideMarkerPopup) console.log("viewChanges.hideMarkerPopup ",viewChanges.hideMarkerPopup);
      if(viewChanges.show3dAnatomyHelp) console.log("viewChanges.show3dAnatomyHelp ",viewChanges.show3dAnatomyHelp);
      if(viewChanges.hide3dAnatomyHelp) console.log("viewChanges.hide3dAnatomyHelp ",viewChanges.hide3dAnatomyHelp);
      if(viewChanges.threeD) console.log("viewChanges.threeD ",viewChanges.threeD);
      if(viewChanges.hideMenu) console.log("viewChanges.hideMenu ",viewChanges.hideMenu);
      if(viewChanges.contextMenuOn) console.log("viewChanges.contextMenuOn ",viewChanges.contextMenuOn);
      if(viewChanges.contextMenuOff) console.log("viewChanges.contextMenuOff ",viewChanges.contextMenuOff);
      if(viewChanges.threeDAnatomyWarningDialog) console.log("viewChanges.threeDAnatomyWarningDialog ",viewChanges.threeDAnatomyWarningDialog);
      console.log("++++++++++++++++++++++++++++++++++++++++++++");
   };

   //---------------------------------------------------------
   /**
    *   Resets the list of observable changes to the view.
    */
   var resetViewChanges = function() {
      viewChanges.initial =  false;
      viewChanges.viewport =  false;
      viewChanges.maximise =  false;
      viewChanges.toolbox =  false;
      viewChanges.scale =  false;
      viewChanges.focalPoint =  false;
      viewChanges.locatorMoved =  false;
      viewChanges.layer =  false;
      viewChanges.showProperties =  false;
      viewChanges.mode =  false;
      viewChanges.addQueryTermAnatomy =  false;
      viewChanges.selectFixedPoint =  false;
      viewChanges.debugPoint =  false;
      viewChanges.debugWindow =  false;
      viewChanges.measuringOrigin =  false;
      viewChanges.measuringTarget =  false;
      viewChanges.measuring =  false;
      viewChanges.movingPCPoint =  false;
      viewChanges.mouseOut =  false;
      viewChanges.HRSection = false;
      viewChanges.pointClick = false;
      viewChanges.editorPointClick = false;
      viewChanges.startDrawing = false;
      viewChanges.draw = false;
      viewChanges.endDrawing = false;
      viewChanges.endPCDrag = false;
      viewChanges.deleteMarkerLocation = false;
      viewChanges.visibility =  false;
      viewChanges.opacity =  false;
      viewChanges.filter = false;
      viewChanges.selections = false;
      viewChanges.wlzUpdated =  false;
      viewChanges.locator =  false;
      viewChanges.dblClick =  false;
      viewChanges.showViewerHelp =  false;
      viewChanges.hideViewerHelp =  false;
      viewChanges.showX3domHelp =  false;
      viewChanges.hideX3domHelp =  false;
      viewChanges.showX3domUnsupported =  false;
      viewChanges.hideX3domUnsupported =  false;
      viewChanges.showViewerInfo =  false;
      viewChanges.hideViewerInfo =  false;
      viewChanges.showMarkerPopup =  false;
      viewChanges.hideMarkerPopup =  false;
      viewChanges.show3dAnatomyHelp =  false;
      viewChanges.hide3dAnatomyHelp =  false;
      viewChanges.threeD =  false;
      viewChanges.hideMenu =  false;
      viewChanges.contextMenuOn =  false;
      viewChanges.contextMenuOff =  false;
      viewChanges.threeDAnatomyWarningDialog =  false;
   };


   //---------------------------------------------------------
   var getDataAtMouse = function (e, params) {

      var mode;
      var tileFrameContainer;
      var left;
      var top;
      var topEdge;
      var leftEdge;
      var viewerPos;
      var X;
      var Y;
      var layerData;
      var layer;
      var url;
      var qlt;
      var obj;
      var threeDInfo;
      var point;
      var ajaxParams;
      var ajax;
      var ajaxRetVal;
      //=================================================================================
      mode = getMode().name;

      //console.log("getDataAtMouse mode = %s, mouseDownInImage %s params ",mode,mouseDownInImage,params );

      measuringOrigin = false;
      measuringTarget = false;
      overlay = false;
      indexName = false;
      contextMenu = false;
      movingPCPoint = false;

      if(RIGHT_CLICK) {
         return false;
      }

      if(params.measuringOrigin) {
         measuringOrigin = true;
      }
      if(params.measuringTarget) {
         measuringTarget = true;
      }
      if(params.movingPCPoint && pointClickEditor) {
         movingPCPoint = true;
      }
      if(params.overlay) {
         overlay = true;
      }
      if(params.tooltip) {
         indexName = true;
      }
      if(params.contextMenu) {
         contextMenu = true;
      }
      if(params.addQueryTerm) {
         addQueryTerm = true;
      } else {
         addQueryTerm = false;
      }

      //indexLayer = layerNames[layerNames.length-1];
      //if(typeof(indexLayer) === 'undefined') {
       //  return false;
      //}
      tileFrameContainer = tileFrameContainers[currentLayer];

      if(typeof(tileFrameContainer) === 'undefined') {
         console.log("getDataAtMouse returning, tileFrameContainer undefined");
         return false;
      }
      left = parseInt(tileFrameContainer.style.left);
      top = parseInt(tileFrameContainer.style.top);

      topEdge = getViewportTopEdge();
      leftEdge = getViewportLeftEdge();
      docX = emouseatlas.emap.utilities.getMouseX(e);
      docY = emouseatlas.emap.utilities.getMouseY(e);
      //console.log("docX %d, docY %d",docX,docY);
      //console.log("leftEdge %d, topEdge %d",leftEdge,topEdge);

      // the position of the div containing the viewer.
      viewerPos = emouseatlas.emap.utilities.findPos(targetContainer);

      // the point of interest in the image
      X = Math.round(docX + leftEdge - viewerPos.x);
      Y = Math.round(docY + topEdge - viewerPos.y);
      //console.log("X %d, Y %d",X,Y);
      layerData = model.getLayerData();
      layer = layerData[currentLayer];
      if(typeof(layer) === 'undefined') {
         console.log("getDataAtMouse returning, layer undefined");
         return false;
      }

      if (model.isWlzData() && !(mode === "query" && query.getQueryType() === "spatial")) {
	 qlt = model.getImgQuality();
	 obj = "&obj=Wlz-foreground-objects";
	 if(indexName ||
            mode === "fixedPoint" ||
	    mode === "measuring" ||
	    mode === "HRSection" ||
	    //(mode === "debug" && !contextMenu) ||
	    (debugWindow && !contextMenu) ||
            (mode === "pointClick" && pointClickEditor) ||
	    (mode === "query" && query.getQueryType() === "anatomy")) {
	    obj += "&obj=Wlz-coordinate-3D";
	 }

         threeDInfo = model.getThreeDInfo();

	 url = model.getIIPServer() + "?wlz=" + layer.imageDir + layer.imageName
	 + "&mod=" + threeDInfo.wlzMode
	 + "&fxp=" + threeDInfo.fxp.x + ',' + threeDInfo.fxp.y + ','+ threeDInfo.fxp.z
	 + "&scl=" + scale.cur
	 + "&dst=" + (threeDInfo.dst.cur * scale.cur)
	 + "&pit=" + threeDInfo.pitch.cur
	 + "&yaw=" + threeDInfo.yaw.cur
	 + "&rol=" + threeDInfo.roll.cur
	 + "&prl=-1,"
	 + X + "," + Y
	 + obj

         //console.log("url ",url);
	 
	 point = [X,Y];

	 ajaxParams = {
	    url:url,
	    method:"POST",
	    callback:getDataAtMouseCallback,
	    urlParams:point.toString(),
	    async:true
	 }
	 ajax = new emouseatlas.emap.ajaxContentLoader();
	 ajaxRetVal = ajax.loadResponse(ajaxParams);
         //console.log("ajax ",ajax);
         //console.log("ajaxParams ",ajaxParams);
         //console.log("ajaxRetVal ",ajaxRetVal);
      } else {
	 if(mode === "measuring" && !measuringOrigin && !measuringTarget) {
	    measurementPoint = {x:docX, y:docY, z:0};
	    viewChanges.measuring = true;
	 } else if(mode === "measuring" && measuringOrigin) {
	    measurementOrigin = {x:docX, y:docY, z:0};
	    viewChanges.measuringOrigin = true;
	 } else if(mode === "measuring" && measuringTarget) {
	    measurementTarget = {x:docX, y:docY, z:0};
	    viewChanges.measuringTarget = true;
	 } else if(mode === "pointClick") {
	    //console.log("docX %d, docY %d",docX, docY);
	    //console.log("pointClickPoint.x %d, pointClickPoint.y %d",pointClickPoint.x, pointClickPoint.y);
	    pointClickPoint = getMousePositionInImage({x:docX, y:docY});
	    if(pointClickEditor) {
               //mouseDownTarget = emouseatlas.emap.utilities.getTarget(e);
	       if(movingPCPoint) {
	          viewChanges.movingPCPoint = true;
	       } else {
	          viewChanges.editorPointClick = true;
	       }
	    } else {
	       viewChanges.pointClick = true;
	    }
	 } else if(mode === "query" && query.getQueryType() === "spatial" && mouseDownInImage) {
	    viewChanges.draw = true;
            drawPoint = getMousePositionInImage({x:docX, y:docY});
            //console.log("drawPoint ",drawPoint);
	 }
	 notify("getDataAtMouse");
      }

   }; // getDataAtMouse

   //---------------------------------------------------------
   // The indexArray always has 0 as its first entry.
   // Subsequent entries are the index objects under the mouse
   //---------------------------------------------------------
   var getDataAtMouseCallback = function (response, point) {

      //console.log("getDataAtMouseCallback response ",response);
      //console.log("getDataAtMouseCallback response ",point);
      var mode;
      var response1;
      var respArr;
      var index;
      var substr;
      var indxstr;
      var coordstr;
      var pArr;
      var mouseOverFilter;

      mode = getMode().name;

      // get rid of white-space in response string
      response1 = response.replace(/^\s+|\s+$/g, '') ;

      // split response to an array, 1 entry for each object.
      // the first element should always be for index data.
      // the second element, if present will be for coord data.
      respArr = response1.split("\n");

      //console.log("getDataAtMouseCallback", respArr);

      index = respArr[0].indexOf(":");
      if(index === -1) {
	 return false;
      } else {
	 index++;
      }

      substr = respArr[0].substring(index);
      indxstr = substr.replace(/^\s+|\s+$/g, '') ;
      coordstr;
      indexArray = indxstr.split(" ");

      if(indexName ||
         mode === "fixedPoint" ||
         mode === "measuring" ||
         mode === "HRSection" ||
         mode === "query" ||
         //mode === "debug" ||
         debugWindow ||
         mode === "pointClick") {

	 if(respArr[1]) {
	    index = respArr[1].indexOf(":");
	    if(index !== -1) {
	       index++;
	       substr = respArr[1].substring(index);
	       coordstr = substr.replace(/^\s+|\s+$/g, '') ;
	       //console.log("substr %s, coordstr %s",substr,coordstr);
	    }

	    compObjIndxArr = indexArray.slice(0);
            pArr = coordstr.split(" ");
	    //console.log(pArr);

            if(mode === "fixedPoint") {
	       possibleFixedPoint = {x:Math.round(pArr[0]), y:Math.round(pArr[1]), z:Math.round(pArr[2])};
	       viewChanges.selectFixedPoint = true;
	       notify("getDataAtMouseCallback fixedPoint");
            } else if(mode === "measuring" && !measuringOrigin && !measuringTarget) {
	       measurementPoint = {x:pArr[0], y:pArr[1], z:pArr[2]};
	       viewChanges.measuring = true;
	       notify("getDataAtMouseCallback measuring");
            } else if(mode === "measuring" && measuringOrigin) {
	       measurementOrigin = {x:pArr[0], y:pArr[1], z:pArr[2]};
	       viewChanges.measuringOrigin = true;
	       notify("getDataAtMouseCallback measuringOrigin");
            } else if(mode === "measuring" && measuringTarget) {
	       measurementTarget = {x:pArr[0], y:pArr[1], z:pArr[2]};
	       viewChanges.measuringTarget = true;
	       notify("getDataAtMouseCallback measuringTarget");
            } else if(mode === "HRSection") {
	       HRSectionPoint = {x:Math.round(pArr[0]), y:Math.round(pArr[1]), z:Math.round(pArr[2])};
	       viewChanges.HRSection = true;
	       notify("getDataAtMouseCallback HRSection");
            } else if(mode === "pointClick") {
	       pointClickPoint = {x:pArr[0], y:pArr[1], z:pArr[2]};
	       viewChanges.editorPointClick = true;
	       notify("getDataAtMouseCallback pointClick");
            //} else if(mode === "debug") {
            } else if(debugWindow && mouseDownInImage) {
	       debugPoint = {x:pArr[0], y:pArr[1], z:pArr[2]};
	       viewChanges.debugPoint = true;
	       notify("getDataAtMouseCallback debugPoint");
	    } else if(indexName) {
               doMouseOverFeedback_cb(indexArray, mouseOverFilter);
	       getGreyValue(point);
	       //console.log("indexName ",indexArray);
	       mouseOverFilter = model.getLayerData().mouseOverFilter;
	       //console.log("mouseOverFilter %s",mouseOverFilter);
               showImgLabel_cb(indexArray, mouseOverFilter);
            }
	 }
      }

      if(overlay) {
	 viewChanges.dblClick = true;
	 if(addQueryTerm) {
	    if(mode === "query" && query.getQueryType() === "anatomy") {
	       //console.log("getDataAtMouseCallback addQueryTerm ",addQueryTerm);
	    }
	 }
	 if(mode === "query" && query.getQueryType() === "anatomy") {
	    //viewChanges.addQueryTerm = true;
	 }
	 notify("getDataAtMouseCallback overlay");
      }
   }; // getDataAtMouseCallback

   //---------------------------------------------------------
   var getGreyValue = function (point) {

      var url;
      var qlt;
      var obj;
      var threeDInfo;
      var layerNames;
      var layerData;
      var layer;
      var name;
      var len;
      var type
      var found;
      var i;
      var ajaxParams;
      var ajax;
      var ajaxRetVal;
      var urlParams;

      //console.log("getGreyValue ",point);

      if (!model.isWlzData()) {
         return undefined;
      }

      qlt = model.getImgQuality();
      obj = "&obj=wlz-grey-value";
      threeDInfo = model.getThreeDInfo();

      // we need to get grey level objects to query
      // just now only look at first grey layer
      found = false;
      layerNames = model.getLayerNames();
      layerData = model.getLayerData();
      len = layerNames.length;
      for(i=0; i<len; i++) {
         name = layerNames[i];
	 layer = layerData[name];
         type = layer.type;
	 if(type === 'greyLevel') {
	    found = true;
	    break;
	 }
      }
      
      if (!found) {
         return undefined;
      }

      url = model.getIIPServer() + "?wlz=" + layer.imageDir + layer.imageName
      + "&mod=" + threeDInfo.wlzMode
      + "&fxp=" + threeDInfo.fxp.x + ',' + threeDInfo.fxp.y + ','+ threeDInfo.fxp.z
      + "&scl=" + scale.cur
      + "&dst=" + (threeDInfo.dst.cur * scale.cur)
      + "&pit=" + threeDInfo.pitch.cur
      + "&yaw=" + threeDInfo.yaw.cur
      + "&rol=" + threeDInfo.roll.cur
      + "&prl=-1,"
      + point
      + obj
      
      //console.log("url ",url);
      
      ajaxParams = {
         url:url,
         method:"POST",
         callback:getGreyValueCallback,
	 urlParams:"",
         async:true
      }
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajaxRetVal = ajax.loadResponse(ajaxParams);

   }; // getGreyValue

   //---------------------------------------------------------
   var getGreyValueCallback = function (response) {

      //console.log("getGreyValueCallback ",response);

      var respArr;

      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
         return undefined;
      }

      respArr = response.split(":");
      greyValue = respArr[1];

   }; // getGreyValueCallback

   //--------------------------------------------------------------
   var hideImgLabel = function () {
      if(emouseatlas.emap.imgLabel) {
         emouseatlas.emap.imgLabel.setVisible(false);
      }
      return false;
   };

   //--------------------------------------------------------------
   // When mouse pauses over 'indexed' data in the image, show a 'tooltip'
   //--------------------------------------------------------------
   var showImgLabel = function (evt) {

      //console.log("showImgLabel imgLabels_enabled %s",imgLabels_enabled);
      //console.log("emouseatlas.emap.imgLabel ",emouseatlas.emap.imgLabel);

      //if(emouseatlas.emap.imgLabel && imgLabels_enabled && !gettingDebugPoint) {
      if(emouseatlas.emap.imgLabel && imgLabels_enabled) {
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:false,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            tooltip:true
         });
      }
   };

   //--------------------------------------------------------------
   // Called from callback function
   //--------------------------------------------------------------
   var showImgLabel_cb = function (indexArr, filter) {

      var layerNames;
      var name;
      var type;
      var layerData;
      var layer;
      var hasTree;
      var treeData;
      var indexData;
      var header;
      var indexes = [];
      var report = [];
      var viewerPos;
      var X;
      var Y;
      var targetId;
      var VP;
      var rightEdgeVP;
      var bottomEdgeVP;
      var xofs;
      var yofs;
      var len;
      var len2;
      var i;
      var j;

     // console.log("showImgLabel_cb  ",indexArr);

      layerNames = model.getLayerNames();
      layerData = model.getLayerData();
      len = layerNames.length;
      for(i=0; i<len; i++) {
         name = layerNames[i];
         if(filter === undefined) {
            header = name;
	 } else {
            header = name + " (" + filter + ")";
	 }
	 layer = layerData[name];
	 //console.log("showImgLabel_cb layer ",layer);
         type = layer.type;
	 treeData = layer.treeData;
	 if(type === "label") {
	    hasTree = (treeData !== undefined);
	 } else {
	    hasTree = false;
	 }

	 if(type === 'greyLevel' && name === currentLayer) {
	    report[report.length] = {header:name, greyVal:greyValue, spacer:false};
	 }

	 if(type === 'label' && hasTree) {
	    indexes = [];
            indexData = model.getIndexData(name);
            if(indexData === undefined) {
               continue;
            }

	    //console.log("indexData ",indexData);

            len2 = indexArr.length;
	    //console.log("len2 ",len2);
            for(j=0; j<len2; j++) {
	       //console.log("indexArr[j] ",indexArr[j]);
               if(indexData[indexArr[j]] === undefined) {
                  continue;
               } else {
	          if(imgLabelEntryOK(treeData, indexData[indexArr[j]], filter)) {
                     indexes[indexes.length] = indexData[indexArr[j]].name;
		  }
               }
            }
	    //console.log("%d, %s, %s",indexes.length,name,currentLayer);
	    if(indexes.length > 0 && name === currentLayer) {
	       //console.log(indexes);
	       report[report.length] = {header:header, indexArr:indexes, spacer:true};
	       //console.log("showImgLabel_cb: header:header %s, indexArr:indexes ",header,indexes);
	    }
	 }
      }

      viewerPos = emouseatlas.emap.utilities.findPos(targetContainer);
      X = Math.round(docX - viewerPos.x);
      Y = Math.round(docY - viewerPos.y);

      targetId = model.getViewerTargetId();
      if(document.getElementById(targetId)) {
	 VP = document.getElementById(targetId);
      }

      rightEdgeVP = viewerPos.x + VP.clientWidth;
      bottomEdgeVP = viewerPos.y + VP.clientHeight;
      xofs = 20;
      yofs = 10;

      header = currentLayer;
      //console.log("header ",header);
      //console.log("indexArr ",indexArr);
      emouseatlas.emap.imgLabel.setVisible(true);
      emouseatlas.emap.imgLabel.setPosition({x:X, y:Y});
      emouseatlas.emap.imgLabel.setReport(report);

   }; // showImgLabel_cb

   //----------------------------------------------------------------------------
   // Check if the entry is acceptable, for example only strong genex expression.
   //----------------------------------------------------------------------------
   var imgLabelEntryOK = function (treeData, entry, filter) {

      var OK = false;
      var iNodeIdEntry;
      var iNodeIdParent;
      var nameEntry;
      var nameParent;
      var domainIdEntry;
      var domainIdParent;
      var data;
      var len;
      var i;

      //console.log("treeData ",treeData);
      //console.log("entry ",entry);
      //console.log("filter ",filter);

      iNodeIdEntry = parseInt(entry.nodeId);
      i = parseInt(iNodeIdEntry - 1);
      //console.log("iNodeEntry %d, i %d",iNodeIdEntry,i);

      while(treeData[i]) {
         data = treeData[i];
	 if(filter !== undefined) {
	    if(data.domainData.domainId === undefined) {
	       if(data.name.toLowerCase() === filter.toLowerCase()) {
		  OK = true;
		  //console.log(entry.name, treeData[i].name);
	       }
	       break;
	    }
	 } else {
	    OK = true;
	 }
	 i--;
      }

      return OK;

   }; // imgLabelEntryOK

   //--------------------------------------------------------------
   // When mouse moves over 'indexed' data in the image, show feedback
   //--------------------------------------------------------------
   var doMouseOverFeedback = function (evt) {

      getDataAtMouse(evt, {
	 addQueryTerm:false,
	 contextMenu:false,
	 draw:false,
	 fixedPoint:false,
	 HRSection:false,
	 measuring:false,
	 measuringOrigin: false,
	 measuringTarget: false,
	 overlay:false,
	 pointClick:false,
	 tooltip:true
      });
   };

   //--------------------------------------------------------------
   // Called from callback function
   //--------------------------------------------------------------
   var doMouseOverFeedback_cb = function (indexArr) {

      var layerNames;
      var name;
      var type;
      var layerData;
      var layer;
      var hasTree;
      var treeData;
      var indexData;
      var txt;
      var index;

      index = (indexArr.length > 1) ? indexArr[1] : undefined;

      if(!index) {
         //console.log("no index");
         return false;
      }

      layerNames = model.getLayerNames();
      layerData = model.getLayerData();
      len = layerNames.length;
      for(i=0; i<len; i++) {
         name = layerNames[i];
	 layer = layerData[name];
         type = layer.type;
	 treeData = layer.treeData;
	 if(type === "label") {
	    hasTree = (treeData !== undefined);
	 } else {
	    hasTree = false;
	 }

	 if(type === 'label' && hasTree) {
	    //console.log("name %s, currentLayer %s",name,currentLayer);
            indexData = model.getIndexData(name);
	    //console.log("indexData ",indexData);
	    if(name === currentLayer) {
	       //emouseatlas.emap.mouseFeedback.setTxt(indexData[indexArr[1]].name);
	    }
	 }
      }

   }; // doMouseOverFeedback_cb

   //--------------------------------------------------------------
   // When mouse pauses in 'measurement mode' get the distances
   //--------------------------------------------------------------
   var getMeasurementData = function (evt) {
      if(measuring) {
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:false,
            HRSection:false,
            measuring:true,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            tooltip:false
         });
      }
   };

   //--------------------------------------------------------------
   // When mouse pauses in 'pointClick mode' get the closest marker
   // unless we are in editor mode
   //--------------------------------------------------------------
   var getMarkerData = function (evt) {
      getDataAtMouse(evt, {
         addQueryTerm:false,
         contextMenu:false,
         draw:false,
         fixedPoint:false,
         HRSection:false,
         measuring:false,
         measuringOrigin: false,
         measuringTarget: false,
         overlay:false,
         pointClick:true,
         tooltip:false
      });
   };

/*
   //--------------------------------------------------------------
   //--------------------------------------------------------------
   var addQueryTerm_cb = function (indexArr) {

      var layerNames;
      var name;
      var type;
      var layerData;
      var layer;
      var hasTree;
      var indexData;
      var header;
      var indexes = [];
      var report = [];
      var viewerPos;
      var X;
      var Y;
      var targetId;
      var VP;
      var rightEdgeVP;
      var bottomEdgeVP;
      var xofs;
      var yofs;
      var len;
      var len2;
      var i;
      var j;

      layerNames = model.getLayerNames();
      layerData = model.getLayerData();
      len = layerNames.length;
      for(i=0; i<len; i++) {
         name = layerNames[i];
	 layer = layerData[name];
	 //console.log("showImgLabel_cb layer ",layer);
         type = layer.type;
	 treeData = layer.treeData;
	 if(type === "label") {
	    hasTree = (treeData !== undefined);
	 } else {
	    hasTree = false;
	 }

	 if(type === 'greyLevel' && name === currentLayer) {
	    report[report.length] = {header:name, greyVal:greyValue, spacer:false};
	 }

	 if(type === 'label' && hasTree) {
	    indexes = [];
            indexData = model.getIndexData(name);
            if(indexData === undefined) {
               continue;
            }

	    //console.log("indexData ",indexData);

            len2 = indexArr.length;
	    //console.log("len2 ",len2);
            for(j=0; j<len2; j++) {
	       //console.log("indexArr[j] ",indexArr[j]);
               if(indexData[indexArr[j]] === undefined) {
                  continue;
               } else {
                  indexes[indexes.length] = indexData[indexArr[j]].name;
               }
            }
	    if(indexes.length > 0 && name === currentLayer) {
	       //console.log(indexes);
	       report[report.length] = {header:name, indexArr:indexes, spacer:true};
	    }
	 }
      }

      viewerPos = emouseatlas.emap.utilities.findPos(targetContainer);
      X = Math.round(docX - viewerPos.x);
      Y = Math.round(docY - viewerPos.y);

      targetId = model.getViewerTargetId();
      if(document.getElementById(targetId)) {
	 VP = document.getElementById(targetId);
      }

      rightEdgeVP = viewerPos.x + VP.clientWidth;
      bottomEdgeVP = viewerPos.y + VP.clientHeight;
      xofs = 20;
      yofs = 10;

      header = currentLayer;
      //console.log("header ",header);
      //console.log("indexArr ",indexArr);
      emouseatlas.emap.imgLabel.setVisible(true);
      emouseatlas.emap.imgLabel.setPosition({x:X, y:Y});
      emouseatlas.emap.imgLabel.setReport(report);

   }; // showImgLabel_cb
   */


   //---------------------------------------------------------
   var testCoordSystem = function () {

      //console.log("enter testCoordSystem");

      var layerData = model.getLayerData();
      var layer = layerData[currentLayer];
      if(typeof(layer) === 'undefined') {
         return false;
      }

      var url;
      var qlt = model.getImgQuality();
      var obj = "&obj=Wlz-coordinate-3D";
     
      var threeDInfo = model.getThreeDInfo();
     
      url = model.getIIPServer() + "?wlz=" + layer.imageDir + layer.imageName
      + "&mod=" + threeDInfo.wlzMode
      + "&fxp=" + threeDInfo.fxp.x + ',' + threeDInfo.fxp.y + ','+ threeDInfo.fxp.z
      + "&scl=" + scale.cur
      + "&dst=" + (threeDInfo.dst.cur * scale.cur)
      + "&pit=" + threeDInfo.pitch.cur
      + "&yaw=" + threeDInfo.yaw.cur
      + "&rol=" + threeDInfo.roll.cur
      + "&prl=-1,0,0"
      + obj
     
      //console.log("url ",url);
     
      var ajaxParams = {
         url:url,
         method:"POST",
         callback:testCoordSystemCallback,
         async:true
      }
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      var ajaxRetVal = ajax.loadResponse(ajaxParams);
      //console.log("ajax ",ajax);
      //console.log("ajaxParams ",ajaxParams);
      //console.log("ajaxRetVal ",ajaxRetVal);

      //console.log("exit testCoordSystem");

   }; // testCoordSystem

   //---------------------------------------------------------
   var testCoordSystemCallback = function (response) {

      //console.log("enter testCoordSystemCallback response ",response);

      // get rid of white-space in response string
      var response1 = response.replace(/^\s+|\s+$/g, '') ;
      //console.log("response1 ",response1);

      var index = response1.indexOf(":");
      if(index === -1) {
	 return false;
      } else {
	 index++;
      }

      var substr = response1.substring(index);
      var indxstr = substr.replace(/^\s+|\s+$/g, '') ;
      var coordstr = substr.replace(/^\s+|\s+$/g, '') ;

      var pArr = coordstr.split(" ");
      //console.log(pArr);
      testCoordSystem2(pArr);
     
      //console.log("exit testCoordSystemCallback");

   }; // testCoordSystemCallback

   //---------------------------------------------------------
   var testCoordSystem2 = function (pArr) {

      //console.log("enter testCoordSystem2");

      var layerData = model.getLayerData();
      var layer = layerData[currentLayer];
      if(typeof(layer) === 'undefined') {
         //console.log("getDataAtMouse returning, layer undefined");
         return false;
      }

      var url;
      var qlt = model.getImgQuality();
      var obj = "&obj=Wlz-transformed-coordinate-3D";
     
      var threeDInfo = model.getThreeDInfo();
     
      url = model.getIIPServer() + "?wlz=" + layer.imageDir + layer.imageName
      + "&mod=" + threeDInfo.wlzMode
      + "&fxp=" + threeDInfo.fxp.x + ',' + threeDInfo.fxp.y + ','+ threeDInfo.fxp.z
      + "&scl=" + scale.cur
      + "&dst=" + (threeDInfo.dst.cur * scale.cur)
      + "&pit=" + threeDInfo.pitch.cur
      + "&yaw=" + threeDInfo.yaw.cur
      + "&rol=" + threeDInfo.roll.cur
      + "&pab=" + pArr[0] + "," + pArr[1] + "," + pArr[2]
      + obj
     
      //console.log("url ",url);
     
      var ajaxParams = {
         url:url,
         method:"POST",
         callback:testCoordSystem2Callback,
         async:true
      }
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      var ajaxRetVal = ajax.loadResponse(ajaxParams);

      //console.log("exit testCoordSystem2");

   }; // testCoordSystem2

   //---------------------------------------------------------
   var testCoordSystem2Callback = function (response) {

      //console.log("enter testCoordSystemCallback response ",response);

      // get rid of white-space in response string
      var response1 = response.replace(/^\s+|\s+$/g, '') ;
      //console.log("response1 ",response1);

      var index = response1.indexOf(":");
      if(index === -1) {
	 return false;
      } else {
	 index++;
      }

      var substr = response1.substring(index);
      var indxstr = substr.replace(/^\s+|\s+$/g, '') ;
      var coordstr = substr.replace(/^\s+|\s+$/g, '') ;

      var pArr = coordstr.split(" ");
      //console.log(pArr);
     
      //console.log("exit testCoordSystem2Callback");

   }; // testCoordSystem2Callback

   //--------------------------------------------------------------
   var getApproxTextLength = function (container, text) {
      return container.clientWidth;
   };

   //--------------------------------------------------------------
   // When mouse is double-clicked over 'indexed' data in the image, show data
   //--------------------------------------------------------------
   var showIndexDataInImage = function (evt) {
      getDataAtMouse(evt, {
	 addQueryTerm:true,
	 contextMenu:false,
         draw:false,
         fixedPoint:false,
         HRSection:false,
         measuring:false,
         measuringOrigin: false,
         measuringTarget: false,
         overlay:true,
         pointClick:false,
         tooltip:false
      });
   };

   //--------------------------------------------------------------
   var setTileFrameClass = function (tfclass) {

      var layer;
      var tileFrameContainer;
      var tileFrame;

      for(var i=0; i<numLayers; i++) {
         layer = layerNames[i];
	 if(tileFrameContainers[layer] !== undefined) {
	    tileFrameContainer = tileFrameContainers[layer];
	    tileFrameContainer.firstChild.className = tfclass;
	 }
      }
   };

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------
   var setViewportSize = function(from) {

      if(_debug) console.log("enter setViewportSize from %s",from);
      var targetId = model.getViewerTargetId();
      // if the viewer div exists
      if(document.getElementById(targetId)) {
	 var VP = document.getElementById(targetId);
	 var VpDims = emouseatlas.emap.utilities.getViewportDims(VP);
	 viewport.width = VpDims.width;
	 viewport.height = VpDims.height;
      } else {
         if(_debug) console.log("%s doesn't exist yet",targetId);
      }

      if ((image.width !== null && typeof(image.width) !== 'undefined') && (image.height !== null && typeof(image.height) !== 'undefined')) {
         if(_debug) console.log("image width & height OK");
	 setWinMinScale("setViewportSize");
	 handleScaleChange("setViewportSize");
      } else {
         if(_debug) console.log("image width & height not established yet");
         if(_debug) console.log("exiting setViewportSize from %s",from);
	 return false;
      }
      viewChanges.viewport = true;
      notify("setViewportSize");
      if(_debug) console.log("exit setViewportSize from %s",from);
   };

   //---------------------------------------------------------
   // Mouse down event on tileFrame
   //---------------------------------------------------------
   var doMouseDownInImage = function (e) {       // version from git Aug 2015

      var evt;
      var buttons;
      var modifiers;
      var layer;
      var tileFrameContainer;
      var tileFrameContainerId;
      var viewerPos;
      var x;
      var y;

      evt = e || window.event;
      //console.log(evt);

      mouseDownTarget = emouseatlas.emap.utilities.getTarget(evt);
      //console.log("getDataAtMouse target ",mouseDownTarget);

      buttons = emouseatlas.emap.utilities.whichMouseButtons(e);
      modifiers = emouseatlas.emap.utilities.whichModifierKeys(e);
      layer = getTopVisibleLayer();

      viewChanges.hideMenu = true;
      notify("doMouseDownInImage");

      // prevent default dragging action in Firefox
      if(evt.preventDefault) {
         //evt.preventDefault();
      }

      // if we have right-clicked for context menu
      if(buttons.right || (buttons.left && modifiers.ctrl && !modifiers.alt)) {
         //console.log("we have right-clicked for context menu");
         RIGHT_CLICK = true;
	 getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:true,
            draw:false,
            fixedPoint:false,
            debugWindow:false,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            movingPCPoint:false,
            tooltip:false
	 });
         RIGHT_CLICK = false;
         return false;
      }

      clearTimeout(mouseMoveTimeout);
      hideImgLabel();

      // if we are in 'fixedPoint' mode
      if(mode.name.toLowerCase() === "fixedpoint") {
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:true,
            debugWindow:false,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            movingPCPoint:false,
            tooltip:false
         });
	 return false;
      }

      // if we are in 'debug' mode
      if(debugWindow) {
         //console.log("mouse down in debug mode");
	 mouseDownInImage = true;
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:false,
            debugWindow:true,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            movingPCPoint:false,
            tooltip:false
         });
	 return false;
      }

      // if we are in 'measuring' mode
      if(mode.name.toLowerCase() === "measuring") {
         if(measuring) {
            getDataAtMouse(evt, {
               addQueryTerm:false,
               contextMenu:false,
               draw:false,
               fixedPoint:false,
               debugWindow:false,
               HRSection:false,
               measuring:false,
               measuringOrigin: false,
               measuringTarget: true,
               overlay:false,
               pointClick:false,
               movingPCPoint:false,
               tooltip:false
            });
	    measuring = false;
	 } else {
            getDataAtMouse(evt, {
               addQueryTerm:false,
               contextMenu:false,
               draw:false,
               fixedPoint:false,
               debugWindow:false,
               HRSection:false,
               measuring:false,
               measuringOrigin: true,
               measuringTarget: false,
               overlay:false,
               pointClick:false,
               movingPCPoint:false,
               tooltip:false
            });
	    measuring = true;
	 }

	 return false;
      }

      // if we are in 'HRSection' mode
      if(mode.name.toLowerCase() === "hrsection") {
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:false,
            debugWindow:false,
            HRSection:true,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            movingPCPoint:false,
            tooltip:false
         });
	 return false;
      }

/*
      // if we are in 'queryAnatomy' mode
      if(mode === "query" && query.getQueryType() === "anatomy") {
         console.log("doMouseDownInImage: queryAnatomy");
         mouseDownInImage = true;
	 // we need to call getDataAtMouse() to get Index array.
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:false,
            fixedPoint:false,
            debugWindow:false,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            tooltip:false
         });
	 return false;
      }
*/

      layer = getTopVisibleLayer();
      viewerPos = emouseatlas.emap.utilities.findPos(targetContainer);

      // if we are in 'move' or 'draw' mode or pointClick as a user
      if(mode.name.toLowerCase() === "move" ||
         (mode.name.toLowerCase() === "query" && query.getQueryType() === "spatial") ||
	 (mode.name.toLowerCase() === "pointclick" && !pointClickEditor)) {
	 tileFrameContainerId = layer + "_tileFrameContainer";
	 if(document.getElementById(tileFrameContainerId) !== 'undefined' && document.getElementById(tileFrameContainerId) !== null) {
	    //tileFrameContainer = document.getElementById(tileFrameContainerId);

	    x = emouseatlas.emap.utilities.getMouseX(evt);
	    y = emouseatlas.emap.utilities.getMouseY(evt);

	    initialMousePoint = {x:x, y:y};
            //console.log("initialMousePoint ", initialMousePoint);
	    initialFocalPoint = {x:focalPoint.x, y:focalPoint.y};
            //console.log("initialFocalPoint ", initialFocalPoint);
	    mouseDownInImage = true;
	    addMouseDragHandlers(e);
	    if(mode.name.toLowerCase() === "query" && query.getQueryType() === "spatial") {
	       drawOrigin = getMousePositionInImage(initialMousePoint);
               //console.log("drawOrigin ", drawOrigin);
	       viewChanges.startDrawing = true;
	       notify("mouseDownInImage");
               return false;
	    }
	 }

	 setTileFrameClass("tiledImgDiv drag");

	 return false;
      }

      // if we are in 'pointClick' mode as editor
      if(mode.name.toLowerCase() === "pointclick" && pointClickEditor) {
         //console.log("pointclick && pointClickEditor");
         if(buttons.left && modifiers.shift && !modifiers.alt) {
            // and are about to drag a point (press shift + left mouse)
	    //console.log("mouse down in image as point click editor, shift pressed, alt not pressed");
	    addMouseDragHandlers(e);

	    x = emouseatlas.emap.utilities.getMouseX(evt);
	    y = emouseatlas.emap.utilities.getMouseY(evt);

	    initialMousePoint = {x:x, y:y};
	    //console.log("doMouseDownInImage: initialMousePoint ",initialMousePoint);
            mouseDownInImage = true;
            getDataAtMouse(evt, {
               addQueryTerm:false,
               contextMenu:false,
               draw:false,
               fixedPoint:false,
               debugWindow:false,
               HRSection:false,
               measuring:false,
               measuringOrigin: false,
               measuringTarget: false,
               overlay:false,
               pointClick:false,
               movingPCPoint:true,
               tooltip:false
            });
            return false;
         } else if(buttons.left && modifiers.shift && modifiers.alt) {
	    //console.log("doMouseDownInImage: ready to delete marker");
            return false;
	 } else {
	    //console.log("mouse down in image as point click editor. editorPointClick %s",viewChanges.editorPointClick);
	    //console.log("mouse down in image as point click editor, shift NOT pressed, alt NOT pressed");
            tileFrameContainerId = layer + "_tileFrameContainer";
            if(document.getElementById(tileFrameContainerId) !== 'undefined' && document.getElementById(tileFrameContainerId) !== null) {
               //tileFrameContainer = document.getElementById(tileFrameContainerId);
               getViewerContainerPos();
               getDataAtMouse(evt, {
                  addQueryTerm:false,
                  contextMenu:false,
                  draw:false,
                  fixedPoint:false,
                  debugWindow:false,
                  HRSection:false,
                  measuring:false,
                  measuringOrigin: false,
                  measuringTarget: false,
                  overlay:false,
                  pointClick:true,
                  movingPCPoint:false,
                  tooltip:false
               });
               return false;
            }
            return false;
         }
      }
      return false;

   }; // doMouseDownInImage

   //---------------------------------------------------------
   var doMouseUpInImage = function (e) {

      var buttons;
      var modifiers;

      //console.log("doMouseUpInImage");
      if(e) {
         removeMouseDragHandlers(e);
      }
      mouseDownInImage = false;

      buttons = emouseatlas.emap.utilities.whichMouseButtons(e);
      modifiers = emouseatlas.emap.utilities.whichModifierKeys(e);

      if(mode.name.toLowerCase() === "query" && query.getQueryType() === "spatial") {
         viewChanges.endDrawing = true;
         notify("mouseUpInImage");
         return false;
      }

      //console.log("doMouseUpInImage: mode.name.toLowerCase %s", mode.name.toLowerCase());
      //console.log("doMouseUpInImage: movingPCPoint %s,  pointClickEditor %s", movingPCPoint,pointClickEditor);
      if(mode.name.toLowerCase() === "pointclick" && pointClickEditor) {

         // this combination is used to delete a marker location.
         //if(buttons.left && modifiers.ctrl && modifiers.alt) {
         if(buttons.left && modifiers.shift && modifiers.alt) {
            //console.log("doMouseUpInImage: ", modifiers);
            viewChanges.deleteMarkerLocation = true;
            notify("mouseUpInImage");
            return false;
	 }
         viewChanges.endPCDrag = true;
         notify("mouseUpInImage");
         movingPCPoint = false;
         return false;
      }

      clearTimeout(mouseMoveTimeout);
      hideImgLabel();

      setTileFrameClass("tiledImgDiv");

      if(e) {
         preventPropagation(e);
      }

      return false;
   };

   //---------------------------------------------------------
   var doMouseOver = function (e) {
      //console.log("mouse over");
      addMouseWheelHandlers(e);
      return true;
   };

   //---------------------------------------------------------
   var doMouseOut = function (e) {
      clearTimeout(mouseMoveTimeout);
      removeMouseWheelHandlers(e);
      if(model.isWlzData()) {
    	 hideImgLabel();
      }
      if(mode.name.toLowerCase() === "pointclick") {
         viewChanges.mouseOut = true;
         notify("doMouseOut");
      }

      return false;
   };

   //---------------------------------------------------------
   var addMouseWheelHandlers = function (e) {

      var wheel = mousewheelIsSupported ? 'mousewheel' : 'DOMMouseScroll';
      for(i=0; i<numLayers; i++) {
	 var evt = e || window.event;
	 var tileFrame = tileFrameContainers[layerNames[i]].firstChild;
	 util.addEvent(tileFrame, wheel, doMouseWheel, false);
      }
      return false;
   };

   //---------------------------------------------------------
   var removeMouseWheelHandlers = function (e) {

      var wheel = mousewheelIsSupported ? 'mousewheel' : 'DOMMouseScroll';
      for(i=0; i<numLayers; i++) {
	 var evt = e || window.event;
	 var tileFrame = tileFrameContainers[layerNames[i]].firstChild;
	 util.removeEvent(tileFrame, wheel, doMouseWheel, false);
	 preventPropagation(e);
      }
      return false;
   };

   //---------------------------------------------------------
   var doMouseDown = function (e) {
       var target = emouseatlas.emap.utilities.getTarget(e);
       //console.log("doMouseDown from %s",target.id);
   };

   //---------------------------------------------------------
   var doMouseUp = function (e) {
     // console.log("View: doMouseUp");
   };

   //---------------------------------------------------------
   var addMouseDragHandlers = function (e) {

      for(i=0; i<numLayers; i++) {
	 var evt = e || window.event;
	 var tileFrame = tileFrameContainers[layerNames[i]].firstChild;
	 util.addEvent(tileFrame, 'mousemove', doMouseDrag, false);
	 preventPropagation(e);
      }
      return false;
   };

   //---------------------------------------------------------
   var removeMouseDragHandlers = function (e) {

      for(i=0; i<numLayers; i++) {
	 var evt = e || window.event;
	 var tileFrame = tileFrameContainers[layerNames[i]].firstChild;
	 util.removeEvent(tileFrame, 'mousemove', doMouseDrag, false);
	 preventPropagation(e);
      }
      return false;
   };

   //---------------------------------------------------------
   var doMouseMove = function (e) {

      var evt = e || window.event;
      var modename;
      
      //console.log("doMouseMove mouseDownInImage = %s",mouseDownInImage);
      
      if(!mouseDownInImage) {
         var timeStamp = e.timeStamp;
         if(mouseMoveTimeStamp === undefined) {
            mouseMoveTimeStamp = timeStamp;
         }
         var elapsedTime = timeStamp - mouseMoveTimeStamp;
         if(elapsedTime < mouseMoveDelay) {
            clearTimeout(mouseMoveTimeout);
         }
         mouseMoveTimeStamp = timeStamp;
         
         // this is a temporary test to see what the IIP server returns as 'Wlz' coordinates for a point relative to the image origin.
         // testCoordSystem();
         
         modename = getMode().name;
         //console.log("doMouseMove modename %s",modename);
         if(modename === "fixedPoint" ||
            modename === "HRSection" ||
            modename === "debug" ||
	    modename === "measuring" && !measuring) {
            preventPropagation(e);
            return false;
         }
         
         if(modename === "measuring" && measuring) {
	    //console.log("doMouseMove measuring ",measuring);
            mouseMoveTimeout = setTimeout(function() {getMeasurementData(evt)}, 2*mouseMoveDelay);
         } else if(modename === "pointClick" && !pointClickEditor) {
            mouseMoveTimeout = setTimeout(function() {getMarkerData(evt)}, 2*mouseMoveDelay);
            //mouseMoveTimeout = setTimeout(function() {console.log("mouse paused when in pointClick mode")}, 2*mouseMoveDelay)
         } else {
            mouseMoveTimeout = setTimeout(function() {showImgLabel(evt)}, 2*mouseMoveDelay);
            showImgLabel(evt);
         }
         
         preventPropagation(e);
         return false;
      }

   }; // doMouseMove

   //---------------------------------------------------------
   var doMouseDrag = function (e) {

      var evt;
      var x;
      var y;
      var dx = 0;
      var dy = 0;
      var imgFit;
      var buttons;
      var modifiers;
      var mouseX;
      var mouseY;
      var tileFrame;
      var fudge;

      evt = e || window.event;
      imgFit = getImgFit();

      buttons = emouseatlas.emap.utilities.whichMouseButtons(e);
      modifiers = emouseatlas.emap.utilities.whichModifierKeys(e);

      tileFrame = tileFrameContainers[layerNames[numLayers-1]].firstChild;
      if(typeof(tileFrame) === 'undefined') {
	 preventPropagation(evt);
         return false;
      }

      mouseX = emouseatlas.emap.utilities.getMouseX(evt);
      mouseY = emouseatlas.emap.utilities.getMouseY(evt);
      //console.log("doMouseDrag mouseX %d, mouseY %d",mouseX,mouseY);

      if(mode.name.toLowerCase() === "query" && query.getQueryType() === "spatial") {
         //console.log("doMouseDrag");
         getDataAtMouse(evt, {
            addQueryTerm:false,
            contextMenu:false,
            draw:true,
            fixedPoint:false,
            HRSection:false,
            measuring:false,
            measuringOrigin: false,
            measuringTarget: false,
            overlay:false,
            pointClick:false,
            tooltip:false
         });
	 return false;
      }

      if(mode.name.toLowerCase() === "pointclick" &&
	    pointClickEditor &&
	    buttons.left &&
	    modifiers.shift) {
	 pointClickPoint = getMousePositionInImage({x:mouseX, y:mouseY});
	 //console.log("doMouseDrag pointClickPoint ",pointClickPoint);
	 viewChanges.movingPCPoint = true;
	 notify("doMouseDrag");
	 return false;
      }

      imgFit = getImgFit();

      if (!imgFit.xfits) {
	 dx = mouseX - initialMousePoint.x;
      }
      if (!imgFit.yfits) {
	 dy = mouseY - initialMousePoint.y;
      }
      //console.log("doMouseDrag dx %d, dy %d",dx,dy);
      //console.log("doMouseDrag imageW %d, imageH %d",image.width,image.height);

      fudge = 0.01; // allows mouse drag to reveal bottom edge of image.
      if(!imgFit.xfits || !imgFit.yfits) {
         //console.log("doMouseDrag initialFocalPoint.x %d, initialFocalPoint.y %d",initialFocalPoint.x,initialFocalPoint.y);
	 x = initialFocalPoint.x - (dx / image.width)
	 x = (x > focalPoint.upperX) ? focalPoint.upperX : x;
	 x = (x < focalPoint.lowerX) ? focalPoint.lowerX : x;

	 y = initialFocalPoint.y - (dy / image.height)
	 y = (y > focalPoint.upperY) ? focalPoint.upperY + fudge : y;
	 y = (y < focalPoint.lowerY) ? focalPoint.lowerY : y;

         //console.log("setting focalpoint to x %d, y %d",x,y);
	 setFocalPoint({x:x, y:y}, "mouse");
      }

      preventPropagation(e);
      return false;

   }; // doMouseDrag

   //---------------------------------------------------------
   var doMouseClick = function (e) {
      //var modifiers = util.whichModifierKeys(e);
      //console.log("doMouseClick with ",modifiers);
      //showIndexDataInImage(e);
   };

   //---------------------------------------------------------
   var doMouseDblClick = function (e) {

      //console.log("doMouseDoubleClick");
      showIndexDataInImage(e);

      /*
      if(e.shiftKey === true) {
         //setScale(scale.cur / 2, 'mouse');
      } else {
         //setScale(scale.cur * 2, 'mouse');
      }
      */
   };

   //---------------------------------------------------------
   var preventPropagation = function (evt) {

/*
      // IE8 doesn't support event.preventDefault()
      if(evt.preventDefault) {
	 evt.preventDefault();
      }
      // IE8 doesn't support event.stopPropagation()
      if(evt.stopPropagation) {
	 evt.stopPropagation();
      }
      // the IE way
      if(evt.cancelBubble !== undefined) {
	 evt.cancelBubble = true;
      }
*/
   };

   //---------------------------------------------------------
   var doMouseWheel = function (e) {

      // Firefox & IE have different events.
      var delta = e.detail? e.detail*(-120) : e.wheelDelta;

      if(delta < 0) {
         setScale(scale.cur / 2, 'mouse');
      } else if(delta > 0) {
         setScale(scale.cur * 2, 'mouse');
      }

   };

   //---------------------------------------------------------
   // Scale must be a power of 2 for the IIP server/viewer
   //---------------------------------------------------------
   var setIIPMinScale = function(from) {
      if(_debug) console.log("enter view.setIIPMinScale from %s",from);

      if(model.isWlzData()) {
         if(scale.min) {
	    scale.iipmin = Math.pow(2,Math.floor(Math.log(scale.min) / Math.log(2)));
	 } else {
            scale.iipmin = 0.0625; // = 1/16   yes completely arbitrary!
	 }
      } else {
	 var maxiipres = model.getMaxIIPResolution();
	 scale.iipmin = Math.pow(2,-maxiipres);
      }

      if(_debug) console.log("exit view.setIIPMinScale from %s  %d",from,scale.iipmin);
   };

   //---------------------------------------------------------
   // This is the maximum scale (as a power of 2) that will allow image to fit within window
   //---------------------------------------------------------
   var setWinMinScale = function (from) {
      if(_debug) console.log("enter view.setWinMinScale from %s",from);
      fullImage = model.getFullImgDims();

      var xmin = viewport.width / fullImage.width;
      var ymin = viewport.height / fullImage.height;
      var min = (xmin < ymin) ? xmin : ymin;

      scale.winmin = Math.pow(2,Math.floor(Math.log(min) / Math.log(2)));

      /*
      if (model.isWlzData()) {
	 scale.winmin = Math.pow(2,Math.floor(Math.log(min) / Math.log(2)));
	 //scale.initial = parseFloat(scale.winmin);
      } else {
	 //   1/256   <-- where did this come from?
	 scale.winmin = 0.00390625;
      }
      */

      if(_debug) console.log("exit view.setWinMinScale from %s %d",from,scale.winmin);
   };

   //---------------------------------------------------------
   // Now we know winmin scale and iipmin scale, make a sensible choice.
   // We don't want the minimum scale to be such that we can't show the whole image,
   // and we want to have 1:1 as the largest possible scale.min
   //---------------------------------------------------------
   var setMinScale = function(from) {

      var deb = _debug;
      //_debug = true;

      if(_debug) console.log("enter view.setMinScale from %s",from);
      scale.min = (scale.iipmin < scale.winmin) ? scale.iipmin : scale.winmin;
      scale.min = (scale.min < 1) ? scale.min : 1;
      if(_debug) console.log("scale.min set to ",scale.min);
      constrainScale("setMinScale ",scale.min);
      if(_debug) console.log("exit view.setMinScale from %s",from);

      _debug = deb;
   };

   //---------------------------------------------------------
   // We have to make sure the current scale setting is valid
   //---------------------------------------------------------
   var constrainScale = function(from) {

      var deb = _debug;
      //_debug = true;

      if(_debug) console.log("enter view.constrainScale from %s",from);

      var currentVal;

      if (scale.cur === null || typeof(scale.cur) === 'undefined' || scale.cur === 0) {
	 scale.cur = scale.initial;
      }

      currentVal = scale.cur;
      if(_debug) console.log("currentVal ",currentVal);

      if (scale.cur < scale.min) {
	 scale.cur = scale.min;
      }

      if (scale.cur > scale.max) {
	 scale.cur = scale.max;
      }
      if(_debug) console.log("scale.cur ",scale.cur);

      // if it has changed ...
      if(scale.cur != currentVal) {
         if(_debug) console.log("constrainScale from %s, current scale has changed to %d",from, scale.cur);
         handleScaleChange("constrainScale");
      } else {
         if(_debug) console.log("constrainScale from %s, current scale hasn't changed",from);
      }

      if(_debug) console.log("exit view.constrainScale from %s",from);

      _debug = deb;
   };

   //---------------------------------------------------------
   var setInitialScale = function() {

      var deb = _debug;
      //_debug = true;

      if(_debug) console.log("enter view.setInitialScale");
      fullImage = model.getFullImgDims();

      var mscl = model.getScaleMaxMin();
      scale.max = mscl.max;
      scale.min = mscl.min;

      var initialState = model.getInitialState();
      if(_debug) console.log("initialState ",initialState);
      if(initialState.scale !== undefined) {
	 scale.initial = initialState.scale;
      } else {
	 scale.initial = 1;
      }
      if(_debug) console.log("scale.initial ",scale.initial);

      scale.iipmin = 0;
      scale.winmin = 0;
      scale.cur = 0;
      scale.old = 0;

      if (typeof(fullImage.width) !== 'undefined' && typeof(fullImage.height) !== 'undefined') {
         setIIPMinScale("setInitialScale");
	 setWinMinScale("setInitialScale");
	 setMinScale("setInitialScale");
	 scale.old = scale.cur;
      } else {
         if(_debug) console.log("setInitialScale: img w & h not established");
      }

      if(_debug) console.log("exit view.setInitialScale ",scale);

      _debug = deb;
   };

   //---------------------------------------------------------
   var handleScaleChange = function(from) {

     if(_debug) console.log("enter handleScaleChange: from %s",from);
     //console.log("window inner dims: W %d, H %d",window.innerWidth, window.innerHeight);

      fullImage = model.getFullImgDims();
      //console.log("fullImage.width %f, fullImage.height %f",fullImage.width,fullImage.height);
      handleImageSizeChange('handleScaleChange');
      //console.log("image.width %f, image.height %f",image.width,image.height);
      //console.log("viewport.width %f, viewport.height %f",viewport.width,viewport.height);

      //setResolutionData('handleScaleChange');
      //setLocatorData('handleScaleChange');

      focalPoint.upperX = 0.5 + Math.abs((image.width - viewport.width) / (2 * image.width));
      focalPoint.lowerX = 0.5 - Math.abs((image.width - viewport.width) / (2 * image.width));
      focalPoint.upperY = 0.5 + Math.abs((image.height - viewport.height) / (2 * image.height));
      //focalPoint.lowerY = 0.5 - Math.abs((image.height - viewport.height) / (2 * image.height));
      focalPoint.lowerY = 0.5 - Math.abs(0.05 + ((image.height - viewport.height) / (2 * image.height)));

      //console.log("focalPoint: lowerY %d, upperY %d",focalPoint.lowerY,focalPoint.upperY);

      constrainViewportToImage();

      // Introducing a delay allows the tileframe to be
      // repositioned while no tiles are showing, which looks a
      // lot more neat.

       /* !!!!! at the moment, due to the compliexity/deficiency of MVC model
	  or a bug in the code, one user action may cause the same
	  image to be loaded 1+ times by calling 
	  handleScaleChange, updateDst, and updateWlzRotation.
	  Due to time pressure, it is difficult to guarantee not
	  to call these functions unnecessary. Thus the following code
	  is used to stop some unnecessay image-loading
       */
      var clearParams = {scale: true, distance: false, rotation: false};
      if (initialised && model.isWlzData()) {
	var same = isSameImagePosition();
	if (!same) {

	  clearTiles(clearParams);
	  setTimeout("emouseatlas.emap.tiledImageView.requestImages('handleScaleChange')", 10);
	  setImagePosition();
	}
      } else {
	clearTiles(clearParams);
	setTimeout("emouseatlas.emap.tiledImageView.requestImages('handleScaleChange')", 10);
      }

      if ((image.width !== null && typeof(image.width) !== 'undefined') && (image.height !== null && typeof(image.height) !== 'undefined')) {
	 setTileFramePosition("handleScaleChange");
      }

      viewChanges.scale = true;
      notify("handleScaleChange ");

      if(_debug) console.log("exit handleScaleChange:");
   };

   //---------------------------------------------------------
   /*
     DON'T DELETE THIS
   * For very large images (GByte) we need to use a sub-sampled version if the scale is reduced.
   * Assume that the low res options are in order from least to most sub-sampled, eg 4,16,64
   */
   /*
   var setResolutionData = function(caller) {

      //console.log("enter view.setResolutionData called from %s",caller);
      var layer = layerData[currentLayer];

      var lowRes;
      var num = 0;
      var i;
      var intRate;

      resolutionData = {imageName:layer.imageName, sampleRate:1.0};

      if(layer.lowResData) {
         lowRes = layer.lowResData;
	 num = lowRes.length;
      }

      for(i=0; i<num; i++) {
         if(scale.cur <= lowRes[i].switchScl) {
	    intRate = parseInt(lowRes[i].sampleRate);
            resolutionData = {imageName:lowRes[i].imageName, sampleRate:intRate};
            //console.log("intRate %d, imageName %s",intRate,lowRes[i].imageName);
	 }
      }
      //console.log("exit view.setResolutionData called from %s",caller);
   };

   //---------------------------------------------------------
   var getResolutionData = function() {
      return resolutionData;
   };
   */

   //---------------------------------------------------------
   /*
   * For very large images (GByte) we need to use a sub-sampled version for the locator image.
   */
   /*
   var setLocatorData = function(caller) {

      // always show reference layer's image in locator  (mmm maybe not always nickb)
      var layer = layerData[layerNames[0]];
      if(layer.locatorData !== 'undefined') {
         locatorData = layer.locatorData;
      } else {
	 locatorData = {imageDir:layer.imageDir, imageName:layer.imageName, sampleRate:1.0};
      }

      //console.log("exit view.setLocatorData called from %s",caller);
   };

   //---------------------------------------------------------
   var getLocatorData = function() {
      //console.log(locatorData);
      return locatorData;
   };
   */

   //---------------------------------------------------------
   var setInitialMode = function() {
      var initialState = model.getInitialState();
      var newmode;
      //console.log("view.setInitialMode ",initialState);
      if(initialState.mode !== undefined) {
         newmode = initialState.mode;
         if(newmode === 'move') {
            mode = modes[newmode];
            setModeNum(0);
         } else if(newmode === 'measuring') {
            mode = modes[newmode];
            setModeNum(1);
         } else if(newmode === 'HRSection') {
            mode = modes[newmode];
            setModeNum(2);
         } else if(newmode === 'fixedPoint') {
            mode = modes[newmode];
            setModeNum(3);
         } else if(newmode === 'pointClick') {
            mode = modes[newmode];
            setModeNum(4);
         } else if(newmode === 'query') {
            mode = modes[newmode];
            setModeNum(5);
	    /*
         } else if(newmode === 'debug') {
            mode = modes[newmode];
            setModeNum(6);
	    */
         } else {
            return false;
         }
      } else {
         mode = modes['move'];
         setModeNum(0);
      }
   };

   //---------------------------------------------------------
   var setInitialImageLabels = function() {
      var initialState = model.getInitialState();
      //console.log("view.setInitialImageLabels ",initialState);

      imgLabels_enabled = (initialState.imgLabels === undefined) ? 'true' : initialState.imgLabels;
      imgLabels_enabled = (imgLabels_enabled === 'true' || imgLabels_enabled === true) ? true : false;
      //console.log("imgLabels_enabled ",imgLabels_enabled);
   };

   //---------------------------------------------------------
   /**
   * A set of functions that convert between
   * focalPoint (i.e.  a value between 0 and 1 expressing
   * the position of the centre of the viewport w.r.t. the image origin) and the position
   * of the top/left edge of the viewport with respect to the image origin.
   */

   // was roi2vpl2
   var getViewportLeftEdge = function() {
      //console.log("getViewportLeftEdge focalPoint.x %d, image.width %d, viewport.width %d",focalPoint.x,image.width,viewport.width);
      var ret = focalPoint.x * image.width - viewport.width/2;
      //console.log("getViewportLeftEdge ",ret);
      return ret;
   };
   //---------------------------------------------------------
   // was roi2vpt2
   var getViewportTopEdge = function() {
      //console.log("getViewportTopEdge focalPoint.y %d, image.height %d, viewport.height %d",focalPoint.y,image.height,viewport.height);
      var ret = focalPoint.y * image.height - viewport.height/2
      //console.log("getViewportTopEdge returning %d",ret);
      //console.log("getViewportTopEdge ",ret);
      return ret;
   };
   //---------------------------------------------------------
   var getFocalPointX = function(leftEdge) {
      //console.log("getFocalPointX: leftEdge ",leftEdge);
      return (leftEdge + viewport.width/2) / image.width;
   };
   //---------------------------------------------------------
   var getFocalPointY = function(topEdge) {
      //console.log("getFocalPointY: topEdge ",topEdge);
      return (topEdge + viewport.height/2) / image.height;
   };

   //---------------------------------------------------------
   var constrainViewportToImage = function () {

      //console.log("enter constrainViewportToImage:");
      //console.log("getViewportLeftEdge() ",getViewportLeftEdge());
      if (xfits) {
	 focalPoint.x = 0.5;
      } else if (getViewportLeftEdge() < 0) {
	 focalPoint.x = getFocalPointX(0);
      } else if (getViewportLeftEdge() + viewport.width > image.width) {
	 focalPoint.x = getFocalPointX(image.width - viewport.width);
      }
      if (yfits) {
	 focalPoint.y = 0.5;
      } else if (getViewportTopEdge() < 0) {
	 focalPoint.y = getFocalPointY(0);
      } else if (getViewportTopEdge() + viewport.height > image.height) {
	 focalPoint.y = getFocalPointY(image.height - viewport.height);
      }

      //console.log("exit constrainViewportToImage:");
   }; // constrainViewportToImage

   //---------------------------------------------------------
   // get the mouse position relative to the image left / top edges.
   var getMousePositionInImage = function(mousePos) {
      var viewport_x = getViewerContainerPos().x;
      var viewport_y = getViewerContainerPos().y;
      var imgToViewport_x = getViewportLeftEdge();
      var imgToViewport_y = getViewportTopEdge();
      //console.log("getMousePositionInImage: mouse %d,%d viewport %d,%d  imgToViewport %d,%d  scale %d",mousePos.x,mousePos.y,viewport_x,viewport_y,imgToViewport_x,imgToViewport_y,scale.cur);
      //var fudgeFactor = {x:-3, y:-8};
      var fudgeFactor = {x:0, y:0};
      var x = mousePos.x - getViewerContainerPos().x + getViewportLeftEdge() + fudgeFactor.x;
      var y = mousePos.y - getViewerContainerPos().y + getViewportTopEdge() + fudgeFactor.x;
      ret = {x:x, y:y};

      //console.log("getMousePositionInImage ",ret);
      return ret;
   };

   //---------------------------------------------------------
   // get the screen position given the coords in the image.
   // NOTE: This isn't working !
   //---------------------------------------------------------
   /*
   var getDisplayPositionGivenImgCoords = function(imgCoords) {
      var viewport_x = getViewerContainerPos().x;
      var viewport_y = getViewerContainerPos().y;
      var imgToViewport_x = getViewportLeftEdge();
      var imgToViewport_y = getViewportTopEdge();

      if(isNaN(viewport_x) || isNaN(viewport_y)) {
         console.log("plain NaN");
	 return undefined;
      //} else {
       //  console.log("viewport_x %d, viewport_y %d",viewport_x,viewport_y);
      }
      if(isNaN(imgToViewport_x) || isNaN(imgToViewport_y)) {
         console.log("peshwari NaN");
	 return undefined;
      } else {
         console.log("imgToViewport_x %d, imgToViewport_y %d",imgToViewport_x,imgToViewport_y);
      }

      console.log("getDisplayPositionGivenImgCoords: imgCoords %d,%d scale %d",imgCoords.x,imgCoords.y,scale.cur);
      var x = (Number(imgCoords.x) * scale.cur) - Number(getViewportLeftEdge());
      var y = (Number(imgCoords.y) * scale.cur) - Number(getViewportTopEdge());
      ret = {x:x, y:y};

      console.log("getDisplayPositionGivenImgCoords ",ret);
      return ret;
   };
   */

   //---------------------------------------------------------
   var completeInitialisation = function () {
 
      var deb = _debug;
      //_debug = true;
      var dropListenerId;
      var targetId;
      var params = {};
      var infoDetailsl;

      // make sure the window can use scrollbars
      document.body.style.overflow = 'visible';
      document.documentElement.style.overflow = "visible"; /*maze: ie bug fix, some versions of ie have scroll property in <html> instead of <body>*/

      util.addEvent(window, 'resize', setViewportSize, false);
      setViewportSize("completeInitialisation");

      targetId = model.getViewerTargetId();
      //console.log("completeInitialisation targetId <%s>",targetId);
      if(document.getElementById(targetId)) {
	 targetContainer = document.getElementById(targetId);
	 //util.addEvent(targetContainer, 'mousedown', doMouseDown, false);
	 buildTileFrameContainer();
	 buildHelpIconContainer();
	 buildInfoIconContainer();
      } else {
      }

      addAllLayersToView();
      setInitialState();
      addTools();
      setContextMenus();
      //setIndexDataToolTip();
      setTitle();
      setTitleTooltip();
      setInitialMode();
      document.body.style.cursor = "default";

      pointClickEditor = model.isEditor();

      // set up info frame
      infoDetails = model.getInfoDetails();
      if(infoDetails && infoDetails.jso) {
         info.initialise({
              targetId:targetId,
   	      details:infoDetails,
   	      model:emouseatlas.emap.tiledImageModel,
   	      view:emouseatlas.emap.tiledImageView
         });
      }

      // initialise tiledImageQuery
      if(query) {
         query.initialise(getName());
      }

      // initialise tiledImagePointClick
      if(pointClick) {
         pointClick.initialise(getName());
      }

      // initialise supplementPointClick
      if(supplementPointClick) {
         supplementPointClick.initialise(getName());
      }

      // initialise gudmapPointClick
      if(gudmapPointClick) {
         gudmapPointClick.initialise(getName());
      }

      //dropListenerId = model.getProjectDivId();
      dropListenerId = "emapIIPViewerDiv";
      dropListener = $(dropListenerId);
      if(dropListener) {
         emouseatlas.emap.drag.register({drag:"wlzIIPViewerIFrameContainer", drop:dropListenerId}, "tiledImageView");
         emouseatlas.emap.drag.register({drag:"wlzIIPViewerInfoIFrameContainer", drop:dropListenerId}, "tiledImageView");
         emouseatlas.emap.drag.register({drag:"wlzIIPViewerX3domHelpIFrameContainer", drop:dropListenerId}, "tiledImageView");
         //emouseatlas.emap.drag.register({drag:"threeDAnatomyHelpIFrameContainer", drop:dropListenerId}, "tiledImageView");
      }
         //emouseatlas.emap.drag.register({drag:"wlzIIPViewer3DIFrameContainer", drop:dropListenerId});

      _debug = deb;

   }; // completeInitialisation

   //---------------------------------------------------------
   /**
    *   <Deprecated>
    *   Sets the title for the image.
    *   Note: previously the title was read in from .json file, now the title
    *   is in the .php file and the tool-tip is read in from the .json file.
    */
   var setTitle = function() {

      //..........................
      // deprecated way of setting title
      //..........................
      var title = model.getImageTitle();
      if(titleDiv) {
        if(titleDiv.firstChild === undefined || titleDiv.firstChild === null) {
           var tnode = document.createTextNode(title);
           titleDiv.appendChild(tnode);
        } else {
           titleDiv.firstChild.nodeValue = title;
        }
	return false;
      }
      //..........................

      var titleTooltip = model.getImageTitleTooltip();
      var titleDiv = document.getElementById("wlzIIPViewerTitle");
      if(titleDiv === undefined) {
         return false;
      }
      
   };

   //---------------------------------------------------------
   /**
    *   Sets tool-tip for mouse over the title of tiled image (if required).
    *   Note: the tool-tip content is read in from a .json file.
    */
   var setTitleTooltip = function() {

      var titleTooltip;
      var titleDiv;
      var titleTooltipContainer;
      var titleTooltipTextDiv;
      var titleTooltipText;
      var titleTooltipTextDiv;
      var titleTooltipLogoDiv;
      var titleTooltipLogo;
      var project;
      var src;
      var line;
      var len;
      var i;

      titleTooltip = model.getImageTitleTooltip();
      if(titleTooltip === undefined || titleTooltip === null) {
         return false;
      }

      titleDiv = document.getElementById("wlzIIPViewerTitle");
      if(titleDiv === undefined) {
         return false;
      }
      project = (titleTooltip.project !== undefined) ? titleTooltip.project : "";
      util.addEvent(titleDiv, 'mouseover', showTitleTooltip, false);
      util.addEvent(titleDiv, 'mouseout', showTitleTooltip, false);

      titleTooltipContainer = document.createElement('div');
      titleTooltipContainer.id = "titleTooltipContainerDiv";
      titleTooltipContainer.className = project;
      titleDiv.appendChild(titleTooltipContainer);

      if(titleTooltip.logo !== undefined) {
         titleTooltipLogoDiv = document.createElement('div');
	 titleTooltipLogoDiv.id = "titleTooltipLogoDiv";
	 titleTooltipLogoDiv.className = project;
	 titleTooltipContainer.appendChild(titleTooltipLogoDiv);
         titleTooltipLogo = document.createElement('img');
	 titleTooltipLogo.className = "titleTooltipLogoImg";
	 titleTooltipLogo.src = titleTooltip.logo;
	 titleTooltipLogoDiv.appendChild(titleTooltipLogo);
      }

      titleTooltipTextContainer = document.createElement('div');
      titleTooltipTextContainer.id = "titleTooltipTextContainer";
      titleTooltipTextContainer.className = project;
      titleTooltipContainer.appendChild(titleTooltipTextContainer);

      len = titleTooltip.text.length;
      for(i=0; i<len; i++) {
	 titleTooltipTextDiv = document.createElement('div');
	 titleTooltipTextDiv.className = "titleTooltipTextDiv";
	 titleTooltipTextContainer.appendChild(titleTooltipTextDiv);
	 line = titleTooltip.text[i];
	 titleTooltipText = document.createTextNode(line);
	 titleTooltipTextDiv.appendChild(titleTooltipText);
      }
      
   };

   //---------------------------------------------------------
   /**
    *   Show or hide tool-tip for mouse over the title of tiled image.
    */
   var showTitleTooltip = function(e) {
      
      var target = emouseatlas.emap.utilities.getTarget(e);
      var tooltipContainer;

      if(target.id !== "wlzIIPViewerTitle") {
         return false;
      }

      tooltipContainer = document.getElementById("titleTooltipContainerDiv");
      if(e.type === "mouseover") {
         tooltipContainer.style.visibility = "visible";
      } else if(e.type === "mouseout") {
         tooltipContainer.style.visibility = "hidden";
      }
   };

   //---------------------------------------------------------
   /**
    *   Sets up the context (right-click) menus
    */
   var setContextMenus = function() {
      var menuData;
      var interfaceImagePath;
      var imageParams;
      var tableParams;
      var treeParams;

      menuData = model.getMenuData();
      interfaceImagePath = model.getInterfaceImageDir();

      if(menuData.structureUrl && menuData.contentUrl) {
         imageContextMenu = new emouseatlas.emap.EmapMenu();
         imageParams = {
             view: emouseatlas.emap.tiledImageView, 
   	     menuName: "tiledImage",
	     menuParent: "projectDiv",
   	     structureUrl: menuData.structureUrl,
             contentUrl: menuData.contentUrl,
   	     imagePath: interfaceImagePath
         }
	 //console.log("image");
         imageContextMenu.initialise(imageParams);
      }

      if(menuData.tableStructureUrl && menuData.tableContentUrl) {
         tableContextMenu = new emouseatlas.emap.EmapMenu();
         tableParams = {
             view: emouseatlas.emap.tiledImageView, 
   	     menuName: "table",
	     menuParent: "projectDiv",
   	     structureUrl: menuData.tableStructureUrl,
             contentUrl: menuData.tableContentUrl,
   	     imagePath: interfaceImagePath
         }
	 //console.log("table");
         tableContextMenu.initialise(tableParams);
      }

      if(menuData.treeStructureUrl && menuData.treeContentUrl) {
         treeContextMenu = new emouseatlas.emap.EmapMenu();
         treeParams = {
             view: emouseatlas.emap.tiledImageView, 
   	     menuName: "tree",
	     menuParent: "projectDiv",
   	     structureUrl: menuData.treeStructureUrl,
             contentUrl: menuData.treeContentUrl,
   	     imagePath: interfaceImagePath
         }
	 //console.log("tree");
         treeContextMenu.initialise(treeParams);
      }
   };

   //---------------------------------------------------------
   /**
    *   Sets initial scale, distance and viewing angles
    */
   var setInitialState = function() {
      //console.log("enter view.setInitialState");
      setInitialScale();
      setFocalPoint({x:0.5, y:0.5},"initialState");
      setInitialImageLabels();
      model.setInitialState();
      //console.log("exit view.setInitialState");
   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   //var initialise = function (tiledImageModel, tiledImageQuery, tiledImagePointClick) {
   var initialise = function () {

      if(_debug) console.log("View: initialise");

      view = emouseatlas.emap.tiledImageView;
      model = emouseatlas.emap.tiledImageModel;
      query = emouseatlas.emap.tiledImageQuery;
      pointClick = emouseatlas.emap.tiledImagePointClick;
      supplementPointClick = emouseatlas.emap.supplementPointClick;
      gudmapPointClick = emouseatlas.emap.gudmapPointClick;

      model.register(emouseatlas.emap.tiledImageView, "view");

      if(query) {
         query.register(emouseatlas.emap.tiledImageView, "view");
      }

      if(pointClick) {
         pointClick.register(emouseatlas.emap.tiledImageView, "view");
      }
      if(supplementPointClick) {
         supplementPointClick.register(emouseatlas.emap.tiledImageView, "view");
      }
       
      // this is a hack to fix the TPR demo
      stackofs = model.getWlzToStackOffset();
      //console.log("stackofs = ",stackofs);

      origMax3dToShow = 30;
      max3dToShow = origMax3dToShow;
      SHOW_3D_ANATOMY_WARNING_DIALOG = true;

      if(_debug) console.log("View: completeInitialisation");
      completeInitialisation();
      if(_debug) console.log("View: done");
   }; // initialise

   //---------------------------------------------------------
   // tools registered here will be added in addtools()
   // we have to use the 'associative array' way of referencing properties
   // so we can add new tools using a variable instead of an actual string.
   var registerTools = function (toolArr) {

      var len;
      var i;

      if(toolArr && toolArr.length > 0) {
         len = toolArr.length;
	 for(i=0; i<len; i++) {
            if(typeof(tools[toolArr[i]]) === 'undefined') {
	       tools[toolArr[i]] = {};
            }
	 }
      }

   };

   //---------------------------------------------------------
   // Read in tool size, position etc from configuration file.
   var getToolParams = function () {

      var url = model.getToolsMetadataUrl();
      var ajaxParams = {
	 url:url,
	 method:"POST",
	 callback:getToolParamsCallback,
	 async:true
      }
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);
   };

   //---------------------------------------------------------
   // Callback method for getToolParams
   var getToolParamsCallback = function (response) {

      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return false;
      }

      var json;
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
	 json = JSON.parse(response);
      } else {
	 json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
	 return false;
      }

      registerTools(json.toBeUsed);
      constructTools(json);
      constructUtils();

   };

   //---------------------------------------------------------
   // Construct all registered tools.
   var constructTools = function (toolData) {

      var params;
      var project;
      var layer;
      var treeLayer;
      var sectionSelection;

      params = {};
      project = model.getProject();
      //console.log("tiledImageView project -->%s<--",project);

      if(typeof(tools.layerProperties) !== 'undefined') {
         params = {
	    targetId:toolData.layerProperties.targetId,
	    klass: toolData.layerProperties.klass
         }
         if(emouseatlas.emap.layerProperties) {
            emouseatlas.emap.layerProperties.initialise(params);
         }
      }

      if(typeof(tools.magnification) !== 'undefined') {
         params = {
	    targetId: toolData.magnification.targetId,
	    klass: toolData.magnification.klass
         }
         if(emouseatlas.emap.magnification) {
            emouseatlas.emap.magnification.initialise(params);
         }
      }

      if(typeof(tools.distance) !== 'undefined') {
         params = {
	    targetId:toolData.distance.targetId,
	    klass: toolData.distance.klass
         }
         if(emouseatlas.emap.distance) {
            emouseatlas.emap.distance.initialise(params);
         }
      }

      if(typeof(tools.comboDistance) !== 'undefined') {
         params = {
	    targetId:toolData.comboDistance.targetId,
	    klass: toolData.comboDistance.klass
         }
         if(emouseatlas.emap.comboDistance) {
            emouseatlas.emap.comboDistance.initialise(params);
         }
      }

      if(typeof(tools.tree) !== 'undefined') {
         treeLayer = model.getFirstTreeLayer();
	 params = {
	    project:project,
	    title:"",
	    layer:treeLayer,
	    targetId:toolData.tree.targetId,
	    klass: toolData.tree.klass
	 }
         if(emouseatlas.emap.treeTool) {
            emouseatlas.emap.treeTool.initialise(params);
         }
      }

      if(typeof(tools.colourTool) !== 'undefined') {
	 params = {
	    project:project,
	    title:"Colour Tool",
	    layer:"anatomy",
	    targetId:toolData.colourTool.targetId,
	    klass: toolData.colourTool.klass
	 }
         if(emouseatlas.emap.colourTool) {
            emouseatlas.emap.colourTool.initialise(params);
         }
      }

      if(typeof(tools.test4Webgl) !== 'undefined') {
         params = {
	    targetId:toolData.test4Webgl.targetId,
	    klass: toolData.test4Webgl.klass
         }
         if(emouseatlas.emap.test4Webgl) {
            emouseatlas.emap.test4Webgl.initialise(params);
         }
      }

      if(typeof(tools.refreshTool) !== 'undefined') {
         params = {
            targetId:toolData.refreshTool.targetId,
	    klass: toolData.refreshTool.klass
         }
         if(emouseatlas.emap.refreshTool) {
            emouseatlas.emap.refreshTool.initialise(params);
         }
      }

      if(typeof(tools.rotation) !== 'undefined') {
         params = {
	    targetId:toolData.rotation.targetId,
	    klass: toolData.rotation.klass
         }
         if(emouseatlas.emap.rotation) {
            emouseatlas.emap.rotation.initialise(params);
         }
      }

      if(typeof(tools.fixedPoint) !== 'undefined') {
         params = {
	    targetId:toolData.fixedPoint.targetId,
	    klass: toolData.fixedPoint.klass
         }
         if(emouseatlas.emap.fixedPoint) {
            emouseatlas.emap.fixedPoint.initialise(params);
         }
      }

      if(typeof(tools.scalebar) !== 'undefined') {
         params = {
	    targetId:toolData.scalebar.targetId,
	    klass: toolData.scalebar.klass
         }
         if(emouseatlas.emap.scalebar) {
            emouseatlas.emap.scalebar.initialise(params);
         }
      }

      if(typeof(tools.sectionSelector) !== 'undefined') {
         params = {
	    targetId:toolData.sectionSelector.targetId,
	    x:toolData.sectionSelector.x,
	    y:toolData.sectionSelector.y,
            maxdim:toolData.sectionSelector.maxdim,
         }
         if(emouseatlas.emap.sectionSelector) {
            emouseatlas.emap.sectionSelector.initialise(params);
         }
      }

      if(typeof(tools.locator) !== 'undefined') {
	 new tiledImageLocatorTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.locator.targetId,
	            drag:toolData.locator.draggable,
	            borders:toolData.locator.borders,
	            toBottom:toolData.locator.toBottom,
	            width:toolData.locator.width,
		    height:toolData.locator.height,
		    x:toolData.locator.x,
		    y:toolData.locator.y}
	 });
      }

      if(typeof(tools.selector) !== 'undefined') {
	 new tiledImageSelectorTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.selector.targetId,
	            drag:toolData.selector.draggable,
	            toBottom:toolData.selector.toBottom,
		    invert:toolData.selector.invertArrows,
		    useFilename:toolData.selector.useFilename,
	            maxdim:toolData.selector.maxdim,
		    x:toolData.selector.x,
		    y:toolData.selector.y}
	 });
      }

      if(typeof(tools.expression) !== 'undefined') {
	 new expressionLevelKey({
	    model:model,
	    view:view,
	    params:{targetId:toolData.expression.targetId,
	            drag:toolData.expression.draggable,
	            width:toolData.expression.width,
		    height:toolData.expression.height,
		    x:toolData.expression.x,
		    y:toolData.expression.y}
	 });
      }

      if(typeof(tools.layer) !== 'undefined') {
	 new tiledImageLayerTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.layer.targetId,
	            drag:toolData.layer.draggable,
		    thinTopEdge:toolData.layer.thinTopEdge,
	            width:toolData.layer.width,
		    height:toolData.layer.height,
		    x:toolData.layer.x,
		    y:toolData.layer.y,
		    isHorizontal:toolData.layer.isHorizontal}
	 });
      }

      if(typeof(tools.pitchYaw) !== 'undefined') {
	 new tiledImagePitchYawTool({
	    model:model,
	    view:view,
	    params:{
	            targetId:toolData.pitchYaw.targetId,
	            drag:toolData.pitchYaw.draggable,
	            width:toolData.pitchYaw.width,
		    height:toolData.pitchYaw.height,
		    x:toolData.pitchYaw.x,
		    y:toolData.pitchYaw.y,
		    maxPitch:toolData.pitchYaw.maxPitch,
		    maxYaw:toolData.pitchYaw.maxYaw,
		    gap:toolData.pitchYaw.gap,
		    navImage:toolData.pitchYaw.navImage
		   }
	 });
      }

      if(typeof(tools.measure) !== 'undefined') {
	 new tiledImageMeasuringTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.measure.targetId,
	            drag:toolData.measure.draggable,
	            borders:toolData.measure.borders,
		    allowClose: toolData.measure.allowClose,
	            transparent:toolData.measure.transparent,
	            bgc:toolData.measure.bgc,
	            width:toolData.measure.width,
	            height:toolData.measure.height,
		    x:toolData.measure.x,
		    y:toolData.measure.y}
	 });
      }

      if(typeof(tools.draw) !== 'undefined') {
	 draw = new tiledImageDrawingTool({
	    model:model,
	    view:view,
	    query:query,
	    params:{targetId:toolData.draw.targetId,
	            drag:toolData.draw.draggable,
	            borders:toolData.draw.borders,
		    allowClose: toolData.draw.allowClose,
	            transparent:toolData.draw.transparent,
	            width:toolData.draw.width,
	            height:toolData.draw.height,
		    x:toolData.draw.x,
		    y:toolData.draw.y}
	 });
      }

      if(typeof(tools.equivalentSection) !== 'undefined') {
	 new tiledImageEquivalentSectionTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.equivalentSection.targetId,
	            drag:toolData.equivalentSection.draggable,
	            borders:toolData.equivalentSection.borders,
		    allowClose: toolData.equivalentSection.allowClose,
	            transparent:toolData.equivalentSection.transparent,
	            width:toolData.equivalentSection.width,
	            height:toolData.equivalentSection.height,
		    x:toolData.equivalentSection.x,
		    y:toolData.equivalentSection.y}
	 });
      }

      if(typeof(tools.expressionSection) !== 'undefined') {
	 new tiledImageExpressionSectionTool({
	    model:model,
	    view:view,
	    sectionName:model.getExpressionSectionName(),
	    section:model.getExpressionSection(),
	    params:{targetId:toolData.expressionSection.targetId,
	            title:'expression sections',
	            drag:toolData.expressionSection.draggable,
	            width:toolData.expressionSection.width,
	            height:toolData.expressionSection.height,
		    x:toolData.expressionSection.x,
		    y:toolData.expressionSection.y}
	 });
	 sectionSelection = document.getElementById('expressionSection');
	 if (typeof(sectionSelection) !== 'undefined')
	   sectionSelection.selectedIndex = 0;
      }

      layer = model.getFirstTreeLayer();
      if(typeof(tools.oldtree) !== 'undefined') {
         //console.log(toolData.tree);
	 new tiledImageTreeTool({
	    model:model,
	    view:view,
	    params:{targetId:toolData.tree.targetId,
	            title:toolData.tree.title,
	            drag:toolData.tree.draggable,
		    thinTopEdge:toolData.layer.thinTopEdge,
		    layer:layer,
	            width:toolData.tree.width,
	            height:toolData.tree.height,
                    toRight:toolData.tree.toRight,
                    systems:toolData.tree.systems,
		    x:toolData.tree.x,
		    y:toolData.tree.y,
		    allowClose: false}
	 });
      }

      if(typeof(tools.help) !== 'undefined') {
	 new tiledImageHelp({
	    targetId: "emapIIPViewerDiv",
	    view: view,
	    type: "wlzIIPViewer"
	 });
      }

      if(typeof(tools.x3domHelp) !== 'undefined') {
	 new x3domHelp({
	    targetId: "emapIIPViewerDiv",
	    view: view,
	    type: "wlzIIPViewerX3domHelp"
	 });
      }

      if(typeof(tools.tprPointClick) !== 'undefined') {
         emouseatlas.emap.tprPointClick.initialize();
      }

      if(typeof(tools.pointClickSelector) !== 'undefined') {
	 new pointClickSelector({
	    model:model,
	    view:view,
	    params:{targetId:toolData.pointClickSelector.targetId,
	            drag:toolData.pointClickSelector.draggable,
	            borders:toolData.pointClickSelector.borders,
	            toBottom:toolData.pointClickSelector.toBottom,
		    invert:toolData.pointClickSelector.invertArrows,
		    useFilename:toolData.pointClickSelector.useFilename,
	            maxdim:toolData.pointClickSelector.maxdim,
	            width:toolData.pointClickSelector.width,
		    height:toolData.pointClickSelector.height,
		    x:toolData.pointClickSelector.x,
		    y:toolData.pointClickSelector.y}
	 });
      }

      if(typeof(tools.threeDFeedback) !== 'undefined') {
	 new tiledImage3DFeedback({
	    model:model,
	    view:view,
	    params:{
	            targetId:toolData.threeDFeedback.targetId,
	            drag:toolData.threeDFeedback.draggable,
	            width:toolData.threeDFeedback.width,
		    height:toolData.threeDFeedback.height,
		    x:toolData.threeDFeedback.x,
		    y:toolData.threeDFeedback.y
		   }
	 });
      }

      if(query) {
	 if(typeof(tools.query) !== 'undefined') {
	    new queryTool({
	       model:model,
	       view:view,
	       query:query,
	       params:{targetId:toolData.query.targetId,
		       title:'query',
		       drag:toolData.query.draggable,
		       width:toolData.query.width,
		       height:toolData.query.height,
		       x:toolData.query.x,
		       y:toolData.query.y}
	    });
	 }

	 if(typeof(tools.querySection) !== 'undefined') {
	    new querySectionTool({
	       model:model,
	       view:view,
	       query:query,
	       params:{targetId:toolData.querySection.targetId,
		       drag:toolData.querySection.draggable,
		       borders:toolData.querySection.borders,
		       allowClose: toolData.querySection.allowClose,
		       transparent:toolData.querySection.transparent,
		       width:toolData.querySection.width,
		       height:toolData.querySection.height,
		       x:toolData.querySection.x,
		       y:toolData.querySection.y}
	    });
	 }

	 if(typeof(tools.queryTerm) !== 'undefined') {
	    new queryTermTool({
	       model:model,
	       view:view,
	       query:query,
	       params:{targetId:toolData.queryTerm.targetId,
		       drag:toolData.queryTerm.draggable,
		       borders:toolData.queryTerm.borders,
		       allowClose: toolData.queryTerm.allowClose,
		       transparent:toolData.queryTerm.transparent,
		       width:toolData.queryTerm.width,
		       height:toolData.queryTerm.height,
		       x:toolData.queryTerm.x,
		       y:toolData.queryTerm.y}
	    });
	 }

      }

      if(typeof(tools.debug) !== 'undefined') {
	 new debugUtil({
	    model:model,
	    view:view,
	    query:query,
	    params:{targetId:toolData.debug.targetId,
	            drag:toolData.debug.draggable,
	            borders:toolData.debug.borders,
		    allowClose: toolData.debug.allowClose,
	            transparent:toolData.debug.transparent,
	            width:toolData.debug.width,
	            height:toolData.debug.height,
		    x:toolData.debug.x,
		    y:toolData.debug.y}
	 });
      }

      if(typeof(tools.queryChoice) !== 'undefined') {
	 new queryChoice({
	    model:model,
	    view:view,
	    query:query,
	    params:{targetId:toolData.queryChoice.targetId,
	            drag:toolData.queryChoice.draggable,
	            borders:toolData.queryChoice.borders,
		    allowClose: toolData.queryChoice.allowClose,
                    toRight:toolData.queryChoice.toRight,
	            transparent:toolData.queryChoice.transparent,
	            width:toolData.queryChoice.width,
	            height:toolData.queryChoice.height,
		    x:toolData.queryChoice.x,
		    y:toolData.queryChoice.y}
	 });
      }

      if(typeof(tools.plateDropDown) !== 'undefined') {
         params = {
	    project: project,
	    targetId:toolData.plateDropDown.targetId,
	    type: toolData.plateDropDown.type,
	    klass: toolData.plateDropDown.klass
         }
	 plateDropDown = new emouseatlas.emap.pointClickDropDown();
         plateDropDown.initialise(params);
      }

      if(typeof(tools.imageDropDown) !== 'undefined') {
         params = {
	    project: project,
	    targetId:toolData.imageDropDown.targetId,
	    type: toolData.imageDropDown.type,
	    klass: toolData.imageDropDown.klass
         }
	 imageDropDown = new emouseatlas.emap.pointClickDropDown();
         imageDropDown.initialise(params);
      }

      //console.log("exit constructComponents");
   };

   //---------------------------------------------------------
   // Construct utilities such as imgLabel
   var constructUtils = function () {

      //console.log("enter constructUtils");
      var project;
      project = model.getProject();

      if(emouseatlas.emap.imgLabel) {
         emouseatlas.emap.imgLabel.initialise();
      }

      /*
      if(emouseatlas.emap.scalebar) {
         emouseatlas.emap.scalebar.initialise();
      }
      */

      if(emouseatlas.emap.newQueryTool) {
         emouseatlas.emap.newQueryTool.initialise({project:project});
      }

      if(emouseatlas.emap.chooseItemMGI) {
         emouseatlas.emap.chooseItemMGI.initialise({project:project});
      }

      if(emouseatlas.emap.threeDAnatomyWarning) {
         emouseatlas.emap.threeDAnatomyWarning.initialise({project:project});
      }

      if(emouseatlas.emap.chooseKaufmanItem) {
         emouseatlas.emap.chooseKaufmanItem.initialise({project:project});
      }

      if(emouseatlas.emap.mouseFeedback) {
         emouseatlas.emap.mouseFeedback.initialise();
      }

      if(emouseatlas.emap.threeDAnatomyHelp) {
         var params;
	 params = {
	    project:project,
	    view:view,
	    type:"threeDAnatomyHelp"
	 }
         emouseatlas.emap.threeDAnatomyHelp.initialise(params);
      }

      // this is here because it must wait until the ajax calls have returned.
      viewChanges.initial = true;
      notify("constructUtils");

      //console.log("exit constructUtils");
   };

   //---------------------------------------------------------
   // Add all registered tools to the view.
   var addTools = function () {
      getToolParams();
   };

   //---------------------------------------------------------
   var handleImageSizeChange = function(caller) {
      image.width = fullImage.width * scale.cur;
      image.height = fullImage.height * scale.cur;

      image.width = Math.floor(image.width); // to fix tiling problem
      image.height = Math.floor(image.height); // to fix tiling problem

      viewable.width = (viewport.width < image.width) ? viewport.width : image.width;
      viewable.height = (viewport.height < image.height) ? viewport.height : image.height;
      xfits = (viewport.width > image.width);
      yfits = (viewport.height > image.height);
      //console.log("view.handleImageSizeChange (called from %s) image.width %f, image.height %f",caller,image.width,image.height);
   }

   //---------------------------------------------------------
   // these need to be separate cases; not if ... else 
   // Changing rotation or distance sliders 
   // should not update the main image until a 'mouse up' event occurs.
   // Only the locator image should change before that.
   //---------------------------------------------------------
   var modelUpdate = function(modelChanges) {
      if(modelChanges.initialState === true) {
         updateDst();
         updateWlzRotation("initialState");
         handleImageSizeChange('modelUpdate.initialState');
         updateWlzLocator("initialState");
      }
      if(modelChanges.dst === true) {
         updateDst();
      }
      if(modelChanges.rotation === true) {
         //updateWlzRotation("rotation");
      }
      if(modelChanges.locator === true) {
         // I know handleImageSizeChange() is called in updateWlzLocator()
         // but it is needed here as well.
         handleImageSizeChange('modelUpdate.locator');
         updateWlzLocator("locator");
      }
      if(modelChanges.fxp === true) {
         if (model.isWlzData()) { 
            if (initialised && !isSameImagePosition()) {
               setTimeout("emouseatlas.emap.tiledImageView.requestImages('modelUpdate fxp')", 10);
            }
         }
      }
      if(modelChanges.setSection === true) {
         updateDst();
         handleImageSizeChange('modelUpdate.locator');
         updateWlzLocator("locator");
         if (model.isWlzData()) { 
            if (initialised && !isSameImagePosition() && !query.isImporting()) {
               setTimeout("emouseatlas.emap.tiledImageView.requestImages('modelUpdate fxp')", 10);
            }
         }
      }

   };

   //---------------------------------------------------------
   var queryUpdate = function(queryChanges) {

   };
   //---------------------------------------------------------
   var pointClickUpdate = function(queryChanges) {

   };

   //---------------------------------------------------------
   /**
   * Delete our old image mosaic
   * Called when scale or dst is changed
   *
   * @author Ruven Pillay
   */
   var clearTiles = function(params) {

      //console.log("view.clearTiles");

      var scale2clear;
      if(params.scale !== undefined &&
	 params.scale === true) {
	 scale2clear = scale.old;
      } else {
	 scale2clear = scale.cur;
      }

      var tileClass = "tile " + "s" + scale2clear + "d" + oldDst;
      var childrenToRemove = [];
      var tileFrameContainer;
      var tileFrame;
      var layer;
      var children;
      var i,j;

      // need to sort out multiple (but not all) layers to clear.
      if(typeof(params.layer) === 'undefined') {
         layerToClear = "all";
      } else {
         layerToClear = params.layer;
      }

      for(i=0; i<numLayers; i++) {
         layer = layerNames[i];
	 if(layerToClear === 'all' || layer === layerToClear) {
	    childrenToRemove = [];
	    tileFrameContainer = tileFrameContainers[layer];
	    if(typeof(tileFrameContainer) === 'undefined') {
	       continue;
	    } else {
	       tileFrame = tileFrameContainer.firstChild;
	       // uncomment the line below to see what tiles are in this tileFrame
	       //util.printNodes(tileFrame, 1, "   ", skip);
	       children = tileFrame.childNodes;
	       if(typeof(children) !== 'undefined') {
		  for (var ch in children) {
		     if(typeof(children[ch]) !== 'undefined') {
			if(children[ch].className === tileClass) {
			   childrenToRemove[childrenToRemove.length] = children[ch];
			}
			if(children[ch].className === 'tilenum') {
			   childrenToRemove[childrenToRemove.length] = children[ch];
			}
		     }
		  }
		  if(childrenToRemove.length > 0) {
		     var len = childrenToRemove.length;
		     for(j=0; j<len; j++) {
			tileFrame.removeChild(childrenToRemove[j]);
		     }
		  }
	       }
	    }
	    //util.printNodes(tileFrame, 1, "   ", skip);
	 }
      } // for

   }; // clearTiles

   //---------------------------------------------------------
   /**
   * Remove the drawing canvas
   * (it will be put back after the image tiles)
   */
   var popDrawingCanvas = function() {

      //console.log("view.popDrawingCanvas");

      var canvasClass = "drawing";
      var childToRemove = undefined;
      var tileFrameContainer;
      var tileFrame;
      
      var layer = getCurrentLayer();
      //console.log("view.popDrawingCanvas layer %s",layer);

      tileFrameContainer = tileFrameContainers[layer];
      if(typeof(tileFrameContainer) === 'undefined') {
	 return false;
      }
      tileFrame = tileFrameContainer.firstChild;
      // uncomment the line below to see what tiles are in this tileFrame
      //util.printNodes(tileFrame, 1, "   ", skip);
      children = tileFrame.childNodes;
      if(typeof(children) !== 'undefined') {
	 for (var ch in children) {
	    if(typeof(children[ch]) !== 'undefined') {
	       if(children[ch].className === canvasClass) {
		  childToRemove = children[ch];
	       }
	    }
	 }
	 if(childToRemove) {
	    tileFrame.removeChild(childToRemove);
	 }
      }
      return childToRemove;
   };

   //---------------------------------------------------------
   var refreshImage = function() {

     var clearParams;
      //..........................
      if(model.isWlzData()) {
	clearParams = {scale: false, distance: true, rotation: true};
	clearTiles(clearParams);
	fullImage = model.getFullImgDims();
	handleImageSizeChange('refreshImage wlzData');
      } else {
	clearParams = {scale: false, distance: true, rotation: false};
	clearTiles(clearParams);
	fullImage = model.getFullImgDims();
	handleImageSizeChange('refreshImage');
      }

      //..........................
      resetViewChanges();
      viewChanges.locator = true;
      notify("refreshImage");
      //..........................
      setTimeout("emouseatlas.emap.tiledImageView.requestImages('refreshImage')", 10);
   };


   // only does this once slider has stopped
   // or click off slider knob
   // or click on arrow
   //---------------------------------------------------------
   var updateWlzRotation = function(from) {
      //console.log("updateWlzRotation from %s",from);
      fullImage = model.getFullImgDims();
      handleImageSizeChange('updateWlzRotation');
       /* !!!!! at the moment, due to the compliexity/deficiency of MVC model
	  or a bug in the code, one user action may cause the same
	  image to be loaded 1+ times by calling 
	  handleScaleChange, updateDst, and updateWlzRotation.
	  Due to time pressure, it is difficult to guarantee not
	  to call these functions unnecessary. Thus the following code
	  is used to stop some unnecessay image-loading
       */
      var clearParams = {scale: false, distance: false, rotation: true};
      if (initialised && model.isWlzData()) {
	var same = isSameImagePosition();
	if (!same) {
	  clearTiles(clearParams);
	  setTimeout("emouseatlas.emap.tiledImageView.requestImages('updateWlzRotation')", 10);
	  setImagePosition();
	}
      } else {
	clearTiles(clearParams);
	setTimeout("emouseatlas.emap.tiledImageView.requestImages('updateWlzRotation')", 10);
      }
      setTileFramePosition("updateWlzRotation");

      // this is needed to make sure drawing canvas is re-sized
      setViewportSize("updateWlzRotation");
   };

   // only does this once slider has stopped
   // or click off slider knob
   // or click on arrow
   //---------------------------------------------------------
   var updateDst = function() {

      fullImage = model.getFullImgDims();
      handleImageSizeChange('updateDst');
       /* !!!!! at the moment, due to the compliexity/deficiency of MVC model
	  or a bug in the code, one user action may cause the same
	  image to be loaded 1+ times by calling 
	  handleScaleChange, updateDst, and updateWlzRotation.
	  Due to time pressure, it is difficult to guarantee not
	  to call these functions unnecessary. Thus the following code
	  is used to stop some unnecessay image-loading
       */
      var clearParams = {scale: false, distance: true, rotation: false};
      if (initialised && model.isWlzData()) {
	var same = isSameImagePosition();
	if (!same) {
          //console.log("view.updateDst");
	  clearTiles(clearParams);
	  setTimeout("emouseatlas.emap.tiledImageView.requestImages('updateDst')", 10);
	  setImagePosition();
	}
      } else {
	clearTiles(clearParams);
	setTimeout("emouseatlas.emap.tiledImageView.requestImages('updateDst')", 10);
      }

      setTileFramePosition("updateDst");
   };

   //---------------------------------------------------------
   var updateWlzLocator = function() {
      //console.log("view.updateWlzLocator");
      resetViewChanges();
      viewChanges.locator = true;
      notify("updateWlzLocator");
   };

   //---------------------------------------------------------
   /**
   * Gets the initial images for the view.
   *
   * @author Ruven Pillay, Tom Perry
   */
   var requestImages = function(caller) {

     //console.log("enter requestImages, caller %s", caller);

     var isWlz = model.isWlzData();
     var _deb = _debug;

     //_debug = true;

     if (isWlz) {
       /* !!!!! at the moment, the initialization cycle calls
	  handleScaleChange, updateDst, updateWlzRotation.
	  All of them will load the image when the image is only needed 
	  to be loaded once.  initialised in introduced to
	  improve performance by loading image only once
       */
       
       if (caller === 'updateWlzRotation' &&
	   initialised === false) {
	 initialised = true;
	 // setting initial status
	 model.setSectionCallback();
       }
       
       if (initialised === false)
	 return false;
     }

     //console.log("enter view.requestImages called by %s",caller);
      //console.log("sampleRate %d, image %s",resolutionData.sampleRate,resolutionData.imageName);

      model.updateBusyIndicator({isBusy:true, message:"loading tiled image", x:20, y:600});


      var maxiipres = isWlz ? undefined : model.getMaxIIPResolution();
      var tileSize = model.getTileSize();
      var vpleft = 0;

      if(_debug) {
	 console.log("image.width  %f, image.height %f",image.width, image.height);
	 console.log("viewport.width  %f, viewport.height %f",viewport.width, viewport.height);
      }

      if (image.width > viewport.width) {
	 vpleft = getViewportLeftEdge();
      }
      var vptop = 0;
      if (image.height > viewport.height) {
	 vptop = getViewportTopEdge();
      }

      if(_debug) {
	 if(!isWlz) {
	    console.log("maxiipres ",maxiipres);
	 }
	 console.log("tileSize ",tileSize);
	 console.log("vpleft ",vpleft);
	 console.log("vptop ",vptop);
      }
      oldDst = model.getDistance().cur;

      if (!(scale.cur >= scale.min && scale.cur <= scale.max)) {
	 alert("Error: cannot request image with scale "+scale.cur+"\n" +"Minimum scale: "+scale.min+", Maximum scale: "+scale.max);
	 return;
      }

      // Loads tiles around the border
      var hiddenBorder = 1;

      if(!isWlz) {
         resolution = Math.round(maxiipres + Math.log(scale.cur) / Math.log(2));
	 if(_debug) {
	    console.log("resolution ",resolution);
	 }
      }

      startx = Math.floor(vpleft / tileSize.width) - hiddenBorder ;
      starty = Math.floor(vptop / tileSize.height) - hiddenBorder ;
      endx = Math.floor((vpleft + viewable.width) / tileSize.width) + hiddenBorder ;
      endy = Math.floor((vptop + viewable.height) / tileSize.height) + hiddenBorder ;

      if(_debug) {
	 console.log("vpleft ",vpleft);
	 console.log("startx ",startx);
	 console.log("endx ",endx);
	 console.log("---------------------------------------------");
      }

      /*
         If the floating point calculation of xtiles or ytiles is just more than an integer, then taking the Math.ceil gives the wrong value.
      */
      //var tol = 0.997;
      //var tol = 0.996; // plate_39b at 1:2 magnification breaks
      var tol = 0.997;
      var xtilesFP;
      var xtilesCeil;
      var xtilesDiff;
      var ytilesFP;
      var ytilesCeil;
      var ytilesDiff;

      // ideally we should get W & H from the image at each resolution (it is an integer).
      // currently it is calculated from the full size image (generally not an integer result).

      if(_debug) {
	 console.log("tol %f",tol);
      }

      xtilesFP = image.width / tileSize.width;
      xtiles = Math.ceil(xtilesFP);
      //xtilesCeil = Math.ceil(xtilesFP);
      //xtilesDiff = xtilesCeil - xtilesFP;

      ytilesFP = image.height / tileSize.height;
      ytiles = Math.ceil(ytilesFP);
      //ytilesCeil = Math.ceil(ytilesFP);
      //ytilesDiff = ytilesCeil - ytilesFP;

      if(_debug) {
	 console.log("-------");
	 console.log("xtilesFP %f ",xtilesFP);
	 console.log("xtilesCeil %f ",xtilesCeil);
	 console.log("xtilesDiff %f ",xtilesDiff);
	 console.log("...........");
	 console.log("ytilesFP %f ",ytilesFP);
	 console.log("ytilesCeil %f ",ytilesCeil);
	 console.log("ytilesDiff %f ",ytilesDiff);
	 console.log("-------");
      }

      /*
      if(xtilesDiff > tol) {
         console.log("adjusting xtiles, tol %f, diff %f",tol,xtilesDiff);
         //xtiles = xtilesCeil - 1;
         xtiles = xtilesCeil;
      } else {
         xtiles = xtilesCeil;
      }
      if(ytilesDiff > tol) {
         console.log("adjusting ytiles, tol %f, diff %f",tol,ytilesDiff);
         //ytiles = ytilesCeil - 1;
         ytiles = ytilesCeil;
      } else {
         ytiles = ytilesCeil;
      }
      */

      if(_debug) {
	 console.log("xtiles ",xtiles);
	 console.log("ytiles ",ytiles);
	 console.log("---------------------------------------------");
      }

      // Create our image tile mosaic
      getTiles(startx,endx,starty,endy);

      // Get image maps for overlays
      //if ($chk(hasOverlays)) overlay.requestMaps();
      
      model.updateBusyIndicator({isBusy:false});

      if(_debug) {
         console.log("exit requestImages, caller %s\n", caller);
      }

     _debug = _deb;


   }; // requestImages

   //---------------------------------------------------------
   var getScale = function () {
      return scale;
   };

   //---------------------------------------------------------
   var setScale = function (val) {

      var deb = _debug;
      //_debug = true;

      if(_debug) console.log("enter view.setScale %d",val);

      scale.old = scale.cur;

      if (val < scale.iipmin) {
	 val = scale.iipmin;
      } else if (val > scale.max) {
	 val = scale.max;
      }
      // Round to a power of 2
      var val2 = Math.pow(2,Math.round(Math.log(val) / Math.log(2)));
      //console.log("view.setScale val2 %d",val);
      if (val2 === scale.cur) {
         if(_debug) console.log("view.setScale no change");
	 return false;
      }
      scale.cur = val2;
      //console.log("view.setScale scale.cur %d",scale.cur);
      handleScaleChange("setScale");

      if(_debug) console.log("exit view.setScale %d",val);
      _debug = deb;
   };

   //---------------------------------------------------------
   var getImgFit = function () {
      return {xfits:xfits, yfits:yfits};
   };

   //---------------------------------------------------------
   var getViewableDims = function () {
      //console.log("ViewableDims ",viewable);
      return viewable;
   };

   //---------------------------------------------------------
   var getViewportDims = function () {
      //console.log("ViewportDims ",viewport);
      return viewport;
   };

   //---------------------------------------------------------
   var getFocalPoint = function () {
      return focalPoint;
   };

   //---------------------------------------------------------
   var setFocalPoint = function (vals,from) {
      //console.log("%s setFocalPoint vals.x %d, vals.y %d",from,vals.x,vals.y);
      focalPoint.x = vals.x;
      focalPoint.y = vals.y;
      getDraggedTiles();
      setTileFramePosition("setFocalPoint");
      resetViewChanges();
      if(from !== "locator") {
         viewChanges.focalPoint = true;
         notify("setFocalPoint ");
      } else {
         viewChanges.locatorMoved = true;
         notify("setFocalPoint ");
      }
   };

   //---------------------------------------------------------
   var register = function (observer, from) {
      //console.log("view.register from %s",from);
      registry.push(observer);
   };

   //---------------------------------------------------------
   var getName = function () {
      //console.log(observer);
      return 'tiledImageView';
   };

   //---------------------------------------------------------
   // Opacity must be between 0 and 1.0 with 1.0 being 'solid'.
   var setOpacity = function(params) {

      //console.log("setOpacity params ",params);

      var val = params.value;
      var fromSlider = params.fromSlider;

      //console.log("view.setOpacity val ",val);

      // limit the range to sensible values
      val = (val < 0.0) ? 0.0 : val;
      val = (val > 1.0) ? 1.0 : val;

      //layerOpacity[currentLayer].opacity = val;
      setTileFrameOpacity(val);

      if(fromSlider) {
         viewChanges.opacity = true;
         notify("setOpacity");
      }
   };

   //---------------------------------------------------------
   // Colour values are obtained from colourTool
   var colourChange = function(from) {

      var lmnt;
      var col;

      col = getRGBA();
      //console.log("colourChange from %s ",from, col);

      // this changes the colour of the patch in the tree
      if(elementIdToColour) {
         //console.log ("colourChange: to lmnt %s",elementIdToColour);
         lmnt = $(elementIdToColour);
	 lmnt.setStyles({
	    background: 'rgba(' + col.red + ', ' + col.green + ', ' + col.blue + ', ' + col.alpha + ')'
	 });
	 model.updateTreeNodeColour(elementIdToColour, col);
      }

   };

   //---------------------------------------------------------
   // Specify which element is to use colourTool
   var setElementToColour = function(id) {

      var patch;
      var bgc;
      var rgba;
      var arr = [];
      var opacity;
      var RGBA = {};

      //console.log("setElementToColour: %s",id);

      elementIdToColour = id;

      patch = $(id);
      if(patch) {
         //console.log("view.setElementToColour: ",patch.getStyle('background-color'));
         //console.log("view.setElementToColour: ",patch.getStyle('opacity'));
         bgc = patch.getStyle('background-color');
         //console.log("view.setElementToColour: bgc",bgc);
         opacity = patch.getStyle('opacity');
         //console.log("view.setElementToColour: opacity",opacity);

	 if(bgc.indexOf("rgba") === 0) {
	    //console.log("rgba version");
	    //console.log("type of bgc = ",typeof(bgc));
	    rgba = bgc.slice(5,-2);
	    rgba = rgba.replace(/\s+/g, ''); // get rid of white space in the string
	    arr = rgba.split(",");
	    //console.log("sliced bgc = ",rgba);
	    //console.log("arr = ",arr);

	    RGBA = {r:arr[0], g:arr[1], b:arr[2], a:arr[3]};
	 } else if(bgc.indexOf("#") === 0) {
	    //console.log("hex version");
	    RGBA = emouseatlas.emap.utilities.hexToRGB(bgc);
	    RGBA.a = opacity;
	 } else {
	    //console.log("unknown version");
	 }
         //console.log("view.setElementToColour: RGBA",RGBA);
      }

      if(colourChooser) {
	 colourChooser.showColChooser(true);
	 colourChooser.setRGBA(RGBA);
      }

      if(emouseatlas.emap.colourTool) {
	 emouseatlas.emap.colourTool.showColourTool(true);
	 emouseatlas.emap.colourTool.setRGBA(RGBA);
      }

   };

   //---------------------------------------------------------
   // Get which element is to use colourTool
   var getElementToColour = function() {

      //console.log("getElementToColour: %s", elementIdToColour);
      return elementIdToColour;
   };

   //---------------------------------------------------------
   var getRGBA = function() {

      var rgba = undefined;

      if(colourChooser) {
         rgba = colourChooser.getRGBA();
      }
      if(emouseatlas.emap.colourTool) {
         rgba = emouseatlas.emap.colourTool.getRGBA();
      }
      //console.log("getColour: ",rgba);
      return rgba;
   };

   //---------------------------------------------------------
   var getOpacity = function(layer) {

      //console.log("view: getOpacity for layer %s",layer);
      //console.log("layerOpacity ",layerOpacity);

      var opac = undefined;
      if(typeof(layerOpacity[layer]) === 'undefined') {
         opac = 1.0;
      } else {
	 opac = layerOpacity[layer].opacity;
      }
      //console.log("getOpacity: %d",opac);

      return parseFloat(opac);
   };

   //---------------------------------------------------------
   var setFilter = function(params, from) {

      var type;
      var val;
      var fromSlider;

      //console.log("setFilter from %s",from);
      //console.log(params);
      type = params.type;
      val = parseInt(params.value, 10);
      fromSlider = params.fromSlider;

      // limit the range to sensible values
      val = (val < 0) ? 0 : val;
      val = (val > 255) ? 255 : val;

      if(type === 'red') {
         layerFilter[currentLayer].filter.red = val;
      }
      if(type === 'green') {
         layerFilter[currentLayer].filter.green = val;
      }
      if(type === 'blue') {
         layerFilter[currentLayer].filter.blue = val;
      }

      setTimeout("emouseatlas.emap.tiledImageView.requestImages('setFilter')", 10);

      if(fromSlider) {
	 //console.log("filter slider changed to ",val);
         viewChanges.filter = true;
         notify("setFilter");
      }
   };

   //---------------------------------------------------------
   var getFilter = function(layer) {
      //console.log("getFilter ",layer);
      if(typeof(layerFilter[layer]) === 'undefined') {
         return {red:255, green:255, blue:255};
      } else {
         //console.log("getFilter ",layerFilter);
	 return layerFilter[layer].filter;
      }
   };

   //---------------------------------------------------------
   var getPossibleFixedPoint = function() {
      return possibleFixedPoint;
   };

   //---------------------------------------------------------
   var setPossibleFixedPoint = function(vals) {
      possibleFixedPoint = {x:vals.x, y:vals.y, z:vals.z};
   };

   //---------------------------------------------------------
   var getMeasurementOrigin = function() {
      return measurementOrigin;
   };

   //---------------------------------------------------------
   var getMeasurementTarget = function() {
      return measurementTarget;
   };

   //---------------------------------------------------------
   var getMeasurementPoint = function() {
      return measurementPoint;
   };

   //---------------------------------------------------------
   var stopMeasuring = function() {
      measuring = false;
      return false;
   };

   //---------------------------------------------------------
   var getHRSectionPoint = function() {
      return HRSectionPoint;
   };

   //---------------------------------------------------------
   // true if mouse is down over image
   var isMouseDownInImage = function() {
      return mouseDownInImage;
   };

   //---------------------------------------------------------
   // returns the position relative to the document (not necessarily the viewer container).
   var getMouseClickPosition = function() {
      return {x:docX, y:docY};
   };

   //---------------------------------------------------------
   // returns the position relative to the document (not necessarily the viewer container).
   var getInitialMousePoint = function() {
      return initialMousePoint;
   };

   //---------------------------------------------------------
   // returns the position in terms of the image.
   var getDrawPoint = function() {
      return drawPoint;
   };

   //---------------------------------------------------------
   // returns the position in terms of the image.
   var getDrawOrigin = function() {
      return drawOrigin;
   };

   //---------------------------------------------------------
   // returns the position in terms of the image.
   var getDebugPoint = function() {
      return debugPoint;
   };

   //---------------------------------------------------------
   // returns the position in terms of the image.
   var getPointClickPoint = function() {
      return pointClickPoint;
   };

   //---------------------------------------------------------
   // returns the position in terms of the image.
   var getInitialPointClickPoint = function() {
      return initialPointClickPoint;
   };

   //---------------------------------------------------------
   // returns the object that was subject to mouseDown in image
   var getMouseDownTarget = function() {
      return mouseDownTarget;
   };

   //---------------------------------------------------------
   // returns the index array of (anatomy) items at clicked point
   var getCompObjIndxArr = function() {
      return compObjIndxArr;
   };

   //---------------------------------------------------------
   var setLayerVisibility = function (data) {

      if(typeof(layerVisibility[data.layer]) === 'undefined') {
	 layerVisibility[data.layer] = {name:data.layer, visible:data.value};
      } else {
	 layerVisibility[data.layer].visible = data.value;
      }

   };

   //---------------------------------------------------------
   var getLayerVisibility = function () {

      return layerVisibility;
   };

   //---------------------------------------------------------
   var setLayerRenderMode = function (data) {

      var layer;
      var clearParams = {scale: false, distance: false, rotation: false};

      //console.log("setLayerRenderMode with ",data);

      // make sure it is a valid render mode
      if(data.mode != 'sect' && data.mode != 'prjn' && data.mode != 'prjd' && data.mode != 'prjv') {
         //console.log("setLayerRenderMode unkown mode %s",data.mode);
         return false;
      }

      layer = data.layer;
      if(typeof(layerRenderMode[layer]) === 'undefined') {
	 layerRenderMode[layer] = {layer:layer, mode:data.mode};
      } else {
	 layerRenderMode[layer].mode = data.mode;
      }

      clearTiles(clearParams);
      setTimeout("emouseatlas.emap.tiledImageView.requestImages('setLayerRenderMode')", 10);

   };

   //---------------------------------------------------------
   var getLayerRenderMode = function (layer) {
      return layerRenderMode[layer];
   };

   //---------------------------------------------------------
   var setCurrentLayer = function (layer) {
      //console.log("view.setCurrentLayer");
      currentLayer = layer;
      //setResolutionData('setCurrentLayer');
      //setLocatorData('setCurrentLayer');
      viewChanges.layer = true;
      notify("setCurrentLayer");
   };

   //---------------------------------------------------------
   var getCurrentLayer = function () {
      return currentLayer;
   };

   //---------------------------------------------------------
   var showLayerProperties = function (layer) {
      viewChanges.showProperties = true;
      notify("showLayerProperties");
   };

   //---------------------------------------------------------
   var showFixedPointTool = function (layer) {
      setMode(modes.fixedPoint.name);
   };

   //---------------------------------------------------------
   var getSelections = function () {
      return treeSelections;
   };

   //---------------------------------------------------------
   var getAllSelections = function (layer) {

      var indexData = model.getIndexData(layer);

      if(typeof(indexData) === 'undefined') {
	 return "";
      }
      var len = indexData.length;
      var data;
      var i;
      var ret = "";

      for (var domainId in indexData) {
	 if (indexData.hasOwnProperty(domainId)) {
	    data = indexData[domainId];
	    ret = ret + "&sel=" + domainId + "," + data.colour[0] + "," + data.colour[1] + "," + data.colour[2] + "," + data.colour[3];
	 }
      }

      return ret;
   };

   //---------------------------------------------------------
   var setSelections = function (vals, from) {

      var clearParams;
      var wlist;

      //console.log("view.setSelections from %s, mode %s ",from,mode.name,vals);

      treeSelections = vals;
      clearParams = {scale: false, distance: false, rotation: false, layer: layerNames[numLayers - 1]};
      clearTiles(clearParams);
      setTimeout("emouseatlas.emap.tiledImageView.requestImages('setSelections')", 10);
      //console.log("**** %s ****",mode.name);
      if(mode.name === "query") {
         viewChanges.dblClick = false; // this is required to stop endless loop
         viewChanges.selections = true;
         notify("setSelections");
      }

      //emouseatlas.emap.treeTool.getDomainColour(8);

      wlist = get3dWindowList();
      if(wlist.length > 0) {
         update3d();
      }
   };

   //---------------------------------------------------------
   var okToProceed3d = function () {

      var wlist;

      wlist = get3dWindowList();
      if(wlist.length > 0) {
         //okToProceedUpdate3d();
         update3d();
      } else {
         //okToProceedNew3d();
         doNew3d();
      }
   };

   //---------------------------------------------------------
   var new3d = function () {

      var wind;

      // Modernizr test string must be all lower case, ie not localStorage
      if (Modernizr.localstorage) {
         if(!localStorage[SHOW_3D_ANATOMY_WARNING_DIALOG]) {
            localStorage[SHOW_3D_ANATOMY_WARNING_DIALOG] = "NO"; // it doesn't matter what the value is as long as it exists.
            viewChanges.threeDAnatomyWarningDialog = true;
            notify("new3d");
	 } else {
	    // if localStorage[SHOW_3D_ANATOMY_WARNING_DIALOG] exists, we must have show the warning previously.
	    if(open3dWindows.length === 0) {
	       doNew3d();
	    } else {
	       update3d();
	    }
	 }
      } else {
         // not sure what to do here
      }

   };

   //---------------------------------------------------------
   //var okToProceedNew3d = function () {
   var doNew3d = function () {

      var vals;
      var wind;
      var url;
      var urlParams;
      var winParams;
      var name;
      var web;
      var meta;
      var width;
      var height;
      var topp;
      var left;

      vals = getSelections();
      name = getNext3dWindowName();
      web = model.getWebServer();
      meta = model.getMetadataRoot();

      url = web + "/eAtlasViewer_ema/html/threeD.php";

      urlParams = getUrlParams(vals);
      url = url + urlParams;
      //console.log("doNew3d url ",url);

      winParams = getWinParams();
      //console.log("winParams ",winParams);
      width = winParams.width;
      height = winParams.height;
      topp = winParams.topp;
      left = winParams.left;

      wind = window.open(
         url,
	 name,
	 "outerWidth="+width+",outerHeight="+height+",top="+topp+",left="+left+",scrollbars=no,toolbar=no,menubar=no"
      );
      emouseatlas.emap.utilities.addEvent(wind, 'beforeunload', threeDUnloading, false);
      register3dWindow(wind);

   };

   //---------------------------------------------------------
   var new3dCallback = function (loaded) {

      threeDLoaded = loaded;
      //console.log("new3dCallback threeDLoaded %s",threeDLoaded);

   };

   //---------------------------------------------------------
   var threeDUnloading = function () {

      var wind;

      wind = open3dWindows[open3dWindows.length -1];
      if(wind.emouseatlas.emap.threeDAnatomy) {
         //console.log("threeDUnloading");
	 wind.emouseatlas.emap.threeDAnatomy.closeMARenderer();
      }

      // now remove it from the list (at the moment we only allow one 3d window)
      unregister3dWindow(wind);
   };

   //---------------------------------------------------------
   var update3d = function () {

      var vals;
      var wlist;
      var wind;
      var url;
      var urlParams;
      var name;
      var web;
      var meta;
      var pars;

      vals = getSelections();

      urlParams = getUrlParams(vals);
      //console.log("update3d urlParams ",urlParams);

      wlist = get3dWindowList();
      if(wlist === null || wlist === undefined || wlist.length === 0) {
	 return false;
      }

      // there should only be one open 3d window
      wind = wlist[wlist.length -1];

      wind.emouseatlas.emap.threeDAnatomy.updateComponents(urlParams);

   };

   //---------------------------------------------------------
   // until the interface supports setting the max number,
   // just reset it to the original value.
   //---------------------------------------------------------
   var setMax3dToShow = function (max) {

      max3dToShow = (max === undefined) ? max : origMax3dToShow;;
      //console.log("setMax3dToShow ",max3dToShow);

   };

   //---------------------------------------------------------
   var getMax3dToShow = function () {

      return max3dToShow;

   };

   //---------------------------------------------------------
   var getOrigMax3dToShow = function () {

      return origMax3dToShow;

   };

   //---------------------------------------------------------
   //  if we use domain id to access anatomy info from database
   //---------------------------------------------------------
   var getUrlParams = function (vals) {

      var urlParams;
      var valArr;
      var type;
      var domainId;
      var entry;
      var entryArr;
      var len;
      var i;

      urlParams = "?comps=";

      valArr = vals.split(/&sel=/);
      //console.log("getUrlParams vals %s, valArr ",vals,valArr);
      valArr.splice(0,1); // we don't want the empty string which is the first array element.

      len = valArr.length;
      for(i=0; i<len; i++) {
         entry = valArr[i];
	 entryArr = entry.split(",");
	 domainId = entryArr[0];
	 urlParams += domainId;
	 if(i < len-1) {
	    urlParams += ",";
	 }

      }

      //console.log("getUrlParams: vals ",vals);
      //console.log("getUrlParams: urlParams ",urlParams);
      return urlParams;

   };

   //---------------------------------------------------------
   //  if we use EMAPA id to access anatomy info from database
   //---------------------------------------------------------
   /*
   var getUrlParams = function (vals) {

      var urlParams;
      var valArr;
      var type;
      var domainId;
      var info;
      var fbId;
      var emapa;
      var indx;
      var id;
      var entry;
      var entryArr;
      var len;
      var len2;
      var i,j;

      urlParams = "?comps=";

      valArr = vals.split(/&sel=/);
      //console.log("getUrlParams vals %s, valArr ",vals,valArr);
      valArr.splice(0,1); // we don't want the empty string which is the first array element.

      len = valArr.length;
      for(i=0; i<len; i++) {
         entry = valArr[i];
	 entryArr = entry.split(",");
	 domainId = entryArr[0];
	 info = getInfoFromTreeData(domainId);
	 fbId = info.fbId;
	 if(fbId.length > 1) {
	    emapa = fbId[1];
	 } else {
	    continue;
	 }

	 indx = emapa.indexOf(":");
         id = emapa.substr(indx + 1*1);
	 urlParams += id;
	 if(i < len-1) {
	    urlParams += ",";
	 }

      }

      console.log("getUrlParams: vals ",vals);
      console.log("getUrlParams: urlParams ",urlParams);
      return urlParams;

   };
   */

   //---------------------------------------------------------
   //  we want to open the new window to the right of this one
   //  if possible
   //---------------------------------------------------------
   var getWinParams = function () {

      var winParams;
      var thisL;
      var thisR;
      var thisT;
      var height;
      var availW;
      var possW;
      var width;
      var minWidth;

      minWidth = 400;

      thisT = window.screenY;
      thisL = window.screenX;

      height = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight || document.body.clientHeight;
      width = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth || document.body.clientWidth;

      thisR = thisL + width;

      availW = screen.availWidth;
      possW = (availW - thisR - 20);

      width = possW < minWidth ? minWidth : possW;

      // window.fullScreen is not well supported and seems to return false even when window is full screen!
      // so we will just detect when there is not much room around the browser.
      if(possW < width) {
         //console.log("fullish screen");
         left = availW - (minWidth + 5);
         width = minWidth;
      }

      winParams = {
         left:thisR + 5,
         topp:thisT,
         height:height,
	 width:width
      }

      return winParams;

   };

   //---------------------------------------------------------------
   var getInfoFromTreeData = function (key) {

      var layer;
      var treeData;
      var resultNode;
      var name;
      var fbId;
      var data;

      layer = emouseatlas.emap.tiledImageView.getCurrentLayer();
      treeData = emouseatlas.emap.tiledImageModel.getTreeData(layer);

      resultNode = emouseatlas.emap.utilities.iterativeDeepeningDepthFirstSearch(treeData[0], key);
      //console.log("resultNode ",resultNode);

      if(resultNode === undefined) {
	    alert("Sorry, I couldn't find data for domain ",key);
         return undefined;
      } else {
         name = resultNode.property.name;
         fbId = resultNode.property.fbId;
         //console.log("name ",name);
         //console.log("fbId ",fbId);
         data = {name: name, fbId: fbId}
      }
      return data;
   };

   //---------------------------------------------------------
   var register3dWindow = function (wind) {
      //console.log(wind);
      open3dWindows[open3dWindows.length] = wind;
   };

   //---------------------------------------------------------
   // hopefully, this will be called when the window is closed
   //---------------------------------------------------------
   var unregister3dWindow = function (wind) {

      var len;
      var i;

      len = open3dWindows.length;
      for(i=0; i<len; i++) {
         entry = open3dWindows[i];
	 if(entry == wind) {
            open3dWindows.splice(i, 1);
	    break;
	 }
      }
   };

   //---------------------------------------------------------
   var get3dWindowList = function () {
      return open3dWindows;
   };

   //---------------------------------------------------------
   var getIndexArray = function () {
      return indexArray;
   };

   //---------------------------------------------------------
   var getViewerContainerPos = function () {
      var ret = emouseatlas.emap.utilities.findPos(targetContainer);
      //console.log("getViewerContainerPos ",ret);
      return ret;
   };

   //---------------------------------------------------------
   var getToolContainerPos = function () {
      var div = document.getElementById("toolContainerDiv");
      var ret = emouseatlas.emap.utilities.findPos(div);
      return ret;
   };

   //---------------------------------------------------------
   var maximiseImage = function () {

      imageIsMaximised = !imageIsMaximised;

      var targetId = model.getViewerTargetId();
      var div = document.getElementById(targetId);
      var infoIcon = document.getElementById("infoIconContainer");
      var helpIcon = document.getElementById("helpIconContainer");

      div.className = '';
      if(imageIsMaximised) {
         div.className = 'maximised';
	 if(infoIcon) {
	    infoIcon.style.visibility = "hidden";
	 }
	 if(helpIcon) {
	    helpIcon.style.visibility = "hidden";
	 }
      } else {
         if(typeof(tools.tree) !== 'undefined') {
            div.className = 'tree';
	 }
         if(mode.name === 'pointClick') {
            div.className = 'pointClick';
         }
	 if(infoIcon) {
	    infoIcon.style.visibility = "visible";
	 }
	 if(helpIcon) {
	    helpIcon.style.visibility = "visible";
	 }
      }

      viewChanges.maximise = true;
      //notify("maximiseImage");

      setViewportSize("maximiseImage");

      return false;
   };

   //---------------------------------------------------------
   var showTileBorders = function () {
      tileHasBorder = !tileHasBorder;
      var clearParams = {scale: false, distance: false, rotation: false};
      clearTiles(clearParams);
      setTimeout("emouseatlas.emap.tiledImageView.requestImages('showTileBorders')", 10);

   };

   //---------------------------------------------------------
   var showQueryDialogue = function (num) {
      queryType = (num !== undefined) ? num : 0;
   };

   //---------------------------------------------------------
   var setDebugMode = function () {
      setModeNum(6);
   };

   //---------------------------------------------------------
   var showDebugWindow = function () {
      debugWindow = !debugWindow;
      viewChanges.debugWindow = true;
      notify("showDebugWindow");
   };

   //---------------------------------------------------------
   var getDebugWindow = function () {
      return debugWindow;
   };

   //---------------------------------------------------------
   var cancelContextMenu = function () {
      // no op
   };

   //---------------------------------------------------------
   var enableDebugDiv = function () {

      var div = document.getElementById("debugDiv");

      console.log("enableDebugDiv div ",div);

      if(div == undefined) {
         return false;
      }

      showTileBorders();
      allowViewerInfo = !allowViewerInfo;

   };

   //---------------------------------------------------------
   var setToolboxVisibility = function () {

      var toolbox = document.getElementById("toolContainerDiv");
      var treeContainer = document.getElementById("treetool-container");
      var logoContainer = document.getElementById("logoContainer");
      var hintContainer = document.getElementById("contextMenuHintDiv");
      var helpIconContainer = document.getElementById("helpIconContainer");
      var project;
      var klass;

      project = model.getProject();
      //console.log("setToolboxVisibility project %s", project);

      if(toolbox) {
	 if(toolbox.style.visibility.toLowerCase() === "visible") {
	    toolbox.style.visibility = "hidden";
	    hintContainer.style.visibility = "visible";
	    toolsVisible = true; // so we know to hide them
	    /*
	    if(logoContainer) {
	       logoContainer.className = "";
	       if(project) {
	          if(project === "eHistology") {
	             logoContainer.className = "pointClick";
		  }
	       }
	    }
	    */
	    if(helpIconContainer) {
	       helpIconContainer.className = "helpIconContainer";
	    }
	 } else {
	    toolbox.style.visibility = "visible";
	    toolsVisible = false; // so we know to show them
	    hintContainer.style.visibility = "hidden";
	    /*
	    if(logoContainer) {
	       logoContainer.className = "noToolBox";
	    }
	    */
	    if(helpIconContainer) {
	       helpIconContainer.className = "noToolBox";
	    }
	 }
      }

      if(treeContainer) {
	 if(treeContainer.style.visibility.toLowerCase() === "visible") {
	    treeContainer.style.visibility = "hidden";
	 } else {
	    treeContainer.style.visibility = "visible";
	 }
      }

      viewChanges.toolbox = true;
      notify("toolbox");
      return false;
   };

   //---------------------------------------------------------
   var goToDownloadPage = function(url) {

      window.open(url, 'blank');

   };

   //---------------------------------------------------------
   var enableImgLabels = function () {

      imgLabels_enabled = !imgLabels_enabled;
      return false;
   };

   //---------------------------------------------------------
   var setTree = function (viz) {

      //console.log("setTree ",viz);
      var treeContainer = document.getElementById("treetool-container");

      if(treeContainer) {
	 if(treeContainer.style.visibility.toLowerCase() === "visible") {
	    treeContainer.style.visibility = "hidden";
	 } else {
	    treeContainer.style.visibility = "visible";
	 }
      }
      return false;
   };

   //---------------------------------------------------------
   var getTreeTool = function () {

      //console.log("getTreeTool ",viz);
      return emouseatlas.emap.treeTool;
   };

   //---------------------------------------------------------
   var toolboxVisible = function () {
      return toolsVisible;
   };

   //---------------------------------------------------------
   var showViewerHelp = function () {
      var closeDiv = document.getElementById("wlzIIPViewerIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerIFrameContainer");
      div.style.visibility = "visible";
      if(closeDiv) {
	 util.addEvent(closeDiv, 'click', hideViewerHelp, false);
      }
      viewChanges.showViewerHelp = true;
      notify("showViewerHelp");
   };
   
   //---------------------------------------------------------
   var hideViewerHelp = function () {
      var closeDiv = document.getElementById("wlzIIPViewerIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerIFrameContainer");
      div.style.visibility = "hidden";
      if(closeDiv) {
	 util.removeEvent(closeDiv, 'click', hideViewerHelp, false);
      }
      keepViewerHelpFrame = false;
      viewChanges.hideViewerHelp = true;
      notify("hideViewerHelp");
   };

   //---------------------------------------------------------------
   var show3dAnatomyHelpFrame = function () {

      var wlist;
      var wind;
      var closeDiv;
//      var div;
      var threeD_document;

      wlist = get3dWindowList();
      if(wlist === null || wlist === undefined || wlist.length === 0) {
         console.log("no open windows");
  	 return false;
      }

      // there should only be one open 3d window
      wind = wlist[wlist.length -1];
      threeD_document = wind.document;

      closeDiv = threeD_document.getElementById("threeDAnatomyHelpIFrameContainerCloseDiv");
      if(closeDiv) {
	 util.addEvent(closeDiv, 'click', hide3dAnatomyHelpFrame, false);
      }

//      div = threeD_document.getElementById("threeDAnatomyHelpIFrameContainer");
//      div.style.visibility = "visible";

      viewChanges.show3dAnatomyHelp = true;
      notify("show3dAnatomyHelp");

   };
   
   //---------------------------------------------------------
   var hide3dAnatomyHelpFrame = function () {

      var wlist;
      var wind;
      var closeDiv;
//      var div;
      var threeD_document;

      wlist = get3dWindowList();
      if(wlist === null || wlist === undefined || wlist.length === 0) {
         console.log("no open windows");
  	 return false;
      }

      // there should only be one open 3d window

      wind = wlist[wlist.length -1];
      threeD_document = wind.document;

      closeDiv = threeD_document.getElementById("threeDAnatomyHelpIFrameContainerCloseDiv");
      if(closeDiv) {
	 util.removeEvent(closeDiv, 'click', hide3dAnatomyHelpFrame, false);
      }

//      div = threeD_document.getElementById("threeDAnatomyHelpIFrameContainer");
//      div.style.visibility = "hidden";

      viewChanges.hide3dAnatomyHelp = true;
      notify("hide3dAnatomyHelp");

   };
   
   //---------------------------------------------------------
   var showX3domHelpFrame = function () {
      viewChanges.showX3domHelp = true;
      notify("showX3domHelp");
   };
   
   //---------------------------------------------------------
   var hideX3domHelpFrame = function () {
      viewChanges.hideX3domHelp = true;
      notify("hideX3domHelp");
   };
   
   //---------------------------------------------------------
   var showX3domUnsupportedFrame = function () {
      viewChanges.showX3domUnsupported = true;
      notify("showX3domUnsupported");
   };
   
   //---------------------------------------------------------
   var hideX3domUnsupportedFrame = function () {
      viewChanges.hideX3domUnsupported = true;
      notify("hideX3domUnsupported");
   };
   
   //---------------------------------------------------------
   var showViewerInfo = function () {
      var infoDetails = model.getInfoDetails();
      var closeDiv = document.getElementById("wlzIIPViewerInfoIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerInfoIFrameContainer");

      if(!infoDetails) {
         return false;
      }

      div.style.visibility = "visible";
      if(closeDiv) {
	 util.addEvent(closeDiv, 'click', hideViewerInfo, false);
      }

      if(infoDetails.jso) {
	 viewChanges.showViewerInfo = true;
	 notify("showViewerInfo");
      } else {
	 var iframe = document.getElementById("staticInfoIFrame");
	 iframe.style.visibility = "visible";
      }
   };
   
   //---------------------------------------------------------
   var hideViewerInfo = function () {
      var infoDetails = model.getInfoDetails();
      var closeDiv = document.getElementById("wlzIIPViewerInfoIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerInfoIFrameContainer");
      div.style.visibility = "hidden";
      if(closeDiv) {
	 util.removeEvent(closeDiv, 'click', hideViewerInfo, false);
      }
      keepViewerInfoFrame = false;
      if(infoDetails.jso) {
	 viewChanges.hideViewerInfo = true;
	 notify("hideViewerInfo");
      } else {
	 var iframe = document.getElementById("staticInfoIFrame");
	 iframe.style.visibility = "hidden";
      }
   };

   //---------------------------------------------------------------
   var showMarkerPopupIFrame = function () {
      var closeDiv = document.getElementById("markerPopupIFrameCloseDiv");
      var div = document.getElementById("markerPopupIFrameContainer");

      div.style.visibility = "visible";
      if(closeDiv) {
	 util.addEvent(closeDiv, 'click', hideMarkerPopupIFrame, false);
      }

      viewChanges.showMarkerPopup = true;
      notify("showMarkerPopupIFrame");

   };
   
   //---------------------------------------------------------
   var hideMarkerPopupIFrame = function () {
      var closeDiv = document.getElementById("markerPopupIFrameCloseDiv");
      var div = document.getElementById("markerPopupIFrameContainer");
      div.style.visibility = "hidden";
      if(closeDiv) {
	 util.removeEvent(closeDiv, 'click', hideMarkerPopupIFrame, false);
      }

      viewChanges.hideMarkerPopup = true;
      notify("hideMarkerPopupIFrame");

   };

   //--------------------------------------------------------------------------------------------
   // This is a context menu action.
   // Mode choices are radio buttons in the 'mode' group.
   //---------------------------------------------------------
   var setModeNum = function (num, type) {
      var newmode;
      modeSubType = (type !== undefined) ? type : 0;
      //console.log("setModeNum %d, %d",num,type);

      switch(num) {
         case 0:
	    newmode = 'move';
	    break;
         case 1:
	    newmode = 'measuring';
	    break;
         case 2:
	    newmode = 'HRSection';
	    break;
         case 3:
	    newmode = 'fixedPoint';
	    break;
         case 4:
	    newmode = 'pointClick';
	    break;
         case 5:
	    newmode = 'query';
	    break;
	 /*
         case 6:
	    newmode = 'debug';
	    break;
	    */
	 default:
	    newmode = 'move';
      }
      setMode(newmode);
   };
   //---------------------------------------------------------
   var setMode = function (newmode) {
      //console.log("setMode current mode %s, newmode %s",mode.name,newmode);
      var div;
      var targetId = model.getViewerTargetId();
      var tableDiv;
      var hasTree;

      if(document.getElementById(targetId)) {
         div = document.getElementById(targetId);
	 //console.log("setMode: div = %s.%s", div.id, div.className);
      }

      if(mode.name === newmode && !(mode.name === "query" && query.getQueryType() === "anatomy")) {
         return false;
      }

      mode = modes[newmode];
      if(mode.name === defaultModeName) {
         imageContextMenu.setRadioButton('mode', 0);
      }

      hasTree = model.hasTree();

      if(div) {
	 tableDiv = $('pointClickTableDiv');
         if(mode.name === 'pointClick') {
	    tableDiv.setStyle('visibility', 'visible');
            div.className = 'pointClick';
         } else {
            div.className = (hasTree) ? "tree" : "";
	    if(tableDiv) {
	       tableDiv.setStyle('visibility', 'hidden');
	    }

         }
         setViewportSize("setMode");
      }

      setImageCursor(mode.cursor);
      viewChanges.mode = true;
      notify("setMode");
   };
   
   //---------------------------------------------------------
   var getMode = function () {
      return mode;
   };

   //---------------------------------------------------------
   var getModes = function () {
      return modes;
   };

   //---------------------------------------------------------
   var setCursor = function (cursor) {
      var div = document.getElementById("wlzIIPViewerIFrameContainer");
      if(cursor === undefined) {
	 document.body.style.cursor = "default";
      } else {
	 document.body.style.cursor = cursor;
      }
   };

   //---------------------------------------------------------
   var getNextWindowName = function () {
      if(equivalentSectionId === undefined) {
         equivalentSectionId = 0;
      }
      equivalentSectionId = 1*equivalentSectionId + 1*1;
      return "wlzIIPViewerPopup_" + equivalentSectionId;
   };

   //---------------------------------------------------------
   var getNext3dWindowName = function () {
      if(threeDId === undefined) {
         threeDId = 0;
      }
      threeDId = 1*threeDId + 1*1;
      return "threeDPopup_" + threeDId;
   };

   //---------------------------------------------------------
   var getQueryResults = function (url) {
      var windowName = getNextWindowName();
      var windowPars = 'height=700,width=1030,scrollbars=yes,toolbar=yes,menubar=yes';
      //console.log("url ",url);
      openWindows[openWindows.length] = window.open(url,windowName,windowPars);
      mouseDownInImage = false;
      //window.location = url;
   };

   //---------------------------------------------------------
   var getModeSubType = function () { 
      return modeSubType;
   };

   //---------------------------------------------------------
   var launchEquivalentSection = function (url) {
      var windowName = getNextWindowName();
      var windowPars = 'height=700,width=900,scrollbars=yes,toolbar=yes,menubar=yes';
      //console.log("url ",url);
      openWindows[openWindows.length] = window.open(url,windowName,windowPars);
   };

   //---------------------------------------------------------
   // Hack: for Kaufman point and click we need to adjust the position of the locator for plates 3 & 4
   // and we will also need to adjust image drop-down position
   // when a different embryo is displayed.
   var updateLocatorPosition = function (toppx, imgH) {
      var locator = $('locator-container');
      var dropdown = $('image-dropDownContainer');
      var loctop;
      var droptop;

      loctop = Number(toppx) + Number(imgH) + Number(30) + 'px';
      droptop = Number(toppx) + Number(imgH) + Number(10) + 'px';

      if(locator) {
         locator.setStyle('top', loctop);
      }
      if(dropdown) {
         dropdown.setStyle('top', droptop);
      }
   };

   //---------------------------------------------------------
   // for Kaufman point and click context menu for table, highlight relevant items.
   var contextMenuHighlight = function (yes) {

      resetViewChanges();
      if(yes) {
         viewChanges.contextMenuOn = true;
      } else {
         viewChanges.contextMenuOff = true;
      }
      notify("contextMenuOn");
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      register: register,
      getName: getName,
      modelUpdate:modelUpdate,
      queryUpdate:queryUpdate,
      pointClickUpdate:pointClickUpdate,
      updateDst: updateDst,
      updateWlzRotation: updateWlzRotation,
      requestImages: requestImages,
      getImgFit: getImgFit,
      getScale: getScale,
      setScale: setScale,
      getOpacity: getOpacity,
      setOpacity: setOpacity,
      colourChange: colourChange,
      setElementToColour: setElementToColour,
      getElementToColour: getElementToColour,
      getRGBA: getRGBA,
      setFilter: setFilter,
      getFilter: getFilter,
      getPossibleFixedPoint: getPossibleFixedPoint,
      setPossibleFixedPoint: setPossibleFixedPoint,
      getMeasurementOrigin: getMeasurementOrigin,
      getMeasurementTarget: getMeasurementTarget,
      getMeasurementPoint: getMeasurementPoint,
      getHRSectionPoint: getHRSectionPoint,
      setModeNum: setModeNum,
      setMode: setMode,
      getMode: getMode,
      getModes: getModes,
      stopMeasuring: stopMeasuring,
      getSelections: getSelections,
      setSelections: setSelections,
      new3d: new3d,
      getIndexArray: getIndexArray,
      setLayerVisibility: setLayerVisibility,
      getLayerVisibility: getLayerVisibility,
      setLayerRenderMode: setLayerRenderMode,
      getLayerRenderMode: getLayerRenderMode,
      //getResolutionData: getResolutionData,
      //getLocatorData: getLocatorData,
      clearTiles: clearTiles,
      popDrawingCanvas: popDrawingCanvas,
      setCurrentLayer: setCurrentLayer,
      getCurrentLayer: getCurrentLayer,
      showLayerProperties: showLayerProperties,
      getViewportDims: getViewportDims,
      getViewableDims: getViewableDims,
      setViewportSize: setViewportSize,
      getViewerContainerPos: getViewerContainerPos,
      getViewportLeftEdge: getViewportLeftEdge,
      getViewportTopEdge: getViewportTopEdge,
      getToolContainerPos: getToolContainerPos,
      getFocalPoint: getFocalPoint,
      setFocalPoint: setFocalPoint,
      getMouseClickPosition: getMouseClickPosition,
      getInitialMousePoint: getInitialMousePoint,
      getDrawPoint: getDrawPoint,
      getDrawOrigin: getDrawOrigin,
      getPointClickPoint: getPointClickPoint,
      showMarkerPopupIFrame: showMarkerPopupIFrame,
      hideMarkerPopupIFrame: hideMarkerPopupIFrame,
      getInitialPointClickPoint: getInitialPointClickPoint,
      getMouseDownTarget: getMouseDownTarget,
      getDataAtMouse: getDataAtMouse,
      getDebugPoint: getDebugPoint,
      //getDisplayPositionGivenImgCoords: getDisplayPositionGivenImgCoords,
      getMousePositionInImage: getMousePositionInImage,
      getCompObjIndxArr: getCompObjIndxArr,
      testCoordSystem: testCoordSystem,
      isMouseDownInImage: isMouseDownInImage,
      toolboxVisible: toolboxVisible,
      refreshImage: refreshImage,
      maximiseImage: maximiseImage,
      getDebugWindow: getDebugWindow,
      showDebugWindow: showDebugWindow,
      showTileBorders: showTileBorders,
      showViewerHelp: showViewerHelp,
      showX3domHelpFrame: showX3domHelpFrame,
      hideX3domHelpFrame: hideX3domHelpFrame,
      showX3domUnsupportedFrame: showX3domUnsupportedFrame,
      hideX3domUnsupportedFrame: hideX3domUnsupportedFrame,
      setToolboxVisibility: setToolboxVisibility,
      enableImgLabels: enableImgLabels,
      showQueryDialogue: showQueryDialogue,
      getQueryResults: getQueryResults,
      getModeSubType: getModeSubType,
      cancelContextMenu: cancelContextMenu,
      enableDebugDiv: enableDebugDiv,
      launchEquivalentSection: launchEquivalentSection,
      goToDownloadPage: goToDownloadPage,
      updateLocatorPosition: updateLocatorPosition,
      contextMenuHighlight: contextMenuHighlight,
      getNextWindowName: getNextWindowName,
      getNext3dWindowName: getNext3dWindowName,
      register3dWindow: register3dWindow,
      new3dCallback: new3dCallback,
      okToProceed3d: okToProceed3d,
      update3d: update3d,
      //setShow3dWarningDialog: setShow3dWarningDialog,
      //getShow3dWarningDialog: getShow3dWarningDialog,
      getMax3dToShow: getMax3dToShow,
      setMax3dToShow: setMax3dToShow,
      getOrigMax3dToShow: getOrigMax3dToShow,
      get3dWindowList: get3dWindowList,
      show3dAnatomyHelpFrame: show3dAnatomyHelpFrame,
      hide3dAnatomyHelpFrame: hide3dAnatomyHelpFrame,
      getTreeTool: getTreeTool,
      resetViewChanges: resetViewChanges
   };

}(); // end of module tiledImageView
//----------------------------------------------------------------------------
