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
//   Tool to select domains in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageTreeTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageTreeTool = new Class ({
var tiledImageTreeTool = new Class ({

   //that: this,

   initialize: function(params) {

      //console.log("enter tiledImageTreeTool.initialize: ",params.params.layer);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.name = "TreeTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.title = params.params.title;
      //console.log("this.title ",this.title);
      if(this.title === undefined || this.title === null || this.title === "") {
         this.title = "Anatomy";
      }

      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.toRight = (params.params.toRight === undefined) ? "true" : params.params.toRight;
      this.toRight = (this.toRight === "false") ? false : true;

      this.systems = (params.params.systems === undefined) ? "true" : params.params.systems;
      this.systems = (this.systems === "false") ? false : true;

      var imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;
      this.layer = params.params.layer;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:params.params.drag,
					 thinTopEdge:params.params.thinTopEdge,
					 toRight:params.params.toRight,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: imagePath,
					 initiator:this});

      var x = parseInt(params.params.x);
      var y = parseInt(params.params.y);
      //console.log("treeTool: x ",x,", ",y);
      this.window.setPosition(x, y);

      // for tooltips
      /*
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

      this.createElements();

      //console.log($$('.pick'));

      this.addPatchEvent();

   }, // initialize

   //---------------------------------------------------------------
   createElements: function() {

      var win = $(this.shortName + '-win');
      var topEdge;

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

      var threeDChkbxDiv;
      var threeDChkbx;
      var threeDChkbxLabel;

      //----------------------------------------
      // container for treeTool title
      //----------------------------------------
      titleContainer = new Element('div', {
         'id': 'treeToolTitleContainer'
      });

      treeToolTitleText = new Element('div', {
         'id': 'treeToolTitleText'
      });
      treeToolTitleText.appendText(this.title);

      topEdge = $(this.shortName + '-topedge');

      treeToolTitleText.inject(titleContainer, 'inside');
      titleContainer.inject(topEdge, 'inside');
 
      //----------------------------------------
      // container for additional controls
      //----------------------------------------
      treeControlContainer = new Element('div', {
         'id': 'treeControlContainer',
      });
      treeControlContainer.inject(win, 'inside');

      //----------------------------------------
      // Select All button
      //----------------------------------------
      selectAllButtonDiv = new Element('div', {
         'id': 'treeSelectAllButtonDiv',
	 'class': 'treeButtonDiv'
      });
      selectAllButtonDiv.inject(treeControlContainer, 'inside');
      selectAllButtonText = new Element('div', {
         'id': 'treeSelectAllButtonText',
	 'class': 'treeButtonText'
      });
      selectAllButtonText.inject(selectAllButtonDiv, 'inside');
      selectAllButtonText.appendText('Select All');

      emouseatlas.emap.utilities.addButtonStyle("treeSelectAllButtonDiv");

      //----------------------------------------
      // Clear All button
      //----------------------------------------
      clearAllButtonDiv = new Element('div', {
         'id': 'treeClearAllButtonDiv',
	 'class': 'treeButtonDiv'
      });
      clearAllButtonDiv.inject(treeControlContainer, 'inside');
      clearAllButtonText = new Element('div', {
         'id': 'treeClearAllButtonText',
	 'class': 'treeButtonText'
      });
      clearAllButtonText.inject(clearAllButtonDiv, 'inside');
      clearAllButtonText.appendText('Clear All');

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
      threeDButtonText.appendText('3d window');

      emouseatlas.emap.utilities.addButtonStyle("tree3dButtonDiv");

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

/*
      if(this.systems) {
         systemChkbxDiv.inject(treeControlContainer, 'inside');
         systemChkbx.inject(systemChkbxDiv, 'inside');
         systemChkbxLabel.inject(systemChkbxDiv, 'inside');
         systemChkbxLabel.set('text', 'Systems');
      }
*/

      //----------------------------------------
      // 3d checkbox
      //----------------------------------------
      /*

      threeDChkbxDiv = new Element('div', {
	    'id': 'threeDChkbxDiv',
	    'class': 'threeDChkbxDiv'
	    });
      threeDChkbxLabel = new Element('label', {
	    'id': 'threeDChkbxLabel',
	    'name': 'threeDChkbxLabel',
	    'class': 'threeDChkbxLabel'
	    });
      threeDChkbx = new Element('input', {
	    'id': 'threeDChkbx',
	    'name': 'threeDChkbx',
	    'class': 'threeDChkbx',
	    'type': 'checkbox',
	    'checked': false
	    });

      threeDChkbxDiv.inject(treeControlContainer, 'inside');
      threeDChkbx.inject(threeDChkbxDiv, 'inside');
      threeDChkbxLabel.inject(threeDChkbxDiv, 'inside');
      threeDChkbxLabel.set('text', '3d');
      */

      //----------------------------------------
      // container for the tree
      //----------------------------------------
      this.treeContainer = new Element('div', {
         'id': 'tree_container',
      });
      this.treeContainer.inject(win, 'inside');

      this.treeComponent = new Mif.Tree({
         view:this.view,
	 id:"",
	 container:this.treeContainer,
	 types: {// node types
	 folder:{
	       openIcon: 'mif-tree-open-icon',//css class open icon
	       closeIcon: 'mif-tree-close-icon'// css class close icon
	    }
	 },
	 dfltType:'folder',//default node type
	 height: 11  //node height
      });

      var treeJson = this.model.getTreeData(this.layer);
      this.treeComponent.load({json: treeJson});

      this.window.setDimensions(this.width, this.height);
      //this.setToolTip(this.toolTipText);

      //----------------------------------------
      // add events for buttons
      //----------------------------------------
      selectAllButtonDiv.addEvent('click', function(){
         this.treeComponent.root.showAllDomains();
      }.bind(this));

      clearAllButtonDiv.addEvent('click', function(){
         this.treeComponent.root.clearAll();
         this.view.setSelections("", "clearAllButton");
      }.bind(this));

      threeDButtonDiv.addEvent('click', function(){
         this.treeComponent.new3d();
      }.bind(this));

      if(systemChkbxDiv) {
	 systemChkbxDiv.addEvent('change', function(){
	    this.treeComponent.setShowSystems(systemChkbx.checked);
	 }.bind(this));
      }

      if(threeDChkbxDiv) {
	 threeDChkbxDiv.addEvent('change', function(){
	    this.treeComponent.showThreeD(threeDChkbx.checked);
	 }.bind(this));
      }

   }, // createElements

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      var col;
      var colArr;
      var id;
      var bare_id;
      var treeData;
      var checkedList;
      var node;
      var obj;

      if(modelChanges.treeNodeColour === true) {
         //treeData = this.model.getTreeData(this.layer);
	 col = this.view.getRGBA();
	 colArr = [];
	 colArr[0] = col.red.toString();
	 colArr[1] = col.green.toString();
	 colArr[2] = col.blue.toString();
	 colArr[3] = (parseInt(col.alpha * 255)).toString() ;
	 id = this.view.getElementToColour();
	 bare_id = id.replace(/pic_/,'').trim();
         //console.log("treeTool.modelUpdate id ",bare_id);
	 checkedList = this.treeComponent.root.getCheckedNodes();
	 node = this.treeComponent.root.getNodeById(bare_id);
         //console.log("treeTool.modelUpdate node.color ",node.color);
	 node.color = colArr;
         //console.log("treeTool.modelUpdate node.color now ",node.color);
	 this.treeComponent.showSelected(bare_id);
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   viewUpdate: function(viewChanges, from) {

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
      currentLayer = this.view.getCurrentLayer();

      if(viewChanges.initial === true) {
	 this.window.setVisible(true);
      }

      if(viewChanges.dblClick === true) {
         this.showIndexDataInImage();
      }

      if(viewChanges.viewport === true) {

         dms = this.view.getViewportDims();
         hght = dms.height;
         treedms = this.window.getDimensions();
         treeContainer = $('tree_container');
         tcTop = parseInt(treeContainer.getStyle('top'));

         treeWrapper = $$('div.mif-tree-wrapper');

         this.window.setDimensions(treedms.w, hght);
         treeWrapper.setStyle('height', (hght-tcTop-2) + 'px');
      }

	 /*
      if(viewChanges.colour === true) {
         //console.log("viewUpdate: colour %s",viewChanges.colour);
	 id = this.view.getElementToColour();
         //console.log("viewUpdate: elementToColour id %s",id);
	 id = id.replace(/pic_/,'');
	 rgba = this.view.getRGBA();
	 this.treeComponent.root.changeImageElementColour(id, rgba);
	 this.treeComponent.showSelected(id);
      }
	 */

      if(viewChanges.hide3d === true) {
         var chk = document.getElementById("threeDChkbx");
	 chk.checked = false;
         //this.showIndexDataInImage();
      }

   }, // viewUpdate

   //---------------------------------------------------------
   setCheckedNodes: function (ids) {

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
         node = this.treeComponent.root.getNodeById(id);
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
   },

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
   showIndexDataInImage: function () {

      var indexArr = this.view.getIndexArray(this.layer); // layer ignored just now
      var indexData = this.model.getIndexData(this.layer);
      if(indexData === undefined) {
         alert("indexData undefined");
         return false;
      }

      // for now we are using just indexArr[1]
      if(indexData[indexArr[1]] !== undefined) {
         var nodeId = indexData[indexArr[1]].nodeId;
         nodeId = "cb_" + nodeId;
         this.treeComponent.processCheckExternal(nodeId);
      }
   },

   //---------------------------------------------------------------
   // add events to the colour patches
   addPatchEvent: function () {
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
	    this.enableColChoose(e);
	 }.bind(this), false);
      }
   },

   //---------------------------------------------------------------
   // event handler for colour patches
   enableColChoose: function (e) {

      var evt;
      var target;

      //console.log("enableColChoose:");

      evt = e || window.event;
      target = emouseatlas.emap.utilities.getTarget(evt);
      //console.log("enableColChoose: %s",target.id);

      this.view.setElementToColour(target.id);
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
