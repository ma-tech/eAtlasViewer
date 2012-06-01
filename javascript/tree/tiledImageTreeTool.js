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

      //console.log("enter tiledImageTreeTool.initialize: ",params);
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

      this.toRight = (params.toRight === undefined) ? "true" : this.toRight;
      this.toRight = (this.toRight === "false") ? false : true;
      //console.log("tiledImageTreeTool toRight ",this.toRight);

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

      var win = $(this.shortName + '-win');

      //----------------------------------------
      // container for treeTool title
      //----------------------------------------
      this.titleContainer = new Element('div', {
         'id': 'treeToolTitleContainer'
      });

      this.treeToolTitleText = new Element('div', {
         'id': 'treeToolTitleText'
      });
      this.treeToolTitleText.appendText(this.title);

      var topEdge = $(this.shortName + '-topedge');

      this.treeToolTitleText.inject(this.titleContainer, 'inside');
      this.titleContainer.inject(topEdge, 'inside');
 
      //----------------------------------------
      // container for additional controls
      //----------------------------------------
      this.treeControlContainer = new Element('div', {
         'id': 'treeControlContainer',
      });
      this.treeControlContainer.inject(win, 'inside');

      //----------------------------------------
      // Select All button
      //----------------------------------------
      this.selectAllButtonDiv = new Element('div', {
         'id': 'treeSelectAllButtonDiv',
	 'class': 'treeButtonDiv'
      });
      this.selectAllButtonDiv.inject(this.treeControlContainer, 'inside');
      this.selectAllButtonText = new Element('div', {
         'id': 'treeSelectAllButtonText',
	 'class': 'treeButtonText'
      });
      this.selectAllButtonText.inject(this.selectAllButtonDiv, 'inside');
      this.selectAllButtonText.appendText('Select All');

      emouseatlas.emap.utilities.addButtonStyle("treeSelectAllButtonDiv");

      //----------------------------------------
      // Clear All button
      //----------------------------------------
      this.clearAllButtonDiv = new Element('div', {
         'id': 'treeClearAllButtonDiv',
	 'class': 'treeButtonDiv'
      });
      this.clearAllButtonDiv.inject(this.treeControlContainer, 'inside');
      this.clearAllButtonText = new Element('div', {
         'id': 'treeClearAllButtonText',
	 'class': 'treeButtonText'
      });
      this.clearAllButtonText.inject(this.clearAllButtonDiv, 'inside');
      this.clearAllButtonText.appendText('Clear All');

      emouseatlas.emap.utilities.addButtonStyle("treeClearAllButtonDiv");

      //----------------------------------------
      // Reset button
      //----------------------------------------
      /*
      this.resetButtonDiv = new Element('div', {
         'id': 'resetButtonDiv',
	 'class': 'treeButtonDiv'
      });
      this.resetButtonDiv.inject(this.treeControlContainer, 'inside');
      this.resetButtonText = new Element('div', {
         'id': 'resetButtonText',
	 'class': 'treeButtonText'
      });
      this.resetButtonText.inject(this.resetButtonDiv, 'inside');
      this.resetButtonText.appendText('Reset');

      emouseatlas.emap.utilities.addButtonStyle("resetButtonDiv");
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
      this.selectAllButtonDiv.addEvent('click', function(){
         this.treeComponent.root.showAllDomains(true);
      }.bind(this));

      this.clearAllButtonDiv.addEvent('click', function(){
         this.treeComponent.root.showAllDomains(false);
         this.view.setSelections("");
      }.bind(this));

      /*
      this.resetButtonDiv.addEvent('click', function(){
         this.view.setSelections("");
      }.bind(this));

      //this.createMenu();
      */
      this.cpInit();

   }, // initialize

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

      //console.log("tiledImageTreeTool: ",viewChanges);
      var currentLayer = this.view.getCurrentLayer();

      if(viewChanges.initial === true) {
	 this.window.setVisible(true);
      }

      if(viewChanges.dblClick === true) {
         this.showIndexDataInImage();
      }

      if(viewChanges.viewport === true) {
         var dms;
         var hght;
         var treedms;
         var treeContainer;
         var tcTop;
         var treeWrapper;

         dms = this.view.getViewportDims();
         hght = dms.height;
         treedms = this.window.getDimensions();
         treeContainer = $('tree_container');
         tcTop = parseInt(treeContainer.getStyle('top'));

         treeWrapper = $$('div.mif-tree-wrapper');

         this.window.setDimensions(treedms.w, hght);
         treeWrapper.setStyle('height', (hght-tcTop-2) + 'px');
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
   //create a context menu
   /*
   createMenu: function () {
      var context = new ContextMenu({
	 targets: 'span.mif-tree-name', //menu only spans with given class
	 menu: 'contextmenu',
	 actions: {
	    copy: function(element,ref) { //copy action changes the element's color to green and disables the menu
	       element.setStyle('color','#090');
	       ref.disable();
	    }
	 },
	 offsets: { x:0, y:-10 }
      });
   },
   */

   //---------------------------------------------------------------
   //initialise the colour picker
   cpInit: function () {
      var sphere = new UvumiSphere('.pick',{
	 onChange:function(input,hex){
	    var id = input.id;
	    id = id.substr(id.indexOf('_')+1);
	    $(input).setStyle('background-color',hex);
	    var node = this.treeComponent.root.getNodeById(id);
	    node.color = hex.hexToRgb(true);
	    this.treeComponent.root.showSelected();
	 }.bind(this)
      });
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
