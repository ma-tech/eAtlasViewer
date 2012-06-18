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
// module for tprPointClick
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.tprPointClick = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var model = emouseatlas.emap.tiledImageModel;
   var view = emouseatlas.emap.tiledImageView;
   var utils = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var imageMarkerDetails;
   var pointClickImgData;
   var subplateImgNames = [];
   var currentImg;
   var previousImg = undefined;
   var markerContainerId;
   var tempMarkerKeys;
   var selectedRowKeys;
   var locationsForEditor;
   var imageKeys = [];
   var lastHighlightedKey = undefined;
   var maxCloseMarkersToShow;
   var scale;
   var imgOfs;
   var labelOfs;
   var allowClosestMarkers = true; // temporary, while hovering over marker
   var ALLOW_CLOSEST_MARKERS = true; // more permanent (from checkbox)
   var SHOW_MARKER_TXT = false;
   var imgPath;
   var srcSelected;
   var srcClosest;
   var srcHighlighted;
   var srcHighlighted_66;
   var srcHighlighted_33;
   var srcClose;
   var srcClose2;
   var isWlz;
   var funcs;
   var fudge;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   var initialize = function () {

      //console.log("enter tprPointClick.initialize");

      model.register(this);
      view.register(this);

      pointClickImgData = model.getPointClickImgData();
      //console.log("pointClickImgData ",pointClickImgData);

      isWlz = model.isWlzData();

      funcs = {};
      funcs['posmarker'] = position3DMarker;
      funcs['markersrc'] = set3DMarkerSrc;
      funcs['label'] = position3DMarkerLabel;
      funcs['txt'] = position3DMarkerTxt;

      createElements();
      getImageData();
      if(model.isEditor()) {
         doShowMarkerText();
	 var chk = $('pointClickShowTxtChkbx');
	 chk.set('checked', true);
      }

      imageMarkerDetails = {};
      tempMarkerKeys = [];
      selectedRowKeys = [];
      locationsForEditor = [];
      imageKeys = [];

      maxCloseMarkersToShow = 3;

      // assuming just now that it is layer 0 !!
      var layernames = model.getLayerNames();

      imgPath = model.getInterfaceImageDir();
      srcSelected = imgPath + "mapIconSelected.png";
      srcSelected_66 = imgPath + "mapIconSelected_66.png";
      srcSelected_33 = imgPath + "mapIconSelected_33.png";
      srcClosest = imgPath + "mapIconClosest.png";
      srcHighlighted = imgPath + "mapIconHighlighted.png";
      srcHighlighted_66 = imgPath + "mapIconHighlighted_66.png";
      srcHighlighted_33 = imgPath + "mapIconHighlighted_33.png";
      srcClose = imgPath + "close_10x8.png";
      srcClose2 = imgPath + "close2_10x8.png";

      markerContainerId = layernames[0] + '_tileFrame';

      scale = view.getScale().cur;
      //---------------------------------------------------------
      // The marker img is 20x34 pixels and the locating point is mid-bottom-line
      // so we apply an offset to the mouse click point to make it look right.
      //---------------------------------------------------------
      imgOfs = {x:-8, y:-32};
      labelOfs = {x:30, y:-30};
      //fudge = {x:-5, y:-6}; // corrects the position of the marker at the mouse click.
      fudge = {x:0, y:0}; // corrects the position of the marker at the mouse click.

      //printImageInfo();

      //console.log("exit tprPointClick.initialize");

   }; // initialize

   //---------------------------------------------------------------
   var getImageData = function () {

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      var resources;
      var image;
      var url;
      var ajaxParams;

      resources = isWlz ? "tpr_demo_3d" : "tpr_demo";
      image = pointClickImgData.image;
      url = '/tprwebapp/GetPlateDataSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"resources=" + resources,
         callback:getImageDataCallback,
         async:true
      }
      //console.log("getImageData ajaxParams",ajaxParams);
      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getImageData

   //---------------------------------------------------------------
   var getImageDataCallback = function (response, urlParams) {

      //console.log("getImageDataCallback: \n" + urlParams);
      var json;
      
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
      //console.log("getImageDataCallback json ",json);
      storeImageKeys(json);
      storeImageDetails(json);
      setMarkerTable();

   }; // getImageDataCallback:

   //---------------------------------------------------------------
   // Re-load marker positions from mysql db after changes.
   // We only want to update data that has changed
   //---------------------------------------------------------------
   var updateImageData = function () {

      var resources
      var ajaxParams;
      var urlParams;
      var image;
      var url;
      var ajax;

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      resources = isWlz ? "tpr_demo_3d" : "tpr_demo";

      image = pointClickImgData.image;
      urlParams = "image=" + image +"?resources=" + resources,

      //console.log("updateImageData image ",image);
      url = '/tprwebapp/GetPlateDataSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:urlParams,
         callback:updateImageDataCallback,
         async:true
      }
      //console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // updateImageData

   //---------------------------------------------------------------
   var updateImageDataCallback = function (response, urlParams) {

      //console.log("updateImageDataCallback: \n" + urlParams);
      var json;
      var oldLocn;
      var newImageDets;
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
         //console.log("updateImageDataCallback returning: response null");
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
         //console.log("updateImageDataCallback returning: json null");
         return false;
      }
      //console.log("updateImageDataCallback json ",json);

      len = selectedRowKeys.length;
      //console.log("selectedRowKeys.length %d",selectedRowKeys.length);

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         //console.log("key ",key);
         newImageDets = imageMarkerDetails[key];
	 newLocs = newImageDets.locdets;
         //console.log("newImageDets ",newImageDets);
	 //console.log("newLocs ",newLocs);
	 len3 = newLocs.length;
	 for(k=0; k<len3; k++) {
            newLocn = newLocs[k];
            //console.log("newLocn ",newLocn);
            if(newLocn.term.name == key) {
               //console.log("%s, %s, %s, %s,%s,%s",newLocn.id,newLocn.term.name,newLocn.term.description,newLocn.x,newLocn.y,newLocn.z);
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
   }; // updateImageDataCallback:

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
      
      keys = getImageKeys();
      len = keys.length;

      for(i=0; i<len; i++) {
         key = keys[i];
         mkrdets = imageMarkerDetails[key];
	 locdetArr = mkrdets.locdets;
	 len2 = locdetArr.length;
	 for(j=0; j<len2; j++) {
	    locdet = locdetArr[j];
	    locid = locdet.loc_id;
	    if(locid === testid) {
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

      keys = getImageKeys();
      //console.log("setMarkerTable keys ",keys);
      len = keys.length;

      for(i=0; i<len; i++) {
         key = keys[i];
         descr = imageMarkerDetails[key].descr;
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
   var storeImageKeys = function (imageData) {

      var item;
      var locations;
      var locn;
      var term;
      var len;
      var len2;
      var i,j;

      len = imageData.length;
      //console.log("imageData.length ",len);
      //console.log("imageData ",imageData);

      imageKeys = [];

      for(i=0; i<len; i++) {
         item = imageData[i];
         //console.log("ITEM ",item);
	 locations = item.locations;
	 len2 = locations.length;
         for(j=0; j<len2; j++) {
	    locn = locations[j];
	    term = locn.term;
	    imageKeys[imageKeys.length] = term.name;
	 }
      }
      //console.log("imageKeys ",imageKeys);
      // this function doesn't change the original so you need to assign it.
      imageKeys = utils.removeDuplicatesFromArray(imageKeys);
      // sort the keys numerically (they are strings)
      imageKeys.sort(function(A,B) {
	       return(parseInt(A)-parseInt(B));
            });

      //console.log("imageKeys ",imageKeys);

   }; // storeImageKeys

   //---------------------------------------------------------------
   var getImageKeys = function (imageData) {
      return imageKeys;
   };

   //---------------------------------------------------------------
   // Stores the details for the image
   //---------------------------------------------------------------
   var storeImageDetails = function (imageData) {

      var locations;
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

      keys = getImageKeys();
      len = keys.length;

      for(i=0; i<len; i++) {
         key = keys[i];
         //console.log("key = ",key);
	 locdets = [];
	 flags = [];
	 imageMarkerDetails[key] = {key:key, viz:false, flags:flags, locdets:locdets};
	    locations = imageData[0].locations;
	    len3 = locations.length;
            // for each location on this image, store details for appropriate key.
            for(k=0; k<len3; k++) {
	       locn = locations[k];
	       term = locn.term;
	       if(term.name ==  key) {
	          loc_id = locn.id;
	          x = locn.x;
	          y = locn.y;
	          z = locn.z;
                  //console.log("x %s, y %s, z %s",x,y,z);
	          smallLabel = makeMarkerSmallLabel(term);
	          bigLabel = makeMarkerBigLabel(key, locn);
	          flag = makeMarkerFlag(term, flags.length);
	          //imageMarkerDetails[key].EmapId = term.externalRef.source;
	          imageMarkerDetails[key].descr = term.description;
	          imageMarkerDetails[key].smallLabel = smallLabel;
	          imageMarkerDetails[key].bigLabel = bigLabel;
	          imageMarkerDetails[key].flags[flags.length] = flag;
	          imageMarkerDetails[key].locdets[locdets.length] = {img:imageData.name, loc_id:loc_id, x:x, y:y, z:z};
	       }
	    }
         }
     //console.log(imageMarkerDetails['cell_1']);
   }; // storeImageDetails

   //---------------------------------------------------------------
   var getLocationsForKey = function (key) {

      var locations = [];
      var markerDetails;
      var len;
      var i;

      markerDetails = imageMarkerDetails[key];
      //console.log("getLocationsForKey: markerDetails ",markerDetails);
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

      markerDetails = imageMarkerDetails[key];
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
   }; // makeMarkerFlag

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
   var makeMarkerLabelTableSpacer = function (tableBody, withRule) {

      var row;
      var cell;
      var entry;
      var klass;

      klass = withRule ? 'markerLabelTableSpacerCell ruled' : 'markerLabelTableSpacerCell';

      row = new Element("tr", {
      'class': 'markerLabelTableSpacerRow'
      });
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      cell = new Element("td", {
      'class': klass
      });
      entry = new Element('div', {
      });
      
      cell.inject(row, 'inside');
      entry.inject(cell, 'inside');
      
      row.inject(tableBody, 'inside');
   };

   //---------------------------------------------------------------
   var makeMarkerBigLabel = function (key, locn) {

      //console.log("makeMarkerBigLabel locn ",locn);

      //---------------------------------------------------------
      // the Container
      //---------------------------------------------------------
      var markerContainer;
      var term;
      var name;
      var descr;
      var markerBigLabelContainerDiv;
      var closeDiv;
      var closeImg;

      markerContainer = $(markerContainerId);
      term = locn.term;
      name = term.name;
      descr = term.description;

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
      // container for the Table of info
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
					  'txt':'item ' + name + ':        ' +descr,
					  'action':''
                                      });
      //..........................................
      makeMarkerLabelTableSpacer(tableBody, true);
      //..........................................
      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'x',
					  'txt':'x = ' +locn.x,
					  'action':''
                                      });
      //..........................................
      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'y',
					  'txt':'y = ' + locn.y,
					  'action':''
                                      });
      //..........................................
      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'z',
					  'txt':'z = ' + locn.z,
					  'action':''
                                      });
      //..........................................
      makeMarkerLabelTableSpacer(tableBody, true);
      makeMarkerLabelTableSpacer(tableBody, false);
      makeMarkerLabelTableSpacer(tableBody, false);
      //..........................................
      makeMarkerLabelTableEntry(tableBody, {
                                          'key':'info',
					  'txt':'put links etc here',
					  'action':''
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

   }; //doMouseOverLabelTableRow

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

   }; //doMouseOoutLabelTableRow

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
   }; //doMouseUpLabelTableRow

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

      //console.log("setMarkerSrc %s, %s",key, src);

      if(key === undefined || key === null || key === "") {
         return false;
      }

      markerNode = imageMarkerDetails[key];
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
      var markerNode;
      var locations;
      var locn;

      key = getKeyFromStr(target.id, true);

      allowClosestMarkers = true;

      if(keyPresent(key, true)) {
         if(isWlz) {
            markerNode = imageMarkerDetails[key];
            locations = markerNode.locdets;
            locn = locations[0];
            getTransformed3DPoint('doMouseOutMarker', key, 0, locn, 'markersrc');
         } else {
            setMarkerSrc(key, srcSelected);
         }
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
      positionMarker('doMouseOverTableRow', key);
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
         if(isWlz) {
            markerNode = imageMarkerDetails[key];
            locations = markerNode.locdets;
            locn = locations[0];
            getTransformed3DPoint('doMouseUpTableRow', key, 0, locn, 'markersrc');
         } else {
            setMarkerSrc(key, srcSelected);
         }
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
   }; // doMouseOutTableRow

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
         markerNode = imageMarkerDetails[selectedRowKeys[i]];
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
	 positionMarker('doMouseUpTableRow', key);
	 // add the key for this marker to the list of selected markers
	 selectedRowKeys[selectedRowKeys.length] = key;
	 selectedRowKeys = utils.removeDuplicatesFromArray(selectedRowKeys);
      } else {
	 // general users want multiple selections in the table
         if(isWlz) {
            markerNode = imageMarkerDetails[key];
            locations = markerNode.locdets;
            locn = locations[0];
            getTransformed3DPoint('doMouseUpTableRow', key, 0, locn, 'markersrc');
         } else {
            setMarkerSrc(key, srcSelected);
         }
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

      if(selectedRowKeys === null || selectedRowKeys === undefined || selectedRowKeys.length <= 0) {
         return false;
      }

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

      //console.log("hideTempMarkers");

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

      //console.log("showTempMarkers");

      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 if(!keyPresent(key, true)) {
	    setMarkerSrc(key, srcClosest);
	    displayMarker(key);
	    positionMarker('showTempMarkers', key);
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

      keys = getImageKeys();
      len = keys.length;

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
         markerNode = imageMarkerDetails[key];
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
	 //console.log("marker %s: %d,%d",marker.key,marker.x,marker.y);
      }
   };

   //---------------------------------------------------------------
   var createElements = function (modelChanges) {

      //.................................................
      var pointClickTableDiv = $('pointClickTableDiv');
      var EDITOR = model.isEditor();
      //console.log("EDITOR ",EDITOR);

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
	    'checked': false
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

/*
      len = tempMarkerKeys.length;
      for(i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 displayMarkerTxt(key);
	 positionMarkerTxt(key);
      }
*/
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
      var image;
      var locations;
      var locn;
      var len;
      var len2;
      var i;
      var j;
      var row;
 
      image = currentImg;

      len = selectedRowKeys.length;

      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 row = getRowWithKey(key);
	 //row.className = 'pointClickTableRow selected';
         markerNode = imageMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(image != currentImg) {
	       continue;
	    }
            //console.log("showSelectedMarkers %s, %s",key,srcSelected);
            if(isWlz) {
               markerNode = imageMarkerDetails[key];
               locations = markerNode.locdets;
               locn = locations[0];
               getTransformed3DPoint('doMouseOutMarker', key, 0, locn, 'markersrc');
            } else {
               setMarkerSrc(key, srcSelected);
            }
	    displayMarker(key);
	    positionMarker('showSelectedMarkers', key);
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

      keys = getImageKeys();
      len = keys.length;

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = keys[i];
	 row = getRowWithKey(key);
	 row.className = 'pointClickTableRow selected';
         markerNode = imageMarkerDetails[key];
	 locations = markerNode.locdets;
	 len2 = locations.length;
	 for(j=0; j<len2; j++) {
	    locn = locations[j];
	    if(locn.img != currentImg) {
	       //console.log("different image %d, %d",i,j);
	       //continue;
	    }
	    if(locn.x === "0" && locn.y === "0") {
	       continue;
	    }

	    selectedRowKeys[selectedRowKeys.length] = key;
            if(isWlz) {
               markerNode = imageMarkerDetails[key];
               locations = markerNode.locdets;
               locn = locations[0];
               getTransformed3DPoint('showAllMarkers', key, 0, locn, 'markersrc');
            } else {
               setMarkerSrc(key, srcSelected);
            }
	    displayMarker(key);
	    positionMarker('showAllMarkers', key);
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
      var len = selectedRowKeys.length;
      var i;

      for (i=0; i<len; i++) {
         key = selectedRowKeys[i];
	 positionMarker('updateMarkerPositions', key);
	 //positionMarkerLabel(key);
      }
/*
      len = tempMarkerKeys.length;
      for (i=0; i<len; i++) {
         key = tempMarkerKeys[i];
	 positionMarker('updateMarkerPositions', key);
	 //positionMarkerLabel(key);
      }
*/
   };
   
   //---------------------------------------------------------------
   // There may be multiple markers asociated with a key
   //---------------------------------------------------------------
   var displayMarker = function (key) {

      var markerNode;
      var locdets;
      var image;
      var flags;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }
      if(markerNotDefined(key)) {
         //console.log("displayMarker, marker %s not defined",key);
         return false;
      }
      //console.log("displayMarker currentImg %s, key %s",currentImg,key);

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      //console.log("displayMarker  markerNode ",markerNode);
      locdets = markerNode.locdets;
      flags = markerNode.flags;
      len = locdets.length;
      //console.log("displayMarker flags ",flags);

      for(i=0; i<len; i++) {
         if(image != currentImg) {
            flags[i].setStyles({
               'visibility': 'hidden'
            });
         } else {
            flags[i].setStyles({
               'visibility': 'visible'
            });
            //console.log("displayMarker %s ",key,flags[i]);
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
      var image;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      for(i=0; i<len; i++) {
	 if(image == currentImg) {
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
      var image;
      var len;
      var i;
      var l;
      var t;
      var x;
      var y;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;

      for(i=0; i<len; i++) {
	 //subplate = locations[i].img;
	 if(image == currentImg) {
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
   var positionMarker = function (from, key) {

      var markerNode;
      var locations;
      var image;
      var flags;
      var len;
      var i;
      var locn;
      var displayX;
      var displayY;

      //console.log("positionMarker %s called from %s",key,from);

      if(key === undefined || key === null || key === "") {
         return false;
      }
      if(markerNotDefined(key)) {
         //console.log("positionMarker, marker %s not defined",key);
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;
      //console.log("locations ",locations);
      for(i=0; i<len; i++) {
         locn = locations[i];
         if(isWlz) {
            // this needs a call to IIP3DServer and so control passes to ajax callback
            getTransformed3DPoint('positionMarker', key, i, locn, 'posmarker');
         } else {
            displayX =  locn.x * scale + imgOfs.x;
            displayY =  locn.y * scale + imgOfs.y;
            markerNode.flags[i].setStyles({
   	       'left': displayX,
   	       'top': displayY
            });
            if(SHOW_MARKER_TXT) {
               positionMarkerTxt(key);
   	    }
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

      //console.log("displayMarkerLabel %s, %s",key,small);

      var markerNode;
      var locations;
      var image;
      var label;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }

      if(image == currentImg) {
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
      var image;
      var label;
      var which;
      var x;
      var y;
      var newX;
      var newY;

      //console.log("positionMarkerLabel %s, %s",key,small);

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;
      small = (small === null || small === undefined) ? false : small;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      if(small) {
         if(!markerNode.smallLabel) {
            return false;
         }
         label = markerNode.smallLabel;
      } else {
         if(!markerNode.bigLabel) {
            return false;
         }
         label = markerNode.bigLabel;
      }

      locn = locations[0];

      if(isWlz) {
         which = small ? 'smalllabel' : 'biglabel';
         getTransformed3DPoint('positionMarkerLabel',key,0,locn,which);
      } else {
         if(image == currentImg) {
            x = parseFloat(locn.x);
            y = parseFloat(locn.y);
            //console.log("X = %d, Y = %d",x,y);
            newX = x * scale + imgOfs.x + labelOfs.x;
            newY = y * scale + imgOfs.y + labelOfs.y;
            //console.log("newX = %d, newY = %d",newY,newY);
            label.setStyles({
               'left': newX,
               'top': newY
            });
         }
      }
   };
   
   //---------------------------------------------------------------
   var hideMarkerLabel = function (key, small) {

      var markerNode;
      var locations;
      var image;
      var label;

      //console.log("hideMarkerLabel %s, %s",key,small);

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      //console.log("hideMarkerLabel markerNode ",markerNode);
      locations = markerNode.locdets;
      if(small === "true" || small === true) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }

      if(image == currentImg && label) {
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

      if(selectedRowKeys === null || selectedRowKeys === undefined || selectedRowKeys.length <= 0) {
         return false;
      }

      len = selectedRowKeys.length;
      //console.log("hideAllMarkers selectedRowKeys ",selectedRowKeys);

      //console.log("currentImg ",currentImg);
      for(i=0; i<len; i++) {
         key = selectedRowKeys[i];
         markerNode = imageMarkerDetails[key];
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
      var image;
      var flags;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      flags = markerNode.flags;
      len = locations.length;

      for(i=0; i<len; i++) {
	 if(image == currentImg) {
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
      var image;
      var len;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      image = currentImg;

      markerNode = imageMarkerDetails[key];
      locations = markerNode.locdets;
      len = locations.length;

      for(i=0; i<len; i++) {
	 if(image == currentImg) {
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
         if(isWlz) {
            showSelectedMarkers();
         } else {
            previousImg = currentImg;
            currentImg = pointClickImgData.sectionMap[dst.cur];
            //console.log(currentImg);
            showSelectedMarkers();
         }
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function (viewChanges, from) {

      //console.log("viewUpdate");
      if(viewChanges.initial === true) {
	 //window.setVisible(false);
         var dst = model.getDistance();   
	 currentImg = pointClickImgData.image;
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
         //console.log("viewChanges.editorPointClick");
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
         return imageMarkerDetails;
      } else {
         return imageMarkerDetails[key];
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
         details[selectedRowKeys[i]] = imageMarkerDetails[selectedRowKeys[i]];
      }

      return details;
   };
   
   //---------------------------------------------------------------
   // If there is an un-specified location, set it to the clicked point
   //---------------------------------------------------------------
   var addMarkerLocation = function () {

      var point;
      var threeDInfo;
      var selected;
      var key;
      var markerDetails;
      var image;
      var locations;
      var locn;
      var x;
      var y;
      var z;
      var len;
      var i;
      var fujx;
      var fujy;

      image = currentImg;

      point = view.getPointClickPoint();
      selected = getSelectedTableItem();
      if(!selected) {
         //console.log("addMarkerLocation returning early");
         return false;
      }
      key = selected.key;
      markerDetails = imageMarkerDetails[key];
      locations = markerDetails.locdets;

      //console.log("addMarkerLocation: point click point'  ", point);
      len = locations.length;
      i;

      fujx = parseInt(fudge.x / scale);
      fujy = parseInt(fudge.y / scale);

      for(i=0; i<len; i++) {
         locn = locations[i];
	 if(image == currentImg) {
            //console.log("addMarkerLocation found un-specified location");
            //console.log("addMarkerLocation: current recorded location  ", locn);
	    if(markerNotDefined(key)) {
               if(isWlz) {
                  x = Math.round(point.x) + fujx;
                  y = Math.round(point.y) + fujy;
                  z = Math.round(point.z);
                  locn.x = x.toString(10);
                  locn.y = y.toString(10);
                  locn.z = z.toString(10);
               } else {
                  x = Math.round(point.x / scale);
                  y = Math.round(point.y / scale);
                  locn.x = x.toString(10);
                  locn.y = y.toString(10);
                  locn.z = "0";
               }
               console.log("addMarkerLocation: new recorded location  ", locn);
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
         node = imageMarkerDetails[key];
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

      var resources
      var ajaxParams;
      var urlParams;
      var ajax;
      var url;
      var locs;
      var jsonStr;
      var len;
      var i;

      resources = isWlz ? "tpr_demo_3d" : "tpr_demo";

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

      urlParams = "markers=" + jsonStr + "&resources=" + resources,

      url = '/tprwebapp/SaveMarkersSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams: urlParams,
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
         console.log("doSaveSelectedMarkersCallback returning");
         return false;
      }

      updateImageData();

   }; // doResetSelectedMarkersCallback:
   
   //---------------------------------------------------------------
   var doResetSelectedMarkers = function (e) {

      var ajax;
      var ajaxParams;
      var urlParams;
      var resources;
      var url;
      var locs;
      var locn;
      var jsonStr;
      var len;
      var i;

      resources = isWlz ? "tpr_demo_3d" : "tpr_demo";

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

      urlParams = "markers=" + jsonStr + "&resources=" + resources,

      url = '/tprwebapp/SaveMarkersSQL';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:urlParams,
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

      updateImageData();

   }; // doResetSelectedMarkersCallback:
   
   //---------------------------------------------------------
   var markerNotDefined = function (key) {
      
      var notDefined;
      var locdet

      notDefined = false;
      locdet = getMarkerByLocId(key);

      //console.log("markerNotDefined key %s, locdet ",key,locdet);

      if(locdet.x === "0" && locdet.y === "0") {
         notDefined = true;
      }

      return notDefined;
   };

   //---------------------------------------------------------
   var printImageInfo = function () {
   
      var fullImgDims;
      var bbox;
      var tbbox;
      var tilesize;
      var viewportDims;
      var viewportDims;

      tilesize = model.getTileSize();
      console.log("tilesize ",tilesize);
      console.log("================================================");

      viewportDims = view.getViewportDims();
      console.log("viewportDims ",viewportDims);
      console.log("================================================");

      fullImgDims = model.getFullImgDims();
      console.log("fullImgDims ",fullImgDims);
      console.log("================================================");

      bbox = model.getBoundingBox();
      console.log("bbox ",bbox);
      console.log("================================================");

      getTransformedBoundingBox();

      console.log("======================================================================");
      //view.testCoordSystem();

   };

   //--------------------------------------------------------------
   var getTransformedBoundingBox = function() {

      var transformedBBArray = [];
      var url;
      var ajaxParams;
      
      url = getURL4IIP3DServer("Wlz-transformed-3d-bounding-box");

      ajaxParams = {
         url:url,
	 method:"POST",
	 callback:getTransformedBoundingBoxCallback,
	 contentType:"",
	 urlParams:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   };

   //---------------------------------------------------------
   var getTransformedBoundingBoxCallback = function (response) {

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

      values = response.split("Wlz-transformed-3d-bounding-box:")[1]
      valArr = values.split(" ");
      //console.log("getTransformedBoundingBoxCallback valArr = ",valArr);
      x = valArr[4];
      y = valArr[2];
      z = valArr[0];
     //console.log("getTransformedBoundingBoxCallback %d, %d, %d",x,y,z);

   };

   //--------------------------------------------------------------
   var getTransformed3DPoint = function(from, key, indx, point3D, callbackName) {

      var transformed3DPoint;
      var threeDInfo;
      var url;
      var urlParams;
      var ajaxParams;
      
      //console.log("getTransformed3DPoint called from %s",from);

      // if the x & y coords are 0 the point hasn't been defined yet.
      if(markerNotDefined(key)) {
         threeDInfo = model.getThreeDInfo();
         //console.log("getTransformed3DPoint 3D info ",threeDInfo);
         //point3D.z = threeDInfo.fxp.z;
      }

      //console.log("getTransformed3DPoint %d, %d, %d",point3D.x,point3D.y,point3D.z);

      url = getURL4IIP3DServer("Wlz-transformed-coordinate-3d", point3D);

      if(callbackName.toLowerCase() === 'smalllabel') {
         urlParams = "key=" + key + "&indx=" + indx + "&callback=label&small=" + true;
      } else if(callbackName.toLowerCase() === 'biglabel') {
         urlParams = "key=" + key + "&indx=" + indx + "&callback=label&small=" + false;
      } else if(callbackName.toLowerCase() === 'addmarker') {
         urlParams = "key=" + key + "&indx=" + indx + "&callback=" + callbackName;
      } else if(callbackName.toLowerCase() === 'posmarker') {
         urlParams = "key=" + key + "&indx=" + indx + "&callback=" + callbackName;
      } else if(callbackName.toLowerCase() === 'markersrc') {
         urlParams = "key=" + key + "&indx=" + indx + "&callback=" + callbackName;
      } else {
         //console.log("callback function unrecognised");
      }

      ajaxParams = {
         url:url,
	 method:"POST",
	 callback:getTransformed3DPointCallback,
	 urlParams:urlParams,
	 contentType:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);
   };

   //---------------------------------------------------------
   var getTransformed3DPointCallback = function (response, params) {

      var values;
      var valArr = [];
      var key;
      var indx;
      var x;
      var y;
      var d;
      var tpoint;
      var callbackName;
      var callbackFunction;

      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return undefined;
      }

      values = response.split("Wlz-transformed-coordinate-3d:")[1]
      valArr = values.split(" ");
      //console.log("getTransformed3DPointCallback valArr = ",valArr);
      x = valArr[0];
      y = valArr[1];
      d = valArr[2];
      //console.log("getTransformed3DPointCallback %d, %d, %d",x,y,d);
      tpoint = {x:x, y:y, d:d};

      callbackName = emouseatlas.emap.utilities.getURLParam("callback", params);
      //console.log("callbackName %s",callbackName);
      callbackFunction = funcs[callbackName];

      if(callbackName.toLowerCase() === 'markersrc') {
         //console.log(params);
         key = emouseatlas.emap.utilities.getURLParam("key", params);
         indx = emouseatlas.emap.utilities.getURLParam("indx", params);
         callbackFunction(key, d, indx);
      } else {
         callbackFunction(params, tpoint);
      }

   };

   //--------------------------------------------------------------
   var position3DMarker = function(params, tpoint) {

      var ix;
      var iy;
      var idst;
      var dist;
      var markerSrc;
      var markerLeft;
      var markerTop;
      var markerLeftPx;
      var markerTopPx;
      var key;
      var indx;
      var markerNode;
      var visibility;
      var viz;
      var viewerContainerPos;

      //console.log("enter position3DMarker tpoint: ",tpoint);

      key = emouseatlas.emap.utilities.getURLParam("key", params);
      indx = emouseatlas.emap.utilities.getURLParam("indx", params);

      dist = model.getDistance().cur;

      ix = parseInt(tpoint.x);
      iy = parseInt(tpoint.y);
      idst = parseInt(tpoint.d);

      //console.log("enter position3DMarker params: ",params);
      //console.log("enter position3DMarker ix %d, iy %d, idst %d",ix,iy,idst);
      //console.log("enter position3DMarker scale: ",scale);
      //console.log("enter position3DMarker dist: ",dist);

      markerSrc = set3DMarkerSrc(key, tpoint.d, indx);

      if(markerSrc === undefined) {
         visibility = 'hidden';
         viz = false;
      } else {
         visibility = 'visible';
         viz = true;
      }

      viewerContainerPos = view.getViewerContainerPos();
      //console.log(viewerContainerPos);

      markerLeft =  ix * scale + imgOfs.x;
      markerTop =  iy * scale + imgOfs.y;

      markerLeftPx = markerLeft + "px";
      markerTopPx = markerTop + "px";
      //console.log("enter position3DMarker markerLeft ",markerLeft);
      //console.log("enter position3DMarker markerTop ",markerTop);

      markerNode = imageMarkerDetails[key];
      //markerNode.flags[indx].firstChild.set('src', markerSrc);
      markerNode.flags[indx].setStyles({
         'left': markerLeft,
         'top': markerTop,
         'visibility': visibility
      });

      if(SHOW_MARKER_TXT) {
         position3DMarkerTxt(key, indx, {x:markerLeft, y:markerTop}, viz);
      }
   }; // position3DMarker

   //--------------------------------------------------------------
   var position3DMarkerLabel = function(params, tpoint) {

      var isSmall;
      var label;
      var labelLeft;
      var labelTop;
      var labelLeftPx;
      var labelTopPx;
      var key;
      var markerNode;
      var image;
      var label;
      var x;
      var y;
      var newX;
      var newY;

      //console.log("enter position3DMarkerLabel ",params);

      image = currentImg;

      small = emouseatlas.emap.utilities.getURLParam("small", params);
      small = (small === true || small === 'true') ? true : false;
      //console.log("enter position3DMarkerLabel ",small);

      labelLeft =  tpoint.x * scale + imgOfs.x + labelOfs.x;
      labelTop =  tpoint.y * scale + imgOfs.y + labelOfs.y;

      labelLeftPx = labelLeft + "px";
      labelTopPx = labelTop + "px";

      key = emouseatlas.emap.utilities.getURLParam("key", params);

      markerNode = imageMarkerDetails[key];
      if(small) {
         label = markerNode.smallLabel;
      } else {
         label = markerNode.bigLabel;
      }
      label.setStyles({
         'left': labelLeft,
         'top': labelTop,
         'visibility':'visible'
      });
   };

   //--------------------------------------------------------------
   var position3DMarkerTxt = function(key, indx, pos, viz) {

      var id;
      var visibility;

      visibility = viz ? 'visible' : 'hidden';

      id = "markerTxtDiv_" + key + "_" + indx;

      markerTxt = $(id);
      if(markerTxt) {
         markerTxt.setStyles({
            'left': pos.x + 'px',
            'top': (pos.y + 5) + 'px',
            'visibility': visibility
         });
      }
   };

   //--------------------------------------------------------------
   var getURL4IIP3DServer = function(obj, point) {

      var url;
      var section;
      var webServer;
      var iipServer;
      var currentLayer;
      var layerData;
      var layer;
      var pab;
      
      //console.log("getURL4IIP3DServer point ",point);

      section = model.getThreeDInfo();
      webServer = model.getWebServer();
      iipServer = model.getIIPServer();
      currentLayer = view.getCurrentLayer();
      layerData = model.getLayerData();

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

      if(point !== null && point !== undefined) {
         pab = "&pab=" + point.x + ',' + point.y + ',' + point.z;
      } else {
         //console.log("getURL4IIP3DServer point not defined");
         pab = "";
      }

      url= 
         iipServer + "?wlz=" +  layer.imageDir + layer.imageName                                                                                                
         + "&mod=absolute"
         + "&fxp=" + section.fxp.x + ',' + section.fxp.y + ','+ section.fxp.z                                                                                                
         + "&dst=" + section.dst.cur                                                                                                                                                              
         + "&pit=" + section.pitch.cur
         + "&yaw=" + section.yaw.cur
         + "&rol=" + section.roll.cur
         + pab
         + "&obj=" + obj;

      return url;
   };

   //--------------------------------------------------------------
   var set3DMarkerSrc = function(key, dee, indx) {

      //console.log("set3DMarkerSrc: %s / %d distance from viewplane ",key,indx,dee);

      var src = undefined;
      var markerNode;
      var flagDivs;
      var len;
      var flagDiv;
      var flag;
      var i;

      if(key === undefined || key === null || key === "") {
         return false;
      }

      if(dee === undefined || dee === null || dee === "") {
         return false;
      }

      if(Math.abs(dee) <= 6 && Math.abs(dee) > 3) {
         if(keyPresent(key, true)) {
            src = srcSelected_33;
         } else {
            src = srcHighlighted_33;
         }
      } else if(Math.abs(dee) <= 3 && Math.abs(dee) >= 1) {
         if(keyPresent(key, true)) {
            src = srcSelected_66;
         } else {
            src = srcHighlighted_66;
         }
      } else if(Math.abs(dee) === 0) {
         if(keyPresent(key, true)) {
            src = srcSelected;
         } else {
            src = srcHighlighted;
         }
      }

      markerNode = imageMarkerDetails[key];
      markerNode.flags[indx].firstChild.set('src', src);
      return src;
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

}(); // end of module tprPointClick
