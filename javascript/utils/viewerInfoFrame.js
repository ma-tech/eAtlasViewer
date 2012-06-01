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
//   viewerInfo.js
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
// module for tiledImage
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.viewerInfo = function () {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var targetId;
   var target;
   var view;
   var infoIFrame;
   var mydocument;
   var myparent;
   var hideOK;
   var infoReadOK;
   var infoGeneratedOK;
   var infoDetails;
   var modelInfo;
   var ajax;
   var ajaxParams;
   var utils;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {
      targetId = params.targetId;
      target = document.getElementById(params.targetId);
      infoDetails = params.details;
      view = params.view;
      view.register(this);

      utils = emouseatlas.emap.utilities;

      infoIFrame = document.getElementById("wlzIIPViewerInfoIFrame");
      if(infoIFrame === undefined) {
         return false;
      }
      mydocument = window.frames[infoIFrame.name].document;
      myparent = window.frames[infoIFrame.name].parent;

      hideOK = false;
      infoReadOK = false;
      infoGeneratedOK = false;

      if(infoDetails.jso !== undefined && infoDetails.jso !== "") {
	 ajax = new emouseatlas.emap.ajaxContentLoader();
	 ajaxParams = {
	    url: infoDetails.jso,
	    method:"POST",
	    callback: readInfoCallback,
	    contentType:"",
	    urlParams:"",
	    async:true,
	    noCache:false
	 };
	 ajax.loadResponse(ajaxParams);
      }

   };

   //---------------------------------------------------------
   var readInfoCallback = function (response) {

      var json;
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }
      if(!json) {
         return false;
      }

      modelInfo = json;
      if(modelInfo === undefined) {
         infoReadOK = false;
      } else {
         infoReadOK = true;
      }

   };
   
   //---------------------------------------------------------------
   var generateInfoPage = function () {
      var closeDiv = mydocument.getElementById("modelInfoFrameCloseDiv");
      var mainContainer;
      mainContainer = mydocument.getElementById("modelInfoMainContainer");
      if(mainContainer === undefined || mainContainer === null) {
         return false;
      }
      var iframe = myparent.document.getElementById("wlzIIPViewerInfoIFrame");
      var doc = iframe.contentDocument;
      var iframeContainer = myparent.document.getElementById("wlzIIPViewerInfoIFrameContainer");
      iframe.className = "hullaballoo";

      if(mainContainer) {
	 utils.removeChildNodes(mainContainer);
      } else {
         // it's probably IE8
         var bdy = doc.childNodes[0].childNodes[1];
         bdy.className = "iframe";
	 mainContainer = new Element('div', {
	        "id" : "modelInfoMainContainer",
                "class" : "wlzIIPViewerIFrameContainer",
		"styles": {
		   'margin' : '0',
		   'padding' : '0',
		   'width' : '100%',
		   'height' : '100%'
		}
         });
	 mainContainer.injectInside(bdy);
      }

      var info = modelInfo[infoDetails.assocIndx];
      if(info === undefined || info.length === 0) {
         return false;
      }
      var labels = modelInfo.labels;
      var rows = modelInfo.rows;

      var klass = "";
      var nrows = rows.length;

      iframe.className = "wlzIIPViewerIFrame modelInfo";
      iframeContainer.className = "wlzIIPViewerIFrameContainer modelInfo";

      var row;
      var txt;
      var indx;
      var i;
      var j;

      var head;
      var header;
      var headerText;

      var rowHeader;
      var rowHeaderText;
      var rowData;
      var rowDataText;
      var anchor;
      var linkText;

      var tBody; // required for IE8 or the table is invisible

      var infoTable = doc.createElement('table');
      infoTable.id = "modelInfoTable";
      infoTable.cellSpacing = "2";
      infoTable.cellPadding = "2";
      infoTable.style.margin = "auto";

      // the tBody
      tBody = doc.createElement('tBody');
      infoTable.appendChild(tBody);

      indx = getModelIndex(info);
      // the rows of data
      for(i=0; i<nrows; i++) {
         txt = labels[rows[i]];
         row = doc.createElement('tr');
	 row.className = "help row";
         tBody.appendChild(row);

	 header = doc.createElement('td');
	 header.className = "rowHeader";
	 row.appendChild(header);

	 headerText = doc.createTextNode(txt);
	 header.appendChild(headerText);

         txt = info[indx][rows[i]];
         rowData = doc.createElement('td');
         rowData.className = "rowData";
         row.appendChild(rowData);
         anchor = utils.textContainsLink(txt);
         if(anchor !== undefined) {
            addDataWithLink(doc, rowData, txt, anchor);
         } else {
            rowDataText = doc.createTextNode(txt);
            rowData.appendChild(rowDataText);
         }
      }

      mainContainer.appendChild(infoTable);

      infoGeneratedOK = true;
   };

   //---------------------------------------------------------------
   // adds the row data with link
   //---------------------------------------------------------------
   var addDataWithLink = function (doc, rowData, txt, anchor) {
      var linkInfo = utils.getLinkInfo(txt,anchor);
      var normalText;
      var anchorTag;
      var linkText;
      var href = utils.getLinkHref(anchor);

      normalText = doc.createTextNode(linkInfo[0]);
      rowData.appendChild(normalText);

      anchorTag = doc.createElement('a');
      anchorTag.name = 'link';
      anchorTag.href = href;
      anchorTag.target = '_blank';
      rowData.appendChild(anchorTag);

      linkText = doc.createTextNode(linkInfo[1]);
      anchorTag.appendChild(linkText);

      normalText = doc.createTextNode(linkInfo[2]);
      rowData.appendChild(normalText);
   };

   //---------------------------------------------------------------
   var getModelIndex = function (info) {

      var len = info.length;
      var i;
      var id;

      for(i=0; i<len; i++) {
         id = info[i].id;
	 if(id === infoDetails.id) {
	    return i;
	 }
      }
      return -1;
   };

   //---------------------------------------------------------------
   var viewUpdate = function (changes) {

      if(changes.showViewerInfo) {
	 generateInfoPage();
         infoIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hideViewerInfo) {
         infoIFrame.setStyle('visibility', 'hidden');
      }
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      viewUpdate: viewUpdate
   };

}(); // end of module viewerInfoFrame
//----------------------------------------------------------------------------
