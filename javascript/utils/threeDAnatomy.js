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
   var treeTool;
   var _console;
   var utils;
   var ren;
   var anatomyDetails;
   var anatomyData;
   var domainArr;
   var oldDomainArr;
   var pathToSurfs;
   var suffix;
   var context;
   var openerTitleDiv;
   var openerTitleTxt;
   var keep3dAnatomyHelpFrame
   var dragContainerId;
   var dropContainerId;

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
      model.register(this, "threeDAnatomy");
      view = window.opener.emouseatlas.emap.tiledImageView;
      view.register(this, "threeDAnatomy");
      treeTool = view.getTreeTool();

      utils = emouseatlas.emap.utilities;

      _console = window.opener.console;

      openerTitleDiv = window.opener.document.getElementById("wlzIIPViewerTitle");
      //_console.log("openerTitleDiv ",openerTitleDiv);

      set3dTitle();

      //anatomyDetails = model.getAnatomyDetails();
      //_console.log("threeDAnatomy.initialise: anatomyDetails ",anatomyDetails);
      anatomyDataFromDb = model.getAnatomyData("anatomy");
      pathToSurfs = anatomyDataFromDb.locn;
      suffix = anatomyDataFromDb.suffix;
      anatomyData = anatomyDataFromDb.anat;

      domainArr = [];

      context = {
         name: "context",
	 path: pathToSurfs + "/embryonic" + suffix,
	 color: "0x999999",
	 transparent: true,
	 opacity: "0.3"
      };
      //_console.log("threeDAnatomy.initialise: context ",context);

      container = document.getElementById("threeDContainer");
      ren = new MARenderer(window, container);
      ren.init();
      ren.addModel(context);
      setCamera();
      ren.animate();

      // if there are selected components, add them
      addInitialComponents(params);

      keep3dAnatomyHelpFrame = false;

      dragContainerId = "threeDAnatomyHelpIFrameContainer";
      dropContainerId = "threeDContainer";

      addEventHandlers();

      window.opener.emouseatlas.emap.tiledImageView.new3DCallback(true);
   };

   //---------------------------------------------------------
   // this data has to be determined manually from the 3d anatomy window using C and ! keys.
   //---------------------------------------------------------
   var setCamera = function () {

      var details;
      var EMA;

      details = model.getAnatomyDetails();
      EMA = details.model;

      switch(EMA) {
         case "EMA7":
	    ren.setCamera(new THREE.Vector3(206.915, 218.51399999999998, 59.966924999999996), 0.1, 2600.54, new THREE.Vector3(185.1528700340208, 798.5760397693, -34.24881276062421));
	    ren.setHome(new THREE.Vector3(185.1528700340208, 798.5760397693, -34.24881276062421), new THREE.Vector3(-0.01769696400083456, -0.5164302526841936, -0.8561463727527472));
	 break;
         case "EMA8":
	    ren.setCamera(new THREE.Vector3(475.9525, 428.5105, 203.011765), 0.1, 6036.87, new THREE.Vector3(-744.6751783693616, -860.5319811412436, 244.24583753917955));
	    ren.setHome(new THREE.Vector3(-744.6751783693616, -860.5319811412436, 244.24583753917955), new THREE.Vector3(0.11401756244997995, 0.2551726442515547, 0.9601494243494612));
	 break;
         case "EMA9":
            ren.setCamera(new THREE.Vector3(220.4545, 208.319, 148.94549), 0.1, 3001.51, new THREE.Vector3(1080.632685985518, 1111.2065135148407, 160.05489610112778));
            ren.setHome(new THREE.Vector3(1080.632685985518, 1111.2065135148407, 160.05489610112778), new THREE.Vector3(-0.2014645427327543, -0.026743126510404443, -0.9791306568614401));
	 break;
         case "EMA10":
	    ren.setCamera(new THREE.Vector3(221.534, 190.8217, 199.41186000000002), 0.1, 4012.76, new THREE.Vector3(-66.77296704395707, -1423.5844584254023, 136.11519431312934));
	    ren.setHome(new THREE.Vector3(-66.77296704395707, -1423.5844584254023, 136.11519431312934), new THREE.Vector3(0.33165461422288334, 0.09576835231571894, -0.9385273781618639));
	 break;
         case "EMA17":
	 break;
         case "EMA21":
	 break;
         case "EMA24":
	 break;
         case "EMA27":
	    ren.setCamera(new THREE.Vector3(877, 548, 1074), 1, 10000, new THREE.Vector3(-2969.055338089681, 8278.675185913264, 519.4552933693614));
	    ren.setHome(new THREE.Vector3(-2969.055338089681, 8278.675185913264, 519.4552933693614), new THREE.Vector3(0.06614901301747221, -0.10876734966564841, -0.9918551844516033));
	 break;
         case "EMA28":
	 break;
         case "EMA28_3D":
	 break;
         case "EMA49":
	 break;
         case "EMA49_3D":
	 break;
         case "EMA54":
	 break;
         case "EMA54_3D":
	 break;
         case "EMA65":
	 break;
         case "EMA65_3D":
	 break;
         case "EMA76":
	 break;
         case "EMA108":
	 break;
         case "EMA109":
	 break;
         case "EMA146":
	 break;
         case "EMA147":
	 break;
         case "EMA148":
	 break;
         case "EMA149":
	 break;
      } // switch

   }; // setCamera

   //---------------------------------------------------------
   // this data is copied from the EMAxx.php files
   //---------------------------------------------------------
   var set3dTitle = function () {

      var details;
      var EMA;
      var titleDiv;
      var titleText;

      details = model.getAnatomyDetails();
      EMA = details.model;
      titleDiv = document.getElementById("wlzIIPViewer3dTitle");

      switch(EMA) {
         case "EMA7":
	    titleDiv.innerHTML = "3D Model (EMA:7): TS7(5.5 &#x2014; 5.75 dpc)";
	 break;
         case "EMA8":
	    titleDiv.innerHTML = "3D Model (EMA:8): TS8(6.0 &#x2014; 6.25 dpc)";
	 break;
         case "EMA9":
	    titleDiv.innerHTML = "3D Model (EMA:9): TS9 (6.0 &#x2014; 6.5 dpc)";
	 break;
         case "EMA10":
	    titleDiv.innerHTML = "3D Model (EMA:10): TS10(7 dpc)";
	 break;
         case "EMA17":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA21":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA24":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA27":
	    titleDiv.innerHTML = "3D Model (EMA:27): TS14(9 dpc)";
	 break;
         case "EMA28":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA28_3D":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA49":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA49_3D":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA54":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA54_3D":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA65":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA65_3D":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA76":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA108":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA109":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA146":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA147":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA148":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA149":
	    titleDiv.innerHTML = "";
	 break;
      } // switch

   }; // set3dTitle


   //---------------------------------------------------------
   var getDataForDomainId = function (id) {

      var data;
      var hexCol;
      var found;
      var len;
      var i;

      //_console.log("getDataForEmapaId %s",id);
      if(id === undefined) {
         return false;
      }

      len = anatomyData.length;
      found = false;

      for(i=0; i<len; i++) {
	 data = anatomyData[i];
	 //_console.log("getDataForDomainId %s data ",id,data);
         if(id == data.domain) {
	    found = true;
	    break;
	 }
      }

      if(found) {
         hexCol = treeTool.getDomainColour(id, true); // true --> return hex rgba string
	 data.hexrgba = hexCol;
         return data;
      } else {
         return undefined;
      }

   }; // getDataForDomainId

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
   var refreshAnatomyData = function () {

      var anatomyDataFromDb;

      anatomyDataFromDb = model.getAnatomyData("anatomy");
      //_console.log("refreshAnatomyData ",anatomyDataFromDb);
      pathToSurfs = anatomyDataFromDb.locn;
      suffix = anatomyDataFromDb.suffix;
      anatomyData = anatomyDataFromDb.anat;

   }; // refreshAnatomyData

   //---------------------------------------------------------
   var addInitialComponents = function (urlParams) {

      var domain;
      var domainIdArr;
      var container;
      var emapa;
      var fullname;
      var data;
      var rgba;
      var rgb;
      var alpha;
      var len;
      var i;

      domainIdArr = urlParams.comps.split(",");

      len = domainIdArr.length;

      if(len === 0 || domainIdArr[0] === "") {
         //_console.log("no initial components");
	 return false;
      }

      for(i=0; i<len; i++) {
         domain = domainIdArr[i];
         data = getDataForDomainId(domain);
         //_console.log(data);
	 fullname = pathToSurfs + data.structure + data.basename + suffix;
	 rgba = data.hexrgba;
	 rgb = rgba.slice(0,-2);
	 alpha = rgba.substr(-2);
         alphaDec = emouseatlas.emap.utilities.hexToNormDec(alpha, 255, 3); 
         //_console.log("fullname %s, rgb %s, alphaDec %s",fullname,rgb,alphaDec);

	 ren.addModel({
	    name:domain,
	    path:fullname, 
	    color:rgb,
	    transparent: false,
	    opacity: alphaDec
	 });
      }
   };

   //---------------------------------------------------------
   var updateComponents = function (urlParams) {

      var oldDomainArr;
      var compStr;
      var deleting;
      var changedComponents;
      var domain;
      var fullname;
      var name;
      var col;
      var len;
      var i;

      //_console.log("updateComponents urlParams ",urlParams);

      refreshAnatomyData();

      oldDomainArr = [];
      len = domainArr.length;

      for(i=0; i<len; i++) {
         oldDomainArr[i] = domainArr[i];
      }
      //_console.log("updateComponents oldDomainArr ",oldDomainArr);

      len = oldDomainArr.length;

      compStr = urlParams.split("=")[1];
      //_console.log("updateComponents compStr -->%s<--",compStr);
      if(compStr === "") {
         domainArr = [];
	 clearAll();
      } else {
         domainArr = compStr.split(",");
      }
      //_console.log("updateComponents domainArr ",domainArr);
      //_console.log("updateComponents new domainArr.length %d, ",domainArr.length,domainArr);

      deleting = (domainArr.length < oldDomainArr.length) ? true : false;
      changedComponents = getChangedComponents(oldDomainArr, deleting);
      //_console.log("updateComponents changedComponents ",changedComponents);

      len = changedComponents.length;

      if(deleting) {
         for(i=0; i<len; i++) {
	    domain = changedComponents[i];
            ren.removeModel(domain);
	 }
      } else {
         for(i=0; i<len; i++) {
	    domain = changedComponents[i];
	    data = getDataForDomainId(domain);
            // _console.log(data);
	    if(data === undefined) {
	       //_console.log("updateComponents: domain ",domain);
	       continue;
	    }
	    //_console.log("data ",data);
	    fullname = pathToSurfs + data.structure + data.basename + suffix;
	    rgba = data.hexrgba;
	    rgb = rgba.slice(0,-2);
	    alpha = rgba.substr(-2);
	    alphaDec = emouseatlas.emap.utilities.hexToNormDec(alpha, 255, 3); 
	    //_console.log("fullname %s, rgb %s, alphaDec %s",fullname,rgb,alphaDec);

	    ren.addModel({
	       name:domain,
	       path:fullname, 
	       color:rgb,
	       transparent: false,
	       opacity: alphaDec
	    });
	 }
      }
   }; // updateComponents

   //---------------------------------------------------------
   var getChangedComponents = function (oldDomainArr, deleting) {

      var lmnt;
      var changedArr;
      var len;
      var i;

      changedArr = [];

      if(oldDomainArr.length === 0) {
         changedArr = [];
	 len = domainArr.length;
	 for(i=0; i<len; i++) {
	    changedArr[changedArr.length] = domainArr[i];
	 }
         //_console.log("getChangedComponents:  before ",oldDomainArr);
         //_console.log("getChangedComponents:  after ",changedArr);
	 return changedArr;
      }

      if(deleting) {
         if(domainArr.length === 0) {
	    changedArr[0] = oldDomainArr[0];
	 } else {
            len = oldDomainArr.length;
            for(i=0; i<len; i++) {
               lmnt = oldDomainArr[i];
               if(window.opener.emouseatlas.emap.utilities.arrayContains(domainArr, lmnt)) {
                  continue;
               } else {
	          changedArr[changedArr.length] = lmnt;
                  break;
               }
   	    }
         }
      } else {
         len = domainArr.length;
	 for(i=0; i<len; i++) {
	    lmnt = domainArr[i];
	    //_console.log("getChangedComponents:  lmnt %d ",i,lmnt);
	    if(window.opener.emouseatlas.emap.utilities.arrayContains(oldDomainArr, lmnt)) {
	       continue;
	    } else {
	       changedArr[changedArr.length] = lmnt;
	    }
	 }
      }

      //_console.log("getChangedComponents:  before ",oldDomainArr);
      //_console.log("getChangedComponents:  after ",changedArr);
      return changedArr;

   }; // getChangedComponents

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

      var treeNode;
      var emapa;
      var domainId;
      var nodeId;
      var col;

      if(changes.treeNodeColour) {
         //_console.log("threeDAnatomy.modelUpdate treeNodeColour %s",changes.treeNodeColour);
	 treeNode = window.opener.emouseatlas.emap.tiledImageModel.getUpdatedTreeNode();
         //_console.log("threeDAnatomy.modelUpdate treeNode ",treeNode);
	 if(treeNode.extId[1]) {
            emapa = treeNode.extId[1];
	    domainId = treeNode.domainData.domainId;
	    nodeId = treeNode.nodeId;
	    //_console.log("modelUpdate emapa %s, domainId %s, nodeId %s",emapa, domainId, nodeId);
	    if(treeTool.isChecked(nodeId)) {
	       //_console.log("modelUpdate domainData.domainColour ",treeNode.domainData.domainColour);
	       col = treeTool.getDomainColour(domainId);
	       //_console.log("modelUpdate col from treeTool ",col);
	       doColourChange({emapa:emapa, domainId:domainId, col:col});
	    }
	 } else {
	    return false;
	 }
      }

   };

   //---------------------------------------------------------------
   var viewUpdate = function (changes) {

      if(changes.threeD) {
         //_console.log("changes.threeD %s",changes.threeD);
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

      //_console.log("threeDAnatomy, doColourChange: params ",params);

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
   };

   //---------------------------------------------------------
   var addEventHandlers = function () {

      utils.addEvent(threeDAnatomyHelpIconContainer, 'click', do3dAnatomyHelpIconClicked, false);
      utils.addEvent(threeDAnatomyHelpIconContainer, 'mouseover', doMouseOverHelpIcon, false);
      utils.addEvent(threeDAnatomyHelpIconContainer, 'mouseout', doMouseOutHelpIcon, false);
   };

   //---------------------------------------------------------------
   // called when help icon clicked
   //---------------------------------------------------------------
   var do3dAnatomyHelpIconClicked = function (event) {

      if(keep3dAnatomyHelpFrame === false) {
         keep3dAnatomyHelpFrame = true;
	 addHelpCloseEvent();
         show3dAnatomyHelpContainer();
         view.show3dAnatomyHelpFrame();
      } else {
         keep3dAnatomyHelpFrame = false;
	 removeHelpCloseEvent();
         hide3dAnatomyHelpContainer();
         view.hide3dAnatomyHelpFrame();
      }
   };

   //---------------------------------------------------------------
   // event handler for close button
   //---------------------------------------------------------------
   var close3dAnatomyHelp = function (event, that) {
      hide3dAnatomyHelpContainer();
      view.hide3dAnatomyHelpFrame();
      keep3dAnatomyHelpFrame = false;
   };

   //---------------------------------------------------------------
   // called on mouseover help icon
   //---------------------------------------------------------------
   var doMouseOverHelpIcon = function (event) {
      show3dAnatomyHelpContainer();
      view.show3dAnatomyHelpFrame();
   };

   //---------------------------------------------------------------
   // called on mouseout help icon
   //---------------------------------------------------------------
   var doMouseOutHelpIcon = function (event) {
      if(keep3dAnatomyHelpFrame) {
         return false;
      }
      hide3dAnatomyHelpContainer();
      view.hide3dAnatomyHelpFrame();
      keep3dAnatomyHelpFrame = false;
   };

   //---------------------------------------------------------
   var addHelpCloseEvent = function () {
      var closeDiv = document.getElementById("threeDAnatomyHelpIFrameContainerCloseDiv");
      if(closeDiv) {
	 emouseatlas.emap.utilities.addEvent(closeDiv, 'mouseup', function(e) {
	    close3dAnatomyHelp(e, this);
	 }, false);
      }
   };

   //---------------------------------------------------------
   var removeHelpCloseEvent = function () {
      var closeDiv = document.getElementById("threeDAnatomyHelpIFrameContainerCloseDiv");
      if(closeDiv) {
	 emouseatlas.emap.utilities.removeEvent(closeDiv, 'mouseup', function(e) {
	    close3dAnatomyHelp(e, this);
	 }, false);
      }
   };

   //---------------------------------------------------------
   var show3dAnatomyHelpContainer = function () {
      var div = document.getElementById("threeDAnatomyHelpIFrameContainer");
      div.style.visibility = "visible";
   };
   
   //---------------------------------------------------------
   var hide3dAnatomyHelpContainer = function () {
      var div = document.getElementById("threeDAnatomyHelpIFrameContainer");
      div.style.visibility = "hidden";
   };
   
   //---------------------------------------------------------
   var getDocument = function () {
      return document;
   };
   
   //---------------------------------------------------------
   var getName = function () {
      return "threeDAnatomy";
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
      getDocument: getDocument,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate
   };

}(); // end of module threeDAnatomy
//----------------------------------------------------------------------------
