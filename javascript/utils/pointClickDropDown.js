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
//   pointClickDropDown.js
//   Tool to allow slice selection in a High resolution tiled image from an iip server
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
// pointClickDropDown
//---------------------------------------------------------
emouseatlas.emap.pointClickDropDown = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var pointClick;
   var model;
   var view;
   var util;
   var trgt;
   var type;
   var typeLC;
   var pointClickImgData;
   var select;
   var plateArr;
   var nOptionsBeforeSelectScroll;
   var skipEarlyPlates;
   var dropDownContainer;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function(params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      pointClick = emouseatlas.emap.tiledImagePointClick;
      util = emouseatlas.emap.utilities;

      //console.log(params);

      model.register(this);
      view.register(this);
      pointClick.register(this);

      dropTargetId = model.getProjectDivId();
      trgt = params.targetId;

      type = (params.type === undefined) ? "" : params.type;
      typeLC = type.toLowerCase();

      pointClickImgData = model.getPointClickImgData();
      //console.log(pointClickImgData);

      nOptionsBeforeSelectScroll = (params.noptions === undefined) ? 20 : params.noptions;

      // at the moment we don't have the first 4 plates in the Kaufman book
      skipEarlyPlates = 3;


   }; // initialise

   //---------------------------------------------------------------
   var createElements = function () {

      //var targetId = model.getProjectDivId();
      var target = $(trgt);
      var optionArr = [];
      var len;
      var option;
      var i;
      var start;
      var optionTxt;
      var locator;
      var locatorT;

      //console.log("pointClickDropDown.createElements type %s",typeLC);


      //----------------------------------------
      // the overall container
      //----------------------------------------
      dropDownContainer = new Element('div', {
         'id': typeLC + '-dropDownContainer',
         'class': 'dropDownContainer ' + typeLC
      });
      
      // the height of the selector image is unknown so we can't set the top relative to it!
      // use the locator, which is below the image dropDown
      if(typeLC === "image") {
	 locator = $("locator-container");
	 locatorT = window.getComputedStyle(locator, null).getPropertyValue("top");
	 itop = parseInt(locatorT, 10) - 20;
	 topstr = itop + "px";
	 dropDownContainer.setStyle("top", topstr);
      }

      //----------------------------------------
      // the text div
      //----------------------------------------
      dropDownTextContainer = new Element('div', {
         'id': typeLC + '-dropDownTextContainer',
         'class': 'dropDownTextContainer'
      });

      dropDownTextDiv = new Element('div', {
         'id': typeLC + '-dropDownTextDiv',
         'class': 'dropDownTextDiv'
      });
      dropDownTextDiv.set('text', typeLC);

      //----------------------------------------
      // the dropDown
      //----------------------------------------
      dropDownDiv = new Element( 'div', {
         'id': typeLC + '-selectDiv'
      });
      select = new Element('select', {
         'id': typeLC + '-select',
         'class': 'pointClickSelect ' + typeLC
      });


      //console.log("locator top %s",locatorT);
      switch (typeLC) {
         case "image":
	    optionArr = getImageLabels();
	    select.size = 1;
	    start = 0;
	 break;
         case "plate":
	    optionArr = plateArr;
	    select.size = 1;
	    start = skipEarlyPlates;
	 break;
      }

      len = optionArr.length;

      for(i=start; i<len; i++) {
         optionTxt = optionArr[i];
         // strip off the leading 0 for plates below 10
	 optionTxt = (optionTxt.substr(0,1) === "0") ? optionTxt.substring(1) : optionTxt;
         option = new Element('option', {
            'id': typeLC + '-pcDropDown' + i,
            'class': 'pcDropDown',
            'value': i,
            'text': optionTxt
         });
         util.addEvent(option, 'mouseup', doOptionMouseUp, false);
         option.inject(select, 'inside');
      }

      select.inject(dropDownDiv, 'inside');
      dropDownDiv.inject(dropDownContainer, 'inside');
      util.addEvent(select, 'mouseup', doDropDownMouseUp, false);
      util.addEvent(select, 'mousedown', doDropDownMouseDown, false);
      util.addEvent(select, 'blur', closeScrollbar, false);

      dropDownContainer.inject(target, 'inside');
      dropDownTextDiv.inject(dropDownTextContainer, 'inside');
      dropDownTextContainer.inject(dropDownContainer, 'inside');
      dropDownDiv.inject(dropDownContainer, 'inside');

      return false;

   }; // createElements

   //---------------------------------------------------------------
   var getImageLabels = function() {

      var labelArr = [];
      var map;
      var len;
      var i;

      map = pointClickImgData.sectionMap;

      len = map.length;
      for(i=0; i<len; i++) {
         labelArr[i] = map[i].label;
      }

      //console.log(this.pointClickImgData);
      return labelArr;
   };

   //---------------------------------------------------------------
   // this is needed to scroll to selected option
   //---------------------------------------------------------------
   var doDropDownMouseUp = function(e) {

      var target;
      var regexp;
      var pattern;
      var sindex;
      var selectedLmnt;

      //console.log("doDropDownMouseUp");
      target = emouseatlas.emap.utilities.getTarget(e);
      pattern = target.className;

      //console.log("doDropDownMouseDown %s %s",target.id, pattern);
      //console.log("doDropDownMouseDown ",target.scrollTop);

      //target.scrollTo(target.scrollTop);
      //target.setAttribute("scrollTop", 150);

      //target.parentNode.scrollTop = target.offsetTop;
      //target.parentNode.scrollTop = target.offsetTop - target.parentNode.offsetTop;

      regexp = new RegExp("pointClickSelect plate", 'i')
      if(pattern.match(regexp) != null) {
	 // when an option is selected the target is the option rather than the select object
         if(target.options && target.options.length > nOptionsBeforeSelectScroll) {
	    sindex = target.options.selectedIndex;
	    selectedLmnt = target.options[sindex];
	    //console.log(selectedLmnt);
	    //selectedLmnt.scrollIntoView(true);
            //selectedLmnt.setAttribute("scrollTop", 150);
	 }
      }

      return false;

   }; // doDropDownMouseDown

   //---------------------------------------------------------------
   // this is needed to set the size of the select which provokes a scroll bar
   // This is controlled (differently) by the browser.
   //---------------------------------------------------------------
   var doDropDownMouseDown = function(e) {

      var target;
      var regexp;
      var pattern;

      //console.log("doDropDownMouseDown");
      target = emouseatlas.emap.utilities.getTarget(e);
      pattern = target.className;

      //console.log("doDropDownMouseDown %s %s",target.id, pattern);

      regexp = new RegExp("pointClickSelect plate", 'i')
      if(pattern.match(regexp) != null) {
	 // when an option is selected the target is the option rather than the select object
         if(target.options && target.options.length > nOptionsBeforeSelectScroll) {
	    target.size = nOptionsBeforeSelectScroll;
	 }
      }

      return false;

   }; // doDropDownMouseDown

   //---------------------------------------------------------------
   // detecting mouseup seems to eat the 'change' event, but
   // it is needed to set the size of the select back to 1 if
   // there is no change
   //---------------------------------------------------------------
   var doOptionMouseUp = function(e) {

      var target;
      var parentNode;
      var regexp;
      var pattern;
      var indx;

      //console.log("doOptionMouseUp");
      target = emouseatlas.emap.utilities.getTarget(e);
      pattern = target.className;
      //console.log("doOptionMouseUp %s, %s",target.id,pattern);

      regexp = new RegExp('pcDropDown', 'i')
      if(pattern.match(regexp) != null) {
         parentNode = target.parentNode;
	 indx = parentNode.selectedIndex;
	 //console.log("doOptionMouseUp selectedIndex %d",indx);
	 doDropDownChanged(parentNode.id, indx);
      }

   }; // doOptionMouseUp

   //---------------------------------------------------------------
   var doDropDownChanged = function(dropDownId, indx) {

      var ddown;
      var regexp;
      var webserver;
      var metadata;
      var pindx;
      var val;
      var ival;
      var url;

      //console.log("doDropDownChanged %s, %d", dropDownId, indx);
      ddown = $(dropDownId);
      if(!ddown) {
         return false;
      }

      regexp = new RegExp("image", 'i')
      if(dropDownId.match(regexp) != null) {
	 model.setDistance(indx);
	 return false;
      }

      regexp = new RegExp("plate", 'i')
      if(dropDownId.match(regexp) != null) {
	 webserver = model.getWebServer();
	 metadata = model.getMetadataRoot();
	 //console.log("webserver %s, metadata %s",webserver,metadata);
	 pindx = metadata.lastIndexOf("plate");
	 metadata = metadata.substring(0, pindx);
	 // start temporary hack for beta release of Kaufman Atlas
	 //metadata = metadata.replace("ka", "ema");
	 // finish temporary hack for beta release of Kaufman Atlas
	 val = ddown.options[indx].text;
	 ival = parseInt(val);
	 if(ival < 10) {
	    val = "0" + val;
	 }
	 console.log("%s%s%s.php",webserver,metadata,val);
	 url = webserver + metadata + "plate_" + val + ".php";
	 console.log("doDropDownChanged plate url %s",url);
	 window.location.href = url;
	 return false;
      }

   }; // doDropDownChanged

   //---------------------------------------------------------------
   var closeScrollbar = function(e) {

      var target;
      target = emouseatlas.emap.utilities.getTarget(e);
      target.size = undefined;

   }; // closeScrollbar

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges) {

   }; // viewUpdate

   //---------------------------------------------------------------
   var pointClickUpdate = function(pointClickChanges) {

      if(pointClickChanges.plateList) {
         plateArr = pointClick.getPlateList();
         createElements();
         initDropDown()
      }

   }; // pointClickUpdate

   //---------------------------------------------------------------
   var initDropDown = function() {

      var data;
      var subplate;
      var options;
      var img;
      var indx;
      var len;
      var i;

      if(typeLC === "plate") {
         data = pointClickImgData;
         subplate = data.subplate;
	 len = plateArr.length;
	 for(i=0; i<len; i++) {
	    if(subplate === plateArr[i]) {
	       indx = i - skipEarlyPlates;
	       select.selectedIndex = indx;
	       break;
	    }
	 }
      } else if(typeLC === "image") {
	 data = model.getUrlSpecifiedParams();
	 img = (data.image === "") ? "a" : data.image;
	 options = select.options;
	 len = options.length;
	 for(i=0; i<len; i++) {
	    if(img === options[i].text) {
	       indx = i;
	       select.selectedIndex = indx;
	       break;
	    }
	 }

      }

      emouseatlas.emap.drag.register({drag: dropDownContainer.id, drop:dropTargetId});

      return false;
   };

   //---------------------------------------------------------------
   var getName = function() {
      return "pointClickDropDown";
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
      getName: getName
   };

}; // function pointClickDropDown
