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
//   supplementPointClick.js
//   Tool for entering markers relating to list items.
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
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
// module for supplementPointClick
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.supplementPointClick = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var model = emouseatlas.emap.tiledImageModel;
   var view = emouseatlas.emap.tiledImageView;
   var utils = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var _debug;
   var editorUtils;
   var plateList = [];
   var emaModels = [];
   var titleInfo;
   var subplateMarkerDetails;
   var pointClickImgData;
   var subplateImgNames = [];
   var EDITOR;
   var SINGLE_PLATE = false;
   var PLATE_DATA = false;
   var INITIALISED = false;
   var currentImg;
   var previousImg = undefined;
   var markerContainerId;
   var closestMarkerNums;
   var previousOpenMarker;
   var tableDets;
   var selectedRowKnums;
   var latestSelectedRow = undefined;
   var latestClickedRow = undefined;
   var previousSelectedRow = undefined;
   var lastHighlightedKnum = undefined;
   var maxCloseMarkersToShow;
   var scale;
   var imgOfs;
   var labelOfs;
   var titleInfoTarget = "projectDiv";
   var KEEP_TITLE_INFO_FRAME = false;
   var markerPopupTarget = "emapIIPViewerDiv";
   var targetDiv;
   var allowClosestMarkers = true; // temporary, while hovering over marker
   var ALLOW_CLOSEST_MARKERS = true; // more permanent (from checkbox)
   var SHOW_MARKER_TXT = true;
   var MOVING = false;
   var imgDir;
   var srcSelected;
   var srcClosest;
   var srcHighlighted;
   var srcEdited;
   var srcClose;
   var srcClose2;
   var CONTEXT_MENU = false;
   var SHOW_ALL_MARKERS = false;
   var stagedOntologyUrl;
   var abstractOntologyUrl;
   var emageUrl;
   var emouseatlasUrl;
   var mgiUrl;
   var annotations;
   var markerDets;
   var locationDets;
   var currentImgKnums;
   var editedMarkerDets;
   var editedMarkerKnum;
   var editedMarkerFnum;
   var highlightedMarkerKnum;
   var highlightedMarkerFnum;
   var movingMarkerKnum;
   var movingMarkerFnum;
   var supplementTerms;
   var ontNames;
   //......................
   var registry = [];
   var pointClickChanges = { 
      ready: false,
      wikiChoice: false,
      mgiChoice: false,
      showAll: false,
      hideAll: false,
      plateList: false,
      emaModels: false
   };


   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   var register = function (observer) {
      registry.push(observer);
      //console.log(observer.getName());
   };

   //---------------------------------------------------------
   var initialise = function () {

      _debug = false;

      var webServer;

      //if(_debug) console.log("enter supplementPointClick.initialise");

      model.register(this);
      view.register(this);

      imgDir = model.getInterfaceImageDir();
      srcSelected = imgDir + "mapIconSelected.png";
      srcClosest = imgDir + "mapIconClosest.png";
      srcHighlighted = imgDir + "mapIconHighlighted.png";
      srcEdited = imgDir + "mapIconEdited.png";
      srcClose = imgDir + "close_10x8.png";
      srcClose2 = imgDir + "close2_10x8.png";

      EDITOR = model.isEditor();
      //console.log("initialise EDITOR %s",EDITOR);

      pointClickImgData = model.getPointClickImgData();
      if(_debug) console.log("pointClickImgData ",pointClickImgData);
      //console.log("pointClickImgData ",pointClickImgData);

      subplateMarkerDetails = {};
      annotations = [];
      markerDets = {};
      locationDets = {};
      closestMarkerNums = [];
      selectedRowKnums = [];
      editedMarkerDets = [];
      supplementTerms = [];
      ontNames = {};

      maxCloseMarkersToShow = 3;

      markerContainerId = 'histology_tileFrame';
      mgiUrl = "http://www.informatics.jax.org/gxd/structure/"; 

      webServer = model.getWebServer();

      stagedOntologyUrl =  webServer + "/emap/ema/DAOAnatomyJSP/anatomy.html?stage=TS";
      abstractOntologyUrl =  webServer + "/emap/ema/DAOAnatomyJSP/abstract.html";
      emageUrl =  webServer + "/emagewebapp/pages/emage_general_query_result.jsf?structures=";
      emouseatlasUrl =  webServer;

      //---------------------------------------------------------
      // The marker img is 20x34 pixels and the locating point is mid-bottom-line
      // so we apply an offset to the mouse click point to make it look right.
      //---------------------------------------------------------
      imgOfs = {x:-8, y:-32};
      labelOfs = {x:30, y:-30};

      scale = view.getScale().cur;
      //console.log("scale ",scale);

      markerIFrameID = "markerPopupIFrameContainer";
      //console.log("markerIFrameID ",markerIFrameID);

      emouseatlas.emap.drag.register({drag:"wlzIIPViewerTitleIFrameContainer", drop:"projectDiv"});

      tableDets = [];

      // this is the start of a chain of functions that call servlets (ajax)
      // the flow of control passes through each of them and their callback functions
      // so that all the data has been obtained from the database(s) before we
      // build the rest of the interface (see buildInterface() )
      getListOfPlates();

   }; // initialise

   //---------------------------------------------------------------
   var getListOfPlates = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var url;
      var ajax;
      var ajaxParams;

      url = '/kaufmanwebapp/GetListOfPlates';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement",
         callback:getListOfPlatesCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getListOfPlates

   //---------------------------------------------------------------
   var getListOfPlatesCallback = function (response) {

      //if(_debug) console.log("getListOfPlatesCallback: \n" + urlParams);
      //console.log("getListOfPlatesCallback:");
      //console.log("getListOfPlatesCallback: response ",response);
      var json;
      
      // get Title info via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         if(_debug) console.log("getListOfPlatesCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      //console.log(response);
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         if(_debug) console.log("getListOfPlatesCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getListOfPlatesCallback json ",json);
      //console.log("getListOfPlatesCallback json ",json);

      plateList = json;

      //console.log("ListOfPlates ",plateList);

      getEmaModels();

   }; // getListOfPlatesCallback:

   //---------------------------------------------------------------
   var getEmaModels = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var subplate;
      var url;
      var ajax;
      var ajaxParams;

      subplate = pointClickImgData.subplate;

      //console.log("getEmaModels %s",subplate);

      url = '/kaufmanwebapp/GetEmaModels';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"",
	 urlParams:"project=kaufman_supplement&plate=" + subplate,          // kaufman plate
         callback:getEmaModelsCallback,
         async:true
      }
      if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getEmaModels

   //---------------------------------------------------------------
   var getEmaModelsCallback = function (response) {

      var json;
      
      // get EMA models for plate via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         if(_debug) console.log("getEmaModelsCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      //console.log("getEmaModelsCallback, ",response);
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         if(_debug) console.log("getEmaModelsCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getEmaModelsCallback json ",json);
      //console.log("getEmaModelsCallback json ",json);

      emaModels = json;
      //console.log("emaModels ",emaModels);

      getPlateData();

   }; // getEmaModelsCallback:

   //---------------------------------------------------------------
   // We only want to store data for the subplate relevant to this page
   //---------------------------------------------------------------
   var getPlateData = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var plate;
      var subplate;
      var url;
      var ajaxParams;
      var ajax;

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      if(plate === subplate) {
         SINGLE_PLATE = true;
      } else {
         SINGLE_PLATE = false;
      }

      url = '/kaufmanwebapp/GetPlateData';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&plate=" + plate + "&subplate=" + subplate,
         callback:getPlateDataCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getPlateData

   //---------------------------------------------------------------
   var getPlateDataCallback = function (response, urlParams) {

      //if(_debug) console.log("getPlateDataCallback: \n" + urlParams);
      var json;
      var subplate;
      var subplateData;
      var len;
      var i;

      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response.length <= 3) {
         //if(_debug) console.log("getPlateDataCallback returning: response null");
	 ALLOW_CLOSEST_MARKERS = false;
         return false;
      } else {
         //if(_debug) console.log(response);
	 PLATE_DATA = true;
      }
      //console.log("getPlateDataCallback response ",response);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("getPlateDataCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getPlateDataCallback json ",json);
      //console.log("getPlateDataCallback urlParams ",urlParams);
      //console.log("getPlateDataCallback json ",json);

      storeSubplateImgNames(json);

      subplateData = json.images;
      //console.log("subplateData ",subplateData);
      storeLocations(subplateData, "getPlateDataCallback");

      getAnnotationForSubPlate();

   }; // getPlateDataCallback:

   //---------------------------------------------------------------
   // Get Annotation data for each location on subplate
   //---------------------------------------------------------------
   var getAnnotationForSubPlate = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var subplate = pointClickImgData.subplate;

      if(_debug) console.log("getAnnotationForSubPlate ",subplate);
      //console.log("getAnnotationForSubPlate ",pointClickImgData);

      var url = '/kaufmanwebapp/GetAnnotationForSubPlate';
      var ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&subplate="+subplate,
         callback:getAnnotationForPlateCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getAnnotationForSubPlate

   //---------------------------------------------------------------
   var getAnnotationForPlateCallback = function (response, urlParams) {

      //if(_debug) console.log("getAnnotationForPlateCallback: \n" + urlParams);
      var json;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //if(_debug) console.log("getAnnotationForPlateCallback returning: response null");
         console.log("getAnnotationForPlateCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("getAnnotationForPlateCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getAnnotationForPlateCallback json ",json);

      //console.log("getAnnotationForPlateCallback urlParams ",urlParams);

      storeAnnotation(json);
      //console.log(annotations);

      getOntologyNameAndSyns();


   }; // getAnnotationForPlateCallback:

   //---------------------------------------------------------------
   // Get ontology name and synonyms for each Annotation
   //---------------------------------------------------------------
   var getOntologyNameAndSyns = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var subplate = pointClickImgData.subplate;
      var emapaArr;
      var jsonStr = undefined;
      var url;
      var ajaxParams;

      if(_debug) console.log("getOntologyNameAndSyns ",subplate);
      //console.log("getOntologyNameAndSyns ",pointClickImgData);

      emapaArr = getEmapaFromAnnotation();
      //console.log("getOntologyNameAndSyns  emapaArr ",emapaArr);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
	 jsonStr = JSON.stringify(emapaArr);
      } else {
	 jsonStr = emouseatlas.JSON.stringify(emapaArr);
      }
      if(!jsonStr) {
	 return false;
      }
      //console.log("getOntologyNameAndSyns  jsonStr ",jsonStr);

      url = '/ontologywebapp/GetNameAndSynonyms';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=mouse012&emapa_ids="+jsonStr,
         callback:getOntologyNameAndSynsCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getOntologyNameAndSyns

   //---------------------------------------------------------------
   var getOntologyNameAndSynsCallback = function (response, urlParams) {

      //if(_debug) console.log("getOntologyNameAndSynsCallback: \n" + urlParams);
      var json;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //if(_debug) console.log("getOntologyNameAndSynsCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("getOntologyNameAndSynsCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getOntologyNameAndSynsCallback json ",json);

      addOntologyNameAndSynsToAnnotation(json);
      //console.log(annotations);

      getEmapaStageRange();


   }; // getOntologyNameAndSynsCallback:

   //---------------------------------------------------------------
   // Get stage range for EMAPA for each annotation
   //---------------------------------------------------------------
   var getEmapaStageRange = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var subplate = pointClickImgData.subplate;
      var emapaArr;
      var jsonStr = undefined;
      var url;
      var ajaxParams;

      if(_debug) console.log("getEmapaStageRange ",subplate);
      //console.log("getEmapaStageRange ",pointClickImgData);

      emapaArr = getEmapaFromAnnotation();

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
	 jsonStr = JSON.stringify(emapaArr);
      } else {
	 jsonStr = emouseatlas.JSON.stringify(emapaArr);
      }
      if(!jsonStr) {
	 return false;
      }

      url = '/ontologywebapp/GetStageRange';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=mouse012&emapa_ids="+jsonStr,
         callback:getEmapaStageRangeCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getEmapaStageRange

   //---------------------------------------------------------------
   var getEmapaStageRangeCallback = function (response, urlParams) {

      //if(_debug) console.log("getEmapaStageRangeCallback: \n" + urlParams);
      var json;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //if(_debug) console.log("getEmapaStageRangeCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("getEmapaStageRangeCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getEmapaStageRangeCallback json ",json);
      //console.log("getEmapaStageRangeCallback json ",json);

      addStageRangeToAnnotation(json);

      annotations = annotations.sort(emouseatlas.emap.utilities.sort_by('knum', false, parseInt));
      //console.log(annotations);

      getSupplementTerms();

   }; // getEmapaStageRangeCallback:

   //---------------------------------------------------------------
   var getSupplementTerms = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var url;
      var ajax;
      var ajaxParams;
      var subplate = pointClickImgData.subplate;

      //console.log("getSupplementTerms: ",subplate);

      url = '/kaufmanwebapp/GetSupplementTerms';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&subplate="+subplate,
         callback:getSupplementTermsCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getSupplementTerms

   //---------------------------------------------------------------
   var getSupplementTermsCallback = function (response) {

      var json;
      
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         if(_debug) console.log("getSupplementTermsCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      //console.log("getSupplementTermsCallback: ",response);
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         if(_debug) console.log("getSupplementTermsCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getSupplementTermsCallback json ",json);
      //console.log("getSupplementTermsCallback json ",json);

      storeSupplementTerms(json);

      getOntologyNamesForTerms();

   }; // getSupplementTermsCallback:

   //---------------------------------------------------------------
   // Get ontology names for each term
   //---------------------------------------------------------------
   var getOntologyNamesForTerms = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var subplate = pointClickImgData.subplate;
      var emapaArr;
      var jsonStr = undefined;
      var url;
      var ajaxParams;

      if(_debug) console.log("getOntologyNamesForTerms ",subplate);
      //console.log("getOntologyNamesForTerms ",pointClickImgData);

      emapaArr = getEmapaFromTerms();
      //console.log("getOntologyNamesForTerms  emapaArr ",emapaArr);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
	 jsonStr = JSON.stringify(emapaArr);
      } else {
	 jsonStr = emouseatlas.JSON.stringify(emapaArr);
      }
      if(!jsonStr) {
	 return false;
      }
      //console.log("getOntologyNamesForTerms  jsonStr ",jsonStr);

      url = '/ontologywebapp/GetNameAndSynonyms';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=mouse012&emapa_ids="+jsonStr,
         callback:getOntologyNamesForTermsCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getOntologyNamesForTerms

   //---------------------------------------------------------------
   var getOntologyNamesForTermsCallback = function (response, urlParams) {

      //if(_debug) console.log("getOntologyNamesForTermsCallback: \n" + urlParams);
      var json;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //if(_debug) console.log("getOntologyNamesForTermsCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("getOntologyNamesForTermsCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getOntologyNamesForTermsCallback json ",json);

      addOntologyNamesToTerms(json);

      getTitleInfo();

   }; // getOntologyNamesForTermsCallback:

   //---------------------------------------------------------------
   var getTitleInfo = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var url;
      var ajax;
      var ajaxParams;
      var subplate = pointClickImgData.subplate;

      url = '/kaufmanwebapp/GetTitleInfo';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&subplate="+subplate,
         callback:getTitleInfoCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getTitleInfo

   //---------------------------------------------------------------
   var getTitleInfoCallback = function (response) {

      //if(_debug) console.log("getTitleInfoCallback: \n" + urlParams);
      //console.log("getTitleInfoCallback:");
      //console.log("getTitleInfoCallback: response ",response);
      var json;
      
      // get Title info via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         if(_debug) console.log("getTitleInfoCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      //console.log("getTitleInfoCallback: ",response);
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         if(_debug) console.log("getTitleInfoCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getTitleInfoCallback json ",json);
      //console.log("getTitleInfoCallback json ",json);

      titleInfo = json;
      //console.log("TitleInfo ",titleInfo);

      buildInterface();

   }; // getTitleInfoCallback:

   //=============================================================================================================

   var getEmapaFromAnnotation = function () {

      var emapaArr = [];
      var annot = undefined;
      var len;
      var i;

      len = annotations.length;
      //console.log("getEmapaFromAnnotation ",annotations);

      for (i=0; i<len; i++) {
         annot = annotations[i];
         //console.log("getEmapaFromAnnotation ",annot);
         emapaArr[emapaArr.length] = annot.emapa;
      }

      return emapaArr;

   }; // getEmapaFromAnnotation:

   //---------------------------------------------------------------
   var getEmapaFromTerms = function () {

      var emapaArr = [];
      var termObj = undefined;
      var len;
      var i;

      len = supplementTerms.length;
      //console.log("getEmapaFromTerms ",supplementTerms);

      for (i=0; i<len; i++) {
         termObj = supplementTerms[i];
	 if(termObj.emapa.indexOf("EMAPA:0000") !== -1) {
	    continue;
	 }
         emapaArr[emapaArr.length] = termObj.emapa;
      }

      //console.log("getEmapaFromTerms ",emapaArr);
      return emapaArr;

   }; // getEmapaFromTerms:

   //---------------------------------------------------------------
   /*
   var setOntNames = function () {

      var annot = undefined;
      var knum;
      var names;
      var len;
      var len2;
      var i,j;

      len = annotations.length;
      //console.log("setOntNames ",annotations);
      //console.log("setOntNames  %d annotations",len);

      for (i=0; i<len; i++) {
         annot = annotations[i];
         //console.log("setOntNames ",annot);
         knum = annot.knum;
         names = [];
         len2 = annot.names.length;
	 for(j=1; j<len2; j++) {
	    names[j-1] = annot.names[j]
	 }
         //console.log("setOntNames ",names);
	 if(ontNames[knum] === undefined) {
            ontNames[knum] = {knum:knum, names:names};
	 }
      }
      console.log("setOntNames ",ontNames);

   }; // setOntNames:
   */

   //---------------------------------------------------------------
   var addOntologyNameAndSynsToAnnotation = function (nameAndSyns) {

      var len = annotations.length;
      var len2 = nameAndSyns.length;
      var emapa;
      var regexp;
      var i;

      if(len !== len2) {
         console.log("addOntologyNameAndSynsToAnnotation WARNING: length of annotation array %d is different from length of nameAndSynonms array %d ",len,len2);
      }

      regexp = new RegExp("EMAPA:0000");

      for (i=0; i<len; i++) {
         emapa = annotations[i].emapa;
	 if(regexp.test(emapa)) {
	    //console.log("annotations[%d] %s ", i, emapa);
	    if(emapa.indexOf("EMAPA:000001") !== -1) {
	       annotations[i].names = ["EMAPA:000001", "prethalamus", "ventral thalamus"];
               annotations[i].kdesk = "prethalamus";
	    } else if(emapa.indexOf("EMAPA:000002") !== -1) {
	       annotations[i].names = ["EMAPA:000002", "eminentia thalami"];
               annotations[i].kdesk = "eminentia thalami";
	    } else if(emapa.indexOf("EMAPA:000003") !== -1) {
	       annotations[i].names = ["EMAPA:000003", "ganglionic eminences"];
               annotations[i].kdesk = "ganglionic eminences";
	    } else if(emapa.indexOf("EMAPA:000004") !== -1) {
	       annotations[i].names = ["EMAPA:000004", "palatine vessels"];
               annotations[i].kdesk = "palatine vessels";
	    } else if(emapa.indexOf("EMAPA:000005") !== -1) {
	       annotations[i].names = ["EMAPA:000005", "primordium of left lower molar tooth"];
               annotations[i].kdesk = "primordium of left lower molar tooth";
	    } else if(emapa.indexOf("EMAPA:000006") !== -1) {
	       annotations[i].names = ["EMAPA:000006", "site of fusion in ventral midline of left and right Meckel's cartilages"];
               annotations[i].kdesk = "site of fusion in ventral midline of left and right Meckel's cartilages";
	    } else if(emapa.indexOf("EMAPA:000007") !== -1) {
	       annotations[i].names = ["EMAPA:000007", "primordium of upper molar tooth"];
               annotations[i].kdesk = "primordium of upper molar tooth";
	    } else if(emapa.indexOf("EMAPA:000008") !== -1) {
	       annotations[i].names = ["EMAPA:000008", "loosely packed mesenchyme in future subarachnoid space"];
               annotations[i].kdesk = "loosely packed mesenchyme in future subarachnoid space";
	    } else if(emapa.indexOf("EMAPA:000009") !== -1) {
	       annotations[i].names = ["EMAPA:000009", "mesenchymal condensation to form inner table of future dura mater"];
               annotations[i].kdesk = "mesenchymal condensation to form inner table of future dura mater";
	    } else if(emapa.indexOf("EMAPA:000010") !== -1) {
	       annotations[i].names = ["EMAPA:000010", "aortic sac"];
               annotations[i].kdesk = "aortic sac";
	    } else if(emapa.indexOf("EMAPA:000011") !== -1) {
	       annotations[i].names = ["EMAPA:000011", "entrance into oesophagus"];
               annotations[i].kdesk = "entrance into oesophagus";
	    } else if(emapa.indexOf("EMAPA:000012") !== -1) {
	       annotations[i].names = ["EMAPA:000012", "junction between midbrain and pons"];
               annotations[i].kdesk = "junction between midbrain and pons";
	    } else if(emapa.indexOf("EMAPA:000013") !== -1) {
	       annotations[i].names = ["EMAPA:000013", "junction between pons and medulla oblongata"];
               annotations[i].kdesk = "junction between pons and medulla oblongata";
	    }
	    continue;
	 }
         annotations[i].names = nameAndSyns[i];
         annotations[i].kdesk = nameAndSyns[i][1];
      }

   }; // addOntologyNameAndSynsToAnnotation:

   //---------------------------------------------------------------
   var addStageRangeToAnnotation = function (stageRange) {

      var len;
      var len2;
      var i;

      len = annotations.length;
      len2 = stageRange.length;

      if(len !== len2) {
         console.log("addStageRangeToAnnotation WARNING: length of annotation array %d is different from length of stageRange array %d ",len,len2);
	 console.log(annotations);
	 console.log(stageRange);
      }

      for (i=0; i<len; i++) {
         //console.log(stageRange[i]);
         annotations[i].stages = stageRange[i];
      }

   }; // addStageRangeToAnnotation:

   //---------------------------------------------------------------
   var addOntologyNamesToTerms = function (nameArr) {

      var termObj;
      var emapa;
      var dec;
      var len;
      var len2;
      var i;

      len = supplementTerms.length;
      len2 = nameArr.length;

      if(_debug && len !== len2) {
         console.log("addOntologyNamesToTerm WARNING: length of supplementTerms array %d is different from length of nameArr array %d ",len,len2);
      }

      dec = 0; // adjusted for every non-allocated term
      for (i=0; i<len; i++) {
         termObj = supplementTerms[i];
	 if(termObj.emapa.indexOf("EMAPA:0000") !== -1) {
	    if(termObj.emapa.indexOf("EMAPA:000001") !== -1) {
               supplementTerms[i].names = ["EMAPA:000001", "prethalamus", "ventral thalamus"];
	       dec++;
            } else if(termObj.emapa.indexOf("EMAPA:000002") !== -1) {
               supplementTerms[i].names = ["EMAPA:000002", "eminentia thalami"];
	       dec++;
            } else if(termObj.emapa.indexOf("EMAPA:000003") !== -1) {
               supplementTerms[i].names = ["EMAPA:000003", "ganglionic eminences"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000004") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000004", "palatine vessels"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000005") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000005", "primordium of left lower molar tooth"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000006") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000006", "site of fusion in ventral midline of left and right Meckel's cartilages"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000007") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000007", "primordium of upper molar tooth"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000008") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000008", "loosely packed mesenchyme in future subarachnoid space"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000009") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000009", "mesenchymal condensation to form inner table of future dura mater"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000010") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000010", "aortic sac"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000011") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000011", "entrance into oesophagus"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000012") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000012", "junction between midbrain and pons"];
	       dec++;
	    } else if(termObj.emapa.indexOf("EMAPA:000013") !== -1) {
	       supplementTerms[i].names = ["EMAPA:000013", "junction between pons and medulla oblongata"];
	       dec++;
	    }
	    continue;
	 }
	 indx = i - dec;
         supplementTerms[i].names = nameArr[indx];
      }

      //console.log("addOntologyNamesToTerms ", supplementTerms);

   }; // addOntologyNamesToTerms:

   //=============================================================================================================

   //----------------------------------------------------------------
   // This has to wait until we have all the info from the database(s)
   //----------------------------------------------------------------
   var buildInterface = function () {

      setCurrentImgKnums();

      //setOntNames();
      setTableDets();
      makeMarkers();
      createMarkerIFrame();

      createElements();
      setMarkerTable();
      setViewerTitle();

      setInfoIFrame(); 
      checkCheckboxes();
      showUrlSpecifiedMarkers();

      pointClickChanges.ready = true;
      INITIALISED = true;
      //console.log("supplementPointClick.buildInterface finished");
      notify("buildInterface");

   }; // buidInterface:

   //----------------------------------------------------------------
   // for kaufman_atlas we want a handy (unique) list of: knum, kdesk, emapa for the table.
   // for kaufman_supplement we want all possible terms for the table.
   //----------------------------------------------------------------
   var setTableDets = function () {

      var len = supplementTerms.length;
      var obj;
      var entry;
      var knum;
      var names;
      var i;

      for(i=0; i<len; i++) {
         entry = supplementTerms[i];
	 knum = entry.knum;
	 names = entry.names;
         obj = {
	    knum: entry.knum,
	    emapa: entry.emapa,
	    names: names
	 };
         //console.log(obj.knum);
	 // we don't want duplicate entries
	 if(!containsKnum(tableDets, obj.knum)) {
            tableDets[tableDets.length] = obj;
	 } else {
            //console.log("%s already exists",obj.knum);
	 }
      }

      tableDets = tableDets.sort(emouseatlas.emap.utilities.sort_by('knum', false, parseInt));

   }; // setTableDets:

   //----------------------------------------------------------------
   var containsKnum = function (arr, knum) {

      var i = arr.length;

      while (i--) {
	 if (arr[i].knum === knum) {
	    return true;
	 }
      }

      return false;

   }; // containsKnum:

   //---------------------------------------------------------------
   var makeMarkers = function () {

      var key;
      var annot;
      var numlocs;
      var flag;
      var label;
      var info;
      var len;
      var i,j;

      //markerDets = new Map();  // not widely available yet
      markerDets = {};

      len = annotations.length;

      //console.log("annotations ",annotations);

      for(i=0; i<len; i++) {
         //console.log("makeMarkers annotation %d -----------------------------------",i);
         annot = annotations[i];
	 key = annot.img_id + "_" + annot.knum;
	 //console.log("makeMarkers: key %s",key);

	 if(markerDets[key] === undefined) {
	    markerDets[key] = {key:key, flags:[], labels:[]};
	 }

	 numlocs = locationDets[key].locArr.length;
	 //console.log("numlocs ",numlocs);

	 for(j=0; j<numlocs; j++) {
	    info = {img_id:annot.img_id, knum:annot.knum, kdesk:annot.kdesk, fnum:j};
	    //console.log("info ",info);
	    flag = makeMarkerFlag(info);
	    label = makeMarkerLabel(info);

	    markerDets[key].flags[j] = flag;
	    markerDets[key].labels[j] = label;
	 }

      }

      //console.log(markerDets);

   }; // makeMarkers:

   //---------------------------------------------------------------
   var getSubplateImgs = function () {

      var imgData;
      var subplate;
      var annot;
      var img;
      var imgArr;
      var len;
      var i;

      imgData = model.getPointClickImgData();
      subplate = imgData.subplate;

      imgArr = [];

      len = annotations.length;

      for(i=0; i<len; i++) {
         img = {};
         annot = annotations[i];
         //console.log(annot); 
	 img.oid = annot.img_oid;
	 img.id = annot.img_id;
	 if(containsImg(imgArr, img.oid)) {
	    continue;
	 } else {
	    imgArr[imgArr.length] = img;
	 }
      }

      imgArr = imgArr.sort(emouseatlas.emap.utilities.sort_by('oid', false, parseInt));
      //console.log(imgArr); 

   }; // getSubplateImgs:

   //---------------------------------------------------------------
   var containsImg = function (arr, oid) {

      var i = arr.length;

      while (i--) {
	 if (arr[i].oid === oid) {
	    return true;
	 }
      }

      return false;

   }; // containsImg:

   //=============================================================================================================

   // deal with initial setting of checkboxes
   var checkCheckboxes = function () {

      var chkbx;

      if(EDITOR) {
         SHOW_MARKER_TXT = true;
         ALLOW_CLOSEST_MARKERS = false;
         return false;
      }

      chkbx = $('pointClickShowClosestChkbx');
      if(chkbx === undefined || chkbx === null) {
         ALLOW_CLOSEST_MARKERS = false;
      } else {
         ALLOW_CLOSEST_MARKERS = (chkbx.checked) ? true : false;
      }
      allowClosestMarkers = ALLOW_CLOSEST_MARKERS;
      closestMarkerNums = [];
	
      chkbx = $('pointClickShowTxtChkbx');
      SHOW_MARKER_TXT = (chkbx.checked) ? true : false;

      //console.log("checkCheckboxes ALLOW_CLOSEST_MARKERS %s, SHOW_MARKER_TXT %s",ALLOW_CLOSEST_MARKERS,SHOW_MARKER_TXT)

   }; // checkCheckboxes

   //---------------------------------------------------------------
   var setInfoIFrame = function () {

      var project;
      var details;
      var plate;
      var subplate;
      var found = false;
      var len;
      var i;
      var infoDetailsTrimmed = {};
      var stray;
      var str;

      //console.log("enter setInfoIFrame");

      project = model.getProject();

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      infoDetailsTrimmed.crLength = titleInfo.crLength;
      infoDetailsTrimmed.description = titleInfo.description;
      infoDetailsTrimmed.plate = titleInfo.plate;
      infoDetailsTrimmed.sectionType = titleInfo.sectionType;

      infoDetailsTrimmed.images = [];
      len = titleInfo.images.length;
      for(i=0; i<len; i++) {
         infoDetailsTrimmed.images[i] = titleInfo.images[i];
      }

      stray = titleInfo.stage.split(';');
      infoDetailsTrimmed.stage = stray[0];

      stray = titleInfo.dpc.split(';');
      infoDetailsTrimmed.dpc = stray[0];

      stray = titleInfo.carnegie.split(';');
      infoDetailsTrimmed.carnegie = stray[0];

      stray = titleInfo.witschi.split(';');
      infoDetailsTrimmed.witschi = stray[0];

      details = {plate:plate, subplate:subplate, info:infoDetailsTrimmed};

      // set up info frame
      emouseatlas.emap.titleInfo.initialise({
         targetId:titleInfoTarget,
         details:details,
         model:emouseatlas.emap.tiledImageModel,
         view:emouseatlas.emap.tiledImageView
      });

      // set up marker popup frame
      emouseatlas.emap.markerPopup.initialise({
         targetId:markerPopupTarget,
         model:emouseatlas.emap.tiledImageModel,
         view:emouseatlas.emap.tiledImageView,
	 project:project
      });


      // in case there is a url parameter asking for image on a different embryo (plate03, plate04)
      doDistChanged("setInfoIFrame");

   }; // setInfoIFrame:

   //---------------------------------------------------------------
   var setViewerTitle = function (indx) {

      var plate;
      var subplate;
      var pageHeaderDiv = $("pageHeaderDiv");
      var titleDiv;
      var titleInfoIconDiv;
      var theiler;
      var dpc;
      var found = false;
      var project;
      var title;

      //console.log("enter setViewerTitle ",titleInfo);

      if(!titleInfo) {
         return false;
      }

      // we don't want a new title every time an editor adds a location
      titleDiv = $("wlzIIPViewerTitle");
      if(titleDiv !== null) {
         //titleDiv.parentNode.removeChild(titleDiv);
         return false;
      }

      project = model.getProject();

      title = project; 

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      // the parseInt trims leading zeros
      title += " Plate " + parseInt(subplate, 10);

      dpc = titleInfo.dpc;
      stray = dpc.split(';');
      dpc = stray[0];
      title += " (" + dpc + " dpc)";

      theiler = titleInfo.stage;
      stray = theiler.split(';');
      theiler = stray[0];
      title += " TS " + theiler;

      titleDiv = new Element('div', {
         'id': 'wlzIIPViewerTitle',
	 'text':title
      });

      titleDiv.inject(pageHeaderDiv, 'inside');

      titleInfoIconDiv = new Element('div', {
         'id': 'titleInfoIconDiv'
      });

      titleInfoImg = new Element('img', {
         'id': 'titleInfoIconImg',
	 'src': imgDir + 'info-26.png'
      });

      titleInfoImg.inject(titleInfoIconDiv, 'inside');
      titleInfoIconDiv.inject(pageHeaderDiv, 'inside');

      utils.addEvent(titleInfoIconDiv, 'click', doTitleInfoIconClicked, false);
      utils.addEvent(titleInfoIconDiv, 'mouseover', showTitleInfoFrame, false);
      utils.addEvent(titleInfoIconDiv, 'mouseout', hideTitleInfoFrame, false);

   }; // setViewerTitle:

   //---------------------------------------------------------------
   var updateViewerTitle = function (multiple, indx) {

      var plate;
      var subplate;
      var pageHeaderDiv = $("pageHeaderDiv");
      var titleDiv;
      var titleInfoIconDiv;
      var stray = [];
      var theiler;
      var dpc;
      var multipleTheiler = false;
      var multipleDPC = false;
      var len;
      var i;
      var found = false;
      var title = "Kaufman Supplement ";

      if(!titleInfo) {
         return false;
      }

      //console.log(titleInfo);

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;
      //console.log("updateViewerTitle subplate ", subplate);

      // the parseInt trims leading zeros
      title += "Plate " + subplate;

      dpc = titleInfo.dpc;
      if(multiple) {
	 stray = dpc.split(';');
	 if(plate === "03") {
	    if(indx === 0) {
	       dpc = stray[0];
	    } else {
	       dpc = stray[1];
	    }
	 } else {
	    dpc = stray[0];
	 }
      }
      title += " (" + dpc + ")";

      theiler = titleInfo.stage;
      if(multiple) {
	 stray = theiler.split(';');
	 theiler = stray[0];
	 if(plate === "03") {
	    if(indx === 0) {
	       theiler = stray[0];
	    } else {
	       theiler = stray[1];
	    }
	 } else {
	    theiler = stray[0];
	 }
      }
      title += " TS " + theiler;

      titleDiv = $('wlzIIPViewerTitle');
      if(titleDiv) {
	 titleDiv.set('text', title);
      }

   }; // updateViewerTitle:

   //---------------------------------------------------------------
   var updateInfoIFrame = function (multiple, indx) {

      var details;
      var plate;
      var subplate;
      var len;
      var i;
      var infoDetails;
      var infoDetailsTrimmed = {};
      var stray;
      var dpc;
      var theiler;
      var carnegie;
      var witschi;
      var desc;
      var indx1;
      var indx2;
      var indx3;
      var str;
      var titleIFrame;
      var found = false;

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      //console.log("supplementPointClick plate %s, subplate %s",plate, subplate);
      //console.log("supplementPointClick titleInfo ",titleInfo);

      if(titleInfo) {
	 len = titleInfo.length;
	 for(i=0; i<len; i++) {
	    if(titleInfo[i].plate === subplate) {
	       infoDetails = titleInfo[i];
	       found = true;
	       break;
	    }
	 }
      }

      if(!found) {
         return false;
      }

      infoDetailsTrimmed.crLength = infoDetails.crLength;

      // plate 03 is split across two embryos but has three 'cartoons'
      if(plate === "03") {
         //assumes the description is ...
	 //a—e Advanced egg cylinder stage embryo; f—j,k—o Two advanced egg cylinder/early primitive streak stage embryos. These embryos all sectioned transversely from the region of the ectoplacental cone towards the distal region of the embryonic pole.
	 indx1 = infoDetails.description.indexOf("; f");
	 indx1 += 1.0;
	 indx2 = infoDetails.description.indexOf("These embryos");

         if(indx === 0) {
            desc = infoDetails.description.slice(0, indx1) + "<br>" + infoDetails.description.slice(indx2);
         } else {
            desc = infoDetails.description.slice(indx1, indx2) + '<br>' + infoDetails.description.slice(indx2);
         }
      } else {
         desc = infoDetails.description;
      }
      infoDetailsTrimmed.description = desc;

      infoDetailsTrimmed.plate = infoDetails.plate;
      infoDetailsTrimmed.sectionType = infoDetails.sectionType;

      infoDetailsTrimmed.images = [];
      len = infoDetails.images.length;
      for(i=0; i<len; i++) {
         infoDetailsTrimmed.images[i] = infoDetails.images[i];
      }

      stray = infoDetails.stage.split(';');
      // plate 03 is split across two embryos
      if(plate === "03") {
         if(indx === 0) {
            theiler = stray[0];
         } else {
            theiler = stray[1];
         }
      } else {
         theiler = stray[0];
      }
      infoDetailsTrimmed.stage = theiler;

      stray = infoDetails.dpc.split(';');
      if(plate === "03") {
         if(indx === 0) {
            dpc = stray[0];
         } else {
            dpc = stray[1];
         }
      } else {
         dpc = stray[0];
      }
      infoDetailsTrimmed.dpc = dpc;

      stray = infoDetails.carnegie.split(';');
      if(plate === "03") {
         if(indx === 0) {
            carnegie = stray[0];
         } else {
            carnegie = stray[1];
         }
      } else {
         carnegie = stray[0];
      }
      infoDetailsTrimmed.carnegie = carnegie;

      stray = infoDetails.witschi.split(';');
      if(plate === "03") {
         if(indx === 0) {
            witschi = stray[0];
         } else {
            witschi = stray[1];
         }
      } else {
         witschi = stray[0];
      }
      infoDetailsTrimmed.witschi = witschi;

      details = {plate:plate, subplate:subplate, info:infoDetailsTrimmed};

      // set up info frame
      emouseatlas.emap.titleInfo.initialise({
         targetId:titleInfoTarget,
         details:details,
         model:emouseatlas.emap.tiledImageModel,
         view:emouseatlas.emap.tiledImageView
      });

   }; // updateInfoIFrame:

   //---------------------------------------------------------------
   // called when info icon clicked
   //---------------------------------------------------------------
   var doTitleInfoIconClicked = function (event) {
      if(KEEP_TITLE_INFO_FRAME === false) {
         KEEP_TITLE_INFO_FRAME = true;
         showTitleInfo();
      } else {
         hideTitleInfo();
      }
   };

   //---------------------------------------------------------------
   // called on mouseover info icon
   //---------------------------------------------------------------
   var showTitleInfoFrame = function (event) {
      showTitleInfo();
   };

   //---------------------------------------------------------------
   // called on mouseout info icon
   //---------------------------------------------------------------
   var hideTitleInfoFrame = function (event) {
      if(KEEP_TITLE_INFO_FRAME) {
         return false;
      }
      hideTitleInfo();
      KEEP_TITLE_INFO_FRAME = false;
   };
 
   //---------------------------------------------------------
   var showTitleInfo = function () {
      //console.log("showTitleInfo");

      var closeDiv = document.getElementById("wlzIIPViewerTitleIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerTitleIFrameContainer");
      var iframe = document.getElementById("wlzIIPViewerTitleIFrame");

      div.style.visibility = "visible";
      if(closeDiv) {
	 utils.addEvent(closeDiv, 'click', hideTitleInfo, false);
      }

      iframe.style.visibility = "visible";
   };
   
   //---------------------------------------------------------
   var hideTitleInfo = function () {
      //console.log("hideTitleInfo");

      var closeDiv = document.getElementById("wlzIIPViewerTitleIFrameCloseDiv");
      var div = document.getElementById("wlzIIPViewerTitleIFrameContainer");
      var iframe = document.getElementById("wlzIIPViewerTitleIFrame");

      div.style.visibility = "hidden";
      if(closeDiv) {
	 utils.removeEvent(closeDiv, 'click', hideTitleInfo, false);
      }

      KEEP_TITLE_INFO_FRAME = false;
      iframe.style.visibility = "hidden";
   };

   //---------------------------------------------------------------
   // This is called from context menu.
   // We only want data for the image that is being displayed
   //---------------------------------------------------------------
   var doDownloadImageData = function () {

      //console.log("doDownloadImageData for img%s",currentImg);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var url = '/kaufmanwebapp/GetDownloadInfo';
      var ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&image="+currentImg,
         callback:doDownloadImageDataCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // doDownloadImageData

   //---------------------------------------------------------------
   var doDownloadImageDataCallback = function (response, urlParams) {

      //if(_debug) console.log("doDownloadImageDataCallback: \n" + urlParams);
      var webServer;
      var project;
      var url;
      var div;
      var len;
      var i;
      
      webServer = model.getWebServer();
      //console.log("webServer %s",webServer);

      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      url = webServer + "/" + response;

      window.open(url);

   }; // doDownloadImageDataCallback:

   //---------------------------------------------------------------
   var getMarkerByLocId = function (testid) {

      var ret = undefined;
      var mkrdets;
      var locdetArr
      var locdet;
      var locid
      var keys;
      var key;
      var len;
      var len2;
      var len3;
      var i;
      var j;
      var k;
      
      keys = getSubplateKeys();
      len = keys.length;

      for(i=0; i<len; i++) {
         key = keys[i];
         mkrdets = subplateMarkerDetails[key];
	 locdetArr = mkrdets.locdets;
	 len2 = locdetArr.length;
	 for(j=0; j<len2; j++) {
	    locdet = locdetArr[j];
	    locid = locdet.loc_id;
	    if(locid === testid) {
	       //if(_debug) console.log("found location ",locid);
	       ret = locdet;
	       break;
	    }
	 }
      }
      return ret;

   }; // getMarkerByLocId:

   //---------------------------------------------------------------
   var storeSubplateImgNames = function (plateData) {

      if(plateData === undefined || plateData === null) {
         if(_debug) console.log("storeSubplateImgNames returning, no plateData");
         return undefined;
      }

      var len;
      var len2;
      var imgData;
      var i;
      var j;
      var name = "";

      //console.log("storeSubplateImgNames plateData ", plateData);

      len = plateData.images.length;
      for(i=0; i<len; i++) {
         imgData = plateData.images[i];
	 //console.log("storeSubplateImgNames %d ",i,imgData);
	 subplateImgNames[subplateImgNames.length] = imgData.id;
      }

   };  // storeSubplateImgNames

   //---------------------------------------------------------------
   // (possibly multiple) location x,y,z for each img_id_knum  are stored in an array
   //---------------------------------------------------------------
   var storeLocations = function (subplateData, from) {

      if(subplateData === undefined || subplateData === null) {
         console.log("storeLocations returning, subplateData undefined");
         return undefined;
      }

      var imgData;
      var img_id;
      var idlocs;
      var idloc;
      var knum;
      var fnums;
      var fnum;
      var key;
      var len1, len2;
      var i,j;

      //if(from === "updatePlateDataCallback") console.log("storeLocations subplateData ",subplateData);
      //console.log("storeLocations from %s, subplateData ",from,subplateData);

      locationDets = {};

      len1 = subplateData.length;

      // for each image on the subplate
      for(i=0; i<len1; i++) {
         imgData = subplateData[i];
	 //if(from === "updatePlateDataCallback") console.log("storeLocations imgData ",imgData);
	 //console.log("storeLocations imgData ",imgData);

	 idlocs = imgData.locations;
	 //if(from === "updatePlateDataCallback") console.log("storeLocations idlocs ",idlocs);
         fnums = undefined;
         fnums = [];
	 fnum = 0;
	 len2 = idlocs.length;
	 // for each location on the image
         for(j=0; j<len2; j++) {
            idloc = idlocs[j];
	    knum = idloc.knum;
	    //console.log("knum -->%s<--",knum);
            key = idloc.img_id + "_" + idloc.knum;
	    //if(from === "updatePlateDataCallback") console.log("key %s",key);
	    if(fnums[key] === undefined) {
	       fnums[key] = {key:key, fnum:[0]};
	    } else {
	       fnum = fnums[key].fnum;
	       //console.log("fnum ",fnum);
	       fnum[fnum.length] = fnum[fnum.length-1] + 1*1;
	    }
	    //if(from === "updatePlateDataCallback") console.log("storeLocations fnums ",fnums);
	    //if(from === "updatePlateDataCallback") console.log("storeLocations idlocs[%d] ",j,idlocs[j]);

	    if(locationDets[key] === undefined) {
	       locationDets[key] = { key:key, oidArr:[], locArr:[], fnumArr:[] }
	    }
	    locationDets[key].oidArr[locationDets[key].oidArr.length] = idloc.oid;
	    locationDets[key].locArr[locationDets[key].locArr.length] = {x:idloc.x, y:idloc.y, z:idloc.z};
	    locationDets[key].fnumArr = fnums[key].fnum;
         }
      }

      //if(from === "updatePlateDataCallback") console.log(locationDets);
      //console.log("storeLocations: locationDets ",locationDets);

   };  // storeLocations

   //---------------------------------------------------------------
   var storeAnnotation = function (annotData) {

      var len;
      var annot;
      var img_oid;
      var knum;
      var emapa;
      var kdesk;
      var i;

      if(annotData === undefined || annotData === null) {
	 console.log("storeAnnotation returning, no annotData");
         return undefined;
      }

      //console.log("storeAnnotation currentImg %s",currentImg);

      len = annotData.length;
      for(i=0; i<len; i++) {
         annot = annotData[i];
         //console.log("storeAnnotation img_id %s",annot.img_ident);
	 annotations[annotations.length] = {
	    img_oid:annot.img_fk,
	    img_id:annot.img_ident,
	    knum:annot.knum,
	    emapa:annot.ont_fk,
	    kdesk:annot.kdesk,
	    wiki:annot.wiki
	 };
      }

      //console.log("storeAnnotation ",annotations);

   };  // storeAnnotation

   //---------------------------------------------------------------
   var storeSupplementTerms = function (termData) {

      var term;
      var lmntArr;
      var knum;
      var emapa;
      var len;
      var i;

      if(termData === undefined || termData === null) {
	 console.log("storeSupplementTerms returning, no termData");
         return undefined;
      }

      lmntArr = [];

      len = termData.length;
      for(i=0; i<len; i++) {
         term = termData[i];
	 lmntArr = term.split("#");
	 knum = lmntArr[0];
	 emapa = lmntArr[1];
	 supplementTerms[supplementTerms.length] = {
	    knum:knum,
	    emapa:emapa
	 };
      }

      //console.log("storeSupplementTerms termData ",supplementTerms);
      //console.log("storeSupplementTerms supplementTerms ",supplementTerms);

   };  // storeSupplementTerms

   //---------------------------------------------------------------
   var getAnnotations = function () {
      return annotations;
   }

   //----------------------------------------------------------------------
   // because plate_03 spans 3 embryos we need to see which image we are on
   //----------------------------------------------------------------------
   var getAnnotationForKnum = function (knum) {
      
      var annot;
      var images;
      var len;
      var i;

      ret = undefined;
      //console.log("getAnnotationForKnum %s ",knum, currentImg);

      images = getSubplateImgNames();
      //console.log("getAnnotationForKnum images ",images);

      len = annotations.length;
      //console.log("getAnnotationForKnum: annotations.length = %d",len);

      for(i=0; i<len; i++) {
         annot = annotations[i]
         //console.log("annotation %d ",i,annot);
	 if (annot.knum === knum &&  emouseatlas.emap.utilities.contains(images, annot.img_id)) {
	    break;
	 }
      }
      //console.log("getAnnotationForKnum %s ",knum, annot);
      return  annot;
   }

   //---------------------------------------------------------------
   var getSubplateImgNames = function () {
      return subplateImgNames;
   };

   //---------------------------------------------------------------
   var getSelectedRowKnums = function () {
      return selectedRowKnums;
   };

   //---------------------------------------------------------------
   var setMarkerTable = function () {

      var knum;
      var ontNames;
      var table = $('pointClickTable');
      var tableBody = $('pointClickTableBody');
      var pointClickEntryId;
      var pointClickEntryDesc;
      var len;
      var i;

      len = tableDets.length;

      for(i=0; i<len; i++) {
         knum = tableDets[i].knum;
	 //console.log("setMarkerTable knum ", knum);
         ontNames = tableDets[i].names;
	    // set up the table
	    var row = new Element("tr", {
   	       'id': 'pointClickTableRow_' + knum,
   	       'class': 'pointClickTableRow'
	    });
	    // Create a <td> element and a text node, make the text
	    // node the contents of the <td>, and put the <td> at
	    // the end of the table row
	    var id_cell = new Element("td", {
   	       'id': 'pointClickTableCell_id_' + knum,
   	       'class': 'pointClickTableCell id'
	    });
            pointClickEntryId = new Element('div', {
   	       'id': 'pointClickEntryId_' + knum,
      	       'class': 'pointClickEntryId',
   	       'text': knum
            });
   
	    var desc_cell = new Element("td", {
   	       'id': 'pointClickTableCell_desc_' + knum,
   	       'class': 'pointClickTableCell desc'
	    });
            pointClickEntryDesc = new Element('div', {
   	       'id': 'pointClickEntryDesc' + knum,
      	       'class': 'pointClickEntryDesc',
   	       'text': ontNames[1]
            });
   
	    id_cell.inject(row, 'inside');
	    pointClickEntryId.inject(id_cell, 'inside');

	    desc_cell.inject(row, 'inside');
	    pointClickEntryDesc.inject(desc_cell, 'inside');

	    row.inject(tableBody, 'inside');

	    var theRow = $('pointClickTableRow_' + knum);

   	    // add event handlers.
	    utils.addEvent(theRow, 'mouseover', doMouseOverTableRow, false);
	    utils.addEvent(theRow, 'mouseout', doMouseOutTableRow, false);
	    //utils.addEvent(theRow, 'mousedown', doMouseDownTableRow, false);
	    utils.addEvent(theRow, 'mouseup', doMouseUpTableRow, false);
	    //utils.addEvent(theRow, 'click', doMouseUpTableRow, false); // for programmatic selection
      }

   }; // setMarkerTable

   //---------------------------------------------------------------
   var getSubplateKeys = function (imageData) {
      return subplateKeys;
   };

   //---------------------------------------------------------------
   var getLocationsForKey = function (key) {

      var locations = [];
      var markerDetails;
      var len;
      var i;

      markerDetails = subplateMarkerDetails[key];
      //if(_debug) console.log("getLocationsForKey: markerDetails ",markerDetails);
      len = markerDetails.locdets.length;
      for(i=0; i<len; i++) {
         locations[locations.length] = markerDetails.locdets[i];
      } // for

      //if(_debug) console.log("getLocationsForKey %s, ",key,locations);
      return locations;
   }; // getLocationsForKey

   //---------------------------------------------------------------
   var makeMarkerFlag = function (info) {

      var container = $(markerContainerId);
      var img_id;
      var knum;
      var kdesk;
      var fnum;
      var strlen;
      var map;
      var usemap;
      var mapArea;
      var klass;

      //console.log("makeMarkerFlag: ",info);
      img_id = info.img_id;
      knum = info.knum;
      kdesk = info.kdesk;
      fnum = info.fnum;

      //if(knum === "1") {
       //  console.log("makeMarkerFlag: img_id %s, knum %s, fnum %s",img_id, knum, fnum);
      //}

      strlen = knum.length;
      switch (strlen) {
         case 1:
	    klass = "markerTxtDiv one";
	 break;
         case 2:
	    klass = "markerTxtDiv two";
	 break;
         case 3:
	    klass = "markerTxtDiv three";
	 break;
      }

      var markerImgDiv = new Element('div', {
            'id': 'markerImgDiv_' + img_id + "_" + knum + "_" + fnum,
            'class': 'markerImgDiv'
      });

      var src = srcClosest;
      var markerImg = new Element('img', {
            'id': 'markerImg_' + knum + "_" + fnum,
            'class': 'markerImg',
	    'src': src
      });

      mapArea = new Element('area', {
            'id': 'markerImgMapArea_' + img_id + "_" + knum + "_" + fnum,
            'name': 'markerImgMapArea_' + img_id + "_" + knum + "_" + fnum,
	    'shape': 'polygon',
	    'coords': '10,0,13,1,15,3,17,5,19,8,19,14,17,16,15,18,13,22,12,25,11,28,10,34,9,28,8,25,7,22,5,18,3,16,1,14,1,8,3,5,5,3,7,1,10,0'
      });

      map = new Element('map', {
            'id': 'markerImgMap_' + img_id + "_" + knum + "_" + fnum,
            'name': 'markerImgMap_' + img_id + "_" + knum + "_" + fnum,
      });

      var markerTxtDiv = new Element('div', {
            'id': 'markerTxtDiv_' + img_id + "_" + knum + "_" + fnum,
            'class': klass
      });
      markerTxtDiv.set('text', knum);


      mapArea.inject(map, 'inside');

      usemap = "#" + map.name
      markerImg.set('usemap', usemap);

      map.inject(container, 'inside');
      markerImg.inject(markerImgDiv, 'inside');
      markerImgDiv.inject(container, 'inside');
      markerTxtDiv.inject(markerImgDiv, 'inside');

      utils.addEvent(mapArea, 'mouseover', doMouseOverMarker, false);
      utils.addEvent(mapArea, 'mouseout', doMouseOutMarker, false);
      utils.addEvent(mapArea, 'mouseup', doMouseUpMarker, false);

      utils.addEvent(markerTxtDiv, 'mouseover', doMouseOverMarker, false);
      utils.addEvent(markerTxtDiv, 'mouseout', doMouseOutMarker, false);
      utils.addEvent(markerTxtDiv, 'mouseup', doMouseUpMarker, false);

      return markerImgDiv;
   };

   //---------------------------------------------------------------
   var makeMarkerLabel = function (info) {

      var container = $(markerContainerId);
      var img_id;
      var knum;
      var kdesk;
      var fnum;
      var markerLabelDiv;

      if(_debug) console.log("makeMarkerLabel ",info);
      //console.log("makeMarkerLabel ",info);

      img_id = info.img_id;
      knum = info.knum;
      //kdesk = info.kdesk[1];
      kdesk = info.kdesk;
      //console.log("makeMarkerLabel ",info.kdesk);
      fnum = info.fnum;

      markerLabelDiv = new Element('div', {
            'id': 'markerLabelDiv_' + img_id + "_" + knum + "_" + fnum,
            'class': 'markerLabelDiv'
      });
      markerLabelDiv.set('text', kdesk);
      markerLabelDiv.inject(container, 'inside');

      return markerLabelDiv;
   };

   //---------------------------------------------------------------
   var isOnCurrentImg = function (knum) {

      //if(_debug) console.log("isOnCurrentImg ",knum);
      var key;
      var locdets;

      key = getKeyForKnum(knum);
      //console.log("isOnCurrentImg %s",key);

      locdets = locationDets[key];

      ret = (locdets === undefined) ? false : true;
      //console.log(ret);

      return ret;
   };

   //---------------------------------------------------------------
   // There may be multiple markers associated with each img_id_knum
   //---------------------------------------------------------------
   // based on kaufman atlas version
   var setMarkerSrc = function (knum, src, from) {

      var key;
      var dets;
      var locdets;
      var img_id;
      var knum;
      var flags;
      var flag;
      var flagImg;
      var len;
      var i;

      if(_debug) console.log("enter setMarkerSrc, from %s",from);
      if(knum === undefined || knum === null) {
         return false;
      }

      key = getKeyForKnum(knum);

      dets = markerDets[key];
      locdets = locationDets[key];
      if(locdets === undefined || locdets === null) {
         return false;
      }

      len = locdets.locArr.length;
      for(i=0; i<len; i++) {
	 flag = dets.flags[i];
	 flagImg = flag.getElementsByTagName("img")[0];
	 flagImg.set('src', src);
      }

      if(EDITOR) {
         setEditedMarkerSrc();
      }

   };

   //---------------------------------------------------------------
   var setEditedMarkerSrc = function () {

      var key;
      var dets;
      var markerdets;
      var flag;
      var flagImg;
      var len;
      var i;

      //console.log("setEditedMarkerSrc");

      len = editedMarkerDets.length;
      for(i=0; i<len; i++) {
         dets = editedMarkerDets[i];
	 //key = dets.img_id + "_" + dets.knum + "_" + dets.fnum;
	 key = dets.img_id + "_" + dets.knum;
         markerdets = markerDets[key];
	 flag = markerdets.flags[dets.fnum];
	 flagImg = flag.getElementsByTagName("img")[0];
	 flagImg.set('src', srcEdited);
      }

   }; // setEditedMarkerSrc

   //---------------------------------------------------------------
   var doMouseOverMarker = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var knum;

      knum = getKnumFromMarkerId(target.id, true);
      fnum = getFnumFromMarkerId(target.id);
      highlightedMarkerKnum = knum;
      highlightedMarkerFnum = fnum;
      //console.log("doMouseOverMarker: target %s, knum %s, fnum %s",target.id, knum, fnum);

      setMarkerSrc(knum, srcHighlighted, "doMouseOverMarker");
      displayMarkerLabel(knum, true, "doMouseOverMarker");
      highlightRow(knum, 'over');
   };

   //---------------------------------------------------------------
   var doMouseOutMarker = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var knum;
      var row;

      knum = getKnumFromMarkerId(target.id, true);
      highlightedMarkerKnum = undefined;
      highlightedMarkerFnum = undefined;

      allowClosestMarkers = true;

      if(knumPresent(knum, true, "doMouseOutMarker")) {
         setMarkerSrc(knum, srcSelected, "doMouseOutMarker");
         row = getRowWithKnum(knum);
         row.className = 'pointClickTableRow selected';
      }
      displayMarkerLabel(knum, false, "doMouseOutMarker");
      clearRowHighlight();
   };

   //---------------------------------------------------------------
   var doMouseUpMarker = function (e) {

      var target;
      var knum;
      var fnum;
      var mouseButtons;
      var modifiers;

      mouseButtons = utils.whichMouseButtons(e);
      modifiers = emouseatlas.emap.utilities.whichModifierKeys(e);

      //console.log("mouse up: mouse Buttons ", mouseButtons);
      //console.log("mouse up: modifiers ", modifiers);

      if(mouseButtons.right) {
         return false;
      }

      target = utils.getTarget(e);
      //console.log("doMouseUpMarker: target.id ", target.id);

      knum = getKnumFromMarkerId(target.id, true);
      fnum = getFnumFromMarkerId(target.id, true);
      //console.log("doMouseUpMarker, knum %s, fnum %s, previousOpenMarker -->%s<--",knum,fnum,previousOpenMarker);

      SHOW_ALL_MARKERS = false;

      selectThisTerm(knum);

      // we don't want the markerPopupIFrame to pop up when deleting a marker
      if(modifiers.shift && modifiers.alt) {
         return false;
      }

      // if there are no markerPopupIframes open, then open this one
      if(previousOpenMarker == undefined) {
         displayMarkerPopup(knum, true, "doMouseUpMarker");
	 previousOpenMarker = knum;
	 return false;
      }

      // if this markerPopupIframe is already open, close it
      if(knum == previousOpenMarker) {
         displayMarkerLabel(knum, false, "doMouseUpMarker");
         displayMarkerPopup(knum, false, "doMouseUpMarker");
	 previousOpenMarker = undefined;
      }

      // if there is a markerPopupIframe already open but not this one, close it, then open this one
      if(previousOpenMarker != undefined && knum != previousOpenMarker) {
         displayMarkerLabel(previousOpenMarker, false, "doMouseUpMarker");
         displayMarkerPopup(previousOpenMarker, false, "doMouseUpMarker");
         displayMarkerLabel(knum, false, "doMouseUpMarker");
         displayMarkerPopup(knum, true, "doMouseUpMarker");
	 previousOpenMarker = knum;
      }

      return false;

   };

   //---------------------------------------------------------------
   var selectThisTerm = function (knum) {

      var trgtId;
      var row;
      var popup;
      var viz;
      var vizibl;
      var fnum;

      if(!knum) {
         return false;
      }

      vizibl = true;
      fnum = undefined;
      row = undefined;

      trgtId = "pointClickTableRow_" + knum;
      row = document.getElementById(trgtId);

      len = selectedRowKnums.length;
      //................................................................
      // If there are no previously selected rows, select it.
      if(len === 0) {
	 row.className = "pointClickTableRow selected";
	 setMarkerSrc(knum, srcSelected, "selectThisTerm");
	 displayMarker(knum, fnum, vizibl, "selectThisTerm");
	 // add the knum for this marker to the list of selected markers
	 selectedRowKnums[selectedRowKnums.length] = knum;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	 selectedRowKnums = utils.duplicateArray(tmpArr);
	 previousSelectedRow = (previousSelectedRow === undefined) ? knum : latestSelectedRow;
	 latestSelectedRow = knum;
	 listSelectedTerms("selectThisTerm, no others selected");
	 return false;
      }
      //................................................................
      // If this is the only previously selected row and there are no modifiers,
      // de-select it if the popup is visible, otherwise leave it alone
      // The popup visibility is before the marker click.
      if(len === 1 && selectedRowKnums[0] === knum) {
         viz = "hidden";
         popup = document.getElementById("markerPopupIFrameContainer");
	 if(popup) {
            viz = window.getComputedStyle(popup, null).getPropertyValue("visibility");
	    if(viz === "visible") {
	       doHideAllMarkers(null);
	       previousSelectedRow = latestSelectedRow;
	       latestSelectedRow = undefined;
	    }
	 }
	 return false;
      }
      //................................................................
      // If there are previously selected row(s) and no modifier is pressed ...
      // select the clicked row if it is not already selected
      if(len > 0) {
	 //doHideAllMarkers(null);
	 if(knumPresent(knum,true,"selectThisTerm")) {
	    //removeKnum(knum,true);
	    //row.className = "pointClickTableRow";
            //setMarkerSrc(knum, srcHighlighted, "selectThisTerm");
	    // remove the knum for this marker from the list of selected markers
	 } else {
	    row.className = "pointClickTableRow selected";
	    setMarkerSrc(knum, srcSelected, "selectThisTerm");
	    // add the knum for this marker to the list of selected markers
	    selectedRowKnums[selectedRowKnums.length] = knum;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	    selectedRowKnums = utils.duplicateArray(tmpArr);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = knum;
	 }
	 listSelectedTerms("selectThisTerm, others already selected");
	 displayMarker(knum, fnum, vizibl, "selectThisTerm");
	 //positionMarker(knum, "selectThisTerm");
	 return false;
      }

   }; // selectThisTerm

   //---------------------------------------------------------------
   // from right-click menu on anatomy terms in list / table at RHS
   //---------------------------------------------------------------
   var doTableQuery = function (database) {

      var queryStr; // a comma separated list of emapa ids followed by stage
      var EMAGE;
      var MGI;
      var dbLC;
      var url;
      var knum;
      var annot;
      var emapaArr;
      var comma;
      var len;
      var i;

      //console.log("doTableQuery for %s", database);

      dbLC = database.toLowerCase();

      if(selectedRowKnums === undefined || selectedRowKnums === null || selectedRowKnums.length === 0) {
         console.log("doTableQuery returning, no selected knums");
         return false;
      }

      emapaArr = [];
      EMAGE = "emage";
      MGI = "mgi";
      queryStr = "";

      len = selectedRowKnums.length;

      for(i=0; i<len; i++) {
         knum = selectedRowKnums[i];
         annot = getAnnotationForKnum(knum);
	 emapaArr[emapaArr.length] = annot.emapa;
      }
      //console.log("emapaArr ",emapaArr);

      dbLC = database.toLowerCase();

      len = emapaArr.length;
      multiple = (len > 1) ? true : false;

      if(dbLC === EMAGE) {
	 for(i=0; i<len; i++) {
	    comma = (i===0) ? "" : ",";
	    queryStr = queryStr + comma + emapaArr[i];
	 }
         url = emageUrl + queryStr + '&exactmatchstructures=true&includestructuresynonyms=true'; 
      } else if(dbLC === MGI) {
	 if(latestSelectedRow) {
	    if(multiple) {
	       pointClickChanges.mgiChoice = true;
	       notify("doTableLink");
	       return false;
	    } else {
               url = mgiUrl + emapaArr[0]; 
	    }
	 } else {
	    return false;
	 }
      }

      //console.log("database %s, url %s",database,url);
      window.open(url);

   }; // doTableQuery

   //---------------------------------------------------------------
   var doTableLink = function (trgt) {
      //console.log("doTableLink %s",trgt);

      var subplate;
      var reg;
      var stage;
      var knum;
      var multiple;
      var len;
      var i;
      var trgtLC;
      var EMAPA = "emapa";
      var WIKI = "wiki";
      var ELSEVIER = "elsevier";
      var url;
      var found = false;

      //console.log("doTableLink %s",trgt);
      trgtLC = trgt.toLowerCase();

      subplate = pointClickImgData.subplate;
      //console.log("%s, %s",plate, subplate);

      stage = titleInfo.stage;

      multiple = (selectedRowKnums.length > 1) ? true : false;

      switch(trgtLC) {
         case EMAPA:
            url = abstractOntologyUrl;
	    break;
         case WIKI:
	    if(latestSelectedRow) {
	       if(multiple) {
	          pointClickChanges.wikiChoice = true;
		  notify("doTableLink");
		  return false;
	       } else {
		  url = getWikiUrl(latestSelectedRow);
	       }
            } else {
               return false;
	    }
	    break;
         case ELSEVIER:
            url = undefined;
	    break;
	 default:
	    break;
      }

      //console.log(url);
      if(url) {
         window.open(url);
      }
   };

   //---------------------------------------------------------------
   var doTableCancel = function () {
      // no op
   };

   //---------------------------------------------------------------
   var doCloseMarkerBigLabel = function (e) {

      var target;
      var knum;

      target = utils.getTarget(e);
      key = getKnumFromMarkerId(target.id, false);

      hideMarkerLabel(key, false);
   };

   //---------------------------------------------------------------
   var doMouseOverTableRow = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var row = undefined;
      var tKlass = target.className;
      var pKlass = prnt.className;
      var gKlass = gprnt.className;
      var highlighted;
      var img_id;
      var knum;
      //var key;
      var vizibl;
      var fnum;

      if(CONTEXT_MENU) {
         return false;
      }

      if(prnt.hasClass('pointClickTableRow')) {
         row = prnt;
      } else if(gprnt.hasClass('pointClickTableRow')) {
         row = gprnt;
      }
      row.className = 'pointClickTableRow over';

      highlighted = getHighlightedTableItem();
      img_id = highlighted.img_id;
      knum = highlighted.knum;

      vizibl = true;
      fnum = undefined;

      if(isOnCurrentImg(highlighted.knum)) {
         //console.log("%s is on current img", highlighted.knum);
	 setMarkerSrc(knum, srcHighlighted, "doMouseOverTableRow");
	 displayMarker(knum, fnum, vizibl, "doMouseOverTableRow");
	 lastHighlightedKnum = knum;
      }

   }; //doMouseOverTableRow

   //---------------------------------------------------------------
   var doMouseOutTableRow = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      //if(_debug) console.log("doMouseOutTableRow target %s",target.id);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var row = undefined;
      var children = undefined;
      var child = undefined;
      var gchild = undefined;
      var len;
      var i;
      var knum;
      //var key;
      var ref;
      var desc;
      var tKlass = target.className;
      var pKlass = prnt.className;
      var gKlass = gprnt.className;
      var newKlass = 'pointClickTableRow';
      var highlighted;
      var vizibl;
      var fnum;

      if(CONTEXT_MENU) {
         return false;
      }

      if(prnt.hasClass('pointClickTableRow')) {
         row = prnt;
      } else if(gprnt.hasClass('pointClickTableRow')) {
         row = gprnt;
      }

      vizibl = false;
      fnum = undefined;

      children = row.childNodes;
      len = children.length;
      for(i=0; i<len; i++) {
         child = children[i];
         gchild = child.firstChild;
         //if(_debug) console.log("grandchild ", gchild.get('text'), gchild.className);
         if(gchild.className === "pointClickEntryId") {
            knum = gchild.get('text');
	    //key = getKeyForKnum(knum);
         }
         if(gchild.className === "pointClickEntryRef") {
            ref = gchild.get('text');
         }
         if(gchild.className === "pointClickEntryDesc") {
            desc = gchild.get('text');
         }
      }

      // make sure the flags are the right colour
      // selected takes precedence over temp
      if(knumPresent(knum, false, "doMouseOutRow")) {
         setMarkerSrc(knum, srcClosest, "doMouseOutRow");
      }
      if(knumPresent(knum, true, "doMouseOutRow")) {
         setMarkerSrc(knum, srcSelected, "doMouseOutRow");
      }
      if(!knumPresent(knum, true, "doMouseOutRow") && !knumPresent(knum, false, "doMouseOutRow")) {
         setMarkerSrc(knum, srcClosest, "doMouseOutRow");
	 displayMarker(knum, fnum, vizibl, "doMouseOutTableTableRow");
      }

      // make sure selected rows are shown in table
      if(knumPresent(knum, true, "doMouseOutRow")) {
	 row.className = 'pointClickTableRow selected';
         setMarkerSrc(knum, srcSelected, "doMouseOutRow");
      } else {
         //console.log("doMouseOutRow %d",key);
         row.className = 'pointClickTableRow';
      }
   }; // doMouseOutTableRow

   //---------------------------------------------------------------
   // only left / middle mouse clicks reach here, right click is captured elsewhere.
   //---------------------------------------------------------------
   var doMouseUpTableRow = function (e) {

      var target;
      var mouseButtons;
      var modifierKeys;
      var row = undefined;
      var allRows = undefined;
      var children = undefined;
      var child = undefined;
      var gchild = undefined;
      var len;
      var klen;
      var i;
      var knum;
      var ref;
      var desc;
      var theTable;
      var prnt;
      var gprnt;
      var tKlass;
      var pKlass;
      var gKlass;
      var newKlass = 'pointClickTableRow';
      var markerNode;
      var x;
      var y;
      var newX;
      var newY;
      var tmpArr = [];
      var found = false;
      var iLast;
      var iThis;
      var iTmp;
      var indx0;
      var indx1;
      var back = false;
      var vizibl;
      var fnum;

      if(e.type === "click") {
	 target = emouseatlas.emap.utilities.getTarget(e);
         //console.log("target from click ",target);
      } else {
	 target = emouseatlas.emap.utilities.getTarget(e);
         //console.log("target from mouseup ",target);
      }

      vizibl = true;
      fnum = undefined;

      prnt = target.parentNode;
      gprnt = prnt.parentNode;
      tKlass = target.className;
      pKlass = prnt.className;
      gKlass = gprnt.className;

      if(target.hasClass('pointClickTableRow')) {
         row = target;
      } else if(prnt.hasClass('pointClickTableRow')) {
         row = prnt;
      } else if(gprnt.hasClass('pointClickTableRow')) {
         row = gprnt;
      }

      SHOW_ALL_MARKERS = false;

      children = row.childNodes;
      len = children.length;
      for(i=0; i<len; i++) {
         child = children[i];
         gchild = child.firstChild;
         //if(_debug) console.log("grandchild ", gchild.get('text'), gchild.className);
         if(gchild.className === "pointClickEntryId") {
            knum = gchild.get('text');
         }
         if(gchild.className === "pointClickEntryRef") {
            ref = gchild.get('text');
         }
         if(gchild.className === "pointClickEntryDesc") {
            desc = gchild.get('text');
         }
      }
      //if(_debug) console.log("knum %s, ref %s, desc %s", knum,ref,desc);

      if(latestSelectedRow === undefined) {
         //console.log("doMouseUpTableRow: selected row %s, previously selectedRows ",knum,selectedRowKnums);
      } else {
         //console.log("doMouseUpTableRow: lastSelected row %s, selected row %s, previously selectedRows ",latestSelectedRow,knum,selectedRowKnums);
      }

      mouseButtons = utils.whichMouseButtons(e);
      //console.log("mouse up: mouse Buttons ", mouseButtons);
      modifierKeys = utils.whichModifierKeys(e);
      //console.log("modifier knums ", modifierKeys);
      NO_MODIFIERS = (!modifierKeys.shift && !modifierKeys.ctrl && !modifierKeys.alt && !modifierKeys.meta) ? true : false;

      len = selectedRowKnums.length;
      //console.log("selectedRowKnums ",selectedRowKnums);

      latestClickedRow = knum;

      //................................................................
      // If the R mouse button was used:
      //................................................................
      if(mouseButtons.right) {
	 //................................................................
	 // and there were previously selected rows, and this isn't one of them,
	 // select this one and de-select the rest.
	 //................................................................
	 if(len > 0) {
	    if(utils.arrayContains(selectedRowKnums, knum)) {
	       // use all context selected terms
               //console.log(selectedRowKnums);
	       return true;
	    } else {
	       // use only the newly selected term
	       doHideAllMarkers(null);
	       row.className = "pointClickTableRow selected";
	       setMarkerSrc(knum, srcSelected, "doMouseUpTableRow");
	       displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	       // add the knum for this marker to the list of selected markers
	       selectedRowKnums[selectedRowKnums.length] = knum;
	       tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	       selectedRowKnums = utils.duplicateArray(tmpArr);
	       previousSelectedRow = latestSelectedRow;
	       latestSelectedRow = knum;
	       listSelectedTerms("mouseUpTableRow, others selected, no modifiers");
	       clearContextHighlight("mouseUpTableRow, others selected, no modifiers");
	       return true;
	    }
	 }
      } // it was R mouse button

      //................................................................
      // If there are no previously selected rows, select it.
      if(len === 0) {
	 row.className = "pointClickTableRow selected";
	 setMarkerSrc(knum, srcSelected, "doMouseUpTableRow");
	 displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	 // add the knum for this marker to the list of selected markers
	 selectedRowKnums[selectedRowKnums.length] = knum;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	 selectedRowKnums = utils.duplicateArray(tmpArr);
	 previousSelectedRow = latestSelectedRow;
	 latestSelectedRow = knum;
	 listSelectedTerms("mouseUpTableRow, no others selected");
	 return false;
      }
      //................................................................
      // If this is the only previously selected row and there are no modifiers, de-select it.
      if(len === 1 && NO_MODIFIERS && latestSelectedRow === knum) {
	 doHideAllMarkers(null);
	 previousSelectedRow = latestSelectedRow;
	 latestSelectedRow = undefined;
	 listSelectedTerms("mouseUpTableRow, de-select only selected row");
	 return false;
      }
      //................................................................
      // If there are previously selected row(s) and no modifier is pressed ...
      // de-select everything then select the clicked row
      if(len > 0 && NO_MODIFIERS) {
	 doHideAllMarkers(null);
	 row.className = "pointClickTableRow selected";
	 setMarkerSrc(knum, srcSelected, "doMouseUpTableRow");
	 displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	 // add the knum for this marker to the list of selected markers
	 selectedRowKnums[selectedRowKnums.length] = knum;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	 selectedRowKnums = utils.duplicateArray(tmpArr);
	 previousSelectedRow = latestSelectedRow;
	 latestSelectedRow = knum;
	 listSelectedTerms("mouseUpTableRow, others selected, no modifiers");
	 return false;
      }
      //................................................................
      // If there are previously selected row(s) and ctrl is pressed ...
      // select if not selected, otherwise de-select
      if(len > 0 && modifierKeys.ctrl && !modifierKeys.shift) {
	 len = selectedRowKnums.length;
	 for(i=0; i<len; i++) {
	    // if the item is already selected, de-select it.
	    if(knum === selectedRowKnums[i]) {
	       found = true;
	       break;
	    }
	 }
	 if(!found) {
	    row.className = "pointClickTableRow selected";
	    setMarkerSrc(knum, srcSelected, "doMouseUpTableRow");
	    displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	    // add the knum for this marker to the list of selected markers
	    selectedRowKnums[selectedRowKnums.length] = knum;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	    selectedRowKnums = utils.duplicateArray(tmpArr);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = selectedRowKnums[selectedRowKnums.length - 1];
	 } else {
	    row.className = "pointClickTableRow";
	    // and hide the marker
	    //hideMarker(markerNode.knum, false);
	    vizibl = false;
	    displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	    removeKey(knum, true);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = knum;
	    listSelectedTerms("mouseUpTableRow, others selected, ctrl pressed");
	 }
	 listSelectedTerms("mouseUpTableRow, others selected, ctrl pressed");
	 return false;
      }
      //................................................................
      // If there are previously selected row(s) and shift is pressed ...
      // de-select everything then select everything from the last selected row
      if(len > 0 && modifierKeys.shift && !modifierKeys.ctrl) {
	 if(latestSelectedRow === undefined) {
	    row.className = "pointClickTableRow selected";
	    setMarkerSrc(knum, srcSelected, "doMouseUpTableRow");
	    displayMarker(knum, fnum, vizibl, "doMouseUpTableRow");
	    // add the knum for this marker to the list of selected markers
	    selectedRowKnums[selectedRowKnums.length] = knum;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	    selectedRowKnums = utils.duplicateArray(tmpArr);
	 } else {
	    back = false;
	    doHideAllMarkers(modifierKeys);
	    iLast = parseInt(latestSelectedRow);
	    iThis = parseInt(knum);
	    if(iThis < iLast) {
	       iTmp = iThis;
	       iThis = iLast;
	       iLast = iTmp;
	       back = true;
	    }
            theTable = row.parentNode;
            allRows = theTable.getElementsByTagName("tr");
            //console.log("theTable rows ",allRows);
	    len = iThis - iLast + Number(1);
	    for(i=0; i<len; i++) {
	       indx0 = Number(iLast) + Number(i) - Number(1);
	       indx1 = Number(iLast) + Number(i);
	       //console.log("iLast %d, iThis %d, len %d, i %d, indx %d",iLast,iThis,len,i,indx);
	       row = allRows[indx0];
	       row.className = "pointClickTableRow selected";
	       setMarkerSrc(indx1, srcSelected, "doMouseUpTableRow");
	       displayMarker(indx1, fnum, vizibl, "doMouseUpTableRow");
	       // add the knum for this marker to the list of selected markers
	       selectedRowKnums[selectedRowKnums.length] = indx1 + ""; // knums are strings
	    }
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
	    selectedRowKnums = utils.duplicateArray(tmpArr);
	 }
	 previousSelectedRow = latestSelectedRow;
	 klen = selectedRowKnums.length;
	 if(back) {
	    latestSelectedRow = selectedRowKnums[0];
	 } else {
	    latestSelectedRow = selectedRowKnums[klen-1];
	 }
	 listSelectedTerms("mouseUpTableRow, others selected, shift pressed");
	 return false;
      }

   }; // doMouseUpTableRow
   //---------------------------------------------------------------

   var doMouseDownTableRow = function (e) {


   }; // doMouseDownTableRow

   //---------------------------------------------------------------
   var deselectAllRows = function (from) {

      var rowArr;
      var len;
      var i;
      var newKlass;

      //console.log("deselectAllRows from %s",from);

      rowArr = $$('.pointClickTableRow.selected');
      len = rowArr.length;
      newKlass = 'pointClickTableRow';
      selectedRowKnums = [];

      for(i=0; i<len; i++) {
         rowArr[i].className = newKlass;
      }
   };

   //---------------------------------------------------------------
   var highlightRow = function (knum, klass) {

      var entryIdArr = $$('.pointClickEntryId');
      var entryId;
      var txt;
      var row;
      var len = entryIdArr.length;
      var i;
      var newKlass = 'pointClickTableRow ' + klass;

      for(i=0; i<len; i++) {
         entryId = entryIdArr[i];
	 txt = entryId.get('text');
	 if(txt == knum) {
	   row = entryId.parentNode.parentNode;
           row.className = newKlass;
	 }
      }
   };

   //---------------------------------------------------------------
   var clearRowHighlight = function () {

      var rowArr = $$('.pointClickTableRow');
      var len = rowArr.length;
      var i;
      var newKlass = 'pointClickTableRow';

      for(i=0; i<len; i++) {
         if(rowArr[i].hasClass('selected')) {
            rowArr[i].className = newKlass + ' selected';
	 } else {
            rowArr[i].className = newKlass;
	 }
      }
   };

   //---------------------------------------------------------------
   // Selected is when mouse is over the row and is clicked
   //---------------------------------------------------------------
   var getSelectedTableItem = function () {

      var rowArr = $$('.pointClickTableRow');
      var len = rowArr.length;
      var row;
      var i;
      var newKlass = 'pointClickTableRow';
      var found = false;
      var ret = undefined;
      var children;
      var child;
      var gchild;

      for(i=0; i<len; i++) {
         row = rowArr[i];
         if(row.hasClass('selected')) {
	    //if(_debug) console.log(row);
	    found = true;
	    break;
	 }
      }

      if(found) {
         ret = {img:currentImg};
         children = row.childNodes;
	 //if(_debug) console.log(children);
	 len = children.length;
	 for(i=0; i<len; i++) {
	    child = children[i];
	    gchild = child.firstChild;
	    //if(_debug) console.log(gchild);
	    if(gchild.className === "pointClickEntryId") {
	       ret.key = gchild.get('text');
	    }
	    if(gchild.className === "pointClickEntryRef") {
	       ret.ref = gchild.get('text');
	    }
	    if(gchild.className === "pointClickEntryDesc") {
	       ret.desc = gchild.get('text');
	    }
	 }
      }

      //if(_debug) console.log("returning ",ret);
      return ret;

   }; //getSelectedTableItem

   //---------------------------------------------------------------
   // Highlighted is when mouse is over the row but isn't clicked
   //---------------------------------------------------------------
   var getHighlightedTableItem = function () {

      var rowArr;
      var len;
      var row;
      var i;
      var newKlass;
      var found;
      var ret;
      var children;
      var child;
      var gchild;

      rowArr = $$('.pointClickTableRow');
      len = rowArr.length;
      newKlass = 'pointClickTableRow';
      found = false;
      ret = undefined;

      for(i=0; i<len; i++) {
         row = rowArr[i];
         if(row.hasClass('over')) {
	    //if(_debug) console.log(row);
	    found = true;
	    break;
	 }
      }

      if(found) {
         ret = {img_id:currentImg};
         children = row.childNodes;
	 //if(_debug) console.log(children);
	 len = children.length;
	 for(i=0; i<len; i++) {
	    child = children[i];
	    gchild = child.firstChild;
	    //if(_debug) console.log(gchild);
	    if(gchild.className === "pointClickEntryId") {
	       ret.knum = gchild.get('text');
	    }
	    if(gchild.className === "pointClickEntryRef") {
	       ret.ref = gchild.get('text');
	    }
	    if(gchild.className === "pointClickEntryDesc") {
	       ret.desc = gchild.get('text');
	    }
	 }
	 //if(_debug) console.log("returning ",ret);
      } else {
	 //if(_debug) console.log("no selected item");
      }

      return ret;

   }; //getHighlightedTableItem

   //---------------------------------------------------------------
   // Returns the row having the specified knum
   //---------------------------------------------------------------
   var getRowWithKnum = function (knum) {

      var rowArr = $$('.pointClickTableRow');
      var len = rowArr.length;
      var row;
      var i;
      var index;
      var rknum;
      var found = false;

      for(i=0; i<len; i++) {
         row = rowArr[i];
	 indx = row.id.lastIndexOf("_");
	 indx = indx + 1*1;
	 rknum = row.id.substring(indx);
         if(rknum == knum) { 
            //if(_debug) console.log("got row with key %s",rkey,row);
            break;
         }
      }

      return row;

   }; //getRowWithKnum

   //---------------------------------------------------------------
   var knumPresent = function (testKnum, markers, from) {

      var knums
      var knum;
      var len = selectedRowKnums.length;
      var i;

      knums = markers ? selectedRowKnums : closestMarkerNums;
      len = knums.length;

      //console.log("knumPresent from %s, testKey %s, markers %s",from,testKey,markers);

      if(testKnum === undefined) {
         return false;
      }

      for(i=0; i<len; i++) {
         knum = markers ? knums[i] : knums[i].knum;
	 if(knum == testKnum) {
	    return true;
	 }
      }
      return false;
   };

   //---------------------------------------------------------------
   // When changing section, preserves the selected table row keys.
   // A selected key may be present in multiple sub-plate images
   //---------------------------------------------------------------
   var saveSelectedRowKeys = function () {

      var keys;
      var len;
      var i;

      if(markerKeysForAllImages[currentImg] === undefined) {
         markerKeysForAllImages[currentImg] = [];
      }
      keys = markerKeysForAllImages[currentImg];
      len = selectedRowKnums.length;

      for(i=0; i<len; i++) {
         keys[keys.length] = selectedRowKnums[i];
      }

   };

   //---------------------------------------------------------------
   var removeKnum = function (testKnum, fromSelectedMarkers) {

      var ret = [];
      var knums
      var knum;
      var len = selectedRowKnums.length;
      var i;

      knums = fromSelectedMarkers ? selectedRowKnums : closestMarkerNums;
      len = knums.length;

      if(testKnum === undefined) {
         return false;
      }

      for(i=0; i<len; i++) {
         knum = fromSelectedMarkers ? knums[i] : knums[i].knum;
	 if(knum == testKnum) {
	    ret = knums.splice(i,1);
	 }
      }
      return ret;
   };

   //---------------------------------------------------------------
   var hideClosestMarkers = function () {

      var knum;
      var fnum;
      var vizibl;
      var len = closestMarkerNums.length;
      var i;

      vizibl = false;
      fnum = undefined;

      for(i=0; i<len; i++) {
         knum = closestMarkerNums[i].knum;
	 if(!knumPresent(knum, true, "hideClosestMarkers")) {
	    displayMarker(knum, fnum, vizibl, "hideClosestMarkers");
	 }
      }
   };

   //---------------------------------------------------------------
   var showClosestMarkers = function () {

      var knum;
      var fnum;
      var vizibl;
      var len;
      var i;

      vizibl = true;

      hideClosestMarkers();

      len = closestMarkerNums.length;
      for(i=0; i<len; i++) {
         knum = closestMarkerNums[i].knum;
         fnum = closestMarkerNums[i].fnum;
	 if(!knumPresent(knum, true, "showClosestMarkers")) {
	    setMarkerSrc(knum, srcClosest, "showClosestMarkers");
	    displayMarker(knum, fnum, vizibl, "showClosestMarkers");
	 }
      }
   };

   //---------------------------------------------------------------
   // Finds the true closest marker to given point
   //  We do this with integer arithmetic
   //---------------------------------------------------------------
   var findClosestMarkersToPoint = function (point) {
      
      var knum;
      var key;
      var locdets;
      var locArr;
      var locn;
      var ipx;
      var ipy;
      var imx;
      var imy;
      var diffX;
      var diffY;
      var dist;
      var tmpArr = [];
      var i;
      var j;
      var len;
      var len2;

      if(_debug) console.log("findClosestMarkersToPoint ",point);
      //if(_debug) console.log("scale ",scale);

      if(point === undefined) {
         return;
      }

      ipx = Math.round(point.x / scale);
      ipy = Math.round(point.y / scale);
      //console.log("ipx %d, ipy %d",ipx,ipy);

      len = currentImgKnums.length

      //if(_debug) console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         knum = currentImgKnums[i].knum;
	 key = getKeyForKnum(knum);
         locdets = locationDets[key];
	 if(locdets === undefined) {
	    continue;
	 }
         //console.log("locdets ",locdets);
	 len2 = locdets.locArr.length;
	 for(j=0; j<len2; j++) {
	    locn = locdets.locArr[j];
            //console.log("locn ",locn);
	    if(locn.x === "0" && locn.y === "0" && locn.z === "0") {
	       console.log("no location for %s",key);
	       continue;
	    }
	    imx = Math.round(parseInt(locn.x));
	    imy = Math.round(parseInt(locn.y));
            //console.log("imx %d, imy %d",imx,imy);

	    diffX = (imx - ipx);
	    diffY = (imy - ipy);
	    dist = Math.sqrt(diffX * diffX + diffY * diffY);
	    if(_debug) console.log("dist ",dist);
	    //console.log("dist ",dist);
	    dist = Math.round(dist);
	    //console.log("dist ",dist);
	    tmpArr[tmpArr.length] = {knum:knum, fnum:j, dist:dist};
	    //console.log("tmpArr ",tmpArr);
	 }
      }

      if(tmpArr.length <= 0) {
	 //console.log("no closest markers found");
         return false;
      }

      // sort the markers by closest
      tmpArr.sort(function(A,B) {
	       return(A.dist-B.dist);
            });
      for(i=0; i<maxCloseMarkersToShow; i++) {
	 if(tmpArr[i]) {
            closestMarkerNums[closestMarkerNums.length] = {knum:tmpArr[i].knum, fnum:tmpArr[i].fnum};
	 }
      }
      tmpArr = [];
      //console.log("closestMarkerNums ",closestMarkerNums);

   }; // findClosestMarkersToPoint

   //---------------------------------------------------------------
   // Utilty / debugging function
   //---------------------------------------------------------------
   var printIntegerMarkers = function (imarkerArr) {
      
      var i;
      var marker;
      var len = imarkerArr.length;

      if(imarkerArr === undefined || imarkerArr.length <= 0) {
        //if(_debug) console.log("there are no markers");
         return false;
      }

      // sort by x value in ascending order
      // utils.sortMarkers(imarkerArr, true, true);
      // sort by y value in ascending order
      utils.sortMarkers(imarkerArr, false, true);

      for (i=0; i<len; i++) {
         marker = imarkerArr[i];
	 if(_debug) console.log("marker %s: %d,%d",marker.key,marker.x,marker.y);
      }
   };

   //---------------------------------------------------------------
   var createElements = function (modelChanges) {

      var pointClickTableDiv;
      var pointClickTableContainer;
      var pointClickTable;
      var pointClickTableBody;
      var pointClickBottomBit;
      var pointClickButtonContainer;
      var klass;
      var pointClickShowAllButton;
      var pointClickHideAllButton;
      var pointClickChkbxContainer;
      var pointClickShowClosestDiv;
      var pointClickShowClosestChkbx;
      var pointClickShowClosestLabel;
      var pointClickShowTxtDiv;
      var pointClickShowTxtChkbx;
      var pointClickShowTxtLabel;
      var viewerDiv;
      //====================================
      //.................................................
      pointClickTableDiv = $('pointClickTableDiv');

      //----------------------------------------
      // container for the Table of entries
      //----------------------------------------
      pointClickTableContainer = new Element('div', {
         'id': 'pointClickTableContainer'
      });

      // put the pointClickTableContainer in the pointClickTableDiv
      pointClickTableContainer.inject(pointClickTableDiv, 'inside');

      //----------------------------------------
      // the table
      //----------------------------------------
      // creates a <table> element and a <tbody> element
      pointClickTable = new Element("table", {
         'id': 'pointClickTable',
	 'border': '2'
      });

      pointClickTableBody = new Element("tbody", {
         'id': 'pointClickTableBody'
      });

      // put the <tbody> in the <table>
      pointClickTableBody.inject(pointClickTable, 'inside');
      pointClickTable.inject(pointClickTableContainer, 'inside');

      //----------------------------------------
      // the bottom bit
      //----------------------------------------
      pointClickBottomBit

      pointClickBottomBit = new Element('div', {
         'id': 'pointClickBottomBit'
      });
      pointClickBottomBit.inject(pointClickTableDiv, 'inside');

      //----------------------------------------
      // the button container
      //----------------------------------------
      pointClickButtonContainer;
      klass = EDITOR ? 'supplementEditor' : '';

      pointClickButtonContainer = new Element('div', {
         'id': 'pointClickButtonContainer',
	 'class': klass
      });
      pointClickButtonContainer.inject(pointClickBottomBit, 'inside');

      //----------------------------------------
      // the buttons
      //----------------------------------------
      pointClickShowAllButton;

      pointClickShowAllButton = new Element('div', {
         'id': 'pointClickShowAllButton',
	 'class': 'pointClickEntryButton'
      });
      pointClickShowAllButtonText = new Element('div', {
         'id': 'pointClickShowAllButtonText',
	 'class': 'pointClickEntryButtonText'
      });
      pointClickShowAllButton.inject(pointClickButtonContainer, 'inside');
      pointClickShowAllButtonText.inject(pointClickShowAllButton, 'inside');
      pointClickShowAllButtonText.set('text', 'Show All');

      //.................
      pointClickHideAllButton;

      pointClickHideAllButton = new Element('div', {
         'id': 'pointClickHideAllButton',
	 'class': 'pointClickEntryButton'
      });
      pointClickHideAllButtonText = new Element('div', {
         'id': 'pointClickHideAllButtonText',
	 'class': 'pointClickEntryButtonText'
      });
      pointClickHideAllButton.inject(pointClickButtonContainer, 'inside');
      pointClickHideAllButtonText.inject(pointClickHideAllButton, 'inside');
      pointClickHideAllButtonText.set('text', 'Hide All');

      if(!EDITOR) {
	 //----------------------------------------
	 // the checkbox container
	 //----------------------------------------
	 pointClickChkbxContainer;
	 //klass = EDITOR ? 'editor' : '';

	 pointClickChkbxContainer = new Element('div', {
	    'id': 'pointClickChkbxContainer',
	    'class': klass
	 });
	 pointClickChkbxContainer.inject(pointClickBottomBit, 'inside');

	 //----------------------------------------
	 // the checkboxes
	 //----------------------------------------
	 pointClickShowClosestDiv;
	 pointClickShowClosestChkbx;
	 pointClickShowClosestLabel;

	 pointClickShowClosestDiv = new Element('div', {
	    'id': 'pointClickShowClosestDiv',
	    'class': 'pointClickShowClosestDiv'
	 });
	 pointClickShowClosestLabel = new Element('label', {
	    'id': 'pointClickShowClosestLabel',
	    'name': 'pointClickShowClosestChkbx',
	    'class': 'pointClickShowClosestLabel'
	 });
	 pointClickShowClosestChkbx = new Element('input', {
	    'id': 'pointClickShowClosestChkbx',
	    'name': 'pointClickShowClosestChkbx',
	    'class': 'pointClickShowClosestChkbx',
	    'type': 'checkbox',
	    'checked': true
	 });
         pointClickShowClosestDiv.inject(pointClickChkbxContainer, 'inside');
	 pointClickShowClosestChkbx.inject(pointClickShowClosestDiv, 'inside');
	 pointClickShowClosestLabel.inject(pointClickShowClosestDiv, 'inside');
	 pointClickShowClosestLabel.set('text', 'closest markers');

	 pointClickShowTxtDiv;
	 pointClickShowTxtChkbx;
	 pointClickShowTxtLabel;

	 pointClickShowTxtDiv = new Element('div', {
	    'id': 'pointClickShowTxtDiv',
	    'class': 'pointClickShowTxtDiv'
	 });
	 pointClickShowTxtLabel = new Element('label', {
	    'id': 'pointClickShowTxtLabel',
	    'name': 'pointClickShowTxtChkbx',
	    'class': 'pointClickShowTxtLabel'
	 });
	 pointClickShowTxtChkbx = new Element('input', {
	    'id': 'pointClickShowTxtChkbx',
	    'name': 'pointClickShowTxtChkbx',
	    'class': 'pointClickShowTxtChkbx',
	    'type': 'checkbox',
	    'checked': true
	 });
	 pointClickShowTxtDiv.inject(pointClickChkbxContainer, 'inside');
	 pointClickShowTxtChkbx.inject(pointClickShowTxtDiv, 'inside');
	 pointClickShowTxtLabel.inject(pointClickShowTxtDiv, 'inside');
	 pointClickShowTxtLabel.set('text', 'marker numbers');
      }

      if(EDITOR) {
	 viewerDiv = $("emapIIPViewerDiv");
         viewerDiv.set('class', 'pointClick editor');
         pointClickTableDiv.set('class', 'editor');
         pointClickTableContainer.set('class', 'supplementEditor');
         pointClickBottomBit.set('class', 'supplementEditor');
      /*
         pointClickShowTxtDiv.set('class', 'editor');

	 //----------------------------------------
	 // the editor button container
	 //----------------------------------------
	 var pointClickEditorButtonContainer;

	 pointClickEditorButtonContainer = new Element('div', {
	    'id': 'pointClickEditorButtonContainer',
	    'class': 'editor'
	 });
	 pointClickEditorButtonContainer.inject(pointClickBottomBit, 'inside');

	 //.................
	 var pointClickSaveEditedButton;

	 pointClickSaveEditedButton = new Element('div', {
	    'id': 'pointClickSaveEditedButton',
	    'class': 'pointClickEditorButton'
	 });
	 pointClickSaveEditedButtonText = new Element('div', {
	    'id': 'pointClickSaveEditedButtonText',
	    'class': 'pointClickEditorButtonText'
	 });
	 pointClickSaveEditedButton.inject(pointClickEditorButtonContainer, 'inside');
	 pointClickSaveEditedButtonText.inject(pointClickSaveEditedButton, 'inside');
	 pointClickSaveEditedButtonText.set('text', 'Save Edited Markers');

	 //.................
	 var pointClickCancelEditButton;

	 pointClickCancelEditButton = new Element('div', {
	    'id': 'pointClickCancelEditButton',
	    'class': 'pointClickEditorButton'
	 });
	 pointClickCancelEditButtonText = new Element('div', {
	    'id': 'pointClickCancelEditButtonText',
	    'class': 'pointClickEditorButtonText'
	 });
	 pointClickCancelEditButton.inject(pointClickEditorButtonContainer, 'inside');
	 pointClickCancelEditButtonText.inject(pointClickCancelEditButton, 'inside');
	 pointClickCancelEditButtonText.set('text', 'Cancel Marker Edit');

	 //.................
         utils.addButtonStyle('pointClickSaveEditedButton');
         utils.addButtonStyle('pointClickCancelEditButton');

	 pointClickEditorButtonContainer.inject(pointClickBottomBit, 'inside');

         utils.addEvent(pointClickSaveEditedButton, 'mouseup', doSaveEditedMarkers, false);
         utils.addEvent(pointClickCancelEditButton, 'mouseup', doCancelEditMarkers, false);
      */

      } // EDITOR

      //----------------------------------------
      // add button style
      //----------------------------------------
      emouseatlas.emap.utilities.addButtonStyle('pointClickShowAllButton');
      emouseatlas.emap.utilities.addButtonStyle('pointClickHideAllButton');

      //----------------------------------------
      // add event handlers
      //----------------------------------------
      utils.addEvent(pointClickShowAllButton, 'mouseup', showAllMarkers, false);
      utils.addEvent(pointClickHideAllButton, 'mouseup', doHideAll, false);
      if(!EDITOR) {
         utils.addEvent(pointClickShowClosestChkbx, 'mouseup', doAllowClosestMarkers, false);
      }
      utils.addEvent(pointClickShowTxtChkbx, 'mouseup', doShowMarkerText, false);

      //..................................

   }; // createElements
   
   //---------------------------------------------------------------
   var setCurrentImgKnums = function () {

      var key;
      var knum;
      var name;
      var len;
      var i;

      //console.log("setCurrentImgKnums");
      currentImgKnums = [];

      len = supplementTerms.length;
      //console.log("setCurrentImgKnums, supplementTerms.length %d", len);
      for(i=0; i<len; i++) {
         knum = supplementTerms[i].knum;
	 key = currentImg + "_" + knum;
	 //console.log("setCurrentImgKnums key ",key);
	 locDets = locationDets[key];
	 if(locDets === undefined) {
	    continue;
	 } else {
	    //console.log("setCurrentImgKnums locDets ",locDets);
	    currentImgKnums[currentImgKnums.length] = {knum:knum, total:locDets.fnumArr.length};
	 }

      }

      //console.log("setCurrentImgKnums ",currentImgKnums);
   };
   
   //---------------------------------------------------------------
   var updateCurrentImgKnums = function (addingLoc) {

      var iknum;
      var len;
      var i;

      //console.log("updateCurrentImgKnums with %s",editedMarkerKnum);
      if(containsKnum(currentImgKnums, editedMarkerKnum)) {
	 //console.log("need to adjust total");
	 len = currentImgKnums.length;
	 for(i=0; i<len; i++) {
	    iknum = currentImgKnums[i];
	    if(iknum.knum === editedMarkerKnum) {
               if(addingLoc) {
	          iknum.total = iknum.total + 1*1;
	       } else {
	          iknum.total = iknum.total - 1*1;
	       }
	       currentImgKnums[i].total = iknum.total;
	    }
	    if(iknum.total < 0) {
	       currentImgKnums.splice(i,1);
	    }
	    break;
	 }
      }

      //console.log("updateCurrentImgKnums ",currentImgKnums);
   };
   
   //---------------------------------------------------------------
   var getKdeskForKnum = function (knum) {

      var kdesk;
      var len;
      var i;

      len = supplementTerms.length;
      for(i=0; i<len; i++) {
         if(supplementTerms[i].knum === knum) {
	    kdesk = supplementTerms[i].names;
	    break;
	 }
      }

      //console.log("getKdeskForKnum ",kdesk);
      return kdesk;
   };
   
   //---------------------------------------------------------------
   var doAllowClosestMarkers = function (e) {

      var chkbx = $('pointClickShowClosestChkbx');
      var wasChecked = chkbx.checked;
      //if(_debug) console.log("doAllowClosestMarkers wasChecked %s",wasChecked);

      if(wasChecked) {
         ALLOW_CLOSEST_MARKERS = false;
	 hideClosestMarkers(false);
	 closestMarkerNums = [];
      } else {
         ALLOW_CLOSEST_MARKERS = true;
      }
   };

   
   //---------------------------------------------------------------
   // Show marker text
   //---------------------------------------------------------------
   var doShowMarkerText = function (e) {

      var chkbx = $('pointClickShowTxtChkbx');
      var wasChecked = chkbx.checked;

      //console.log("doShowMarkerText chkbx was checked %s",wasChecked);

      if(wasChecked) {
         SHOW_MARKER_TXT = false;
      } else {
         SHOW_MARKER_TXT = true;
      }

      showSelectedMarkers("updatePlateDataCallback");
   };
   
   //---------------------------------------------------------------
   // Show selected markers (without labels)
   //---------------------------------------------------------------
   var showSelectedMarkers = function (from) {

      var knum;
      var fnum;
      var vizibl;
      var row;
      var len;
      var i;

      vizibl = true;
      fnum = undefined;

      //console.log("showSelectedMarkers on img %s, ",currentImg, selectedRowKnums, currentImgKnums, from);

      len = selectedRowKnums.length;
      for(i=0; i<len; i++) {
         knum = selectedRowKnums[i];
	 // only display markers on the current image
	 if(containsKnum(currentImgKnums, knum)) {
	    displayMarker(knum, fnum, !vizibl, "showSelectedMarkers");
	    setMarkerSrc(knum, srcSelected, "showSelectedMarkers");
	    displayMarker(knum, fnum, vizibl, "showSelectedMarkers");
            highlightRow(knum, 'selected');
	 }
      }
   };
   
   //---------------------------------------------------------------
   // Show all markers (without labels)
   //---------------------------------------------------------------
   var showAllMarkers = function () {

      var len;
      var i;

      if(_debug) console.log("enter showAllMarkers");

      selectedRowKnums = [];
      closestMarkerNums = [];

      len = currentImgKnums.length;

      for(i=0; i<len; i++) {
         selectedRowKnums[selectedRowKnums.length] = currentImgKnums[i].knum;
      }
      //console.log("showAllMarkers: currentImgKnums.length %d",currentImgKnums.length);
      if(currentImgKnums.length === 0) {
         return false;
      }
      latestSelectedRow = currentImgKnums[currentImgKnums.length - 1].knum;

      SHOW_ALL_MARKERS = true;
      showSelectedMarkers("showAllMarkers");

      if(_debug) console.log("exit showAllMarkers");

   }; // showAllMarkers
   
   //---------------------------------------------------------------
   // Show URL specified markers (without labels)
   //---------------------------------------------------------------
   var showUrlSpecifiedMarkers = function () {

      var urlSpecified;
      var compArr = undefined;
      var len;
      var i;

      if(_debug) console.log("enter showUrlSpecifiedMarkers");

      selectedRowKnums = [];

      urlSpecified = model.getUrlSpecifiedParams();
      //console.log("showUrlSpecifiedMarkers urlSpecified ",urlSpecified);

      if(urlSpecified.comps !== undefined) {
         compArr = urlSpecified.comps.split(",");
	 if(compArr === undefined || compArr === null || compArr[0] === "") {
	    //console.log("showUrlSpecifiedMarkers none to show");
	    return false;
	 }
	 //console.log("compArr ",compArr);
	 len = compArr.length;
	 for(i=0; i<len; i++) {
	    //selectedRowKnums[selectedRowKnums.length] = parseInt(compArr[i]);
	    selectedRowKnums[selectedRowKnums.length] = compArr[i];
	 }
	 latestSelectedRow = selectedRowKnums[selectedRowKnums.length -1];
         previousSelectedRow = latestSelectedRow;

	 //console.log("selectedRowKnums ",selectedRowKnums);
	 showSelectedMarkers("showUrlSpecifiedMarkers");
      }

   }; // showUrlSpecifiedMarkers
   
   //---------------------------------------------------------------
   // Show edited marker
   //---------------------------------------------------------------
   var showEditedMarker = function () {

      if(_debug) console.log("enter showEditedMarker");

      selectedRowKnums = [];

      selectedRowKnums[0] = editedMarkerKnum;
      latestSelectedRow = editedMarkerKnum;
      previousSelectedRow = latestSelectedRow;

      editedMarkerKnum = undefined;

      showSelectedMarkers("showUrlSpecifiedMarkers");

   }; // showEditedMarker
   
   //---------------------------------------------------------------
   // Re-position all markers after a scale change
   //---------------------------------------------------------------
   var updateMarkerPositions = function () {

      var knum;
      var fnum;
      var vizibl;
      var len;
      var i;

      vizibl = true;
      fnum = undefined;

      len = selectedRowKnums.length;
      for (i=0; i<len; i++) {
         knum = selectedRowKnums[i];
	 displayMarker(knum, fnum, false, "updateMarkerPositions");
	 displayMarker(knum, fnum, vizibl, "updateMarkerPositions");
      }

      len = closestMarkerNums.length;
      for (i=0; i<len; i++) {
         knum = closestMarkerNums[i].knum;
	 fnum = closestMarkerNums[i].fnum;
	 displayMarker(knum, fnum, false, "updateMarkerPositions");
	 displayMarker(knum, fnum, vizibl, "updateMarkerPositions");
      }
   };
   
   //---------------------------------------------------------------
   // There may be multiple markers asociated with each img_id_knum
   // if fnum is 'undefined' then all available markers are assumed.
   //---------------------------------------------------------------
   var displayMarker = function (knum, fnum, vizibl, from) {

      var ALL;
      var key;
      var markerdets;
      var locdets;
      var img_id;
      var knum;
      var flags;
      var flag;
      var markerTxt;
      var markerTxtWidth;
      var txtOfs;
      var x,y;
      var newX,newY;
      var len;
      var i;

      if(knum === undefined || knum === null || knum === "") {
         return false;
      }
      if(_debug) console.log("displayMarker knum %s, currentImg",knum,currentImg);

      ALL = (fnum === undefined) ? true : false;

      //console.log("displayMarker from %s:  knum %s, fnum %s, currentImg %s",from,knum,fnum,currentImg);
      //console.log("displayMarker %s from %s", vizibl, from);
      //console.log("displayMarker knum %s, currentImg",knum,currentImg);
      //console.log(knum);

      key = getKeyForKnum(knum);

      markerdets = markerDets[key];
      //console.log(markerdets);

      //console.log(locationDets);
      locdets = locationDets[key];
      if(locdets === undefined || locdets === null) {
         if(_debug) console.log("displayMarker no locdets for %s",key);
         return false;
      }
      //console.log("displayMarker: locdets for %s",key,locdets);

      len = locdets.locArr.length;
      for(i=0; i<len; i++) {
         if(ALL || i===fnum) {
            //console.log("displayMarker from %s:  knum %s, i %s, currentImg %s",from,knum,i,currentImg);
            //console.log('markerTxtDiv_' + currentImg + "_" + knum + "_" + i);
	    markerTxt = $('markerTxtDiv_' + currentImg + "_" + knum + "_" + i);
	    markerTxtWidth = getStringPixelWidth(markerTxt.id);
	    //console.log("%s markerTxtWidth ",knum,markerTxtWidth);
	    txtOfs = {};
	    txtOfs.x = 10 - (markerTxtWidth / 2);
	    txtOfs.y = 5;
	    //console.log("%s txtOfs ",knum,txtOfs);
	    if(vizibl) {
	       x = locdets.locArr[i].x;
	       y = locdets.locArr[i].y;
	       newX = x * scale + imgOfs.x;
	       newY = y * scale + imgOfs.y;
	       markerdets.flags[i].setStyles({
		  'visibility': 'visible',
		  'left': newX + 'px',
		  'top': newY + 'px'
	       });
	       if(SHOW_MARKER_TXT) {
	          //console.log("markerTxt.id  %s",markerTxt.id);
		  markerTxt.setStyles({
		     'visibility': 'visible',
		     'left': txtOfs.x + 'px',
		     'top':  txtOfs.y + 'px'
		  });
	       } else {
		  markerTxt.setStyles({
		     'visibility': 'hidden'
		  });
	       }
	    } else {
	       markerdets.flags[i].setStyles({
		  'visibility': 'hidden',
	       });
	       markerTxt.setStyles({
		  'visibility': 'hidden',
	       });
	    }
	 }
      }
   }; // displayMarker
   
   //---------------------------------------------------------------
   var displayMarkerLabel = function (knum, vizibl, from) {

      var markerdets;
      var locdets;
      var img_id;
      var key;
      var x,y;
      var newX,newY;
      var len;
      var i;

      if(knum === undefined || knum === null || knum === "") {
         return false;
      }
      if(_debug) console.log("displayMarkerLabel knum %s, currentImg",knum,currentImg);

      //console.log("displayMarkerLabel %s from %s", vizibl, from);
      //console.log(knum);

      key = currentImg + "_" + knum;

      markerdets = markerDets[key];
      //console.log(markerdets);

      //console.log(locationDets);
      locdets = locationDets[key];
      if(locdets === undefined || locdets === null) {
         return false;
      }
      //console.log(locdets);

      len = locdets.locArr.length;
      for(i=0; i<len; i++) {
         if(vizibl) {
	    x = locdets.locArr[i].x;
	    y = locdets.locArr[i].y;
	    newX = x * scale + imgOfs.x + labelOfs.x;
	    newY = y * scale + imgOfs.y + labelOfs.y;
	    markerdets.labels[i].setStyles({
	       'visibility': 'visible',
	       'left': newX + 'px',
	       'top': newY + 'px'
	    });
	 } else {
	    markerdets.labels[i].setStyles({
	       'visibility': 'hidden',
	    });
	 }
      }
   };

   //---------------------------------------------------------------
   var displayMarkerPopup = function (knum, vizibl, from) {

      var markerdets;
      var locdets;
      var img_id;
      var key;
      var x,y;
      var newX,newY;
      var len;
      var i;

      //console.log("displayMarkerPopup knum %s, vizibl %s, from %s",knum, vizibl, from);

      if(knum === undefined || knum === null || knum === "") {
         return false;
      }
      if(_debug) console.log("displayMarkerPopup knum %s, currentImg",knum,currentImg);

      key = currentImg + "_" + knum;

      //console.log(locationDets);
      locdets = locationDets[key];
      if(locdets === undefined || locdets === null) {
         return false;
      }
      //console.log(locdets);

      len = locdets.locArr.length;
      for(i=0; i<len; i++) {
         if(vizibl) {
	    view.showMarkerPopupIFrame(knum);
	    setMarkerPopupIFrameContent(knum)
	 } else {
	    view.hideMarkerPopupIFrame(knum);
	 }
      }
   };
   
   //---------------------------------------------------------------
   var getKeyForKnum = function (knum) {
      return currentImg + "_" + knum;
   };

   //===========================================================================================================
   
   //---------------------------------------------------------------
   var getMarkerLabelPos = function (e, key, label) {

      var markerNode;
      var OK;
      var labelWStr;
      var labelHStr;
      var labelW;
      var labelH;
      var docX;
      var docY;
      var mousePosInImg;


      docX = emouseatlas.emap.utilities.getMouseX(e);
      docY = emouseatlas.emap.utilities.getMouseY(e);

      //console.log("docX %f, docY %f",docX,docY);

      mousePosInImg = view.getMousePositionInImage({x:docX, y:docY});

      OK = smallLabelOKToDisplay(e, key, mousePosInImg, label);

      labelWStr = window.getComputedStyle(label, null).getPropertyValue("width");
      indx = labelWStr.indexOf("px");
      labelW = Number(labelWStr.substring(0,indx));

      labelHStr = window.getComputedStyle(label, null).getPropertyValue("height");
      indx = labelHStr.indexOf("px");
      labelH = Number(labelHStr.substring(0,indx));

      if(OK.right) {
         labelX = parseInt(mousePosInImg.x + labelOfs.x);
      } else {
         labelX = parseInt(mousePosInImg.x - (labelW + labelOfs.x));
      }

      if(OK.top && OK.bottom) {
         labelY = parseInt(mousePosInImg.y + labelOfs.y);
      }

      if(!OK.top) {
         labelY = parseInt(mousePosInImg.y);
      }

      if(!OK.bottom) {
         labelY = parseInt(mousePosInImg.y - labelH);
      }

      return {x:labelX, y:labelY};

   }; // getMarkerLabelPos

   //---------------------------------------------------------------
   var getLargeMarkerLabelPos = function (e, key, label) {

      var markerNode;
      var OK;
      var labelWStr;
      var labelHStr;
      var labelW;
      var labelH;
      var docX;
      var docY;
      //var mousePosInImg;


      docX = emouseatlas.emap.utilities.getMouseX(e);
      docY = emouseatlas.emap.utilities.getMouseY(e);

      //console.log("docX %f, docY %f",docX,docY);

      mousePos = {x:docX, y:docY};

      OK = largeLabelOKToDisplay(e, key, mousePos, label);
      //console.log("OK ",OK);

      labelWStr = window.getComputedStyle(label, null).getPropertyValue("width");
      indx = labelWStr.indexOf("px");
      labelW = Number(labelWStr.substring(0,indx));

      labelHStr = window.getComputedStyle(label, null).getPropertyValue("height");
      indx = labelHStr.indexOf("px");
      labelH = Number(labelHStr.substring(0,indx));

      //console.log("labelW %f, labelH %f",labelW,labelH);

      if(OK.right) {
         labelX = parseInt(mousePos.x + labelOfs.x);
      } else {
         labelX = parseInt(mousePos.x - (labelW + labelOfs.x));
      }

      if(OK.top && OK.bottom) {
         labelY = parseInt(mousePos.y + labelOfs.y);
      }

      if(!OK.top) {
         labelY = parseInt(mousePos.y);
      }

      if(!OK.bottom) {
         labelY = parseInt(mousePos.y - labelH);
      }

      return {x:labelX, y:labelY};

   }; // getLargeMarkerLabelPos

   //---------------------------------------------------------------
   var getWikiUrl = function (knum) {

      var url;
      var annot;
      var found = false;
      var len;
      var i;

      annot = getAnnotationForKnum(knum);
      wikiArr = annot.wiki;

      return wikiArr[0];
   };

   //---------------------------------------------------------------
   var setMarkerPopupIFrameContent = function (knum) {

      var key;
      var annot;

      annot = getAnnotationForKnum(knum);

      emouseatlas.emap.markerPopup.showIFrame(true);
      emouseatlas.emap.markerPopup.updateTableContent(annot, titleInfo);
      emouseatlas.emap.markerPopup.generateMarkerPopupPage();

   };

   //---------------------------------------------------------------
   var getTitleInfoForPlate = function (plate) {

      var info;
      var subplate;
      var iplate;
      var found = false;
      var len;
      var i;

      len = titleInfo.length;
      for (i=0; i<len; i++) {
        info = titleInfo[i]; 
	subplate = info.plate;
	iplate = parseInt(subplate);
	if(iplate == plate) {
	   found = true;
	   break;
        }
      }

      if(!found) {
         return false;
      }

      return info;
   };

   //---------------------------------------------------------------
   // Handler fo hideAll button
   //---------------------------------------------------------------
   var doHideAll = function (e) {
      doHideAllMarkers(undefined);
   };

   //---------------------------------------------------------------
   var doHideAllMarkers = function (modifiers) {
      hideAllMarkers();
      deselectAllRows("doHideAllMarkers");
      selectedRowKnums = [];
      previousSelectedRow = latestSelectedRow;
      if(modifiers) {
         if(!modifiers.shift) {
            latestSelectedRow = undefined;
	 }
      } else {
         latestSelectedRow = undefined;
      }
      listSelectedTerms("doHideAllMarkers");
   };
   
   //---------------------------------------------------------------
   var hideAllMarkers = function () {
   //---------------------------------------------------------------
      var knum;
      var fnum;
      var locations;
      var locn;
      var toBeRemoved = [];
      var vizibl;
      var len;
      var i;
      var j;

      hideClosestMarkers(true);
      closestMarkerNums = [];

      vizibl = false;
      fnum = undefined;

      len = selectedRowKnums.length;
      //if(_debug) console.log("hideAllMarkers selectedRowKnums ",selectedRowKnums);

      //if(_debug) console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         knum = selectedRowKnums[i];
	 //key = currentImg + "_" + knum;
	 displayMarker(knum, fnum, vizibl, "hideAllMarkers");
      }
   };

   //---------------------------------------------------------------
/*
   var hideMarkerTxt = function (key) {

      var markerNode;
      var markerTxt;
      var locations;
      var subplate;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      for(i=0; i<len; i++) {
         markerTxt = $('markerTxtDiv_' + key + '_' + i);
         markerTxt.setStyles({
         'visibility': 'hidden'
      });
      }
   };
*/
   
   //----------------------------------------------------------
   // Calculates the distance between 2 points on the image
   //----------------------------------------------------------
   var getDistance = function(pntFrom, pntTo) {
      return Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
   };
   
   //-----------------------------------------------------------------------
   // Calculate if label is too close to R/T/B edgeto be displayed properly
   //-----------------------------------------------------------------------
   var smallLabelOKToDisplay = function(e, key, mousePosInImg, label) {

      var ret;
      var labelWStr;
      var labelW;
      var labelHStr;
      var labelH;
      var mousePosWrtVpLeftEdge;
      var mouseDistToVpRightEdge;
      var mouseDistToVpTopEdge;
      var labelPosn;
      var vpLeftEdge;
      var vpTopEdge;
      var vpDims;
      var vpRightwrtImgL;
      var labelX;
      var labelY;

      if(key === undefined || key === null) {
         return false;
      }

      ret = {right:true, top:true, bottom:true};

      vpLeftEdge = view.getViewportLeftEdge();
      vpTopEdge = view.getViewportTopEdge();

      vpDims = view.getViewportDims();

      vpRightwrtImgL = vpLeftEdge + vpDims.width;

      mouseDistToVpRightEdge = parseInt(vpRightwrtImgL - mousePosInImg.x);
      mouseDistToVpTopEdge = parseInt(mousePosInImg.y - vpTopEdge );
      mouseDistToVpBottomEdge = parseInt(vpDims.height - mouseDistToVpTopEdge);

      labelWStr = window.getComputedStyle(label, null).getPropertyValue("width");
      indx = labelWStr.indexOf("px");
      labelW = Number(labelWStr.substring(0,indx));

      labelHStr = window.getComputedStyle(label, null).getPropertyValue("height");
      indx = labelHStr.indexOf("px");
      labelH = Number(labelHStr.substring(0,indx));

      if((mouseDistToVpRightEdge - labelW - labelOfs.x) < 0 ) {
         ret.right = false;
      }

      //if((mouseDistToVpTopEdge - labelH - labelOfs.y) < 0 ) {
      if((mouseDistToVpTopEdge - labelH) < 0 ) {
         ret.top = false;
      }

      if((mouseDistToVpBottomEdge - labelH + labelOfs.y) < 0 ) {
         ret.bottom = false;
      }

      return ret;

   }; // smallLabelOKToDisplay
   
   //-----------------------------------------------------------------------
   // Calculate if label is too close to R/T/B edgeto be displayed properly
   //-----------------------------------------------------------------------
   var largeLabelOKToDisplay = function(e, key, mousePos, label) {

      var ret;
      var labelWStr;
      var labelW;
      var labelHStr;
      var labelH;
      var mousePosWrtVpLeftEdge;
      var mouseDistToVpRightEdge;
      var mouseDistToVpTopEdge;
      var labelPosn;
      var vpLeftEdge;
      var vpTopEdge;
      var vpDims;
      var vpRightwrtImgL;
      var labelX;
      var labelY;

      if(key === undefined || key === null) {
         return false;
      }

      ret = {right:true, top:true, bottom:true};

      vpLeftEdge = view.getViewportLeftEdge();
      vpTopEdge = view.getViewportTopEdge();

      vpDims = view.getViewportDims();

      vpRightwrtImgL = vpLeftEdge + vpDims.width;

      mouseDistToVpRightEdge = parseInt(vpRightwrtImgL - mousePos.x);
      mouseDistToVpTopEdge = parseInt(mousePos.y - vpTopEdge );
      mouseDistToVpBottomEdge = parseInt(vpDims.height - mouseDistToVpTopEdge);

      labelWStr = window.getComputedStyle(label, null).getPropertyValue("width");
      indx = labelWStr.indexOf("px");
      labelW = Number(labelWStr.substring(0,indx));

      labelHStr = window.getComputedStyle(label, null).getPropertyValue("height");
      indx = labelHStr.indexOf("px");
      labelH = Number(labelHStr.substring(0,indx));

      if((mouseDistToVpRightEdge - labelW - labelOfs.x) < 0 ) {
         ret.right = false;
      }

      //if((mouseDistToVpTopEdge - labelH - labelOfs.y) < 0 ) {
      if((mouseDistToVpTopEdge - labelH) < 0 ) {
         ret.top = false;
      }

      if((mouseDistToVpBottomEdge - labelH + labelOfs.y) < 0 ) {
         ret.bottom = false;
      }

      return ret;

   }; // largeLabelOKToDisplay

   //---------------------------------------------------------------
   var modelUpdate = function (modelChanges) {

      var dst;
      var keys


      if(modelChanges.dst === true) {
         //console.log("supplementPointClick.modelUpdate modelChanges.dst %s",modelChanges.dst);

	 // this needs to be done before the currentImg changes
         hideAllMarkers();

         dst = model.getDistance();   
         //console.log("supplementPointClick.modelUpdate dst ",dst);
	 previousImg = currentImg;
         currentImg = pointClickImgData.subplate + pointClickImgData.sectionMap[dst.cur].label;
         setCurrentImgKnums();
	 //if(_debug) console.log(currentImg);

	 if(PLATE_DATA) {
	    if(SHOW_ALL_MARKERS) {
               deselectAllRows("modelUpdate.modelChanges.dst");
               selectedRowKnums = [];
	       showAllMarkers();
	    } else {
	       showSelectedMarkers("modelUpdate");
	    }
	    doDistChanged();
	 }
         /*
         doDistChanged("modelUpdate dst");
         if(INITIALISED) {
	    //updatePlateData();
	 }
	 */
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function (viewChanges) {

      var urlSpecified;
      var dst;
      var initialDst;
      var imgData;
      var len;
      var i;

      //if(_debug) console.log("viewUpdate");
      if(viewChanges.initial === true) {
	 //window.setVisible(false);
         dst = model.getDistance();   
	 imgData = model.getPointClickImgData();
	 urlSpecified = model.getUrlSpecifiedParams();

	 if(urlSpecified.image !== undefined) {
	    initialDst = getDstForImage(urlSpecified.image, imgData.sectionMap);
	    model.setDistance(initialDst);
	 } else {
            currentImg = pointClickImgData.subplate + pointClickImgData.sectionMap[dst.cur].label;
	    previousImg = currentImg;
	 }

	 //updateMarkerPositions();
	 return;
      }

      //...................................
      if(viewChanges.scale) {
         scale = view.getScale().cur;
	 if(PLATE_DATA) {
	    updateMarkerPositions();
	 }
      }

      //...................................
      if(viewChanges.pointClick) {
         //console.log("pointClick: viewChanges.pointClick %s",viewChanges.pointClick);
         if(!ALLOW_CLOSEST_MARKERS || !allowClosestMarkers) return false;
         //if(!ALLOW_CLOSEST_MARKERS) return false;
	 var point = view.getPointClickPoint();
	 hideClosestMarkers(false);
	 closestMarkerNums = [];
         findClosestMarkersToPoint(point);
	 showClosestMarkers();
      }

      //...............................................
      //  editor function
      //...............................................
      if(viewChanges.editorPointClick) {

	 var selectedKnums;
	 var len;

	 //console.log("viewChanges.editorPointClick");
         selectedKnums = getSelectedRowKnums();
	 //console.log("viewChanges selectedKnums ", selectedKnums);
	 len = selectedKnums.length;
	 if(len > 1) {
	    return false;
	 } else {
	    //console.log("viewChanges.editorPointClick");
	    addNewLocation();
	 }
      }

      //...............................................
      //  editor function
      //...............................................
      if(viewChanges.movingPCPoint) {

	 //console.log("viewChanges.movingPCPoint");
	 moveHighlightedMarker();

      }

      //...............................................
      //  editor function
      //...............................................
      if(viewChanges.endPCDrag) {

	 //console.log("viewChanges.endPCDrag");
	 updateLocation(null);

	 movingMarkerKnum = undefined;
	 movingMarkerFnum = undefined;
	 MOVING = false;

      }

      //...............................................
      if(viewChanges.deleteMarkerLocation) {
	 deleteHighlightedMarker();
      }

      //...................................
      if(viewChanges.mouseOut) {
	 var mode = view.getMode();
	 if(_debug) console.log("viewUpdate: mouseOut ");
	 if(mode.name === 'pointClick') {
	 }
      }

      //...................................
      if(viewChanges.contextMenuOn) {

	 setSelectedRowHighlightType("context");
	 CONTEXT_MENU = true;
      }

      //...................................
      if(viewChanges.contextMenuOff) {

	 setSelectedRowHighlightType("selected");
	 CONTEXT_MENU = false;
      }

      //...................................
      if(viewChanges.toolbox === true) {
	var vizibl = view.toolboxVisible();
	if(vizibl === true) {
	   //window.setVisible(true);
        } else if(vizibl === false) {
	   //window.setVisible(false);
	}
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var titleIFrameLoaded = function (ifrm) {

      titleIframeHandle = ifrm;

   }; // titleIFrameLoaded

   //---------------------------------------------------------------
   var doDistChanged = function (from) {

      var distance;
      var wlzToStackOffset;
      var cur;
      var cur2;
      var cur3;
      var zsel;
      var entry;
      var num;
      var multiple;
      var indx;

      multiple = false;

      //console.log("enter doDistChanged from %s",from);

      wlzToStackOffset = model.getWlzToStackOffset();
      distance = model.getDistance();
      dcur = distance.cur;
      zsel = model.getZSelectorInfo();
      //console.log("doDistChanged zsel ",zsel);
      if(zsel.imgRange && zsel.imgRange.length > 1) {
	 multiple = true;
         num = zsel.imgRange.length;
	 distance = model.getDistance();
	 cur = distance.cur;
	 cur2 = (model.isArrayStartsFrom0()) ? cur : cur - 1;
	 cur3 = cur2 + wlzToStackOffset;
	 //console.log("d %d, imgRange ",cur3,zsel.imgRange);
	 //console.log("d %d",cur3);
	 for(i=0; i<num; i++) {
	    entry = zsel.imgRange[i];
	    if(cur3 >= entry.min && cur3 <= entry.max) {
	       //console.log("i %d, entry.min %d, entry.max %d",i,entry.min,entry.max);
	       //aspectRatio = entry.aspectRatio;
	       indx = i;
	       break;
	    }
	 }
      }

      updateViewerTitle(multiple, indx);
      updateInfoIFrame(multiple, indx); 
      knum = emouseatlas.emap.markerPopup.getKnum();
      //console.log("doDistChanged knum %s",knum);
      if(knum !== undefined) {
	 //setMarkerPopupIFrameContent(knum);
      }

   }; // doDistChanged
   
   //---------------------------------------------------------------
   var getDstForImage = function (name, sectionMap) {

      var dst = 0;
      var len;
      var i;

      if(name === undefined || name === null || name === "") {
         return dst;
      } else {
         len = sectionMap.length;
	 for(i=0; i<len; i++) {
            if(sectionMap[i].label === name) {
	       dst = i;
	       break;
	    }
	 }
      }

      return dst;
   };
   
   //---------------------------------------------------------------
   var getCurrentImg = function () {
      return currentImg;
   };
   
   //---------------------------------------------------------------
   // the id may be xyz_knum_fnum or  xyz_knum
   //---------------------------------------------------------------
   var getKnumFromMarkerId = function (str, two_) {

      var knum;
      var indx;
      var substr;

      //console.log("getKnumFromMarkerId %s",str);

      two_ = (two_ === undefined) ? false : two_;

      indx = str.lastIndexOf("_");
      if(two_) {
         substr = str.substring(0,indx);
         indx = substr.lastIndexOf("_");
      } else {
         substr = str;
      }
      indx = indx + 1*1;
      knum = substr.substring(indx);

      return knum;
   };
   
   //---------------------------------------------------------------
   var getFnumFromMarkerId = function (str) {

      var fnum;
      var indx;
      var substr;

      //console.log("getFnumFromMarkerId %s",str);

      indx = str.lastIndexOf("_");
      fnum = str.substring(indx + 1*1);

      return fnum;
   };

   //---------------------------------------------------------------
   var getImgIdFromMarkerId = function (str) {

      var knum;
      var indx;
      var substr;

      //console.log("getImgIdFromMarkerId %s",str);

      indx = str.indexOf("_");
      return str.substring(indx);
   };
   
   //---------------------------------------------------------
   var setSelectedRowHighlightType = function (type) {
      
      var tbody;
      var selectedKnums;
      var knum;
      var fnum;
      var iknum;
      var rows;
      var row;
      var rowknum;
      var lenKnums;
      var lenRows;
      var klass;
      var vizibl;
      var found = false;
      var i;
      var j;

      tbody = $("pointClickTableBody");
      selectedKnums = getSelectedRowKnums();

      rows = tbody.getElementsByTagName("tr");

      lenKnums = selectedKnums.length;
      lenRows = rows.length;

      //console.log("setSelectedRowHighlightType %s selected = ",type, selectedKnums);

      vizibl = true;
      fnum = undefined;

      if(lenKnums === 0) {
	 for(i=0; i<lenRows; i++) {
	    row = rows[i];
	    rowknum = getKnumFromMarkerId(row.id, false);
	    if(type.toLowerCase() === "context") {
	       klass = row.className;
	       if(klass.indexOf("over") !== -1) {
	          klass = type + ' both';
                  row.className = 'pointClickTableRow ' + klass;
		  break;
	       }
	    } else if(type.toLowerCase() === "selected") {
	       //doHideAllMarkers(null);
	       klass = row.className;
	       // trying to avoid non-selected term being highlighted when Rclick menu cancelled but no luck so far :^(
	       if(klass.indexOf("context") !== -1 && klass.indexOf("over") !== -1) {
                  row.className = 'pointClickTableRow';
	       }
	       if(klass.indexOf("context") !== -1) {
                  row.className = 'pointClickTableRow ' + type;;
		  displayMarker(rowknum, fnum, vizibl, "setSelectedRowHighlightType");
		  //positionMarker(rowknum, "setSelectedRowHighlightType");
		  // add the knum for this marker to the list of selected markers
		  selectedRowKnums[selectedRowKnums.length] = rowknum;
		  tmpArr = utils.filterDuplicatesFromArray(selectedRowKnums);
		  selectedRowKnums = utils.duplicateArray(tmpArr);
	          previousSelectedRow = latestSelectedRow;
		  latestSelectedRow = rowknum; // think about this one
		  break;
	       }
	    }
	 }
      }

      for(i=0; i<lenKnums; i++) {
         knum = selectedKnums[i];
	 iknum = parseInt(knum);
	 for(j=0; j<lenRows; j++) {
	    row = rows[j];
	    rowknum = getKnumFromMarkerId(row.id, false);
	    if(knum === rowknum) {
	       found = true;
	       break;
	    }
	 }
	 if(found) {
            row.className = 'pointClickTableRow ' + type;
	 }
	 found = false;
      }

      if(type === "context") {
         addTopBottomContextBorders();
      }

      listSelectedTerms("setSelectedRowHighlightType " + type);
      return false;
   };
   
   //---------------------------------------------------------
   var addTopBottomContextBorders = function () {

      var selectedKnums;
      var sortedKnums;
      var klass;
      var btop = false;
      var bbot = false;
      var iknum;
      var itest;
      var row;
      var len;
      var i;

      selectedKnums = getSelectedRowKnums();
      sortedKnums = utils.sortArrayNumerically(selectedKnums); 
      len = sortedKnums.length;

      if(len === 0) {
	 return false;
      }

      // find all rows which are not adjoining other rows
      if(len === 1) {
	 row = getRowWithKnum(sortedKnums[0]);
         row.className = row.className + ' both';
	 return false;
      }

      for(i=0; i<len; i++) {
         iknum = parseInt(sortedKnums[i]);
	 if(i === 0) {
	    row = getRowWithKnum(sortedKnums[0]);
            itest = parseInt(sortedKnums[1]);
	    if(itest - iknum > 1) {
	       row.className = row.className + ' both';
	    } else {
	       row.className = row.className + ' top';
	    }
	 } else if(i === len-1) {
	    row = getRowWithKnum(sortedKnums[len - 1]);
            itest = parseInt(sortedKnums[len - 2]);
	    if(iknum - itest > 1) {
	       row.className = row.className + ' both';
	    } else {
	       row.className = row.className + ' bottom';
	    }
	 } else {
	    row = getRowWithKnum(sortedKnums[i]);
            itest = parseInt(sortedKnums[i - 1]);
	    if(iknum - itest > 1) {
	       btop = true;
	    }
            itest = parseInt(sortedKnums[i + 1]);
	    if(itest - iknum > 1) {
	       bbot = true;
	    }
	    if(btop && bbot) {
	       klass = " both";
	    } else if(btop && !bbot) {
	       klass = " top";
	    } else if(bbot && !btop) {
	       klass = " bottom";
	    } else if(!bbot && !btop) {
	       klass = "";
	    }
	    row.className = row.className + klass;
	    klass = undefined;
	    btop= false;
	    bbot = false;
	 }
      }
      return false;
   };
   
   //---------------------------------------------------------
   var createMarkerIFrame = function () {

      //console.log("enter createMarkerIFrame");

      var histologyDiv;
      var container;
      var topDiv;
      var header;
      var link;
      var closeDiv
      var closeImg
      var iFrame;
      var dropTarget;

      container = new Element('div', {
         'id': markerIFrameID,
         'class': 'markerPopupIFrameContainer'
      });

      topDiv = new Element('div', {
         'id': 'markerPopupIFrameTopDiv',
         'class': 'markerPopupIFrameTopDiv'
      });

      header = new Element('h4', {
         'class': 'markerPopup'
      });

      header = new Element('h4', {
         'class': 'markerPopup',
      });

      link = new Element('a', {
	 'href': emouseatlasUrl, 
      });
      link.innerHTML = "emouseatlas";

      closeDiv = new Element('div', {
         'id': 'markerPopupIFrameCloseDiv',
         'class': 'wlzIIPViewerIFrameCloseDiv'
      });
         //'class': 'wlzIIPViewerIFrameCloseDiv markerPopup'

      closeImg = new Element('img', {
         'class': 'iframeClose',
	 'src': "../../images/close_10x8.png"
      });

      iFrame = new Element('iframe', {
         'id': 'markerPopupIFrame',
         'class': 'markerPopupIFrame',
         'name': 'markerPopupIFrame',
	 'src': "../../html/markerPopupIFrame.html"
      });

      //........................
      targetDiv = $("emapIIPViewerDiv");

      if(!targetDiv) {
         if(_debug) console.log("no target div");
         return false;
      }

      topDiv.inject(container, 'inside');
      link.inject(header, 'inside');
      header.inject(topDiv, 'inside');
      closeImg.inject(closeDiv, 'inside');
      closeDiv.inject(topDiv, 'inside');
      container.inject(targetDiv, 'inside');
      iFrame.inject(container, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('markerPopupIFrameCloseDiv');

      emouseatlas.emap.drag.register({drag:markerIFrameID, drop:"projectDiv"});

      //console.log("exit createMarkerIFrame");
   };
   
   //---------------------------------------------------------
   var getStringPixelWidth = function (strContainerId) {

      var container;
      var sty;
      var font;
      var wid;
      var ret;

      if(strContainerId === undefined || strContainerId === null || strContainerId === "") {
         return undefined;
      }

      container = document.getElementById(strContainerId);
      if(container === undefined || container === null) {
         return undefined;
      }

      sty = window.getComputedStyle(container, null);
      wid = sty.getPropertyValue("width");
      ret = parseInt(wid, 10);

      //console.log("getStringPixelWidth is %s for ",ret,container);

      return ret;
   };
   
   //---------------------------------------------------------
   var listSelectedTerms = function (from) {

      //if(true) {
      if(_debug) {
	 console.log("listSelectedTerms from %s",from);
	 console.log(selectedRowKnums);
	 console.log("previousSelectedRow %s",previousSelectedRow);
	 console.log("latestSelectedRow %s",latestSelectedRow);
      }
   };
   
   //---------------------------------------------------------
   var clearContextHighlight = function (from) {

      var conterms;
      var row;
      var len;
      var i;

      conterms = $$(".context");
      len = conterms.length;

      if(len > 0) {
         for(i=0; i<len; i++) {
            row = conterms[i];
            row.className = 'pointClickTableRow';
	 }
      }
   };
   
   //---------------------------------------------------------
   var getLatestClickedRow = function () {
      return latestClickedRow;;
   };
   
   //---------------------------------------------------------
   var getTermDetsForKnum = function (knum) {

      var termDets;
      var found = false;
      var len;
      var i;

      len = supplementTerms.length;
      //console.log("getTermDetsForKnum %s, len %d",key,len);
      for (i=0; i<len; i++) {
        termDets = supplementTerms[i]; 
	if(termDets.knum === knum) {
	   found = true;
	   break;
        }
      }

      if(found) {
         return termDets;
      } else {
         return undefined;
      }
   };

   //---------------------------------------------------------
   /**
    *   Informs registered observers of a change to pointClick.
    */
   var notify = function (from) {

      var i;
      //console.log("supplementPointClick.notify from %s",from);
      //printPointClickChanges();

      //console.log("supplementPointClick registry ",registry);

      for (i = 0; i < registry.length; i++) {
	 //console.log(registry[i].getName());
	 registry[i].pointClickUpdate(pointClickChanges);
      }

      resetPointClickChanges();
      //console.log("exit supplementPointClick.notify ",from);
   }; // notify

   //---------------------------------------------------------
   /**
    *   Prints the state of observable changes to pointClick.
    */
   var printPointClickChanges = function() {
      if(pointClickChanges.ready) console.log("pointClickChanges.ready ",pointClickChanges.ready);
      if(pointClickChanges.wikiChoice) console.log("pointClickChanges.wikiChoice ",pointClickChanges.wikiChoice);
      if(pointClickChanges.mgiChoice) console.log("pointClickChanges.mgiChoice ",pointClickChanges.mgiChoice);
      if(pointClickChanges.plateList) console.log("pointClickChanges.plateList ",pointClickChanges.plateList);
      if(pointClickChanges.emaModels) console.log("pointClickChanges.emaModels ",pointClickChanges.emaModels);
      console.log("++++++++++++++++++++++++++++++++++++++++++++");
   };

   //---------------------------------------------------------
   /**
    *   Resets the list of observable changes to pointClick.
    */
   var resetPointClickChanges = function() {
      pointClickChanges.ready =  false;
      pointClickChanges.wikiChoice =  false;
      pointClickChanges.mgiChoice =  false;
      pointClickChanges.plateList =  false;
      pointClickChanges.emaModels =  false;
   };

   //---------------------------------------------------------
   var getName = function () {
      return "pointClick";
   };

   //---------------------------------------------------------
   var getPlateList = function () {
      return plateList;
   };

   //---------------------------------------------------------
   var getModels = function () {
      return emaModels;
   };

   //---------------------------------------------------------
   var getCurrentImg = function () {
      return currentImg;
   };

   //=====================================================================================
   // EDITOR STUFF
   //=====================================================================================

   //---------------------------------------------------------------
   // Editors can move markers using <Shift> + left mouse drag
   //---------------------------------------------------------------
   var setMarkerLocation = function () {

      var point;
      var target;
      var knum;
      var fnum;
      var key;
      var annot;
      var locdets;
      var locn;
      var loc_oid;
      var dets;
      var indx;
      var x;
      var y;
      var z;

      point = view.getPointClickPoint();
      if(_debug) console.log("setMarkerLocation to  ",point);

      key = currentImg + "_" + movingMarkerKnum;
      locdets = locationDets[key];

      if(locdets === undefined) {
         return false;
      }
      //console.log("locdets for %s ",key,locdets);

      locn = locdets.locArr[movingMarkerFnum];
      loc_oid = locdets.oidArr[movingMarkerFnum];
      //console.log("locn ",locn);
      //console.log("loc_oid ",loc_oid);

      if(MOVING || (locn.x === '0' && locn.y === '0' && locn.z === '0')) {
	 x = Math.round(point.x / scale);
	 y = Math.round(point.y / scale);
	 locn.x = x.toString(10);
	 locn.y = y.toString(10);
      }

      showSelectedMarkers("setMarkerLocation");

   }; // setMarkerLocation

   //---------------------------------------------------------------
   var getMarkerDetailsFromTargetId = function (id) {

      var dets;
      var indx;
      var bits;

      //console.log("getMarkerFromTargetId target.id %s",id);

      bits = id.split("_");
      //console.log("getMarkerFromTargetId bits ",bits);

      dets = {img_id:bits[1], knum:bits[2], fnum:bits[3]};

      return dets;;

   };

   /*
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   DON'T REMOVE THIS, IT MAY BE REQUIRED LATER
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

   //---------------------------------------------------------------
   // returns the array index of marker details if it has been edited,
   // otherwise returns undefined
   //---------------------------------------------------------------
   var indexOfEditedMarkerDets = function (oid) {

      var OBJ;
      var indx;
      var len;
      var i;

      len = editedMarkerDets.length;
      found = false;
      indx = undefined;

      //console.log("indexOfEditedMarkerDets oid %s",oid);

      for(i=0; i<len; i++) {
         OBJ = editedMarkerDets[i];
         //console.log("indexOfEditedMarkerDets OBJ.loc_oid %s",OBJ.loc_oid);
	 if (OBJ.loc_oid == oid) {
	    indx = i;
	    break;
	 }
      }

      return indx;

   }; // indexOfEditedMarkerDets:

   //---------------------------------------------------------------
   var doSaveEditedMarkers = function (e) {

      var ajax;
      var ajaxParams;
      var dets;
      var key;
      var fnum;
      var locs;
      var loc;
      var detsToSave;
      var saveArr;
      var url;
      var jsonStr;
      var len;
      var i;

      var OK = false;

      OK = confirm("about to save edited marker locations");
      if(!OK) {
         return false;
      }

      //console.log("doSaveEditedMarkers editedMarkerDets ",editedMarkerDets);

      saveArr = [];

      len = editedMarkerDets.length;
      for(i=0; i<len; i++) {
         dets = editedMarkerDets[i];
         //console.log("dets ",dets);
	 fnum = dets.fnum;
	 key = dets.img_id + "_" + dets.knum;
	 locs = locationDets[key];
         //console.log(locs);
	 loc = locs.locArr[fnum];
         //console.log(loc);
	 detsToSave = {loc_oid:dets.loc_oid, x:loc.x, y:loc.y, z:loc.z};
	 saveArr[saveArr.length] = detsToSave;
      }

      //console.log("doSaveEditedMarkers ",saveArr);

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonStr = JSON.stringify(locs);
      } else {
         jsonStr = emouseatlas.JSON.stringify(saveArr);
      }
      if(!jsonStr) {
         return false;
      }
      //if(_debug) console.log("doSaveEditedMarkers: stringified locs: %s",jsonStr);

      //         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
      //	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
      //	 and empty resultText (it is suffering from the 'different domain' problem).

      url = '/kaufmanwebapp/SaveMarkers';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&markers=" + jsonStr,
	 callback:doSaveEditedMarkersCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // doSaveEditedMarkers

   //---------------------------------------------------------------
   var doSaveEditedMarkersCallback = function (response, urlParams) {

      editedMarkerDets = [];
      showSelectedMarkers();

   }; // doSaveEditedMarkersCallback:
   
   //---------------------------------------------------------------
   var doCancelEditMarkers = function (e) {

      editedMarkerDets = [];
      showSelectedMarkers();

   }; // doCancelEditMarkers
   */

   //=============================================================================================
   //=============================================================================================
   
   //---------------------------------------------------------------
   // When in 'Editor' mode, clicking in the image generates 
   // a new location for the selected term in the database.
   //---------------------------------------------------------------
   var addNewLocation = function () {

      var _deb;
      var point;
      var x;
      var y;
      var selected;
      var termDets;
      var emapa;

      _deb = _debug;
      //_debug = true;

      point = view.getPointClickPoint();
      x = Math.round(point.x / scale);
      y = Math.round(point.y / scale);
      selected = getSelectedTableItem();

      //console.log("addNewLocation selected ",selected);

      if(selected === undefined) {
         return false;
      }

      editedMarkerKnum = selected.key;
      //console.log("addNewLocation editedMarkerKnum ",editedMarkerKnum);
      updateCurrentImgKnums(true);

      termDets = getTermDetsForKnum(editedMarkerKnum);
      emapa = termDets.emapa;

      if(_debug) console.log("addNewLocation point %d, %d",x,y);
      if(_debug) console.log("addNewLocation selected ",selected);
      if(_debug) console.log("addNewLocation termDets ",termDets);

      //removeMarkers();

      url = '/kaufmanwebapp/AddNewLocation';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&image=" + selected.img + "&knum=" + editedMarkerKnum + "&emapa=" + emapa + "&x=" + x + "&y=" + y,
	 callback:addNewLocationCallback,
         async:true
      }
      if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

      _debug = _deb;

   }; // addNewLocation

   //---------------------------------------------------------------
   // If there is an existing location, set it to the mouse up point
   //---------------------------------------------------------------
   var addNewLocationCallback = function (response, urlParams) {

      var deb;
      var point;
      var selected;
      var key;
      var markerDetails;
      var locations;
      var locn;
      var x;
      var y;
      var z;
      var len;
      var i;

      removeMarkers();
      locationDets = undefined;
      locationDets = {};
      //console.log("addNewLocationCallback editedMarkerKnum %s",editedMarkerKnum);
      updatePlateData();

   }; // addNewLocationCallback

   //---------------------------------------------------------------
   // Editor mode only:
   // If there are existing markers, remove them as they get re-generated.
   // Assume that there are the same number of imgMaps & imgDivs & labels
   // Note: this doesn't change the database, only the interface.
   //---------------------------------------------------------------
   var removeMarkers = function () {

	 var container;
	 var markerMapArr;
	 var markerMap;
	 var markerImgArr;
	 var markerImg;
	 var markerTxtArr;
	 var markerTxt;
	 var markerLabelArr;
	 var markerLabel;
	 var txtToRemove;
	 var imgToRemove;
	 var mapToRemove;
	 var labelToRemove;
	 var thingToRemove;
	 var found = false;
	 var len;
	 var i;

         container = document.getElementById(markerContainerId);
	 markerMapArr = container.getElementsByTagName("map");
	 markerImgArr = document.getElementsByClassName("markerImgDiv");
	 markerTxtArr = document.getElementsByClassName("markerTxtDiv");
	 markerLabelArr = document.getElementsByClassName("markerLabelDiv");

	 len = markerImgArr.length;

	 txtToRemove = [];
	 imgToRemove = [];
	 mapToRemove = [];
	 labelToRemove = [];

	 for(i=0; i<len; i++) {
	    markerTxt = markerTxtArr[i];
	    if(markerTxt) {
               txtToRemove[txtToRemove.length] = markerTxt.id;
	    }
	    markerImg = markerImgArr[i];
	    if(markerImg) {
               imgToRemove[imgToRemove.length] = markerImg.id;
	    }
	    markerMap = markerMapArr[i];
	    if(markerMap) {
               mapToRemove[mapToRemove.length] = markerMap.id;
	    }
	    markerLabel = markerLabelArr[i];
	    if(markerLabel) {
               labelToRemove[labelToRemove.length] = markerLabel.id;
	    }
	 }

	 len = imgToRemove.length;
	 if(len > 0) {
	    for (i=0; i<len; i++) {
	       thingToRemove = document.getElementById(txtToRemove[i]);
	       if(thingToRemove) {
		  thingToRemove.parentNode.removeChild(thingToRemove);
	       }
	       thingToRemove = document.getElementById(imgToRemove[i]);
	       if(thingToRemove) {
		  thingToRemove.parentNode.removeChild(thingToRemove);
	       }
	       thingToRemove = document.getElementById(mapToRemove[i]);
	       if(thingToRemove) {
		  thingToRemove.parentNode.removeChild(thingToRemove);
	       }
	       thingToRemove = document.getElementById(labelToRemove[i]);
	       if(thingToRemove) {
		  thingToRemove.parentNode.removeChild(thingToRemove);
	       }
	    }
	 }

   }; // removeMarkers

   //---------------------------------------------------------------
   // We only want to update data that has changed
   //---------------------------------------------------------------
   var updatePlateData = function () {

      var plate;
      var subplate;
      var url;
      var ajaxParams;
      var ajax;

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      url = '/kaufmanwebapp/GetPlateData';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&plate=" + plate + "&subplate=" + subplate,
         callback:updatePlateDataCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      //console.log("updatePlateData: ",ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // updatePlateData

   //---------------------------------------------------------------
   var updatePlateDataCallback = function (response, urlParams) {

      //if(_debug) console.log("updatePlateDataCallback: \n" + urlParams);
      var json;
      var subplateNames;
      var subplate;
      var subplateData;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //if(_debug) console.log("updatePlateDataCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //if(_debug) console.log("updatePlateDataCallback returning: json null");
         return false;
      }
      //if(_debug) console.log("updatePlateDataCallback json ",json);

      subplateData = json.images;
      //console.log("subplateData ",subplateData);
      storeLocations(subplateData, "updatePlateDataCallback");
      setCurrentImgKnums();
      makeMarkers();

      //console.log("updatePlateDataCallback: editedMarkerKnum ", editedMarkerKnum);
      if(editedMarkerKnum === undefined) {
	 if(SHOW_ALL_MARKERS) {
	    deselectAllRows("modelUpdate.modelChanges.dst");
	    selectedRowKnums = [];
	    showAllMarkers();
	 } else {
	    showSelectedMarkers("modelUpdate");
	 }
      } else {
         showEditedMarker();
      }


   }; // updatePlateDataCallback:

   //---------------------------------------------------------------
   var deleteHighlightedMarker = function () {

      var ajax;
      var ajaxParams;
      var url;
      var key;
      var locDets;
      var loc_oid;

      if(!EDITOR) {
         return false;
      }

      if(highlightedMarkerKnum === undefined || highlightedMarkerFnum === undefined) {
        if(_debug)  console.log("deleteHighlightedMarker returning as highlightedMarkerKnum/highlightedMarkerFnum undefined");
         return false;
      }

      // when we mouse over a marker it becomes highlighted rather than selected.
      //console.log("getting ready to delete marker %s_%s",highlightedMarkerKnum,highlightedMarkerFnum);
      key = currentImg + "_" + highlightedMarkerKnum;

      editedMarkerKnum = highlightedMarkerKnum;
      //console.log("deleteHighlightedMarker editedMarkerKnum %s",editedMarkerKnum);

      locDets = locationDets[key];
      //console.log("locationDets[%s] ",key,locDets);

      loc_oid = locDets.oidArr[highlightedMarkerFnum]
      //console.log("loc_oid ",loc_oid);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      url = '/kaufmanwebapp/DeleteLocation';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"project=kaufman_supplement&loc_oid=" + loc_oid,
	 callback:deleteHighlightedMarkerCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // deleteHighlightedMarker

   //---------------------------------------------------------------
   var deleteHighlightedMarkerCallback = function (response, urlParams) {

      if(knumPresent(highlightedMarkerKnum, true, "deleteHighlightedMarkerCallback")) {
         setMarkerSrc(highlightedMarkerKnum, srcSelected, "doMouseOutMarker");
         row = getRowWithKnum(highlightedMarkerKnum);
         row.className = 'pointClickTableRow selected';
      }
      highlightedMarkerKnum = undefined;
      highlightedMarkerFnum = undefined;
      updateCurrentImgKnums(false);

      removeMarkers();
      locationDets = undefined;
      locationDets = {};
      updatePlateData();

   }; // deleteHighlightedMarkerCallback:

   //---------------------------------------------------------------
   var moveHighlightedMarker = function () {

      var ajax;
      var ajaxParams;
      var url;
      var key;
      var locDets;
      var loc_oid;

      if(!MOVING) {
         movingMarkerKnum = highlightedMarkerKnum;
         movingMarkerFnum = highlightedMarkerFnum;
      }

      // when we mouse over a marker it becomes highlighted rather than selected.
      //console.log("moving marker %s_%s",movingMarkerKnum,movingMarkerFnum);
      key = currentImg + "_" + movingMarkerKnum;

      locDets = locationDets[key];
      //console.log("locationDets[%s] ",key,locDets);

      loc_oid = locDets.oidArr[movingMarkerFnum]
      //console.log("loc_oid ",loc_oid);

      MOVING = true;
      displayMarker(movingMarkerKnum, movingMarkerFnum, false, "moveHighlightedMarker");
      setMarkerLocation();

   }; // moveHighlightedMarker
   
   //---------------------------------------------------------------
   var updateLocation = function (e) {

      var key;
      var fnum;
      var locdets;
      var locArr;
      var loc_oid;
      var ajax;
      var urlParams;
      var ajaxParams;
      var url;
      var jsonStr;
      var len;
      var i;

      if(!EDITOR) {
         return false;
      }

      // when we mouse over a marker it becomes highlighted rather than selected.
      //console.log("getting ready to save moved marker %s_%s",movingMarkerKnum,movingMarkerFnum);
      key = currentImg + "_" + movingMarkerKnum;

      fnum = parseInt(movingMarkerFnum);

      locdets = locationDets[key];
      //console.log("locationDets[%s] ",key,locdets);
      if(locdets === undefined) {
         return false;
      }

      locArr = locdets.locArr[fnum];
      //console.log("locArr ",locArr);

      loc_oid = locdets.oidArr[fnum]
      //console.log("loc_oid ",loc_oid);

      urlParams = "project=kaufman_supplement&loc_oid=" + loc_oid + "&x=" + locArr.x + "&y=" + locArr.y;

         //You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 //Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 //and empty resultText (it is suffering from the 'different domain' problem).

      url = '/kaufmanwebapp/UpdateLocation';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams: urlParams,
	 callback:updateLocationCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      //console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // updateLocation

   //---------------------------------------------------------------
   var updateLocationCallback = function (response, urlParams) {

      removeMarkers();
      locationDets = undefined;
      locationDets = {};
      updatePlateData();

   }; // updateLocationCallback:

   //---------------------------------------------------------
   var markerIsDefined = function (marker) {
      
      var pnt = marker.p;
      var ret = true;

      if(parseInt(pnt.x, 10) === 0 && parseInt(pnt.y, 10) === 0 && parseInt(pnt.z, 10) === 0) {
	 ret = false;
      }

      return ret;
   };

   //=====================================================================================

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      register: register,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      getName: getName,
      getCurrentImg: getCurrentImg,
      getPlateList: getPlateList,
      titleIFrameLoaded: titleIFrameLoaded,
      doTableQuery: doTableQuery,
      doTableLink: doTableLink,
      doTableCancel: doTableCancel,
      getSelectedRowKnums: getSelectedRowKnums,
      getTermDetsForKnum: getTermDetsForKnum,
      getLatestClickedRow: getLatestClickedRow,
      getWikiUrl: getWikiUrl,
      getModels: getModels,
      getAnnotations: getAnnotations,
      getAnnotationForKnum: getAnnotationForKnum,
      doDownloadImageData: doDownloadImageData
   };

}(); // end of module supplementPointClick
