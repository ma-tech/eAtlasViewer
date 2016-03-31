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
      //_console.log("threeDAnatomy.initialise: anatomyDataFromDb ",anatomyDataFromDb);
      pathToSurfs = anatomyDataFromDb.locn;
      suffix = anatomyDataFromDb.suffix;
      anatomyData = anatomyDataFromDb.anat;

      domainArr = [];

      context = {
         name: "context",
	 path: pathToSurfs + "/reference" + suffix,
	 color: "0x999999",
	 transparent: true,
	 opacity: "0.5"
      };
      //_console.log("threeDAnatomy.initialise: context ",context);

      container = document.getElementById("threeDContainer");
      ren = new MARenderer(window, container);
      ren.init();
      ren.setPickOfs(35);
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
            ren.setCamera(new THREE.Vector3(226.02814999999998, 131.42430000000002, 284.33131), 0.1, 5714.82, new THREE.Vector3(1587.0170996935876, 1978.9531609977153, 1.7353812720617157));
            ren.setHome(new THREE.Vector3(1587.0170996935876, 1978.9531609977153, 1.7353812720617157), new THREE.Vector3(-0.05601199462646159, -0.180087689281455, -0.9820545201908211));
	 break;
         case "EMA21":
            ren.setCamera(new THREE.Vector3(219.63440000000003, 176.73955, 267.408305), 0.1, 5364.719999999999, new THREE.Vector3(-638.4701830058849, 2130.445819145013, 666.7350917507665));
            ren.setHome(new THREE.Vector3(-638.4701830058849, 2130.445819145013, 666.7350917507665), new THREE.Vector3(-0.4746911924727429, 0.623012222923193, -0.6217105772600585));
	 break;
         case "EMA24":
            ren.setCamera(new THREE.Vector3(185.0745, 221.05345, 212.50694), 0.1, 4291.38, new THREE.Vector3(-1266.7653794479108, -736.6548049095416, -35.54566583241311));
            ren.setHome(new THREE.Vector3(-1266.7653794479108, -736.6548049095416, -35.54566583241311), new THREE.Vector3(0.4203910840162584, -0.17593000678266166, -0.8901235696200197));
	 break;
         case "EMA27":
	    ren.setCamera(new THREE.Vector3(877.3924999999999, 551.6105, 1075.5019), 11.4119, 21281.8, new THREE.Vector3(-2890.297951880888, 3946.067109761968, -952.6104658506733));
	    ren.setHome(new THREE.Vector3(-2890.297951880888, 3946.067109761968, -952.6104658506733), new THREE.Vector3(-0.045736654169990454, 0.19134849482609467, -0.9804471669565338));
	 break;
         case "EMA28":
	    ren.setCamera(new THREE.Vector3(348.72375, 53.272000000000006, 331.720745), 0.1, 6714.650000000001, new THREE.Vector3(1291.13954135639, 2613.515278499458, 593.8793886697314));
	    ren.setHome(new THREE.Vector3(1291.13954135639, 2613.515278499458, 593.8793886697314), new THREE.Vector3(-0.0691915114661015, -0.09700477902296169, 0.9928759275900182));
	 break;
         case "EMA28_3D":
            ren.setCamera(new THREE.Vector3(213.26135, 160.05675, -194.349435), 0.1, 4015.4199999999996, new THREE.Vector3(1027.828844651105, -870.6745865524956, -1146.1116869808454));
            ren.setHome(new THREE.Vector3(1027.828844651105, -870.6745865524956, -1146.1116869808454), new THREE.Vector3(-0.8011353985069526, -0.2041553138018194, -0.5625857100083261));
	 break;
         case "EMA49":
	 break;
         case "EMA49_3D":
            ren.setCamera(new THREE.Vector3(348.72375, 53.272000000000006, 331.720745), 0.1, 6714.650000000001, new THREE.Vector3(571.4179261405282, 2783.7235295912237, 249.48892745781387));
            ren.setHome(new THREE.Vector3(571.4179261405282, 2783.7235295912237, 249.48892745781387), new THREE.Vector3(0.14298182936275103, -0.0013647510747910635, 0.9897243727051332));
	 break;
         case "EMA54":
	 break;
         case "EMA54_3D":
            ren.setCamera(new THREE.Vector3(339.46209999999996, 227.97995, 390.4661), 8.5356, 7638.61, new THREE.Vector3(245.59685900486124, -2784.859661973399, 324.76792544430657));
            ren.setHome(new THREE.Vector3(245.59685900486124, -2784.859661973399, 324.76792544430657), new THREE.Vector3(0.20671173251206462, 0.09047302521973599, -0.974209880543943));
	 break;
         case "EMA65":
	 break;
         case "EMA65_3D":
	    ren.setCamera(new THREE.Vector3(369.989915, 235.0283, 574.31217), 0.1, 11556.900000000001, new THREE.Vector3(1711.7292355593668, -4232.544081075398, 319.9992676292543));
	    ren.setHome(new THREE.Vector3(1711.7292355593668, -4232.544081075398, 319.9992676292543), new THREE.Vector3(0.18536589056209168, 0.16343682860657907, -0.9689829150563751));
	 break;
         case "EMA76":
	    ren.setCamera(new THREE.Vector3(760.4255, 596.2945, 759.51144), 0.1, 15276.199999999999, new THREE.Vector3(-3519.2689026314365, 5032.56991603102, 1594.3161845246404));
	    ren.setHome(new THREE.Vector3(-3519.2689026314365, 5032.56991603102, 1594.3161845246404), new THREE.Vector3(0.6677148006093809, -0.6814483135215241, -0.29964168776357525));
	 break;
         case "EMA103":
	    ren.setCamera(new THREE.Vector3(530.67, 170.42999999999995, 2410.95855), 0.1, 48514.2, new THREE.Vector3(12293.39178230287, -13680.009153973551, -502.3763875331297));
	    ren.setHome(new THREE.Vector3(12293.39178230287, -13680.009153973551, -502.3763875331297), new THREE.Vector3(-0.519299983756752, 0.6317147918589494, -0.5755403407380021));
	 break;
         case "EMA108":
	    ren.setCamera(new THREE.Vector3(137.7476, 119.20685, 330.5864), 9.0506, 6427.26, new THREE.Vector3(-48.76196935159405, -2319.432899894142, -205.16292385490067));
	    ren.setHome(new THREE.Vector3(-48.76196935159405, -2319.432899894142, -205.16292385490067), new THREE.Vector3(0.0576063296691242, 0.9974853393261259, -0.04128569499776353));
	 break;
         case "EMA109":
	    ren.setCamera(new THREE.Vector3(158.6156, 115.61524, 330.10585), 3.76374, 6494.62, new THREE.Vector3(154.3195871217657, -2446.711798135565, 345.65965779391274));
	    ren.setHome(new THREE.Vector3(154.3195871217657, -2446.711798135565, 345.65965779391274), new THREE.Vector3(-0.14055727233941873, 0.03935166929597104, -0.9892901997473281));
	 break;
         case "EMA146":
	    ren.setCamera(new THREE.Vector3(89.57085500000001, 97.000175, 152.989025), 0.1, 3084.9700000000003, new THREE.Vector3(1236.469183813486, -357.4251240118993, 360.95195791987857));
	    ren.setHome(new THREE.Vector3(1236.469183813486, -357.4251240118993, 360.95195791987857), new THREE.Vector3(-0.7035924075449128, 0.31779381775077054, 0.635582263318077));
	 break;
         case "EMA147":
	    ren.setCamera(new THREE.Vector3(40.473765, 53.50709, 83.97391999999999), 0.1, 1692.97, new THREE.Vector3(721.1694807905697, -17.8480500568676, 39.423817987918206));
	    ren.setHome(new THREE.Vector3(721.1694807905697, -17.8480500568676, 39.423817987918206), new THREE.Vector3(-0.7142508685841874, 0.012239381876779198, 0.6997827478996507));
	 break;
         case "EMA148":
	    ren.setCamera(new THREE.Vector3(172.32072, 222.47733000000002, 111.83105), 0.1, 4463.67, new THREE.Vector3(249.3872484655763, 380.87600262038086, -1692.6806847639916));
	    ren.setHome(new THREE.Vector3(249.3872484655763, 380.87600262038086, -1692.6806847639916), new THREE.Vector3(-0.02520109976126297, -0.9988742463422551, 0.040188861205637215));
	 break;
         case "EMA149":
	    ren.setCamera(new THREE.Vector3(125.85142, 183.02498, 123.49745), 3.77042, 3570.31, new THREE.Vector3(69.91941811379706, -25.488831289388173, -1269.5310510171014));
	    ren.setHome(new THREE.Vector3(69.91941811379706, -25.488831289388173, -1269.5310510171014), new THREE.Vector3(0.18200963396884215, -0.9466951389842613, 0.2657833835402222));
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
	    titleDiv.innerHTML = "3D Model (EMA:17): TS11(7.5 dpc)";
	 break;
         case "EMA21":
	    titleDiv.innerHTML = "3D Model (EMA:21): TS12(8 dpc)";
	 break;
         case "EMA24":
	    titleDiv.innerHTML = "3D Model (EMA:24): TS13(8.5 dpc)";
	 break;
         case "EMA27":
	    titleDiv.innerHTML = "3D Model (EMA:27): TS14(9 dpc)";
	 break;
         case "EMA28":
	    titleDiv.innerHTML = "3D Model (EMA:28): TS15(9.5 dpc)";
	 break;
         case "EMA28_3D":
	    titleDiv.innerHTML = "3D Model (EMA:28): TS15(9.5 dpc)";
	 break;
         case "EMA49":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA49_3D":
	    titleDiv.innerHTML = "3D Model (EMA:49): TS17(10.5 dpc)";
	 break;
         case "EMA54":
	    titleDiv.innerHTML = "";
	 break;
         case "EMA54_3D":
	    titleDiv.innerHTML = "3D Model (EMA:54): TS18(11 dpc)";
	 break;
         case "EMA65":
	    titleDiv.innerHTML = "3D Model (EMA:65): TS19(11.5 dpc)";
	 break;
         case "EMA65_3D":
	    titleDiv.innerHTML = "3D Model (EMA:65): TS19(11.5 dpc)";
	 break;
         case "EMA76":
	    titleDiv.innerHTML = "3D Model (EMA:76): TS20(12 dpc)";
	 break;
         case "EMA103":
	    titleDiv.innerHTML = "3D Model (EMA:103): TS25(17.5 dpc)";
	 break;
         case "EMA108":
	    titleDiv.innerHTML = "NIMR 3D Model (EMA:108): TS23(14.5 dpc), forelimb";
	 break;
         case "EMA109":
	    titleDiv.innerHTML = "NIMR 3D Model (EMA:109): TS23(14.5 dpc), hindlimb";
	 break;
         case "EMA146":
	    titleDiv.innerHTML = "Caltech Atlas Model (EMA:146): TS21(12.5 dpc)";
	 break;
         case "EMA147":
	    titleDiv.innerHTML = "Caltech Atlas Model (EMA:147): TS23(15 dpc)";
	 break;
         case "EMA148":
	    titleDiv.innerHTML = "Caltech Atlas Model (EMA:148): TS24(16 dpc)";
	 break;
         case "EMA149":
	    titleDiv.innerHTML = "Caltech Atlas Model (EMA:149): TS25(17 dpc)";
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

      ren.addEventListener('pick', doMousePick, false);
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

   //---------------------------------------------------------------
   // called on mouseclick in 3D image container
   //---------------------------------------------------------------
   var doMousePick = function (event) {

      var type;
      var hitlist;
      var trgt;
      var domainIdStr;
      var domainName;
      var listOfNames;
      var len;
      var i;

      if(!event) {
         return false;
      }

      type = event.type;
      hitlist = event.hitlist;
      trgt = event.target;

      /*
      _console.log("doMousePick hitlist length: %d",hitlist.length);
      _console.log("doMousePick type: %s",type);
      _console.log("doMousePick hitlist: ",hitlist);
      _console.log("doMousePick trgt: ",trgt);
      */

      listOfNames = "Pick List\n-------------\n\n";

      if(hitlist !== undefined && hitlist.length > 0) {
         len = hitlist.length;

	 for(i=0; i<len; i++) {
	    hit = hitlist[i];
	    domainIdStr = hit.object.name;

            if(domainIdStr && domainIdStr === "context") {
               domainName = undefined;
            } else {
               domainName = treeTool.getDomainName(domainIdStr);
            }

            _console.log("domain %s %s",domainIdStr,domainName);
	    if(domainName !== undefined) {
	       listOfNames += domainName + "\n";
	    }
   
	 }

	 alert(listOfNames);
      }
      
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
