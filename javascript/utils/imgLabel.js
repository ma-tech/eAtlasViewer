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
//   imgLabel.js
//   Multi line label (like a tool-tip)
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
// module for imgLabel
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.imgLabel = function() {

   //---------------------------------------------------------
   //   private members
   //---------------------------------------------------------
   var imgLabelContainerId = 'projectDiv';
   //var imgLabelContainerId = 'emapIIPViewerDiv';
   var imgDir = "../../images/";
   var srcClose = imgDir + "close_10x8.png";
   var srcClose2 = imgDir + "close2_10x8.png";
   var ofs_x = 50;
   var ofs_y = 20;
   var CONTENT = 0;
   var HEADER = 1;
   var SPACER = 2;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   var makeImgLabel = function () {

      //console.log("makeImgLabel");
      //---------------------------------------------------------
      // the Container
      //---------------------------------------------------------
      var imgLabelContainer;
      var imgLabelContainerDiv;
      var closeDiv;
      var closeImg;
      var tableContainer;
      var table;
      var tableBody;
      var row;

      imgLabelContainer = $(imgLabelContainerId);
      imgLabelContainerDiv = new Element('div', {
            'id': 'imgLabelContainerDiv',
            'class': 'imgLabelContainerDiv',
            'visibility': 'hidden'
      });

      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      closeDiv = new Element('div', {
         'id': 'imgLabelCloseDiv'
      });

      closeImg = new Element( 'img', {
         'id': 'imgLabelCloseImg',
         'src': srcClose
      });

      closeImg.inject(closeDiv, 'inside');

      //----------------------------------------
      // container for the Table of options
      //----------------------------------------
      tableContainer = new Element('div', {
         'id': 'imgLabelTableContainer'
      });

      //----------------------------------------
      // the table
      //----------------------------------------
      // creates a <table> element and a <tbody> element
      table = new Element("table", {
         'id': 'imgLabelTable',
	 'border': '2'
      });

      tableBody = new Element("tbody", {
         'id': 'imgLabelTableBody'
      });

      // put the <tbody> in the <table>
      tableBody.inject(table, 'inside');
      table.inject(tableContainer, 'inside');

      //closeDiv.inject(imgLabelContainerDiv, 'inside');
      tableContainer.inject(imgLabelContainerDiv, 'inside');
      imgLabelContainerDiv.inject(imgLabelContainer, 'inside');

      //emouseatlas.emap.utilities.addEvent(closeImg, 'mouseup', doCloseImgLabel, false);
      //emouseatlas.emap.utilities.addButtonStyle('imgLabelCloseDiv');

      //..........................................
      //..........................................
      return imgLabelContainerDiv;
   };

   //---------------------------------------------------------------
   var doMouseOverLabelTableRow = function (e) {

      var target;
      var prnt;
      var tKlass;
      var pKlass;
      var cell;

      target = emouseatlas.emap.utilities.getTarget(e);
      tKlass = target.className;
      prnt = target.parentNode;
      pKlass = prnt.className;

      if(target.hasClass('imgLabelTableCell')) {
         cell = target;
      } else if(prnt.hasClass('imgLabelTableCell')) {
         cell = prnt;
      }
      cell.className = 'imgLabelTableCell over';

   };

   //---------------------------------------------------------------
   var doMouseOutLabelTableRow = function (e) {

      var target;
      var prnt;
      var tKlass;
      var pKlass;
      var cell;

      target = emouseatlas.emap.utilities.getTarget(e);
      tKlass = target.className;
      prnt = target.parentNode;
      pKlass = prnt.className;

      if(target.hasClass('imgLabelTableCell')) {
         cell = target;
      } else if(prnt.hasClass('imgLabelTableCell')) {
         cell = prnt;
      }
      cell.className = 'imgLabelTableCell';

   };

   //---------------------------------------------------------------
   var doMouseUpLabelTableRow = function (e) {

      var target;
      var key;
      var EmapId;
      var edid;
      var url = undefined;

      target = emouseatlas.emap.utilities.getTarget(e);
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
   };

   //---------------------------------------------------------------
   var doCloseImgLabel = function (e) {

      //target = emouseatlas.emap.utilities.getTarget(e);
      setVisible(false);
   };

   //---------------------------------------------------------------
   var makeImgLabelTableEntry = function (tableBody, type, txt) {

      // set up the table row
      var row;
      var cell;
      var entry;
      var divider;
      var klass1;
      var klass2;
      var klass3;

      //console.log("makeImgLabelTableEntry type %s, txt %s",type,txt);

      switch(type) {
         case CONTENT:
	    klass1 = 'imgLabelTableRow content';
	    klass2 = 'imgLabelTableEntry content';
	    break;
         case HEADER:
	    klass1 = 'imgLabelTableRow header';
	    klass2 = 'imgLabelTableEntry header';
	    break;
         case SPACER:
	    klass1 = 'imgLabelTableRow spacer';
	    klass2 = 'imgLabelTableEntry spacer';
	    break;
      }

      row = new Element("tr", {
         'class': klass1
      });
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      cell = new Element("td", {
         'class': 'imgLabelTableCell'
      });
      cell.inject(row, 'inside');

      if(type === SPACER) {
         entry = new Element('div', {
            'class': klass2
         });
      } else {
         entry = new Element('div', {
            'class': klass2,
            'text': txt
         });
      }
      
      entry.inject(cell, 'inside');
      row.inject(tableBody, 'inside');
   };

   //---------------------------------------------------------
   var clearReport = function () {

      //console.log("clearReport");
      var tb;
      tb = $('imgLabelTableBody');
      emouseatlas.emap.utilities.removeChildNodes(tb);

   }; // clearReport

   //---------------------------------------------------------
   var setContent = function (item) {

      var content;
      var header;
      var spacer;
      var tb;
      var txt;
      var len;
      var i;

      //console.log("setContent ",item);

      if(!item.indexArr && !item.greyVal) {
         //console.log("setContent returning prematurely");
         return false;
      }

      tb = $('imgLabelTableBody');

      spacer = (item.spacer === undefined) ? false : item.spacer;
      if(spacer) {
         makeImgLabelTableEntry(tb, SPACER, "");
      }
      header = item.header;
      makeImgLabelTableEntry(tb, HEADER, header);

      if(item.indexArr && item.indexArr.length > 0) {
         content = item.indexArr;
	 len = content.length;
         for(i=0; i<len; i++) {
            txt = content[i];
            makeImgLabelTableEntry(tb, CONTENT, txt);
         }
      } else if(item.greyVal && item.greyVal > -1) {
         txt = item.greyVal;
         makeImgLabelTableEntry(tb, CONTENT, txt);
      }

   }; // setContent

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------
   var initialise = function () {
      //console.log("initialise emouseatlas.emap.imgLabel");
      makeImgLabel();
   };

   //---------------------------------------------------------
   var setVisible = function (viz) {
      //console.log("set viz");
      var div;

      if(viz === true) {
         div = $('imgLabelContainerDiv');
	 if(div) {
            div.setStyle('visibility', 'visible');
	 }
         div = $('imgLabelTableContainer');
	 if(div) {
            div.setStyle('visibility', 'visible');
	 }
      } else {
         div = $('imgLabelContainerDiv');
	 if(div) {
            div.setStyle('visibility', 'hidden');
	 }
         div = $('imgLabelTableContainer');
	 if(div) {
            div.setStyle('visibility', 'hidden');
	 }
      }
   };

   //---------------------------------------------------------
   var setPosition = function (pos) {

      //console.log("set pos");
      var div;
      var lft;
      var tp;
      var viewerPos;

      div = $('imgLabelContainerDiv');

      viewerPos = emouseatlas.emap.tiledImageView.getViewerContainerPos();
      //console.log(viewerPos);

      lft = (pos.x - ofs_x + viewerPos.x) + 'px';
      tp = (pos.y + ofs_y + viewerPos.y) + 'px';

      //console.log('lft %s, tp %s',lft,tp);

      div.setStyles(
         {
            'left': lft,
            'top': tp
         }
     )
   };

   //---------------------------------------------------------
   var setReport = function (report) {

      var item;
      var len;
      var i;

      //console.log("setReport ",report);
 
      clearReport();

      len = report.length;

      if(len === 0) {
         setVisible(false);
      }

      for(i=0; i<len; i++) {
         item = report[i];
         setContent(item);
      }

   }; // setReport

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      setVisible: setVisible,
      setPosition: setPosition,
      setReport: setReport
   };

}(); // end of module emouseatlas.emap.imgLabel
