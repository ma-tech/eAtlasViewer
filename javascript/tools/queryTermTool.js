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
//   queryTermTool.js
//   Tool to manipulate terms in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// queryTermTool
//---------------------------------------------------------
var queryTermTool = new Class ({

   initialize: function(params) {

      //console.log("enter queryTermTool.initialize: ",params);
      //this.model = params.model;
      //this.view = params.view;
      this.model = emouseatlas.emap.tiledImageModel;
      this.view = emouseatlas.emap.tiledImageView;
      this.query = emouseatlas.emap.tiledImageQuery;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "queryTermTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;
      this.propertiesToolTipText = 'open properties dialogue';

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);

      this.baseHeight = 0;
      this.heightOfOneTerm = 20;

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
      //console.log("termTool: x ",x,", ",y);
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

      this.createElements(undefined);
   },

   //---------------------------------------------------------
   createElements: function(termData) {

      var container;
      var leftedge;
      var rightedge;
      var handle;
      var win;
      var topEdge;
      var reverseData;
      var term;
      var name;
      var id;
      var total;
      var klass;
      var top;
      var wid;
      //var txtwid;
      var termDiv;
      var termTextDiv;
      var termTextContainer;
      var termCheckboxContainer;
      var termCheckbox;
      var termTrashContainer;
      var trashIcon;

      //------------------------------------
      // give the term tool a maximum height
      //------------------------------------
      container = $(this.shortName + '-container');
      container.setStyles({
	 'max-height': '304px'
      });
      leftedge = $(this.shortName + '-leftedge');
      leftedge.setStyles({
	 'max-height': '302px'
      });
      rightedge = $(this.shortName + '-rightedge');
      rightedge.setStyles({
	 'max-height': '302px'
      });
      handle = $(this.shortName + '-handle');
      handle.setStyles({
	 'max-height': '312px'
      });

      win = $(this.shortName + '-win');
      // make sure existing elements are removed.
      // or they will appear multiple times
      emouseatlas.emap.utilities.removeChildNodes(win);

      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer5'
      });

      topEdge = $(this.shortName + '-topedge');
      emouseatlas.emap.utilities.removeChildNodes(topEdge);
      this.spacer.inject(topEdge, 'inside');

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.sliderTextDiv.set('text', 'Query Terms');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(topEdge, 'inside');

      this.height = this.baseHeight;

      if(termData === undefined) {
         this.window.setDimensions(this.width, this.height);
         this.setToolTip(this.toolTipText);
	 return false;
      }

      //----------------------------------------
      // background div
      //----------------------------------------
      bkgDiv = new Element('div', {
         'id': 'queryTermBkg',
	 'max-height': '300px'
      });

      //----------------------------------------
      // containers for the term indicators
      //----------------------------------------

      klass = 'termDiv';
      total = 0;
      reverseData = emouseatlas.emap.utilities.reverseObject(termData);

      for(key in reverseData) {

         if(!reverseData.hasOwnProperty(key)) {
	    continue;
	 }

         term = reverseData[key];
	 name = reverseData[key].name;
	 id = term.fbId[0];
	 //console.log("term ",term);
	 //console.log("term  %s, %s",name,id);

         top = total*20;
	 wid = this.width;
	 //txtwid = this.width - 30;

	 termDiv = new Element('div', {
	    'id': name + '_termDiv',
	    'class': klass
	 });
	 termDiv.setStyles({
                             'top': top + 'px'
                            });

	 termTextContainer = new Element('div', {
	    'id': name + '_termTextContainer',
	    'class': 'termTextContainer'
	 });

	 termTextDiv = new Element('div', {
	    'id': name + '_termTextDiv',
	    'class': 'termTextDiv'
	 });

	 termTextDiv.set('text', term.name);
	 //termTextDiv.setStyle('width',txtwid+'px');

	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 /*
	 termDiv.inject(bkgDiv, 'inside');
	 termTextDiv.inject(termTextContainer, 'inside');
	 termTextContainer.inject(termDiv, 'inside');
	 */
	 termDiv.inject(win, 'inside');
	 termTextDiv.inject(termTextContainer, 'inside');
	 termTextContainer.inject(termDiv, 'inside');

	 if(total > 20) {
	    console.log("scrollbar needed");
	 }

         total++;

      } // for

      //bkgDiv.inject(win, 'inside');

      //----------------------------------------
      if(total > 9) {
         win.setStyles({
            'overflow': 'auto',
   	 'max-height': '300px'
         });
      }
      //win.style.background="background-color=#eaeaea";

      //----------------------------------------
      this.height = this.baseHeight + total * this.heightOfOneTerm;
      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

   }, // createElements

   //---------------------------------------------------------------
   // If checkbox is checked the term will be loaded and displayed
   //---------------------------------------------------------------
   doCheckboxChanged: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doCheckboxChanged: target ",target);
      //var type = emouseatlas.emap.utilities.getEventType(e);

      // the checkbox is in the term div so ignore term click events
      if(target.id.indexOf("_termCheckbox") === -1) {
	 //console.log("doCheckboxChanged returning: event not from checkbox ",target.id);
         return;
      }

      var termNames = this.query.getAllQueryTermNames();
      var numTerms = termNames.length;
      var i;

      for(i=0; i<numTerms; i++) {
	 if($(termNames[i] + '_termCheckbox') === target) {
	    //console.log(target," checked ",target.checked);
	    break;
	 }
      }

   },

   //---------------------------------------------------------------
   // If term is clicked it becomes the current term (blue)
   //---------------------------------------------------------------
   doTermClicked: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doTermClicked: %s",target.id);
      //var type = emouseatlas.emap.utilities.getEventType(e);
      // the checkbox is in the term div so ignore checkbox events
      if(target.id.indexOf("_termText") === -1) {
	 //console.log("doTermClicked returning: event not from text ",target.id);
	 return;
      }

      var curTerm;
      var queryTerm;
      var termDiv;
      var termNames = this.query.getAllQueryTermNames();
      var name;
      var numTerms = termNames.length;
      var i;

      curTerm = this.model.getCurrentTerm();

      for(i=0; i<numTerms; i++) {
         name = termNames[i];
	 termDiv = $(name + '_termDiv');
         //console.log("doTermClicked: name %s",name);
	 if(target.id.indexOf(name) !== -1) {
	    //console.log("select %s",name);
	    termDiv.className = 'termDiv selected';
            queryTerm = this.query.getQueryTermAtIndex(i);
            //console.log("doTermClicked: queryTerm ",queryTerm);
            if(emouseatlas.emap.utilities.isSameTerm(curTerm, queryTerm)) {
               //console.log("chose same term");
            }
	    this.query.selectQueryTerm(i);
	 } else {
	    //console.log("deselect %s",name);
	    termDiv.className = 'termDiv';
	 }
      }
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      var mode;
      var viz;

      if(viewChanges.initial === true) {
	 this.window.setVisible(false);
      }

      if(viewChanges.mode === true) {

	 mode = this.view.getMode();
	 if(mode.name === "query" && this.query.getQueryType() === "anatomy") {
	    this.window.setVisible(true);
	 } else {
	    this.window.setVisible(false);
	 }
      }

      if(viewChanges.toolbox === true) {
	viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   }, // viewUpdate

   //---------------------------------------------------------------
   queryUpdate: function(queryChanges) {

      var termData;

      if(queryChanges.addQueryTerm === true) {
         //console.log("addQueryTerm");
	 termData = this.query.getQueryTermData();
         //console.log("termData ",termData);
         this.createElements(termData);
      }

      if(queryChanges.spatialSelected === true) {
         //console.log("spatial selected");
	 this.window.setVisible(false);
      }

      if(queryChanges.anatomySelected === true) {
         //console.log("anatomy selected");
	 this.window.setVisible(true);
      }
   }, // queryUpdate

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

}); // queryTermTool
