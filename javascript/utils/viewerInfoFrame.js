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
   var _debug;
   var targetId;
   var target;
   var model;
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
   var prnt;
   var lmntArr;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      _debug = false;
      targetId = params.targetId;
      target = document.getElementById(params.targetId);
      infoDetails = params.details;
      model = params.model;
      model.register(this);
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

      lmntArr = [];

   };

   //---------------------------------------------------------
   var readInfoCallback = function (response) {

      var json;
      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         json = JSON.parse(response);
      } else {
         json = emouseatlas.JSON.parse(response);
      }

      modelInfo = json;
      if(modelInfo === undefined) {
         infoReadOK = false;
      } else {
         infoReadOK = true;
	 //console.log(modelInfo["ts23"]);
	 //console.log(modelInfo);
      }

   };
   
   //---------------------------------------------------------------
   var generateInfoPage = function () {

      var closeDiv;
      var mainContainer;
      var iframe;
      var doc;
      var iframeContainer;
      var bdy;
      var info;
      var labels;
      var rows;
      var klass;
      var nrows;
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
      var tBody; // required for IE8 or the table is invisible
      var infoTable;
      var project;

      closeDiv = mydocument.getElementById("modelInfoFrameCloseDiv");
      mainContainer;
      mainContainer = mydocument.getElementById("modelInfoMainContainer");
      if(mainContainer === undefined || mainContainer === null) {
         return false;
      }
      iframe = myparent.document.getElementById("wlzIIPViewerInfoIFrame");
      doc = iframe.contentDocument;
      iframeContainer = myparent.document.getElementById("wlzIIPViewerInfoIFrameContainer");
      iframe.className = "hullaballoo";

      if(mainContainer) {
	 utils.removeChildNodes(mainContainer);
      } else {
         // it's probably IE8
         bdy = doc.childNodes[0].childNodes[1];
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

      //console.log("assocIndx ",infoDetails.assocIndx);
      info = modelInfo[infoDetails.assocIndx];
      if(info === undefined || info.length === 0) {
         //console.log("no model info");
         return false;
      } else {
         //console.log("info for %s",infoDetails.assocIndx, info);
      }
      labels = modelInfo.labels;
      rows = modelInfo.rows;

      klass = "";
      nrows = rows.length;
      project = model.getProject();

      iframe.className = "wlzIIPViewerIFrame modelInfo "+ project;
      iframeContainer.className = "wlzIIPViewerIFrameContainer modelInfo " + project;

      infoTable = doc.createElement('table');
      infoTable.id = "modelInfoTable";
      infoTable.id = "info";
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

         if(info[indx]) {
	    txt = info[indx][rows[i]];
	    rowData = doc.createElement('td');
	    rowData.className = "rowData";
	    row.appendChild(rowData);
	    addRowData(txt, rowData);
	 }
      }

      mainContainer.appendChild(infoTable);

      infoGeneratedOK = true;
   };

   //---------------------------------------------------------
   var addRowData = function (htmlString, trgt) {

      var deb = _debug;
      var parser;

      if(_debug) console.log("enter addRowData ",trgt);

      prnt = trgt;
      lmntArr = [];
      lmntArr[0] = trgt;

      HTMLParser(htmlString, {
         start: function(tag, attrs, unary) {doStart(tag, attrs, unary)},
         end: function(tag) {doEnd(tag, trgt)},
         chars: function(text) {doChars(text)},
         comment: function(text) {doComment(text)}
      });

      if(_debug) console.log("exit addRowData");
      _debug = deb;
   };

   //---------------------------------------------------------
   var doStart = function (tag, attrs, unary) {

      if(_debug) {
         console.log("enter doStart: tag ",tag);
         console.log("enter doStart: attrs ",attrs);
         console.log("enter doStartunary ",unary);
      }

      var lmnt;
      var attr;
      var len;
      var i;
      
      len = attrs.length;

      lmnt = document.createElement(tag);
      i = 0;
      for (i=0; i<len; i++) {
         attr = attrs[i];
         if(_debug) console.log(attr);
         lmnt.setAttribute(attr.name, attr.value);
      }

      if(!unary) {
         lmntArr.push(lmnt);
         //console.log("lmntArr ",lmntArr);
         prnt.appendChild(lmnt);
         prnt = lmnt;
      } else {
         //console.log("unary tag ",tag);
         prnt = lmntArr[lmntArr.length - 1];
         lmntArr.push(lmnt);
         //console.log("prnt ",prnt);
         prnt.appendChild(lmnt);
      }

      if(_debug) console.log("exit doStart ",lmnt);
   }; // doStart

   //---------------------------------------------------------
   var doEnd = function (tag, trgt) {

      var deb = _debug;
      //_debug = true;

      if(_debug) {
         console.log("enter doEnd ",tag);
         console.log("prnt ",prnt);
         console.log("lmntArr ",lmntArr);
      }

      lmntArr.length -= 1;

      //console.log("lmntArr.length now ",lmntArr.length);
      if(lmntArr.length > 1) {
         prnt = lmntArr.pop();
      } else {
         //console.log("can't pop ",lmntArr);
         prnt = trgt;
      }
      //console.log("prnt ",prnt);

      if(_debug) console.log("exit doEnd %s ",tag,prnt);

      _debug = deb;
       _debug = false;
   };

   //---------------------------------------------------------
   var doChars = function (text) {

      if(_debug) {
         console.log("enter doChars: %s",text);
         console.log("enter doChars: prnt ",prnt);
      }

      var txtNode;
      
      if(typeof prnt === 'undefined') {
         return false;
      }

      txtNode = document.createTextNode(text);
      prnt.appendChild(txtNode);

      if(_debug) console.log("exit doChars ",prnt);
   };


   //---------------------------------------------------------
   var doComment = function (text) {
      if(_debug) console.log("enter doComment ",text);
   };

   //---------------------------------------------------------------
   var getModelIndex = function (info) {

      var len = info.length;
      var i;
      var id;

      //console.log("infoDetails.id ",infoDetails.id)
      for(i=0; i<len; i++) {
         id = info[i].id;
         //console.log("id ",id)
	 if(id === infoDetails.id) {
	    return i;
	 }
      }
      return -1;
   };

   //---------------------------------------------------------------
   var modelUpdate = function (changes) {

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
   var getName = function () {
      //console.log(observer);
      return 'viewerInfo';
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      getName: getName,
      viewUpdate: viewUpdate
   };

}(); // end of module viewerInfoFrame
//----------------------------------------------------------------------------
