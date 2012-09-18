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
   var util = emouseatlas.emap.utilities;
   var model = emouseatlas.emap.tiledImageModel;
   var view = emouseatlas.emap.tiledImageView;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var _debug = false;
   //......................

   var currentQuerySectionName;
   var currentQueryTermName;
   var querySectionNames = [];
   var queryTermData = [];
   var querySection = {}; // this must be an object, not an array
   var queryTerm = {}; // this must be an object, not an array
   var stageData = {}; // this must be an object, not an array
   var spatialQuery = [];
   var termQuery = [];
   var queryTypes = [];
   var queryType;
   var dbToQuery = {};
   var NONE = 0;
   var ANATOMY = 1;
   var SPATIAL = 2;
   var importing = false;
   //......................
   var registry = [];
   var queryChanges = { 
      initial: false,
      initialState: false,
      addQuerySection: false,
      addQueryTerm: false,
      saveQuerySection: false,
      changeQuerySection: false, // spatial query section seleceted from dialogue
      changeQueryTerm: false, // spatial query section seleceted from dialogue
      spatialSelected: false,
      anatomySelected: false,
      spatialImport: false
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
   var initialise = function () {

      model.register(emouseatlas.emap.tiledImageQuery);
      view.register(emouseatlas.emap.tiledImageQuery);

      queryTypes = ["none", "anatomy", "spatial"];
      queryType = NONE;
   };

   //---------------------------------------------------------
   var getQueryType = function () {
      return queryTypes[queryType];
   };

   //---------------------------------------------------------
   var modelUpdate = function (modelChanges) {
   };

   //---------------------------------------------------------
   var viewUpdate = function (viewChanges) {
   };

   //---------------------------------------------------------
   var setDbToQuery = function (name, yes) {

      //console.log("setDbToQuery: %s %s",name,yes);

      if(dbToQuery[name] === undefined) {
         dbToQuery[name] = {db:name, include:yes};
      } else {
         dbToQuery[name].include = yes;
      }

      getDbToQuery();

      return false;
   };

   //---------------------------------------------------------
   var getDbToQuery = function () {

      //console.log("getDbToQuery:");

      var key;
      var obj;
      var val;

      var dbs = [];

      for (key in dbToQuery) {
         if (dbToQuery.hasOwnProperty(key)) {
	    obj = dbToQuery[key]; 
	    val = obj.include;
            //console.log("%s, %s",key,val);
	    if(val) {
	       dbs[dbs.length] = key;
	    }
         }
      }

      //console.log(dbs)
      return dbs;
   };

   //---------------------------------------------------------
   var typeChanged = function (type) {
      //console.log("query: type changed %s",type);
      resetQueryChanges();
      if(type === 'spatial') {
         queryChanges.spatialSelected = true;
	 queryType = SPATIAL;
      } else if(type === 'anatomy') {
         queryChanges.anatomySelected = true;
	 queryType = ANATOMY;
         queryChanges.addQueryTerm = true;
         notify("addTermToQuery");
      }
      notify("typeChanged");
      return false;
   };

   //================ anatomy query ==============================================
   //---------------------------------------------------------
   //  write something here
   //---------------------------------------------------------
   var addTermToQuery = function () {
      var len = queryTermNames.length;
      currentQueryTermName = 'Term_' + len;
      //console.log("addTermToQuery %s",currentQueryTermName);
      queryTermNames.push(currentQueryTermName);
      resetQueryChanges();
      queryChanges.addQueryTerm = true;
      notify("addTermToQuery");
      return false;
   };

   //---------------------------------------------------------
   var getIndexOfQueryTermName = function (name) {

      var indx = -1;
      var len = queryTermNames.length;
      var i;

      if(len <= 0) {
         return -1;
      }
      for(i=0; i<len; i++) {
         if(queryTermNames[i] === name) {
	    indx = i;
	    break;
	 }
      }

      return indx;
   };

   //---------------------------------------------------------
   var getQueryTermName = function () {
      return currentQueryTermName;
   };

   //---------------------------------------------------------
   var getAllQueryTermNames = function () {
      return queryTermNames;
   };

   //---------------------------------------------------------
   var getQueryTermData = function () {
      return queryTermData;
   };

   //---------------------------------------------------------
   var setQueryTermData = function (termData) {
      //console.log("setQueryTermData ");
      queryTermData = termData;
      queryChanges.addQueryTerm = true;
      notify("setQueryTermData");
   };

   //---------------------------------------------------------
   //  Called when termSelector item is clicked
   //---------------------------------------------------------
   var selectQueryTerm = function (indx) {

      //console.log("selectQueryTerm %d",indx);

      var term;
      if(query[indx] === undefined) {
         return null;
      }
      currentQueryTermName = query[indx].name;
      //console.log("selectQueryTerm indx %d %s",indx,currentQueryTermName);
      term = query[indx].term;
      model.setTerm(
      );

      resetQueryChanges();
      queryChanges.changeQueryTerm = true;
      notify("selectQueryTerm");
   };

   //---------------------------------------------------------
   var getQueryTermAtIndex = function (indx) {

      //console.log("getQueryTermAtIndex %d",indx);

      var term;
      if(query[indx] === undefined) {
         return undefined;
      }
      currentQueryTermName = query[indx].name;
      //console.log("selectQueryTerm indx %d %s",indx,currentQueryTermName);
      term = query[indx].term;

      return term;
   };


   //================ spatial query ==============================================
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

      var len = spatialQuery.length;
      var i;
      var section;

      if(name === undefined || name === "") {
         return undefined;
      }

      if(len === 0) {
         return undefined;
      }

      for(i=0; i<len; i++) {
         section = spatialQuery[i];
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
      len = spatialQuery.length;
      //console.log("setQuerySectionData len %d",len);

      // it's a new query
      if(len <= 0) {
         //console.log("new query");
         addSectionToQuery();
	 spatialQuery.push({
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
	 querySection = spatialQuery[i].section;
	 if(emouseatlas.emap.utilities.isSameSection(currentSection, querySection)){
	    //console.log("same section");
	    isSameSection = true;
            //console.log("before: ",query[i].drg);
	    spatialQuery[i].drg = drg;
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
	 spatialQuery.push({
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
   //  or when a query is imported
   //---------------------------------------------------------
   var selectQuerySection = function (indx) {

      //console.log("selectQuerySection %d",indx);

      var section;
      if(spatialQuery[indx] === undefined) {
         return null;
      }
      currentQuerySectionName = spatialQuery[indx].name;
      //console.log("selectQuerySection indx %d %s",indx,currentQuerySectionName);
      section = spatialQuery[indx].section;
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
      if(importing) {
         queryChanges.spatialImport = true;
         queryChanges.addQuerySection = true;
      } else {
         queryChanges.changeQuerySection = true;
      }
      notify("selectQuerySection");
   };

   //---------------------------------------------------------
   var getQuerySectionAtIndex = function (indx) {

      //console.log("getQuerySectionAtIndex %d",indx);

      var section;
      if(spatialQuery[indx] === undefined) {
         return undefined;
      }
      currentQuerySectionName = spatialQuery[indx].name;
      //console.log("selectQuerySection indx %d %s",indx,currentQuerySectionName);
      section = spatialQuery[indx].section;

      return section;
   };

   //---------------------------------------------------------
   var importQuerySection = function (section, drg) {

      //console.log("importQuerySection section ",section);
      //console.log("importQuerySection drg ",drg);

      var len;

      //typeChanged('spatial');
      queryType = SPATIAL;
      importing = true;

      spatialQuery = [];
      querySectionNames = [];

      model.setSection(
            section.fxp[0],
            section.fxp[1],
            section.fxp[2],
            section.pit,
            section.yaw,
            section.rol,
            section.dst);

      len = querySectionNames.length;
      currentQuerySectionName = section.name;
      querySectionNames.push(currentQuerySectionName);
      spatialQuery.push({
         name:currentQuerySectionName,
         section:section,
         drg:drg
      });
      resetQueryChanges();
      queryChanges.spatialImport = true;
      notify("importQuerySection");

      return false;
   };

   //---------------------------------------------------------
   var isImporting = function () {
      return importing;
   };

   //---------------------------------------------------------
   var setImporting = function (bool) {
      importing = bool;
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
      if(queryChanges.addQuerySection) console.log("queryChanges.addQuerySection ",queryChanges.addQuerySection);
      if(queryChanges.addQueryTerm) console.log("queryChanges.addQueryTerm ",queryChanges.addQueryTerm);
      if(queryChanges.saveQuerySection) console.log("queryChanges.saveQuerySection ",queryChanges.saveQuerySection);
      if(queryChanges.changeQuerySection) console.log("queryChanges.changeQuerySection ",queryChanges.changeQuerySection);
      if(queryChanges.changeQueryTerm) console.log("queryChanges.changeQueryTerm ",queryChanges.changeQueryTerm);
      if(queryChanges.spatialSelected) console.log("queryChanges.spatialSelected ",queryChanges.spatialSelected);
      if(queryChanges.anatomySelected) console.log("queryChanges.anatomySelected ",queryChanges.anatomySelected);
      if(queryChanges.spatialImport) console.log("queryChanges.spatialImport ",queryChanges.spatialImport);
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
      queryChanges.addQueryTerm =  false;
      queryChanges.saveQuerySection =  false;
      queryChanges.changeQuerySection =  false;
      queryChanges.changeQueryTerm =  false;
      queryChanges.spatialSelected =  false;
      queryChanges.anatomySelected =  false;
      queryChanges.spatialImport =  false;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      register: register,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      setDbToQuery: setDbToQuery,
      addSectionToQuery: addSectionToQuery,
      addTermToQuery: addTermToQuery,
      saveDrawingOnSection: saveDrawingOnSection,
      getQuerySectionData: getQuerySectionData,
      setQuerySectionData: setQuerySectionData,
      getQuerySectionName: getQuerySectionName,
      getQuerySectionAtIndex: getQuerySectionAtIndex,
      getAllQuerySectionNames: getAllQuerySectionNames,
      getQueryTermName: getQueryTermName,
      getQueryTermData: getQueryTermData,
      setQueryTermData: setQueryTermData,
      selectQuerySection: selectQuerySection,
      //getAllQueryTermNames: getAllQueryTermNames,
      //selectQueryTerm: selectQueryTerm,
      //getQueryTermAtIndex: getQueryTermAtIndex,
      getQueryType: getQueryType,
      importQuerySection: importQuerySection,
      isImporting: isImporting,
      setImporting: setImporting,
      typeChanged: typeChanged
   };

}(); // end of module tiledImageQuerY
