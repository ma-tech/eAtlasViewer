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
////---------------------------------------------------------
//   tiledImageModel.js
//   Model for high resolution tiled image from an iip server
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
// module for tiledImageModel
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.tiledImageModel = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var view = emouseatlas.emap.tiledImageView;
   var query = emouseatlas.emap.tiledImageQuery;
   var pointClick = emouseatlas.emap.tiledImagePointClick;
   var util = emouseatlas.emap.utilities;
   var busyIndicator = emouseatlas.emap.busyIndicator;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var _debug = false;
   var modelInitialised = false;
   //......................
   var imageTitle;
   var imageTitleTooltip;
   var webServer;
   var iipServerPath;
   var metadataRoot;
   var dataImageDir;
   var imageExtension;
   var fullDepth;
   var interfaceImageDir;
   var stackMetadataFilename;
   var toolsMetadataFilename;
   var fullDataPath;
   var busyIndicatorSrc;
   var project;
   var infoDetails;

   var dataImgPaths;
   var viewerTargetId;
   var projectDivId;
   var initialState = {};
   var x3dInfo = {};
   var pointClickImgData = {};
   var undelineatedRGBA = {r:240, g:240, b:240, a:255};
   var voxelSize = {x:1, y:1, z:1, units:["\u03BC\u006D", "\u006D\u006D"]}; // default values
   var layerNames = []; // read in with initModelCallback()
   var layerData = {}; // this must be an object, not an array
   var numberOfTrees = 0;
   var numberOfTreesLoaded = 0;
   var transverseView = {pitch:0, yaw:0, roll:0}; // read in with initModelCallback()
   var sagittalView = {pitch:90, yaw:0, roll:270};
   var coronalView = {pitch:90, yaw:90, roll:270};
   var queryModes = {anatomy:false, spatial:false};
   var expressionLevelKey;
   var assayPath;
   var assayID;
   //var urlSpecifiedSection;
   var urlSpecified = {};
   var tileframe;
   var imgtitle;
   //......................
   var isWlz = false;
   var isPyrTiff = false;
   var isPyrTiff_origNames = false;
   var isSinglePyrTiff = false;
   var isEurexpress = false;
   var sectionOrderReversed = false;
   var layerHasLabels = false;
   var arrayStartsFrom0 = true;
   var dataSubType = undefined;
   var wlzToStackOffset = 0;
   var equivSectionOffset = 0;
   //......................
   var maxiipres;
   //......................
   var registry = [];
   var modelChanges = { 
      initial: false,
      initialState: false,
      layerNames: false,
      locator: false,
      dst: false,
      distanceRange: false,
      boundingBox: false,
      fxp: false,
      setSection: false,     // for expression sections etc
      /*
      addQuerySection: false,
      removeQuerySection: false,
      saveQuerySection: false,
      changeQuerySection: false, // for spatial query when section has been selected from dialogue
      */
      sectionChanged: false   // if dst or angle has been changed
   };
   var image = {};
   var scale = {};
   var tileSize = {};
   var fullWlzObject = {x:{}, y:{}, z:{}};
   var fullImgDims = {};
   var zsel = {
      fullname: "",
      width: 0,
      height: 0,
      border_tl: 0,
      border_br: 0,
      orientation: "horizontal",
      imgRange:[]
   }

   var threeDInfo = {
      wlzMode: "",
      defaultFxp: {x:0, y:0, z:0},
      fxp: {x:0, y:0, z:0},
      scaledFxp: {x:0, y:0, z:0},
      dst: {min:0, max:0, cur:0},
      dstRange: {min:0, max:0},
      voxel: undefined,
      normVoxel: undefined,
      pitch: {min:0, max:180, cur:0},
      yaw: {min:0, max:360, cur:0},
      roll: {min:0, max:360, cur:0}
   }
   var dst = {}; // for 2D images such as pyramidal tiff
   var qlt = {min:0, max:100, cur:80};
   var roi = {x:0.5, y:0.5};
   //......................
   var initialCurrentLayer;
   //......................
   var menuStructureUrl;
   var menuContentUrl;
   var tableMenuStructureUrl;
   var tableMenuContentUrl;
   var treeMenuStructureUrl;
   var treeMenuContentUrl;
   //......................
   var queryDataUrl;

   var greyImg;
   var expressionImg;
   var expressionSectionName = [];
   var expressionSection = {};

   var currentSection = {}; // this must be an object, not an array

   var keySections = [];
   var keySectionNames = [];

   var scalebarLen;

   var EDITOR = false;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   var initModel = function(url) {

      if(_debug) {
         console.log("enter initModel %s",url);
      }

      var ajaxParams = {
         url:url,
	 method:"POST",
	 callback:initModelCallback,
	 async:true
      }
      //console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

      if(_debug) {
         console.log("exit initModel");
      }
   }; // initModel

   //---------------------------------------------------------
   var initModelCallback = function(response) {

      var deb = _debug;
      var numlayers;
      var json;
      var dataType;
      var scaling;
      var wlzToStackOffsetStr;
      var equivSectionOffsetStr;
      var numlayers;

      var jsonLayerData;
      var modelInfo;
      var layerType;
      var lowRes;
      var locatadata;
      var selectaName;
      var stackDepthStr;
      var treeStructureURL; // the full path to the json file from the web root.
      var treeDataURL; // the full path to the json file from the web root.
      var menuStructureFile;
      var menuContentFile;
      var tableMenuStructureFile;
      var tableMenuContentFile;
      var treeMenuStructureFile;
      var treeMenuContentFile;
      var queryDataFile;
      var state;
      var x3d;
      var kd;
      var zselInfo;
      var map;
      var props;

      var i;

      //console.log("enter initModelCallback: response ",response);
      //_debug = true;
      if(_debug) {
         console.log("enter initModelCallback");
      }

      // get model data via ajax
      //----------------
      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
	 //console.log("initModelCallback returning: reponse null");
	 return false;
      }
      //console.log("response: ",response);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
	 json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
	 //console.log("initModelCallback returning: json null");
	 return false;
      }
      //console.log("json: ",json);

      imageTitle = json.imageTitle;
      imageTitleTooltip = json.imageTitleTooltip;
      webServer = "http://" + json.webServer;
      iipServerPath = json.iipServerPath;
      interfaceImageDir = json.interfaceImageDir;
      //console.log("initModelCallback interfaceImageDir %s ",interfaceImageDir);
      metadataRoot = json.metadataRoot;
      if(json.toolsMetadataFilename) {
	 toolsMetadataFilename = json.toolsMetadataFilename;
      }
      stackMetadataFilename = (json.stackMetadataFilename === undefined || json.stackMetadataFilename === "") ? "" : json.stackMetadataFilename;

      dataType = json.dataType;
      //console.log("initModelCallback: dataType %s",dataType);
      if(dataType.toLowerCase() === "wlz") {
         isWlz = true;
	 //console.log("isWlz true");
      }
      if(dataType.toLowerCase() === "pyrtiff") {
	 isPyrTiff = true;
	 //console.log("isPyrTiff true");
      }
      if(dataType.toLowerCase() === "pyrtiff_orignames") {
         isPyrTiff_origNames = true;
	 //console.log("isPyrTiff_origNames true");
      }
      if(dataType.toLowerCase() === "eurexpress") {
	 isEurexpress = true;
	 //console.log("isEurexpress true");
      }
      if(dataType.toLowerCase() === "singlepyrtiff") {
         isSinglePyrTiff = true;
         //console.log("isSinglePyrTiff true");
      }

      dataSubType = (json.dataSubType === undefined) ? undefined : json.dataSubType;
      //console.log("dataSubType %s", dataSubType);

      wlzToStackOffsetStr = (json.wlzToStackOffset === undefined) ? "0" : json.wlzToStackOffset;
      wlzToStackOffset = parseInt(wlzToStackOffsetStr);
     //console.log("wlzToStackOffset %s", wlzToStackOffset);

      equivSectionOffsetStr = (json.equivSectionOffset === undefined) ? "0" : json.equivSectionOffset;
      equivSectionOffset = parseInt(equivSectionOffsetStr);
     //console.log("equivSectionOffset %s", equivSectionOffset);


      arrayStartsFrom0 = (json.arrayStartsFrom0 === undefined) ? 'true' : json.arrayStartsFrom0;
      arrayStartsFrom0 = (arrayStartsFrom0 === 'true' || arrayStartsFrom0 === true) ? true : false;

      viewerTargetId = json.viewerTargetId;

      layerNames = json.layerNames;
      //console.log("layer names ",layerNames);
      numlayers = layerNames.length;

      jsonLayerData = json.layerData;
      //console.log("initModelCallback jsonLayerData ",jsonLayerData);

      for(i=0; i<numlayers; i++) {

         if(jsonLayerData[i].modelInfo !== undefined) {
	    modelInfo = jsonLayerData[i].modelInfo;
	    //console.log("model: modelInfo ",modelInfo);
	 }

         if(jsonLayerData[i].current !== undefined) {
	    initialCurrentLayer = layerNames[i];
	 }

	 if(jsonLayerData[i].lowResData !== undefined) {
	    lowRes = jsonLayerData[i].lowResData;
	 }

	 if(jsonLayerData[i].locatorData !== undefined) {
	    locatadata = jsonLayerData[i].locatorData;
	 } else {
	    locatadata = {imageDir:jsonLayerData[i].imageDir, imageName:jsonLayerData[i].imageName, sampleRate:1};
	 }

	 selectaName = (jsonLayerData[i].selectorName !== undefined) ? jsonLayerData[i].selectorName : "zsel.jpg.256.pyr.tif"; 
	 // for 3D models with anatomy the painted wlz object is constructed from original sections.
	 stackDepthStr = jsonLayerData[i].stackDepth;
	 if(stackDepthStr !==  undefined) {
	    fullDepth = parseInt(stackDepthStr);
	 }

	 if(jsonLayerData[i].treeStructureURL !== undefined) {
	    treeStructureURL = jsonLayerData[i].treeStructureURL;
            treeStructureURL = emouseatlas.emap.utilities.constructURL(webServer, treeStructureURL);
	    treeDataURL = jsonLayerData[i].treeDataURL;
            treeDataURL = emouseatlas.emap.utilities.constructURL(webServer, treeDataURL);
	    numberOfTrees++;
	    //console.log("numberOfTrees ",numberOfTrees);
	 }

	 if(jsonLayerData[i].type) {
	    layerType = jsonLayerData[i].type;
	    if(layerType.toLowerCase() === "label") {
	       layerHasLabels = true;
	    }
	 }

	 if(jsonLayerData[i].mouseOverFilter) {
	    mouseOverFilter = jsonLayerData[i].mouseOverFilter;
	 } else {
	    mouseOverFilter = undefined;
	 }

	 if(jsonLayerData[i].map) {
	    map = getMapSpecFromJson(jsonLayerData[i].map);
	    //console.log(map);
	 } else {
	    map = undefined;
	 }

	 if(jsonLayerData[i].props) {
	    //console.log("getting props");
	    props = getPropsFromJson(jsonLayerData[i].props);
	 } else {
	    props = {
	       opacity:false,
	       filter:false,
	       renderModes:undefined,
	       initialOpacity:undefined,
	       initialFilter:undefined,
	       initialRenderMode:undefined
	    };
	 }
         //console.log("initModelCallback props ",props);

	 if(layerData[layerNames[i]] === undefined) {
	    layerData[layerNames[i]] = {
	       layerName:layerNames[i],
	       modelInfo:modelInfo,
	       imageDir:jsonLayerData[i].imageDir,
	       imageName:jsonLayerData[i].imageName,
	       lowResData:lowRes,
	       locatorData:locatadata,
	       selectorName:selectaName,
	       targetId:viewerTargetId,
	       visible:jsonLayerData[i].visible,
	       type:jsonLayerData[i].type,
	       mouseOverFilter:jsonLayerData[i].mouseOverFilter,
	       map:map,
	       props:props,
	       treeStructure:treeStructureURL,
	       treeData:treeDataURL
	    };
	    //console.log("initModelCallback tree ",tree);
	 }

	 // modify image file location if url indicates dynamic nature
 	   if ( layerNames[i] === 'grey' &&
		greyImg !== undefined &&
		greyImg != "" &&
		greyImg != null)
	     layerData[layerNames[i]].imageName = greyImg;
 	     else {
 	       if (layerNames[i] === 'expression' &&
		   expressionImg !== undefined &&
		   expressionImg != "" &&
		   expressionImg != null) {
 		 layerData[layerNames[i]].imageName = expressionImg;
	       }
	     }
      }

      if(typeof(json.menuStructureFile) !== 'undefined') {
         menuStructureFile = json.menuStructureFile;
	 //console.log("menuStructureFile %s",menuStructureFile);
         menuStructureUrl = emouseatlas.emap.utilities.constructURL(webServer, menuStructureFile);
      }

      if(typeof(json.menuContentFile) !== 'undefined') {
         menuContentFile = json.menuContentFile;
         menuContentUrl = emouseatlas.emap.utilities.constructURL(webServer, menuContentFile);
      }

      if(typeof(json.tableMenuStructureFile) !== 'undefined') {
         tableMenuStructureFile = json.tableMenuStructureFile;
         tableMenuStructureUrl = emouseatlas.emap.utilities.constructURL(webServer, tableMenuStructureFile);
      }

      if(typeof(json.tableMenuContentFile) !== 'undefined') {
         tableMenuContentFile = json.tableMenuContentFile;
         tableMenuContentUrl = emouseatlas.emap.utilities.constructURL(webServer, tableMenuContentFile);
      }

      if(typeof(json.treeMenuStructureFile) !== 'undefined') {
         treeMenuStructureFile = json.treeMenuStructureFile;
         treeMenuStructureUrl = emouseatlas.emap.utilities.constructURL(webServer, treeMenuStructureFile);
      }

      if(typeof(json.treeMenuContentFile) !== 'undefined') {
         treeMenuContentFile = json.treeMenuContentFile;
         treeMenuContentUrl = emouseatlas.emap.utilities.constructURL(webServer, treeMenuContentFile);
      }

      if(typeof(json.queryDataFile) !== 'undefined') {
         queryDataFile = json.queryDataFile;
         queryDataUrl = webServer + queryDataFile;
      }

      if(typeof(json.queryModes) !== 'undefined') {
         queryModes.anatomy = (json.queryModes.anatomy === 'true') ? true : false;
         queryModes.spatial = (json.queryModes.spatial === 'true') ? true : false;
      }

      if(typeof(json.transverseView) !== 'undefined') {
         transverseView = {
	              label:json.transverseView.label,
	              pitch:parseInt(json.transverseView.pitch),
                      yaw:parseInt(json.transverseView.yaw),
                      roll:parseInt(json.transverseView.roll) };
      }
      if(typeof(json.sagittalView) !== 'undefined') {
         sagittalView = {
	            label:json.sagittalView.label,
	            pitch:parseInt(json.sagittalView.pitch),
                    yaw:parseInt(json.sagittalView.yaw),
                    roll:parseInt(json.sagittalView.roll) };
      }
      if(typeof(json.coronalView) !== 'undefined') {
         coronalView = {  
	           label:json.coronalView.label,
	           pitch:parseInt(json.coronalView.pitch),
                   yaw:parseInt(json.coronalView.yaw),
                   roll:parseInt(json.coronalView.roll) };
      }

      if(typeof(json.expressionLevelKey) !== 'undefined') {
	 expressionLevelKey = json.expressionLevelKey;
      }

      if(json.project !== undefined) {
         project = json.project;
      } else {
         project = "";
      }

      if(json.initialState !== undefined) {
         state = json.initialState;
	 //console.log("initial state ",state);
	 getInitialStateFromJson(state);
      }

      if(json.x3d !== undefined) {
         x3d = json.x3d;
	 //console.log("x3d ",x3d);
	 getX3dFromJson(x3d);
      }

      if(json.pointClickImgData !== undefined) {
         kd = json.pointClickImgData;
         if(kd.plate) {
            pointClickImgData.plate = kd.plate;
         }
         if(kd.subplate) {
            pointClickImgData.subplate = kd.subplate;
         }
         if(kd.sectionMap) {
            pointClickImgData.sectionMap = kd.sectionMap;
         }
         if(kd.image) {
            pointClickImgData.image = kd.image;
         }
         if(kd.comps) {
            pointClickImgData.comps = kd.comps;
         }
      }
      //console.log("pointClickImgData kd ",kd);

      if(json.voxelSize !== undefined) {
         voxel = json.voxelSize;
	 if(voxel.x) {
	    voxelSize.x = parseFloat(voxel.x);
	 }
	 if(voxel.y) {
	    voxelSize.y = parseFloat(voxel.y);
	 }
	 if(voxel.z) {
	    voxelSize.z = parseFloat(voxel.z);
	 }
	 if(voxel.units) {
	    voxelSize.units = voxel.units;
	 }
      }
      //console.log("read in voxelSize ",voxelSize);

      if(json.wlzMode !== undefined) {
	 threeDInfo.wlzMode = json.wlzMode;
	 //console.log("initModelCallback: wlzMode %s",threeDInfo.wlzMode);
      }

      sectionOrderReversed = (typeof(json.sectionOrderReversed) === 'undefined') ? false : json.sectionOrderReversed; 
      sectionOrderReversed = (sectionOrderReversed === 'true' || sectionOrderReversed === true) ? true : false;

      if(json.busyIndicatorSrc !== undefined) {
	 busyIndicatorSrc = json.busyIndicatorSrc;
      }

      if(json.infoDetails !== undefined) {
	 infoDetails = json.infoDetails;
      }

      tileframe = json.tileframe;
      imgtitle = json.imgtitle;

      if(json.zselInfo !== undefined) {
	 zselInfo = json.zselInfo;
	 zsel.width = zselInfo.zselwidth;
	 zsel.height = zselInfo.zselheight;
	 zsel.border_tl = zselInfo.zseldragborderlefttop;
	 zsel.border_br = zselInfo.zseldragborderrightbottom;
	 zsel.orientation = zselInfo.zsliceorientation;
      }

      if(json.keySections !== undefined) {
         keySections = json.keySections;
      }

      if(json.keySectionNames !== undefined) {
         keySectionNames = json.keySectionNames;
      }

      scalebarLen = (typeof(json.scalebarLen) === 'undefined') ? 100 : json.scalebarLen; 

      getMetadata();

      if(_debug) {
         console.log("exit initModelCallback");
      }
      _debug = deb;

   }; // initModelCallback

   //---------------------------------------------------------
   var getInitialStateFromJson = function(state) {

         // scale can be a string (initial scale) or an object (min, initial, max)
         if(state.scale) {
	    if(_debug) console.log("model is reading scale from json file");
            if(_debug) console.log("typeof state.scale is %s ",typeof state.scale, state.scale);
            if (typeof state.scale === 'object') {
               initialState.scale = parseFloat(state.scale.init);
               // set the max and min scale if given
               if(state.scale.min) {
                  scale.min = parseFloat(state.scale.min);
               }
               if(state.scale.max) {
                  scale.max = parseFloat(state.scale.max);
               }
            } else {
               initialState.scale = parseFloat(state.scale);
               scale.max = undefined;
               scale.min = undefined;
            }
            if(_debug) console.log("initialState.scale %d, scale.min %d, scale.max %d",initialState.scale,scale.min,scale.max);
	 }
	 // if it has expression sections, use its first section as initial section
	 if (expressionSectionName !== undefined &&
	     expressionSectionName.length !== undefined &&
	     0 < expressionSectionName.length) {
	     initialState.distance = expressionSection[expressionSectionName[0]].dst;
	     initialState.pitch = expressionSection[expressionSectionName[0]].phi;
	     initialState.yaw = expressionSection[expressionSectionName[0]].theta;
	 } else {
            // if section has been specified in url params, this overrides
            // initialState.distance read from tiledImageModelData.jso.
            // If neither have been specified, use dst.min
            if(urlSpecified.section) {
               initialState.distance = parseFloat(urlSpecified.section);
            } else if(state.distance) {
               initialState.distance = parseFloat(state.distance);
            } else {
               initialState.distance = dst.min;
            }
            
            if(state.pitch) {
               initialState.pitch = parseFloat(state.pitch);
            }
            if(state.yaw) {
               initialState.yaw = parseFloat(state.yaw);
            }
	 }
	 if(state.roll) {
	   initialState.roll = parseFloat(state.roll);
	 }
	 if(state.mode) {
	   initialState.mode = state.mode;
	 }
	 if(state.fixedPoint) {
	   initialState.fxp = state.fixedPoint;
	   //console.log("initialState.fxp ",initialState.fxp);
	 }
	 if(state.imgLabels != undefined) {
	   initialState.imgLabels = state.imgLabels;
	 }

	 //console.log("initialState ",initialState);

   }; // getInitialStateFromJson

   //---------------------------------------------------------
   var getX3dFromJson = function(x3d) {
      
      var vp;
      var num;
      var i;

      if(x3d.url) {
         x3dInfo.url = x3d.url;
      }

      //..............................
      if(x3d.fxpTrans) {
         x3dInfo.fxpTrans = {};
	 x3dInfo.fxpTrans.x = parseInt(x3d.fxpTrans.x);
	 x3dInfo.fxpTrans.y = parseInt(x3d.fxpTrans.y);
	 x3dInfo.fxpTrans.z = parseInt(x3d.fxpTrans.z);
      }

      //console.log("getX3dFromJson: x3dInfo.fxpTrans ",x3dInfo.fxpTrans);

      //..............................
      if(x3d.initTrans) {
         x3dInfo.initTrans = {};
	 x3dInfo.initTrans.x = parseInt(x3d.initTrans.x);
	 x3dInfo.initTrans.y = parseInt(x3d.initTrans.y);
	 x3dInfo.initTrans.z = parseInt(x3d.initTrans.z);
      }

      //..............................
      x3dInfo.disc = {};
      if(x3d.disc) {
         if(x3d.disc.height) {
	    x3dInfo.disc.height = parseInt(x3d.disc.height);
	 }
	 //..........
         if(x3d.disc.radius) {
	    x3dInfo.disc.radius = parseFloat(x3d.disc.radius);
	 }
	 //..........
         if(x3d.disc.rot) {
	    x3dInfo.disc.rot = {xsi:parseInt(x3d.disc.rot.xsi), eta:parseInt(x3d.disc.rot.eta), zeta:parseInt(x3d.disc.rot.zeta), rad:parseFloat(x3d.disc.rot.rad)};
	 }
	 //..........
         if(x3d.disc.trans) {
	    x3dInfo.disc.trans = {x:parseInt(x3d.disc.trans.x), y:parseInt(x3d.disc.trans.y), z:parseInt(x3d.disc.trans.z)};
	 }
	 //..........
         if(x3d.disc.colour) {
	    x3dInfo.disc.colour = {r:parseFloat(x3d.disc.colour.r), g:parseFloat(x3d.disc.colour.g), b:parseFloat(x3d.disc.colour.b)};
	 }
	 //..........
         if(x3d.disc.transparency) {
	    x3dInfo.disc.transparency = parseFloat(x3d.disc.transparency);
	 }
      }

      //..............................
      x3dInfo.embryo = {};
      if(x3d.embryo) {
	 //..........
         if(x3d.embryo.rot) {
	    x3dInfo.embryo.rot = {xsi:parseInt(x3d.embryo.rot.xsi), eta:parseInt(x3d.embryo.rot.eta), zeta:parseInt(x3d.embryo.rot.zeta), rad:parseFloat(x3d.embryo.rot.rad)};
	 }
	 //..........
         if(x3d.embryo.trans) {
	    x3dInfo.embryo.trans = {x:parseInt(x3d.embryo.trans.x), y:parseInt(x3d.embryo.trans.y), z:parseInt(x3d.embryo.trans.z)};
	 }
	 //..........
         if(x3d.embryo.origFxp) {
	    x3dInfo.embryo.origFxp = {x:parseInt(x3d.embryo.origFxp.x), y:parseInt(x3d.embryo.origFxp.y), z:parseInt(x3d.embryo.origFxp.z)};
	 }
      }

      //..............................
      x3dInfo.style = {};
      if(x3d.style) {
	 x3dInfo.style.x = parseInt(x3d.style.x) + "px";
	 x3dInfo.style.y = parseInt(x3d.style.y) + "px";
	 x3dInfo.style.width = parseInt(x3d.style.width) + "px";
	 x3dInfo.style.height = parseInt(x3d.style.height) + "px";
	 x3dInfo.style.float = x3d.style.float;
	 x3dInfo.style.border = x3d.style.border;
      }

      //..............................
      x3dInfo.viewpoints = [];
      if(x3d.viewpoints) {
	 num = x3d.viewpoints.length;
	 for(i=0; i<num; i++) {
            x3dInfo.viewpoints[i] = {};
	    if(x3d.viewpoints[i].description) {
               x3dInfo.viewpoints[i].description = x3d.viewpoints[i].description;
	    }
	    //..........
	    if(x3d.viewpoints[i].fov) {
               x3dInfo.viewpoints[i].fov = parseFloat(x3d.viewpoints[i].fov);
	    }
	    //..........
	    if(x3d.viewpoints[i].trans) {
               x3dInfo.viewpoints[i].trans = {x:parseInt(x3d.viewpoints[i].trans.x), y:parseInt(x3d.viewpoints[i].trans.y), z:parseInt(x3d.viewpoints[i].trans.z)};
	    }
	    //..........
	    if(x3d.viewpoints[i].orient) {
	       x3dInfo.viewpoints[i].orient = {
	            xsi:parseFloat(x3d.viewpoints[i].orient.xsi),
		    eta:parseFloat(x3d.viewpoints[i].orient.eta),
		    zeta:parseFloat(x3d.viewpoints[i].orient.zeta),
		    rad:parseFloat(x3d.viewpoints[i].orient.rad)
               };
	    }
	    //..........
	 }
      }

      //..............................
      if(x3d.bgCol) {
	 x3dInfo.bgCol = {r:parseFloat(x3d.bgCol.r), g:parseFloat(x3d.bgCol.g), b:parseFloat(x3d.bgCol.b)};
      }
      //console.log("x3dInfo: ",x3dInfo);

   }; // getX3dFromJson

   //---------------------------------------------------------
   var getMapSpecFromJson = function(map) {
      
      var mapSpec;
      var spec;
      var tmp;
      var type;
      var il;
      var iu;
      var ol;
      var ou;
      var p0;
      var p1;

      var len;
      var i;

      len = map.length;
      mapSpec = "";
      tmp = "";

      for(i=0; i<len; i++) {
         spec = map[i];
         //console.log(spec);
	 if(spec.type) {
	    tmp += spec.type + ",";
	 } else {
	    continue;
	 }
	 if(spec.il) {
	    tmp += spec.il + ",";
	 } else {
	    continue;
	 }
	 if(spec.iu) {
	    tmp += spec.iu + ",";
	 } else {
	    continue;
	 }
	 if(spec.ol) {
	    tmp += spec.ol + ",";
	 } else {
	    continue;
	 }
	 if(spec.ou) {
	    tmp += spec.ou + ",";
	 } else {
	    continue;
	 }
	 if((spec.type.toLowerCase() === "gamma" || spec.type.toLowerCase() === "sigmoid") && spec.p0) {
	    tmp += spec.p0 + ",";
	 }
	 if((spec.type.toLowerCase() === "sigmoid") && spec.p1) {
	    tmp += spec.p1 + ",";
	 }
	 mapSpec += tmp;
	 if(i < (len - 1)) {
	    mapSpec += ",";
	 }
      }

      return mapSpec;

   }; // getMapSpecFromJson

   //---------------------------------------------------------
   var getPropsFromJson = function(props) {
      
      var properties = undefined;
      var opacity;
      var filter;
      var renderModes;
      var initialOpacity;
      var initialFilter;
      var initialRenderMode;

      //console.log("getPropsFromJson ",props);
      // The minimum set of properties is opacity
      opacity = (props.opacity === undefined) ? true : props.opacity;
      // json passes in a string
      opacity = (opacity === true || opacity === "true") ? true : false;
      // the default opacity is 1.0 ie fully opaque    
      if(opacity) {
         initialOpacity = (props.initialOpacity === undefined) ? 1.0 : props.initialOpacity;
         //console.log("getPropsFromJson set initial opacity %s",initialOpacity);
      }

      filter = (props.filter === undefined) ? false : props.filter;
      filter = (filter === true || filter === "true") ? true : false;
      if(filter) {
         if(props.initialFilter === undefined) {
	    initialFilter = {red:255,green:255,blue:255};
	 } else {
	    initialFilter = {red:parseInt(props.initialFilter.red, 10), green:parseInt(props.initialFilter.green, 10), blue:parseInt(props.initialFilter.blue, 10)};
	 }
      }

      //-------------------
      // use this if you want to be able to NOT show a render mode drop-down
      renderModes = props.renderModes;
      initialRenderMode = props.initialRenderMode;
      //-------------------
      // use this if you want to always have a default render mode drop-down
      //renderModes = (props.renderModes === undefined) ? ["sect"] : props.renderModes;
      //initialRenderMode = (props.initialRenderMode === undefined) ? "sect" : props.initialRenderMode;
      //-------------------

      properties = {
         opacity:opacity,
	 filter:filter,
	 renderModes:renderModes,
	 initialOpacity:initialOpacity,
	 initialFilter:initialFilter,
	 initialRenderMode:initialRenderMode
      };

      return properties;

   }; // getPropsFromJson

   //---------------------------------------------------------
   var initModel4Tiff = function(url) {

      if(_debug) {
         console.log("enter initModel4Tiff %s",url);
      }

      var ajaxParams = {
         url:url,
	 method:"POST",
	 callback:initModel4TiffCallback,
	 async:true
      }
      //console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

      if(_debug) {
         console.log("exit initModel4Tiff");
      }
   }; // initModel4Tiff

   //---------------------------------------------------------
   var initModel4TiffCallback = function(response) {

      if(_debug) {
         console.log("enter initModel4TiffCallback");
      }

      // get model data via ajax
      //----------------
      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
	 //console.log("initModelCallback returning: reponse null");
	 return false;
      }

      var json;
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
	 json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
	 //console.log("initModelCallback returning: json null");
	 return false;
      }

      imageTitle = json.imageTitle;
      imageTitleTooltip = json.imageTitleTooltip;
      webServer = "http://" + json.webServer;
      iipServerPath = json.iipServerPath;
      interfaceImageDir = json.interfaceImageDir;
      //console.log("initModelCallback interfaceImageDir %s ",interfaceImageDir);
      metadataRoot = json.metadataRoot;
      if(json.toolsMetadataFilename) {
	 toolsMetadataFilename = json.toolsMetadataFilename;
      }
      if(json.stackMetadataFilename) {
	 stackMetadataFilename = json.stackMetadataFilename;
      }

      var dataType = json.dataType;
      if(dataType.toLowerCase() === "singlepyrtiff") {
         isSinglePyrTiff = true;
	 if(_debug) console.log("isSinglePyrTiff true");
      }

      viewerTargetId = json.viewerTargetId;

      layerNames = json.layerNames;
      var numlayers = layerNames.length;

      var jsonLayerData = json.layerData;
      var locatadata;

      for(var i=0; i<numlayers; i++) {

	locatadata = {imageDir:jsonLayerData[i].imageDir, imageName:greyImg, sampleRate:1};

	if(layerData[layerNames[i]] === undefined) {
	  layerData[layerNames[i]] = {
	    layerName:layerNames[i],
	    imageDir:jsonLayerData[i].imageDir,
	    imageName:greyImg,
	    locatorData:locatadata,
	    targetId:viewerTargetId,
	    visible:jsonLayerData[i].visible,
	    type:jsonLayerData[i].type
	 }
	}

      }

      if(typeof(json.menuStructureFile) !== 'undefined') {
	var menuStructureFile = json.menuStructureFile;
	menuStructureUrl = webServer + menuStructureFile;
      }

      if(typeof(json.menuContentFile) !== 'undefined') {
         var menuContentFile = json.menuContentFile;
         menuContentUrl = webServer + menuContentFile;
      }

      if(typeof(json.tableMenuStructureFile) !== 'undefined') {
         var tableMenuStructureFile = json.tableMenuStructureFile;
         tableMenuStructureUrl = webServer + tableMenuStructureFile;
      }

      if(typeof(json.tableMenuContentFile) !== 'undefined') {
         var tableMenuContentFile = json.tableMenuContentFile;
         tableMenuContentUrl = webServer + tableMenuContentFile;
      }

      if(json.initialState !== undefined) {
         var state = json.initialState;
	 //console.log("initial state ",json.initialState);
	 if(state.scale) {
	    initialState.scale = parseFloat(state.scale);
	 }

	 if(state.fixedPoint) {
	   initialState.fxp = state.fixedPoint;
	   //console.log("initialState.fxp ",initialState.fxp);
	 }
      }

      if(json.busyIndicatorSrc !== undefined) {
	 busyIndicatorSrc = json.busyIndicatorSrc;
      }

      if(json.infoDetails !== undefined) {
	 infoDetails = json.infoDetails;
      }

      tileframe = json.tileframe;
      imgtitle = json.imgtitle;

      get2DMetadata();

      if(_debug) {
         console.log("exit initModel4TiffCallback");
      }

   }; // initModel4TiffCallback

   //---------------------------------------------------------
   // read in the json file that defines a tree structure
   //---------------------------------------------------------
   var loadTreeStructure = function(layerName) {

      var layer = layerData[layerName];
      var url = layer.treeStructure;

      var ajaxParams = {
         url:url,
         method:"POST",
         callback: loadTreeStructureCallback_1,
         async:true,
	 urlParams:layerName
      }
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      var ret = ajax.loadResponse(ajaxParams);
   };

   //---------------------------------------------------------
   var loadTreeStructureCallback_1 = function(response, layerName) {

      response = util.trimString(response);
      if(response === null || typeof(response) === 'undefined' || response === "") {
	 alert("Could not loadTreeStructure");
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

      var layer = layerData[layerName];
      layer.treeStructure = json;

      loadTreeData(layerName);

   };

   //---------------------------------------------------------
   // read in the json file that defines tree content
   //---------------------------------------------------------
   var loadTreeData = function(layerName) {

      //console.log("loadTreeData for layer %s",layerName);
      var layer = layerData[layerName];
      var url = layer.treeData;

      var ajaxParams = {
         url:url,
         method:"POST",
         callback: loadTreeDataCallback_1,
         async:true,
	 urlParams:layerName
      }
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);
   };

   //---------------------------------------------------------
   var loadTreeDataCallback_1 = function(response, layerName) {

      response = util.trimString(response);
      if(response === null || typeof(response) === 'undefined' || response === "") {
	 alert("Could not loadTreeData");
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

      var layer = layerData[layerName];
      layer.treeData = json;
      numberOfTreesLoaded++;

      //console.log("numberOfTrees %d, numberOfTreesLoaded %d",numberOfTrees,numberOfTreesLoaded);
      if(numberOfTreesLoaded === numberOfTrees) {
	 modelChanges.initial = true;
	 modelChanges.layerNames = true;
	 modelInitialised = true;
	 //console.log("finished initialising model");
	 if(_debug) {
	    printPaths();
	 }
	 initView();
	 //initQuery();
      }
   };

   //---------------------------------------------------------
   // We should have read in the type of data we are dealing with.
   //---------------------------------------------------------
   var getMetadata = function() {

      var tdebug = _debug;
      var layer;
      var assayPath;
      var len;
      var pattern;
      var postn;

      //_debug = true;
      if(_debug) {
         console.log("enter getMetadata");
      }

      if(isWlz) {
         getWlzMetadata();
	 if(_debug) {
	    console.log("exit getMetadata, isWlz");
	 }
	 return false;
      } else if(isSinglePyrTiff) {
	 get2DMetadata();
	 if(_debug) {
	    console.log("exit getMetadata, isSinglePyrTiff");
	 }
	 return false;
      } else {
	 layer = layerData[layerNames[0]];
	 assayPath = getAssayPath();

	 ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 if (isEurexpress) {
  	     fullDataPath = metadataRoot + "linksToFullSizeImages_original/"+assayPath + stackMetadataFilename;
         } else if(isSinglePyrTiff) {
            fullDataPath = layer.imageDir + layer.imageName;
	    //console.log("getMetadata: fullDataPath %s",fullDataPath);
         } else {
         ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress dat
            fullDataPath = layer.imageDir + assayPath + stackMetadataFilename;
         }
	 //console.log("fullDataPath ",fullDataPath);

	 // we now have to deal with legacy filename formats ...

	 len = fullDataPath.length;

	 pattern = /\.tif\.js/i;  // case insensitive regexp for ".tif.js"
	 postn = fullDataPath.search(pattern);   
	 if(postn === len - 7) {
	    get2DMetadata();
	    if(_debug) {
	       console.log("exit getMetadata (.tif.js)");
	    }
	    return false;
	 }

	 pattern = /\.tif/i;
	 postn = fullDataPath.search(pattern);   
	 if(postn === len - 4) {
	    get2DMetadata();
	    if(_debug) {
	       console.log("exit getMetadata (.tif)");
	    }
	    return false;
	 }

	 pattern = /\.tiff/i;
	 postn = fullDataPath.search(pattern);   
	 if(postn === len - 5) {
	    get2DMetadata();
	    if(_debug) {
	       console.log("exit getMetadata (.tiff)");
	    }
	    return false;
	 }

	 // this is for EMAP high-res sections and kaufman
	 pattern = /\.jso/i;
	 postn = fullDataPath.search(pattern);   
	 if(postn === len - 4) {
	    getStackMetadata();
	    if(_debug) {
	       console.log("exit getMetadata (.jso)");
	    }
	    return false;
	 }

	 pattern = /\.js/i;
	 postn = fullDataPath.search(pattern);   
	 if(postn === len - 3) {
	    getStackMetadata();
	    if(_debug) {
	       console.log("exit getMetadata (.js)");
	    }
	    return false;
	 }
      }
      _debug = tdebug;

   };  // getMetadata

   //---------------------------------------------------------
   var getWlzMetadata = function() {

      if(_debug) {
         console.log("enter getWlzMetadata");
      }

      // If *.wlz, get metadata from IIP server
      //isWlz = true;

      // we might have read in and set min and max scale values from json config file.
      // if not, set them here
      if (typeof scale.max === 'undefined') {
	 scale.max = 4;
      }
      if (typeof scale.min === 'undefined') {
	 scale.min = 0.25;
      }

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (isEurexpress) {
	scale.max = 1;
	scale.min = 0.03125;
      }
      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data

      getIIPMetadata();

      if(_debug) {
         console.log("exit getWlzMetadata");
      }
   }; // getWlzMetadata

   //---------------------------------------------------------
   var get2DMetadata = function() {

      if(_debug) {
         console.log("enter get2DMetadata");
      }

      // If *.tif, get metadata from IIP server
      isWlz = false;
      /* commented out by nickb 08052014
      scale.max = 1;
      scale.min = 0.00390625;
      */
      getIIPMetadata();

      if(_debug) {
         console.log("exit get2DMetadata");
      }
   }; // get2DMetadata

   //---------------------------------------------------------
   //  Reads info relevant to pyramidal tiff stack.
   //---------------------------------------------------------
   var getStackMetadata = function() {

      var url;
      var ajaxParams;
      var ajax;

      if(_debug) console.log("enter getStackMetadata");

      url = getStackMetadataUrl();
      if(_debug) console.log("url ",url);

      ajaxParams = {
         url:url,
         method:"POST",
         callback: getStackMetadataCallback_1,
         async:true
      }
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

      if(_debug) console.log("exit getStackMetadata");
   }; // getStackMetadata

   //---------------------------------------------------------
   var getStackMetadataCallback_1 = function(response) {

      var json;
      var meta_ver;
      var startSection
      var stopSection
      var layer;
      var assayPath;
      var ajaxParams;
      var ajax;
      var entry;
      var minval;
      var maxval;
      var zselName;
      var zselOrient;
      var zselW;
      var zselH;
      var tmp;
      var num;
      var i;

      if(_debug) {
         console.log("enter getStackMetadataCallback_1");
      }

      // get metadata via ajax
      //----------------
      //console.log("getStackMetadataCallback_1 ",response);
      response = util.trimString(response);
      if(response === null || typeof(response) === 'undefined' || response === "") {
	 alert("Could not load fullDataPath metadata");
	 return false;
      }

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
	 json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
	 return false;
      }
      //console.log("getStackMetadataCallback_1 json = ",json);

      meta_ver = "1.02"; //default
      if (typeof(json.metadata_version) !== 'undefined') {
	 if(meta_ver !== json.metadata_version) {
	    alert("Could not load fullDataPath metadata");
	    return;
	 }
      }

      if(isEurexpress || isPyrTiff_origNames) {
	 imageExtension = json.image_extension;
	 if (typeof(json.file_root) !== 'undefined') {
	    dataImgPaths = json.file_root;
	    //console.log("dataImgPaths ",dataImgPaths);
	 } else {
	    alert("No images defined in JS file");
	    return;
	 }

	 if (typeof(json.file_root.length) !== 'undefined' && json.file_root.length !== 0) {
	    dst.max = json.file_root.length - 1;
	 }
      }

      if(isEurexpress) {
	 dataImageDir = "images/";
	 if (typeof(json.imagepath) !== 'undefined') {
	    dataImageDir = json.dataImageDir;
	 }
	 if (typeof(json.overlaypath) !== 'undefined') {
	    hasOverlays = true;
	    overlayPath = json.overlaypath;
	    overlaySuffix = json.overlaysuffix;
	 }
      }

      fullDepth = parseInt(json.fulldepth); // the number of sections in the stack


      if (typeof(json.startSection) !== 'undefined') {
	 startSection = parseInt(json.startSection); // the first section with an image
      } else {
	///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	if (urlSpecified.section !== 'undefined')
	  startSection = urlSpecified.section;
	else
	  ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 startSection = 0;
      }
      if (typeof(json.stopSection) !== 'undefined') {
	 stopSection = parseInt(json.stopSection); // the last section with an image
      } else {
	 stopSection = fullDepth - 1;
      }

      if(!arrayStartsFrom0) {
         startSection++;
         stopSection++;
      }

      if(startSection > stopSection) {
         tmp = startSection;
	 startSection = stopSection;
	 stopSection = tmp;
      }

      dst.min = startSection;
      dst.max = stopSection;

      layer = layerData[layerNames[0]];

      if (typeof(json.zsimgsrc) !== 'undefined' &&
	    (typeof(json.zselwidth) !== 'undefined' && json.zselwidth !== 0) &&
	    (typeof(json.zselheight) !== 'undefined' && json.zselheight !== 0) &&
	    (typeof(json.zsliceorientation) !== 'undefined' && json.zsliceorientation !== 0)) {

	 assayPath = getAssayPath();
	 ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	   /* all zsel.jpg is the same image for all assays
	      so save space, put only on at the top
	   */
	   if (isEurexpress)
	     zsel.fullname = webServer + metadataRoot + json.zsimgsrc;
	   else 
	     ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data

	 zsel.fullname = layer.imageDir + assayPath + json.zsimgsrc;

	 zsel.width = json.zselwidth;
	 zsel.height = json.zselheight;
	 zsel.border_tl = json.zseldragborderlefttop;
	 zsel.border_br = json.zseldragborderrightbottom;
	 zsel.orientation = json.zsliceorientation;

	 zsel.aspectRatio = typeof(json.zsimgAspectRatio) === 'undefined' ? (zsel.width / zsel.height) : json.zsimgAspectRatio;
	 //console.log("getStackMetadataCallback_1  zsel.aspectRatio ",zsel.aspectRatio);

	 // Some Kaufman Plates have multiple selector images (eg Plate03)
	 // In this case we need to know which sections relate to which image.
	 if(typeof(json.zselImgRange) === 'undefined') {
	    zsel.imgRange = [{min:Number(startSection), max:Number(stopSection)}]
            //console.log("getStackMetadataCallback_1 zsel.imgRange = ",zsel.imgRange);
	 } else {
	    num = json.zselImgRange.length;
	    for(i=0; i<num; i++) {
	       entry = json.zselImgRange[i];
	       minval = Number(entry.min);
	       maxval = Number(entry.max);
	       zselName = entry.name;
	       zselAspectRatio = Number(entry.aspectRatio);
	       zselW = Number(entry.width);
	       zselH = Number(entry.height);
	       zselOrient = entry.orient;
	       zsel.imgRange[zsel.imgRange.length] = {
	                                               min:minval,
						       max:maxval,
						       name:zselName,
						       aspectRatio:zselAspectRatio,
						       width:zselW,
						       height:zselH,
						       orient:zselOrient
						     };
	    }
	 }
         //console.log("getStackMetadataCallback_1 zsel.imgRange = ",zsel.imgRange);
      }

      if (typeof(json.domain_mapping) !== 'undefined') {
	 ajaxParams = {
	    url:json.domain_mapping,
	    method:"POST",
	    callback: function(response) {anatomyTerms = eval("("+response+")");},
	    async:true
	 }
	 ajax = new emouseatlas.emap.ajaxContentLoader();
	 ajax.loadResponse(ajaxParams);
      }

      get2DMetadata();

      if(_debug) {
         console.log("exit getStackMetadataCallback_1");
      }
   }; // getStackMetadataCallback_1

   //---------------------------------------------------------
   /**
   * Requests all relevant data that is accessible via the IIP
   * server (i.e. not data that is stored in json metadata files,
   * which is requested by getStackMetadata() )
   *
   * @author Ruven Pillay/Tom Perry
   */
   var getIIPMetadata = function() {

      if(_debug) {
         console.log("enter getIIPMetadata");
      }

      getObjects(["IIP", "IIP-server", "Tile-size"], getIIPMetadataCallback_1, true);

      if(_debug) {
         console.log("exit getIIPMetadata");
      }

   }; // getIIPMetadata
   
   //---------------------------------------------------------
   /**
    *   Callback function for 'getIIPMetadata' for ["IIP", "IIP-server", "Tile-size"] objects.
    */
   var getIIPMetadataCallback_1 = function () {

      if(_debug) {
         console.log("enter getIIPMetadataCallback_1");
      }

      if (isWlz) {
	 // Need to get bounding box first so that we can
	 // set our fixed point
	 getObjects(["Wlz-3d-bounding-box", "Wlz-true-voxel-size"], getIIPMetadataCallback_2, true);
      } else {
	 getObjects(["Max-size", "Resolution-number"], getIIPMetadataCallback_3, true);
      }
      
      if(_debug) {
         console.log("exit getIIPMetadataCallback_1");
      }
   };

   //---------------------------------------------------------
   /**
    *   Callback function for 'getIIPMetadata' for ["Wlz-3d-bounding-box", "Wlz-true-voxel-size"] objects.
    */
   var getIIPMetadataCallback_2 = function () {

      if(_debug) {
         console.log("enter getIIPMetadataCallback_2");
      }
      
      var fxp;
      var x;
      var y;
      var z;
      var smallest;
      var fixed;

      // the 'Wlz-true-voxel-size' function is not implemented yet
      // but we may have read voxel size from json file (tiledImageModelData.jso),
      // but if not just use the default values.
      if(threeDInfo.voxel === undefined) {
         if(voxelSize) {
	    threeDInfo.voxel = {};
            threeDInfo.voxel.x  = parseFloat(voxelSize.x);
            threeDInfo.voxel.y  = parseFloat(voxelSize.y);
            threeDInfo.voxel.z  = parseFloat(voxelSize.z);
            threeDInfo.voxel.units  = voxelSize.units;
	    // and normalise
	    threeDInfo.normVoxel = {};
	    smallest = threeDInfo.voxel.z;
	    smallest = (threeDInfo.voxel.x < smallest) ? threeDInfo.voxel.x : smallest;
	    smallest = (threeDInfo.voxel.y < smallest) ? threeDInfo.voxel.y : smallest;
	    fixed = 3;
            threeDInfo.normVoxel.x  = emouseatlas.emap.utilities.trimDecimal(parseFloat(voxelSize.x / smallest), fixed);
            threeDInfo.normVoxel.y  = emouseatlas.emap.utilities.trimDecimal(parseFloat(voxelSize.y / smallest), fixed);
            threeDInfo.normVoxel.z  = emouseatlas.emap.utilities.trimDecimal(parseFloat(voxelSize.z / smallest), fixed);
            threeDInfo.normVoxel.units  = voxelSize.units;
	 }
         //console.log("getIIPMetadataCallback_2: ",threeDInfo);
      }
      //console.log("threeDInfo.voxel ",threeDInfo.voxel);

      //initial status
      if (expressionSectionName !== undefined && expressionSectionName.length > 0) {
         // if it has expression sections, use its first section as initial section
         setFxpXValue(expressionSection[expressionSectionName[0]].x, "getIIPMetadataCallback_2");
         setFxpYValue(expressionSection[expressionSectionName[0]].y, "getIIPMetadataCallback_2");
         setFxpZValue(expressionSection[expressionSectionName[0]].z, "getIIPMetadataCallback_2");
      } else {
         // set the fixed point to the centre of the object
         x = Math.round(fullWlzObject.x.min + (fullWlzObject.x.max - fullWlzObject.x.min) / 2);
         setFxpXValue(x, "getIIPMetadataCallback_2");
         y = Math.round(fullWlzObject.y.min + (fullWlzObject.y.max - fullWlzObject.y.min) / 2);
         setFxpYValue(y, "getIIPMetadataCallback_2");
         z = Math.round(fullWlzObject.z.min + (fullWlzObject.z.max - fullWlzObject.z.min) / 2);
         setFxpZValue(z, "getIIPMetadataCallback_2");

         // but if there is an initial fixed point in config file, use it
         if (initialState.fxp !== undefined) {
            fxp = initialState.fxp;
            if(!isNaN(fxp.x)) {
               setFxpXValue(fxp.x, "getIIPMetadataCallback_2");
            }
            if(!isNaN(fxp.y)) {
               setFxpYValue(fxp.y, "getIIPMetadataCallback_2");
            }
            if(!isNaN(fxp.z)) {
               setFxpZValue(fxp.z, "getIIPMetadataCallback_2");
            }
         }
      }
      
      threeDInfo.defaultFxp.x = threeDInfo.fxp.x;
      threeDInfo.defaultFxp.y = threeDInfo.fxp.y;
      threeDInfo.defaultFxp.z = threeDInfo.fxp.z;
      //console.log("getIIPMetadataCallback_2 threeDInfo.fxp ",threeDInfo.fxp);

      // we also need a scaled fxp for use with x3d feedback
      scaleFxpToVoxelSize();

      getObjects(["Max-size", "Wlz-distance-range"], getIIPMetadataCallback_3, true);
      
      if(_debug) {
         console.log("exit getIIPMetadataCallback_2");
      }
   }; //getIIPMetadataCallback_2

   //---------------------------------------------------------
   /**
    *   All 'getObjects()' calls end up here.
    */
   var getIIPMetadataCallback_3 = function () {

      if(_debug) {
         console.log("enter getIIPMetadataCallback_3");
      }

      if(!modelInitialised) {

	 // set up busyIndicator
	 var src = getInterfaceImageDir() + busyIndicatorSrc;
	 busyIndicator.initialise({targetId:viewerTargetId});
	 busyIndicator.setImageSrc(src);
	 busyIndicator.setDims({w:100, h:30});
	 busyIndicator.setPosition({left:100, top:100});
         updateBusyIndicator({isBusy:true, message:"loading"});

	 if(numberOfTrees > 0) {
	    loadTrees();
	 } else {
	    modelChanges.initial = true;
	    modelChanges.layerNames = true;
	    modelInitialised = true;
	    //console.log("finished initialising model");
	    if(_debug) {
	       printPaths();
	    }
	    initView();
	 }

      }

      if(_debug) {
         console.log("exit getIIPMetadataCallback_3");
      }
   };

   //---------------------------------------------------------
   /*
   * Requests IIP objects from an IIP server.
   *
   * Object names are passed in an array, an Ajax request is sent
   * to the server and corresponding values are passed to the
   * callback function.
   *
   * A loading animation will be displayed if the request takes a
   * while, because Woolz objects may need to be loaded from disk
   * on the server.
   *
   * @author Tom Perry
   *
   * @param objs     An array of object names to load.
   * @param callback The function into which the values
   *                 corresponding to the requested objects
   *                 should be fed.
   * @param async    If true or undefined, the request will be
   *                 asynchronous.  If false, the request will
   *                 be synchronous (i.e. will block)
   */
   var getObjects = function (objects, callback, async) {

      if(_debug) {
         console.log("enter getObjects ",objects);
      }

      var objs = objects;
      if (!objs[0]) {
	 //console.log("getObjects: calling callback immediately");
	 callback();
      }

      var url;
      var dst = (typeof(threeDInfo.dst.cur) === 'undefined') ? 0 : threeDInfo.dst.cur;

      if (isWlz) {
	 var layer = layerData[layerNames[0]];
	 url = webServer + iipServerPath + "?wlz=" +  layer.imageDir + layer.imageName
	 + "&mod=" + threeDInfo.wlzMode
	 + "&fxp=" + threeDInfo.fxp.x + ',' + threeDInfo.fxp.y + ','+ threeDInfo.fxp.z
	 + "&dst=" + dst
	 + "&pit=" + threeDInfo.pitch.cur
	 + "&yaw=" + threeDInfo.yaw.cur
	 + "&rol=" + threeDInfo.roll.cur;
      }

      if(isPyrTiff || isPyrTiff_origNames|| isSinglePyrTiff || isEurexpress) {
         var fullname = getFullImgFilename(layerNames[0]);
	 if(fullname === undefined) {
	    //console.log("getObjects fullname ",fullname);
	    return false;
	 }
	 url = webServer + iipServerPath + "?fif=" + fullname;
	 //console.log("getObjects: url ",url);
      }

      for (var i = 0; i < objs.length; i++) {
	 if (objs[i] == "Resolution-number" && isWlz) {
	    alert("Error: Resolution-number IIP object not supported for Woolz objects.");
	 }
	 if (objs[i] == "Wlz-distance-range" && !isWlz) {
	    alert("Error: Wlz-distance-range IIP object not supported for non-Woolz objects.");
	 }

	 url += "&obj=" + objs[i];

	 // Hack for 'IIP' object
	 if (objs[i] == "IIP") {
	    url += ",1.0";
	 }
	 //console.log("getObjects: url %s",url);
      } // for

      if(_debug) {
         console.log("getObjects: url = ",url);
      }
      var ajaxParams = {
         url:url,
	 method:"POST",
	 callback: function (response) {
	    getObjectsCallback(response, objs, callback);
	 },
	 contentType:"",
	 urlParams:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

      if(_debug) {
         console.log("exit getObjects ");
      }

   }; // getObjects
	
   //---------------------------------------------------------
   var getObjectsCallback = function (response, objs, callback) {

      //_debug = true;
      if(_debug) {
         console.log("enter getObjectsCallback ",objs,response);
      }

      var vals;
      var imgSize;
      var dstRange;
      var bbox;
      var tSize;
      var voxSize;
      var i;

      // get model data via ajax
      //----------------
      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return false;
      }

      //console.log("getObjectsCallback response = ",response);
      //console.log("getObjectsCallback objs = ",objs);

      vals = [objs.length];
      vals[0] = response.split(objs[0]+":")[1];

      // Iteratively chop up the response
      for (i = 0; i < objs.length-1; i++) {
	 if (!vals[i]) {
	    if (response.split("\r")[0] == "Error/7:1 3 FIF") {
	       if(getDataSubType() !== 'kaufman') {
	          alert("Cannot load image data");
	       }
	    } else if (response.split("\r")[0] == "Error/7:2 2 wlz") {
	       alert("Cannot load Woolz data: unsupported by server.");
	    } else {
	       alert("Unexpected response from IIP server:\n"+response);
	    }
	    return;
	 }
	 vals[i+1] = vals[i].split(objs[i+1]+":")[1];
	 vals[i] = vals[i].split(objs[i+1]+":")[0].split("\r")[0];
      }
      //console.log("vals ",vals);

      for (i = 0; i < objs.length; i++) {
	 //console.log("getObjectsCallback: i = ",i);
	 switch(objs[i]) {
	    case "Max-size":
	       //console.log("getObjectsCallback Max-size");
	       imgSize = vals[i].split(" ");
	       fullImgDims.width  = parseInt(imgSize[0] );
	       fullImgDims.height = parseInt(imgSize[1] );
	       //console.log("Max-size: now, width %d, height %d",fullImgDims.width,fullImgDims.height);
	       break;
	    case "Resolution-number":
	       //console.log("getObjectsCallback Resolution-number");
	       maxiipres = parseInt( vals[i] ) - 1;
	       break;
	    case "Wlz-distance-range":
	       dstRange = vals[i].split(" ");
	       //console.log("getObjectsCallback Wlz-distance-range ",dstRange);
	       if(keySections && keySections.length > 0) {
	          threeDInfo.dst.min = 1;
	          threeDInfo.dst.max = Math.round(dstRange[1] - dstRange[0] + 1*1);
	       } else {
	          threeDInfo.dstRange.min = dstRange[0];  // for debugging x3d disc position
	          threeDInfo.dstRange.max = dstRange[1];  // for debugging x3d disc position
	          threeDInfo.dst.min = Math.round(dstRange[0]);
	          threeDInfo.dst.max = Math.round(dstRange[1]);
	       }
	       if(threeDInfo.dst.cur === undefined) {
		  threeDInfo.dst.cur = parseInt(threeDInfo.dst.min + (threeDInfo.dst.max - threeDInfo.dst.min)/2);
	       }
	       if (threeDInfo.dst.cur < threeDInfo.dst.min) {
		  threeDInfo.dst.cur = threeDInfo.dst.min;
	       }
	       if (threeDInfo.dst.cur > threeDInfo.dst.max) {
		  threeDInfo.dst.cur = threeDInfo.dst.max;
	       }
	       //console.log("threeDInfo.dstRange: ",threeDInfo.dstRange);
	       break;
	    case "Wlz-3d-bounding-box":
	       //console.log("getObjectsCallback Wlz-3d-bounding-box");
	       //console.log("i %d, vals[i] %s",i,vals[i]);
	       bbox = vals[i].split(" ");
	       fullWlzObject.z.min = parseInt(bbox[0]);
	       fullWlzObject.z.max = parseInt(bbox[1]);
	       fullWlzObject.y.min = parseInt(bbox[2]);
	       fullWlzObject.y.max = parseInt(bbox[3]);
	       fullWlzObject.x.min = parseInt(bbox[4]);
	       fullWlzObject.x.max = parseInt(bbox[5]);
	       //console.log("Wlz-3d-bounding-box ",fullWlzObject);
	       break;
	    case "Wlz-transformed-3d-bounding-box":
	       //console.log("getObjectsCallback Wlz-transformed-3d-bounding-box");
	       //console.log("i %d, vals[i] %s",i,vals[i]);
	       break;
	    case "Tile-size":
	       //console.log("getObjectsCallback Tile-size");
	       //console.log("i %d, vals[i] %s",i,vals[i]);
	       tSize = vals[i].split(" ");
	       tileSize.width  = parseInt(tSize[0]);
	       tileSize.height = parseInt(tSize[1]);
	       break;
	    case "Wlz-true-voxel-size":
	       //console.log("getObjectsCallback Wlz-true-voxel-size");
	       //console.log("i %d, vals[i] %s",i,vals[i]);
	       if(vals[i]) {
		  voxSize = vals[i].split(" ");
		  threeDInfo.voxel.x  = parseInt(voxSize[0]);
		  threeDInfo.voxel.y  = parseInt(voxSize[1]);
		  threeDInfo.voxel.z  = parseInt(voxSize[2]);
		  // and normalise
		  var smallest = threeDInfo.voxel.z;
		  smallest = (threeDInfo.voxel.x < smallest) ? threeDInfo.voxel.x : smallest;
		  smallest = (threeDInfo.voxel.y < smallest) ? threeDInfo.voxel.y : smallest;
		  threeDInfo.normVoxel.x  = parseFloat(voxelSize.x / smallest);
		  threeDInfo.normVoxel.y  = parseFloat(voxelSize.y / smallest);
		  threeDInfo.normVoxel.z  = parseFloat(voxelSize.z / smallest);
		  console.log("threeDInfo.voxel: ",threeDInfo.voxel);
	       }
	       break;
	 } // switch
      } // for

      if(callback) {
	 callback();
      }

      if(_debug) {
         console.log("exit getObjectsCallback ",vals);
      }
      //_debug = false;

   }; // getObjectsCallback

   //---------------------------------------------------------
   //  The fixed point for x3d feedback needs to be scaled by
   //  the (normalised) voxel sizes.
   //---------------------------------------------------------
   var scaleFxpToVoxelSize = function () {

      var voxel;
      var fxp;

      voxel = threeDInfo.normVoxel;
      fxp = threeDInfo.fxp;

      if(voxel === undefined) {
         return false;
      }

      threeDInfo.scaledFxp.x = parseInt(threeDInfo.fxp.x * voxel.x);
      threeDInfo.scaledFxp.y = parseInt(threeDInfo.fxp.y * voxel.y);
      threeDInfo.scaledFxp.z = parseInt(threeDInfo.fxp.z * voxel.z);

   }; // scaleFxpToVoxelSize


   // It might take a long time to load very big trees and we have to
   // make sure they are loaded before initialising tiledImageView.
   // Because this uses ajax we do it at the end of model initialisation.
   //---------------------------------------------------------
   var loadTrees = function () {

      var layer;
      var layerName;
      var len = layerNames.length;
      var i;

      for(i=0; i<len; i++) {
	 layerName = layerNames[i];
	 layer = layerData[layerName];
         //console.log("loadTrees: layer ",layer);
	 if(layer.treeStructure !== undefined) {
	    // treeData is loaded from loadTreeStructureCallback
	    loadTreeStructure(layerName);
	 }
      }

   }

   //---------------------------------------------------------
   var initView = function () {
      //emouseatlas.emap.tiledImageView.initialise(emouseatlas.emap.tiledImageModel, emouseatlas.emap.tiledImageQuery, emouseatlas.emap.tiledImagePointClick);
      emouseatlas.emap.tiledImageView.initialise();
   }

   //---------------------------------------------------------
   var initQuery = function () {
      if(emouseatlas.emap.tiledImageQuery) {
         //console.log("tiledImageModel calling emouseatlas.emap.tiledImageQuery.initialise");
	 //emouseatlas.emap.tiledImageQuery.initialise(emouseatlas.emap.tiledImageModel, emouseatlas.emap.tiledImageView);
      }
   }

   //---------------------------------------------------------
   /**
    *   Informs registered observers of a change to the model.
    */
   var notify = function (from) {

      var i;
      //console.log("model: notify from %s",from);
      //printModelChanges();

      for (i = 0; i < registry.length; i++) {
	 //console.log("notify: registry[%s] = %s",i,registry[i]);
	 if(registry[i].modelUpdate) {
            registry[i].modelUpdate(modelChanges);
	 }
      }
      resetModelChanges();
   }; // notify

   //---------------------------------------------------------
   /**
    *   Prints the state of observable changes to the model.
    */
   var printModelChanges = function() {
      if(modelChanges.initial) console.log("modelChanges.initial ",modelChanges.initial);
      if(modelChanges.initialState) console.log("modelChanges.initialState ",modelChanges.initialState);
      if(modelChanges.layerNames) console.log("modelChanges.layerNames ",modelChanges.layerNames);
      if(modelChanges.locator) console.log("modelChanges.locator ",modelChanges.locator);
      if(modelChanges.dst) console.log("modelChanges.dst ",modelChanges.dst);
      if(modelChanges.distanceRange) console.log("modelChanges.distanceRange ",modelChanges.distanceRange);
      if(modelChanges.boundingBox) console.log("modelChanges.boundingBox ",modelChanges.boundingBox);
      if(modelChanges.fxp) console.log("modelChanges.fxp ",modelChanges.fxp);
      if(modelChanges.setSection) console.log("modelChanges.setSection ",modelChanges.setSection);
      /*
      if(modelChanges.addQuerySection) console.log("modelChanges.addQuerySection ",modelChanges.addQuerySection);
      if(modelChanges.removeQuerySection) console.log("modelChanges.removeQuerySection ",modelChanges.removeQuerySection);
      if(modelChanges.saveQuerySection) console.log("modelChanges.saveQuerySection ",modelChanges.saveQuerySection);
      if(modelChanges.changeQuerySection) console.log("modelChanges.changeQuerySection ",modelChanges.changeQuerySection);
      */
      if(modelChanges.sectionChanged) console.log("modelChanges.sectionChanged ",modelChanges.sectionChanged);
      console.log("++++++++++++++++++++++++++++++++++++++++++++");
   };

   //---------------------------------------------------------
   /**
    *   Resets the list of observable changes to the model.
    */
   var resetModelChanges = function() {
      modelChanges.initial =  false;
      modelChanges.initialState =  false;
      modelChanges.layerNames =  false;
      modelChanges.locator =  false;
      modelChanges.dst =  false;
      modelChanges.distanceRange =  false;
      modelChanges.boundingBox =  false;
      modelChanges.fxp =  false;
      modelChanges.setSection =  false;
      /*
      modelChanges.addQuerySection =  false;
      modelChanges.removeQuerySection =  false;
      modelChanges.saveQuerySection =  false;
      modelChanges.changeQuerySection =  false;
      */
      modelChanges.sectionChanged =  false;
   };

   //---------------------------------------------------------
   /**
   * Converts a Woolz scale value to an IIP JTL resolution level
   *
   * @author Tom Perry
   *
   * @param floor If true, the integer part of the resulting
   * resolution value will be returned.  Otherwise, it will be
   * rounded to the nearest integer.
   */
   var scl2res = function(scl, floor) {
      var tmp = maxiipres + Math.log(scl) / Math.log(2);
      if (floor) {
	 return Math.floor(tmp);
      } else {
	 return Math.round(tmp);
      }
   };

   //---------------------------------------------------------
   /**
   * Converts an IIP JTL resolution level to a Woolz scale value
   *
   * @author Tom Perry
   */
   var res2scl = function(res) {
      return Math.pow(2,res - maxiipres);
   };

   //---------------------------------------------------------
   /**
   *  works out where the pyramidal tiff images are.
   *
   */
   var getAssayPath = function() {

      var path = "";

      if(isEurexpress) {
	 var assaynum = assayID.substring(assayID.lastIndexOf("_")+1);
	 //console.log("getEurexpressAssayPath: assaynum %s",assaynum);
	 var dirnum = parseInt(assaynum / 100);  // we want mod only
	 path = dirnum + '/' + assayID + '/';
	 //console.log("getEurexpressAssayPath %s",path);
      }

      //console.log("getAssayPath ",path);
      return path;
      
   };

   //---------------------------------------------------------
   var printPaths = function() {
      if(typeof(iipServerPath) !== 'undefined') {
         console.log("iipServerPath: %s", iipServerPath);
      }
      if(typeof(webServer) !== 'undefined') {
         console.log("webServer: %s", webServer);
      }
      if(typeof(metadataRoot) !== 'undefined') {
         console.log("metadataRoot: %s", metadataRoot);
      }
      if(typeof(fullDataPath) !== 'undefined') {
         console.log("fullDataPath: %s", fullDataPath);
      }
      if(typeof(interfaceImageDir) !== 'undefined') {
         console.log("interfaceImageDir: %s", interfaceImageDir);
      }
      if(typeof(layerData) !== 'undefined') {
	 var num = layerNames.length;
	 var i;
	 for(i=0; i<num; i++) {
	    console.log("layer %s (%s)",i,layerNames[i]);
	 }
      }
      if(typeof(zsel) !== 'undefined') {
	 console.log("zsel %s",zsel.fullname);
      }
   };

   //---------------------------------------------------------
   var setFxpXValue = function(newVal, from)  {

      var val;
      var ret = 0;

      val = (1 * newVal);

      //console.log("enter setFxpXValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      if (newVal !== undefined && threeDInfo.fxp.x !== newVal) {
         threeDInfo.fxp.x = val; 
         ret = 1;
      }
      //console.log("exit setFxpXValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      return ret;
   };

   //---------------------------------------------------------
   var setFxpYValue = function(newVal, from)  {

      var val;
      var ret = 0;

      val = (1 * newVal);

      //console.log("enter setFxpYValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      if (newVal !== undefined && threeDInfo.fxp.y !== newVal) {
         threeDInfo.fxp.y = val; 
         ret = 1;
      }
      //console.log("exit setFxpYValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      return ret;
   };

   //---------------------------------------------------------
   var setFxpZValue = function(newVal, from)  {

      var val;
      var ret = 0;

      val = (1 * newVal);

      //console.log("enter setFxpZValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      if (newVal !== undefined && threeDInfo.fxp.z !== newVal) {
         threeDInfo.fxp.z = val; 
         ret = 1;
      }
      //console.log("exit setFxpZValue from %s, threeDInfo.fxp ",from,threeDInfo.fxp);
      return ret;
   };

   //---------------------------------------------------------
   var setPitchValue = function(newVal, from)  {

      var val;
      var ret = 0;

      //console.log("enter setPitchValue from %s, threeDInfo.pitch ",from,threeDInfo.pitch);
      if (newVal !== undefined && threeDInfo.pitch.cur !== newVal) {
	 val = (1 * newVal);
	 if (val > threeDInfo.pitch.max) {
	    threeDInfo.pitch.cur = threeDInfo.pitch.max;
	 } else if (val < threeDInfo.pitch.min) {
	    threeDInfo.pitch.cur = threeDInfo.pitch.min;
	 } else {
	    threeDInfo.pitch.cur = val;
	 }
	 ret = 1;
      }
      //console.log("exit setPitchValue from %s, threeDInfo.pitch ",from,threeDInfo.pitch);
      return ret;
   };

   //---------------------------------------------------------
   var setYawValue = function(newVal, from)  {

      var val;
      var ret = 0;

      //console.log("enter setYawValue from %s, threeDInfo.yaw ",from,threeDInfo.yaw);
      if (newVal !== undefined && threeDInfo.yaw.cur !== newVal) {
	 val = (1 * newVal);
	 if (val > threeDInfo.yaw.max) {
	    threeDInfo.yaw.cur = threeDInfo.yaw.max;
	 } else if (val < threeDInfo.yaw.min) {
	    threeDInfo.yaw.cur = threeDInfo.yaw.min;
	 } else {
	    threeDInfo.yaw.cur = val;
	 }
	 ret = 1;
      }
      //console.log("exit setYawValue from %s, threeDInfo.yaw ",from,threeDInfo.yaw);
      return ret;
   };

   //---------------------------------------------------------
   var setRollValue = function(newVal, from)  {

      var val;
      var ret = 0;

      //console.log("enter setRollValue from %s, threeDInfo.roll ",from,threeDInfo.roll);
      if (newVal !== undefined && threeDInfo.roll.cur !== newVal) {
	 val = (1 * newVal);
	 if (val > threeDInfo.roll.max) {
	    threeDInfo.roll.cur = threeDInfo.roll.max;
	 } else if (val < threeDInfo.roll.min) {
	    threeDInfo.roll.cur = threeDInfo.roll.min;
	 } else {
	    threeDInfo.roll.cur = val;
	 }
	 ret = 1;
      }
      //console.log("exit setRollValue from %s, threeDInfo.roll ",from,threeDInfo.roll);
      return ret;
   };

   //---------------------------------------------------------
   var setDstValue = function(newVal, from)  {

      var val;
      var ret = 0;

      //console.log("enter setDstValue from %s, threeDInfo.dst ",from,threeDInfo.dst);
      if (newVal !== undefined && threeDInfo.dst.cur !== newVal) {
	 val = Math.floor(1 * newVal);
	 if (val > threeDInfo.dst.max) {
	    threeDInfo.dst.cur = threeDInfo.dst.max;
	 } else if (val < threeDInfo.dst.min) {
	    threeDInfo.dst.cur = threeDInfo.dst.min;
	 } else {
	    threeDInfo.dst.cur = val;
	 }
	 ret = 1;
      }
      //console.log("exit setDstValue from %s, threeDInfo.dst ",from,threeDInfo.dst);
      return ret;
   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {
      if(_debug) {
         console.log("enter model.initialise");
      }

      projectDivId = "projectDiv";

      // if urlSpecifiedSection is defined in url string it will override initialState.distance from tiledImageModelData.jso.
      if(params.urlSpecifiedSection !== undefined) {
         if(params.urlSpecifiedSection.length === 0) {
            urlSpecified.section = undefined;
         } else {
            // we must convert the string to an integer or sections 09, 08 won't load ???
            urlSpecified.section = 1 * params.urlSpecifiedSection;
            //console.log("urlSpecified.section ",urlSpecified.section);
         }
      }

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if(typeof(params.assay) !== 'undefined') {
	assayID = (typeof(params.assay) === 'undefined') ? "euxassay_000001" : params.assay;
      }
      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data

      // For kaufman point & click entry: start
      if(typeof(params.editor) !== 'undefined') {
         //console.log("model: params.editor -->%s<--",params.editor);
	 if(params.editor === '1') {
	    EDITOR = true;
	 }
         if(_debug) console.log("model: params.editor -->%s<--",params.editor);
	 urlSpecified.editor = params.editor;
      }

      if(typeof(params.subplate) !== 'undefined') {
         if(_debug) console.log("model: params.subplate -->%s<--",params.subplate);
	 urlSpecified.subplate = params.subplate;
      }

      if(typeof(params.image) !== 'undefined') {
         if(_debug) console.log("model: params.image -->%s<--",params.image);
	 urlSpecified.image = params.image;
      }

      if(typeof(params.comps) !== 'undefined') {
         if(_debug) console.log("model: params.comps -->%s<--",params.comps);
	 urlSpecified.comps = params.comps;
      }

      // For kaufman point & click entry: end

      if(_debug) console.log("urlSpecified ",urlSpecified);

      initModel(params.modelDataUrl);

      if(_debug) {
         console.log("exit model.initialise");
      }
   };

   //---------------------------------------------------------
   var initialiseDynamic = function (params) {
      if(_debug) {
         console.log("enter model.initialiseDynamic");
      }

      // if url has dynamic information, process such information
      var name;
      if (params.greyImg !== undefined)
	greyImg = params.greyImg;
      if (params.expressionImg !== undefined)
	expressionImg = params.expressionImg;
      if (params.expressionSection !== undefined) {
	// params.expressionSection is like (name, x, y, z, theta, phi, dst);(name, x, y, z, theta, phi, dst) ...
	var token = params.expressionSection.split(";");
	var x, y, z, theta, phi, dst;
	var index = 0;
	var item, j, worker;

	for (var i = 0; i < token.length; i++) {
	  j = token[i].indexOf("(");
	  if (-1 != j) {
	    item = token[i].substring(j + 1);
	    token[i] = item;
	  }
	  j = token[i].indexOf(")");
	  if (-1 != j) {
	    item = token[i].substring(0, j);
	    token[i] = item;
	  }
	  item = token[i].split(",");
	  if (7 != item.length)
	    continue;
	  name = item[0].trim();
	  if (name == "")
	    name = "section"+i;
	  x = parseFloat(item[1].trim());
	  if (x === undefined)
	    continue;
	  y = parseFloat(item[2].trim());
	  if (y === undefined)
	    continue;
	  z = parseFloat(item[3].trim());
	  if (z === undefined)
	    continue;
	  theta = parseFloat(item[4].trim());
	  if (theta === undefined)
	    continue;
	  phi = parseFloat(item[5].trim());
	  if (phi === undefined)
	    continue;
	  dst = parseFloat(item[6].trim());
	  if (dst === undefined)
	    continue;

	  expressionSectionName[index] = name;
	  expressionSection[name] = {x:x, y:y, z:z, theta:theta, phi:phi, dst:dst};

	  index++;
	}
      }
      if (_debug) {
	console.log("greyImg = "+greyImg+" expressionImg = "+expressionImg+" number of sections = "+expressionSectionName.length);
	if (0 < expressionSectionName.length) {
	  for (var k = 0; k < expressionSectionName.length; k++) {
	    name = expressionSectionName[k];
	    console.log("name = "+name+" x = "+expressionSection[name].x+"  y = "+expressionSection[name].y+"  z = "+expressionSection[name].z+"  theta = "+expressionSection[name].theta+"  phi = "+expressionSection[name].phi+"  dst = "+expressionSection[name].dst);
	  }
	}
      }

      initModel(params.modelDataUrl);

      if(_debug) {
         console.log("exit model.initialiseDynamic");
      }
   };

   //---------------------------------------------------------
   var initialiseTiff = function (params) {
      if(_debug) {
         console.log("enter model.initialiseTiff");
      }

      var name;
      if (params.greyImg !== undefined)
	greyImg = params.greyImg;

      initModel4Tiff(params.modelDataUrl);

      if(_debug) {
         console.log("exit model.initialiseTiff");
      }
   };

   //---------------------------------------------------------
   var register = function (observer) {
      //console.log("model: register observer ",observer.getName());
      registry.push(observer);
   };

   //---------------------------------------------------------
   // getters and setters
   //---------------------------------------------------------
   //---------------------------------------------------------
   var getDataImageDir = function () {
      return dataImageDir;
   };

   //---------------------------------------------------------
   var getInterfaceImageDir = function () {
      return interfaceImageDir;
   };

   //---------------------------------------------------------
   var getLayerNames = function () {
      return layerNames;
   };

   //---------------------------------------------------------
   var getLayerData = function () {
      //console.log("model getLayerData ",layerData);
      return layerData;
   };

   //---------------------------------------------------------
   var isEditor = function () {
      return EDITOR;
   };

   //---------------------------------------------------------
   var getUrlSpecifiedParams = function () {
      return urlSpecified;
   };

   //---------------------------------------------------------
   var getDataSubType = function () {
      return dataSubType;
   };

   //---------------------------------------------------------
   var getName = function () {
      return 'tiledImageModel';
   };

//=====================================================================================

   //---------------------------------------------------------
   var getIndexData = function (layerName) {
      //console.log("model getIndexData ",layerName);
      var indexData = {};
      var layer = layerData[layerName];
      if(layer === undefined) {
         return undefined;
      }
      var treeData = layer.treeData;
      var node;
      var domainData;
      var len;
      var nodeId;
      var domainId;
      var colour = [];
      var selected = false;

      if(typeof(treeData) === 'undefined') {
	 //console.log("model getIndexData treeData ",treeData);
	 return undefined;
      }
      //console.log("model getIndexData treeData ",treeData);
      len = treeData.length;
      for(i=0; i<len; i++) {
         node = treeData[i];
         nodeId = node.nodeId;
	 name = node.name;
	 domainId = node.domainData.domainId;
	 if(domainId === undefined) {
	    //console.log("ignoring ",name);
	    continue;
	 }
	 colour = node.domainData.domainColour;
	 selected = node.domainData.domainSelected;
	 if(indexData[domainId] === undefined) {
	    indexData[domainId] = {domainId:domainId, name:name, colour:colour, nodeId:nodeId, selected:selected};
	 }
	 domainId = undefined;
      }

      return indexData;
   };

   //---------------------------------------------------------
   var getZSelectorInfo = function () {
      //console.log("getZSelectorInfo ",zsel);
      return zsel;
   };

   //---------------------------------------------------------
   var getWebServer = function () {
      return webServer;
   };

   //---------------------------------------------------------
   var getMetadataRoot = function () {
      return metadataRoot;
   };

   //---------------------------------------------------------
   var getIIPServer = function () {
      return webServer + iipServerPath;
   };
   //---------------------------------------------------------
   var getImgQuality = function () {
      return qlt;
   };

   //---------------------------------------------------------
   var setInitialOrientation = function () {
      //console.log("enter model.setInitialOrientation");
      if(!isWlz) {
         setInitialOrientationCallback();
	 return false;
      }
      if(initialState.pitch !== undefined) {
	setPitchValue(initialState.pitch, "setInitialOrientation");
      }
      if(initialState.yaw !== undefined) {
	setYawValue(initialState.yaw, "setInitialOrientation");
      }
      if(initialState.roll !== undefined) {
	setRollValue(initialState.roll, "setInitialOrientation");
      }
      getObjects(["Max-size", "Wlz-distance-range"],setInitialOrientationCallback,true);
      //console.log("exit model.setInitialOrientation");
   };
   //---------------------------------------------------------
   var setInitialOrientationCallback = function () {
      //console.log("enter model.setInitialOrientationCallback");
      setCurrentSection("setInitialOrientationCallback");
      resetModelChanges();
      modelChanges.initialState = true;
      notify("setInitialOrientationCallback");
      //console.log("exit model.setInitialOrientationCallback");
   };

   //---------------------------------------------------------
   // Called when rotation controls arrows are clicked
   //---------------------------------------------------------
   var setOrientation = function (newPitch, newYaw, newRoll) {
     //console.log("setOrientation");
     var ret1 = setPitchValue(newPitch, "setOrientation");
     var ret2 = setYawValue(newYaw, "setOrientation");
     var ret3 = setRollValue(newRoll, "setOrientation");

     if (ret1 || ret2 || ret3) {
        getObjects(["Max-size", "Wlz-distance-range"],setOrientationCallback,true);
     }
   };
   //---------------------------------------------------------
   var setOrientationCallback = function () {
      //console.log("setOrientationCallback");
      setCurrentSection("setOrientationCallback");
      resetModelChanges();
      modelChanges.locator = true;
      modelChanges.distanceRange = true;
      modelChanges.sectionChanged = true;
      notify("setOrientationCallback");
   };

   //---------------------------------------------------------
   // Called when rotation controls slider is moved or user
   // clicks in the slider channel
   //---------------------------------------------------------
   var modifyOrientation = function (newPitch, newYaw, newRoll) {
     //console.log("modifyOrientation");
     var ret1 = setPitchValue(newPitch, "modifyOrientation");
     var ret2 = setYawValue(newYaw, "modifyOrientation");
     var ret3 = setRollValue(newRoll, "modifyOrientation");

     if (ret1 || ret2 || ret3) {
        getObjects(["Max-size", "Wlz-distance-range"],modifyOrientationCallback,true);
     }
   };

   //---------------------------------------------------------
   var modifyOrientationCallback = function () {
      //console.log("modifyOrientationCallback");
      setCurrentSection("modifyOrientationCallback");
      resetModelChanges();
      modelChanges.locator = true;
      modelChanges.sectionChanged = true;
      notify("modifyOrientationCallback");
   };

   //---------------------------------------------------------
   var getViewAngles = function () {
      var ret = ({transverse: {pitch:transverseView.pitch, yaw:transverseView.yaw, roll:transverseView.roll},
                  sagittal: {pitch:sagittalView.pitch, yaw:sagittalView.yaw, roll:sagittalView.roll},
                  coronal: {pitch:coronalView.pitch, yaw:coronalView.yaw, roll:coronalView.roll}});

      //console.log("getViewAngles ",ret);
      return ret;
   };

   //---------------------------------------------------------
   var getViewLabels = function () {
      var trans = (transverseView.label) ? transverseView.label : "Trans";
      var sagit = (sagittalView.label) ? sagittalView.label : "Sagit";
      var coron = (coronalView.label) ? coronalView.label : "Front";

      var ret = ({
             transverse: trans,
             sagittal: sagit,
             coronal: coron });

      //console.log("getViewLabels ",ret);
      return ret;
   };

   //---------------------------------------------------------
   // When the fixed point is changed, the distance value must be set to 0.
   // If it is set back to the default fixed point, the actual distance will change
   // and the image must be updated.
   //---------------------------------------------------------
   var setFixedPoint = function (val) {
      if(isWlz) {
         var x = Math.round(val.x);
         var y = Math.round(val.y);
         var z = Math.round(val.z);
	 //console.log("setFixedPoint %d, %d, %d",x,y,z);
	 var ret1 = setFxpXValue(x, "setFixedPoint");
	 var ret2 = setFxpYValue(y, "setFixedPoint");
	 var ret3 = setFxpZValue(z, "setFixedPoint");

	 // fixed point change will affect distance range
	 // we also need to update the scaled fxp for x3d feedback
	 if (ret1||ret2||ret3) {
	   modelChanges.distanceRange = true;  // what is the point of doing this when modelChanges are reset in the callback?
	   scaleFxpToVoxelSize();
	 }

	 var A = threeDInfo.defaultFxp;
	 if(A.x === x && A.y === y && A.z === z) {
	    setDistance(0);
	 } else {
	    setDstValue(0, "setFixedPoint");
	 }
      } else {
         return false;
      }
      modelChanges.fxp = true;  // what is the point of doing this when modelChanges are reset in the callback?
      getObjects(["Max-size", "Wlz-distance-range"],setFixedPointCallback,true);
   };

   //---------------------------------------------------------
   var setFixedPointCallback = function () {
      //console.log("setFixedPointCallback");
      resetModelChanges();
      modelChanges.distanceRange = true;
      notify("setFixedPointCallback");
   };

   //---------------------------------------------------------
   var setInitialDistance = function () {
      //console.log("setInitialDistance (wlz) max %d, min %d, cur %d",threeDInfo.dst.max,threeDInfo.dst.min,threeDInfo.dst.cur);
      var val = initialState.distance;
      if(isWlz) {
         setDstValue(val, "setInitialDistance");
	 getObjArr = ["Max-size"];
      } else {
	 dst.cur = (val > dst.max) ? dst.max : val;
	 dst.cur = (val < dst.min) ? dst.min : val;
	 getObjArr = ["Max-size", "Resolution-number"];
      }
      getObjects(getObjArr, setInitialDistanceCallback, true);
      //console.log("exit model.setInitialDistance");
   };

   //---------------------------------------------------------
   var setInitialDistanceCallback = function () {
      //console.log("enter model.setInitialDistanceCallback");
      setInitialOrientation();
      //console.log("exit model.setInitialDistanceCallback");
   };

   //---------------------------------------------------------
   // called when distance is changed using arrow buttons
   // and on mouseup after dragging slider
   //---------------------------------------------------------
   var setDistance = function (val) {
      //console.log("setDistance");
      var getObjArr = [];
      if(isWlz) {
	 setDstValue(val, "setDistance");
	 getObjArr = ["Max-size"];
      } else {
	 var valf = Math.floor(val);
	 dst.cur = (valf >= dst.max) ? dst.max : valf;
	 dst.cur = (dst.cur <= dst.min) ? dst.min : dst.cur;
	 getObjArr = ["Max-size", "Resolution-number"];
      }
      getObjects(getObjArr, setDistanceCallback, true);
   };

   //---------------------------------------------------------
   var setDistanceCallback = function () {
      //console.log("setDistanceCallback");
      setCurrentSection("setDistanceCallback");
      resetModelChanges();
      modelChanges.locator = true;
      modelChanges.dst = true;
      modelChanges.sectionChanged = true;
      notify("setDistanceCallback");
   };

   //---------------------------------------------------------
   // called when distance is changed by dragging the slider
   // or clicking on the slider bar
   //---------------------------------------------------------
   var modifyDistance = function (val) {
      //console.log("modifyDistance");
      var getObjArr = [];
      if(isWlz) {
	 setDstValue(val, "modifyDistance");
	 getObjArr = ["Max-size"];
      } else {
	 var valf = Math.floor(val);
	 dst.cur = (valf >= dst.max) ? dst.max : valf;
	 dst.cur = (dst.cur <= dst.min) ? dst.min : dst.cur;
	 getObjArr = ["Max-size", "Resolution-number"];
      }
      getObjects(getObjArr, modifyDistanceCallback, true);
   };

   //---------------------------------------------------------
   var modifyDistanceCallback = function () {
      //console.log("modifyDistanceCallback");
      setCurrentSection("modifyDistanceCallback");
      resetModelChanges();
      modelChanges.locator = true;
      modelChanges.sectionChanged = true;
      notify("modifyDistanceCallback");
   };

   //---------------------------------------------------------
   var setSection = function(newX, newY, newZ, newPitch, newYaw, newRoll, newDst) {
     //console.log("setSection");
     var ret1 = setFxpXValue(newX, "setSection");
     var ret2 = setFxpYValue(newY, "setSection");
     var ret3 = setFxpZValue(newZ, "setSection");
     var ret4 = setPitchValue(newPitch, "setSection");
     var ret5 = setYawValue(newYaw, "setSection");
     var ret6 = setRollValue(newRoll, "setSection");
     var ret7 = setDstValue(newDst, "setSection");

     // this is needed if we use x3d feedback
     scaleFxpToVoxelSize();

     if (ret1||ret2||ret3||ret4||ret5||ret6||ret7);
     getObjects(["Max-size", "Wlz-distance-range"],setSectionCallback,true);
   };

   //---------------------------------------------------------
   var setSectionCallback = function () {
      //console.log("setSectionCallback");
      setCurrentSection("setSectionCallback");
      resetModelChanges();
      modelChanges.setSection = true;
      notify("setSectionCallback");
   };

   //---------------------------------------------------------
   var getDistance = function () {
      if(isWlz) {
	 return threeDInfo.dst;
      } else {
	 return dst;
      }
   };

   //---------------------------------------------------------
   var getScaleMaxMin = function () {
      return scale;
   };

   //---------------------------------------------------------
   var getFullDepth = function () {
      return fullDepth;
   };

   //---------------------------------------------------------
   var getRegionOfInterest = function () {
      return roi;
   };

   //---------------------------------------------------------
   var getMaxIIPResolution = function () {
      return maxiipres;
   };
   //---------------------------------------------------------
   var getTileSize = function () {
      return tileSize;
   };
   //---------------------------------------------------------
   var getFullImgDims = function () {
      return fullImgDims;
   };

   //---------------------------------------------------------
   var setBoundingBox = function () {
      getObjects(["Wlz-3d-bounding-box"], setBoundingBoxCallback, true);
   };
   //---------------------------------------------------------
   var setBoundingBoxCallback = function () {
      setFixedPoint();
   };
   //---------------------------------------------------------
   var getBoundingBox = function () {
      return fullWlzObject;
   };

   //---------------------------------------------------------
   //  bounding box of the transformed section (2D)
   //---------------------------------------------------------
   var getTransformedBoundingBox = function (transformedBoundingBoxUrl) {

      var ajaxParams = {
         url:transformedBoundingBoxUrl,
	 method:"POST",
	 callback: function (response) {
	    getTransformedBoundingBoxCallback(response);
	 },
	 contentType:"",
	 urlParams:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);
   };
   //---------------------------------------------------------
   var getTransformedBoundingBoxCallback = function (response) {

      //console.log("getTransformedBoundingBoxCallback");

      // get model data via ajax
      //----------------
      response = util.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return false;
      }

      //console.log("getTransformedBoundingBoxCallback response = ",response);
   };

   //---------------------------------------------------------
   // this is for pyramidal tiff stacks (eg Eurexpress)
   //---------------------------------------------------------
   var getFullImgFilename = function (layername) {

      if(_debug) {
         console.log("enter getFullImgFilename for '%s' layer",layername);
      }

      var imgFilename;
      var fullImgFilename;
      var layer = layerData[layername];

      if(typeof(dst.cur) === 'undefined') {
	 var cur = (typeof(initialState.distance) !== 'undefined') ? initialState.distance : dst.min;
	 dst = {max:dst.max, min:dst.min, cur:cur};
      }

      if(isEurexpress) {
	 var assayPath = getAssayPath();
	 ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 if (dst.cur > 0) 
	   imgFilename = dataImgPaths[Math.round(dst.cur - 1)];
	 else
	   imgFilename = dataImgPaths[0];

	 if (imgFilename === undefined || imgFilename === 'undefined') {
	   for (var i = 0; i < 40; i++) {
	     imgFilename = dataImgPaths[i];
	     if (imgFilename !== undefined && imgFilename !== 'undefined') {
	       setDistance(i);
	       break;
	     }
	   }
	 }
	 ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 fullImgFilename = layer.imageDir + assayPath + dataImageDir + imgFilename + imageExtension;
      } else if(isPyrTiff) {
         imgFilename = layer.imageName;
	 var slice = "section" + dst.cur + "/";
	 fullImgFilename = layer.imageDir + slice + imgFilename;
      } else if(isPyrTiff_origNames) {
	 var indx = Math.round(dst.cur);
	 //console.log("indx %d ",indx,dataImgPaths);
	 imgFilename = dataImgPaths[indx];
	 if(imgFilename === undefined) {
	    fullImgFilename = undefined;
	    return undefined;
	 }

	 fullImgFilename = layer.imageDir + imgFilename + imageExtension;
      } else if(isSinglePyrTiff) {
         imgFilename = layer.imageName;
	 fullImgFilename = layer.imageDir + imgFilename;
      }

      if(_debug) {
         console.log("exit getFullImgFilename %s",fullImgFilename);
      }
      return fullImgFilename;
   };

   //---------------------------------------------------------
   var isWlzData = function() {
      return isWlz;
   };
   //---------------------------------------------------------
   var isPyrTiffData = function() {
      return isPyrTiff;
   };
   //---------------------------------------------------------
   var isEurexpressData = function() {
      return isEurexpress;
   };

   //---------------------------------------------------------
   var getViewerTargetId = function() {
      //console.log("model.getViewerTargetId:");
      return viewerTargetId;
   };

   //---------------------------------------------------------
   var getThreeDInfo = function() {
      return threeDInfo;
   };

   //---------------------------------------------------------
   var getX3dInfo = function() {
      //console.log("model.getX3dInfo: ",X3dInfo);
      return x3dInfo;
   };

   //---------------------------------------------------------
   var setCurrentSection = function(from) {

      //console.log("setCurrentSection: %s",from);

      if(threeDInfo === undefined || threeDInfo === null) {
         return undefined;
      }

      currentSection = {
        mod: threeDInfo.wlzMode, 
        fxp: threeDInfo.fxp, 
        dst: threeDInfo.dst.cur, 
        pit: threeDInfo.pitch.cur, 
        yaw: threeDInfo.yaw.cur, 
        rol: threeDInfo.roll.cur 
      }
      //console.log("setCurrentSection: ",currentSection);

   };

   //---------------------------------------------------------
   var getCurrentSection = function() {
      return currentSection;
   };

   //---------------------------------------------------------
   var getFullExpressionLevelKeyName = function () {
      return interfaceImageDir + expressionLevelKey;
   };

   //---------------------------------------------------------
   var updateBusyIndicator = function (data) {
      busyIndicator.update(data);
   };

   //---------------------------------------------------------
   var getInfoDetails = function () {
      return infoDetails;
   };

   //---------------------------------------------------------
   var getToolsMetadataUrl = function () {

      var ret;
      var name;

      name = metadataRoot + toolsMetadataFilename;
      //console.log("name %s",name);

      ret = emouseatlas.emap.utilities.constructURL(webServer, name);

      return ret;
   };

   //---------------------------------------------------------
   var getStackMetadataUrl = function () {

      var ret;
      var name;

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (isEurexpress) {
         ret = metadataRoot + "linksToFullSizeImages_original/"+ getAssayPath() + stackMetadataFilename;
      } else {
         ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
         name = metadataRoot + stackMetadataFilename;
         ret = emouseatlas.emap.utilities.constructURL(webServer, name);
      }

      //console.log(ret);
      return ret;
   };

   //---------------------------------------------------------
   var isArrayStartsFrom0 = function () {
      return arrayStartsFrom0;
   };

   //---------------------------------------------------------
   // Don't call it the same name as the boolean
   var modelReady = function () {
      return modelInitialised;
   };

   //---------------------------------------------------------
   // Populates a tree node with data
   var getTreeNodeData = function (layerName, structureTreeNode) {

      var nodeId;
      var children;
      var treeNodeWithData;
      var open;
      var defArr;
      var data;
      var nodeData;
      var nodeName;
      var domainData;
      var domainId;
      var domainColour;
      var domainSelected;
      var rgb;
      var rgba;
      var nodeState;
      var extId;
      var len;
      var i;
      var child;
      var childNode;

      //console.log("getTreeNodeData: structureTreeNode ",structureTreeNode);
      nodeId = structureTreeNode.nodeId;
      //console.log("getTreeNodeData: nodeId ",nodeId);
      children = (structureTreeNode.children === undefined) ? undefined : structureTreeNode.children;
      //console.log("getTreeNodeData: children ",children);

      treeNodeWithData = {};
      open;
      defArr = [undelineatedRGBA.r, undelineatedRGBA.g, undelineatedRGBA.b, undelineatedRGBA.a];

      data = layerData[layerName].treeData;
      nodeData = data[nodeId];
      if(nodeData !== undefined) {
	 nodeName = nodeData.name;
	 domainData = nodeData.domainData;
	 if(domainData !== undefined) {
	    domainId = (typeof(domainData.domainId) === 'undefined') ? undefined : domainData.domainId;
	    domainColour = (typeof(domainData.domainColour) === 'undefined') ? undefined : domainData.domainColour;
	    domainSelected = (domainData.domainSelected === 'true' || domainData.domainSelected === true) ? true : false;
	    rgb = (domainData.domainColour === undefined) ? [0,0,0] : [domainColour[0],domainColour[1],domainColour[2]];
	    rgba = (domainData.domainColour === undefined) ? defArr : [domainColour[0],domainColour[1],domainColour[2],domainColour[3]];
	 }
	 nodeState = nodeData.nodeState;
	 if(nodeState !== undefined) {
	    open = (nodeState.open === 'true' || nodeState.open === true) ? true : false;
	 }
	 extId = (typeof(nodeData.extId) === 'undefined') ? undefined : nodeData.extId;

	 //treeNodeWithData.property = {"name": nodeName, "color": rgb, 'fbId':extId, 'id':nodeId, 'domainId':domainId};
	 treeNodeWithData.property = {"name": nodeName, "color": rgba, 'fbId':extId, 'id':nodeId, 'domainId':domainId};
	 treeNodeWithData.state = {"open": open, "checked": domainSelected};
	 treeNodeWithData.children = [];
	 //console.log("getTreeNodeData: treeNodeWithData ",treeNodeWithData);
	 //console.log("getTreeNodeData: treeNodeWithData.property ",treeNodeWithData.property);

	 if(children === undefined) {
	    //console.log("getTreeNodeData no children");
	    return treeNodeWithData;
	 }

	 len = children.length;
	 for(i=0; i<len; i++) {
	    child = children[i];
	    //console.log("recursive getTreeNodeData child %d, child",i,child);
	    childNode = getTreeNodeData(layerName, child.node);
	    treeNodeWithData.children[treeNodeWithData.children.length] = childNode;
	    //console.log("getTreeNodeData: childNode ",childNode);
	 }
      }

      return treeNodeWithData;
   };

   //---------------------------------------------------------
   // Get the json object that describes a tree
   var getTreeData = function (layerName) {

      var ret = undefined;
      var TreeJSON = {};
      var layer;
      var name;
      var structure;
      var structureNode;
      var treeNode;
      var numLayers = layerNames.length;
      var i;

      TreeJSON.json = [];

      var deb = _debug;
      //_debug = true;
      if(_debug) console.log("model: getTreeData layerName %s",layerName);

      layer = layerData[layerName];
      structure = layer.treeStructure;
      data = layer.treeData;

      //console.log("structure: ", structure);
      //console.log("data: ", data);

      //console.log("structure is a  ",typeof(structure));
      if(typeof(structure) === 'object') {

	 for(var node in structure) {
	    if(typeof(structure[node]) === 'undefined') {
	       //console.log("getTreeData returning early");
	       return undefined;
	    } else {
	       structureNode = structure[node];
	       //console.log("structureNode ",structureNode);
	    }
	    treeNode = getTreeNodeData(layerName, structureNode);
	    //console.log("structureNode ",structureNode);
	    //console.log("treeNode ",treeNode);
	    TreeJSON.json[TreeJSON.json.length] = treeNode;
	 }

	 ret = TreeJSON.json;
      }

      _debug = deb;
      //console.log(ret);
      return ret;
   };

   //---------------------------------------------------------
   var getUndelineatedRGBA = function () {
      return undelineatedRGBA;
   };

   //---------------------------------------------------------
   // Get the tree associated with a layer
   var getTree = function (layerName) {
      //console.log("getTree for ",layerName);
      layer = layerData[layerName];
      return layer.tree;
   };

   //---------------------------------------------------------
   // Set the tree associated with a layer
   var setTree = function (layerName, tree) {
      layer = layerData[layerName];
      layer.tree = tree;
   };

   //---------------------------------------------------------
   // Get the first layer that has a tree associated with it
   var getFirstTreeLayer = function () {

      var layer;
      var numLayers;
      var found = false;
      var i;

      numLayers = layerNames.length;
      if(_debug) console.log("getFirstTreeLayer: layerNames ",layerNames);

      for(i=0; i<numLayers; i++) {
         layer = layerData[layerNames[i]];
         if(_debug) console.log("getFirstTreeLayer: layer ",layer);
	 if(layer.treeStructure === undefined || layer.treeData === undefined) {
	    continue;
	 } else {
	    found = true;
	    break;
	 }
      }

      if(found) {
         return layer.layerName;
      } else {
         return undefined;
      }
   };

   //---------------------------------------------------------
   // Get the initial currentLayer. Defaults to first layer.
   var getInitialCurrentLayer = function () {
      if(initialCurrentLayer === undefined) {
         //return layerNames.length[0];
         return layerNames[0];
      } else {
         return initialCurrentLayer;
      }
   };

   //---------------------------------------------------------
   // Get the initial viewer state.
   var getInitialState = function () {
      return initialState;
   };

   //---------------------------------------------------------
   // Set the initial viewer state.
   // (control passes to callback functions)
   var setInitialState = function () {
      setInitialDistance();
      return false;
   };

   //---------------------------------------------------------
   // Get the point and click image data.
   var getPointClickImgData = function () {
      return pointClickImgData;
   };

   //---------------------------------------------------------
   // Get the current point and click image.
   var getPointClickImg = function () {
      return pointClickImgData.sectionMap[dst.cur];
   };

   //---------------------------------------------------------
   // Get the voxel resolution for the image.
   var getVoxelSize = function (norm) {

      var ret;

      if(threeDInfo.voxel === undefined) {
         return voxelSize; // as read in from json file
      }

      if(norm) {
         ret = threeDInfo.normVoxel;
      } else {
         ret = threeDInfo.voxel;
      }
      return ret;
   };

   //---------------------------------------------------------
   // Get the mapping between dst = 0 in a 3D wlz object and stack = 0
   var getWlzToStackOffset = function () {
      return wlzToStackOffset;
   };

   //---------------------------------------------------------
   // Get the equivalent section first plane w.r.t. 3D wlz object
   var getEquivSectionOffset = function () {
      return equivSectionOffset;
   };

   //---------------------------------------------------------
   // sectionOrderReversed affects the equivalent section calculation.
   var getSectionOrderReversed = function () {
      return sectionOrderReversed;
   };

   //---------------------------------------------------------
   // Get the title for the image.
   var getImageTitle = function () {
      return imageTitle;
   };

   //---------------------------------------------------------
   // Get the title tooltip for the image.
   var getImageTitleTooltip = function () {
      return imageTitleTooltip;
   };

   //---------------------------------------------------------
   // True if any Layer is of type 'label'
   var hasLabels = function () {
      return layerHasLabels;
   };

   //---------------------------------------------------------
   // Get the structure and content urls.
   var getMenuData = function () {
      return ({
          structureUrl:menuStructureUrl,
	  contentUrl:menuContentUrl,
          tableStructureUrl:tableMenuStructureUrl,
	  tableContentUrl:tableMenuContentUrl,
          treeStructureUrl:treeMenuStructureUrl,
	  treeContentUrl:treeMenuContentUrl
      });
   };

   //---------------------------------------------------------
   // Get the queryData url.
   var getQueryDataUrl = function () {
      return queryDataUrl;
   };

   //---------------------------------------------------------
   // Get the enabled query modes; currently by anatomy term or by drawing.
   var getQueryModes = function () {
      return queryModes;
   };

   //---------------------------------------------------------
   var getExpressionSection = function() {
     return expressionSection;
   };
   var getExpressionSectionName = function() {
     return expressionSectionName;
   };

   var getKeySections = function () {
     return keySections;
   };

   var getKeySectionNames = function () {
     return keySectionNames;
   };

   //---------------------------------------------------------
   var getScalebarLen = function() {
     return scalebarLen;
   };

   //---------------------------------------------------------
   var getProject = function() {
     return project;
   };

   //---------------------------------------------------------
   var getProjectDivId = function() {
     return projectDivId;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      initialiseDynamic: initialiseDynamic,
      initialiseTiff: initialiseTiff,
      modelReady: modelReady,
      register: register,
      getName: getName,
      getWebServer: getWebServer,
      getMetadataRoot: getMetadataRoot,
      getIIPServer: getIIPServer,
      getDataImageDir: getDataImageDir,
      getInterfaceImageDir: getInterfaceImageDir,
      getZSelectorInfo: getZSelectorInfo,
      getFullDepth: getFullDepth,
      getLayerNames: getLayerNames,
      getLayerData: getLayerData,
      getDataSubType: getDataSubType,
      getUrlSpecifiedParams: getUrlSpecifiedParams,
      getIndexData: getIndexData,
      getFullImgDims: getFullImgDims,
      setBoundingBox: setBoundingBox,
      getBoundingBox: getBoundingBox,
      getTransformedBoundingBox: getTransformedBoundingBox,
      getExpressionSection: getExpressionSection,
      setSection: setSection,
      setSectionCallback:setSectionCallback,
      getExpressionSectionName: getExpressionSectionName,
      getFullImgFilename: getFullImgFilename,
      getFullExpressionLevelKeyName: getFullExpressionLevelKeyName,
      getToolsMetadataUrl: getToolsMetadataUrl,
      updateBusyIndicator: updateBusyIndicator,
      getInfoDetails: getInfoDetails,
      getImgQuality: getImgQuality,
      isWlzData: isWlzData,
      isPyrTiffData: isPyrTiffData,
      isEurexpressData: isEurexpressData,
      isEditor: isEditor,
      hasLabels: hasLabels,
      getViewerTargetId: getViewerTargetId,
      getThreeDInfo: getThreeDInfo,
      getX3dInfo: getX3dInfo,
      getCurrentSection: getCurrentSection,
      getDistance: getDistance, // for convenience when you don't need all the 3D stuff
      setDistance: setDistance,
      modifyDistance: modifyDistance,
      setFixedPoint: setFixedPoint,
      setOrientation: setOrientation,
      modifyOrientation: modifyOrientation,
      getViewAngles: getViewAngles,
      getViewLabels: getViewLabels,
      getScaleMaxMin: getScaleMaxMin,
      getRegionOfInterest: getRegionOfInterest,
      getMaxIIPResolution: getMaxIIPResolution,
      getTileSize: getTileSize,
      isArrayStartsFrom0: isArrayStartsFrom0,
      getFirstTreeLayer: getFirstTreeLayer,
      getInitialCurrentLayer: getInitialCurrentLayer,
      getInitialState: getInitialState,
      setInitialState: setInitialState,
      getPointClickImgData: getPointClickImgData,
      getPointClickImg: getPointClickImg,
      getVoxelSize: getVoxelSize,
      getWlzToStackOffset: getWlzToStackOffset,
      getEquivSectionOffset: getEquivSectionOffset,
      getSectionOrderReversed: getSectionOrderReversed,
      getImageTitle: getImageTitle,
      getImageTitleTooltip: getImageTitleTooltip,
      getTree: getTree,
      setTree: setTree,
      getMenuData: getMenuData,
      getTreeData: getTreeData,
      getQueryDataUrl: getQueryDataUrl,
      getQueryModes: getQueryModes,
      getKeySections: getKeySections,
      getKeySectionNames: getKeySectionNames,
      getUndelineatedRGBA: getUndelineatedRGBA,
      getScalebarLen: getScalebarLen,
      getProject: getProject,
      getProjectDivId: getProjectDivId
   };

}(); // end of module tiledImageModel
