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
//   threeDAnatomy.js
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
emouseatlas.emap.threeDAnatomy = function () {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var _debug;
   var model;
   var view;
   var _console;
   var utils;
   var ren;
   var anatomyDetails;
   var anatomyData;
   var emapaArr;
   var oldEmapaArr;
   var pathToSurfs;
   var suffix;
   var context;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      var anatomyDataFromDb;
      var container;

      _debug = false;
      if(!(Detector.webgl)) {
         Detector.addGetWebGLMessage();
      }

      model = window.opener.emouseatlas.emap.tiledImageModel;
      model.register(this);
      view = window.opener.emouseatlas.emap.tiledImageView;
      view.register(this);

      utils = emouseatlas.emap.utilities;

      _console = window.opener.console;

      //anatomyDetails = model.getAnatomyDetails();
      //_console.log("threeDAnatomy.initialise: anatomyDetails ",anatomyDetails);
      anatomyDataFromDb = model.getAnatomyData("anatomy");
      pathToSurfs = anatomyDataFromDb.locn;
      suffix = anatomyDataFromDb.suffix;
      anatomyData = anatomyDataFromDb.anat;

      emapaArr = [];

      context = {
         name: "context",
	 path: pathToSurfs + "/embryonic" + suffix,
	 color: "0xFF00FF",
	 transparent: true,
	 opacity: "0.3"
      };
      _console.log("threeDAnatomy.initialise: context ",context);

      container = document.getElementById("threeDContainer");
      ren = new MARenderer(window, container);
      ren.init();
      ren.addModel(context);
      ren.animate();

      // if there are selected components, add them
      addInitialComponents(params);

      window.opener.emouseatlas.emap.tiledImageView.new3DCallback(true);
   };

   //---------------------------------------------------------
   var parseInitParams = function (params) {

      var compStr;

      compStr = params.comps;
      if(compStr === "") {
         emapaArr = [];
      } else {
         emapaArr = compStr.split(",");
      }
      //_console.log("emapaArr ",emapaArr);

   }; // parseInitParams

   //---------------------------------------------------------
   var getDataForEmapaId = function (id) {

      var data;
      var emapa;
      var found;
      var len;
      var i;

      //_console.log("getDataForEmapaId %s",id);
      if(id === undefined) {
         return false;
      }

      if(id.toLowerCase().indexOf("emapa:") === -1) {
         emapa = "EMAPA:" + id;
      } else {
         emapa = id;
      }

      len = anatomyData.length;
      found = false;

      for(i=0; i<len; i++) {
	 data = anatomyData[i];
         if(emapa == data.emapa) {
	    found = true;
	    break;
	 }
      }

      if(found) {
         return data;
      } else {
         return undefined;
      }

   }; // getDataForEmapaId

   //---------------------------------------------------------
   var addInitialComponents = function (params) {

      var container;
      var emapa;
      var fullname;
      var data;
      var rgba;
      var rgb;
      var alpha;
      var len;
      var i;

      parseInitParams(params);

      if(emapaArr === undefined) {
	 return false;
      }

      len = emapaArr.length;

      for(i=0; i<len; i++) {
         emapa = emapaArr[i];
         //_console.log("addComponents: %s",emapa);
         data = getDataForEmapaId(emapa);
	 fullname = pathToSurfs + data.structure + data.basename + suffix;
	 rgba = data.hexrgba;
	 rgb = rgba.slice(0,-2);
	 alpha = rgba.substr(-2);
         alphaDec = emouseatlas.emap.utilities.hexToNormDec(alpha, 255, 3); 
         //_console.log("fullname %s, rgb %s, alphaDec %s",fullname,rgb,alphaDec);

	 ren.addModel({
	    name:emapa,
	    path:fullname, 
	    color:rgb,
	    transparent: false,
	    opacity: alphaDec
	 });

      }

      //ren.animate();
   };

   //---------------------------------------------------------
   var updateComponents = function (urlParams) {

      var oldLmntArr;
      var compStr;
      var deleting;
      var changedComponents;
      var emapa;
      var fullname;
      var name;
      var col;
      var len;
      var i;

      //_console.log("updateComponents urlParams ",urlParams);

      oldEmapaArr = [];
      len = emapaArr.length;

      for(i=0; i<len; i++) {
         oldEmapaArr[i] = emapaArr[i];
      }
      //_console.log("updateComponents oldEmapaArr ",oldEmapaArr);

      len = oldEmapaArr.length;

      compStr = urlParams.split("=")[1];
      //_console.log("updateComponents compStr -->%s<--",compStr);
      if(compStr === "") {
         emapaArr = [];
	 clearAll();
      } else {
         emapaArr = compStr.split(",");
      }
      //_console.log("updateComponents new emapaArr.length %d, ",emapaArr.length,emapaArr);

      deleting = (emapaArr.length < oldEmapaArr.length) ? true : false;
      changedComponents = getChangedComponents(oldEmapaArr, deleting);
      //_console.log("updateComponents changedComponents ",changedComponents);

      len = changedComponents.length;

      if(deleting) {
         for(i=0; i<len; i++) {
	    emapa = changedComponents[i];
            ren.removeModel(emapa);
	 }
      } else {
         for(i=0; i<len; i++) {
	    emapa = changedComponents[i];
	    data = getDataForEmapaId(emapa);
	    if(data === undefined) {
	       _console.log("updateComponents: emapa ",emapa);
	       continue;
	    }
	    fullname = pathToSurfs + data.structure + data.basename + suffix;
	    rgba = data.hexrgba;
	    rgb = rgba.slice(0,-2);
	    alpha = rgba.substr(-2);
	    alphaDec = emouseatlas.emap.utilities.hexToNormDec(alpha, 255, 3); 
	    //_console.log("fullname %s, rgb %s, alphaDec %s",fullname,rgb,alphaDec);

	    ren.addModel({
	       name:emapa,
	       path:fullname, 
	       color:rgb,
	       transparent: false,
	       opacity: alphaDec
	    });
	 }
      }
   };

   //---------------------------------------------------------
   var getChangedComponents = function (oldEmapaArr, deleting) {

      var lmnt;
      var changedArr;
      var len;
      var i;

      changedArr = [];

      if(oldEmapaArr.length === 0) {
         changedArr = [];
	 len = emapaArr.length;
	 for(i=0; i<len; i++) {
	    changedArr[changedArr.length] = emapaArr[i];
	 }
	 return changedArr;
      }

      if(deleting) {
         if(emapaArr.length === 0) {
	    changedArr[0] = oldEmapaArr[0];
	 } else {
            len = oldEmapaArr.length;
            for(i=0; i<len; i++) {
               lmnt = oldEmapaArr[i];
               if(window.opener.emouseatlas.emap.utilities.arrayContains(emapaArr, lmnt)) {
                  continue;
               } else {
	          changedArr[changedArr.length] = lmnt;
                  break;
               }
   	    }
         }
      } else {
         len = emapaArr.length;
	 for(i=0; i<len; i++) {
	    lmnt = emapaArr[i];
	    if(window.opener.emouseatlas.emap.utilities.arrayContains(oldEmapaArr, lmnt)) {
	       continue;
	    } else {
	       changedArr[changedArr.length] = lmnt;
	       break;
	    }
	 }
      }

      //_console.log("getChangedComponents: ",lmnt);
      return changedArr;
   };

   //---------------------------------------------------------------
   var clearAll = function () {

      var children;
      var child;
      var len;
      var i;
      var toRemove;

      toRemove = [];

      children = ren.getChildren();
      //_console.log("clearAll ",children);

      len = children.length;

      for(i=0; i<len; i++) {
         child = children[i];
	 if(child.name === undefined || child.name === "context") {
	    continue;
	 } else {
	    //_console.log("clearAll %s",child.name);
	    toRemove[toRemove.length] = child.name;
	 }
      }

      len = toRemove.length;
      for(i=0; i<len; i++) {
         ren.removeModel(toRemove[i]);
      }

   };

   //---------------------------------------------------------------
   var modelUpdate = function (changes) {

   };

   //---------------------------------------------------------------
   var viewUpdate = function (changes) {

      var treeNode;
      var emapa;
      var domainId;
      var col;

      //_console.log("viewUpdate");
      if(changes.threeD) {
         //_console.log("changes.threeD %s",changes.threeD);
      }

      if(changes.colour) {
	 treeNode = window.opener.emouseatlas.emap.tiledImageModel.getUpdatedTreeNode();
	 if(treeNode.extId[1]) {
            emapa = treeNode.extId[1];
	    domainId = treeNode.domainData.domainId;
	    col = treeNode.domainData.domainColour;
	    doColourChange({emapa:emapa, domainId:domainId, col:col});
	 } else {
	    return false;
	 }
      }

   };

   //---------------------------------------------------------
   var doColourChange = function (params) {

      var emapa;
      var indx;
      var id;
      var col;
      var alf;
      var hexr;
      var hexg;
      var hexb;
      var hexrgba;
      var data;
      var len;
      var i;

      //_console.log("doColourChange: params ",params);

      emapa = params.emapa.toLowerCase();
      indx = emapa.indexOf(":");
      id = emapa.substr(indx + 1*1);
      col = params.col;
      alf = parseInt(col[3] * 255);

      hexr = window.opener.emouseatlas.emap.utilities.toHex(col[0]);
      hexg = window.opener.emouseatlas.emap.utilities.toHex(col[1]);
      hexb = window.opener.emouseatlas.emap.utilities.toHex(col[2]);
      hexa = window.opener.emouseatlas.emap.utilities.toHex(alf);
      hexrgba = "0x" + hexr + hexg + hexb + hexa;
      //_console.log("hexrgba ",hexrgba);

      data = getDataForEmapaId(id);
      //_console.log("doColourChange: data.hexrgba ",data.hexrgba);
      data.hexrgba = hexrgba;

      //_console.log("doColourChange: data.hexrgba now ",data.hexrgba);
      fullname = pathToSurfs + data.structure + data.basename + suffix;
      rgba = data.hexrgba;
      rgb = rgba.slice(0,-2);
      alpha = rgba.substr(-2);
      alphaDec = emouseatlas.emap.utilities.hexToNormDec(alpha, 255, 3); 
      //_console.log("fullname %s, color %s, alphaDec %s",fullname,rgb,alphaDec);

      // ren.updateModel() doesn't seem to work so do remove/add instead
      ren.removeModel(id);
      ren.addModel({
         name:id,
         path:fullname, 
         color:rgb,
         transparent: false,
         opacity: alphaDec
      });

   };

   //---------------------------------------------------------
   // you can't delete an object but 'delete' removes references to it
   // so that it can be garbage collected
   //---------------------------------------------------------
   var closeMARenderer = function () {
      if(ren) {
         //_console.log("ren exists");
	 delete ren;
      }
      /*
      if(ren) {
         _console.log("ren still exists");
      } else {
         _console.log("ren no more");
      }
      */
   };

   //---------------------------------------------------------
   var getName = function () {
      return 'threeDAnatomy';
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      updateComponents: updateComponents,
      closeMARenderer: closeMARenderer,
      getName: getName,
      viewUpdate: viewUpdate
   };

}(); // end of module threeDAnatomy
//----------------------------------------------------------------------------
