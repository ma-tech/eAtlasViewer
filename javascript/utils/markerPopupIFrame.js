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
//   markerPopup.js
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
emouseatlas.emap.markerPopup = function () {

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
   var project;
   var pointClick;
   var markerIFrame;
   var mydocument;
   var myparent;
   var emaModels;
   var hideOK;
   var infoGeneratedOK;
   var infoDetails;
   var anatomyRowLabels;
   var searchRowLabels;
   var anatomyRowContent;
   var searchRowContent;
   var ajax;
   var ajaxParams;
   var utils;
   var prnt;
   var lmntArr;
   //...........
   var emouseatlasUrl;
   var emaUrl;
   var stagedOntologyUrl;
   var abstractOntologyUrl;
   var emageQueryUrl;
   var emageQueryUrlParams;
   var mgiQueryUrl;
   var theilerBookChapterUrl;
   var theilerBookChapterUrlParams;
   var theHouseMouseUrl;
   //...........
   var ontologyInfo = {};
   var linkToTheHouseMouse;
   var emdash;
   var knum;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      var plate;
      var subplate;

     //console.log("markerPopupIFrame.initialise with params  ",params);

      _debug = false;
      targetId = params.targetId;
      target = document.getElementById(params.targetId);
      //details = params.details;
      //info = details.info;
      model = params.model;
      model.register(this, "markerPopup");
      view = params.view;
      view.register(this, "markerPopup");

      project = (params.project === undefined) ? "kaufman_atlas" : params.project;
      //console.log("markerPopupIFrame.initialise project %s",project);

      if(project === "kaufman_atlas") {
         pointClick = emouseatlas.emap.tiledImagePointClick;
      } else if(project === "kaufman_supplement") {
         pointClick = emouseatlas.emap.supplementPointClick;
      }
      //console.log("markerPopupIFrame.initialise pointClick ",pointClick);

      if(pointClick) {
         pointClick.register(this, "markerPopup");
      } else {
         return false;
      }

      //emdash = '—';
      emdash = '\u2014';

      imgDir = model.getAbsoluteInterfaceImageDir();
      //console.log("markerPopupIFrame imgDir %s",imgDir);

      utils = emouseatlas.emap.utilities;

      //console.log("IFrame: details ",details);
      //console.log("IFrame: info ",info);

      markerIFrame = document.getElementById("markerPopupIFrame");
      if(markerIFrame === undefined) {
         if(_debug) console.log("markerIFrame === undefined");
         return false;
      }
      mydocument = window.frames[markerIFrame.name].document;
      myparent = window.frames[markerIFrame.name].parent;


      hideOK = false;
      infoGeneratedOK = false;

      anatomyRowLabels = ["Kaufman term", "Stage", "Ontology ID", "Name (synonyms)", "Stage range", "3D viewer"];
      searchRowLabels = ["EMAGE", "MGI / GXD"];
      miscRowLabels = ["Wikipedia", "Kaufman Atlas"];


      lmntArr = [];

      constructUrls();

   }; // initialise

   //---------------------------------------------------------------
   var constructUrls = function () {

      var webServer;
      var urlData;

      webServer = model.getWebServer();
      urlData = model.getUrlData();

      //console.log("constructUrls urlData ",urlData);
      
      emouseatlasUrl = webServer;
      emaUrl = webServer + urlData.ema_home;
      stagedOntologyUrl = webServer + urlData.staged_ontology;
      abstractOntologyUrl = webServer + urlData.abstract_ontology;
      emageQueryUrl = webServer + urlData.emage_query[0];
      emageQueryUrlParams = urlData.emage_query[1];
      mgiQueryUrl = urlData.mgi_query;
      theilerBookChapterUrl = webServer + urlData.theiler_book_chapter[0];
      theilerBookChapterUrlParams = "%20%20" + urlData.theiler_book_chapter[1];
      theilerBookChapterUrlParams += "%20" + urlData.theiler_book_chapter[2];
      theHouseMouseUrl = webServer + urlData.theiler_book_info;

      linkToTheHouseMouse = makeLinkToTheHouseMouse();

   }; // constructUrls

   //---------------------------------------------------------------
   var updateTableContent = function (annot, titleInfo) {

      var img_id;
      var kdesk;
      var emapa;
      var names;
      var nameAndSyns;
      var wikiUrlArr;
      var wikiNames;
      var stages; // from ontology
      var stageArr; // extracted from kaufman book
      var dpcArr; // extracted from kaufman book
      var kstage;
      var kdpc;
      var reg1;
      var reg2;
      var theilerBookChapterLinkStr;
      var stageLinkStr;
      var linkToAbstractOntology;
      var linkToEMAPmodel;
      var emageSearchStr;
      var mgiSearchStr;

      var len;
      var i;

      //console.log("updateTableContent ",annot, titleInfo);

      if(annot === undefined) {
         return false;
      }

      img_id = annot.img_id;
      knum = annot.knum;
      kdesk = annot.kdesk;
      emapa = annot.emapa;
      names = annot.names;
      wikiUrlArr = annot.wiki;
      stages = annot.stages;

      //console.log("updateTableContent wiki ",wikiUrlArr);

      //--------------------------------------------------------
      // we normally only use the earliest stage, but ...
      // to deal with '13—14' and 'advanced 10—early 11'
      //stageArr = emouseatlas.emap.utilities.extractNumbersFromString(titleInfo.stage, "updateTableContent");
      stageArr = titleInfo.stage.split(";");
      dpcArr = titleInfo.dpc.split(";");
      //console.log("updateTableContent stageArr ",stageArr);
      //console.log("updateTableContent dpcArr ",dpcArr);

      // deal with the fact that plate 03 covers 2 embryos
      reg1 = /03[a-o]/;
      if(img_id.match(reg1)) {
         //console.log("PLATE 3 !!!");
         reg2 = /03[a-e]/;
         if(img_id.match(reg2)) {
            //console.log("First Embryo");
	    kstage = stageArr[0];
	    kdpc = dpcArr[0];
	 } else {
            //console.log("Second or third Embryo");
	    kstage = stageArr[1];
	    kdpc = dpcArr[1];
	 }
      } else {
         //console.log("NOT PLATE 3 !!!");
	 kstage = stageArr[0];
	 kdpc = dpcArr[0];
      }
      //console.log("updateTableContent kstage ",kstage);
      //--------------------------------------------------------
      theilerBookChapterLinkStr = makeTheilerBookChapterLink(kstage, kdpc);
      //console.log("updateTableContent theilerBookChapterLinkStr ",theilerBookChapterLinkStr);
      linkToEMAPmodel = makeLinkToEmapModel([kstage]);

      //--------------------------------------------------------

      linkToAbstractOntology = makeLinkToAbstractOntology(emapa);
      if(linkToAbstractOntology === undefined) {
         //console.log("linkToAbstractOntology not defined");
         linkToAbstractOntology = "N/A";
      }
      //console.log("linkToAbstractOntology ",linkToAbstractOntology);

      anatomyRowContent = [];
      anatomyRowContent[0] = [];
      anatomyRowContent[1] = theilerBookChapterLinkStr + "  defined in " + linkToTheHouseMouse;
      anatomyRowContent[2] = linkToAbstractOntology;
      anatomyRowContent[3] = "";
      //console.log("stages ",stages);
      if(stages[1] ===  "TS-" && stages[2] ===  "TS-") {
         anatomyRowContent[4] = "N/A";
      } else {
         anatomyRowContent[4] = stages[1] + "   \u2014   " + stages[2];
      }
      anatomyRowContent[5] = linkToEMAPmodel;

      anatomyRowContent[0][0] = knum;
      anatomyRowContent[0][1] = kdesk;

      len = names.length;
      //console.log("len ",len);
      // the first array entry is the EMAPA id
      nameAndSyns = names[1];
      if(len > 1) {
         for(i=2; i<len; i++) {
	    if(i === 2) {
	       nameAndSyns += " (" + names[i];
	    }
	    if(len === 3 && i === 2) {
	       nameAndSyns += ")";
	    }
	    if(len > 3 && i === (len - 1)) {
	       nameAndSyns += (", " + names[i] + ")");
	    }
	    if(len > 4 && i > 2 && i < (len -1)) {
	       nameAndSyns += (", " + names[i]);
	    }
	 }
      }
      anatomyRowContent[3] = nameAndSyns;
      if(linkToAbstractOntology === "N/A") {
         anatomyRowContent[3] = "N/A";
      }

      miscRowContent = [];
      wikiNames = [];
      wikiContent = "";

      // yes there is a space before null !!!
      if(wikiUrlArr[0] === undefined ||
         wikiUrlArr[0] === null ||
	 wikiUrlArr[0] === "") {
         miscRowContent[0] = "N/A";
      } else {
	 len = wikiUrlArr.length;
	 for(i=0; i<len; i++) {
	    wikiUrl = wikiUrlArr[i];
	    wikiName = extractWikiNameFromUrl(wikiUrl);
	    wikiContent += "<a target='_blank' href='" + wikiUrl + "'>" + wikiName + "</a>";
	    if(i < (len - 1)) {
	       wikiContent += ", ";
	    }
	 }
	 //console.log("wikiContent ",wikiContent);
         miscRowContent[0] = wikiContent;
      }

      miscRowContent[1] = "Academic Press / Elsevier";

      emageSearchStr = makeEmageSearchStr([emapa, kstage]);
      mgiSearchStr = makeMGISearchStr([emapa, kstage]);

      searchRowContent = [];
      searchRowContent[0] = emageSearchStr;
      searchRowContent[1] = mgiSearchStr;
      if(linkToAbstractOntology === "N/A") {
         searchRowContent[0] = "N/A";
         searchRowContent[1] = "N/A";
      }

      generateMarkerPopupPage();

   }; //updateTableContent
   
   //---------------------------------------------------------------
   var generateMarkerPopupPage = function () {

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
      var balloonDiv;
      var i;
      var j;
      var head;
      var header;
      var headerText;
      var rowHeader;
      var rowHeaderText;
      var rowData;
      var tBody; // required for IE8 or the table is invisible
      var anatomyTable;
      var searchTable;
      var tableSpacer;

      //console.log("generateMarkerPopupPage");

      if(myparent === undefined) {
         return false;
      }

      closeDiv = myparent.document.getElementById("markerPopupIFrameCloseDiv");
      if(closeDiv === undefined || closeDiv === null) {
         return false;
      }

      //mainContainer;
      mainContainer = mydocument.getElementById("markerPopupMainContainer");
      if(mainContainer === undefined || mainContainer === null) {
         return false;
      }
      iframe = myparent.document.getElementById("markerPopupIFrame");
      doc = iframe.contentDocument;
      iframeContainer = myparent.document.getElementById("markerPopupIFrameContainer");
      iframe.className = "markerPopupIFrame";

      if(mainContainer) {
	 utils.removeChildNodes(mainContainer);
      }

      //balloonDiv = makeBalloon(anatomyRowContent[0][0]);
      balloonDiv = makeBalloon();

      //console.log(balloonDiv);

      nrows = anatomyRowLabels.length;

      anatomyTable = doc.createElement('table');
      anatomyTable.id = "markerPopupAnatomyTable";
      anatomyTable.className = "markerPopup";
      anatomyTable.cellSpacing = "2";
      anatomyTable.cellPadding = "2";
      anatomyTable.style.width = "100%";

      // the tBody
      tBody = doc.createElement('tBody');
      anatomyTable.appendChild(tBody);
      mainContainer.appendChild(anatomyTable);

      // the first row contains an image as the row header
      row = doc.createElement('tr');
      row.className = "markerPopup";
      tBody.appendChild(row);

      header = doc.createElement('td');
      header.className = "rowHeader img";
      row.appendChild(header);

      header.appendChild(balloonDiv);

      txt = anatomyRowContent[0][1];
      rowData = doc.createElement('td');
      rowData.className = "rowData";
      row.appendChild(rowData);
      addRowData(txt, rowData);

      // the other rows of data
      for(i=1; i<nrows; i++) {
         txt = anatomyRowLabels[i];
         row = doc.createElement('tr');
	 row.className = "markerPopup";
         tBody.appendChild(row);

         if(txt.toLowerCase() == "3d model") {
	    klass = "rowData disabled";
	 } else {
	    klass = "rowData";
	 }

	 header = doc.createElement('td');
	 header.className = "rowHeader";
	 row.appendChild(header);

	 headerText = doc.createTextNode(txt);
	 header.appendChild(headerText);

         txt = anatomyRowContent[i];
         //console.log("anatomy row content %s",txt);
         rowData = doc.createElement('td');
         rowData.className = klass;
         row.appendChild(rowData);
         addRowData(txt, rowData);
      }

      //.................................................
      tableSpacer = doc.createElement('div');
      tableSpacer.className = "markerPopupTableSpacer search";
      mainContainer.appendChild(tableSpacer);

      head = doc.createElement('hr');
      head.className = "markerPopup";
      headText = doc.createTextNode("Search on this term");
      head.appendChild(headText);

      //tBody.appendChild(head);
      mainContainer.appendChild(head);

      searchTable = doc.createElement('table');
      searchTable.id = "markerPopupSearchTable";
      searchTable.className = "markerPopup";
      searchTable.cellSpacing = "2";
      searchTable.cellPadding = "2";
      searchTable.style.width = "100%";

      // the tBody
      tBody = doc.createElement('tBody');
      searchTable.appendChild(tBody);
      mainContainer.appendChild(searchTable);

      nrows = searchRowLabels.length;
      // the rows of data
      for(i=0; i<nrows; i++) {
         txt = searchRowLabels[i];
         row = doc.createElement('tr');
	 row.className = "markerPopup";
         tBody.appendChild(row);

         if(txt.toLowerCase() == "mgi gxd") {
	    klass = "rowData disabled";
	 } else {
	    klass = "rowData";
	 }

	 header = doc.createElement('td');
	 header.className = "rowHeader";
	 row.appendChild(header);

	 headerText = doc.createTextNode(txt);
	 header.appendChild(headerText);

         txt = searchRowContent[i];
         rowData = doc.createElement('td');
         rowData.className = klass;
         row.appendChild(rowData);
         addRowData(txt, rowData);
      }

      //.................................................
      tableSpacer = doc.createElement('div');
      tableSpacer.className = "markerPopupTableSpacer misc";
      mainContainer.appendChild(tableSpacer);

      miscTable = doc.createElement('table');
      miscTable.id = "markerPopupSearchTable";
      miscTable.className = "markerPopup";
      miscTable.cellSpacing = "2";
      miscTable.cellPadding = "2";
      miscTable.style.width = "100%";

      // the tBody
      tBody = doc.createElement('tBody');
      miscTable.appendChild(tBody);
      mainContainer.appendChild(miscTable);

      nrows = miscRowLabels.length;
      // the rows of data
      for(i=0; i<nrows; i++) {
         txt = miscRowLabels[i];
         row = doc.createElement('tr');
	 row.className = "markerPopup";
         tBody.appendChild(row);

         if(txt.toLowerCase() == "n/a") {
	    klass = "rowData disabled";
	 } else {
	    klass = "rowData";
	 }

	 // fudge for Elsevier until we get a proper target
	 if(i === 1) {
	    klass = "rowData disabled";
	 }

	 header = doc.createElement('td');
	 header.className = "rowHeader";
	 row.appendChild(header);

	 headerText = doc.createTextNode(txt);
	 header.appendChild(headerText);

         txt = miscRowContent[i];

         rowData = doc.createElement('td');
         rowData.className = klass;
         row.appendChild(rowData);
         addRowData(txt, rowData);
      }

      infoGeneratedOK = true;

      //console.log("exit generateMarkerPopupPage");

   };  //generateMarkerPopupPage

   //---------------------------------------------------------
   var makeBalloon = function () {

      var balloonDiv;
      var balloonImg;
      var balloonTxt;
      var strlen;
      var klass;
      var src;

      if(knum === undefined) {
         return false;
      }

      strlen = knum.length;
      switch (strlen) {
	 case 1:
	    klass = "popupBalloonTxt one";
	    break;
	 case 2:
	    klass = "popupBalloonTxt two";
	    break;
	 case 3:
	    klass = "popupBalloonTxt three";
	    break;
      }

      balloonDiv = new Element('div', {
         'id': 'popupBalloonDiv',
         'class': 'popupBalloonDiv'
      });

      src = imgDir + "mapIconSelected.png";

      balloonImg = new Element('img', {
         'id': 'popupBalloonImg',
         'class': 'popupBalloonImg',
	 'src': src
      });

      balloonTxt = new Element('textNode', {
         'id': 'popupBalloonTxt',
         'class': klass,
	 'text': knum
      });

      balloonImg.inject(balloonDiv, 'inside');
      balloonTxt.inject(balloonDiv, 'inside');

      return balloonDiv;

   };  //makeBalloon

   //---------------------------------------------------------
   var addRowData = function (htmlString, trgt) {

      var deb = _debug;
      var parser;

      if(_debug) console.log("enter addRowData ",trgt);
      //console.log("addRowData ",htmlString);

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

/*
   //---------------------------------------------------------
   // we need to do ajax calls so flow of control is different
   // from other addRowData cases
   //---------------------------------------------------------
   var addSearchRowData = function (trgt) {

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
   var addSearchRowData2 = function (trgt) {

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
   */

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
   var extractWikiNameFromUrl = function (url) {

      var name;
      var indx;

      indx = url.lastIndexOf("/");
      indx++;
      name = url.substr(indx);

      // deal with %27 which denotes ' in url, i.e. Meckel%27s_cartilage
      name = name.replace(/%27/, "'");

      // deal with %28 which denotes ( in url,
      name = name.replace(/%28/, "(");

      // deal with %29 which denotes ) in url,
      name = name.replace(/%29/, ")");

      return name;
   };

   //---------------------------------------------------------------
   var makeTheilerBookChapterLink = function (kstage, kdpc) {

      var link;

      link = "<a target='_blank' href='" + theilerBookChapterUrl + kstage + theilerBookChapterUrlParams + "'>E"  + kdpc + ", TS" + kstage + "</a>";

      return link;
   };

   //-----------------------------------------------------------------------
   var makeLinkToEmapModel = function (stageArr) {

      var emapLink;
      var currentImg;
      var img;
      var model;
      var imgNum;
      var obj;
      var len;
      var found = false;
      var i;

      currentImg = pointClick.getCurrentImg();

      if(emaModels === undefined) {
         emaModels = pointClick.getModels();
      }
      //console.log(emaModels);
      //console.log("currentImg %s",currentImg);


      len = emaModels.length;
      if(len === 0) {
         imgNum = utils.extractNumbersFromString(currentImg)[0];
         if(imgNum === 5) {
	    // this hack is required because plate05 doesn't have a navigation image
	    found = true;
	    model = "EMA:10";
	 }
      } else {
	 for(i=0; i<len; i++) {
	    obj = emaModels[i];
	    img = obj.imgId;
	    if(img === currentImg) {
	       found = true;
	       model = obj.modelId;
	       break;
	    }
	 }
      }

      if(!found) {
         //console.log("couldn't find model");
         return undefined;
      }

      //console.log("model %s",model);
      // get rid of the 'EMA:' bit
      modelArr = utils.extractNumbersFromString(model, "makeLinkToEmapModel");

      emapLink = "<a target='_blank' href='" + emaUrl + "?stage=" + stageArr[0] + "&model=" + modelArr[0] + "'>EMAP standard model</a>";

      return emapLink;
   };

   //---------------------------------------------------------------
   var makeEmageSearchStr = function (queryData) {

      var stageName;
      var stage;
      var emaps
      var len;
      var i;
      var emageSearchStr;
      var abstr;
      var timed;

      len = queryData.length; // it should be 2, an EMAPA:id and a stagename
      //console.log("makeEmageSearchStr queryData ",queryData);

      if(len > 1 && queryData[0] !== undefined && queryData[0] !== "") {
         //emaps = queryData[0].replace("EMAPA", "EMAPS");
         stage = queryData[1];
	 stageName = "TS" + stage;
         timed = "<a target='_blank' href='" + emageQueryUrl + queryData[0] + "&stages=" + stageName + emageQueryUrlParams + "'>" + stageName + "</a> only";
         abstr = "<a target='_blank' href='" + emageQueryUrl + queryData[0] + emageQueryUrlParams + "'>all relevant stages</a>";
      } else {
         emageSearchStr = "";
      }

      emageSearchStr = timed + ", " + abstr;;
      //console.log("emageSearchStr %s",emageSearchStr);

      return emageSearchStr;
   }; // makeEmageSearchStr

   //---------------------------------------------------------------
   var makeMGISearchStr = function (queryData) {

      var urlParams;
      var stageName;
      var stage;
      var emaps
      var len;
      var i;
      var MGISearchStr;
      var abstr;
      var timed;

      len = queryData.length; // it should be 2, an EMAPA:id and a stagename

      if(len > 1 && queryData[0] !== undefined && queryData[0] !== "") {
         emaps = queryData[0].replace("EMAPA", "EMAPS");
         stage = queryData[1];
	 stageName = "TS" + stage;
         timed = "<a target='_blank' href='" + mgiQueryUrl + emaps + stage + "'>" + stageName + "</a> only";
         abstr = "<a target='_blank' href='" + mgiQueryUrl + queryData[0] + "'>all relevant stages</a>";
      } else {
         MGISearchStr = "";
      }

      MGISearchStr = timed + ", " + abstr;;
      //console.log("MGISearchStr %s",MGISearchStr);

      return MGISearchStr;
   }; // makeMGISearchStr

   //---------------------------------------------------------------
   var makeLinkToTheHouseMouse = function () {

      var link;

      link = "<a target='_blank' href='" + theHouseMouseUrl + "'>" + "<emph>The House Mouse</emph></a>";

      return link;
   };

   //---------------------------------------------------------------
   var makeLinkToStagedOntology = function (emap, stageArr) {

      var link;

      link = "<a target='_blank' href='" + stagedOntologyUrl + "TS" + stageArr[0] + "'>" + emap + "</a>";

      return link;
   };

   //---------------------------------------------------------------
   var makeLinkToAbstractOntology = function (emapa) {

      var link;

      if(emapa === null || emapa === "null" || emapa === undefined) {
         //console.log("makeLinkToAbstractOntology emapa === undefined");
         return undefined;
      }

      link = "<a target='_blank' href='" + abstractOntologyUrl + emapa + "'>" + emapa + "</a>";

      return link;
   };

   //---------------------------------------------------------------
   var modelUpdate = function (changes) {

      if(changes.dst === true) {
         //console.log("markerPopupIFrame modelUpdate changes.dst %s",changes.dst);
	 view.hideMarkerPopupIFrame();
      }

   };

   //---------------------------------------------------------------
   var viewUpdate = function (changes) {

      if(changes.showMarkerPopup) {
         showIFrame(true);
      }

      if(changes.hideMarkerPopup) {
         showIFrame(false);
      }

   };

   //---------------------------------------------------------------
   // I don't think this gets called (update probably before this is initialised)
   var pointClickUpdate = function (changes) {

      if(changes.emaModels) {
         //console.log("changes.emaModels ",changes.emaModels);
         emaModels = pointClick.getModels();
      }

   };

   //---------------------------------------------------------------
   var showIFrame = function (yes) {

      //console.log("showIFrame: %S",yes);
      if(!markerIFrame) {
         console.log("showIFrame returning");
         return;
      }

      if(yes) {
         markerIFrame.setStyle('visibility', 'visible');
      } else {
         markerIFrame.setStyle('visibility', 'hidden');
      }
   };

   //---------------------------------------------------------------
   var getKnum = function () {
      return knum;
   };

   //---------------------------------------------------------------
   var getName = function () {
      return "markerPopup";
   };


   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      pointClickUpdate: pointClickUpdate,
      generateMarkerPopupPage: generateMarkerPopupPage,
      updateTableContent: updateTableContent,
      getKnum: getKnum,
      getName: getName,
      showIFrame: showIFrame
   };

}(); // end of module markerPopup
//----------------------------------------------------------------------------
