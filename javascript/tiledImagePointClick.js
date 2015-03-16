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
//   tiledImagePointClick.js
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
// module for tiledImagePointClick
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.tiledImagePointClick = function() {

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
   var SINGLE_PLATE = false;
   var PLATE_DATA = false;
   var currentImg;
   var previousImg = undefined;
   var markerContainerId;
   var tempMarkerKeys;
   var previousOpenMarker;
   var locationsForEditor;
   var subplateKeys;
   var imgKeyArr;
   var selectedRowKeys;
   var latestSelectedRow = undefined;
   var latestClickedRow = undefined;
   var previousSelectedRow = undefined;
   var lastHighlightedKey = undefined;
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
   var srcClose;
   var srcClose2;
   var CONTEXT_MENU = false;
   var SHOWING_ALL_MARKERS = false;
   var stagedOntologyUrl;
   var abstractOntologyUrl;
   var emageUrl;
   var mgiUrl;
   var ontologyInfo = {};
   //......................
   var registry = [];
   var pointClickChanges = { 
      initial: false,
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

      //if(_debug) console.log("enter tiledImagePointClick.initialise");

      model.register(this);
      view.register(this);

      imgDir = model.getInterfaceImageDir();
      srcSelected = imgDir + "mapIconSelected.png";
      srcClosest = imgDir + "mapIconClosest.png";
      srcHighlighted = imgDir + "mapIconHighlighted.png";
      srcClose = imgDir + "close_10x8.png";
      srcClose2 = imgDir + "close2_10x8.png";

      pointClickImgData = model.getPointClickImgData();
      if(_debug) console.log("pointClickImgData ",pointClickImgData);

      // testing at the moment
      //getEMAPData();

      subplateMarkerDetails = {};
      tempMarkerKeys = [];
      selectedRowKeys = [];
      locationsForEditor = [];
      subplateKeys = [];
      imgKeyArr = [];

      maxCloseMarkersToShow = 3;

      markerContainerId = 'histology_tileFrame';
      //stagedOntologyUrl = "http://testwww.emouseatlas.org/emap/ema/DAOAnatomyJSP/anatomy.html?stage=TS";
      //abstractOntologyUrl = "http://testwww.emouseatlas.org/emap/ema/DAOAnatomyJSP/abstract.html";
      emageUrl = "http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=";
      stagedOntologyUrl = "http://www.emouseatlas.org/emap/ema/DAOAnatomyJSP/anatomy.html?stage=TS";
      abstractOntologyUrl = "http://www.emouseatlas.org/emap/ema/DAOAnatomyJSP/abstract.html";
      //stagedOntologyUrl = "http://drumguish-new.hgu.mrc.ac.uk/emap/ema/DAOAnatomyJSP/anatomy.html?stage=TS";
      //abstractOntologyUrl = "http://drumguish-new.hgu.mrc.ac.uk/emap/ema/DAOAnatomyJSP/abstract.html";
      //emageUrl = "http://drumguish-new.hgu.mrc.ac.uk/emagewebapp/pages/emage_general_query_result.jsf?structures=";
      mgiUrl = "http://www.informatics.jax.org/gxd/structure/"; 


      //---------------------------------------------------------
      // The marker img is 20x34 pixels and the locating point is mid-bottom-line
      // so we apply an offset to the mouse click point to make it look right.
      //---------------------------------------------------------
      imgOfs = {x:-8, y:-32};
      labelOfs = {x:30, y:-30};

      getListOfPlates();
      getEmaModels();
      getPlateData();

      scale = view.getScale().cur;

      markerIFrameID = "markerPopupIFrameContainer";
      createMarkerIFrame();

      emouseatlas.emap.drag.register({drag:"wlzIIPViewerTitleIFrameContainer", drop:"projectDiv"});

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
	 urlParams:"",
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
      pointClickChanges.plateList = true;
      notify("plateList");

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
	 urlParams:"plate=" + subplate,          // kaufman plate
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
      pointClickChanges.emaModels = true;
      notify("emaModels");

   }; // getEmaModelsCallback:


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

      url = '/kaufmanwebapp/GetPlateInfo';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"infoBy=plate",          // plate or <stage>
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
      //console.log(response);
      
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

      setViewerTitle();
      setInfoIFrame(); 

   }; // getTitleInfoCallback:

   //---------------------------------------------------------------
   var getOntologyInfo = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var url;
      var ajax;
      var ajaxParams;

      url = '/ontologywebapp/GetEMAPA';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"",
         callback:getOntologyInfoCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getOntologyInfo

   //---------------------------------------------------------------
   var getOntologyInfoCallback = function (response) {

      //if(_debug) console.log("getListOfPlatesCallback: \n" + urlParams);
      //console.log("getListOfPlatesCallback:");
      //console.log("getListOfPlatesCallback: response ",response);
      var json;
      
      // get Title info via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         if(_debug) console.log("getOntologyInfoCallback returning: response null");
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
         if(_debug) console.log("getOntologyInfoCallback returning: json null");
         return false;
      }
      if(_debug) console.log("getOntologyInfoCallback json ",json);

     ontologyInfo = json;

   }; // getOntologyInfoCallback:


   //---------------------------------------------------------------
   var setInfoIFrame = function () {

      var details;
      var plate;
      var subplate;
      var found = false;
      var len;
      var i;
      var infoDetails;
      var infoDetailsTrimmed = {};
      var stray;
      var str;

      //console.log("enter setInfoIFrame");

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      len = titleInfo.length;
      for(i=0; i<len; i++) {
	 if(titleInfo[i].plate === subplate) {
	    infoDetails = titleInfo[i];
	    found = true;
	    //console.log(infoDetails);
	    break;
	 }
      }

      if(!found) {
         return false;
      }

      //console.log("setInfoIFrame infoDetails: ",infoDetails);

      infoDetailsTrimmed.crLength = infoDetails.crLength;
      infoDetailsTrimmed.description = infoDetails.description;
      infoDetailsTrimmed.plate = infoDetails.plate;
      infoDetailsTrimmed.sectionType = infoDetails.sectionType;

      infoDetailsTrimmed.images = [];
      len = infoDetails.images.length;
      for(i=0; i<len; i++) {
         infoDetailsTrimmed.images[i] = infoDetails.images[i];
      }

      stray = infoDetails.stage.split(';');
      infoDetailsTrimmed.stage = stray[0];

      stray = infoDetails.dpc.split(';');
      infoDetailsTrimmed.dpc = stray[0];

      stray = infoDetails.carnegie.split(';');
      infoDetailsTrimmed.carnegie = stray[0];

      stray = infoDetails.witschi.split(';');
      infoDetailsTrimmed.witschi = stray[0];

      //console.log("setInfoIFrame infoDetailsTrimmed: ",infoDetails);
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
         view:emouseatlas.emap.tiledImageView
      });


      // in case there is a url parameter asking for image on a different embryo (plate03, plate04)
      doDistChanged();

   }; // setInfoIFrame:

   //---------------------------------------------------------------
   var setViewerTitle = function (indx) {

      var plate;
      var subplate;
      var info;
      var pageHeaderDiv = $("pageHeaderDiv");
      var titleDiv;
      var titleInfoIconDiv;
      var theiler;
      var dpc;
      var len;
      var i;
      var found = false;
      var title = "Kaufman Atlas ";

      //console.log("enter setViewerTitle");

      if(!titleInfo) {
         return false;
      }

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;

      // the parseInt trims leading zeros
      title += "Plate " + parseInt(subplate, 10);

      len = titleInfo.length;
      for(i=0; i<len; i++) {
         if(titleInfo[i].plate === subplate) {
	    info = titleInfo[i];
	    found = true;
	    break;
	 }
      }

      if(!found) return false;

      dpc = info.dpc;
      stray = dpc.split(';');
      dpc = stray[0];
      title += " (" + dpc + " dpc)";

      theiler = info.stage;
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

      // in case there is a url parameter asking for image on a different embryo (plate03, plate04)
      doDistChanged();

   }; // setViewerTitle:

   //---------------------------------------------------------------
   var updateViewerTitle = function (multiple, indx) {

      var plate;
      var subplate;
      var subplateAlpha;
      var subplateNum;
      var info;
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
      var title = "Kaufman Atlas ";

      if(!titleInfo) {
         return false;
      }

      //console.log(titleInfo);

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;
      subplateAlpha = subplate.replace(/\d+/g, '');
      subplateAlpha = (subplateAlpha === undefined) ? "" : subplateAlpha;
      subplateNum = parseInt(subplate, 10);

      // the parseInt trims leading zeros
      title += "Plate " + subplateNum + subplateAlpha;

      len = titleInfo.length;
      for(i=0; i<len; i++) {
         if(titleInfo[i].plate === subplate) {
	    info = titleInfo[i];
	    found = true;
	    break;
	 }
      }

      if(!found) return false;

      //console.log(info);

      dpc = info.dpc;
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
      title += " (" + dpc + " dpc)";

      theiler = info.stage;
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

      url = '/kaufmanwebapp/GetPlateDataSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"plate=" + plate + "&subplate=" + subplate,
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
      var subplateNames;
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
      //console.log("getPlateDataCallback json ",json);

      subplateNames = storeSubplateNames(json);
      //if(_debug) console.log(subplateNames," ",subplateImgNames);
      subplateData = getSubplateData(json, pointClickImgData.subplate);
      //if(_debug) console.log("subplateData ", subplateData);
      storeSubplateKeysAndTerms(subplateData);
      storeSubplateDetails(subplateData);
      //console.log("subplateData ", subplateData);

      //This has been moved here because we have to know that plate data has been found.
      //---------------
      if(PLATE_DATA) {
         //console.log("got plate data");
         createElements();
         setMarkerTable();
         showUrlSpecifiedMarkers();

	 getTitleInfo();

	 if(model.isEditor()) {
	    if(_debug) console.log("isEditor ");
	    var chk = $('pointClickShowTxtChkbx');
	    chk.set('checked', true);
	    showAllMarkerTxt();
	 }

      }
      //---------------
      
   }; // getPlateDataCallback:

   //---------------------------------------------------------------
   // We only want to update data that has changed
   //---------------------------------------------------------------
   var updatePlateData = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var plate = pointClickImgData.plate;
      //if(_debug) console.log("updatePlateData plate ",plate);
      var url = '/kaufmanwebapp/GetPlateDataSQL';
      var ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"plate="+plate,
         callback:updatePlateDataCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // updatePlateData

   //---------------------------------------------------------------
   var updatePlateDataCallback = function (response, urlParams) {

      //if(_debug) console.log("updatePlateDataCallback: \n" + urlParams);
      var json;
      var subplateNames;
      var subplate;
      var subplateData;
      var oldLocn;
      var newSubplateDets;
      var key;
      var newLocs;
      var newLocn;
      var len;
      var len2;
      var len3;
      var i;
      var j;
      var k;
      
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

      subplateData = getSubplateData(json, pointClickImgData.subplate);
      //if(_debug) console.log("subplateData ",subplateData);
      len = selectedRowKeys.length;
      len2 = subplateData.length;

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         //if(_debug) console.log("key ",key);
         for(j=0; j<len2; j++) {
	    newSubplateDets = subplateData[j];
	    newLocs = newSubplateDets.locations;
	    len3 = newLocs.length;
	    for(k=0; k<len3; k++) {
	       newLocn = newLocs[k];
	       //if(_debug) console.log("newLocn ",newLocn);
	       if(newLocn.term.name == key) {
	          //if(_debug) console.log("%s, %s, %s, %s, %s,%s,%s",newSubplateDets.name, newLocn.id,newLocn.term.name,newLocn.term.description,newLocn.x,newLocn.y,newLocn.z);
		  oldLocn = getMarkerByLocId(newLocn.id);
		  //if(_debug) console.log("locn to change ",oldLocn);
		  //if(_debug) console.log("newLocn ",newLocn);
		  oldLocn.x = newLocn.x;
		  oldLocn.y = newLocn.y;
		  oldLocn.z = newLocn.z;
		  showSelectedMarkers();
	       }
	    }
	 }
      }

   }; // updatePlateDataCallback:

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
	 urlParams:"image="+currentImg,
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
         //if(_debug) console.log("updatePlateDataCallback returning: response null");
         return false;
      } else {
         //if(_debug) console.log(response);
      }
      
      url = webServer + "/" + response;
      //if(_debug) console.log("updatePlateDataCallback url ",url);

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
   var storeSubplateNames = function (plateData) {

      if(plateData === undefined || plateData === null) {
         return undefined;
      }

      var len;
      var len2;
      var plate;
      var i;
      var j;
      var name = "";
      var subplateNames = [];

      len = plateData.length;
      for(i=0; i<len; i++) {
         plate = plateData[i];
	 subplateNames[subplateNames.length] = plate.subplate;
	 if(plate.subplate == pointClickImgData.subplate) {
	    len2 = plate.images.length;
	    for(j=0; j<len2; j++) {
	       subplateImgNames[subplateImgNames.length] = plate.images[j].name;
	    }
	    break;
	 }
      }
      return subplateNames;
   };  // storeSubplateImgNames

   //---------------------------------------------------------------
   var getSubplateImgNames = function () {
      return subplateImgNames;
   };

   //---------------------------------------------------------------
   // Get data for every image on the specified plate (eg for plate 33a
   // get data for images 33aa & 33ab)
   //---------------------------------------------------------------
   var getSubplateData = function (plateData, subplate) {

      var len;
      var plate;
      var i;
      var name = "";
      var foundPlate = false;

      if(_debug) console.log("getSubplateData: plateData ",plateData);
      if(_debug) console.log("getSubplateData: subplate ",subplate);

      if(plateData === null || plateData === undefined || plateData.length <= 0) {
         return undefined;
      }

      if(SINGLE_PLATE) {
         return plateData[0].images;
      }

      len = plateData.length;
      for(i=0; i<len; i++) {
         plate = plateData[i];
         //if(_debug) console.log("getSubplateData: plate ",plate);
	 if(plate.subplate === subplate) {
	    foundPlate = true;
	    break;
         }
      }

      if(!foundPlate) {
         return undefined;
      }

      //console.log(plate);
      return plate.images;

   };  // getSubplateData

   //---------------------------------------------------------------
   var getSelectedRowKeys = function () {
      return selectedRowKeys;
   };

   //---------------------------------------------------------------
   var getPreviousMarkerKeys = function () {
      return previousMarkerKeys;
   };

   //---------------------------------------------------------------
   var getTempMarkerKeys = function () {
      return tempMarkerKeys;
   };

   //---------------------------------------------------------------
   var setMarkerTable = function () {

      var keys;
      var key;
      var descr;
      var table = $('pointClickTable');
      var tableBody = $('pointClickTableBody');
      var pointClickEntryId;
      var pointClickEntryDesc;
      var len;
      var i;

      keys = getSubplateKeys();
      len = keys.length;

      // make sure keys are in order of term identifier
      keys = utils.sortArrayNumerically(keys);

      for(i=0; i<len; i++) {
         key = keys[i];
	 //console.log("setMarkerTable key ", key);
	 //console.log(subplateMarkerDetails[key]);
         descr = subplateMarkerDetails[key].descr;
	    // set up the table
	    var row = new Element("tr", {
   	       'id': 'pointClickTableRow_' + key,
   	       'class': 'pointClickTableRow'
	    });
	    // Create a <td> element and a text node, make the text
	    // node the contents of the <td>, and put the <td> at
	    // the end of the table row
	    var id_cell = new Element("td", {
   	       'id': 'pointClickTableCell_id_' + key,
   	       'class': 'pointClickTableCell id'
	    });
            pointClickEntryId = new Element('div', {
   	       'id': 'pointClickEntryId_' + key,
      	       'class': 'pointClickEntryId',
   	       'text': key
            });
   
	    var desc_cell = new Element("td", {
   	       'id': 'pointClickTableCell_desc_' + key,
   	       'class': 'pointClickTableCell desc'
	    });
            pointClickEntryDesc = new Element('div', {
   	       'id': 'pointClickEntryDesc' + key,
      	       'class': 'pointClickEntryDesc',
   	       'text': descr
            });
   
	    id_cell.inject(row, 'inside');
	    pointClickEntryId.inject(id_cell, 'inside');

	    desc_cell.inject(row, 'inside');
	    pointClickEntryDesc.inject(desc_cell, 'inside');

	    row.inject(tableBody, 'inside');

	    var theRow = $('pointClickTableRow_' + key);

   	    // add event handlers.
	    utils.addEvent(theRow, 'mouseover', doMouseOverTableRow, false);
	    utils.addEvent(theRow, 'mouseout', doMouseOutTableRow, false);
	    //utils.addEvent(theRow, 'mousedown', doMouseDownTableRow, false);
	    utils.addEvent(theRow, 'mouseup', doMouseUpTableRow, false);
	    //utils.addEvent(theRow, 'click', doMouseUpTableRow, false); // for programmatic selection
      }

   }; // setMarkerTable

   //---------------------------------------------------------------
   // This stores the keys and terms for the images on the subplate
   //---------------------------------------------------------------
   var storeSubplateKeysAndTerms = function (subplateData) {

      var tempAllKeys = [];
      var tempImgKeys = [];
      var imgKeys = [];
      var tempTerms = [];
      var imageData;
      var locations;
      var locn;
      var term;
      var len;
      var len2;
      var len3;
      var i,j,k;

      len = subplateData.length;

      for(i=0; i<len; i++) {
	 /*
	 if(i === 0) {
	    console.log(subplateData);
	 }
	 */
         imageData = subplateData[i];
         //if(_debug) console.log(imageData);
	 locations = imageData.locations;
	 len2 = locations.length;
         for(j=0; j<len2; j++) {
	    locn = locations[j];
	    term = locn.term;
	    tempImgKeys[tempImgKeys.length] = term.name;
	    tempTerms[tempTerms.length] = term;
	 }
         //console.log(tempImgKeyArr);
	 len3 = tempImgKeys.length;
	 for(k=0; k<len3; k++) {
	    tempAllKeys.push(tempImgKeys[k]);
	 }

         imgKeys = utils.filterDuplicatesFromArray(tempImgKeys);
	 imgKeyArr[imgKeyArr.length] = imgKeys;
	 tempImgKeys = [];
      }
      //if(_debug) console.log("tempArr ",tempArr);
      // this function doesn't change the original so you need to assign it.
      subplateKeys = [];
      subplateKeys = utils.filterDuplicatesFromArray(tempAllKeys);
      if(_debug) {
	 len3 = imgKeyArr.length;
	 for(i=0; i<len3; i++) {
	    console.log(imgKeyArr[i]);
	 }
      }
      subplateTerms = [];
      subplateTerms = filterDuplicateTermDetails(tempTerms);

   }; // storeSubplateKeysAndTerms

   //---------------------------------------------------------------
   // this has a very sloppy test but it should be OK as there i
   //---------------------------------------------------------------
   var filterDuplicateTermDetails = function (arr) {

      var names = [];
      var objArr = [];
      var name;
      var i;

      for (i = 0 ; i < arr.length ; i++) {
	 name = arr[i].name;
	 if (names.indexOf(name) == -1) {
	    names.push(name);
	    objArr.push(arr[i]);
	 }
      }

      return objArr;
   };

   //---------------------------------------------------------------
   var getSubplateKeys = function (imageData) {
      return subplateKeys;
   };

   /*
   //---------------------------------------------------------------
   // This stores the terms for the images on the subplate
   //---------------------------------------------------------------
   var storeSubplateTerms = function (subplateData) {

      var tempArr = [];
      var imageData;
      var locations;
      var locn;
      var term;
      var len;
      var len2;
      var i,j;

      len = subplateData.length;

      for(i=0; i<len; i++) {
         imageData = subplateData[i];
         //if(_debug) console.log(imageData);
	 locations = imageData.locations;
	 len2 = locations.length;
         for(j=0; j<len2; j++) {
	    locn = locations[j];
	    term = locn.term;
	    tempArr[tempArr.length] = term.name;
	 }
      }
      //if(_debug) console.log("tempArr ",tempArr);
      // this function doesn't change the original so you need to assign it.
      subplateKeys = [];
      subplateKeys = utils.filterDuplicatesFromArray(tempArr);
      console.log("subplate keys: ",subplateKeys);
      //if(_debug) console.log("subplateKeys ",subplateKeys);
      // sort the keys numerically (they are strings)

   }; // storeSubplateTerms
   */

   //---------------------------------------------------------------
   // Stores the details for all the images on the subplate
   //---------------------------------------------------------------
   var storeSubplateDetails = function (subplateData) {

      var imageData;
      var imgLocations;
      var locn;
      var loc_id;
      var term;
      var keys;
      var key;
      var locdets;
      var flags;
      var flag;
      var x;
      var y;
      var z;
      var smallLabel;
      //var bigLabel;
      var len;
      var len2;
      var len3;
      var i,j,k;

      keys = getSubplateKeys();
      len = keys.length;
      len2 = subplateData.length;

      //if(_debug) console.log(subplateMarkerDetails);

      // for each key on the subplate
      // keys are unique per subplate and common to all the images on a subplate
      for(i=0; i<len; i++) {
         key = keys[i];
	 locdets = [];
	 flags = [];
	 subplateMarkerDetails[key] = {key:key, viz:false, flags:flags, locdets:locdets};
         // for each image in the subplate get the location details etc.
         for(j=0; j<len2; j++) {
	    imageData = subplateData[j];
	    //console.log(imageData);
	    imgLocations = imageData.locations;
	    len3 = imgLocations.length;
            // for each location on this image, store details for appropriate key.
            for(k=0; k<len3; k++) {
	       locn = imgLocations[k];
	       term = locn.term;
	       if(term.name ==  key) {
	          loc_id = locn.id;
	          x = locn.x;
	          y = locn.y;
	          z = locn.z;
		  //console.log("storeSubplateDetails: location %s x %s, y %s, z %s",term.name,x,y,z);
	          smallLabel = makeMarkerSmallLabel(term);
	          //bigLabel = makeMarkerBigLabel(term);
	          flag = makeMarkerFlag(term, flags.length);

		  /*
		  ontologyInfo = getOntologyInfo(term.externalRef.emap);
	          subplateMarkerDetails[key].EmapaId = ontologyInfo.emapa;
	          subplateMarkerDetails[key].stage = ontologyInfo.stage;

                  if(ontologyInfo.emapa != term.externalRef.emapa) {
		     console.log("ontologyInfo.emapa %s, term.externalRef.emapa %s",ontologyInfo.emapa,term.externalRef.emapa);
		  }
		  */

	          subplateMarkerDetails[key].EmapId = term.externalRef.emap;
	          subplateMarkerDetails[key].EmapaId = term.externalRef.emapa;

	          subplateMarkerDetails[key].descr = term.description;
	          subplateMarkerDetails[key].smallLabel = smallLabel;
	          //subplateMarkerDetails[key].bigLabel = bigLabel;
	          subplateMarkerDetails[key].flags[flags.length] = flag;
	          subplateMarkerDetails[key].locdets[locdets.length] = {img:imageData.name, loc_id:loc_id, x:x, y:y, z:z};
	       }
	    }
	 }
      }
     //if(_debug) console.log(subplateMarkerDetails);
   }; // storeSubplateDetails

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
   var getEmapaForKeys = function (keys, database) {

      var markerDetails;
      var arr = [];
      var len;
      var jsonArr;
      var i;

      len = keys.length;
      for(i=0; i<len; i++) {
         //console.log("getEmapIdForKey subplateMarkerDetails ",subplateMarkerDetails);
         markerDetails = subplateMarkerDetails[keys[i]];
         arr[i] = markerDetails.EmapId;
      }


      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonArr = JSON.stringify(arr);
      } else {
         jsonArr = emouseatlas.JSON.stringify(arr);
      }
      if(!jsonArr) {
         return false;
      }
      //console.log("getEmapaForKeys: ",jsonArr);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      url = '/ontologywebapp/GetEMAPA';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"emap_ids=" + jsonArr + "&cbf=doTableQuery" + "&db=" + database,
	 callback:getEmapaForKeysCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getEmapaForKeys

   //---------------------------------------------------------------
   var getEmapaForKeysCallback = function (response, urlParams) {

      var json;
      var params;
      var len;
      var callback;
      var database;
      var arr;

      json = JSON.parse(response);

      params = urlParams.split("&");

      callback = (params[1].split("="))[1];
      database = (params[2].split("="))[1];
      
      switch (callback) {
         case "doTableQuery":
	    doTableQuery2(json, database);
	    break;
	 default:
	    return;
      }

   }; // getEmapaForKeysCallback

   //---------------------------------------------------------------
   var makeMarkerFlag = function (term, num) {

      //if(_debug) console.log("enter makeMarkerFlag ",term,num);
      var container = $(markerContainerId);
      var name = term.name;
      var strlen;
      var map;
      var usemap;
      var mapArea;
      var klass;

      strlen = name.length;
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
            'id': 'markerImgDiv_' + name + "_" + num,
            'class': 'markerImgDiv'
      });

      var src = srcClosest;
      var markerImg = new Element('img', {
            'id': 'markerImg_' + name + "_" + num,
            'class': 'markerImg',
	    'src': src
      });

      mapArea = new Element('area', {
            'id': 'markerImgMapArea_' + name + "_" + num,
            'name': 'markerImgMapArea_' + name + "_" + num,
	    'shape': 'polygon',
	    'coords': '10,0,13,1,15,3,17,5,19,8,19,14,17,16,15,18,13,22,12,25,11,28,10,34,9,28,8,25,7,22,5,18,3,16,1,14,1,8,3,5,5,3,7,1,10,0'
      });

      map = new Element('map', {
            'id': 'markerImgMap_' + name + "_" + num,
            'name': 'markerImgMap_' + name + "_" + num,
      });

      var markerTxtDiv = new Element('div', {
            'id': 'markerTxtDiv_' + name + "_" + num,
            'class': klass
      });
      markerTxtDiv.set('text', name);


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
   var makeMarkerSmallLabel = function (term) {

      //if(_debug) console.log("makeMarkerSmallLabel ",term);
      var container = $(markerContainerId);
      var name = term.name;
      var descr = term.description;
      var markerLabelDiv = new Element('div', {
            'id': 'markerLabelDiv_' + name,
            'class': 'markerLabelDiv'
      });
      markerLabelDiv.set('text', descr);
      markerLabelDiv.inject(container, 'inside');

      return markerLabelDiv;
   };

   //---------------------------------------------------------------
   // There may be multiple markers associated with a key
   //---------------------------------------------------------------
   var setMarkerSrc = function (key, src) {

      var markerNode;
      var flagDivs;
      var len;
      var flagDiv;
      var flag;
      var i;

      if(_debug) console.log("enter setMarkerSrc");
      if(key === undefined || key === null || key === "") {
         return false;
      }

      //console.log("setMarkerSrc: key %s, src %s",key, src);

      markerNode = subplateMarkerDetails[key];
      flagDivs = markerNode.flags;
      len = flagDivs.length;
      //if(_debug) console.log(markerNode);
      src = (src === undefined) ? srcClosest : src;
      for(i=0; i<len; i++) {
         flagDiv = flagDivs[i];
	 flag = flagDiv.firstChild;
         flag.set('src', src);
      }
      if(_debug) console.log("exit setMarkerSrc");
   };

   //---------------------------------------------------------------
   var doMouseOverMarker = function (e) {

      //console.log("doMouseOverMarker");
      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var key;

      key = getKeyFromStr(target.id, true);
      //console.log("doMouseOverMarker: target %s, key %s",target.id, key);

      setMarkerSrc(key, srcHighlighted);
      displayMarkerLabel(key, true);
      positionMarkerLabel(e, key, true);
      highlightRow(key);
      //allowClosestMarkers = false;
   };

   //---------------------------------------------------------------
   var doMouseOutMarker = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var key;
      var row;

      key = getKeyFromStr(target.id, true);

      allowClosestMarkers = true;

      if(keyPresent(key, true, "doMouseOutMarker")) {
         setMarkerSrc(key, srcSelected);
         row = getRowWithKey(key);
         row.className = 'pointClickTableRow selected';
      } else {
	 if(ALLOW_CLOSEST_MARKERS) {
            //setMarkerSrc(key, srcClosest);
	 }
      }
      hideMarkerLabel(key, true);
      clearRowHighlight();
   };

   //---------------------------------------------------------------
   var doMouseUpMarker = function (e) {

      var target;
      var key;
      var mouseButtons;

      mouseButtons = utils.whichMouseButtons(e);
      //console.log("mouse up: mouse Buttons ", mouseButtons);
      if(mouseButtons.right) {
         return false;
      }

      target = utils.getTarget(e);

      key = getKeyFromStr(target.id, true);
      //console.log("doMouseUpMarker previousOpenMarker -->%s<-- key -->%s<--",previousOpenMarker,key);

      SHOWING_ALL_MARKERS = false;

      selectThisTerm(key);

      if(previousOpenMarker == undefined) {
         displayMarkerLabel(key, false);
         positionMarkerLabel(e, key, false);
	 previousOpenMarker = key;
	 return false;
      }

      if(key == previousOpenMarker) {
         hideMarkerLabel(key, false);
	 previousOpenMarker = undefined;
      } else {
         hideMarkerLabel(previousOpenMarker, false);
         displayMarkerLabel(key, false);
         positionMarkerLabel(e, key, false);
	 previousOpenMarker = key;
      }

      return false;

   };

   //---------------------------------------------------------------
   var selectThisTerm = function (key) {

      var trgtId;
      var row = undefined;
      var popup;
      var viz;

      if(!key) {
         return false;
      }

      trgtId = "pointClickTableRow_" + key;
      row = document.getElementById(trgtId);

      len = selectedRowKeys.length;
      //................................................................
      // If there are no previously selected rows, select it.
      if(len === 0) {
	 row.className = "pointClickTableRow selected";
	 setMarkerSrc(key, srcSelected);
	 displayMarker(key);
	 positionMarker(key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	 selectedRowKeys = utils.duplicateArray(tmpArr);
	 previousSelectedRow = (previousSelectedRow === undefined) ? key : latestSelectedRow;
	 latestSelectedRow = key;
	 listSelectedTerms("selectThisTerm, no others selected");
	 return false;
      }
      //................................................................
      // If this is the only previously selected row and there are no modifiers,
      // de-select it if the popup is visible, otherwise leave it alone
      // The popup visibility is before the marker click.
      if(len === 1 && selectedRowKeys[0] === key) {
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
	 if(keyPresent(key,true,"selectThisTerm")) {
	    //removeKey(key,true);
	    //row.className = "pointClickTableRow";
            ////setMarkerSrc(key, srcHighlighted);
	    // remove the key for this marker from the list of selected markers
	 } else {
	    row.className = "pointClickTableRow selected";
	    setMarkerSrc(key, srcSelected);
	    // add the key for this marker to the list of selected markers
	    selectedRowKeys[selectedRowKeys.length] = key;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	    selectedRowKeys = utils.duplicateArray(tmpArr);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = key;
	 }
	 listSelectedTerms("selectThisTerm, others already selected");
	 displayMarker(key);
	 positionMarker(key);
	 return false;
      }

   }; // selectThisTerm

   //---------------------------------------------------------------
   // from right-click menu on anatomy terms in list / table at RHS
   //---------------------------------------------------------------
   var doTableQuery = function (database) {

      var keys;

      //console.log("doTableQuery");
      keys = getSelectedRowKeys();
      //console.log(keys);
      if(keys === undefined || keys === null || keys.length === 0) {
         return false;
      }

      getEmapaForKeys(keys, database)

   }; // doTableQuery

   //--------------------------------------------------------------------
   // we need to get emapa + stage from mouse011 on the fly so we have to 
   // come here after the ajax call
   //--------------------------------------------------------------------
   var doTableQuery2 = function (queryData, database) {

      var dbLC;
      var keys;
      var len;
      var i;
      var comma;
      var queryStr; // a comma separated list of emapa ids followed by stage
      var EMAGE = "emage";
      var MGI = "mgi";
      var url;
      var stage;
      var emaps;

      //console.log("doTableQuery2: queryData ",queryData);
      //console.log("database ",database);

      len = queryData.length;
      // the last element of queryData is stage
      if(len <= 1) {
         alert("Sorry:  there were no selected terms with an EMAP id");
	 return false;
      }

      // the last element of queryData is stage
      if(len > 2 &&  database.toLowerCase() === MGI) {
         //alert("MGI / GXD will only accept one search term: using term #" + queryData[0].key + " with EMAP id + " + queryData[0].id);
	 pointClickChanges.mgiChoice = true;
	 notify("doTableQuery MGI");
	 return;
      }

      queryStr = "";
      //console.log("queryStr %s",queryStr);

      //console.log(queryIds);
      dbLC = database.toLowerCase();

      switch(dbLC) {
         case EMAGE:
            for(i=0; i<len-1; i++) {
               comma = (i===0) ? "" : ",";
               queryStr = queryStr + comma + queryData[i];
            }
            queryStr = queryStr + "&stages=" + stage;
            url = emageUrl + queryStr + '&exactmatchstructures=true&includestructuresynonyms=true'; 
	    break;
         case MGI:
            //queryStr = queryStr + comma + queryData[i];
	    emaps = queryData[0].replace("EMAPA", "EMAPS");
	    stage = queryData[1].replace("TS", "");
            url = mgiUrl + emaps + stage;
	    break;
	 default:
	    break;
      }

      //console.log("database %s, url %s",database,url);
      window.open(url);

   }; // doTableQuery2

   //---------------------------------------------------------------
   var doTableLink = function (trgt) {
      //console.log("doTableLink %s",trgt);

      var plate;
      var subplate;
      var reg;
      var infoDetails;
      var stage;
      var stageArr = [];
      var key;
      var multiple;
      var len;
      var i;
      var trgtLC;
      var EMAP = "emap";
      var EMAPA = "emapa";
      var WIKI = "wiki";
      var ELSEVIER = "elsevier";
      var url;
      var found = false;

      //console.log("doTableLink %s",trgt);
      trgtLC = trgt.toLowerCase();

      plate = pointClickImgData.plate;
      subplate = pointClickImgData.subplate;
      //console.log("%s, %s",plate, subplate);

      len = titleInfo.length;
      for(i=0; i<len; i++) {
	 if(titleInfo[i].plate === subplate) {
	    infoDetails = titleInfo[i];
	    found = true;
	    break;
	 }
      }
      if(found) {
         stage = infoDetails.stage;
      } else {
         return false;
      }

      // some plates span stages, we just use the earliest.
      stageArr = utils.extractNumbersFromString(stage, "doTableLink");
      //console.log(stage);
      //console.log(stageArr);

      // deal with the fact that plate 03 covers 2 embryos
      if(subplate === "03") {
         reg = /03[a-e]/;
         if(currentImg.match(reg)) {
            //console.log("First Embryo");
	    stage = stageArr[0];
	 } else {
            //console.log("Second or third Embryo");
	    stage = stageArr[1];
	 }
      } else {
	 stage = stageArr[0];
      }

      multiple = (selectedRowKeys.length > 1) ? true : false;

      switch(trgtLC) {
         case EMAP:
            url = stagedOntologyUrl + stage;
	    break;
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
      var key;

      target = utils.getTarget(e);
      key = getKeyFromStr(target.id, false);

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
      var key;

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
      key = highlighted.key;
      setMarkerSrc(key, srcHighlighted);
      displayMarker(key);
      positionMarker(key);
      lastHighlightedKey = key;
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
      var key;
      var ref;
      var desc;
      var tKlass = target.className;
      var pKlass = prnt.className;
      var gKlass = gprnt.className;
      var newKlass = 'pointClickTableRow';
      var highlighted;

      if(CONTEXT_MENU) {
         return false;
      }

      if(prnt.hasClass('pointClickTableRow')) {
         row = prnt;
      } else if(gprnt.hasClass('pointClickTableRow')) {
         row = gprnt;
      }

      children = row.childNodes;
      len = children.length;
      for(i=0; i<len; i++) {
         child = children[i];
         gchild = child.firstChild;
         //if(_debug) console.log("grandchild ", gchild.get('text'), gchild.className);
         if(gchild.className === "pointClickEntryId") {
            key = gchild.get('text');
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
      if(keyPresent(key, false, "doMouseOutRow")) {
         setMarkerSrc(key, srcClosest);
      }
      if(keyPresent(key, true, "doMouseOutRow")) {
         setMarkerSrc(key, srcSelected);
      }
      if(!keyPresent(key, true, "doMouseOutRow") && !keyPresent(key, false, "doMouseOutRow")) {
         setMarkerSrc(key, srcClosest);
         hideMarker(key, false);
      }

      // make sure selected rows are shown in table
      if(keyPresent(key, true, "doMouseOutRow")) {
	 row.className = 'pointClickTableRow selected';
         setMarkerSrc(key, srcSelected);
      } else {
         //console.log("doMouseOutRow %d",key);
         row.className = 'pointClickTableRow';
      }
   }; // doMouseOutRow

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
      var key;
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

      if(e.type === "click") {
	 target = emouseatlas.emap.utilities.getTarget(e);
         //console.log("target from click ",target);
      } else {
	 target = emouseatlas.emap.utilities.getTarget(e);
         //console.log("target from mouseup ",target);
      }

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

      SHOWING_ALL_MARKERS = false;

      children = row.childNodes;
      len = children.length;
      for(i=0; i<len; i++) {
         child = children[i];
         gchild = child.firstChild;
         //if(_debug) console.log("grandchild ", gchild.get('text'), gchild.className);
         if(gchild.className === "pointClickEntryId") {
            key = gchild.get('text');
         }
         if(gchild.className === "pointClickEntryRef") {
            ref = gchild.get('text');
         }
         if(gchild.className === "pointClickEntryDesc") {
            desc = gchild.get('text');
         }
      }
      //if(_debug) console.log("key %s, ref %s, desc %s", key,ref,desc);

      if(latestSelectedRow === undefined) {
         //console.log("doMouseUpTableRow: selected row %s, previously selectedRows ",key,selectedRowKeys);
      } else {
         //console.log("doMouseUpTableRow: lastSelected row %s, selected row %s, previously selectedRows ",latestSelectedRow,key,selectedRowKeys);
      }

      mouseButtons = utils.whichMouseButtons(e);
      //console.log("mouse up: mouse Buttons ", mouseButtons);
      modifierKeys = utils.whichModifierKeys(e);
      //console.log("modifier keys ", modifierKeys);
      NO_MODIFIERS = (!modifierKeys.shift && !modifierKeys.ctrl && !modifierKeys.alt && !modifierKeys.meta) ? true : false;

      len = selectedRowKeys.length;
      //console.log("selectedRowKeys ",selectedRowKeys);

      latestClickedRow = key;

      //................................................................
      // If the R mouse button was used:
      //................................................................
      if(mouseButtons.right) {
	 //................................................................
	 // and there were previously selected rows, and this isn't one of them,
	 // select this one and de-select the rest.
	 //................................................................
	 if(len > 0) {
	    if(utils.arrayContains(selectedRowKeys, key)) {
	       // use all context selected terms
               //console.log(selectedRowKeys);
	       return true;
	    } else {
	       // use only the newly selected term
	       doHideAllMarkers(null);
	       row.className = "pointClickTableRow selected";
	       setMarkerSrc(key, srcSelected);
	       displayMarker(key);
	       positionMarker(key);
	       // add the key for this marker to the list of selected markers
	       selectedRowKeys[selectedRowKeys.length] = key;
	       tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	       selectedRowKeys = utils.duplicateArray(tmpArr);
	       previousSelectedRow = latestSelectedRow;
	       latestSelectedRow = key;
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
	 setMarkerSrc(key, srcSelected);
	 displayMarker(key);
	 positionMarker(key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	 selectedRowKeys = utils.duplicateArray(tmpArr);
	 previousSelectedRow = latestSelectedRow;
	 latestSelectedRow = key;
	 listSelectedTerms("mouseUpTableRow, no others selected");
	 return false;
      }
      //................................................................
      // If this is the only previously selected row and there are no modifiers, de-select it.
      if(len === 1 && NO_MODIFIERS && latestSelectedRow === key) {
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
	 setMarkerSrc(key, srcSelected);
	 displayMarker(key);
	 positionMarker(key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	 selectedRowKeys = utils.duplicateArray(tmpArr);
	 previousSelectedRow = latestSelectedRow;
	 latestSelectedRow = key;
	 listSelectedTerms("mouseUpTableRow, others selected, no modifiers");
	 return false;
      }
      //................................................................
      // If there are previously selected row(s) and ctrl is pressed ...
      // select if not selected, otherwise de-select
      if(len > 0 && modifierKeys.ctrl && !modifierKeys.shift) {
	 len = selectedRowKeys.length;
	 for(i=0; i<len; i++) {
	    markerNode = subplateMarkerDetails[selectedRowKeys[i]];
	    // if the item is already selected, de-select it.
	    if(key === markerNode.key) {
	       found = true;
	       break;
	    }
	 }
	 if(!found) {
	    row.className = "pointClickTableRow selected";
	    setMarkerSrc(key, srcSelected);
	    displayMarker(key);
	    positionMarker(key);
	    // add the key for this marker to the list of selected markers
	    selectedRowKeys[selectedRowKeys.length] = key;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	    selectedRowKeys = utils.duplicateArray(tmpArr);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = selectedRowKeys[selectedRowKeys.length - 1];
	 } else {
	    row.className = "pointClickTableRow";
	    // and hide the marker
	    hideMarker(markerNode.key, false);
	    removeKey(key, true);
	    previousSelectedRow = latestSelectedRow;
	    latestSelectedRow = key;
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
	    setMarkerSrc(key, srcSelected);
	    displayMarker(key);
	    positionMarker(key);
	    // add the key for this marker to the list of selected markers
	    selectedRowKeys[selectedRowKeys.length] = key;
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	    selectedRowKeys = utils.duplicateArray(tmpArr);
	 } else {
	    back = false;
	    doHideAllMarkers(modifierKeys);
	    iLast = parseInt(latestSelectedRow);
	    iThis = parseInt(key);
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
	       setMarkerSrc(indx1, srcSelected);
	       displayMarker(indx1);
	       positionMarker(indx1);
	       // add the key for this marker to the list of selected markers
	       selectedRowKeys[selectedRowKeys.length] = indx1 + ""; // keys are strings
	    }
	    tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
	    selectedRowKeys = utils.duplicateArray(tmpArr);
	 }
	 previousSelectedRow = latestSelectedRow;
	 klen = selectedRowKeys.length;
	 if(back) {
	    latestSelectedRow = selectedRowKeys[0];
	 } else {
	    latestSelectedRow = selectedRowKeys[klen-1];
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
      selectedRowKeys = [];

      for(i=0; i<len; i++) {
         rowArr[i].className = newKlass;
      }
   };

   //---------------------------------------------------------------
   var highlightRow = function (key) {

      var key;
      var entryIdArr = $$('.pointClickEntryId');
      var entryId;
      var txt;
      var row;
      var len = entryIdArr.length;
      var i;
      var newKlass = 'pointClickTableRow over';

      for(i=0; i<len; i++) {
         entryId = entryIdArr[i];
	 txt = entryId.get('text');
	 if(txt == key) {
	   row = entryId.parentNode.parentNode;
           //if(!row.hasClass('selected')) {
              row.className = newKlass;
	   //}
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
         if(row.hasClass('over')) {
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
	 //if(_debug) console.log("returning ",ret);
      } else {
	 //if(_debug) console.log("no selected item");
      }

      return ret;

   }; //getHighlightedTableItem

   //---------------------------------------------------------------
   // Returns the row having the specified key
   //---------------------------------------------------------------
   var getRowWithKey = function (key) {

      var rowArr = $$('.pointClickTableRow');
      var len = rowArr.length;
      var row;
      var i;
      var index;
      var rkey;
      var found = false;

      for(i=0; i<len; i++) {
         row = rowArr[i];
	 indx = row.id.lastIndexOf("_");
	 indx = indx + 1*1;
	 rkey = row.id.substring(indx);
         if(rkey == key) { 
            //if(_debug) console.log("got row with key %s",rkey,row);
            break;
         }
      }

      return row;

   }; //getRowWithKey

   //---------------------------------------------------------------
   var keyPresent = function (testKey, markers, from) {

      var keys
      var key;
      var len = selectedRowKeys.length;
      var i;

      keys = markers ? selectedRowKeys : tempMarkerKeys;
      len = keys.length;

      //console.log("keyPresent from %s, testKey %s, markers %s",from,testKey,markers);

      if(testKey === undefined) {
         return false;
      }

      for(i=0; i<len; i++) {
         key = keys[i];
	 if(key == testKey) {
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
      len = selectedRowKeys.length;

      for(i=0; i<len; i++) {
         keys[keys.length] = selectedRowKeys[i];
      }

   };

   //---------------------------------------------------------------
   var removeKey = function (testKey, fromSelectedMarkers) {

      var ret = [];
      var keys
      var key;
      var len = selectedRowKeys.length;
      var i;

      keys = fromSelectedMarkers ? selectedRowKeys : tempMarkerKeys;
      len = keys.length;

      if(testKey === undefined) {
         return false;
      }

      for(i=0; i<len; i++) {
         key = keys[i];
	 if(key == testKey) {
	    ret = keys.splice(i,1);
	 }
      }
      return ret;
   };

   //---------------------------------------------------------------
   var hideTempMarkers = function () {

      var markerNode;
      var len = tempMarkerKeys.length;
      var i;
      var key;

      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 if(!keyPresent(key, true, "hideTempMarkers")) {
	    hideMarker(key);
	 }
      }
   };

   //---------------------------------------------------------------
   var showTempMarkers = function () {

      var markerNode;
      var len = tempMarkerKeys.length;
      var i;
      var key;

      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 if(!keyPresent(key, true, "showTempMarkers")) {
	    setMarkerSrc(key, srcClosest);
	    displayMarker(key);
	    positionMarker(key);
	 }
      }
   };

   //---------------------------------------------------------------
   // Finds the true closest marker to given point
   //  We do this with integer arithmetic
   //---------------------------------------------------------------
   var findClosestMarkersToPoint = function (point) {
      
      var keys;
      var key;
      var markerNode;
      var locations;
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

      keys = getSubplateKeys();
      len = keys.length;

      //if(_debug) console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
         markerNode = subplateMarkerDetails[key];
         //if(_debug) console.log("markerNode ",markerNode);
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       if(_debug) console.log("different image %d, %d",i,j);
	       continue;
	    }
	    if(locn.x === "0" && locn.y === "0" && locn.z === "0") {
	       continue;
	    }
	    imx = Math.round(locn.x);
	    imy = Math.round(locn.y);

	    diffX = (imx - ipx);
	    diffY = (imy - ipy);
	    dist = Math.sqrt(diffX * diffX + diffY * diffY);
	    if(_debug) console.log("dist ",dist);
	    dist = Math.round(dist);
	    tmpArr[tmpArr.length] = {key:key, dist:dist};
	 }
      }

      if(tmpArr.length <= 0) {
         return false;
      }

      // sort the markers by closest
      tmpArr.sort(function(A,B) {
	       return(A.dist-B.dist);
            });
      for(i=0; i<maxCloseMarkersToShow; i++) {
	 if(tmpArr[i]) {
            tempMarkerKeys[tempMarkerKeys.length] = tmpArr[i].key;
	 }
      }
      tmpArr = [];
      tmpArr = utils.filterDuplicatesFromArray(tempMarkerKeys);
      tempMarkerKeys = utils.duplicateArray(tmpArr);
      //if(_debug) console.log("findClosestMarkers: tempMarkerKeys ",tempMarkerKeys);

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

      //.................................................
      var pointClickTableDiv = $('pointClickTableDiv');
      var EDITOR = model.isEditor();

      //----------------------------------------
      // container for the Table of entries
      //----------------------------------------
      var pointClickTableContainer = new Element('div', {
         'id': 'pointClickTableContainer'
      });

      // put the pointClickTableContainer in the pointClickTableDiv
      pointClickTableContainer.inject(pointClickTableDiv, 'inside');

      //----------------------------------------
      // the table
      //----------------------------------------
      // creates a <table> element and a <tbody> element
      var pointClickTable = new Element("table", {
         'id': 'pointClickTable',
	 'border': '2'
      });

      var pointClickTableBody = new Element("tbody", {
         'id': 'pointClickTableBody'
      });

      // put the <tbody> in the <table>
      pointClickTableBody.inject(pointClickTable, 'inside');
      pointClickTable.inject(pointClickTableContainer, 'inside');

      //----------------------------------------
      // the bottom bit
      //----------------------------------------
      var pointClickBottomBit

      pointClickBottomBit = new Element('div', {
         'id': 'pointClickBottomBit'
      });
      pointClickBottomBit.inject(pointClickTableDiv, 'inside');

      //----------------------------------------
      // the button container
      //----------------------------------------
      var pointClickButtonContainer;
      var klass = EDITOR ? 'editor' : '';

      pointClickButtonContainer = new Element('div', {
         'id': 'pointClickButtonContainer',
	 'class': klass
      });
      pointClickButtonContainer.inject(pointClickBottomBit, 'inside');

      //----------------------------------------
      // the buttons
      //----------------------------------------
      var pointClickShowAllButton;

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
      var pointClickHideAllButton;

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

      //----------------------------------------
      // the checkbox container
      //----------------------------------------
      var pointClickChkbxContainer;
      //var klass = EDITOR ? 'editor' : '';

      pointClickChkbxContainer = new Element('div', {
         'id': 'pointClickChkbxContainer',
	 'class': klass
      });
      pointClickChkbxContainer.inject(pointClickBottomBit, 'inside');

      //----------------------------------------
      // the checkboxes
      //----------------------------------------
      if(!EDITOR) {
	 var pointClickShowClosestDiv;
	 var pointClickShowClosestChkbx;
	 var pointClickShowClosestLabel;

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
      }

      var pointClickShowTxtDiv;
      var pointClickShowTxtChkbx;
      var pointClickShowTxtLabel;

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

      if(EDITOR) {
	 var viewerDiv = $("emapIIPViewerDiv");
         viewerDiv.set('class', 'pointClick editor');
         pointClickTableDiv.set('class', 'editor');
         pointClickTableContainer.set('class', 'editor');
         pointClickBottomBit.set('class', 'editor');
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
	 var pointClickSaveSelectedButton;

	 pointClickSaveSelectedButton = new Element('div', {
	    'id': 'pointClickSaveSelectedButton',
	    'class': 'pointClickEntryButton'
	 });
	 pointClickSaveSelectedButtonText = new Element('div', {
	    'id': 'pointClickSaveSelectedButtonText',
	    'class': 'pointClickEntryButtonText'
	 });
	 pointClickSaveSelectedButton.inject(pointClickEditorButtonContainer, 'inside');
	 pointClickSaveSelectedButtonText.inject(pointClickSaveSelectedButton, 'inside');
	 pointClickSaveSelectedButtonText.set('text', 'Save Markers');

	 //.................
	 var pointClickResetSelectedButton;

	 pointClickResetSelectedButton = new Element('div', {
	    'id': 'pointClickResetSelectedButton',
	    'class': 'pointClickEntryButton'
	 });
	 pointClickResetSelectedButtonText = new Element('div', {
	    'id': 'pointClickResetSelectedButtonText',
	    'class': 'pointClickEntryButtonText'
	 });
	 pointClickResetSelectedButton.inject(pointClickEditorButtonContainer, 'inside');
	 pointClickResetSelectedButtonText.inject(pointClickResetSelectedButton, 'inside');
	 pointClickResetSelectedButtonText.set('text', 'Reset Markers');

	 //.................
	 var pointClickEditLocationButton;

	 pointClickEditLocationButton = new Element('div', {
	    'id': 'pointClickEditLocationButton',
	    'class': 'pointClickEntryButton'
	 });
	 pointClickEditLocationButtonText = new Element('div', {
	    'id': 'pointClickEditLocationButtonText',
	    'class': 'pointClickEntryButtonText'
	 });
	 pointClickEditLocationButton.inject(pointClickEditorButtonContainer, 'inside');
	 pointClickEditLocationButtonText.inject(pointClickEditLocationButton, 'inside');
	 pointClickEditLocationButtonText.set('text', 'Edit Location');


         //utils.addButtonStyle('pointClickSaveAllButton');
         utils.addButtonStyle('pointClickSaveSelectedButton');
         utils.addButtonStyle('pointClickResetSelectedButton');
         utils.addButtonStyle('pointClickEditLocationButton');

	 pointClickEditorButtonContainer.inject(pointClickBottomBit, 'inside');

         utils.addEvent(pointClickSaveSelectedButton, 'mouseup', doSaveSelectedMarkers, false);
         utils.addEvent(pointClickResetSelectedButton, 'mouseup', doResetSelectedMarkers, false);
         utils.addEvent(pointClickEditLocationButton, 'mouseup', doEditLocation, false);

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
   var getMarkerKeysForCurrentImg = function () {

      var keys;
      var imgKeys;
      var indx;
      var found = false;
      var len;
      var i;

      len = subplateImgNames.length;

      for(i=0; i<len; i++) {
         if(subplateImgNames[i].toLowerCase() === currentImg.toLowerCase()) {
	    indx = i;
	    found = true;
	    break;
	 }
      }

      if(!found) {
         console.log("not found");
         return false;
      }

      if(indx >= (imgKeyArr.length)) {
         console.log("indx too high");
         return false;
      }

      return imgKeyArr[indx];
   };
   
   //---------------------------------------------------------------
   var doAllowClosestMarkers = function (e) {

      var chkbx = $('pointClickShowClosestChkbx');
      var wasChecked = chkbx.checked;
      //if(_debug) console.log("doAllowClosestMarkers wasChecked %s",wasChecked);

      if(wasChecked) {
         ALLOW_CLOSEST_MARKERS = false;
	 hideTempMarkers(false);
	 tempMarkerKeys = [];
      } else {
         ALLOW_CLOSEST_MARKERS = true;
      }
   };

   //---------------------------------------------------------------
   var hideAllMarkerTxt = function () {

      var len;
      var i;
      var key;

      if(selectedRowKeys) {
         len = selectedRowKeys.length;
      } else {
         return false;
      }

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 hideMarkerTxt(key);
      }

      len = tempMarkerKeys.length;
      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 hideMarkerTxt(key);
      }
   };

   //---------------------------------------------------------------
   var showAllMarkerTxt = function () {

      var len;
      var i;
      var key;

      if(selectedRowKeys) {
         len = selectedRowKeys.length;
      } else {
         return false;
      }

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 displayMarkerTxt(key);
	 //positionMarkerTxt(key);
      }

      len = tempMarkerKeys.length;
      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 displayMarkerTxt(key);
	 //positionMarkerTxt(key);
      }
   };
   
   //---------------------------------------------------------------
   // Show marker text
   //---------------------------------------------------------------
   var doShowMarkerText = function (e) {

      var chkbx = $('pointClickShowTxtChkbx');
      var wasChecked = chkbx.checked;

      if(wasChecked) {
         SHOW_MARKER_TXT = false;
	 hideAllMarkerTxt();
      } else {
         SHOW_MARKER_TXT = true;
	 showAllMarkerTxt();
      }
   };
   
   //---------------------------------------------------------------
   // Show selected markers (without labels)
   //---------------------------------------------------------------
   var showSelectedMarkers = function () {

      var key;
      var markerNode;
      var locations;
      var locn;
      var len;
      var len2;
      var i;
      var j;
      var row;

      len = selectedRowKeys.length;

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 row = getRowWithKey(key);
         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       //console.log("showSelectedMarkers: wrong image");
	       continue;
	    }
	    setMarkerSrc(key, srcSelected);
	    displayMarker(key);
	    positionMarker(key);
	 }
      }
   };
   
   //---------------------------------------------------------------
   // Show all markers (without labels)
   //---------------------------------------------------------------
   var showAllMarkers = function (e) {

      var keys = undefined;
      
      selectedRowKeys = [];

      if(_debug) console.log("enter showAllMarkers");

      keys = getMarkerKeysForCurrentImg();
      selectedRowKeys = keys;
      latestSelectedRow = selectedRowKeys[selectedRowKeys.length - 1];
      //console.log(keys);
      showTheseMarkers(keys);
      SHOWING_ALL_MARKERS = true;

      pointClickChanges.showAll = true;
      notify("showAllMarkers");

      if(_debug) console.log("exit showAllMarkers");
   }; // showAllMarkers
   
   //---------------------------------------------------------------
   // Show URL specified markers (without labels)
   //---------------------------------------------------------------
   var showUrlSpecifiedMarkers = function () {

      var urlSpecified;
      var compArr = undefined;
      var selectedRowKeys = [];
      var len;
      var i;

      if(_debug) console.log("enter showUrlSpecifiedMarkers");

      urlSpecified = model.getUrlSpecifiedParams();
      if(urlSpecified.comps !== undefined) {
         compArr = urlSpecified.comps.split(",");
	 if(compArr !== undefined && compArr !== null && compArr[0] !== "") {
	    selectedRowKeys = compArr;
            showTheseMarkers(compArr);
	 }
	 len = compArr.length;
	 for(i=0; i<len; i++) {
	    selectedRowKeys[selectedRowKeys.length] = parseInt(compArr[i]);
	 }
	 latestSelectedRow = selectedRowKeys[selectedRowKeys.length -1];
         previousSelectedRow = latestSelectedRow;
      }

   }; // showUrlSpecifiedMarkers
   
   //---------------------------------------------------------------
   // Show these markers (without labels)
   //---------------------------------------------------------------
   var showTheseMarkers = function (keys) {

      var key;
      var markerNode;
      var locations;
      var locn;
      var len;
      var len2;
      var i;
      var j;
      var row;
      var tmpArr = [];

      if(_debug) console.log("enter showTheseMarkers");

      if(keys === undefined || keys.length <= 0) {
         return;
      }

      selectedRowKeys = [];
      tempMarkerKeys = [];

      len = keys.length;

      //if(_debug) console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
	 row = getRowWithKey(key);
	 row.className = 'pointClickTableRow selected';
	 //console.log("key %s, row ",key,row);

         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       //if(_debug) console.log("different image %d, %d",i,j);
	       //continue;
	    }
	    if(locn.x === "0" && locn.y === "0" && locn.z === "0") {
	       continue;
	    }

	    selectedRowKeys[selectedRowKeys.length] = key;
	 }
      }
      tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
      selectedRowKeys = utils.duplicateArray(tmpArr);
      //if(_debug) console.log("selectedRowKeys after removing duplicates ",selectedRowKeys);

      showSelectedMarkers();
      listSelectedTerms("showTheseMarkers" + keys);

      if(_debug) console.log("exit showTheseMarkers");
   }; // showTheseMarkers
   
   //---------------------------------------------------------------
   // Re-position all markers after a scale change
   //---------------------------------------------------------------
   var updateMarkerPositions = function () {

      var key;
      var markerNode;
      var len = selectedRowKeys.length;
      var i;

      for (i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 positionMarker(key);
	 positionMarkerLabelByKey(key, undefined);
      }
      len = tempMarkerKeys.length;
      for (i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 positionMarker(key);
	 positionMarkerLabelByKey(key, undefined);
      }
   };
   
   //---------------------------------------------------------------
   // There may be multiple markers asociated with a key
   //---------------------------------------------------------------
   var displayMarker = function (key) {

      var markerNode;
      var locdets;
      var subplate;
      var flags;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }
      if(_debug) console.log("displayMarker key %s, currentImg",key,currentImg);

      markerNode = subplateMarkerDetails[key];
      locdets = markerNode.locdets;
      flags = markerNode.flags;
      len = locdets.length;
      if(_debug) console.log("displayMarker markerNode ",markerNode);

      for(i=0; i<len; i++) {
	 subplate = locdets[i].img;
         if(_debug) console.log("displayMarker subplate %s",subplate);
	 if(subplate != currentImg) {
	    flags[i].setStyles({
	       'visibility': 'hidden'
	    });
	 } else {
	    flags[i].setStyles({
	       'visibility': 'visible'
	    });
	    if(SHOW_MARKER_TXT) {
	       displayMarkerTxt(key);
	       //positionMarkerTxt(key);
	    }
	 }
      }
   };
   
   //---------------------------------------------------------------
   var displayMarkerTxt = function (key) {

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
	 subplate = locations[i].img;
	 if(subplate == currentImg) {
            markerTxt = $('markerTxtDiv_' + key + '_' + i);
	    markerTxt.setStyles({
	       'visibility': 'visible'
	    });
	 }
      }
   };

   //---------------------------------------------------------------
   var getMarkerPosition = function (key) {

      var pos = [];
      var markerNode;
      var flags;
      var flag;
      var locations;
      var subplate;
      var len;
      var i;
      var l;
      var t;
      var x;
      var y;
      var pxlwdth;
      var sty;
      var lft;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;

      /*
      pxlwdth = getStringPixelWidth(markerTxtDiv.id);
      lft = window.getComputedStyle(container, null).getPropertyValue("left");
      console.log("first ",lft);
      ofs = 30.0 + (20.0 - pxlwdth) / 2.0;
      console.log("ofs ",ofs);
      lfti = parseInt(lft, 10) + ofs;
      lft = lfti + "px";
      console.log("second ",lft);
      //markerTxtDiv.setStyle('left', lft);
      //if(_debug) console.log("exit makeMarkerFlag ",term,num);
      */

      for(i=0; i<len; i++) {
	 subplate = locations[i].img;
	 if(subplate == currentImg) {
	    flag = flags[i];
            l = flag.getStyle('left');
            t = flag.getStyle('top');
            x = parseInt(l);
            y = parseInt(t);
	    pos[pos.length] = {x:x, y:y, num:i};
	 }
      }

      return pos;
   };

   //---------------------------------------------------------------
   // There may be multiple markers associated with this key,
   // on the same image or on another image of the same plate.
   //---------------------------------------------------------------
   var positionMarker = function (key) {

      var markerNode;
      var locations;
      var subplate;
      var flags;
      var len;
      var i;
      var locn;
      var x;
      var y;
      var newX;
      var newY;

      if(_debug) console.log("enter positionMarker");

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;
      if(_debug) console.log("locations ",locations);
      for(i=0; i<len; i++) {
         locn = locations[i];
	 subplate = locations[i].img;
	 if(subplate != currentImg) {
	    //if(_debug) console.log("%s, %s",subplate,currentImg);
	 }
	 x = locn.x;
	 y = locn.y;
         if(_debug) console.log("key %s, x %d, y %d, scale %d",key,x,y,scale);
         newX = x * scale + imgOfs.x;
         newY = y * scale + imgOfs.y;
         if(_debug) console.log("newX -->%d<--, newY -->%d<--",newX,newY);
	 markerNode.flags[i].setStyles({
	    'left': newX,
	    'top': newY
         });
         if(_debug) console.log("markerNode.flags[i] ",markerNode.flags[i]);
         if(_debug) console.log("positionMarker %s location %d %d,%d ",key,i,x,y);
	 //if(_debug) console.log("positionMarker %s, SHOW_MARKER_TXT %s",key,SHOW_MARKER_TXT);
         if(SHOW_MARKER_TXT) {
            //positionMarkerTxt(key);
	 }
      }
      if(_debug) console.log("exit positionMarker");

   };
   
   //---------------------------------------------------------------
   // There may be multiple markers for a key
   //---------------------------------------------------------------
   /*
   var positionMarkerTxt = function (key) {

      var posArr;
      var pos;
      var len;
      var i;

      posArr = getMarkerPosition(key);
      len = posArr.length;
      for(i=0; i<len; i++) {
         pos = posArr[i];
         markerTxt = $('markerTxtDiv_' + key + "_" + pos.num);
         markerTxt.setStyles({
	    'left': pos.x + 'px',
	    'top': (pos.y + 5) + 'px'
         });
      }
   };
   */

   //---------------------------------------------------------------
   // There may be multiple markers for a key, and they may be on the
   // same image or different one(s)
   //---------------------------------------------------------------
   var displayMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
      var len;
      var i;
      var subplate;
      var label;

      //console.log("displayMarkerLabel: %s, %s",key,small);

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      if(small) {
         label = markerNode.smallLabel;
      } else {
         //label = markerNode.bigLabel;
      }

      for(i=0; i<len; i++) {
         subplate = locations[i].img;
         //console.log("displayMarkerLabel: %s, %s",subplate,currentImg);
         if(subplate == currentImg) {
	    if(small) {
	       label.setStyles({
		  'visibility': 'visible'
	       });
	    } else {
	       view.showMarkerPopupIFrame(key);
	       setMarkerPopupIFrameContent(key)
	    }
         }
      }
   };

   //---------------------------------------------------------------
   var positionMarkerLabel = function (e, key, small) {

      var markerNode;
      var label;
      var labelPos;

      if(key === undefined || key === null) {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      if(small) {
         label = markerNode.smallLabel;
         labelPos = getSmallMarkerLabelPos(e, key, label);
      } else {
         label = $(markerIFrameID);
         labelPos = getLargeMarkerLabelPos(e, key, label);
      }

      label.setStyles({
         'left': labelPos.x + 'px',
         'top': labelPos.y + 'px'
      });


   }; // positionMarkerLabel

   //---------------------------------------------------------------
   var positionMarkerLabelByKey = function (key, small) {

      var markerNode;
      var locations;
      var len;
      var i;
      var locn;
      var subplate;
      var label;
      var x;
      var y;
      var newX;
      var newY;

      if(key === undefined || key === null || key === "") {
         return false;
      }
      //console.log("positionMarkerLabelByKey %s ",key);

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      if(small) {
         label = markerNode.smallLabel;
      } else {
         //label = markerNode.bigLabel;
      }

      for(i=0; i<len; i++) {
         locn = locations[i];
	 //console.log("positionMarkerLabelByKey trgt %s, locn ",trgt,locn);
         subplate = locn.img;
         if(subplate == currentImg) {
            x = parseFloat(locn.x);
            y = parseFloat(locn.y);
            newX = x * scale + imgOfs.x + labelOfs.x;
            newY = y * scale + imgOfs.y + labelOfs.y;
	    if(label) {
	       label.setStyles({
		  'left': newX,
		  'top': newY
	       });
	    }
         }
      }
   }; // positionMarkerLabelByKey
   
   //---------------------------------------------------------------
   var hideMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
      var len;
      var i;
      var subplate;
      var label;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = $(markerIFrameID);
      }

      for(i=0; i<len; i++) {
         subplate = locations[i].img;
         if(subplate == currentImg) {
	    label.setStyles({
	       'visibility': 'hidden'
	    });
	    if(!small) {
               emouseatlas.emap.markerPopup.showIFrame(false);
	    }
         }
      }

   };

   //---------------------------------------------------------------
   var getSmallMarkerLabelPos = function (e, key, label) {

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

   }; // getSmallMarkerLabelPos

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
   var getWikiUrl = function (key) {

      var termDets;
      var url;
      var found = false;
      var len;
      var i;

      len = subplateTerms.length;
      for (i=0; i<len; i++) {
        termDets = subplateTerms[i]; 
	//console.log("getWikiUrl termDets ",termDets);
	if(termDets.name === key) {
	   found = true;
           url = termDets.externalRef.wiki;
	   break;
        }
      }

      if(!found) {
         return false;
      } else {
         //console.log("getWikiUrl for term %s %s",key,url);
         return url;
      }
   };

   //---------------------------------------------------------------
   var setMarkerPopupIFrameContent = function (key) {

      var termDets;
      var plate;
      var info;
      var found = false;
      var stage;
      var len;
      var i;

      len = subplateTerms.length;
      for (i=0; i<len; i++) {
        termDets = subplateTerms[i]; 
	if(termDets.name === key) {
	   found = true;
	   break;
        }
      }

      if(!found) {
         return false;
      }

      plate = pointClickImgData.plate;
      info = getTitleInfoForPlate(plate);
      stage = info.stage;

      emouseatlas.emap.markerPopup.showIFrame(true);
      emouseatlas.emap.markerPopup.updateTableContent({termDets:termDets, stage:stage});
      //emouseatlas.emap.markerPopup.generateMarkerPopupPage();

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
      pointClickChanges.hideAll = true;
      notify("doHideAll");
   };

   //---------------------------------------------------------------
   var doHideAllMarkers = function (modifiers) {
      hideAllMarkers();
      deselectAllRows("doHideAllMarkers");
      selectedRowKeys = [];
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
      var keys;
      var key;
      var markerNode;
      var locations;
      var locn;
      var toBeRemoved = [];
      var len;
      var i;
      var j;

      hideTempMarkers(true);
      tempMarkerKeys = [];

      len = selectedRowKeys.length;
      //if(_debug) console.log("hideAllMarkers selectedRowKeys ",selectedRowKeys);

      //if(_debug) console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    hideMarker(key);
	    hideMarkerLabel(key, false);
	 }
      }
   };

   //---------------------------------------------------------------
   var hideMarker = function (key) {

      var markerNode;
      var locations;
      var subplate;
      var flags;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;

      for(i=0; i<len; i++) {
	 flags[i].setStyles({
	    'visibility': 'hidden'
	 });
	 hideMarkerTxt(key);
      }
   };
   
   //---------------------------------------------------------------
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
         //console.log("tiledImagePointClick.modelUpdate modelChanges.dst %s",modelChanges.dst);
         dst = model.getDistance();   
	 previousImg = currentImg;
         currentImg = pointClickImgData.subplate + pointClickImgData.sectionMap[dst.cur].label;
	 //if(_debug) console.log(currentImg);
	 if(PLATE_DATA) {
	    if(SHOWING_ALL_MARKERS) {
	       hideAllMarkers();
               deselectAllRows("modelUpdate.modelChanges.dst");
               selectedRowKeys = [];
               keys = getMarkerKeysForCurrentImg();
               showTheseMarkers(keys);
	    } else {
	       hideAllMarkers();
	       showSelectedMarkers();
	    }
	    doDistChanged();
	 }
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

      //console.log("viewUpdate");
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
	 hideTempMarkers(false);
	 tempMarkerKeys = [];
         findClosestMarkersToPoint(point);
	 showTempMarkers();
      }

      //...................................
      if(viewChanges.editorPointClick) {
	 //console.log("viewChanges.editorPointClick ",viewChanges.editorPointClick);
	 addMarkerLocation();
      }

      //...................................
      if(viewChanges.movingPCPoint) {
	 //console.log("viewChanges.movingPCPoint ",viewChanges.movingPCPoint);
	 MOVING = true;
	 addMarkerLocation();
	 MOVING = false;
      }

      //...................................
      if(viewChanges.mouseOut) {
	 var mode = view.getMode();
	 //if(_debug) console.log("viewUpdate: mouseOut ");
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
	var viz = view.toolboxVisible();
	if(viz === true) {
	   //window.setVisible(true);
        } else if(viz === false) {
	   //window.setVisible(false);
	}
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var titleIFrameLoaded = function (ifrm) {

      titleIframeHandle = ifrm;

   }; // titleIFrameLoaded

   //---------------------------------------------------------------
   var doDistChanged = function () {

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

      //console.log("enter doDistChanged");
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
   var getMarkerDetails = function (key) {

      if(key === undefined || key === null) {
         return subplateMarkerDetails;
      } else {
         return subplateMarkerDetails[key];
      }
   };
   
   //---------------------------------------------------------------
   var getSelectedMarkerDetails = function () {

      var details = {};
      var len = selectedRowKeys.length;
      var i;

      if(len <= 0) {
         return undefined;
      }
      for(i=0; i<len; i++) {
         details[selectedRowKeys[i]] = subplateMarkerDetails[selectedRowKeys[i]];
      }

      return details;
   };
   
   //---------------------------------------------------------------
   // If there is an un-specified location, set it to the clicked point
   // A location 0,0,0 implies 'unspecified'
   //---------------------------------------------------------------
   var addMarkerLocation = function () {

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

      point = view.getPointClickPoint();
      selected = getSelectedTableItem();
      if(_debug) console.log("addMarkerLocation point ",point);
      if(_debug) console.log("addMarkerLocation selected ",selected);

      if(!selected) {
         return false;
      }
      key = selected.key;
      markerDetails = subplateMarkerDetails[key];
      locations = markerDetails.locdets;
      len = locations.length;
      i;

      for(i=0; i<len; i++) {
         locn = locations[i];
	 if(locn.img == currentImg) {
	    if(MOVING || (locn.x === '0' && locn.y === '0' && locn.z === '0')) {
	       x = Math.round(point.x / scale);
	       y = Math.round(point.y / scale);
	       locn.x = x.toString(10);
	       locn.y = y.toString(10);
	       break;
	    }
	 }
      }
      showSelectedMarkers();
   };

   //---------------------------------------------------------
   var getSelectedMarkerLocations = function () {

      var key;
      var node;
      var ret = [];
      var locdets;
      var locn;
      var pos;
      var len
      var len2
      var i;
      var j;

      len = selectedRowKeys.length;
      //if(_debug) console.log("getSelectedMarkerLocations selectedRowKeys ",selectedRowKeys);

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         node = subplateMarkerDetails[key];
	 //if(_debug) console.log("getSelectedMarkerLocations node ",node);
	 locdets = node.locdets;
	 len2 = locdets.length;
	 for(j=0; j<len2; j++) {
	    locn = locdets[j];
	    //ret[ret.length] = {loc_id:node.loc_id, loc:{x:locn.x, y:locn.y, z:locn.z}};
	    ret[ret.length] = {loc_id:locn.loc_id, x:locn.x, y:locn.y, z:locn.z};
	 }
      }

      return ret;
   }; // getSelectedMarkerLocations
   
   //---------------------------------------------------------------
   var getCurrentImg = function () {

      return currentImg;
   };
   
   //---------------------------------------------------------------
   var getKeyFromStr = function (str, two_) {

      var key;
      var indx;
      var substr;

      two_ = (two_ === undefined) ? false : two_;

      indx = str.lastIndexOf("_");
      if(two_) {
         substr = str.substring(0,indx);
         indx = substr.lastIndexOf("_");
      } else {
         substr = str;
      }
      indx = indx + 1*1;
      key = substr.substring(indx);

      return key;
   };

   //---------------------------------------------------------------
   var doSaveSelectedMarkers = function (e) {

      var ajax;
      var ajaxParams;
      var url;
      var locs;
      var jsonStr;
      var len;
      var i;

      var OK = false;

      OK = confirm("about to save the selected markers");
      if(!OK) {
         return false;
      }

      locs = getSelectedMarkerLocations();
      if(locs === undefined || locs.length <= 0) {
         return false;
      }

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonStr = JSON.stringify(locs);
      } else {
         jsonStr = emouseatlas.JSON.stringify(locs);
      }
      if(!jsonStr) {
         return false;
      }
      //if(_debug) console.log("doSaveSelectedMarkers: stringified locs: %s",jsonStr);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      url = '/kaufmanwebapp/SaveMarkersSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"markers=" + jsonStr,
	 callback:doSaveSelectedMarkersCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // doSaveSelectedMarkers

   //---------------------------------------------------------------
   var doSaveSelectedMarkersCallback = function (response, urlParams) {

      //var status = MARKER_VISIBLE | MARKER_ON;
      var selected = getSelectedTableItem();

      if(selected === undefined) {
         return false;
      }

      updatePlateData();

   }; // doResetSelectedMarkersCallback:
   
   //---------------------------------------------------------------
   var doResetSelectedMarkers = function (e) {

      var ajax;
      var ajaxParams;
      var url;
      var locs;
      var locn;
      var jsonStr;
      var len;
      var len2;
      var i;
      var j;

      locs = getSelectedMarkerLocations();
      if(locs === undefined || locs.length <= 0) {
         return false;
      }

      len = locs.length;
      for(i=0; i<len; i++) {
         locn = locs[i];
	 locn.x = "0";
	 locn.y = "0";
	 locn.z = "0";
      }

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonStr = JSON.stringify(locs);
      } else {
         jsonStr = emouseatlas.JSON.stringify(locs);
      }
      if(!jsonStr) {
         return false;
      }
      //if(_debug) console.log("doResetSelectedMarkers: stringified locs: %s",jsonStr);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      url = '/kaufmanwebapp/SaveMarkersSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"markers=" + jsonStr,
	 callback:doResetSelectedMarkersCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // doResetSelectedMarkers

   //---------------------------------------------------------------
   var doResetSelectedMarkersCallback = function (response, urlParams) {

      //var status = MARKER_VISIBLE | MARKER_ON;
      var selected = getSelectedTableItem();

      if(selected === undefined) {
         return false;
      }

      updatePlateData();

   }; // doResetSelectedMarkersCallback:

   //---------------------------------------------------------------
   var doEditLocation = function (e) {

      var ajax;
      var ajaxParams;
      var url;
      var locs;
      var jsonStr;
      var len;
      var i;

      var OK = false;

      OK = confirm("about to edit locations for selected marker");
      if(!OK) {
         return false;
      }

      locs = getSelectedMarkerLocations();
      if(locs === undefined || locs.length !== 1) {
         return false;
      }

      /*
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonStr = JSON.stringify(locs);
      } else {
         jsonStr = emouseatlas.JSON.stringify(locs);
      }
      if(!jsonStr) {
         return false;
      }
      */
      //if(_debug) console.log("doEditLocation: stringified locs: %s",jsonStr);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

//      url = '/kaufmanwebapp/EditLocationsSQL';
      url = '/kaufmanwebapp/GetPlateInfo';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"markers=" + jsonStr,
	 callback:doEditLocationCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // doEditLocation

   //---------------------------------------------------------------
   var doEditLocationCallback = function (response, urlParams) {

      console.log("doEditLocationCallback");

   }; // doEditLocationCallback:
   
   //---------------------------------------------------------
   var markerIsDefined = function (marker) {
      
      var pnt = marker.p;
      var ret = true;

      if(parseInt(pnt.x, 10) === 0 && parseInt(pnt.y, 10) === 0 && parseInt(pnt.z, 10) === 0) {
	 ret = false;
      }

      return ret;
   };
   
   //---------------------------------------------------------
   var setSelectedRowHighlightType = function (type) {
      
      var tbody;
      var selectedKeys;
      var key;
      var ikey;
      var rows;
      var row;
      var rowkey;
      var lenKeys;
      var lenRows;
      var klass;
      var found = false;
      var i;
      var j;

      tbody = $("pointClickTableBody");
      selectedKeys = getSelectedRowKeys();

      rows = tbody.getElementsByTagName("tr");

      lenKeys = selectedKeys.length;
      lenRows = rows.length;

      //console.log("setSelectedRowHighlightType %s selected = ",type, selectedKeys);

      if(lenKeys === 0) {
	 for(i=0; i<lenRows; i++) {
	    row = rows[i];
	    rowkey = getKeyFromStr(row.id, false);
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
		  setMarkerSrc(rowkey, srcSelected);
		  displayMarker(rowkey);
		  positionMarker(rowkey);
		  // add the key for this marker to the list of selected markers
		  selectedRowKeys[selectedRowKeys.length] = rowkey;
		  tmpArr = utils.filterDuplicatesFromArray(selectedRowKeys);
		  selectedRowKeys = utils.duplicateArray(tmpArr);
	          previousSelectedRow = latestSelectedRow;
		  latestSelectedRow = rowkey; // think about this one
		  break;
	       }
	    }
	 }
      }

      for(i=0; i<lenKeys; i++) {
         key = selectedKeys[i];
	 ikey = parseInt(key);
	 for(j=0; j<lenRows; j++) {
	    row = rows[j];
	    rowkey = getKeyFromStr(row.id, false);
	    if(key === rowkey) {
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

      var selectedKeys;
      var sortedKeys;
      var klass;
      var btop = false;
      var bbot = false;
      var ikey;
      var itest;
      var row;
      var len;
      var i;

      selectedKeys = getSelectedRowKeys();
      sortedKeys = utils.sortArrayNumerically(selectedKeys); 
      len = sortedKeys.length;

      if(len === 0) {
	 return false;
      }

      // find all rows which are not adjoining other rows
      if(len === 1) {
	 row = getRowWithKey(sortedKeys[0]);
         row.className = row.className + ' both';
	 return false;
      }

      for(i=0; i<len; i++) {
         ikey = parseInt(sortedKeys[i]);
	 if(i === 0) {
	    row = getRowWithKey(sortedKeys[0]);
            itest = parseInt(sortedKeys[1]);
	    if(itest - ikey > 1) {
	       row.className = row.className + ' both';
	    } else {
	       row.className = row.className + ' top';
	    }
	 } else if(i === len-1) {
	    row = getRowWithKey(sortedKeys[len - 1]);
            itest = parseInt(sortedKeys[len - 2]);
	    if(ikey - itest > 1) {
	       row.className = row.className + ' both';
	    } else {
	       row.className = row.className + ' bottom';
	    }
	 } else {
	    row = getRowWithKey(sortedKeys[i]);
            itest = parseInt(sortedKeys[i - 1]);
	    if(ikey - itest > 1) {
	       btop = true;
	    }
            itest = parseInt(sortedKeys[i + 1]);
	    if(itest - ikey > 1) {
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
	 'href': "http://www.emouseatlas.org", 
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
	 console.log(selectedRowKeys);
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
   var getTermDetsForKey = function (key) {

      var termDets;
      var found = false;
      var len;
      var i;

      len = subplateTerms.length;
      for (i=0; i<len; i++) {
        termDets = subplateTerms[i]; 
	if(termDets.name === key) {
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
      //console.log("enter tiledImagePointClick.notify ",from);
      //printViewChanges();

      for (i = 0; i < registry.length; i++) {
	 //console.log(registry[i].getName());
	 registry[i].pointClickUpdate(pointClickChanges);
      }

      resetPointClickChanges();
      //console.log("exit tiledImagePointClick.notify ",from);
   }; // notify

   //---------------------------------------------------------
   /**
    *   Prints the state of observable changes to pointClick.
    */
   var printPointClickChanges = function() {
      if(pointClickChanges.initial) console.log("pointClickChanges.initial ",pointClickChanges.initial);
      if(pointClickChanges.wikiChoice) console.log("pointClickChanges.wikiChoice ",pointClickChanges.wikiChoice);
      if(pointClickChanges.mgiChoice) console.log("pointClickChanges.mgiChoice ",pointClickChanges.mgiChoice);
      if(pointClickChanges.showAll) console.log("pointClickChanges.showAll ",pointClickChanges.showAll);
      if(pointClickChanges.hideAll) console.log("pointClickChanges.hideAll ",pointClickChanges.hideAll);
      if(pointClickChanges.plateList) console.log("pointClickChanges.plateList ",pointClickChanges.plateList);
      if(pointClickChanges.emaModels) console.log("pointClickChanges.emaModels ",pointClickChanges.emaModels);
      console.log("++++++++++++++++++++++++++++++++++++++++++++");
   };

   //---------------------------------------------------------
   /**
    *   Resets the list of observable changes to pointClick.
    */
   var resetPointClickChanges = function() {
      pointClickChanges.initial =  false;
      pointClickChanges.wikiChoice =  false;
      pointClickChanges.mgiChoice =  false;
      pointClickChanges.showAll =  false;
      pointClickChanges.hideAll =  false;
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
      getSelectedRowKeys: getSelectedRowKeys,
      getTermDetsForKey: getTermDetsForKey,
      getLatestClickedRow: getLatestClickedRow,
      getWikiUrl: getWikiUrl,
      getModels: getModels,
      doDownloadImageData: doDownloadImageData
   };

}(); // end of module tiledImagePointClick
