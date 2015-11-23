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
//   refreshTool.js
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
// module for refreshTool
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.refreshTool = function () {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var _debug;
   var model;
   var view;
   var utils;
   var title;
   var targetId;
   var klass;
   var dragContainerId;
   var dropTargetId;

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      _debug = false;

      //console.log("enter refreshTool.initialize: ",params);
      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;

      model.register(this, "refreshTool");
      view.register(this, "refreshTool");

      utils = emouseatlas.emap.utilities;

      dragContainerId = "refreshDragContainer";
      dropTargetId = model.getProjectDivId();
      //console.log("refreshTool dropTargetId: ",dropTargetId);

      targetId = params.targetId;

      klass = (params.klass === undefined) ? "" : params.klass; 
      //console.log("refreshTool klass: ",klass);

      createElements();
      showRefresh(true);
      emouseatlas.emap.drag.register({drag:dragContainerId, drop:dropTargetId}, "refreshTool");

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function () {

      var target;
      var dragContainer;
      var refreshButton;
      var refreshTextContainer;
      var refreshTextDiv;

      target = document.getElementById(targetId);
      
      if(!target) {
         console.log("no target for 'refreshTool'");
         return false;
      }

      dragContainer = $(dragContainerId);

      if(dragContainer) {
         dragContainer.parentNode.removeChild(dragContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      dragContainer = new Element('div', {
         'id': dragContainerId,
	 'class': klass
      });
      dragContainer.setAttribute("draggable", true);

      //----------------------------------------
      // add the element
      //----------------------------------------
      dragContainer.inject(target, 'inside');

      //----------------------------------------
      // the refreshTool div
      //----------------------------------------
      refreshButton = new Element('div', {
         'id': 'refreshButton'
      });

      refreshButton.inject(dragContainer, 'inside');

      //----------------------------------------
      // the text button
      //----------------------------------------
      refreshTextContainer = new Element('div', {
         'id': 'refreshTextContainer'
      });

      refreshTextDiv = new Element('div', {
         'id': 'refreshTextDiv'
      });

      refreshTextDiv.appendText('reload image');

      refreshTextDiv.inject(refreshTextContainer, 'inside');
      refreshTextContainer.inject(refreshButton, 'inside');

      emouseatlas.emap.utilities.addButtonStyle("refreshButton");

      //----------------------------------------
      // add the events
      //----------------------------------------
      refreshButton.addEvent('click',function() {
         view.refreshImage();
      });

      return false;
   };

   //---------------------------------------------------------------
   var showRefresh = function(show, from) {
      //console.log("showRefresh: %s, from %s",show, from);

      var viz;
      var dragCon;

      viz = show ? "visible" : "hidden";

      dragCon = $(dragContainerId);
      dragCon.setStyle("visibility", viz);

   };

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges, from) {
      return false;
   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges) {

      var viz;

      if(viewChanges.initial === true) {
      }

      if(viewChanges.toolbox === true) {
	viz = view.toolboxVisible();
	showRefresh(viz, "viewUpdate");
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var getName = function() {
      return "refreshTool";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      getName: getName
   };

}(); // end of module refreshTool
//----------------------------------------------------------------------------
