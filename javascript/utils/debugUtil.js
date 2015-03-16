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
//   debugUtil.js
//   Tool to debug 2D/3D coordinate issues.
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
//---------------------------------------------------------
var debugUtil = new Class ({

   initialize: function(params) {

      //console.log("enter debugUtil.initialize: ",params);
      //this.model = params.model;
      //this.view = params.view;
      this.model = emouseatlas.emap.tiledImageModel;
      this.view = emouseatlas.emap.tiledImageView;
      this.query = emouseatlas.emap.tiledImageQuery;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "debugUtil";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      var imagePath = this.model.getInterfaceImageDir();
       
      this.isWlz = this.model.isWlzData();

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

      this.linespace = 14;
      this.divspace = 4;
      this.top_top = 0;
      this.top_bottom = 0;
      this.items = [
         {desc: "viewport origin", id: "viewport", params: ["X", "Y"], target: "debug_top_div"},
         {desc: "point (browser)", id: "browser", params: ["X", "Y"], target: "debug_top_div"},
         {desc: "point (viewer)", id: "viewer", params: ["X", "Y"], target: "debug_top_div"},
         {desc: "point (displayed image)", id: "img_disp", params: ["X", "Y"], target: "debug_top_div"},
         {desc: "point (wlz image)", id: "img_wlz", params: ["X", "Y", "Z"], target: "debug_top_div"},
         {desc: "point (transformed section)", id: "xform_sec", params: ["X", "Y"], target: "debug_top_div"},
         {desc: "transformed bbox min", id: "xform_bbox_min", params: ["X", "Y", "Z"], target: "debug_top_div"},
         {desc: "transformed bbox max", id: "xform_bbox_max", params: ["X", "Y", "Z"], target: "debug_top_div"},
	 //................................
         {desc: "wlz mode", id: "wlz_mode", params: [""], target: "debug_bottom_div"},
         {desc: "real voxel size", id: "real_vox", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "normalised voxel size", id: "norm_vox", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "bbox min", id: "bbox_min", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "bbox max", id: "bbox_max", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "fxp", id: "fxp", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "scaled fxp", id: "fxp_scaled", params: ["X", "Y", "Z"], target: "debug_bottom_div"},
         {desc: "distance", id: "distance", params: ["min", "max", "cur"], target: "debug_bottom_div"}
         //{desc: "distance range", id: "distance_range", params: ["min", "max"], target: "debug_bottom_div"}
      ];

      this.transformedBoundingBoxMin;
      this.transformedBoundingBoxMax;
      this.threeDInfo;
      this.createElements();
      //----------------------------------------
      this.window.setPosition(x, y);
      this.window.setDimensions(this.width, this.height);

   },

   //---------------------------------------------------------
   createElements: function() {

      //console.log("debugUtil createElements");

      var win = $(this.shortName + '-win');
      // make sure existing elements are removed.
      // or they will appear multiple times
      emouseatlas.emap.utilities.removeChildNodes(win);

      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer5'
      });

      this.topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(this.topEdge, 'inside');

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      emouseatlas.emap.utilities.removeChildNodes(this.sliderTextDiv);
      this.sliderTextDiv.set('text', 'Debug Info');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(this.topEdge, 'inside');

      //----------------------------------------
      // containers for the debug items
      //----------------------------------------

      //var debug_top_div;
      //var debug_bottom_div;

      //-------------------------
      var item;
      //-------------------------

      var item_klass = 'debugItem';
      var label_klass = 'debugItemLabel';
      var txt_klass = 'debugItemTxt';
      var coord_klass = 'debugItemCoord';
      var label_coord_klass = 'debugItemCoordLabel';
      var val_coord_klass = 'debugItemCoordVal';

      var len;
      var i;
      var linespace;

      //---------------------------------------------------------------
      len = this.items.length;
      for(i=0; i<len; i++) {
         this.addNewContainer(this.items[i].target, win);
	 item = this.items[i];
         this.addDebugItem(item.target, item.id, item.desc, item.params);
      }

      //----------------------------------------
      // the mouse click marker
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
   addDebugItem: function(targetId, id, desc, params) {

      var item_div;
      var item_label_div;
      var item_param_container;
      var item_param_div;
      var item_param_label;
      var item_param_val;
      //..........
      var container;
      var contH;
      var itemTop;
      var contTop;
      //..........
      var item_klass = 'debugItemContainer';
      var item_label_klass = 'debugItemLabel';
      var item_param_container_klass = 'debugItemParamContainer';
      var txt_klass = 'debugItemTxt';
      var item_param_div_klass = 'debugItemParamDiv';
      var item_param_label_klass = 'debugItemParamLabel';
      var item_param_val_klass = 'debugItemParamVal';
      //..........
      var len;
      var i;
      //-------------------------

      container = document.getElementById(targetId);
      if(container === undefined) {
         return false;
      }

      switch(targetId) {
	 case "debug_top_div":
	    itemTop = this.top_top;
	    this.top_top += this.linespace;
            contH = this.top_top;
            container.setStyle('height', contH + 'px');
	    break;
	 case "debug_bottom_div":
	    itemTop = this.top_bottom;
	    contTop = this.top_top + this.divspace;
	    this.top_bottom += this.linespace;;
            contH = this.top_bottom;
            container.setStyles({
	       'top': contTop + 'px',
	       'height': contH + 'px'
	    });
	    break;
      }

      len = params.length;

      item_div = new Element('div', {
        'id': id + '_div',
        'class': item_klass
      });
      item_div.setStyles({
         'top': itemTop + 'px'
      });

      item_label_div = new Element('div', {
        'id': id + '_label_div',
	'class': item_label_klass
      });
      item_label_div.set("text", desc);

      item_param_container = new Element('div', {
        'id': id + '_param_container',
        'class': item_param_container_klass
      });
      //............................................
      for(i=0; i<len; i++) {

         item_param_div = new Element('div', {
           'id': id + '_' + params[i] + '_param_div',
           'class': item_param_div_klass
         });

         item_param_label = new Element('div', {
           'id': id + '_' + params[i] + '_param_label_div',
           'class': item_param_label_klass
         });
         item_param_label.set("text", params[i]);

         item_param_val = new Element('div', {
           'id': id + '_' + params[i] + '_param_val_div',
           'class': item_param_val_klass
         });

         item_param_div.inject(item_param_container, 'inside');
         item_param_label.inject(item_param_div, 'inside');
         item_param_val.inject(item_param_div, 'inside');
      }

      item_div.inject(container, 'inside');
      item_label_div.inject(item_div, 'inside');
      item_param_container.inject(item_div, 'inside');
      //----------------------------

   }, // addDebugItem:

   //---------------------------------------------------------------
   addNewContainer: function(name, target) {

      var div;
      var container_klass = 'debugContainer';

      if(document.getElementById(name)) {
         return false;
      } else {
	 div = new Element('div', {
	   'id': name,
	   'class': container_klass
	 });
         div.inject(target, 'inside');
      }

   }, // addNewContainer

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      if(modelChanges.sectionChanged === true) {
	 this.setDebugPointInfo(true); // reset the data relating to clicked point
	 this.setDebugInfo(false);
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      var queryModes;

      if(viewChanges.initial === true) {
	 this.window.setVisible(false);
      }

      //...................................
      /*
      if(viewChanges.mode === true) {
	 var mode = this.view.getMode();
         //console.log("mode.name ",mode.name);
	 if(mode.name === "debug" || mode.name === "fxp") {
	    this.window.setVisible(true);
	 } else {
	    this.setDebugPointInfo(true);
	    this.window.setVisible(false);
	    this.setMarkerVisible(false);
	 }
      }
      */

      //...................................
      if(viewChanges.scale === true) {
         //console.log("mode.name ",mode.name);
	 this.setDebugPointInfo(true); // reset the data relating to clicked point
      }

      //...................................
      if(viewChanges.debugPoint === true) {
	 //console.log("viewChanges.debugPoint");
	 if(this.isWlz) {
            this.getTransformedBoundingBox();
	 } else {
	    alert("Sorry, debug info only available with wlz data at the moment");
	 }
      }

      //...................................
      if(viewChanges.debugWindow === true) {
	 //console.log("viewChanges.debugWindow");
	 this.view.showTileBorders();
	 var viz = this.view.getDebugWindow();
	 if(viz === true) {
	    this.window.setVisible(true);
	 } else if(viz === false) {
	    this.window.setVisible(false);
	    this.setMarkerVisible(false);
	 }
      }

      //...................................
      if(viewChanges.locatorMoved === true) {
         this.setDebugPointInfo(true);
      }

      //...................................
      if(viewChanges.toolbox === true) {
	 var viz = this.view.toolboxVisible();
	 if(viz === true) {
	    this.window.setVisible(true);
	 } else if(viz === false) {
	    this.window.setVisible(false);
	    this.setMarkerVisible(false);
	 }
      }
   }, // viewUpdate

   //---------------------------------------------------------------
   queryUpdate: function(queryChanges) {

      if(queryChanges.type === true) {
         // do nothing
      }

   }, // queryUpdate

   //--------------------------------------------------------------
   setDebugPointInfo: function (reset) {
         var wlzPos;
         var browserPos;
         var imgPos;
         var viewerPos;
         var viewportPos;
	 var xformSecPos;
	 var fixed;
	 var scale;
	 var item;
	 var left;
	 var top;

	 if(reset) {
	    this.setMarkerVisible(false);
	 } else {
	    scale = this.view.getScale().cur;
	    wlzPos = this.view.getDebugPoint();
	    browserPos = this.view.getMouseClickPosition();
	    imgPos = this.view.getMousePositionInImage({x:browserPos.x, y:browserPos.y});
	    imgPos.x = (imgPos.x / scale);
	    imgPos.y = (imgPos.y / scale);
	    viewportPos = this.view.getViewerContainerPos();
	    viewerPos = {};
	    xformSecPos = {};
	    fixed = 1;

	    /*
	    console.log("scale ",scale);
	    console.log("wlzPos ",wlzPos);
	    console.log("browserPos.x %d, browserPos.y %d",browserPos.x,browserPos.y);
	    console.log("imgPos.x %d, imgPos.y %d",imgPos.x,imgPos.y);
	    console.log("viewerPos.x %d, viewerPos.y %d",viewerPos.x,viewerPos.y);
	    console.log("viewportPos.x %d, viewportPos.y %d",viewportPos.x,viewportPos.y);
	    */

	    viewerPos.x = browserPos.x - viewportPos.x;
	    viewerPos.y = browserPos.y - viewportPos.y;

	    xformSecPos.x = this.transformedBoundingBoxMin.x + (1.0 * imgPos.x);
	    xformSecPos.y = this.transformedBoundingBoxMin.y + (1.0 * imgPos.y);

	    left = browserPos.x - viewportPos.x -12;
	    top = browserPos.y - viewportPos.y -12;
	    this.markerContainer.setStyles({'left': left, 'top': top});
	    this.setMarkerVisible(true);
	 }

         //......................
	 item = $("viewport_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(viewportPos.x, fixed));
	 }

	 item = $("viewport_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(viewportPos.y, fixed));
	 }
         //......................
	 item = $("viewer_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(viewerPos.x, fixed));
	 }

	 item = $("viewer_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(viewerPos.y, fixed));
	 }
         //......................
	 item = $("browser_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(browserPos.x, fixed));
	 }

	 item = $("browser_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(browserPos.y, fixed));
	 }
         //......................
	 item = $("img_disp_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(imgPos.x, fixed));
	 }

	 item = $("img_disp_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(imgPos.y, fixed));
	 }
         //......................
	 item = $("img_wlz_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(wlzPos.x, fixed));
	 }

	 item = $("img_wlz_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(wlzPos.y, fixed));
	 }

	 item = $("img_wlz_Z_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(wlzPos.z, fixed));
	 }
         //......................
	 item = $("xform_sec_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(xformSecPos.x, fixed));
	 }

	 item = $("xform_sec_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(xformSecPos.y, fixed));
	 }
         //......................
	 item = $("xform_bbox_min_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMin.x, fixed));
	 }

	 item = $("xform_bbox_min_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMin.y, fixed));
	 }

	 item = $("xform_bbox_min_Z_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMin.z, fixed));
	 }
         //......................
	 item = $("xform_bbox_max_X_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMax.x, fixed));
	 }

	 item = $("xform_bbox_max_Y_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMax.y, fixed));
	 }

	 item = $("xform_bbox_max_Z_param_val_div");
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(this.transformedBoundingBoxMax.z, fixed));
	 }

   }, // setDebugPointInfo

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

   //--------------------------------------------------------------
   getTransformedBoundingBox: function() {

      var transformedBBArray = [];
      var transformedBoundingBoxUrl;
      var jsonStr;
      var ajaxParams;
      var len;
      var section;
      var i;
      var webServer;
      var iipServer;
      var currentLayer;
      var layerData;
      var layer;
      
      
      this.threeDInfo = this.model.getThreeDInfo();
      //console.log("threeDInfo ",this.threeDInfo);

      webServer = this.model.getWebServer();
      iipServer = this.model.getIIPServer();
      currentLayer = this.view.getCurrentLayer();
      layerData = this.model.getLayerData();
      layer;

      if(webServer === undefined || iipServer === undefined) {
         //console.log("webServer or iipServer undefined");
         return undefined;
      }

      if(layerData === null) {
         //console.log("layerData null");
         return undefined;
      }

      layer = layerData[currentLayer];
      if(layer === undefined || layer === null) {
         //console.log("layer undefined");
         return undefined;
      }


      transformedBoundingBoxUrl = 
         iipServer + "?wlz=" +  layer.imageDir + layer.imageName                                                                                                
         + "&mod=" + this.threeDInfo.wlzMode                                                                                                                                               
         + "&fxp=" + this.threeDInfo.fxp.x + ',' + this.threeDInfo.fxp.y + ','+ this.threeDInfo.fxp.z                                                                                                
         + "&dst=" + this.threeDInfo.dst.cur                                                                                                                                                              
         + "&pit=" + this.threeDInfo.pitch.cur
         + "&yaw=" + this.threeDInfo.yaw.cur
         + "&rol=" + this.threeDInfo.roll.cur
         + "&obj=Wlz-transformed-3d-bounding-box";

      //console.log("transformedBoundingBoxUrl ",transformedBoundingBoxUrl);

      ajaxParams = {
         url:transformedBoundingBoxUrl,
	 method:"POST",
	 callback: function (response) {
	    this.getTransformedBoundingBoxCallback(response);
	 }.bind(this),
	 contentType:"",
	 urlParams:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   },

   //---------------------------------------------------------
   getTransformedBoundingBoxCallback: function (response) {

      var values;
      var valArr = [];
      var x;
      var y;
      var z;

      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return undefined;
      }

      values = response.split("Wlz-transformed-3d-bounding-box:")[1]
      valArr = values.split(" ");
      //console.log("getTransformedBoundingBoxCallback valArr = ",valArr);
      x = parseInt(valArr[4]);
      y = parseInt(valArr[2]);
      z = parseInt(valArr[0]);
      //console.log("getTransformedBoundingBoxCallback x %f, y %f, z %f",x,y,z);

      this.transformedBoundingBoxMin = {x:x, y:y, z:z};
      //console.log("transformedBoundingBoxMin ",this.transformedBoundingBoxMin);

      x = parseInt(valArr[5]);
      y = parseInt(valArr[3]);
      z = parseInt(valArr[1]);
      //console.log("getTransformedBoundingBoxCallback x %f, y %f, z %f",x,y,z);

      this.transformedBoundingBoxMax = {x:x, y:y, z:z};
      
      // this has to wait until we have the transformed bounding box
      // if true, reset all params to ""
      this.setDebugPointInfo(false);

   },

   //---------------------------------------------------------------
   setDebugInfo: function(reset) {

      var threeDInfo;
      var bbox;
      var fxp;
      var fxp_scaled;
      var item;
      var fixed;

      threeDInfo = this.model.getThreeDInfo();
      bbox = this.model.getBoundingBox();
      fxp = threeDInfo.fxp;
      fxp_scaled = threeDInfo.scaledFxp;

      //......................
      // note the double __ because we are missing a parameter label
      item = $("wlz_mode__param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", threeDInfo.wlzMode);
	 }
      }
      //......................
      fixed = 2;
      item = $("real_vox_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.voxel.x, fixed));
	 }
      }
      
      item = $("real_vox_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.voxel.y, fixed));
	 }
      }
      
      item = $("real_vox_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.voxel.z, fixed));
	 }
      }
      //......................
      item = $("norm_vox_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.normVoxel.x, fixed));
	 }
      }
      
      item = $("norm_vox_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.normVoxel.y, fixed));
	 }
      }
      
      item = $("norm_vox_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.normVoxel.z, fixed));
	 }
      }
      //......................
      item = $("bbox_min_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.x.min, fixed));
	 }
      }
      
      item = $("bbox_min_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.y.min, fixed));
	 }
      }
      
      item = $("bbox_min_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.z.min, fixed));
	 }
      }
      //......................
      item = $("bbox_max_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.x.max, fixed));
	 }
      }
      
      item = $("bbox_max_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.y.max, fixed));
	 }
      }
      
      item = $("bbox_max_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(bbox.z.max, fixed));
	 }
      }
      //......................
      fixed = 0;
      //......................
      item = $("fxp_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp.x, fixed));
	 }
      }
      
      item = $("fxp_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp.y, fixed));
	 }
      }
      
      item = $("fxp_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp.z, fixed));
	 }
      }
      //......................
      item = $("fxp_scaled_X_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp_scaled.x, fixed));
	 }
      }
      
      item = $("fxp_scaled_Y_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp_scaled.y, fixed));
	 }
      }
      
      item = $("fxp_scaled_Z_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(fxp_scaled.z, fixed));
	 }
      }
      //......................
      item = $("distance_min_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.dst.min, fixed));
	 }
      }
      
      item = $("distance_max_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.dst.max, fixed));
	 }
      }
      
      item = $("distance_cur_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.dst.cur, fixed));
	 }
      }
      //......................
      item = $("distance_range_min_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.dstRange.min, fixed));
	 }
      }
      
      item = $("distance_range_max_param_val_div");
      if(item !== null && item !== undefined) {
	 if(reset) {
	    item.set("text", "");
	 } else {
	    item.set("text", emouseatlas.emap.utilities.trimDecimal(threeDInfo.dstRange.max, fixed));
	 }
      }

    },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }.bind(this)

});
