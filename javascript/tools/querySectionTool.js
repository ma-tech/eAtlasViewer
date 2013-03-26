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
//   querySectionTool.js
//   Tool to manipulate sections in a High resolution tiled image from an iip server
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
var querySectionTool = new Class ({

   initialize: function(params) {

      //console.log("enter querySectionTool.initialize: ",params);
      //this.model = params.model;
      //this.view = params.view;
      this.model = emouseatlas.emap.tiledImageModel;
      this.view = emouseatlas.emap.tiledImageView;
      this.query = emouseatlas.emap.tiledImageQuery;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "querySectionTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;
      this.propertiesToolTipText = 'open properties dialogue';

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);

      this.baseHeight = 0;
      this.heightOfOneSection = 25;

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
      //console.log("sectionTool: x ",x,", ",y);
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

      this.createElements();
   },

   //---------------------------------------------------------
   createElements: function() {

      //console.log("querySectionTool createElements");

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
      this.sliderTextDiv.set('text', 'Query Sections');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(this.topEdge, 'inside');

      //----------------------------------------
      // containers for the sections indicators
      //----------------------------------------

      var sectionNames = this.query.getAllQuerySectionNames();
      //console.log("query section names ",sectionNames);
      var numSections = sectionNames.length;;

      //this.height = this.baseHeight + (numSections + 1*1) * this.heightOfOneSection;
      this.height = this.baseHeight + numSections * this.heightOfOneSection;

      var i;
      var klass = 'sectionDiv';

      for(i=0; i<numSections; i++) {
         var top = 2 + i*25;
	 var wid = this.width - 4;
	 var txtwid = this.width - 30;

         if(i === numSections -1) {
	    klass = 'sectionDiv selected';
	 }
	 var sectionDiv = new Element('div', {
	    'id': sectionNames[i] + '_sectionDiv',
	    'class': klass
	 });
	 sectionDiv.setStyles({
                             'width':wid+'px',
                             'top': top + 'px'
                            });

	 var sectionTextContainer = new Element('div', {
	    'id': sectionNames[i] + '_sectionTextContainer',
	    'class': 'sectionTextContainer'
	 });

	 var sectionTextDiv = new Element('div', {
	    'id': sectionNames[i] + '_sectionTextDiv',
	    'class': 'sectionTextDiv'
	 });

	 sectionTextDiv.set('text', sectionNames[i]);
	 sectionTextDiv.setStyle('width',txtwid+'px');

	 var sectionCheckboxContainer = new Element('div', {
	    'id': sectionNames[i] + '_checkboxContainer',
	    'class': 'checkboxDiv_section'
	 });

	 var sectionCheckbox = new Element( 'input', {
	    'id': sectionNames[i] + '_sectionCheckbox',
	    'type': 'checkbox',
	    'checked': 'checked'
	 });

	 var sectionTrashContainer = new Element('div', {
	    'id': sectionNames[i] + '_trashContainer',
	    'class': 'trashContainer'
	 });

	 var trashIcon = new Element( 'img', {
	    'id': sectionNames[i] + '_trash',
	    'src': '/eAtlasViewer_dev/images/trash_canfull.png',
	    'class': 'trashIcon'
	 });

	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 //console.log("adding ",sectionDiv.id);
	 sectionDiv.inject(win, 'inside');

	 sectionCheckbox.inject(sectionCheckboxContainer, 'inside');
	 sectionCheckboxContainer.inject(sectionDiv, 'inside');

	 sectionTextDiv.inject(sectionTextContainer, 'inside');
	 sectionTextContainer.inject(sectionDiv, 'inside');

	 trashIcon.inject(sectionTrashContainer, 'inside');
	 sectionTrashContainer.inject(sectionDiv, 'inside');

         emouseatlas.emap.utilities.addButtonStyle(sectionNames[i] + '_trashContainer');

	 //----------------------------------------
	 // add event handlers
	 //----------------------------------------

	 sectionCheckbox.addEvent('change', function(e){
	    this.doCheckboxChanged(e);
	 }.bind(this));

	 sectionDiv.addEvent('click', function(e){
	    this.doSectionClicked(e);
	 }.bind(this));

      } // for

      //----------------------------------------
      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

   }, // createElements

   //---------------------------------------------------------------
   // If checkbox is checked the section will be loaded and displayed
   //---------------------------------------------------------------
   doCheckboxChanged: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doCheckboxChanged: target ",target);
      //var type = emouseatlas.emap.utilities.getEventType(e);

      // the checkbox is in the section div so ignore section click events
      if(target.id.indexOf("_sectionCheckbox") === -1) {
	 //console.log("doCheckboxChanged returning: event not from checkbox ",target.id);
         return;
      }

      var sectionNames = this.query.getAllQuerySectionNames();
      var numSections = sectionNames.length;
      var i;

      for(i=0; i<numSections; i++) {
	 if($(sectionNames[i] + '_sectionCheckbox') === target) {
	    //console.log(target," checked ",target.checked);
	    break;
	 }
      }

   },

   //---------------------------------------------------------------
   // If section is clicked it becomes the current section (blue)
   //---------------------------------------------------------------
   doSectionClicked: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doSectionClicked: %s",target.id);
      //var type = emouseatlas.emap.utilities.getEventType(e);
      // the checkbox is in the section div so ignore checkbox events
      if(target.id.indexOf("_sectionText") === -1) {
	 //console.log("doSectionClicked returning: event not from text ",target.id);
	 return;
      }

      var curSection;
      var querySection;
      var sectionDiv;
      var sectionNames;
      var name;
      var numSections;
      var i;

      sectionNames = this.query.getAllQuerySectionNames();
      //console.log(sectionNames);
      numSections = sectionNames.length;

      curSection = this.model.getCurrentSection();

      for(i=0; i<numSections; i++) {
         name = sectionNames[i];
	 sectionDiv = $(name + '_sectionDiv');
         //console.log("doSectionClicked: name %s",name);
	 if(target.id.indexOf(name) !== -1) {
	    //console.log("select %s",name);
	    sectionDiv.className = 'sectionDiv selected';
            querySection = this.query.getQuerySectionAtIndex(i);
            //console.log("doSectionClicked: querySection ",querySection);
            if(emouseatlas.emap.utilities.isSameSection(curSection, querySection)) {
               //console.log("chose same section");
            }
	    this.query.selectQuerySection(i);
	 } else {
	    //console.log("deselect %s",name);
	    sectionDiv.className = 'sectionDiv';
	 }
      }
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      if(viewChanges.initial === true) {
	 this.window.setVisible(false);
      }

      if(viewChanges.mode === true) {
	 var mode = this.view.getMode();
	 if(mode.name === "querySpatial") {
	    this.window.setVisible(true);
	 } else {
	    this.window.setVisible(false);
	 }
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   }, // viewUpdate

   //---------------------------------------------------------------
   queryUpdate: function(queryChanges) {

      if(queryChanges.addQuerySection === true) {
         //console.log("addQuerySection");
	 this.window.setVisible(true);
         this.createElements();
      }

      if(queryChanges.spatialSelected === true) {
         //console.log("spatialSelected");
	 this.window.setVisible(true);
      }

      if(queryChanges.anatomySelected === true) {
         //console.log("anatomySelected");
	 this.window.setVisible(false);
      }

      if(queryChanges.spatialImport === true) {
         //console.log("spatialImport");
	 this.window.setVisible(true);
         this.createElements();
	 //var name = this.query.getQuerySectionName();
	 //console.log("query section %s",name);
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

});
