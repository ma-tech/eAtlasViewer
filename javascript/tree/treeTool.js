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
//   tiledImageTreeTool.js
//   Tool to manipulate domains in tiled image from an iip server
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
// module for treeTool
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.treeTool = function () {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var _debug;
   var model;
   var view;
   var utils;
   var name;
   var shortName;
   var title;
   var klass;
   var systems;
   var imagePath;
   var layer;
   var x_side;
   var y_top;
   var toRight;
   var treeDragContainerId;
   var treeComponent;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      _debug = false;

      //console.log("enter treeTool.initialize: ",params.params.layer);
      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;

      model.register(this, "treeTool");
      view.register(this, "treeTool");

      utils = emouseatlas.emap.utilities;

      x_side = params.x; 
      y_top = params.y; 
      toRight = params.toRight;
      toRight = (toRight === "false") ? false : true;
      //console.log("toRight ",toRight);

      treeDragContainerId = "treeDragContainer";

      name = "TreeTool";
      shortName = name.toLowerCase().split(" ").join("");

      // we are reading in the params from a json file so they will be strings.
      title = params.title;
      //console.log("title ",title);
      if(title === undefined || title === null || title === "") {
         title = "Anatomy";
      }

      klass = (params.klass === undefined) ? "" : params.klass;
      
      systems = (params.systems === undefined) ? "true" : params.systems;
      systems = (systems === "false") ? false : true;

      imagePath = model.getInterfaceImageDir();

      layer = params.layer;
      //console.log("treeTool: layer ",layer);

      createElements();

      addPatchEvent();

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function() {

      var topEdge;
      var tlCorner;
      var trCorner;

      var titleContainer;
      var treeToolTitleText;

      var treeControlContainer;
      var selectAllButtonDiv;
      var selectAllButtonText;
      var clearAllButtonDiv;
      var clearAllButtonText;
      var threeDButtonDiv;
      var threeDButtonText;

      var systemChkbxDiv;
      var systemChkbx;
      var systemChkbxLabel;

      var targetId;
      var target;
      var sliderLength;
      var treeDragContainer;
      var treeContainer;
      var fs1;
      var legend1;

      var treeJson;
      //------------------------

      //console.log("createElements");
      targetId = model.getProjectDivId();
      target = $(targetId);

      treeDragContainer = $(treeDragContainerId);

      if(treeDragContainer) {
         treeDragContainer.parentNode.removeChild(treeDragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      treeDragContainer = new Element('div', {
         'id': treeDragContainerId,
	 'class': klass
      });

      if(toRight) {
	 treeDragContainer.setStyles({
	    "top": y_top + "px",
	    "right": x_side + "px"
	 });
      } else {
	 treeDragContainer.setStyles({
	    "top": y_top + "px",
	    "left": x_side + "px"
	 });
      }

      treeDragContainer.inject(target, 'inside');
      //----------------------------------------
      // container for treeTool title
      //----------------------------------------
      titleContainer = new Element('div', {
         'id': 'treeToolTitleContainer'
      });

      treeToolTitleText = new Element('div', {
         'id': 'treeToolTitleText'
      });
      treeToolTitleText.appendText(title);

      topEdge = new Element('div', {
         'id': 'treeToolTopEdge',
	 'class': 'topEdge'
      });

      tlCorner = new Element('div', {
         'id': 'treeToolTopLeftCorner',
	 'class': 'topLeftCorner'
      });

      trCorner = new Element('div', {
         'id': 'treeToolTopRightCorner',
	 'class': 'topRightCorner'
      });

      treeToolTitleText.inject(titleContainer, 'inside');
      titleContainer.inject(topEdge, 'inside');
      topEdge.inject(treeDragContainer, 'inside');
      tlCorner.inject(treeDragContainer, 'inside');
      trCorner.inject(treeDragContainer, 'inside');
 
      //----------------------------------------
      // container for additional controls
      //----------------------------------------
      treeControlContainer = new Element('div', {
         'id': 'treeControlContainer',
      });
      treeControlContainer.inject(treeDragContainer, 'inside');

      //----------------------------------------
      // Select All button
      //----------------------------------------
      selectAllButtonDiv = new Element('div', {
         'id': 'treeSelectAllButtonDiv',
	 'class': 'treeButtonDiv all'
      });
      selectAllButtonDiv.inject(treeControlContainer, 'inside');
      selectAllButtonText = new Element('div', {
         'id': 'treeSelectAllButtonText',
	 'class': 'treeButtonText'
      });
      selectAllButtonText.inject(selectAllButtonDiv, 'inside');
      selectAllButtonText.appendText('All');

      emouseatlas.emap.utilities.addButtonStyle("treeSelectAllButtonDiv");

      //----------------------------------------
      // Clear All button
      //----------------------------------------
      clearAllButtonDiv = new Element('div', {
         'id': 'treeClearAllButtonDiv',
	 'class': 'treeButtonDiv none'
      });
      clearAllButtonDiv.inject(treeControlContainer, 'inside');
      clearAllButtonText = new Element('div', {
         'id': 'treeClearAllButtonText',
	 'class': 'treeButtonText'
      });
      clearAllButtonText.inject(clearAllButtonDiv, 'inside');
      clearAllButtonText.appendText('None');

      emouseatlas.emap.utilities.addButtonStyle("treeClearAllButtonDiv");

      //----------------------------------------
      // 3d button
      //----------------------------------------
      threeDButtonDiv = new Element('div', {
	 'id': 'tree3dButtonDiv',
	 'class': 'treeButtonDiv threeD'
      });
      threeDButtonDiv.inject(treeControlContainer, 'inside');
      threeDButtonText = new Element('div', {
	 'id': 'tree3dButtonText',
	 'class': 'treeButtonText threeD'
      });
      threeDButtonText.inject(threeDButtonDiv, 'inside');
      threeDButtonText.appendText('3d view');

      if(model.has3dAnatomy()) {
         emouseatlas.emap.utilities.addButtonStyle("tree3dButtonDiv");
      }

      //----------------------------------------
      // System checkbox
      //----------------------------------------

      systemChkbxDiv = new Element('div', {
	    'id': 'systemChkbxDiv',
	    'class': 'systemChkbxDiv'
	    });
      systemChkbxLabel = new Element('label', {
	    'id': 'systemChkbxLabel',
	    'name': 'systemChkbxLabel',
	    'class': 'systemChkbxLabel'
	    });
      systemChkbx = new Element('input', {
	    'id': 'systemChkbx',
	    'name': 'systemChkbx',
	    'class': 'systemChkbx',
	    'type': 'checkbox',
	    'checked': false
	    });

      if(systems) {
         systemChkbxDiv.inject(treeControlContainer, 'inside');
         systemChkbx.inject(systemChkbxDiv, 'inside');
         systemChkbxLabel.inject(systemChkbxDiv, 'inside');
         systemChkbxLabel.set('text', 'Systems');
      }

      //----------------------------------------
      // container for the tree
      //----------------------------------------
      treeContainer = new Element('div', {
         'id': 'tree_container',
      });
      treeContainer.inject(treeDragContainer, 'inside');

      treeComponent = new Mif.Tree({
         view:view,
	 id:"",
	 container:treeContainer,
	 types: {// node types
	 folder:{
	       openIcon: 'mif-tree-open-icon',//css class open icon
	       closeIcon: 'mif-tree-close-icon'// css class close icon
	    }
	 },
	 dfltType:'folder',//default node type
	 height: 11  //node height
      });

      //console.log("treeComponent ",treeComponent);

      treeJson = model.getTreeData(layer);
      treeComponent.load({json: treeJson});

      //----------------------------------------
      // add events for buttons
      //----------------------------------------
      emouseatlas.emap.utilities.addEvent(selectAllButtonDiv, 'click', function() {
         treeComponent.root.showAllDomains();
      });

      emouseatlas.emap.utilities.addEvent(clearAllButtonDiv, 'click', function() {
         treeComponent.root.clearAll();
         view.setSelections("", "clearAllButton");
      });

      if(model.has3dAnatomy()) {
         emouseatlas.emap.utilities.addEvent(threeDButtonDiv, 'click', function() {
            treeComponent.new3d();
         });
      } else {
         threeDButtonDiv.className = "treeButtonDiv threeD disabled";
         threeDButtonText.className = "treeButtonText threeD disabled";
      }

      if(systemChkbxDiv) {
         emouseatlas.emap.utilities.addEvent(systemChkbxDiv, 'change', function() {
	    treeComponent.setShowSystems(systemChkbx.checked);
	 });
      }

   }; // createElements

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      var col;
      var colArr;
      var id;
      var bare_id;
      var node;
      var obj;

      if(modelChanges.treeNodeColour === true) {
         //console.log("treeTool.modelUpdate treeNodeColour %s",modelChanges.treeNodeColour);
	 col = view.getRGBA();
	 colArr = [];
	 colArr[0] = col.red.toString();
	 colArr[1] = col.green.toString();
	 colArr[2] = col.blue.toString();
	 colArr[3] = (parseInt(col.alpha * 255)).toString() ;
	 id = view.getElementToColour();
	 bare_id = id.replace(/pic_/,'').trim();
         //console.log("treeTool.modelUpdate id ",bare_id);
	 node = treeComponent.root.getNodeById(bare_id);
         //console.log("treeTool.modelUpdate node.color ",node.color);
	 node.color = colArr;
         //console.log("treeTool.modelUpdate node.color now ",node.color);
	 treeComponent.showSelected(bare_id);
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   var viewUpdate = function(viewChanges, from) {

      var currentLayer;
      var dms;
      var hght;
      var treedms;
      var treeContainer;
      var tcTop;
      var treeWrapper;
      var id;
      var rgba;

      //console.log("tiledImageTreeTool: ",viewChanges);
      currentLayer = view.getCurrentLayer();

      if(viewChanges.initial === true) {
	 setTreeVisible(true);
      }

      if(viewChanges.dblClick === true) {
         showIndexDataInImage();
      }

      if(viewChanges.viewport === true) {

         dms = view.getViewportDims();
         hght = dms.height;
         //treedms = window.getDimensions();
         treeContainer = $('tree_container');
         tcTop = parseInt(treeContainer.getStyle('top'));

         treeWrapper = $$('div.mif-tree-wrapper');

         //window.setDimensions(treedms.w, hght);
         treeWrapper.setStyle('height', (hght-tcTop-2) + 'px');
      }

   }; // viewUpdate

   //---------------------------------------------------------
   var setCheckedNodes = function (ids) {

      var idArr;
      var id;
      var node;
      var nodeId;
      var chkbx;
      var chkbxId;
      var len;
      var i;
 
      idArr = ids.split(",");
 
      len = idArr.length;
      for(i=0; i<len; i++) {
         id = idArr[i];
	 //console.log("setCheckedNodes: id ",id);
         node = treeComponent.root.getNodeById(id);
	 //console.log("setCheckedNodes: state ",node.state);

         if(node) {
            if (node.domainId !== undefined && node.domainId != ""){
	       chkbxId = "cb_" + id;
               chkbx = $(chkbxId);
	       chkbx.checked = true;
	       node.state.checked = true;
            }
         }
      }
   };

   //---------------------------------------------------------
   var getDomainColour = function (domainId, hex) {

      var nodesWithDomain;
      var id;
      var col;
      var hexcol;
      var len;
      var i;

      id = parseInt(domainId);

      col = undefined;

      nodesWithDomain = treeComponent.root.getSignificantNodes([]);
      nodesWithDomain.each(function(item){
         if (item.domainId == id) {
            col = item.color;
         }
      });

      //console.log("getDomainColour for %s  ",domainId,data);

      if(col) {
         if(hex) {
	    hexCol = utils.decColArrToHexStr(col);
	    return hexCol;
	 } else {
	    return col;
	 }
      } else {
         return undefined;
      }
 
   };

   //--------------------------------------------------------------
   var isChecked = function (nodeId) {

      var nodesWithDomain;
      var checked;
      var ret;
 
      nodesWithDomain = treeComponent.root.getSignificantNodes([]);
      nodesWithDomain.each(function(item){
         if (item.id == nodeId) {
	    if(item.state.checked === true) {
               ret = true;
	    } else {
	       ret = false;
	    }
	 }
      });

      //console.log("isChecked returning ",ret);
      return ret;
   };

   //--------------------------------------------------------------
   var showIndexDataInImage = function () {

      var indexArr = view.getIndexArray(layer); // layer ignored just now
      var indexData = model.getIndexData(layer);
      if(indexData === undefined) {
         alert("indexData undefined");
         return false;
      }

      // for now we are using just indexArr[1]
      if(indexData[indexArr[1]] !== undefined) {
         var nodeId = indexData[indexArr[1]].nodeId;
         nodeId = "cb_" + nodeId;
         treeComponent.processCheckExternal(nodeId);
      }
   };

   //---------------------------------------------------------------
   // add events to the colour patches
   var addPatchEvent = function () {
      var patchArr = [];
      var patch;
      var num;
      var i;

      patchArr = $$('.pick');
      //patchArr = document.getElementsByClassName('pick');
      //console.log(patchArr);
      num = patchArr.length;
      for(i=0; i<num; i++) {
	 patch = patchArr[i];
	 emouseatlas.emap.utilities.addEvent(patch, 'mouseup', function(e) {
	    enableColChoose(e);
	 }, false);
      }
   };

   //---------------------------------------------------------------
   // event handler for colour patches
   var enableColChoose = function (e) {

      var evt;
      var target;

      //console.log("enableColChoose:");

      evt = e || window.event;
      target = emouseatlas.emap.utilities.getTarget(evt);
      //console.log("enableColChoose: %s",target.id);

      view.setElementToColour(target.id);
   };

   //---------------------------------------------------------------
   var setTreeVisible = function(show) {
      var tree = $(treeDragContainerId);
      var viz = show ? "visible" : "hidden";
      if(tree) {
         tree.setStyle("visibility", viz);
      }
   };

   //---------------------------------------------------------
   var getName = function () {
      return 'threeDAnatomy';
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      getDomainColour: getDomainColour,
      isChecked: isChecked,
      getName: getName
   };

}(); // end of module treeTool
//----------------------------------------------------------------------------
