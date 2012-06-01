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
//   pointClick.js
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
// module for pointClick
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.pointClick = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var model = emouseatlas.emap.tiledImageModel;
   var view = emouseatlas.emap.tiledImageView;
   var utils = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var editorUtils;
   var subplateMarkerDetails;
   var kaufmanData;
   var subplateImgNames = [];
   var currentImg;
   var previousImg = undefined;
   var markerContainerId;
   var tempMarkerKeys;
   var selectedRowKeys;
   var locationsForEditor;
   var subplateKeys;
   var lastHighlightedKey = undefined;
   var maxCloseMarkersToShow;
   var scale;
   var imgOfs;
   var labelOfs;
   var allowClosestMarkers = true; // temporary, while hovering over marker
   var ALLOW_CLOSEST_MARKERS = true; // more permanent (from checkbox)
   var SHOW_MARKER_TXT = false;
   var imgDir = "../../images/";
   var srcSelected = imgDir + "mapIconSelected.png";
   var srcClosest = imgDir + "mapIconClosest.png";
   var srcHighlighted = imgDir + "mapIconHighlighted.png";
   var srcClose = imgDir + "close_10x8.png";
   var srcClose2 = imgDir + "close2_10x8.png";


   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   var initialize = function () {

      //console.log("enter pointClick.initialize");

      model.register(this);
      view.register(this);

      kaufmanData = model.getKaufmanData();
      //console.log("kaufmanData ",kaufmanData);

      createElements();
      getPlateData();
      if(model.isEditor()) {
         doShowMarkerText();
	 var chk = $('pointClickShowTxtChkbx');
	 chk.set('checked', true);
      }

      subplateMarkerDetails = {};
      tempMarkerKeys = [];
      selectedRowKeys = [];
      locationsForEditor = [];
      subplateKeys = [];

      maxCloseMarkersToShow = 3;

      markerContainerId = 'histology_tileFrame';

      scale = view.getScale().cur;
      //---------------------------------------------------------
      // The marker img is 20x34 pixels and the locating point is mid-bottom-line
      // so we apply an offset to the mouse click point to make it look right.
      //---------------------------------------------------------
      imgOfs = {x:-8, y:-32};
      labelOfs = {x:30, y:-30};

   }; // initialize

   //---------------------------------------------------------------
   // We only want to store data for the subplate relevant to this page
   //---------------------------------------------------------------
   var getPlateData = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var plate = kaufmanData.plate;
      var url = '/kaufmanwebapp/GetPlateDataSQL';
      var ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"plate="+plate,
         callback:getPlateDataCallback,
         async:true
      }
      //console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getPlateData

   //---------------------------------------------------------------
   var getPlateDataCallback = function (response, urlParams) {

      //console.log("getPlateDataCallback: \n" + urlParams);
      var json;
      var subplateNames;
      var subplate;
      var subplateData;
      var len;
      var i;
      
      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
         //console.log("getPlateDataCallback returning: response null");
         return false;
      } else {
         //console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //console.log("getPlateDataCallback returning: json null");
         return false;
      }
      //console.log("getPlateDataCallback json ",json);

      subplateNames = storeSubplateNames(json);
      //console.log(subplateNames," ",subplateImgNames);
      subplateData = getSubplateData(json, kaufmanData.subplate);
      storeSubplateKeys(subplateData);
      storeSubplateDetails(subplateData);
      setMarkerTable();

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

      var plate = kaufmanData.plate;
      //console.log("updatePlateData plate ",plate);
      var url = '/kaufmanwebapp/GetPlateDataSQL';
      var ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"plate="+plate,
         callback:updatePlateDataCallback,
         async:true
      }
      //console.log(ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // updatePlateData

   //---------------------------------------------------------------
   var updatePlateDataCallback = function (response, urlParams) {

      //console.log("updatePlateDataCallback: \n" + urlParams);
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
         //console.log("updatePlateDataCallback returning: response null");
         return false;
      } else {
         //console.log(response);
      }
      
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         //console.log("updatePlateDataCallback returning: json null");
         return false;
      }
      //console.log("updatePlateDataCallback json ",json);

      subplateData = getSubplateData(json, kaufmanData.subplate);
      //console.log("subplateData ",subplateData);
      len = selectedRowKeys.length;
      len2 = subplateData.length;

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         //console.log("key ",key);
         for(j=0; j<len2; j++) {
	    newSubplateDets = subplateData[j];
	    newLocs = newSubplateDets.locations;
	    len3 = newLocs.length;
	    for(k=0; k<len3; k++) {
	       newLocn = newLocs[k];
	       //console.log("newLocn ",newLocn);
	       if(newLocn.term.name == key) {
	          //console.log("%s, %s, %s, %s, %s,%s,%s",newSubplateDets.name, newLocn.id,newLocn.term.name,newLocn.term.description,newLocn.x,newLocn.y,newLocn.z);
		  oldLocn = getMarkerByLocId(newLocn.id);
		  //console.log("locn to change ",oldLocn);
		  //console.log("newLocn ",newLocn);
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
	       //console.log("found location ",locid);
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
	 if(plate.subplate == kaufmanData.subplate) {
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

      //console.log("getImageDataForPlate: plateData %s, subplate %s ",plateData,subplate);
      if(plateData === undefined || plateData === null) {
         return undefined;
      }
      if(subplate === undefined || subplate === null || subplate === "") {
         return undefined;
      }

      var len;
      var plate;
      var i;
      var name = "";
      var foundPlate = false;

      len = plateData.length;
      for(i=0; i<len; i++) {
         plate = plateData[i];
	 if(plate.subplate === subplate) {
	    foundPlate = true;
	    break;
         }
      }

      if(!foundPlate) {
         return undefined;
      }

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

      for(i=0; i<len; i++) {
         key = keys[i];
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
	    utils.addEvent(theRow, 'mouseup', doMouseUpTableRow, false);
      }

   }; // setMarkerTable

   //---------------------------------------------------------------
   // This stores the keys for the images on the subplate
   //---------------------------------------------------------------
   var storeSubplateKeys = function (subplateData) {

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
         //console.log(imageData);
	 locations = imageData.locations;
	 len2 = locations.length;
         for(j=0; j<len2; j++) {
	    locn = locations[j];
	    term = locn.term;
	    subplateKeys[subplateKeys.length] = term.name;
	 }
      }
      //console.log("subplateKeys ",subplateKeys);
      // this function doesn't change the original so you need to assign it.
      subplateKeys = utils.removeDuplicatesFromArray(subplateKeys);
      // sort the keys numerically (they are strings)
      subplateKeys.sort(function(A,B) {
	       return(parseInt(A)-parseInt(B));
            });

      //console.log("subplateKeys ",subplateKeys);

   }; // storeSubplateKeys

   //---------------------------------------------------------------
   var getSubplateKeys = function (imageData) {
      return subplateKeys;
   };

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
      var bigLabel;
      var len;
      var len2;
      var len3;
      var i,j,k;

      keys = getSubplateKeys();
      len = keys.length;
      len2 = subplateData.length;

      //console.log(subplateMarkerDetails);

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
	          smallLabel = makeMarkerSmallLabel(term);
	          bigLabel = makeMarkerBigLabel(term);
	          flag = makeMarkerFlag(term, flags.length);
	          subplateMarkerDetails[key].EmapId = term.externalRef.source;
	          subplateMarkerDetails[key].descr = term.description;
	          subplateMarkerDetails[key].smallLabel = smallLabel;
	          subplateMarkerDetails[key].bigLabel = bigLabel;
	          subplateMarkerDetails[key].flags[flags.length] = flag;
	          subplateMarkerDetails[key].locdets[locdets.length] = {img:imageData.name, loc_id:loc_id, x:x, y:y, z:z};
	       }
	    }
	 }
      }
     //console.log(subplateMarkerDetails);
   }; // storeSubplateDetails

   //---------------------------------------------------------------
   var getLocationsForKey = function (key) {

      var locations = [];
      var markerDetails;
      var len;
      var i;

      markerDetails = subplateMarkerDetails[key];
      console.log("getLocationsForKey: markerDetails ",markerDetails);
      len = markerDetails.locdets.length;
      for(i=0; i<len; i++) {
         locations[locations.length] = markerDetails.locdets[i];
      } // for

      //console.log("getLocationsForKey %s, ",key,locations);
      return locations;
   }; // getLocationsForKey

   //---------------------------------------------------------------
   var getEmapIdForKey = function (key) {

      var markerDetails;
      var len;
      var i;

      markerDetails = subplateMarkerDetails[key];
      return markerDetails.EmapId;
   }; // getEmapIdForKey

   //---------------------------------------------------------------
   var makeMarkerFlag = function (term, num) {

      //console.log("makeMarkerFlag ",term,num);
      var container = $(markerContainerId);
      var name = term.name;
      var map;
      var usemap;
      var mapArea;

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
            'class': 'markerTxtDiv'
      });
      markerTxtDiv.set('text', name);


      mapArea.inject(map, 'inside');

      usemap = "#" + map.name
      markerImg.set('usemap', usemap);

      map.inject(container, 'inside');
      markerImg.inject(markerImgDiv, 'inside');
      markerImgDiv.inject(container, 'inside');
      markerTxtDiv.inject(container, 'inside');

      utils.addEvent(mapArea, 'mouseover', doMouseOverMarker, false);
      utils.addEvent(mapArea, 'mouseout', doMouseOutMarker, false);
      utils.addEvent(mapArea, 'mouseup', doMouseUpMarker, false);

      return markerImgDiv;
   };

   //---------------------------------------------------------------
   var makeMarkerSmallLabel = function (term) {

      //console.log("makeMarkerSmallLabel ",term);
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
   var makeMarkerLabelTableEntry = function (tableBody, obj) {

      // set up the table row
      var row;
      var cell;
      var entry;
      var key = obj.key;
      var txt = obj.txt;
      var action = obj.action;

      row = new Element("tr", {
      'id': 'markerLabelTableRow_' + key,
      'class': 'markerLabelTableRow'
      });
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      cell = new Element("td", {
      'id': 'markerLabelTableCell_' + key,
      'class': 'markerLabelTableCell'
      });
      entry = new Element('div', {
      'id': 'markerLabelTableEntry_' + key,
      'class': 'markerLabelTableEntry',
      'text': txt
      });
      
      cell.inject(row, 'inside');
      entry.inject(cell, 'inside');
      
      // add event handlers.
      if(action) {
         utils.addEvent(row, 'mouseover', doMouseOverLabelTableRow, false);
         utils.addEvent(row, 'mouseout', doMouseOutLabelTableRow, false);
         utils.addEvent(row, 'mouseup', action, false);
      }

      row.inject(tableBody, 'inside');
   };

   //---------------------------------------------------------------
   var makeMarkerLabelTableSpacer = function (tableBody) {

      var row;
      var cell;
      var entry;

      row = new Element("tr", {
      'class': 'markerLabelTableSpacer'
      });
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      cell = new Element("td", {
      'class': 'markerLabelTableSpacerCell'
      });
      entry = new Element('div', {
      'class': 'markerLabelTableSpacerEntry'
      });
      
      cell.inject(row, 'inside');
      entry.inject(cell, 'inside');
      
      row.inject(tableBody, 'inside');
   };

   //---------------------------------------------------------------
   var makeMarkerBigLabel = function (term) {

      //console.log("makeMarkerBigLabel ",term);
      //---------------------------------------------------------
      // the Container
      //---------------------------------------------------------
      var markerContainer;
      var name;
      var descr;
      var EmapId;
      var EmapDesc;
      var markerBigLabelContainerDiv;
      var closeDiv;
      var closeImg;
      var tableContainer;
      var table;
      var tableBody;
      var row;

      markerContainer = $(markerContainerId);
      name = term.name;
      descr = term.description;
      EmapId = term.externalRef.source;
      EmapDesc = term.externalRef.description;
      markerBigLabelContainerDiv = new Element('div', {
            'id': 'markerBigLabelContainerDiv_' + name,
            'class': 'markerBigLabelContainerDiv'
      });

      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      closeDiv = new Element('div', {
         'id': 'markerBigLabelCloseDiv_' + name,
         'class': 'markerBigLabelCloseDiv'
      });

      closeImg = new Element( 'img', {
         'id': 'markerBigLabelCloseImg_' + name,
         'class': 'markerBigLabelCloseImg',
         'src': srcClose
      });

      closeImg.inject(closeDiv, 'inside');

      //----------------------------------------
      // container for the Table of options
      //----------------------------------------
      tableContainer = new Element('div', {
         'id': 'markerLabelTableContainer'
      });

      //----------------------------------------
      // the table
      //----------------------------------------
      // creates a <table> element and a <tbody> element
      table = new Element("table", {
         'id': 'markerLabelTable',
	 'border': '2'
      });

      tableBody = new Element("tbody", {
         'id': 'markerLabelTableBody'
      });

      // put the <tbody> in the <table>
      tableBody.inject(table, 'inside');
      table.inject(tableContainer, 'inside');

      closeDiv.inject(markerBigLabelContainerDiv, 'inside');
      tableContainer.inject(markerBigLabelContainerDiv, 'inside');
      markerBigLabelContainerDiv.inject(markerContainer, 'inside');

      utils.addEvent(closeImg, 'mouseup', doCloseMarkerBigLabel, false);
      utils.addButtonStyle('markerBigLabelCloseDiv_' + name);

      //..........................................
      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'desc',
					  'txt':name + ": " +descr,
					  'action':''
                                      });


      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'emap',
					  'txt':EmapId + " ---  " + EmapDesc,
					  'action':''
                                      });

      makeMarkerLabelTableSpacer(tableBody);

      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'queryEmage_' + name,
					  'txt':'query EMAGE database',
					  'action': doMouseUpLabelTableRow
                                      });

      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'queryGxdb_' + name,
					  'txt':'query GXDB database',
					  'action': doMouseUpLabelTableRow
                                      });

      //..........................................
      return markerBigLabelContainerDiv;
   };

   //---------------------------------------------------------------
   var doMouseOverLabelTableRow = function (e) {

      var target;
      var prnt;
      var tKlass;
      var pKlass;
      var cell;

      target = utils.getTarget(e);
      tKlass = target.className;
      prnt = target.parentNode;
      pKlass = prnt.className;

      if(target.hasClass('markerLabelTableCell')) {
         cell = target;
      } else if(prnt.hasClass('markerLabelTableCell')) {
         cell = prnt;
      }
      cell.className = 'markerLabelTableCell over';

   }; //doMouseOverTableRow

   //---------------------------------------------------------------
   var doMouseOutLabelTableRow = function (e) {

      var target;
      var prnt;
      var tKlass;
      var pKlass;
      var cell;

      target = utils.getTarget(e);
      tKlass = target.className;
      prnt = target.parentNode;
      pKlass = prnt.className;

      if(target.hasClass('markerLabelTableCell')) {
         cell = target;
      } else if(prnt.hasClass('markerLabelTableCell')) {
         cell = prnt;
      }
      cell.className = 'markerLabelTableCell';

   }; //doMouseOverTableRow

   //---------------------------------------------------------------
   var doMouseUpLabelTableRow = function (e) {

      var target;
      var key;
      var EmapId;
      var edid;
      var url = undefined;

      target = utils.getTarget(e);
      key = getKeyFromStr(target.id, false);
      EmapId = getEmapIdForKey(key);
      edid = EmapId.substr(5);


      if(target.id.toLowerCase().indexOf('emage') > -1) {
         url =
            'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' +
            EmapId +
            '&exactmatchstructures=true&includestructuresynonyms=true';
      } else if(target.id.toLowerCase().indexOf('gxdb') > -1) {
         url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=' +
               edid +
	       '&sort=Gene%20symbol&returnType=assay%20results&substructures=substructures'; 
      }

      if(url) {
         window.open(url);
      }
   }; //doMouseOverTableRow

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

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      flagDivs = markerNode.flags;
      len = flagDivs.length;
      //console.log(markerNode);
      src = (src === undefined) ? srcClosest : src;
      for(i=0; i<len; i++) {
         flagDiv = flagDivs[i];
	 flag = flagDiv.firstChild;
         flag.set('src', src);
      }
   };

   //---------------------------------------------------------------
   var doMouseOverMarker = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var key;

      key = getKeyFromStr(target.id, true);

      allowClosestMarkers = false;

      setMarkerSrc(key, srcHighlighted);
      displayMarkerLabel(key, true);
      positionMarkerLabel(key, true);
      highlightRow(key);
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

      if(keyPresent(key, true)) {
         setMarkerSrc(key, srcSelected);
         row = getRowWithKey(key);
         row.className = 'pointClickTableRow selected';
      } else {
	 if(ALLOW_CLOSEST_MARKERS) {
            setMarkerSrc(key, srcClosest);
	 }
      }
      hideMarkerLabel(key, true, false);
      clearRowHighlight();
   };

   //---------------------------------------------------------------
   var doMouseUpMarker = function (e) {

      var target = utils.getTarget(e);
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var key;
      var row;

      key = getKeyFromStr(target.id, true);

      displayMarkerLabel(key, false);
      positionMarkerLabel(key, false);
      //highlightRow(key);
   };

   //---------------------------------------------------------------
   var doMarkerEmageQuery = function (e) {

      var target;
      var key;
      var EmapId;
      var url;

      target = utils.getTarget(e);
      key = getKeyFromStr(target.id, false);
      EmapId = getEmapIdForKey(key);

      url =
         'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' +
         EmapId +
	 '&exactmatchstructures=true&includestructuresynonyms=true'; 

      window.open(url);

   };

   //---------------------------------------------------------------
   var doMarkerGxdbQuery = function (e) {

      var target;
      var key;
      var EmapId;
      var edid;
      var url;

      target = utils.getTarget(e);
      key = getKeyFromStr(target.id, false);
      EmapId = getEmapIdForKey(key);
      // strip off the 'EMAP:' part
      edid = EmapId.substr(5);

      url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=' +
            edid +
	    '&sort=Gene%20symbol&returnType=assay%20results&substructures=substructures'; 

      window.open(url);

   };

   //---------------------------------------------------------------
   var doTableEmageQuery = function () {

      var key;
      var EmapId;
      var url;

      key = lastHighlightedKey;
      EmapId = getEmapIdForKey(key);

      url =
         'http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=' +
         EmapId +
	 '&exactmatchstructures=true&includestructuresynonyms=true'; 

      window.open(url);

   };

   //---------------------------------------------------------------
   var doTableGxdbQuery = function () {

      var key;
      var EmapId;
      var url;

      key = lastHighlightedKey;
      EmapId = getEmapIdForKey(key);
      edid = EmapId.substr(5);

      url = 'http://www.informatics.jax.org/searches/expression_report.cgi?edinburghKey=' +
            edid +
	    '&sort=Gene%20symbol&returnType=assay%20results&substructures=substructures'; 

      window.open(url);

   };

   //---------------------------------------------------------------
   var doTableCancel = function () {
      // no op
   };

   //---------------------------------------------------------------
   var doCloseMarkerBigLabel = function (e) {

      var target;
      var bigLabel;
      var key;

      target = utils.getTarget(e);
      key = getKeyFromStr(target.id, false);

      hideMarkerLabel(key, false, false);
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
      //console.log("doMouseOutTableRow target %s",target.id);
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
         //console.log("grandchild ", gchild.get('text'), gchild.className);
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
      if(keyPresent(key, false)) {
         setMarkerSrc(key, srcClosest);
      }
      if(keyPresent(key, true)) {
         setMarkerSrc(key, srcSelected);
      }
      if(!keyPresent(key, true) && !keyPresent(key, false)) {
         setMarkerSrc(key, srcClosest);
         hideMarker(key, false);
      }

      // make sure selected rows are shown in table
      if(keyPresent(key, true)) {
	 row.className = 'pointClickTableRow selected';
         setMarkerSrc(key, srcSelected);
      } else {
         row.className = 'pointClickTableRow';
      }
   }; // doMouseOutRow

   //---------------------------------------------------------------
   var doMouseUpTableRow = function (e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var row = undefined;
      var children = undefined;
      var child = undefined;
      var gchild = undefined;
      var len;
      var i;
      var key;
      var ref;
      var desc;
      var prnt = target.parentNode;
      var gprnt = prnt.parentNode;
      var tKlass = target.className;
      var pKlass = prnt.className;
      var gKlass = gprnt.className;
      var newKlass = 'pointClickTableRow';
      var markerNode;
      var x;
      var y;
      var newX;
      var newY;

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
         //console.log("grandchild ", gchild.get('text'), gchild.className);
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
      //console.log("key %s, ref %s, desc %s", key,ref,desc);

      len = selectedRowKeys.length;
      for(i=0; i<len; i++) {
         markerNode = subplateMarkerDetails[selectedRowKeys[i]];
	 // if the item is already selected, de-select it.
	 if(key === markerNode.key) {
	    row.className = "pointClickTableRow";
	    // and hide the marker
	    hideMarker(markerNode.key, false);
	    removeKey(key, true);
	    return false;
	 }
      }

      // editors want single selections in the table
      // Unless the point is defined already, this is a new point
      if(model.isEditor()) {
	 deselectAllRows();

	 // now we can modify the selected item's class
	 row.className = "pointClickTableRow selected";

	 setMarkerSrc(key, srcSelected);
	 displayMarker(key);
	 positionMarker(key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 selectedRowKeys = utils.removeDuplicatesFromArray(selectedRowKeys);
      } else {
	 // general users want multiple selections in the table
	 setMarkerSrc(key, srcSelected);
	 displayMarker(key);
	 positionMarker(key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 selectedRowKeys = utils.removeDuplicatesFromArray(selectedRowKeys);
      }

   }; // doMouseUpTableRow

   //---------------------------------------------------------------
   var deselectAllRows = function () {

      var rowArr = $$('.pointClickTableRow');
      var len = rowArr.length;
      var i;
      var newKlass = 'pointClickTableRow';

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
	    //console.log(row);
	    found = true;
	    break;
	 }
      }

      if(found) {
         ret = {img:currentImg};
         children = row.childNodes;
	 //console.log(children);
	 len = children.length;
	 for(i=0; i<len; i++) {
	    child = children[i];
	    gchild = child.firstChild;
	    //console.log(gchild);
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

      //console.log("returning ",ret);
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
	    //console.log(row);
	    found = true;
	    break;
	 }
      }

      if(found) {
         ret = {img:currentImg};
         children = row.childNodes;
	 //console.log(children);
	 len = children.length;
	 for(i=0; i<len; i++) {
	    child = children[i];
	    gchild = child.firstChild;
	    //console.log(gchild);
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
	 //console.log("returning ",ret);
      } else {
	 //console.log("no selected item");
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
            //console.log("got row with key %s",rkey,row);
            break;
         }
      }

      return row;

   }; //getRowWithKey

   //---------------------------------------------------------------
   var keyPresent = function (testKey, markers) {

      var keys
      var key;
      var len = selectedRowKeys.length;
      var i;

      keys = markers ? selectedRowKeys : tempMarkerKeys;
      len = keys.length;

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
	 if(!keyPresent(key, true)) {
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
	 if(!keyPresent(key, true)) {
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

      if(point === undefined) {
         return;
      }

      ipx = Math.round(point.x / scale);
      ipy = Math.round(point.y / scale);

      keys = getSubplateKeys();
      len = keys.length;

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
         markerNode = subplateMarkerDetails[key];
         //console.log("markerNode ",markerNode);
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       //console.log("different image %d, %d",i,j);
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
         tempMarkerKeys[tempMarkerKeys.length] = tmpArr[i].key;
      }
      tempMarkerKeys = utils.removeDuplicatesFromArray(tempMarkerKeys);
      //console.log("findClosestMarkers: tempMarkerKeys ",tempMarkerKeys);
   }; // findClosestMarkersToPoint

   //---------------------------------------------------------------
   // Utilty / debugging function
   //---------------------------------------------------------------
   var printIntegerMarkers = function (imarkerArr) {
      
      var i;
      var marker;
      var len = imarkerArr.length;

      if(imarkerArr === undefined || imarkerArr.length <= 0) {
        //console.log("there are no markers");
         return false;
      }

      // sort by x value in ascending order
      // utils.sortMarkers(imarkerArr, true, true);
      // sort by y value in ascending order
      utils.sortMarkers(imarkerArr, false, true);

      for (i=0; i<len; i++) {
         marker = imarkerArr[i];
	 console.log("marker %s: %d,%d",marker.key,marker.x,marker.y);
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
      var klass = EDITOR ? 'editor' : '';

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
         'checked': false
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

         //utils.addButtonStyle('pointClickSaveAllButton');
         utils.addButtonStyle('pointClickSaveSelectedButton');
         utils.addButtonStyle('pointClickResetSelectedButton');

	 pointClickEditorButtonContainer.inject(pointClickBottomBit, 'inside');

         utils.addEvent(pointClickSaveSelectedButton, 'mouseup', doSaveSelectedMarkers, false);
         utils.addEvent(pointClickResetSelectedButton, 'mouseup', doResetSelectedMarkers, false);

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
      utils.addEvent(pointClickHideAllButton, 'mouseup', doHideAllMarkers, false);
      if(!EDITOR) {
         utils.addEvent(pointClickShowClosestChkbx, 'mouseup', doAllowClosestMarkers, false);
      }
      utils.addEvent(pointClickShowTxtChkbx, 'mouseup', doShowMarkerText, false);

   }; // createElements
   
   //---------------------------------------------------------------
   var doAllowClosestMarkers = function (e) {

      var chkbx = $('pointClickShowClosestChkbx');
      var wasChecked = chkbx.checked;
      //console.log("doAllowClosestMarkers wasChecked %s",wasChecked);

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
	 positionMarkerTxt(key);
      }

      len = tempMarkerKeys.length;
      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 displayMarkerTxt(key);
	 positionMarkerTxt(key);
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
	 //row.className = 'pointClickTableRow selected';
         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
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

      var keys;
      var key;
      var markerNode;
      var locations;
      var locn;
      var len;
      var len2;
      var i;
      var j;
      var row;

      selectedRowKeys = [];
      tempMarkerKeys = [];

      keys = getSubplateKeys();
      len = keys.length;

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
	 row = getRowWithKey(key);
	 row.className = 'pointClickTableRow selected';
         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       //console.log("different image %d, %d",i,j);
	       //continue;
	    }
	    if(locn.x === "0" && locn.y === "0" && locn.z === "0") {
	       continue;
	    }

	    selectedRowKeys[selectedRowKeys.length] = key;
	    setMarkerSrc(key, srcSelected);
	    displayMarker(key);
	    positionMarker(key);
	 }
      }
      selectedRowKeys = utils.removeDuplicatesFromArray(selectedRowKeys);
      //console.log("selectedRowKeys after removing duplicates ",selectedRowKeys);
   }; // showAllMarkers
   
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
	 positionMarkerLabel(key);
      }
      len = tempMarkerKeys.length;
      for (i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 positionMarker(key);
	 positionMarkerLabel(key);
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
      //console.log("displayMarker currentImg %s, key %s",currentImg,key);

      markerNode = subplateMarkerDetails[key];
      locdets = markerNode.locdets;
      flags = markerNode.flags;
      len = locdets.length;
      //console.log("displayMarker markerNode ",markerNode);

      for(i=0; i<len; i++) {
	 subplate = locdets[i].img;
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
	       positionMarkerTxt(key);
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

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;

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

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;
      //console.log("locations ",locations);
      for(i=0; i<len; i++) {
         locn = locations[i];
	 subplate = locations[i].img;
	 if(subplate != currentImg) {
	    //console.log("%s, %s",subplate,currentImg);
	 }
	 x = locn.x;
	 y = locn.y;
         //console.log("%d,%d",x,y);
         newX = x * scale + imgOfs.x;
         newY = y * scale + imgOfs.y;
	 markerNode.flags[i].setStyles({
	    'left': newX,
	    'top': newY
         });
         //console.log("positionMarker %s location %d %d,%d ",key,i,x,y);
	 //console.log("positionMarker %s, SHOW_MARKER_TXT %s",key,SHOW_MARKER_TXT);
         if(SHOW_MARKER_TXT) {
            positionMarkerTxt(key);
	 }
      }
   };
   
   //---------------------------------------------------------------
   // There may be multiple markers for a key
   //---------------------------------------------------------------
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

   //---------------------------------------------------------------
   // There may be multiple markers for a key, but we are only displaying
   // a label for the first one to avoid overlap.
   //---------------------------------------------------------------
   var displayMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
      var subplate;
      var label;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }
      subplate = locations[0].img;
      if(subplate == currentImg) {
         label.setStyles({
            'visibility': 'visible'
         });
      }
   };

   //---------------------------------------------------------------
   var positionMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
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

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }
      locn = locations[0];
      subplate = locn.img;
      if(subplate == currentImg) {
	 x = parseFloat(locn.x);
	 y = parseFloat(locn.y);
	 newX = x * scale + imgOfs.x + labelOfs.x;
	 newY = y * scale + imgOfs.y + labelOfs.y;
	 label.setStyles({
	    'left': newX,
	    'top': newY
	 });
      }
   };
   
   //---------------------------------------------------------------
   var hideMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
      var subplate;
      var label;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = subplateMarkerDetails[key];
      locations = markerNode.locdets;
      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }
      subplate = locations[0].img;
      if(subplate == currentImg) {
	 label.setStyles({
	    'visibility': 'hidden'
	 });
      }
   };

   //---------------------------------------------------------------
   // Handler fo hideAll button
   //---------------------------------------------------------------
   var doHideAllMarkers = function (e) {
      hideAllMarkers();
      deselectAllRows();
      selectedRowKeys = [];
   }
   
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
      //console.log("hideAllMarkers selectedRowKeys ",selectedRowKeys);

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         markerNode = subplateMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    //if(locn.img != currentImg) {
	     //  continue;
	    //}
	    hideMarker(key);
	    hideMarkerLabel(key, false);
	    //toBeRemoved[toBeRemoved.length] = key;
	    //console.log("to be removed ",toBeRemoved);
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
	 subplate = locations[i].img;
	 if(subplate == currentImg) {
	    flags[i].setStyles({
	       'visibility': 'hidden'
	    });
	    if(SHOW_MARKER_TXT) {
	       hideMarkerTxt(key);
	    }
	 }
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
	 subplate = locations[i].img;
	 if(subplate == currentImg) {
            markerTxt = $('markerTxtDiv_' + key + '_' + i);
	    markerTxt.setStyles({
	       'visibility': 'hidden'
	    });
	 }
      }
   };
   
   //----------------------------------------------------------
   // Calculates the distance between 2 points on the image
   //----------------------------------------------------------
   var getDistance = function(pntFrom, pntTo) {
      return Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
   };

   //---------------------------------------------------------------
   var modelUpdate = function (modelChanges) {

      var dst;

      if(modelChanges.dst === true) {
	 hideAllMarkers();
         dst = model.getDistance();   
	 previousImg = currentImg;
         currentImg = kaufmanData.sectionMap[dst.cur];
	 //console.log(currentImg);
	 showSelectedMarkers();
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function (viewChanges, from) {

      //console.log("viewUpdate");
      if(viewChanges.initial === true) {
	 //window.setVisible(false);
         var dst = model.getDistance();   
	 currentImg = kaufmanData.sectionMap[dst.cur];
	 previousImg = currentImg;
      }

      //...................................
      if(viewChanges.scale) {
         scale = view.getScale().cur;
	 updateMarkerPositions();
      }

      //...................................
      if(viewChanges.pointClick) {
         if(!ALLOW_CLOSEST_MARKERS || !allowClosestMarkers) return false;
	 var point = view.getPointClickPoint();
	 hideTempMarkers(false);
	 tempMarkerKeys = [];
         findClosestMarkersToPoint(point);
	 showTempMarkers();
      }

      //...................................
      if(viewChanges.editorPointClick) {
	 addMarkerLocation();
      }

      //...................................
      if(viewChanges.mouseOut) {
	 var mode = view.getMode();
	 //console.log("viewUpdate: mouseOut ");
	 if(mode.name === 'pointClick') {
	 }
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
      key = selected.key;
      markerDetails = subplateMarkerDetails[key];
      locations = markerDetails.locdets;
      len = locations.length;
      i;

      for(i=0; i<len; i++) {
         locn = locations[i];
	 if(locn.img == currentImg) {
	    if(locn.x === '0' && locn.y === '0' && locn.z === '0') {
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
      //console.log("getSelectedMarkerLocations selectedRowKeys ",selectedRowKeys);

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         node = subplateMarkerDetails[key];
	 //console.log("getSelectedMarkerLocations node ",node);
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
      //console.log("doSaveSelectedMarkers: stringified locs: %s",jsonStr);

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
      //console.log(ajaxParams);
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
      //console.log("doResetSelectedMarkers: stringified locs: %s",jsonStr);

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
      //console.log(ajaxParams);
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
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialize: initialize,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      doMarkerEmageQuery: doMarkerEmageQuery,
      doMarkerGxdbQuery: doMarkerGxdbQuery,
      doTableEmageQuery: doTableEmageQuery,
      doTableGxdbQuery: doTableGxdbQuery,
      doTableCancel: doTableCancel,
      doMouseOverLabelTableRow: doMouseOverLabelTableRow
   };

}(); // end of module pointClick
