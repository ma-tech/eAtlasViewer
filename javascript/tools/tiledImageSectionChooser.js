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
//   tiledImageSectionChooser.js
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
// tiledImageSectionChooser
//---------------------------------------------------------
var tiledImageSectionChooser = new Class ({

   initialize: function(params) {

      //console.log("enter tiledImageSectionChooser.initialize: ",params);
      //this.model = params.model;
      //this.view = params.view;
      this.model = emouseatlas.emap.tiledImageModel;
      this.view = emouseatlas.emap.tiledImageView;
      this.query = emouseatlas.emap.tiledImageQuery;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "SectionTool";
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

      this.querySectionNames = [];
      this.transformedOrigins = {};

      this.createElements();
   },

   //---------------------------------------------------------
   createElements: function() {

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

      var topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(topEdge, 'inside');

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.sliderTextDiv.set('text', 'Query Sections');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // containers for the sections indicators
      //----------------------------------------

      var sectionNames = this.query.getAllQuerySectionNames();
      //console.log("section names ",sectionNames);
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
      // container for the query button(s)
      //----------------------------------------
      var queryButtonDiv = new Element('div', {
      'id': 'queryButtonDiv',
      'class': 'queryButton'
      });

      top = 1 + i*25;
      queryButtonDiv.setStyles({
              'width':this.width + 'px',
              'top': top + 'px',
	      'left': '-2px'
      });

      var queryButtonTextContainer = new Element('div', {
      'id': 'queryButtonTextContainer',
      'class': 'queryButtonContainer'
      });
      
      var queryButtonTextDiv = new Element('div', {
      'id': 'queryButtonTextDiv'
      });
      
      queryButtonTextDiv.set('text', 'query with these sections');
      
      //----------------------------------------
      // add them to the tool
      //----------------------------------------
      queryButtonDiv.inject(win, 'bottom');
      
      queryButtonTextDiv.inject(queryButtonTextContainer, 'inside');
      queryButtonTextContainer.inject(queryButtonDiv, 'inside');
      
      emouseatlas.emap.utilities.addButtonStyle('queryButtonTextContainer');
      
      //----------------------------------------
      // add event handlers
      //----------------------------------------
      queryButtonDiv.addEvent('click', function(e){
      this.doQueryButtonClicked(e);
      }.bind(this));

      //----------------------------------------
      //----------------------------------------
      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

      //----------------------------------------
      // add a dummy form for transferring drawing
      //----------------------------------------

      this.dummyForm = new Element('form', {
         'id': 'spatialQueryForm',
         'name': 'spatialQueryForm',
	 'method': 'post',
	 'action': 'http://aberlour.hgu.mrc.ac.uk/emagewebapp/pages/emage_spatial_query_result.jsf'
      });

      this.dummyInputView = new Element('input', {
         'id': 'spatialQueryView',
         'name': 'spatialQueryView',
	 'type': 'hidden',
	 'value': ''
      });

      this.dummyInputDrawing = new Element('input', {
         'id': 'spatialQueryDrawing',
         'name': 'spatialQueryDrawing',
	 'type': 'hidden',
	 'value': ''
      });

      this.dummyInputOrigin = new Element('input', {
         'id': 'spatialQueryOrigin',
         'name': 'spatialQueryOrigin',
	 'type': 'hidden',
	 'value': ''
      });

      this.dummyInputStage = new Element('input', {
         'id': 'spatialQueryStage',
         'name': 'spatialQueryStage',
	 'type': 'hidden',
	 'value': '17'
      });

      this.dummyInputFromStage = new Element('input', {
         'id': 'spatialQueryFromStage',
         'name': 'spatialQueryFromStage',
	 'type': 'hidden',
	 'value': '17'
      });

      this.dummyInputToStage = new Element('input', {
         'id': 'spatialQueryToStage',
         'name': 'spatialQueryToStage',
	 'type': 'hidden',
	 'value': '17'
      });

      this.dummyInputDetect = new Element('input', {
         'id': 'spatialQueryDetect',
         'name': 'spatialQueryDetect',
	 'type': 'hidden',
	 'value': 'detected'
      });

      this.dummyInputEmbryo = new Element('input', {
         'id': 'spatialQueryEmbryo',
         'name': 'spatialQueryEmbryo',
	 'type': 'hidden',
	 'value': 'EMA49'
      });

      this.dummyInputView.inject(this.dummyForm, 'inside');
      this.dummyInputDrawing.inject(this.dummyForm, 'inside');
      this.dummyInputOrigin.inject(this.dummyForm, 'inside');
      this.dummyInputStage.inject(this.dummyForm, 'inside');
      this.dummyInputFromStage.inject(this.dummyForm, 'inside');
      this.dummyInputToStage.inject(this.dummyForm, 'inside');
      this.dummyInputEmbryo.inject(this.dummyForm, 'inside');
      this.dummyInputDetect.inject(this.dummyForm, 'inside');
      this.dummyForm.inject(win, 'inside');

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
      var sectionNames = this.query.getAllQuerySectionNames();
      var name;
      var numSections = sectionNames.length;
      var i;

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
   // If query button is clicked the combined query from all sections
   // is sent to database
   //---------------------------------------------------------------
   doQueryButtonClicked: function(e) {

      if (!e) {
	 var e = window.event;
      }
      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doQueryButtonClicked: %s",target.id);
      if(target.id.indexOf("queryButton") === -1) {
	 //console.log("doQueryButtonClicked returning: event not from text ",target.id);
	 return;
      }

      var names = [];
      var name;
      var sectionNames = this.query.getAllQuerySectionNames();
      var numSections = sectionNames.length;
      var checkbox;
      var i;

      for(i=0; i<numSections; i++) {
         name = sectionNames[i];
	 checkbox = $(name + '_sectionCheckbox');
         //console.log("checkbox: %s is checked %s",name,checkbox.checked);
	 if(checkbox.checked) {
	    //console.log("query with %s",name);
	    this.querySectionNames[this.querySectionNames.length] = name;
	    names[names.length] = name;
	 } else {
	    //console.log("omit %s",name);
	 }
      }

      // this is called recursively for all the query sections
      this.getTransformedBoundingBoxes(names);
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
         this.createElements();
	 var buttonDiv = $('queryButtonDiv');
	 buttonDiv.style.visibility = "visible";
      }
   }, // queryUpdate


   // called from query section chooser
   //--------------------------------------------------------------
   getTransformedBoundingBoxes: function(names) {

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
      
      len = names.length;
      if(len <= 0) {
         return undefined;
      }

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

      name = names.shift();
	 drawingData = this.query.getQuerySectionData(name);
	 //console.log("drawingData ",drawingData);
	 section = drawingData.section;

      transformedBoundingBoxUrl = 
         iipServer + "?wlz=" +  layer.imageDir + layer.imageName                                                                                                
         + "&mod=" + section.mod                                                                                                                                               
         + "&fxp=" + section.fxp.x + ',' + section.fxp.y + ','+ section.fxp.z                                                                                                
         + "&dst=" + section.dst                                                                                                                                                              
         + "&pit=" + section.pit
         + "&yaw=" + section.yaw
         + "&rol=" + section.rol
         + "&obj=Wlz-transformed-3d-bounding-box";

      //console.log("transformedBoundingBoxUrl ",transformedBoundingBoxUrl);

      jsonStr = emouseatlas.JSON.stringify(names);
      //console.log("jsonStr ",jsonStr);

      ajaxParams = {
         url:transformedBoundingBoxUrl,
	 method:"POST",
	 callback: function (response) {
	    this.getTransformedBoundingBoxCallback(response, name, jsonStr);
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
   getTransformedBoundingBoxCallback: function (response, name, querySectionNamesStr) {

      //console.log("getTransformedBoundingBoxCallback querySectionNamesStr ",querySectionNamesStr);
      var stringifiedOrigins;
      var querySectionNamesArr = [];
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

      //console.log("getTransformedBoundingBoxCallback response = ",response);
      querySectionNamesArr = emouseatlas.JSON.parse(querySectionNamesStr);
      //console.log("getTransformedBoundingBoxCallback querySectionNamesArr = ",querySectionNamesArr);

      values = response.split("Wlz-transformed-3d-bounding-box:")[1]
      valArr = values.split(" ");
      //console.log("getTransformedBoundingBoxCallback valArr = ",valArr);
      x = valArr[4];
      y = valArr[2];
      z = valArr[0];

      if(this.transformedOrigins[name] === undefined) {
         this.transformedOrigins[name] = {sectionName:name, x:x , y:y , z:z };
      }

      if(querySectionNamesArr && querySectionNamesArr.length > 0) {
         this.getTransformedBoundingBoxes(querySectionNamesArr);
      } else {
         //console.log("FINISHED GETTING TRANSFORMED BOUNDING BOXES ", this.transformedOrigins);
         stringifiedOrigins = emouseatlas.JSON.stringify(this.transformedOrigins);
         //console.log("stringifiedOrigins ",stringifiedOrigins);
         this.dummyInputOrigin.value = stringifiedOrigins;
         this.sendQuery();
      }
   },

   //---------------------------------------------------------
   sendQuery: function () {

      var len = this.querySectionNames.length;
      var queryArr = [];
      var queryStr = "";
      var queryStrHeader = "WLZ_DRAW_DOMAIN:1;";
      var iipUrl = "";
      var name;
      var drawingData;
      var trimmedDrawing;
      var stringifiedDrawing;
      var origin;
      var originStr;
      var section;
      var i;
  
      var webServer = this.model.getWebServer();
      var iipServer = this.model.getIIPServer();
      var currentLayer = this.view.getCurrentLayer();
      var layerData = this.model.getLayerData();
      var layer;
      
      //console.log("sendQuery: querySections ",querySections);
      if(webServer === undefined || iipServer === undefined) {
         //console.log("webServer or iipServer undefined");
         return false;
      }

      if(layerData === null) {
         //console.log("layerData null");
         return false;
      }

      layer = layerData[currentLayer];
      if(layer === undefined || layer === null) {
         //console.log("layer undefined");
         return false;
      }
      iipUrl = 
         iipUrl +
         "VIEW:" +
         iipServer +
	 ":" +
	 layer.imageDir +
	 layer.imageName;

      //queryStrHeader = queryStrHeader + iipUrl;

      if(len <= 0) {
         return false;
      }
      queryStr += queryStrHeader;
      for(i=0; i<len; i++) {
         name = this.querySectionNames[i];
	 drawingData = this.query.getQuerySectionData(name);
	 //console.log("drawingData ",drawingData);
	 stringifiedDrawing = emouseatlas.emap.utilities.stringifyDrawing(drawingData.drg);
	 //console.log("stringifiedDrawing ",stringifiedDrawing);
	 section = drawingData.section;

	 var tmpStr =
	    iipUrl +
	    ":" +
	    section.mod +
	    ":" +
	    section.fxp.x + ',' + section.fxp.y + ',' + section.fxp.z +
	    ":" +
	    section.pit +
	    ":" +
	    section.yaw +
	    ":" +
	    section.rol +
	    ":" +
	    section.dst +
	    ";" +
	    stringifiedDrawing;

	    queryStr += tmpStr;

            //origin = emouseatlas.JSON.stringify(this.transformedOrigins[name]);
            origin = this.transformedOrigins[name];
            originStr = 
               "ORIGIN:" +
               origin.x +
               "," +
               origin.y +
               "," +
               origin.z +
	       ";";

	    queryStr += originStr;
      }

      this.dummyInputView.value = iipUrl;
      //console.log("iipUrl ",iipUrl);
      this.dummyInputDrawing.value = queryStr;
      //console.log(queryStr);
      //this.dummyForm.submit();

      return false;
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
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }.bind(this)


});
