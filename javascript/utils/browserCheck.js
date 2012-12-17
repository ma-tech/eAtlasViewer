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
//   bc.js
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
emouseatlas.emap.BrowserCheck = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   // private members
   var isReady = false;
   var bcContainer;
   var bcImageDiv;
   var bcImage;
   var bcMessageDiv;
   var bcMessage;
   var targetId;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   var buildBrowserCheck  = function () {

      var targetContainer;

      if(document.getElementById("bcContainer")) {
	  bcContainer = document.getElementById("bcContainer");
      } else {
	 bcContainer = document.createElement("div");
	 bcContainer.id = "bcContainer";

         if(document.getElementById(targetId)) {
            targetContainer = document.getElementById(targetId);
            console.log("targetContainer ",targetContainer);
            targetContainer.appendChild(bcContainer);
            console.log("buildBrowserCheck");
         } else {
            console.log(" couldn't find element with name %s ",targetContainer);
         }
      }

      /*
      console.log("bcContainer ",bcContainer);

      bcImageDiv = document.createElement("div");
      bcImageDiv.id = "bcImageDiv";

      bcImage = document.createElement("img");
      bcImage.id = "bcImage";

      bcMessageDiv = document.createElement("div");
      bcMessageDiv.id = "bcMessageDiv";

      bcMessage = document.createTextNode("Browser Check");

      bcImageDiv.appendChild(bcImage);

      bcMessageDiv.appendChild(bcMessage);

      bcContainer.appendChild(bcImageDiv);
      bcContainer.appendChild(bcMessageDiv);
      */

      // set up the event handlers

   }; // buildBrowserCheck

   //---------------------------------------------------------
   var checkForIE = function () {
      //console.log(navigator);
      return navigator.appName;
   };

   //---------------------------------------------------------
   var checkForChromeFrame = function () {

      var ret;
      var ua = navigator.userAgent;
      var tokens = [];

      if(ua.toLowerCase().indexOf('chromeframe') < 0) {
         ret = "You don't have chromeFrame installed";
      } else {
         tokens = ua.split(" ");
         //console.log(tokens);
         ret = "You have chromeFrame installed";
      }
      //console.log(navigator.userAgent);
      //return navigator.userAgent;
      return ret;
   };

   //---------------------------------------------------------
   var checkForFlash = function () {
      var playerVersion = swfobject.getFlashPlayerVersion();
      var output = "You have Flash player " + playerVersion.major + "." + playerVersion.minor + " installed";
      //console.log(output);
      return "Flash " + playerVersion.major + "." + playerVersion.minor;
   };

   //---------------------------------------------------------
   var setBusyMessage = function (txt) {
      //console.log("enter setBusyMessage");
      if(document.getElementById("bcMessageDiv")) {
	 var message = document.getElementById("bcMessageDiv");
	 message.innerHTML = txt;
      }
      //console.log("exit setBusyMessage");
   };

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (data) {
      targetId = data.targetId;
      console.log("bc target id = ",targetId);
      buildBrowserCheck();
      browserMsg = checkForIE();
      chromeFrameMsg = checkForChromeFrame();
      flashMsg = checkForFlash();
      //console.log('\nbrowser: %s \nchromeFrame: %s \nFlash: %s', browserMsg, chromeFrameMsg, flashMsg);
      alert("\nbrowser: %s \nchromeFrame: %s \nFlash: %s", browserMsg, chromeFrameMsg, flashMsg);
      isReady = true;
   };

   //---------------------------------------------------------
   var isInitialised = function () {
      return isReady;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
   };

}(); // end of module bc
//----------------------------------------------------------------------------
