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
//   chooseKaufmanItem.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
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
//---------------------------------------------------------
emouseatlas.emap.chooseKaufmanItem = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var model;
   var view;
   var pointClick;
   var util;
   var trgt;
   var project;
   var queryType;
   var mgiUrl;
   var wikiUrl;
   var baseHeight;
   var heightOfOneItem;
   var baseKlass;
   var choice;
   var CHOSEN;
   var queryData;


   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------
   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      pointClick = emouseatlas.emap.supplementPointClick;
      util = emouseatlas.emap.utilities;

      model.register(this, "chooseKaufmanItem");
      view.register(this, "chooseKaufmanItem");
      pointClick.register(this, "chooseKaufmanItem");

      project = (params.project === undefined) ? "emap" : params.project;

      baseHeight = 10;
      heightOfOneItem = 22;

      CHOSEN = false;

      dropTargetId = model.getProjectDivId();
      trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      mu = ' \u03BCm';
      mgiUrl = "http://www.informatics.jax.org/gxd/structure/";
      wikiUrl = "http://en.wikipedia.org/wiki/";

      queryData = [];

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(type) {

      //console.log("chooseKaufmanItem createElements");
      var chooseKaufmanItemContainer;
      var selectedTerms;
      var key;
      var termDets;
      var latestClickedRow;
      var numItems;
      var i;
      var klass;
      var top;
      var titleText;
      var explainContainer;;
      var explainDiv;;
      var explanation;;
      var explainH;;
      var itemDiv;
      var itemIdContainer;
      var itemIdDiv;
      var itemDescContainer;
      var itemDescDiv;
      var itemRadioContainer;
      var itemRadio;
      var buttonContainer;
      var okButtonContainer;
      var okButtonDiv;
      var cancelButtonContainer;
      var cancelButtonDiv;

      queryType = type;

      // remove previous stuff
      chooseKaufmanItemContainer = $("chooseKaufmanItemContainer");
      if(chooseKaufmanItemContainer) {
         chooseKaufmanItemContainer.parentNode.removeChild(chooseKaufmanItemContainer);
      }

      chooseKaufmanItemContainer = new Element('div', {
	 'id': 'chooseKaufmanItemContainer',
	 'class': 'chooseKaufmanItemContainer ' + queryType
      });
      //target = $(trgt);
      target = $(dropTargetId);
      chooseKaufmanItemContainer.inject(target, 'inside');

      titleTextContainer = new Element('div', {
         'class': 'chooseKaufmanItemTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'chooseKaufmanItemTitleText'
      });
      switch (queryType.toLowerCase()) {
         case 'mgi':
            titleText = "MGI / GXD.";
            titleTextContainer.set('class', 'chooseKaufmanItemTitleTextContainer mgi');
	    break;
         case 'wiki':
            titleText = "Wikipedia";
            titleTextContainer.set('class', 'chooseKaufmanItemTitleTextContainer wiki');
	    break;
	 default:
            titleText = "Choose an item.";
      }
      titleTextDiv.set('text', titleText);

      titleTextDiv.inject(titleTextContainer, 'inside');
      titleTextContainer.inject(chooseKaufmanItemContainer, 'inside');

      //----------------------------------------
      // container for the explanation
      //----------------------------------------

      explainContainer = new Element('div', {
         'id': 'chooseKaufmanItemExplainContainer',
         'class': 'kaufmanExplainContainer ' + queryType
      });

      explainDiv = new Element('div', {
         'id': 'chooseKaufmanItemExplainDiv',
         'class': 'kaufmanExplainDiv ' + queryType
      });

      switch (queryType.toLowerCase()) {
         case 'mgi':
            explanation = "Please choose a term\nfor MGI / GXD query.";
	    break;
         case 'wiki':
            explanation = "Please choose a term\nfor Wikipedia search.";
	    break;
      }
      explainDiv.set('text', explanation);

      explainContainer.inject(chooseKaufmanItemContainer, 'inside');
      explainDiv.inject(explainContainer, 'inside');

      explainH = parseInt(window.getComputedStyle(explainDiv, null).getPropertyValue("height"));
      //console.log("explainH ",explainH);

      //============================================================
      //----------------------------------------
      // spacer
      //----------------------------------------
      chooseKaufmanItemSpacer_1 = new Element('div', {
         "class": "chooseKaufmanItemSpacer"
      });
      chooseKaufmanItemSpacer_1.inject(chooseKaufmanItemContainer, 'inside');

      chooseKaufmanItemSpacerBGdark_1 = new Element('div', {
         "class": "chooseKaufmanItemSpacerBGdark"
      });
      chooseKaufmanItemSpacerBGlight_1 = new Element('div', {
         "class": "chooseKaufmanItemSpacerBGlight"
      });
      chooseKaufmanItemSpacerBGdark_1.inject(chooseKaufmanItemSpacer_1, 'inside');
      chooseKaufmanItemSpacerBGlight_1.inject(chooseKaufmanItemSpacer_1, 'inside');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      buttonContainer = new Element('div', {
	 'id': 'chooseKaufmanItemButtonContainer',
	 'class': 'chooseKaufmanItemButtonContainer ' + queryType
      });

      buttonDiv = new Element('div', {
	 'id': 'chooseKaufmanItemButtonDiv',
	 'class': 'chooseKaufmanItemButtonDiv'
      });

      okButton = new Element('div', {
	 'id': 'chooseKaufmanItemOKButton',
	 'class': 'chooseKaufmanItemButton ok'
      });

      switch (queryType.toLowerCase()) {
         case 'mgi':
            okButton.appendText('Query');
	    break;
         case 'wiki':
            okButton.appendText('Search');
	    break;
      }

      cancelButton = new Element('div', {
	 'id': 'chooseKaufmanItemCancelButton',
	 'class': 'chooseKaufmanItemButton cancel'
      });
      cancelButton.appendText('Cancel');

      okButton.inject(buttonDiv, 'inside');
      cancelButton.inject(buttonDiv, 'inside');
      buttonDiv.inject(buttonContainer, 'inside');
      buttonContainer.inject(chooseKaufmanItemContainer, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('chooseKaufmanItemOKButton');
      emouseatlas.emap.utilities.addButtonStyle('chooseKaufmanItemCancelButton');

      //----------------------------------------
      buttonContainerH = parseInt(window.getComputedStyle(buttonContainer, null).getPropertyValue("height"));
      top = explainH + numItems*heightOfOneItem + buttonContainerH -3;
      buttonContainer.setStyles({ 'top': top + 'px' });

      height = baseHeight + explainH + numItems * heightOfOneItem + buttonContainerH + Number(1);

      //----------------------------------------
      // add event handlers for the buttons
      //----------------------------------------

      okButton.addEvent('mouseup', function(e){
	 doQueryButtonClicked(e);
      });

      cancelButton.addEvent('mouseup', function(e){
	 doCancel();
      });

   }; // createElements

   //---------------------------------------------------------------
   var addItems = function() {

      var typeLC;
      var klass;
      var itemScrollContainer;
      var itemContainer;
      var selectedRowKeys;
      var numItems;
      var itemData;
      var item;
      var key;
      var descr;
      var emap;
      var emapa;
      var wiki
      var txt;
      var total;
      var top;
      var wid;
      var itemDiv;
      var itemTextH;
      var height;
      var baseHeight;
      var cumHeight;
      var itemTextDiv;
      var itemTextContainer;

      //console.log("addItem");
      typeLC = (queryType === undefined) ? "mgi" : queryType.toLowerCase();
      switch (typeLC) {
         case "mgi":
	    baseKlass = "chooseKaufmanItemItemTextDiv";
	 break;
         case "wiki":
	    baseKlass = "chooseKaufmanItemItemTextDiv";
	 break;
      }
      //console.log("baseKlass %s",baseKlass);

      itemScrollContainer = $("chooseKaufmanItemItemScrollContainer");
      if(itemScrollContainer) {
         itemScrollContainer.parentNode.removeChild(itemScrollContainer);
      }

      itemScrollContainer = new Element('div', {
	 'id': 'chooseKaufmanItemItemScrollContainer'
      });
      target = $("chooseKaufmanItemContainer");
      itemScrollContainer.inject(target, 'inside');

      itemContainer = new Element('div', {
	 'id': 'chooseKaufmanItemItemContainer'
      });
      itemContainer.inject(itemScrollContainer, 'inside');

      baseHeight = 0;
      height = baseHeight;

      if(typeLC  === "mgi" || typeLC  === "wiki") {
         selectedRowKeys = pointClick.getSelectedRowKeys();
      }
      //console.log(selectedRowKeys);

      //----------------------------------------
      // containers for the items
      //----------------------------------------

      klass = 'chooseKaufmanItemItemDiv';
      total = 0;
      cumHeight = Number(0);

      numItems = selectedRowKeys.length;;

      for(i=0; i<numItems; i++) {
	 key = selectedRowKeys[i];
	 termDets = pointClick.getTermDetsForKey(key);
         //console.log("addItems: ",termDets);

	 descr = termDets.description;
	 emap = termDets.externalRef.emap;
	 emapa = termDets.externalRef.emapa;
	 wiki = termDets.externalRef.wiki;
	 queryData[queryData.length] = {key: key, descr: descr, emap: emap, emapa:emapa, wiki: wiki};

         top = cumHeight + 'px';

	 itemDiv = new Element('div', {
	    'id': descr + '_itemDiv',
	    'class': klass
	 });
	 itemDiv.setStyles({
            'top': top
         });

	 itemTextContainer = new Element('div', {
	    'id': descr + '_itemTextContainer',
	    'class': 'chooseKaufmanItemItemTextContainer'
	 });

	 itemTextDiv = new Element('div', {
	    'id': descr + '_itemTextDiv',
	    'class': 'chooseKaufmanItemItemTextDiv'
	 });

         txt = key + ":   " + descr;
	 itemTextDiv.set('text', txt);
	 //itemTextDiv.setStyle('width',txtwid+'px');

	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 itemDiv.inject(itemContainer, 'inside');
	 itemTextDiv.inject(itemTextContainer, 'inside');
	 itemTextContainer.inject(itemDiv, 'inside');

         itemTextH = window.getComputedStyle(itemDiv, null).getPropertyValue("height");
	 cumHeight += parseInt(itemTextH);
	 //console.log("%s, %s %d",item.descr, itemTextH, cumHeight);

	 //-----------------------------------------------
	 // add event handlers for selection highlighting
	 //-----------------------------------------------
         itemDiv.addEvent('mouseover',function(e) {
	    doMouseOver(e);
         });
         itemDiv.addEvent('mouseout',function(e) {
	    doMouseOut(e);
         });
         itemDiv.addEvent('mouseup',function(e) {
	    doMouseUp(e);
         });


         total++;

      } // for

      //console.log(queryData);

   }; // addItems

   //---------------------------------------------------------------
   var doMouseOver = function(e) {

      //console.log("doMouseOver");
      var target;
      var klass;
      var newKlass;

      if (!e) {
	 var e = window.event;
      }
      target = emouseatlas.emap.utilities.getTarget(e);

      if(target === undefined) {
         return false;
      }

      klass = target.className.split(" ")[0];
      //console.log("doMouseOver %s",klass);
      if(klass.toLowerCase() === baseKlass.toLowerCase()) {
         if(CHOSEN) {
	    target.className = baseKlass + "  over disabled";
	 } else {
	    target.className = baseKlass + " over";
	 }
      }
      return false;

   }; // doMouseOver

   //---------------------------------------------------------------
   var doMouseOut = function(e) {

      //console.log("doMouseOut");
      var target;
      var str;
      var klass;
      var newKlass;
      var indx;

      if (!e) {
	 var e = window.event;
      }
      target = emouseatlas.emap.utilities.getTarget(e);

      if(target === undefined) {
         return false;
      }

      str = target.id;

      klass = target.className.split(" ")[0];
      //console.log("doMouseOut %s",klass);
      if(klass.toLowerCase() == baseKlass.toLowerCase()) {
         indx = str.indexOf("_itemTextDiv");
         //console.log(str.substr(0, indx));
         if(CHOSEN && str.substr(0, indx) == choice) {
	    target.className = baseKlass + " up";
	 } else if(CHOSEN && str.substr(0, indx) != choice) {
	    target.className = baseKlass + " disabled";
	 } else {
	    target.className = baseKlass;
	 }
      }
      return false;

   }; // doMouseOut

   //---------------------------------------------------------------
   var doMouseUp = function(e) {

      //console.log("doMouseUp");
      var target;
      var klass;
      var str;
      var indx;

      if (!e) {
	 var e = window.event;
      }
      target = emouseatlas.emap.utilities.getTarget(e);

      if(target === undefined) {
         return false;
      }

      klass = target.className.split(" ")[0];
      //console.log("doMouseUp %s",klass);
      if(klass.toLowerCase() === baseKlass.toLowerCase()) {
	 clearAll();
	 target.className = baseKlass + " up";
	 str = target.id;
	 if(str.indexOf("_itemTextDiv") !== -1) {
	    indx = str.indexOf("_itemTextDiv");
	    choice = str.substr(0, indx);
	    CHOSEN = true;
	 }
         //console.log("choice is %s",choice);
      }
      return false;

   }; // doMouseUp

   //---------------------------------------------------------------
   var clearAll = function() {

      var container;
      var kids;
      var len;
      var i;
      
      container = $("chooseKaufmanItemContainer");
      kids = container.getElementsByClassName(baseKlass);

      //console.log("clearAll: kids = ",kids);

      len = kids.length;

      for(i=0; i<len; i++) {
         //console.log("kids[i].id %s, kids[i].className %s",kids[i].id, kids[i].className);
         kids[i].className = baseKlass + ' disabled';
      }

   }; // clearAll

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

   }; // viewUpdate

   //---------------------------------------------------------------
   var pointClickUpdate = function(pointClickChanges, from) {

      if(pointClickChanges.mgiChoice === true) {
	 createElements("mgi");
	 setVisible(true);
         emouseatlas.emap.drag.register({drag:"chooseKaufmanItemContainer", drop:dropTargetId}, "chooseKaufmanItem");
	 addItems("mgi");
      }

      if(pointClickChanges.wikiChoice === true) {
	 createElements("wiki");
	 setVisible(true);
         emouseatlas.emap.drag.register({drag:"chooseKaufmanItemContainer", drop:dropTargetId}, "chooseKaufmanItem");
	 addItems("wiki");
      }

   }; // pointClickUpdate

   //---------------------------------------------------------------
   var setVisible = function(yes) {

      var container;
      var viz;

      viz = (yes) ? "visible" : "hidden";
      container = $("chooseKaufmanItemContainer");
      if(container) {
         container.setStyle("visibility", viz);
      }
   };

   //---------------------------------------------------------------
   var doCancel = function() {
      setVisible(false);
      CHOSEN = false;
      //view.setMode('move');
   };

   //---------------------------------------------------------------
   // this will query mgi
   var doQueryButtonClicked = function() {
      if(CHOSEN) {
	 setVisible(false);
	 //view.setMode('move');
	 CHOSEN = false;
	 doQuery();
      } else {
         alert("You haven't chosen an item to query on");
      }
   };

   //---------------------------------------------------------------
   var doQuery = function() {

      var len;
      var i;
      var dets;
      var descr;
      var emap;
      var wiki;
      var found = false;
      var url;

      //console.log("choice %s",choice);
      //console.log(queryData);

      len = queryData.length;
      for(i=0; i<len; i++) {
         dets = queryData[i];
	 descr = dets.descr;
	 //console.log(descr);
	 if(descr === choice) {
	    found = true;
	    emap = dets.emap;
	    wiki = dets.wiki;
	    break;
	 }
      }
      //console.log("emap %s",emap);

      if(found) {
	 switch (queryType.toLowerCase()) {
	    case 'mgi':
               //url = mgiUrl + emapa;
	       getEmapaForEmap(emap);
	       break;
	    case 'wiki':
               url = wiki;
	       window.open(url);
	       break;
	    default:
	 }
      }
   };

   //---------------------------------------------------------------
   var doQuery2 = function(queryData) {

      var emaps;
      var stage;
      var url;

      //console.log("choice %s",choice);
      //console.log("doQuery2 ",queryData);

      emaps = queryData[0].replace("EMAPA", "EMAPS");
      stage = queryData[1].replace("TS", "");
      url = mgiUrl + emaps + stage;

      window.open(url);

   };

   //---------------------------------------------------------------
   var getEmapaForEmap = function (emap) {

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
	 urlParams:"emap_ids=" + jsonArr + "&cbf=doQuery",
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
      //console.log("params ",params);

      callback = (params[1].split("="))[1];
      //database = (params[2].split("="))[1];
      
      switch (callback) {
         case "doQuery":
	    doQuery2(json);
	    break;
	 default:
	    return;
      }

   }; // getEmapaForEmapCallback


   //---------------------------------------------------------------
   var getName = function() {
      return "chooseKaufmanItem";
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
      setVisible: setVisible,
      getName: getName
   };

}();
