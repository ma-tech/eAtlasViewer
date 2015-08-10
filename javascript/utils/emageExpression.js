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
// module for emageExpression
//---------------------------------------------------------
emouseatlas.emap.emageExpression = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------

   var DPC = {};
   var EMAGE_ENTRY_URL;
   var emage_eurexpress_url;
   var emage_iip_sub_url;
   var emage_iip_exp_url;
   var emage_iip_opt_url;
   var DISPLAY;
   var STAGE;
   var GENE;
   var ID;
   var ASSAY;
   var EXPRESSION;
   var LABEL;
   var TITLE;
   var PARENT;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //--------------------------------------------
   var getUrl = function (arg) {
      //console.log("getUrl ID = ",ID);
      var input = arg;
	    var ret;

      if (input === undefined || input === "") {
         //console.log("getUrl: input === undefined  setting input = ",initialDisplay);
         input = DISPLAY;
      };
      if (input === undefined || input === "") {
         //console.log("getUrl: input still undefined, returning");
         return;
      }
      
      var rootSrc;
      var sectionIds;
	    var dpc = getDPC(STAGE);
	    TITLE = TITLE + " (" + dpc + "dpc)";

      if (-1 != input.indexOf(".wlz")) {
         // expression 3D iip viewer
         if (ID === undefined || ID === "") 
                rootSrc = emage_iip_exp_url;
         else
                rootSrc = emage_iip_sub_url;
 
         var token = input.split("|");
         ret = rootSrc+ token[0];
         if (0 < token.length) {
	   ret = ret+"&expressionImg="+token[1];
	   }
         if (ID === undefined || ID === "") {
	    TITLE = TITLE + " - ";
	   if (1 < token.length) {
	     sectionIds = getSectionIds(token[2]);
	     TITLE = TITLE + sectionIds;
	     //console.log("viewer title ",TITLE);
	   }
	 } else
	   TITLE = "EMAGE:" + ID + " - " + TITLE;

         for (var i = 2; i < token.length; i++) {
            ret = ret+"&"+token[i];
         }

	       ret = ret + "&viewerTitle=" + TITLE;
	       //console.log("getUrl returning ",ret);
         return ret;
      }
      
      if (-1 == input.indexOf(".wlz") && -1 == input.indexOf("euxassay")) {
         // opt iip viewer
         rootSrc = emage_iip_opt_url;
	       TITLE = TITLE + " - EMAGE:" + ID;
         var segment = "";
         var num = "";
         var length = input.indexOf("/");
         if (-1 == length) {
            segment = "segment1";
            num = input;
         } else {
            segment = input.substring(0, length);
            num = input.substring(length + 1);
         }
         length = num.indexOf(":");
         if (-1 != length) {
            num = num.substring(length+1);
         }
         ret = rootSrc+segment+"/"+num+"/"+num+"_opt.wlz";
	       ret = ret + "&viewerTitle=" + TITLE;
         //console.log("getUrl (OPT) returning ",ret);
         return ret;
      }

      if (-1 != input.indexOf("euxassay")) {
         // EurExpress iip viewer
         rootSrc = emage_eurexpress_url;
         ret = rootSrc+input+"&section=100";
      //console.log("getUrl returning ",ret);
         return rootSrc+input+"&section=100";
      }
   }; // getUrl
   
   //---------------------------------------------------------
   var getSectionIds = function (str) {

	      //console.log("getSectionIds ",str);
	      var tokens = str.split("(");
	      var sectionTokens = [];
	      var section = [];
	      var sectionIds = [];
	      //console.log(tokens);
	      var len = tokens.length;
	      var tok;
	      var i;

	      for(i=0; i<len; i++) {
		      tok = tokens[i];
		      if(tok.indexOf("EMAGE") !== -1) {
			      //console.log(tok);
			      sectionTokens[sectionTokens.length] = tok;
		      }
	      }

	      len = sectionTokens.length;
	      for(i=0; i<len; i++) {
		      tok = sectionTokens[i];
		      section = tok.split(":");
		      //console.log("section: %s, %s",section[0],section[1]);
		      sectionIds[sectionIds.length] = section[0] + ":" + section[1];
		      //console.log(sectionIds[sectionIds.length-1]);
	      }

	      return sectionIds;

   }; // getSectionIds

   //---------------------------------------------------------
   var getDPC = function (TS) {

     //console.log("getDPC %s",TS);
	var dpc = DPC[TS];

     return dpc;

   }; // getDPC

   //---------------------------------------------------------
   var getLinkToEntry = function (ID) {

     //console.log("getLinkToEntry %s",ID);
     //http://www.emouseatlas.org/emagewebapp/pages/emage_entry_page.jsf?id=EMAGE%3A70
	var link = "<a href=" + EMAGE_ENTRY_URL + ID + ">EMAGE:" + ID + "</a>";
     //console.log("getLinkToEntry: %d %s",ID,link);

     return undefined;

   }; // getLinkToEntry
   
   //--------------------------------------------
   var showFrame = function (arg) {
      
      var input = getUrl(arg);
      //console.log(input);

      if (input) {
         document.getElementById("emageExpressionIframe").src = input;
      } else {
         document.getElementById("emageExpressionIframe").style.display = 'none';
      }
      
   }; // showFrame
   
   //--------------------------------------------
   var initRadioButtons = function () {
      
      var radioContainer = PARENT.document.getElementById("multiViewerRadioContainer");
      var spatialRadio = PARENT.document.getElementById("multiViewerSpatialRadio");
      var optRadio = PARENT.document.getElementById("multiViewerOptRadio");

      if (spatialRadio === undefined || spatialRadio === null || optRadio === undefined || optRadio === null) {
	 return false;
      }

      if(EXPRESSION && ID) {
         radioContainer.style.visibility = "visible";
         spatialRadio.checked = true;
      } else {
         radioContainer.style.visibility = "hidden";
      }

      emouseatlas.emap.utilities.addEvent(spatialRadio, 'change', doRadioChanged, false);
      emouseatlas.emap.utilities.addEvent(optRadio, 'change', doRadioChanged, false);
      
   }; // initRadioButtons
   
   //--------------------------------------------
   var doRadioChanged = function (e) {
      
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined || target === null) {
         return false;
      }

      TITLE = GENE + " " + LABEL + ", " + STAGE;

      if(target.id === "multiViewerSpatialRadio") {
         //console.log(EXPRESSION);
         showFrame(EXPRESSION);
      }

      if(target.id === "multiViewerOptRadio") {
         //console.log(ID);
         showFrame(ID);
      }

      //console.log("%s changed",target.id);
      
   }; // doRadioChanged

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------
   var initialise = function (params) {
      var _debug = false;

      if(_debug) {
         console.log("enter emageExpression.initialise params = ",params);
      }

      DPC = {
         "TS1":"0.5",
         "TS01":"0.5",
         "TS2":"1",
         "TS02":"1",
         "TS3":"2",
         "TS03":"2",
         "TS4":"3",
         "TS04":"3",
         "TS5":"4",
         "TS05":"4",
         "TS6":"4.5",
         "TS06":"4.5",
         "TS7":"5",
         "TS07":"5",
         "TS8":"6",
         "TS08":"6",
         "TS9":"6.5",
         "TS09":"6.5",
         "TS10":"7",
         "TS11":"7.5",
         "TS12":"8",
         "TS13":"8.5",
         "TS14":"9",
         "TS15":"9.5",
         "TS16":"10",
         "TS17":"10.5",
         "TS18":"11",
         "TS19":"11.5",
         "TS20":"12",
         "TS21":"13",
         "TS22":"14",
         "TS23":"15",
         "TS24":"16",
         "TS25":"17",
         "TS26":"18"
      };

      EMAGE_ENTRY_URL = "http://www.emouseatlas.org/emagewebapp/pages/emage_entry_page.jsf?id=EMAGE:";

      emage_eurexpress_url = "http://drumguish.hgu.mrc.ac.uk/eAtlasViewer/php/eurexpress.php?assay=";
      emage_iip_sub_url = "http://drumguish.hgu.mrc.ac.uk/emage_iipviewer/application/emageSub/php/submission.php?greyImg=";
      emage_iip_exp_url = "http://drumguish.hgu.mrc.ac.uk/emage_iipviewer/application/emageExpression/php/gene.php?greyImg=";
      emage_iip_opt_url = "http://drumguish.hgu.mrc.ac.uk/emage_iipviewer/application/emageOpt/php/opt.php?greyImg=";

      DISPLAY = params.display;
      STAGE = params.stage;
      GENE = params.gene;
      ID = params.id;
      ASSAY = params.assay;
      EXPRESSION = params.expression;
      LABEL = params.label;

      PARENT = window.frames["emageExpressionIframe"].parent;

      TITLE = GENE + " " + LABEL + ", " + STAGE;

      initRadioButtons();

      showFrame(undefined);

   };
   
   //---------------------------------------------------------
   var getName = function () {
      return "emageExpression";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise
      getName: getName,
   };

}(); // end of module emouseatlas.emap.emageExpression
