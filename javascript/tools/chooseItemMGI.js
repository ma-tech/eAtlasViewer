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
//   chooseItem.js
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
emouseatlas.emap.chooseItemMGI = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var model;
   var view;
   var query;
   var util;
   var trgt;
   var project;
   var baseHeight;
   var heightOfOneItem;
   var baseKlass;
   var choice;
   var CHOSEN;


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
      query = emouseatlas.emap.tiledImageQuery;
      util = emouseatlas.emap.utilities;

      model.register(this);
      view.register(this);
      query.register(this);

      project = (params.project === undefined) ? "emap" : params.project;

      baseHeight = 10;
      heightOfOneItem = 22;

      CHOSEN = false;

      dropTargetId = model.getProjectDivId();
      trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      mu = ' \u03BCm';
      createElements();
      emouseatlas.emap.drag.register({drag:"chooseItemContainer", drop:dropTargetId});

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(modelChanges) {

      //console.log("chooseItem createElements");
      var chooseItemContainer;
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

      chooseItemContainer = new Element('div', {
	 'id': 'chooseItemContainer'
      });
      //target = $(trgt);
      target = $(dropTargetId);
      chooseItemContainer.inject(target, 'inside');

      queryModes = model.getQueryModes();

      titleTextContainer = new Element('div', {
         'class': 'chooseItemTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'chooseItemTitleText'
      });
      switch (project.toLowerCase()) {
         case 'emap':
            titleText = "MGI / GXD query.";
	    break;
	 default:
            titleText = "Choose an item.";
      }
      titleTextDiv.set('text', titleText);

      titleTextDiv.inject(titleTextContainer, 'inside');
      titleTextContainer.inject(chooseItemContainer, 'inside');

      //----------------------------------------
      // container for the explanation
      //----------------------------------------

      explainContainer = new Element('div', {
         'id': 'chooseItemExplainContainer',
         'class': 'explainContainer'
      });

      explainDiv = new Element('div', {
         'id': 'chooseItemExplainDiv',
         'class': 'explainDiv'
      });

      switch (project.toLowerCase()) {
         case 'emap':
            explanation = "queries are single term:\nPlease choose a term.";
	    break;
      }
      explainDiv.set('text', explanation);

      explainContainer.inject(chooseItemContainer, 'inside');
      explainDiv.inject(explainContainer, 'inside');

      explainH = parseInt(window.getComputedStyle(explainDiv, null).getPropertyValue("height"));
      //console.log("explainH ",explainH);

      //============================================================
      //----------------------------------------
      // spacer
      //----------------------------------------
      chooseItemSpacer_1 = new Element('div', {
         "class": "chooseItemSpacer"
      });
      chooseItemSpacer_1.inject(chooseItemContainer, 'inside');

      chooseItemSpacerBGdark_1 = new Element('div', {
         "class": "chooseItemSpacerBGdark"
      });
      chooseItemSpacerBGlight_1 = new Element('div', {
         "class": "chooseItemSpacerBGlight"
      });
      chooseItemSpacerBGdark_1.inject(chooseItemSpacer_1, 'inside');
      chooseItemSpacerBGlight_1.inject(chooseItemSpacer_1, 'inside');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      buttonContainer = new Element('div', {
	 'id': 'chooseItemButtonContainer',
	 'class': 'chooseItemButtonContainer'
      });

      buttonDiv = new Element('div', {
	 'id': 'chooseItemButtonDiv',
	 'class': 'chooseItemButtonDiv'
      });

      okButton = new Element('div', {
	 'id': 'chooseItemOKButton',
	 'class': 'chooseItemButton ok'
      });
      okButton.appendText('Query');

      cancelButton = new Element('div', {
	 'id': 'chooseItemCancelButton',
	 'class': 'chooseItemButton cancel'
      });
      cancelButton.appendText('Cancel');

      okButton.inject(buttonDiv, 'inside');
      cancelButton.inject(buttonDiv, 'inside');
      buttonDiv.inject(buttonContainer, 'inside');
      buttonContainer.inject(chooseItemContainer, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('chooseItemOKButton');
      emouseatlas.emap.utilities.addButtonStyle('chooseItemCancelButton');

      //----------------------------------------
      buttonContainerH = parseInt(window.getComputedStyle(buttonContainer, null).getPropertyValue("height"));
      top = explainH + numItems*heightOfOneItem + buttonContainerH -3;
      buttonContainer.setStyles({ 'top': top + 'px' });

      height = baseHeight + explainH + numItems * heightOfOneItem + buttonContainerH + Number(1);

      //----------------------------------------
      // add event handlers for the buttons
      //----------------------------------------

      okButton.addEvent('mouseup', function(e){
	 doOKButtonClicked(e);
      });

      cancelButton.addEvent('mouseup', function(e){
	 doCancel();
      });

   }; // createElements

   //---------------------------------------------------------------
   var addItems = function(type) {

      var typeLC;
      var klass;
      var itemScrollContainer;
      var itemContainer;
      var itemData;
      var reverseData;
      var item;
      var name;
      var id;
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
      typeLC = (type === undefined) ? "anatomyquery" : type.toLowerClass();
      switch (typeLC) {
         case "anatomyquery":
	    baseKlass = "chooseItemItemTextDiv";
	 break;
      }
      //console.log("baseKlass %s",baseKlass);

      itemScrollContainer = $("chooseItemItemScrollContainer");
      if(itemScrollContainer) {
         itemScrollContainer.parentNode.removeChild(itemScrollContainer);
      }

      itemScrollContainer = new Element('div', {
	 'id': 'chooseItemItemScrollContainer'
      });
      target = $("chooseItemContainer");
      itemScrollContainer.inject(target, 'inside');

      itemContainer = new Element('div', {
	 'id': 'chooseItemItemContainer'
      });
      itemContainer.inject(itemScrollContainer, 'inside');

      baseHeight = 0;
      height = baseHeight;

      if(typeLC  === "anatomyquery") {
         itemData = query.getQueryTermData();
      }
      reverseData = util.reverseObject(itemData);
      //console.log(reverseData);

      //----------------------------------------
      // containers for the items
      //----------------------------------------

      klass = 'chooseItemItemDiv';
      total = 0;
      cumHeight = Number(0);

      for(key in reverseData) {

         if(!reverseData.hasOwnProperty(key)) {
	    continue;
	 }

         item = reverseData[key];
	 name = reverseData[key].name;
	 id = item.fbId[0];
	 //console.log("item ",item);
	 //console.log("item  %s, %s",name,id);

         //top = total*heightOfOneTerm;
         top = cumHeight + 'px';
	 //wid = 150;
	 //txtwid = width - 30;

	 itemDiv = new Element('div', {
	    'id': name + '_itemDiv',
	    'class': klass
	 });
	 itemDiv.setStyles({
            'top': top
         });

	 itemTextContainer = new Element('div', {
	    'id': name + '_itemTextContainer',
	    'class': 'chooseItemItemTextContainer'
	 });

	 itemTextDiv = new Element('div', {
	    'id': name + '_itemTextDiv',
	    'class': 'chooseItemItemTextDiv'
	 });

	 itemTextDiv.set('text', item.name);
	 //itemTextDiv.setStyle('width',txtwid+'px');

	 //----------------------------------------
	 // add them to the tool
	 //----------------------------------------

	 itemDiv.inject(itemContainer, 'inside');
	 itemTextDiv.inject(itemTextContainer, 'inside');
	 itemTextContainer.inject(itemDiv, 'inside');

         itemTextH = window.getComputedStyle(itemDiv, null).getPropertyValue("height");
	 cumHeight += parseInt(itemTextH);
	 //console.log("%s, %s %d",item.name, itemTextH, cumHeight);

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
      if(klass.toLowerCase() === baseKlass.toLowerCase()) {
         //if(CHOSEN) {
	    clearAll();
	 //}
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
      
      container = $("chooseItemContainer");
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
   var queryUpdate = function(queryChanges) {

      if(queryChanges.chooseItem === true) {
	 setVisible(true);
         addItems();
      }

   }; // queryUpdate

   //---------------------------------------------------------------
   var setVisible = function(yes) {

      var container;
      var viz;

      viz = (yes) ? "visible" : "hidden";
      container = $("chooseItemContainer");
      container.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var doCancel = function() {
      setVisible(false);
      CHOSEN = false;
      //view.setMode('move');
   };

   //---------------------------------------------------------------
   // this will query mgi
   var doOKButtonClicked = function() {

      if(CHOSEN) {
	 setVisible(false);
	 CHOSEN = false;
	 doMGIQuery();
      } else {
         alert("You haven't chosen an item to query on");
      }
   };

   //---------------------------------------------------------------
   var doMGIQuery = function() {

      var details;
      var len;
      var i;
      var emaps;
      var stage;
      var queryStr;
      var url;

      url = "http://www.informatics.jax.org/gxd/structure/";

      details = query.getAnatomyQueryDetails();

      len = details.length;
      for(i=0; i<len-1; i++) {
         if(choice === details[i].name) {
	    emaps = details[i].emapa.replace("EMAPA", "EMAPS");
	    stage = details[len-1].stage.replace("TS", "");
	    break;
	 }
      }

      url = url + emaps + stage;

      //console.log("doMGIQuery choice %s url %s",choice,url);

      window.open(url);

   };

   //---------------------------------------------------------------
   var getName = function() {
      return "chooseItem";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      queryUpdate: queryUpdate,
      setVisible: setVisible,
      getName: getName
   };

}();
