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
//   queryAnatomy.js
//   Implements context menu actions
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
var queryAnatomy = new Class ({

   that: this,

   initialize: function(params) {

      //console.log("enter queryAnatomy.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.name = "queryAnatomy";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.imagePath = this.model.getInterfaceImageDir();
      //console.log(this.imagePath);

      var allowClose = (params.params.allowClose === undefined) ? true : params.params.allowClose;
      allowClose = (allowClose === 'true' || allowClose === true) ? true : false;

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;
      this.borders = params.params.borders;
      this.transparent = params.params.transparent;

      this.boundingBox;

      //this.visible = true;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         borders:this.borders,
                                         transparent:this.transparent,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: this.imagePath,
					 allowClose: true,
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

      this.createElements();

      this.window.setDimensions(this.width, this.height);
      this.setQueryAnatomyVisible(false);
      //this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function(modelChanges) {

      var win = $(this.shortName + '-win');

      this.titleTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.titleTextDiv.set('text', 'Query Anatomy');

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside', 'inside');
      this.titleTextContainer.inject(topEdge, 'inside', 'inside');

      //----------------------------------------
      // the info container
      //----------------------------------------
      this.infoDiv = new Element('div', {
	 'id':'queryAnatomyInfoDiv'
      });

      this.infoText = new Element('div', {
	 'id':'queryAnatomyInfoText'
      });
      var txt = "Pause mouse over image to see anatomy term. then click to get external gene expression data associated with this term";
      this.infoText.appendText(txt);

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      this.buttonContainer = new Element('div', {
	 'id': 'queryAnatomyButtonContainer'
      });

      this.cancelButton = new Element('div', {
         'id': 'queryAnatomyCancelButton',
	 'class': 'queryAnatomyButton cancel'
      });
      this.cancelButton.appendText('Cancel');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      this.infoText.inject(this.infoDiv, 'inside');
      this.infoDiv.inject(win, 'inside');

      this.cancelButton.inject(this.buttonContainer, 'inside');
      this.buttonContainer.inject(win, 'inside');
      emouseatlas.emap.utilities.addButtonStyle('queryAnatomyCancelButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      this.cancelButton.addEvent('click',function() {
	 this.doClosed();
      }.bind(this));

   }, // createElements

   //---------------------------------------------------------------
   iterativeDeepeningDepthFirstSearch: function (root, goal) {

      var depth;
      var result;

      depth = 0;
      result = undefined;

      while(result === undefined && depth < 10) {
         result = this.depthLimitedSearch(root, goal, depth);
	 if(result !== undefined) {
	    //console.log("found domain #%d at depth %d",goal,depth);
	    return result;
	 }
	 depth = Number(depth + 1*1);
      }

   },

   //---------------------------------------------------------------
   depthLimitedSearch: function (node, goal, depth) {

      var result;
      var property;
      var children;
      var child;
      var len;
      var i;

      result = undefined;

      if(depth === 0) {
	 if(node.property) {
	    property = node.property;
	    if(property.domainId) {
	       if(property.domainId === goal) {
	          return node;
	       }
	    }
	 }
      } else if(depth > 0) {
	 children = node.children;
	 len = children.length;
	 //this.nameTheseKids(children)
	 for(i=0; i<len; i++) {
	    child = children[i];
	    result = this.depthLimitedSearch(child, goal, depth - 1);
	    if(result !== undefined) {
	       return result;
	    }
	 }
      } else {
	 //console.log("couldn't find node with domainId %s",goal);
	 return undefined;
      }
   },

   //---------------------------------------------------------------
   nameTheseKids: function (kids) {

      var child;
      var len;
      var property;
      var i;

      len = kids.length;
      console.log("..................");
      for(i=0; i<len; i++) {
         child = kids[i];
	 if(child.property) {
	    property = child.property;
            console.log("%s",property.name);
	 }
      }
      console.log("..................");
   },

   //---------------------------------------------------------------
   getEmapId: function () {

      var key;
      var layer;
      var treeData;
      var resultNode;
      var EmapIdArr;
      var EmapId;
      var compObjIndxArr;

      compObjIndxArr = this.view.getCompObjIndxArr();

      key = compObjIndxArr[1];
      layer = emouseatlas.emap.tiledImageView.getCurrentLayer();
      treeData = emouseatlas.emap.tiledImageModel.getTreeData(layer);
      resultNode = this.iterativeDeepeningDepthFirstSearch(treeData[0], key);

      //console.log("resultNode ",resultNode);

      if(resultNode === undefined) {
	 alert("Sorry, I couldn't find an EMAP number for domain %s",key);
         return undefined;
      } else {
         EmapIdArr = resultNode.property.fbId;
      }

      EmapId = EmapIdArr[0];

      //console.log("getEmapId %s",EmapId);
      return EmapId;
   },

   //---------------------------------------------------------------
   doContextMenuCancel: function () {
      // no op
      //menuWindow.open("http://www.google.co.uk","Query_Result","");
   },

   //---------------------------------------------------------------
   setExternalId: function (id) {
      //console.log("setExternalId ",id);
   },

   //---------------------------------------------------------------
   modelUpdate: function (modelChanges) {

      var dst;

      if(modelChanges.dst === true) {
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function (viewChanges, from) {

      var mode;
      var type;
      var emapId;
      var emapIdNum;
      var url;

      type = this.view.getModeSubType();

      if(viewChanges.mode) {
	 mode = this.view.getMode();
	 //console.log("mode ",mode);
	 if(mode.name === 'queryAnatomy') {
	    this.setQueryAnatomyVisible(true, type);
	 } else {
	    this.setQueryAnatomyVisible(false);
	 }
      }
      if(viewChanges.queryAnatomy) {
	 emapId = this.getEmapId();
	 url;
	 //console.log("mode sub type = ",type);
	 if(type === 0) {
            url = 'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' + emapId + '&exactmatchstructures=true&includestructuresynonyms=true'; 
	 } else if(type === 1) {
	    emapIdNum = emapId.substring(5);
	    url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=' + emapIdNum + '&sort=Gene%20symbol&returnType=assay%20results&substructures=structures';
         } else {
	    return false;
	 }

	 //console.log(url);
         this.view.getQueryResults(url);
      }

   }, // viewUpdate

   //---------------------------------------------------------------
   setQueryAnatomyVisible: function(viz, type) {
      //console.log("mode sub type = ",type);
      if(type === 0) {
         this.titleTextDiv.set('text', 'Query EMAGE');
      } else if(type === 1) {
         this.titleTextDiv.set('text', 'Query MGI GXDB');
      }
      this.window.setVisible(viz);
   },

   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.setQueryAnatomyVisible(false);
      var modes = this.view.getModes();
      this.view.setMode(modes.move.name);
   },

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
      
      return false;

      var containerPos = this.view.getToolContainerPos();
      var left;
      var top;
      left = $(this.shortName + '-container').getPosition().x;
      top = $(this.shortName + '-container').getPosition().y;
      //console.log("showToolTip left %s, top %s",left,top);
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
   }


}); // Class queryAnatomy
