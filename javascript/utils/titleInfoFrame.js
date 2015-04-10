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
//   titleInfo.js
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
emouseatlas.emap.titleInfo = function () {

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
   var titleIFrame;
   var mydocument;
   var myparent;
   var hideOK;
   var infoGeneratedOK;
   var infoDetails;
   var rowLabels;
   var rowContent;
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

      var plate;
      var subplate;
      var info;

      //console.log(params);

      _debug = false;
      targetId = params.targetId;
      target = document.getElementById(params.targetId);
      details = params.details;
      info = details.info;
      model = params.model;
      model.register(this);
      view = params.view;
      view.register(this);

      utils = emouseatlas.emap.utilities;

      //console.log("IFrame: details ",details);
      //console.log("IFrame: info ",info);

      titleIFrame = document.getElementById("wlzIIPViewerTitleIFrame");
      if(titleIFrame === undefined) {
         if(_debug) console.log("titleIFrame === undefined");
         return false;
      }
      mydocument = window.frames[titleIFrame.name].document;
      myparent = window.frames[titleIFrame.name].parent;

      //console.log("myDocument ",mydocument);
      //console.log("myParent ",myparent);

      hideOK = false;
      infoGeneratedOK = false;

      setTableContent(info);

      lmntArr = [];

      plate = details.plate;
      subplate = details.subplate;

      generateInfoPage();

      //console.log(myparent);
      //myparent.titleIFrameLoaded(titleIFrame);

      addLinks(info);

   };
   
   //---------------------------------------------------------------
   var setTableContent = function (info) {

      var dpcTxt;
      var tsTxt;
      var dpcTxt;
      var tsTxt;
      var witTxt;
      var carTxt;
      var emdash = '—';


//      rowLabels = ["Age", "Description", "Section orientation", "Crown—rump length", "Theiler Stage", "rat, Witschi Stage", "human, Carnegie Stage"];
      rowLabels = ["Age", "Description", "Section orientation", "Crown\u2014rump length", "Theiler Stage", "rat, Witschi Stage", "human, Carnegie Stage"];

      dpcTxt = info.dpc;
      dpcTxt += " days p.c.";

      tsTxt = info.stage;

      rowContent = [];
      rowContent[0] = dpcTxt;
      rowContent[1] = info.description;
      rowContent[2] = info.sectionType;
      rowContent[3] = info.crLength;
      rowContent[4] = tsTxt;
      rowContent[5] = info.witschi;
      rowContent[6] = info.carnegie;

   };
   
   //---------------------------------------------------------------
   var addLinks = function (info) {

      var mainContainer;
      var iframe;
      var doc;
      var iframeContainer;
      var stage;
      var bottomDiv;
      var stageDefDiv;
      var emapStageDefA;
      var emapAnatomyA;
      var url_emapStageDef;
      var url_emapAnatomy;

      stage = info.stage;
      //console.log("stage %d",stage);
      // replaces leading non-digits with nothing
      stage = stage.replace( /^\D+/g, '');
      //console.log("stage %d",stage);
      stage = parseInt(stage);
      //console.log("stage %d",stage);
      //console.log("stage %d",stage);

      url_emapStageDef = "http://www.emouseatlas.org/emap/ema/theiler_stages/StageDefinition/ts" + stage + "definition.html";
      url_emapAnatomy = "http://www.emouseatlas.org/emap/ema/DAOAnatomyJSP/anatomy.html?stage=TS" + stage;

      mainContainer = mydocument.getElementById("titleInfoMainContainer");
      if(mainContainer === undefined || mainContainer === null) {
         //console.log("no main container");
         return false;
      } else {
         //console.log("got main container");
      }
      iframe = myparent.document.getElementById("wlzIIPViewerTitleIFrame");
      doc = iframe.contentDocument;

      bottomDiv = new Element('div', {
         'id': 'wlzIIPViewerTitleIFrameBottomDiv'
      });
      bottomTxt = new Element('text', {
         'id': 'wlzIIPViewerTitleIFrameBottomTxt',
	 'text': 'see also the '
      });
      bottomTxt2 = new Element('text', {
         'id': 'wlzIIPViewerTitleIFrameBottomTxt2',
	 'text': ' page'
      });

      stageDefDiv = new Element('div', {
         'id': 'wlzIIPViewerTitleIFrameStageDefDiv'
      });

      emapStageDefA = new Element('a', {
         'id': 'emapStageDefAnchor',
	 'text':'Theiler Stage Criteria',
	 'href':url_emapStageDef,
	 'target': '_parent'
      });

      emapADiv = new Element('div', {
         'id': 'wlzIIPViewerTitleIFrameEmapADiv',
	 'text': " and "
      });

      emapAnatomyA = new Element('a', {
         'id': 'emapAnatomyAnchor',
	 'text':'EMAP anatomy',
	 'href':url_emapAnatomy,
	 'target': '_parent'
      });

      bottomDiv.inject(mainContainer, 'inside');
      stageDefDiv.inject(bottomDiv, 'inside');
      bottomTxt.inject(stageDefDiv, 'before');
      emapADiv.inject(bottomDiv, 'inside');
      emapStageDefA.inject(stageDefDiv, 'inside');
      emapAnatomyA.inject(emapADiv, 'inside');
      bottomTxt2.inject(emapADiv, 'after');
   };
   
   /*
   //---------------------------------------------------------------
   var updateTableContent = function (info) {

      var dpcTxt;
      var tsTxt;
      var dpcTxt;
      var tsTxt;
      var witTxt;
      var carTxt;
      var emdash = '—';


      alert("updateTableContent");
      //rowLabels = ["Age", "Description", "Section orientation", "Crown—rump length", "Theiler Stage", "rat, Witschi Stage", "human, Carnegie Stage"];

      dpcTxt = info.dpc;
      dpcTxt += " days p.c.";

      tsTxt = info.stage;

      rowContent = [];
      rowContent[0] = dpcTxt;
      rowContent[1] = info.description;
      rowContent[2] = info.sectionType;
      rowContent[3] = info.crLength;
      rowContent[4] = tsTxt;
      rowContent[5] = info.witschi;
      rowContent[6] = info.carnegie;

   };
   */
   
   //---------------------------------------------------------------
   var generateInfoPage = function () {

      var closeDiv;
      var mainContainer;
      var iframe;
      var doc;
      var iframeContainer;
      var bdy;
      var klass;
      var nrows;
      var row;
      var txt;
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
      var test;

      //console.log("enter generateInfoPage");

      closeDiv = mydocument.getElementById("titleInfoFrameCloseDiv");
      //mainContainer;
      mainContainer = mydocument.getElementById("titleInfoMainContainer");
      if(mainContainer === undefined || mainContainer === null) {
         //console.log("no main container");
         return false;
      } else {
         //console.log("got main container");
      }
      iframe = myparent.document.getElementById("wlzIIPViewerTitleIFrame");
      doc = iframe.contentDocument;
      iframeContainer = myparent.document.getElementById("wlzIIPViewerTitleIFrameContainer");
      iframe.className = "hullaballoo";

      if(mainContainer) {
	 utils.removeChildNodes(mainContainer);
      }

     // console.log("mainContainer ",mainContainer);

      klass = "";
      nrows = rowLabels.length;
      project = model.getProject();
      //console.log(project);

      iframe.className = "wlzIIPViewerIFrame titleInfo " + project;
      iframeContainer.className = "wlzIIPViewerIFrameContainer titleInfo " + project;

      infoTable = doc.createElement('table');
      infoTable.id = "titleInfoTable";
      infoTable.class = "info";
      infoTable.cellSpacing = "2";
      infoTable.cellPadding = "2";
      infoTable.style.width = "100%";
      //infoTable.style.margin = "auto";

      // the tBody
      tBody = doc.createElement('tBody');
      infoTable.appendChild(tBody);

      // the rows of data
      for(i=0; i<nrows; i++) {
         txt = rowLabels[i];
         row = doc.createElement('tr');
	 row.className = "help row";
         tBody.appendChild(row);

	 header = doc.createElement('td');
	 header.className = "rowHeader";
	 row.appendChild(header);

	 headerText = doc.createTextNode(txt);
	 header.appendChild(headerText);

         txt = rowContent[i];
         rowData = doc.createElement('td');
         rowData.className = "rowData";
         row.appendChild(rowData);
         addRowData(txt, rowData);
      }

      mainContainer.appendChild(infoTable);

      infoGeneratedOK = true;

      //console.log("exit generateInfoPage");
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
         titleIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hideViewerInfo) {
         titleIFrame.setStyle('visibility', 'hidden');
      }
   };

   //---------------------------------------------------------
   var getName = function () {
      //console.log(observer);
      return 'titleInfo';
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

}(); // end of module titleInfoFrame
//----------------------------------------------------------------------------
