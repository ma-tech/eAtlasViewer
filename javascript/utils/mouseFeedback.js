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
//   mouseFeedback.js
//   Multi line label (like a tool-tip)
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
// module for mouseFeedback
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.mouseFeedback = function() {

   //---------------------------------------------------------
   //   private members
   //---------------------------------------------------------
   var mouseFeedbackDiv;
   var mouseFeedbackTargetId;
   var dropTargetId;

   //---------------------------------------------------------
   var initialise = function () {
      //console.log("initialise emouseatlas.emap.mouseFeedback");

      mouseFeedbackTargetId = emouseatlas.emap.tiledImageModel.getProjectDivId();
      dropTargetId = mouseFeedbackTargetId;

      createElements();
      emouseatlas.emap.drag.register({drag:"mouseFeedbackDiv", drop:dropTargetId}, "mouseFeedback");
   };

   //---------------------------------------------------------
   var createElements = function () {

      //console.log("createElements");
      //---------------------------------------------------------
      // the Container
      //---------------------------------------------------------
      var mouseFeedbackTarget;

      mouseFeedbackTarget = $(mouseFeedbackTargetId);
      mouseFeedbackDiv = new Element('div', {
            'id': 'mouseFeedbackDiv',
            'class': 'mouseFeedbackDiv'
      });

      mouseFeedbackDiv.inject(mouseFeedbackTarget, 'inside');
   };

   //---------------------------------------------------------------
   var setTxt = function (txt) {

      mouseFeedbackDiv.set("text", txt);

   }; // setTxt

   //---------------------------------------------------------
   var setVisible = function (viz) {
      //console.log("set viz");
      /*
      var div;
      div = $('mouseFeedbackDiv');

      if(viz === true) {
	 if(div) {
            div.setStyle('visibility', 'visible');
	 }
      } else {
	 if(div) {
            div.setStyle('visibility', 'hidden');
	 }
      }
      */
   };

   //---------------------------------------------------------
   var getName = function () {
      //console.log(observer);
      return 'mouseFeedback';
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      getName: getName,
      setTxt: setTxt,
      setVisible: setVisible
   };

}(); // end of module emouseatlas.emap.mouseFeedback
