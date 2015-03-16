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
   var pointClick;
   var markerIFrame;
   var mydocument;
   var myparent;
   var emaModels;
   var hideOK;
   var infoGeneratedOK;
   var infoDetails;
   var theilerLink;
   var anatomyRowLabels;
   var searchRowLabels;
   var anatomyRowContent;
   var searchRowContent;
   var ajax;
   var ajaxParams;
   var utils;
   var prnt;
   var lmntArr;
   var stagedOntologyUrl;
   var abstractOntologyUrl;
   var theHouseMouseUrl;
   var emapUrl;
   var emageUrl;
   var mgiUrl;
   var ontologyInfo = {};
   var linkToTheHouseMouse;
   var emdash;

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

      _debug = true;
      targetId = params.targetId;
      target = document.getElementById(params.targetId);
      //details = params.details;
      //info = details.info;
      model = params.model;
      model.register(this);
      view = params.view;
      view.register(this);
      pointClick = emouseatlas.emap.tiledImagePointClick;
      pointClick.register(this);

      //emdash = '—';
      emdash = '\u2014';

      imgDir = model.getInterfaceImageDir();

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

      theilerLink = ["http://www.emouseatlas.org/emap/ema/theiler_stages/StageDefinition/Theiler/ts", "%20%20from%20Theiler.pdf"];

      anatomyRowLabels = ["Kaufman term", "EMAP id", "EMAP term", "Theiler", "3D viewer"];
      searchRowLabels = ["EMAGE", "MGI / GXD"];
      miscRowLabels = ["Wikipedia", "Kaufman Atlas"];
      //setTableContent(info);

      stagedOntologyUrl = "http://www.emouseatlas.org/emap/ema/DAOAnatomyJSP/anatomy.html?stage=";
      abstractOntologyUrl = "http://www.emouseatlas.org/emap/ema/DAOAnatomyJSP/abstract.html"
      theHouseMouseUrl = "http://www.emouseatlas.org/emap/ema/theiler_stages/house_mouse/book.html"
      emapUrl = "http://www.emouseatlas.org/emap/ema/home.php";
      emageUrl = "http://www.emouseatlas.org/emagewebapp/pages/emage_general_query_result.jsf?structures=";
      mgiUrl = "http://www.informatics.jax.org/gxd/structure/"

      linkToTheHouseMouse = makeLinkToTheHouseMouse();


      lmntArr = [];

   };
   
   //---------------------------------------------------------------
   var updateTableContent = function (info) {

      var termDets;
      var stageLinkStr;
      var kterm;
      var kdesc;
      var extRef;
      var url; 
      var img;
      var reg;
      var emapdesc;
      var stageArr;
      var stage;
      //var abstrct;
      var linkToStagedOntology;
      var linkToAbstractOntology;
      var linkToEMAPmodel;
      var emageSearchStr;
      var mgiSearchStr;
      var wikiName;

      img = pointClick.getCurrentImg();
      //console.log(img);

      //console.log("updateTableContent stage %s",info.stage);
      termDets = info.termDets;
      // to deal with '13—14' and 'advanced 10—early 11'
      stageArr = utils.extractNumbersFromString(info.stage, "updateTableContent");
      //console.log("updateTableContent stageArr ",stageArr);
      //console.log("info ",info);
      extRef = termDets.externalRef;
      stageLinkStr = makeStageLink(stageArr);

      linkToEMAPmodel = makeLinkToEmapModel(stageArr);

      linkToStagedOntology = makeLinkToStagedOntology(extRef.emap, stageArr);

      linkToAbstractOntology = makeLinkToAbstractOntology(extRef.emapa);
      //abstrct = (extRef.emapa === "") ? "" : "  (abstract " + linkToAbstractOntology + ")";

      anatomyRowContent = [];
      anatomyRowContent[0] = [termDets.name, termDets.description];
      //anatomyRowContent[1] = linkToStagedOntology + abstrct;
      anatomyRowContent[1] = linkToAbstractOntology;
      anatomyRowContent[2] = extRef.emap_name;
      anatomyRowContent[3] = stageLinkStr + "  as defined in " + linkToTheHouseMouse;
      anatomyRowContent[4] = linkToEMAPmodel;

      // deal with the fact that plate 03 covers 2 embryos
      reg = /03[a-o]/;
      if(img.match(reg)) {
         //console.log("PLATE 3 !!!");
         reg = /03[a-e]/;
         if(img.match(reg)) {
            //console.log("First Embryo");
	    stage = stageArr[0];
	 } else {
            //console.log("Second or third Embryo");
	    stage = stageArr[1];
	 }
      } else {
	 stage = stageArr[0];
      }

      wikiName = extractWikiNameFromUrl(extRef.wiki);
      
      miscRowContent = [];
      // yes there is a space before null !!!
      if(extRef.wiki === undefined ||
         extRef.wiki === null ||
	 extRef.wiki === "") {
         miscRowContent[0] = "N/A";
      } else {
         miscRowContent[0] = "<a target='_blank' href='" + extRef.wiki + "'>" + wikiName + "</a>";
      }
      miscRowContent[1] = "Academic Press / Elsevier";

      getEmapaForEmap(extRef.emap, stage);

   }; //updateTableContent
   
   //---------------------------------------------------------------
   var updateTableContent2 = function (queryData) {

      //console.log("updateTableContent2: queryData ",queryData);

      emageSearchStr = makeEmageSearchStr(queryData);
      //console.log("emageSearchStr %s",emageSearchStr);
      mgiSearchStr = makeMGISearchStr(queryData);

      searchRowContent = [];
      searchRowContent[0] = emageSearchStr;
      searchRowContent[1] = mgiSearchStr;

      generateMarkerPopupPage();

   }; //updateTableContent2
   
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

      balloonDiv = makeBalloon(anatomyRowContent[0][0]);

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
   var makeBalloon = function (term) {

      var balloonDiv;
      var balloonImg;
      var balloonTxt;
      var strlen;
      var klass;
      var src;

      strlen = term.length;
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

      src = imgDir + "/mapIconSelected.png";

      balloonImg = new Element('img', {
         'id': 'popupBalloonImg',
         'class': 'popupBalloonImg',
	 'src': src
      });

      balloonTxt = new Element('textNode', {
         'id': 'popupBalloonTxt',
         'class': klass,
	 'text': term
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
   var makeStageLink = function (stageArr) {

      var stageLink;
      var stageLinkArr;
      var len;
      var i;

      len = stageArr.length;

      stageLinkArr = [];

      switch (len) {
         case 1:
            stageLink = "<a target='_blank' href='" + theilerLink[0] + stageArr[0] + theilerLink[1] + "'>Stage " + stageArr[0] + "</a>";
	    break;
         case 2:
	    if(stageArr[0] === stageArr[1]) {
               stageLink = "<a target='_blank' href='" + theilerLink[0] + stageArr[0] + theilerLink[1] + "'>Stage " + stageArr[0] + "</a>";
	    } else {
               stageLink = "<a target='_blank' href='" + theilerLink[0] + stageArr[0] + theilerLink[1] + "'>Stage " + stageArr[0] + "</a>";
               stageLink += "<a target='_blank' href='" + theilerLink[0] + stageArr[1] + theilerLink[1] + "'>, " + stageArr[1] + "</a>";
	    }
	    break;
         case 3:
            stageLink = "<a target='_blank' href='" + theilerLink[0] + stageArr[0] + theilerLink[1] + "'>Stage " + stageArr[0] + "</a>";
            stageLink += "<a target='_blank' href='" + theilerLink[0] + stageArr[1] + theilerLink[1] + "'>, " + stageArr[1] + "</a>";
	    break;
	 default:
	   break;
      }

      return stageLink;
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
         console.log("couldn't find model");
         return undefined;
      }

      //console.log("model %s",model);
      // get rid of the 'EMA:' bit
      modelArr = utils.extractNumbersFromString(model, "makeLinkToEmapModel");

      emapLink = "<a target='_blank' href='" + emapUrl + "?stage=" + stageArr[0] + "&model=" + modelArr[0] + "'>EMAP standard model</a>";

      return emapLink;
   };

   //---------------------------------------------------------------
   var getEmapaForEmap = function (emap, titleStage) {

      var arr = [];
      var len;
      var jsonArr;
      var i;

      arr[0] = emap;

      if(emouseatlas.JSON === undefined || emouseatlas.JSON === null) {
         jsonArr = JSON.stringify(arr);
      } else {
         jsonArr = emouseatlas.JSON.stringify(arr);
      }
      if(!jsonArr) {
         return false;
      }
      //console.log(jsonArr);

      /*
         You need to make sure httpd.conf has a connector enabled for tomcat on port 8080.
	 Using a url such as http://glenluig.hgu.mrc.ac.uk:8080/...  will result in a status of 0 
	 and empty resultText (it is suffering from the 'different domain' problem).
      */

      url = '/ontologywebapp/GetEMAPA';
      ajaxParams = {
         url:url,
         method:"POST",
	 urlParams:"emap_ids=" + jsonArr + "&cbf=updateTableContent",
	 callback:getEmapaForEmapCallback,
         async:true
      }
      //if(_debug) console.log(ajaxParams);
      ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   }; // getEmapaForEmap

   //---------------------------------------------------------------
   var getEmapaForEmapCallback = function (response, urlParams) {

      var json;
      var params;
      var len;
      var callback;
      var database;
      var arr;

      json = JSON.parse(response);

      params = urlParams.split("&");

      callback = (params[1].split("="))[1];
      //database = (params[2].split("="))[1];
      
      switch (callback) {
         case "updateTableContent":
	    updateTableContent2(json);
	    break;
	 default:
	    return;
      }

   }; // getEmapaForEmapCallback

   //---------------------------------------------------------------
   var makeEmageSearchStr = function (queryData) {

      var urlParams;
      var stageName;
      var len;
      var i;
      var emageSearchStr;
      var abstr;
      var timed;

      urlParams = '&exactmatchstructures=true&includestructuresynonyms=true';

      len = queryData.length; // it should be 2, an EMAPA:id and a stagename

      if(len > 1 && queryData[0] !== undefined && queryData[0] !== "") {
         stageName = queryData[1];
         timed = "<a target='_blank' href='" + emageUrl + queryData[0] + "&stages=" + stageName + urlParams + "'>stage " + stageName + "</a> only";
         abstr = "<a target='_blank' href='" + emageUrl + queryData[0] + urlParams + "'>all relevant stages</a>";
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
         stageName = queryData[1];
         stage = stageName.replace("TS", "");;
         timed = "<a target='_blank' href='" + mgiUrl + emaps + stage + "'>stage " + stageName + "</a> only";
         abstr = "<a target='_blank' href='" + mgiUrl + queryData[0] + "'>all relevant stages</a>";
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

      link = "<a target='_blank' href='" + abstractOntologyUrl + "'>" + emapa + "</a>";

      return link;
   };

   //---------------------------------------------------------------
   var modelUpdate = function (changes) {

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
         return;
      }

      if(yes) {
         markerIFrame.setStyle('visibility', 'visible');
      } else {
         markerIFrame.setStyle('visibility', 'hidden');
      }
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
      getName: getName,
      showIFrame: showIFrame
   };

}(); // end of module markerPopup
//----------------------------------------------------------------------------
