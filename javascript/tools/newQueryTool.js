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
//   newQueryTool.js
//   Implements context menu actions
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
// newQueryTool
//---------------------------------------------------------
emouseatlas.emap.newQueryTool = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var model;
   var view;
   var query;
   var util;
   var trgt;
   var project;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      query = emouseatlas.emap.tiledImageQuery;
      util = emouseatlas.emap.utilities;

      model.register(this);
      view.register(this);
      query.register(this);

      project = (params.project === undefined) ? "emap" : params.project;

      dropTargetId = model.getProjectDivId();
      trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      mu = ' \u03BCm';
      createElements();
      emouseatlas.emap.drag.register({drag:"newQueryToolContainer", drop:dropTargetId});

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(modelChanges) {

      var newQueryToolContainer;
      var target;
      var queryModes;
      var titleTextContainer;
      var titleTextDiv;
      var titleTextContainer;
      var newQueryToolSpacerBGDark_1;
      var newQueryToolSpacerBGLight_1;
      var dbChoiceContainer;
      var dbItemContainer_emage;
      var dbTextContainer_emage;
      var dbTextDiv_emage;
      var dbRadioContainer_emage;
      var dbItemContainer_mgi;
      var dbTextContainer_mgi;
      var dbTextDiv_mgi;
      var dbRadioContainer_mgi;
      var queryChoiceContainer;
      var queryTypeContainer_anatomy;
      var queryTypeTextContainer_anatomy;
      var queryTypeTextDiv_anatomy;
      var queryTypeRadioContainer_anatomy;
      var queryTypeContainer_spatial;
      var queryTypeTextContainer_spatial;
      var queryTypeTextDiv_spatial;
      var queryTypeRadioContainer_spatial;
      var buttonContainer;
      var buttonContainerBkg;
      var queryButton;
      var exportButton;
      var importButton;
      var cancelButton;
      var webServer;
      var iipServer;
      var action;

      newQueryToolContainer = new Element('div', {
	 'id': 'newQueryToolContainer'
      });
      //target = $(trgt);
      target = $(dropTargetId);
      newQueryToolContainer.inject(target, 'inside');

      queryModes = model.getQueryModes();

      titleTextContainer = new Element('div', {
         'class': 'queryTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'queryTitleText'
      });
      titleTextDiv.set('text', 'Database Query');

      titleTextDiv.inject(titleTextContainer, 'inside');
      titleTextContainer.inject(newQueryToolContainer, 'inside');

      //----------------------------------------
      // the container for the database Choice
      //----------------------------------------
      dbChoiceContainer = new Element('div', {
	 'id': 'newQueryToolDbChoiceContainer'
      });

      //----------------------------------------
      // the container for first database choice
      //----------------------------------------

      dbItemContainer_emage = new Element('div', {
	 'id': 'newQueryToolDbItemContainer_emage',
	 'class': 'newQueryToolDbItem'
      });

      dbTextContainer_emage = new Element('div', {
         'id': 'dbTextContainer_emage',
         'class': 'dbTextContainer'
      });

      dbTextDiv_emage = new Element('div', {
         'id': 'dbTextDiv_emage',
         'class': 'dbTextDiv'
      });

      if(project.toLowerCase() === "gudmap") {
         dbTextDiv_emage.set('text', 'GUDMAP');
      } else {
         dbTextDiv_emage.set('text', 'EMAGE');
      }

      dbRadioContainer_emage = new Element('div', {
         'id': 'dbRadioContainer_emage',
         'class': 'dbRadioContainer'
      });

      dbRadio_emage = new Element('input', {
          "type": "radio",
          "checked": true,
          "id": "dbRadio_emage",
          "name": "dbRadio",
          "class": "dbRadio"
      });

      if(project.toLowerCase() !== "gudmap") {
	 //----------------------------------------
	 // the container for second database choice
	 //----------------------------------------

	 dbItemContainer_mgi = new Element('div', {
	    'id': 'newQueryToolDbItemContainer_mgi',
	    'class': 'newQueryToolDbItem'
	 });

	 dbTextContainer_mgi = new Element('div', {
	    'id': 'dbTextContainer_mgi',
	    'class': 'dbTextContainer'
	 });

	 dbTextDiv_mgi = new Element('div', {
	    'id': 'dbTextDiv_mgi',
	    'class': 'dbTextDiv'
	 });
	 dbTextDiv_mgi.set('text', 'MGI GXD');

	 dbRadioContainer_mgi = new Element('div', {
	    'id': 'dbRadioContainer_mgi',
	    'class': 'dbRadioContainer'
	 });

	 dbRadio_mgi = new Element('input', {
	     "type": "radio",
	     "checked": false,
	     "id": "dbRadio_mgi",
             "name": "dbRadio",
	     "class": "dbRadio"
	 });
      }

      if(queryModes.spatial) {
         dbRadio_mgi.disabled = true;
      }

      //----------------------------------------
      // add db items
      //----------------------------------------
      dbTextDiv_emage.inject(dbTextContainer_emage, 'inside');
      dbTextContainer_emage.inject(dbItemContainer_emage, 'inside');
      dbRadio_emage.inject(dbRadioContainer_emage, 'inside');
      dbRadioContainer_emage.inject(dbItemContainer_emage, 'inside');
      dbItemContainer_emage.inject(dbChoiceContainer, 'inside');
      //----------------------------------------
      // event handler for checkbox
      //----------------------------------------
      dbRadio_emage.addEvent('mouseup',function(e) {
	 doRadio(e);
      });

      if(project.toLowerCase() !== "gudmap") {
	 dbTextDiv_mgi.inject(dbTextContainer_mgi, 'inside');
	 dbTextContainer_mgi.inject(dbItemContainer_mgi, 'inside');
	 dbRadio_mgi.inject(dbRadioContainer_mgi, 'inside');
	 dbRadioContainer_mgi.inject(dbItemContainer_mgi, 'inside');
	 dbItemContainer_mgi.inject(dbChoiceContainer, 'inside');
	 //----------------------------------------
	 // event handler for checkbox
	 //----------------------------------------
	 dbRadio_mgi.addEvent('mouseup',function(e) {
	    doRadio(e);
	 });
      }

      dbChoiceContainer.inject(newQueryToolContainer, 'inside');

      //============================================================
      //----------------------------------------
      // spacer
      //----------------------------------------
      newQueryToolSpacer_1 = new Element('div', {
         "class": "newQueryToolSpacer"
      });
      newQueryToolSpacer_1.inject(newQueryToolContainer, 'inside');
      newQueryToolSpacerBGdark_1 = new Element('div', {
         "class": "newQueryToolSpacerBGdark"
      });
      newQueryToolSpacerBGlight_1 = new Element('div', {
         "class": "newQueryToolSpacerBGlight"
      });
      newQueryToolSpacerBGdark_1.inject(newQueryToolSpacer_1, 'inside');
      newQueryToolSpacerBGlight_1.inject(newQueryToolSpacer_1, 'inside');

      //============================================================
      //----------------------------------------
      // the container for the query & cancel buttons
      //----------------------------------------
      buttonContainerBkg = new Element('div', {
	 'id': 'newQueryToolButtonContainerBkg'
      });

      buttonContainer = new Element('div', {
	 'id': 'newQueryToolButtonContainer'
      });

      queryButton = new Element('div', {
         'id': 'newQueryToolQueryButton',
	 'class': 'newQueryToolButton'
      });
      queryButton.appendText('Query');

      cancelButton = new Element('div', {
         'id': 'newQueryToolCancelButton',
	 'class': 'newQueryToolButton'
      });
      cancelButton.appendText('Cancel');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------
      queryButton.inject(buttonContainer, 'inside');
      cancelButton.inject(buttonContainer, 'inside');

      buttonContainer.inject(buttonContainerBkg, 'inside');
      buttonContainerBkg.inject(newQueryToolContainer, 'inside');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      cancelButton.addEvent('click',function() {
	 doCancel();
      });

      queryButton.addEvent('click',function(e) {
	 doQueryButtonClicked(e);
      });

      //----------------------------------------
      // add button style (after buttons added to newQueryToolContainer)
      //----------------------------------------
      emouseatlas.emap.utilities.addButtonStyle('newQueryToolQueryButton');
      emouseatlas.emap.utilities.addButtonStyle('newQueryToolCancelButton');
      //============================================================
/*
      if(queryModes.spatial) {
         //----------------------------------------
         // the container for the export & import buttons
         //----------------------------------------
         buttonContainerBkg2 = new Element('div', {
   	 'id': 'newQueryToolButtonContainerBkg2'
         });
   
         buttonContainer2 = new Element('div', {
   	 'id': 'newQueryToolButtonContainer2'
         });
   
         exportButton = new Element('div', {
            'id': 'newQueryToolExportButton',
   	 'class': 'newQueryToolButton'
         });
         exportButton.appendText('Export');
   
         importButton = new Element('div', {
            'id': 'newQueryToolImportButton',
   	 'class': 'newQueryToolButton'
         });
         importButton.appendText('Import');
   
         //----------------------------------------
         // add them to the tool
         //----------------------------------------
         exportButton.inject(buttonContainer2, 'inside');
         importButton.inject(buttonContainer2, 'inside');
   
         buttonContainer2.inject(buttonContainerBkg2, 'inside');
         buttonContainerBkg2.inject(newQueryToolContainer, 'inside');
   
         //----------------------------------------
         // event handlers
         //----------------------------------------
         exportButton.addEvent('click',function() {
   	 doExportQuery();
         });
   
         importButton.addEvent('click',function(e) {
   	 getImportFile(e);
         });
   
   
         //----------------------------------------
         // add button style (after buttons added to newQueryToolContainer)
         //----------------------------------------
         emouseatlas.emap.utilities.addButtonStyle('newQueryToolExportButton');
         emouseatlas.emap.utilities.addButtonStyle('newQueryToolImportButton');
      }

      //============================================================
      //----------------------------------------
      // The dummy file input for importing a query
      //----------------------------------------

      var queryImportFile = new Element('input', {
         'id': 'queryImportFile',
         'name': 'queryImportFile',
	 'type': 'file'
      });

      //queryImportFile.inject(newQueryToolContainer, 'inside');

      //----------------------------------------
      // event handler
      //----------------------------------------
      queryImportFile.addEvent('change',function() {
	 doImport();
      });

      //============================================================
      //----------------------------------------
      // add a dummy form for exporting a query
      //----------------------------------------

      queryExportForm = new Element('form', {
         'id': 'queryExportForm',
         'name': 'queryExportForm',
	 'method': 'post',
	 'action': '/eatlasviewerwebapp/ExportQuery'
      });

      dummyQueryExport = new Element('input', {
         'id': 'dummyQueryExport',
         'name': 'dummyQueryExport',
	 'type': 'hidden',
	 'value': ''
      });

      dummyQueryExport.inject(queryExportForm, 'inside');
      //queryExportForm.inject(newQueryToolContainer, 'inside');

      //============================================================
      //----------------------------------------
      // add a dummy form for transferring drawing
      //----------------------------------------
      webServer = model.getWebServer();
      //console.log("web server: %s",webServer);

      // for production (test and released) use emagewebapp not nb_emagewebapp
      //action = webServer + "/emagewebapp/pages/emage_spatial_query_result.jsf";
      action = webServer + "/nb_emagewebapp/pages/emage_spatial_query_result.jsf";
      //console.log("action: %s",action);

      dummyForm = new Element('form', {
         'id': 'spatialQueryForm',
         'name': 'spatialQueryForm',
	 'method': 'post',
	 'action': action
      });

      dummyInputView = new Element('input', {
         'id': 'spatialQueryView',
         'name': 'spatialQueryView',
	 'type': 'hidden',
	 'value': ''
      });

      dummyInputDrawing = new Element('input', {
         'id': 'spatialQueryDrawing',
         'name': 'spatialQueryDrawing',
	 'type': 'hidden',
	 'value': ''
      });

      dummyInputOrigin = new Element('input', {
         'id': 'spatialQueryOrigin',
         'name': 'spatialQueryOrigin',
	 'type': 'hidden',
	 'value': ''
      });

      dummyInputStage = new Element('input', {
         'id': 'spatialQueryStage',
         'name': 'spatialQueryStage',
	 'type': 'hidden'
      });

      dummyInputFromStage = new Element('input', {
         'id': 'spatialQueryFromStage',
         'name': 'spatialQueryFromStage',
	 'type': 'hidden'
      });

      dummyInputToStage = new Element('input', {
         'id': 'spatialQueryToStage',
         'name': 'spatialQueryToStage',
	 'type': 'hidden'
      });

      dummyInputDetect = new Element('input', {
         'id': 'spatialQueryDetect',
         'name': 'spatialQueryDetect',
	 'type': 'hidden',
	 'value': 'detected'
      });

      dummyInputEmbryo = new Element('input', {
         'id': 'spatialQueryEmbryo',
         'name': 'spatialQueryEmbryo',
	 'type': 'hidden'
      });

      dummyInputView.inject(dummyForm, 'inside');
      dummyInputDrawing.inject(dummyForm, 'inside');
      dummyInputOrigin.inject(dummyForm, 'inside');
      dummyInputStage.inject(dummyForm, 'inside');
      dummyInputFromStage.inject(dummyForm, 'inside');
      dummyInputToStage.inject(dummyForm, 'inside');
      dummyInputEmbryo.inject(dummyForm, 'inside');
      dummyInputDetect.inject(dummyForm, 'inside');
      //dummyForm.inject(newQueryToolContainer, 'inside');
*/

   }; // createElements

   //---------------------------------------------------------------
   var addQueryTerms = function() {

      var newQueryTermScrollContainer;
      var newQueryTermContainer;
      var termData;
      var reverseData;
      var term;
      var name;
      var id;
      var total;
      var klass;
      var top;
      var wid;
      var termDiv;
      var termTextH;
      var height;
      var baseHeight;
      var cumHeight;
      var termTextDiv;
      var termTextContainer;

      //console.log("addQueryTerms");

      newQueryTermScrollContainer = $("newQueryTermScrollContainer");
      if(newQueryTermScrollContainer) {
         newQueryTermScrollContainer.parentNode.removeChild(newQueryTermScrollContainer);
      }

      newQueryTermScrollContainer = new Element('div', {
	 'id': 'newQueryTermScrollContainer'
      });
      target = $("newQueryToolContainer");
      newQueryTermScrollContainer.inject(target, 'inside');

      newQueryTermContainer = new Element('div', {
	 'id': 'newQueryTermContainer'
      });
      newQueryTermContainer.inject(newQueryTermScrollContainer, 'inside');

      baseHeight = 0;
      height = baseHeight;

      termData = query.getQueryTermData();
      reverseData = util.reverseObject(termData);
      //console.log(reverseData);

      //----------------------------------------
      // containers for the term indicators
      //----------------------------------------

      klass = 'termDiv';
      total = 0;
      reverseData = emouseatlas.emap.utilities.reverseObject(termData);
      cumHeight = Number(0);

      for(key in reverseData) {

         if(!reverseData.hasOwnProperty(key)) {
	    continue;
	 }

         term = reverseData[key];
	 name = reverseData[key].name;
	 id = term.fbId[0];
	 //console.log("term ",term);
	 //console.log("term  %s, %s",name,id);

         //top = total*heightOfOneTerm;
         top = cumHeight + 'px';
	 //wid = 150;
	 //txtwid = width - 30;

	 termDiv = new Element('div', {
	    'id': name + '_termDiv',
	    'class': klass
	 });
	 termDiv.setStyles({
            'top': top
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

	 termDiv.inject(newQueryTermContainer, 'inside');
	 termTextDiv.inject(termTextContainer, 'inside');
	 termTextContainer.inject(termDiv, 'inside');

         termTextH = window.getComputedStyle(termTextDiv, null).getPropertyValue("height");
	 cumHeight += parseInt(termTextH);
	 //console.log("%s, %s %d",term.name, termTextH, cumHeight);

         total++;

      } // for

   }; // addQueryTerms

/*
   that: this,

   initialize: function(params) {

      //console.log("enter newQueryTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;
      this.query = params.query;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.name = "newQueryTool";
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

      this.project = this.model.getProject();
      //console.log("newQueryTool project ",this.project);

      this.bgc = "#eaeaea";

      this.boundingBox;

      //this.visible = true;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         borders:this.borders,
                                         transparent:this.transparent,
					 bgc:this.bgc,
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
      this.termData = [];

      this.createElements();
      this.initDummyForm();

      this.querySectionNames = [];
      this.transformedOrigins = {};

      this.window.setDimensions(this.width, this.height);
      this.setQueryToolVisible(false);
      //this.setToolTip(this.toolTipText);

      this.EXPORT = false;

   }, // initialize

   //---------------------------------------------------------------
   // the elements which have event handlers must be 'this.name'
   // not 'var name'.
   //---------------------------------------------------------------
   initDummyForm: function () {

      var currentLayer;
      var layerData;
      var layer;
      var modelInfo;
      
      currentLayer = this.view.getCurrentLayer();
      layerData = this.model.getLayerData();
      layer = layerData[currentLayer];
      if(layer === undefined || layer === null) {
         //console.log("layer undefined");
         return false;
      }
      //console.log("layer ",layer);

      modelInfo = layer.modelInfo;
      if(modelInfo === undefined) {
         //console.log("modelInfo undefined");
         return false;
      } else {
         //console.log("modelInfo ",modelInfo);
      }

      //console.log("modelInfo ",modelInfo);

      this.dummyInputStage.set('value', modelInfo.stage);
      this.dummyInputFromStage.set('value', modelInfo.stage);
      this.dummyInputToStage.set('value', modelInfo.stage);
      this.dummyInputEmbryo.set('value', modelInfo.dbName);

   }, // initDummyForm

*/
   //---------------------------------------------------------------
   var doRadio = function (e) {

      var target;
      var id;
      var yes;

      if(e.preventDefault) {
         e.preventDefault();
      }
      if(e.stopPropagation) {
         e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);
      yes = !target.checked;

      //console.log("doRadio target ",target);
      //console.log("doRadio checked ",yes);

      id = target.id;
      if(id === undefined || id === null || id === "") {
         //console.log("doRadio no target.id");
         return;
      } else {
	 if(id.indexOf('emage') !== -1) {
            //console.log("doRadio emage");
	    query.setDbToQuery('emage', yes);
	 } else if(id.indexOf('mgi') !== -1) {
            //console.log("doRadio mgi");
	    query.setDbToQuery('mgi', yes);
	 }
      }
   };

/*
   //---------------------------------------------------------------
   doRadio: function (e) {

      var target;
      var id;

      if(e.preventDefault) {
         e.preventDefault();
      }
      if(e.stopPropagation) {
         e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);
      id = target.id;
      if(id === undefined || id === null || id === "") {
         //console.log("doRadio no target.id");
         return;
      } else {
         //console.log("doRadio: target.id %s",id);
	 if(id.indexOf('spatial') !== -1) {
	    this.query.typeChanged('spatial');
	 } else if(id.indexOf('anatomy') !== -1) {
            //console.log("doRadio: changed to anatomy");
	    this.query.typeChanged('anatomy');
	 }
      }
   },

*/

   //---------------------------------------------------------------
   var modelUpdate = function (modelChanges) {

      var dst;

      if(modelChanges.dst === true) {
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function (viewChanges, from) {

      var mode;
      var queryModes;  // by anatomy term, by drawing
      var type;        // 0 ==> emage or gudmap, 1 ==> MGI/GXD
      var emapId;
      var emapIdNum;
      var anatStr;
      var url;
      var selections;
      var indxArr;

      type = view.getModeSubType();

      if(viewChanges.mode) {
	 mode = view.getMode();
	 //console.log("newQueryTool.viewUpdate: mode ",mode);
	 if(mode.name === 'query') {
	    setQueryToolVisible(true);
            queryModes = model.getQueryModes();
	    //console.log("viewUpdate: ",queryModes);
	    if(queryModes.anatomy == true) {
	       query.typeChanged('anatomy');
	       selections = view.getSelections();
	       indxArr = getIndexArrFromSelections(selections);
	       //console.log("query indxArr ",indxArr);
	       termData = getTermDataFromTree(indxArr);
	       query.setQueryTermData(termData);
	    }
	    if(queryModes.spatial == true) {
	       query.typeChanged('spatial');
	    }
	 } else {
	    setQueryToolVisible(false);
	 }
      }
/*
      if(viewChanges.newQueryTool) {
	 emapId = this.getEmapId();
	 //console.log("mode sub type = ",type);
	 if(type === 0) {
            if(this.project.toLowerCase() === "gudmap") {
	       //anatStr = this.getAnatStr();
	       //anatStr = "renal vesicle";
               //url = 'http://www.gudmap.org/gudmap_beta/pages/global_search_index.html?gsinput=%20' + anatStr + '%20';
	    } else {
               //url = 'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' + emapId + '&exactmatchstructures=true&includestructuresynonyms=true'; 
               url = 'http://testwww.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' + emapId + '&exactmatchstructures=true&includestructuresynonyms=true'; 
	    }
	 } else if(type === 1) {
	    emapIdNum = emapId.substring(5);
	    url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=' + emapIdNum + '&sort=Gene%20symbol&returnType=assay%20results&substructures=structures';
         } else {
	    return false;
	 }

	 //console.log(url);
         this.view.getQueryResults(url);
      }

*/
      if(viewChanges.selections === true) {
	 //console.log("viewChanges.selections");
	 mode = view.getMode();
	 //console.log("mode %s, queryType %s",mode.name,query.getQueryType());
	 if(mode.name === "query" && query.getQueryType() === "anatomy") {
            selections = view.getSelections();
	    indxArr = getIndexArrFromSelections(selections);
	    //console.log("query indxArr ",indxArr);
	    termData = getTermDataFromTree(indxArr);
	    query.setQueryTermData(termData);
	 }
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var queryUpdate = function (queryChanges) {

      var termData;

      if(queryChanges.addQueryTerm === true) {
         //console.log("queryUpdate addQueryTerm %s",queryChanges.addQueryTerm);
         addQueryTerms();
      }

   }; // queryUpdate

   //---------------------------------------------------------------
   var getIndexArrFromSelections = function (selections) {

      var ret = [];
      var separated = [];
      var len;
      var i;

      separated = selections.split("=");
      separated.shift(); // removes the unwanted "&sel"
      //console.log("query selection ",separated);
      len = separated.length;
      for(i=0; i<len; i++) {
         ret[ret.length] = separated[i].split(",")[0];
      }

      return ret;

   };

   //---------------------------------------------------------------
   var getTermData = function () {
      return termData;
   };

   //---------------------------------------------------------------
   var getTermDataFromTree = function (indxArr) {

      var key;
      var layer;
      var treeData;
      var resultNode;
      var name;
      var fbId;
      var len;
      var i;
      var data;
      var ret = {};

      layer = emouseatlas.emap.tiledImageView.getCurrentLayer();
      treeData = emouseatlas.emap.tiledImageModel.getTreeData(layer);

      len = indxArr.length;

      for(i=0; i<len; i++) {
         key = indxArr[i];
         //console.log("key ",key);
         resultNode = iterativeDeepeningDepthFirstSearch(treeData[0], key);
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
	    if(ret[name] === undefined) {
	       ret[name] = data;
	    }
         }
      }
      return ret;
   };


   //---------------------------------------------------------------
   var iterativeDeepeningDepthFirstSearch = function (root, goal) {

      var depth;
      var result;

      depth = 0;
      result = undefined;

      while(result === undefined && depth < 10) {
         result = depthLimitedSearch(root, goal, depth);
	 if(result !== undefined) {
	    //console.log("found domain #%d at depth %d",goal,depth);
	    return result;
	 }
	 depth = Number(depth + 1*1);
      }

   };

   //---------------------------------------------------------------
   var depthLimitedSearch = function (node, goal, depth) {

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
	 //nameTheseKids(children)
	 for(i=0; i<len; i++) {
	    child = children[i];
	    result = depthLimitedSearch(child, goal, depth - 1);
	    if(result !== undefined) {
	       return result;
	    }
	 }
      } else {
	 //console.log("couldn't find node with domainId %s",goal);
	 return undefined;
      }
   };

   //---------------------------------------------------------------
   // A utility function for debugging
   //---------------------------------------------------------------
   var nameTheseKids = function (kids) {

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
   };

   //---------------------------------------------------------------
   // doQuery
   //---------------------------------------------------------------
   var doQueryButtonClicked = function(e) {

      //console.log("do query");
      var target;
      var queryModes;  // by anatomy term, by drawing
      //var queryState;

      if (!e) {
	 var e = window.event;
      }
      target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("doQueryButtonClicked: %s",target.id);
      if(target.id.indexOf("QueryButton") === -1) {
	 //console.log("doQueryButtonClicked returning: event not from query button ",target.id);
	 return;
      }

      queryModes = model.getQueryModes();

      if(queryModes.anatomy) {
         doAnatomyQuery();
      }
      if(queryModes.spatial) {
         //doSpatialQuery();
      }

   };

   //---------------------------------------------------------------
   // Anatomy query
   //---------------------------------------------------------------
   var doAnatomyQuery = function() {

      var emage_cb;
      var mgi_cb;
      var termData;
      var reverseData;
      var len;
      var key;
      var term;
      var name;
      var id;
      var idnum;
      var url;
      var first;

      emage_cb = $("dbRadio_emage").checked;

      if(project.toLowerCase() === "gudmap") {
	 if(!emage_cb) {
	    alert("You have not chosen a database to query.\nPlease select 'GUDMAP'");
	    return false;
	 }
      } else {
	 mgi_cb = $("dbRadio_mgi").checked;
	 if(!emage_cb && !mgi_cb) {
	    alert("You have not chosen a database to query.\nPlease select 'EMAGE' or 'MGI GXD' or both of these.");
	    return false;
	 }
      }

      termData = query.getQueryTermData();
      reverseData = emouseatlas.emap.utilities.reverseObject(termData);

      if(emage_cb) {
	 if(project.toLowerCase() === "gudmap") {
	    url = 'http://www.gudmap.org/gudmap_beta/pages/global_search_index.html?gsinput=';
	 } else {
	    url = 'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=';
	    //url = 'http://testwww.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=';
	 }
	 first = true;

	 for(key in reverseData) {
   
	    if(!reverseData.hasOwnProperty(key)) {
	       continue;
	    }
   
	    term = reverseData[key];
	    name = reverseData[key].name;
	    id = term.fbId[0];
	    //console.log("term ",term);
	    //console.log("term  %s, %s",name,id);
   

	    if(project.toLowerCase() === "gudmap") {
	       if(!first) {
		  url += '%20';
	       }
	       url += '%22' + name + '%22';
	    } else {
	       if(!first) {
		  url += ',';
	       }
	       url += id;
	    }
	    first = false;
	 }

	 if(project.toLowerCase() !== "gudmap") {
	    url += '&exactmatchstructures=true&includestructuresynonyms=true';
	 }
	 //console.log(url);
	 view.getQueryResults(url);
      }
      
      // we are only able to use 1 term for an MGI query
      // so we get the user to choose which one to use
      if(mgi_cb) {
         url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=';

	 //setQueryToolVisible(false);
	 query.chooseItem();

/*
         for(key in reverseData) {
   
            if(!reverseData.hasOwnProperty(key)) {
               continue;
            }
   
            term = reverseData[key];
            name = reverseData[key].name;
            id = term.fbId[0];
	    idnum = id.substring(5);
            //console.log("term ",term);
            //console.log("term  %s, %s, %s",name,id,idnum);
   
            url += idnum;
	    break;
         }
*/
         //url += '&sort=Gene%20symbol&returnType=assay%20results&substructures=structures';
         //console.log(url);
         //view.getQueryResults(url);
      }
   };  // doAnatomyQuery

/*
   //---------------------------------------------------------------
   // Spatial query
   //---------------------------------------------------------------
   doSpatialQuery: function() {

      var names;

      names = this.getQuerySectionNames();
      //console.log("names: ",names);

      // this is called recursively for all the query sections
      this.getTransformedBoundingBoxes(names);
   },

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
      console.log("getTransformedBoundingBoxCallback origin x %d, y %d, z %d",x,y,z);

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

      var sectionNames;
      var len;
      var queryArr = [];
      var queryStr = "";
      var queryStrHeader;
      var iipUrl = "";
      var name;
      var drawingData;
      var trimmedDrawing;
      var stringifiedDrawing;
      var origin;
      var originStr;
      var section;
      var webServer;
      var iipServer;
      var currentLayer;
      var layerDat;
      var layer;
      var i;
      
      sectionNames = this.getQuerySectionNames();
      len = sectionNames.length;
      webServer = this.model.getWebServer();
      iipServer = this.model.getIIPServer();
      currentLayer = this.view.getCurrentLayer();
      layerData = this.model.getLayerData();
      queryStrHeader = "WLZ_DRAW_DOMAIN:1;";

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

      queryStrHeader = queryStrHeader + iipUrl;

      if(len <= 0) {
         return false;
      }
      queryStr += queryStrHeader;
      for(i=0; i<len; i++) {
         name = sectionNames[i];
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
	    ":" +
	    name +
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
      console.log("iipUrl ",iipUrl);
      this.dummyInputDrawing.value = queryStr;
      console.log(queryStr);
      this.dummyQueryExport.value = queryStr;

      // If you do a form.submit, the servlet has to re-draw the page, the call is from the web-page.
      // If you call the servlet via ajax (XMLHttpRequest.send(urlParams)) the current page stays visible
      // because you made the call from javascript.
      if(this.EXPORT) {
         this.queryExportForm.submit();
      } else {
         //this.dummyForm.submit();
      }

      return false;
   },

*/
   //---------------------------------------------------------------
   var setQueryToolVisible = function(yes) {

      var container;
      var viz;

      viz = (yes) ? "visible" : "hidden";
      container = $("newQueryToolContainer");
      container.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var doCancel = function() {
      //console.log("%s doCancel:",this.name);
      setQueryToolVisible(false);
      var modes = view.getModes();
      view.setMode(modes.move.name);
   };

/*
   //---------------------------------------------------------------
   doExportQuery: function() {

      this.EXPORT = true;
      this.doSpatialQuery();

   },

   //---------------------------------------------------------------
   doImport: function() {

      //console.log("doImport: ");

      var ip;
      var fileList;
      var reader;

      ip = $('queryImportFile');
      fileList = ip.files;
      //console.log("files: ",fileList);

      reader = new FileReader();
      //----------------------------------------
      // event handlers for reader
      //----------------------------------------
      reader.onerror = function(e) {
	 this.doReaderError(e);
      }.bind(this);

      reader.onload = function(e) {
	 this.doReaderLoad(e);
      }.bind(this);

      reader.onloadend = function(e) {
	 this.doReaderLoadEnd(e);
      }.bind(this);

      reader.readAsText(fileList[0]);

   },

   //---------------------------------------------------------------
   doReaderError: function(e) {
      //console.log("doReaderError:");

      if (!e) {
	 var e = window.event;
      }
   },

   //---------------------------------------------------------------
   doReaderLoad: function(e) {
      //console.log("doReaderLoad:");

      if (!e) {
	 var e = window.event;
      }
   },

   // only import spatial query at the moment
   //---------------------------------------------------------------
   doReaderLoadEnd: function(e) {

      //console.log("doReaderLoadEnd:");

      var txt;
      var json;
      var view = {};
      var drgArr = [];
      var drg = {};
      var numsections;
      var secArr = [];
      var section;
      var numstrokes;
      var strokes = [];
      var stroke = {};
      var action;
      var mode;
      var points = [];
      var pstart = {};
      var pstop = {};
      var penrad;
      var xarr = [];
      var yarr = [];
      var numcoords;
      var len;
      var i;
      var j;
      
      if (!e) {
	 var e = window.event;
      }

      txt = e.target.result;
      //console.log(txt);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
	 json = JSON.parse(txt);
      } else {
	 json = emouseatlas.JSON.parse(txt);
      }
      if(!json) {
	 //console.log("initModelCallback returning: json null");
	 return false;
      }
      //console.log("json ",json);

      view_mode = json.mod;

      secArr = json.secArr;
      numsections = secArr.length;

      // nickb just look at the first section at the moment
      section = secArr[0];

      view = {};
      view.dst = parseInt(section.view.dst);
      view.fxp = [parseInt(section.view.fxp[0]), parseInt(section.view.fxp[1]), parseInt(section.view.fxp[2])];
      view.pit = parseInt(section.view.pit);
      view.yaw = parseInt(section.view.yaw);
      view.rol = parseInt(section.view.rol);
      view.mod = view_mode;

      //console.log("view ",view);

      strokes = section.drawing;
      numstrokes = strokes.length;

      for(i=0; i<numstrokes; i++) {

	 // deal with each stroke
	 stroke = strokes[i]
         //console.log("stroke %d",i,stroke);

	 xarr = stroke.coords.x;
	 yarr = stroke.coords.y;
	 numcoords = xarr.length;

	 pstart = {x:xarr[0], y:yarr[0]};
	 pstop = {x:xarr[numcoords-1], y:yarr[numcoords-1]};
	 points[0] = pstart;
	 points[1] = pstop;


         drg = {};
	 drg.a = (stroke.tool.toLowerCase() === "pen") ? 0 : 1;
	 drg.m = (stroke.mode.toLowerCase() === "draw") ? true : false;
	 drg.p = points;
	 drg.w = parseInt(stroke.rad);
	 drg.x = xarr;
	 drg.y = yarr;

         drgArr[i] = drg;
      }

      secNames = ["section_0"];

      len = drgArr.length;
      //console.log("drg length",len);
      for(i=0; i<len; i++) {
	 check = drgArr[i];
         //console.log("check drg %d",i,check);
      }

      this.queryTypeRadio_spatial.set('checked', true);
      this.query.importQuerySection(view, drgArr);
   },

   //---------------------------------------------------------------
   getImportFile: function(e) {

      //console.log("getImportFile:");

      var ip = $('queryImportFile');

      if (ip) {  
         ip.click();  
      }  

      e.preventDefault(); // prevent navigation to "#"

   },

   //---------------------------------------------------------------
   // Only use the sections which are checked
   //---------------------------------------------------------------
   getQuerySectionNames: function() {

      var sectionNames;
      var numSections;
      var names = [];
      var name;
      var i;

      sectionNames = this.query.getAllQuerySectionNames();
      numSections = sectionNames.length;

      for(i=0; i<numSections; i++) {
         name = sectionNames[i];
	 checkbox = $(name + '_sectionCheckbox');
         //console.log("checkbox: %s is checked %s",name,checkbox.checked);
	 if(checkbox.checked) {
	    //console.log("query with %s",name);
	    names[names.length] = name;
	    //console.log("omit %s",name);
	 }
      }
      //console.log("names ",names);
      return names;
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
   },
*/

   //---------------------------------------------------------------
   var getName = function() {
      return name;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      queryUpdate: queryUpdate,
      getName: getName
   };


}();
