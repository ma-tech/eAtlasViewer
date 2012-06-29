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
////---------------------------------------------------------
//   tiledImageQuery.js
//   Query object for eAtlasViewer
//   Using the 'module' pattern of Crockford, slightly modified by Christian Heilmann into the 'Revealing Module Pattern'
//---------------------------------------------------------

//---------------------------------------------------------
//---------------------------------------------------------
//   Dependencies:
//   none
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
// module for tiledImageQuery
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.tiledImageQuery = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var model = emouseatlas.emap.tiledImageModel;
   var view = emouseatlas.emap.tiledImageView;
   var util = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var _debug = false;
   //......................

   var currentQuerySectionName;
   var querySectionNames = [];
   var querySection = {}; // this must be an object, not an array
   var query = [];
   //......................
   var registry = [];
   var queryChanges = { 
      initial: false,
      initialState: false,
      addQuerySection: false,
      saveQuerySection: false,
      changeQuerySection: false // for spatial query when section has been seleceted from dialogue
   };

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   var register = function (observer) {
      //console.log("query: register observer ",observer);
      registry.push(observer);
   };


   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   // called from emap draw initialise and also if saving drawing on a different section
   //---------------------------------------------------------
   var addSectionToQuery = function () {
      var len = querySectionNames.length;
      currentQuerySectionName = 'section_' + len;
      //console.log("addSectionToQuery %s",currentQuerySectionName);
      querySectionNames.push(currentQuerySectionName);
      resetQueryChanges();
      queryChanges.addQuerySection = true;
      notify("addSectionToQuery");
      return false;
   };

   // called following mouse up whilst drawing
   // causes emapDraw to save drawing on current section to the query
   //---------------------------------------------------------
   var saveDrawingOnSection = function () {
      //console.log("saveDrawingOnSection menu item");
      resetQueryChanges();
      queryChanges.saveQuerySection = true;
      notify("saveDrawingOnSection");
      return false;
   };

   //---------------------------------------------------------
   var getIndexOfQuerySectionName = function (name) {

      var indx = -1;
      var len = querySectionNames.length;
      var i;

      if(len <= 0) {
         return -1;
      }
      for(i=0; i<len; i++) {
         if(querySectionNames[i] === name) {
	    indx = i;
	    break;
	 }
      }

      return indx;
   };

   //---------------------------------------------------------
   var getQuerySectionName = function () {
      return currentQuerySectionName;
   };

   //---------------------------------------------------------
   var getAllQuerySectionNames = function () {
      return querySectionNames;
   };

   //---------------------------------------------------------
   var getQuerySectionData = function (name) {

      //console.log("enter getQuerySectionData");

      var len = query.length;
      var i;
      var section;

      if(name === undefined || name === "") {
         return undefined;
      }

      if(len === 0) {
         return undefined;
      }

      for(i=0; i<len; i++) {
         section = query[i];
         if(section.name === name) {
	    section.drg = trimQuerySectionDrg(section.drg);
            return section;
         }
      }

      return undefined;
   };

   //---------------------------------------------------------
   // We only want from after the last 'clear' node in the drawing
   //---------------------------------------------------------
   var trimQuerySectionDrg = function (drg) {

      var ret;
      var len;
      var node;
      var lastClear = -1;
      var i;

      if(drg === undefined || drg === null) {
         //console.log("trimQuerySectionDrg drg undefined");
         return undefined;
      }

      len = drg.length;

      if(len <= 0) {
         //console.log("trimQuerySectionDrg len <= 0");
         return undefined;
      }

      for(i=len-1; i>-1; i--) {
         node = drg[i];
	 if(node.a == 8) {
            lastClear = i;
            break;
	 }
      }
      //console.log("trimQuerySectionDrg lastClear %d",lastClear);
      if(lastClear > 0) {
         ret = drg.splice(i+1);
      } else {
         ret = drg;
      }

      return ret;
   };

   //---------------------------------------------------------
   //  Called on mouse up after doing some drawing.
   //---------------------------------------------------------
   var setQuerySectionData = function (drg) {

      //console.log("setQuerySectionData ",drg);

      var len;
      var currentSection;
      var isSameSection;
      var querySection;
      var i;

      currentSection = model.getCurrentSection();
      len = query.length;
      //console.log("setQuerySectionData len %d",len);

      // it's a new query
      if(len <= 0) {
         //console.log("new query");
         addSectionToQuery();
	 query.push({
	    name:currentQuerySectionName,
	    section:currentSection,
	    drg:drg
	 });
         //console.log(query[0]);
	 return false;
      }

      // are we editing an existing section?
      isSameSection = false;
      for(i=0; i<len; i++) {
         //console.log("setQuerySectionData  i = %d, name = %s",i,query[i].name);
	 querySection = query[i].section;
	 if(emouseatlas.emap.utilities.isSameSection(currentSection, querySection)){
	    //console.log("same section");
	    isSameSection = true;
            //console.log("before: ",query[i].drg);
	    query[i].drg = drg;
            //console.log("after: ",query[i].drg);
	    return false;
	 }
      }

      // no: we need to add a new section to the query
      if(!isSameSection) {
         addSectionToQuery();
         //console.log("currentSectionName);
         //console.log("adding new section data");
         //console.log("before: ",query);
	 query.push({
	    name:currentQuerySectionName,
	    section:currentSection,
	    drg:drg
	 });
         //console.log("after: ",query);
      }

     return false;
   };

   //---------------------------------------------------------
   //  Called when sectionSelector item is clicked
   //---------------------------------------------------------
   var selectQuerySection = function (indx) {

      //console.log("selectQuerySection %d",indx);

      var section;
      if(query[indx] === undefined) {
         return null;
      }
      currentQuerySectionName = query[indx].name;
      //console.log("selectQuerySection indx %d %s",indx,currentQuerySectionName);
      section = query[indx].section;
      model.setSection(
         section.fxp.x,
         section.fxp.y,
         section.fxp.z,
         section.pit,
         section.yaw,
         section.rol,
         section.dst
      );

      resetQueryChanges();
      queryChanges.changeQuerySection = true;
      notify("selectQuerySection");
   };

   //---------------------------------------------------------
   var getQuerySectionAtIndex = function (indx) {

      //console.log("getQuerySectionAtIndex %d",indx);

      var section;
      if(query[indx] === undefined) {
         return undefined;
      }
      currentQuerySectionName = query[indx].name;
      //console.log("selectQuerySection indx %d %s",indx,currentQuerySectionName);
      section = query[indx].section;

      return section;
   };

   //---------------------------------------------------------
   /**
    *   Informs registered observers of a change to the query.
    */
   var notify = function (from) {

      var i;
      //console.log("query: notify from %s",from);
      //printQueryChanges();

      for (i = 0; i < registry.length; i++) {
	 //console.log("notify: registry[%s] = %s",i,registry[i]);
         registry[i].queryUpdate(queryChanges);
      }
      resetQueryChanges();
   }; // notify

   //---------------------------------------------------------
   /**
    *   Prints the state of observable changes to the query.
    */
   var printQueryChanges = function() {
      if(queryChanges.initial) console.log("queryChanges.initial ",queryChanges.initial);
      if(queryChanges.initialState) console.log("queryChanges.initialState ",queryChanges.initialState);
      if(queryChanges.layerNames) console.log("queryChanges.layerNames ",queryChanges.layerNames);
      console.log("++++++++++++++++++++++++++++++++++++++++++++");
   };

   //---------------------------------------------------------
   /**
    *   Resets the list of observable changes to the query.
    */
   var resetQueryChanges = function() {
      queryChanges.initial =  false;
      queryChanges.initialState =  false;
      queryChanges.addQuerySection =  false;
      queryChanges.saveQuerySection =  false;
      queryChanges.changeQuerySection =  false;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      register: register,
      addSectionToQuery: addSectionToQuery,
      saveDrawingOnSection: saveDrawingOnSection,
      getQuerySectionData: getQuerySectionData,
      setQuerySectionData: setQuerySectionData,
      getQuerySectionName: getQuerySectionName,
      getAllQuerySectionNames: getAllQuerySectionNames,
      selectQuerySection: selectQuerySection,
      getQuerySectionAtIndex: getQuerySectionAtIndex
   };

}(); // end of module tiledImageQuerY
