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
//   scalebar.js
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
// scalebar
//---------------------------------------------------------
emouseatlas.emap.scalebar = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var model;
   var view;
   var util;
   var trgt;
   var mu;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function () {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      util = emouseatlas.emap.utilities;

      model.register(this);
      view.register(this);

      dropTargetId = model.getProjectDivId();
      //trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      mu = ' \u03BCm';
      createElements();
      emouseatlas.emap.drag.register({drag:"scalebarContainer", drop:dropTargetId});

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function() {

      var targetId = model.getProjectDivId();
      var target = $(targetId);

      //----------------------------------------
      // the overall container
      //----------------------------------------
      scalebarContainer = new Element('div', {
         'id': 'scalebarContainer'
      });

      //----------------------------------------
      // the text div
      //----------------------------------------
      scalebarTextContainer = new Element('div', {
         'id': 'scalebarTextContainer'
      });

      scalebarTextDiv = new Element('div', {
         'id': 'scalebarTextDiv'
      });

      //----------------------------------------
      // the scalebars
      //----------------------------------------
      scalebarDiv = new Element('div', {
         'id': 'scalebarDiv'
      });

      scalebarContainer.inject(target, 'inside');
      scalebarTextDiv.inject(scalebarTextContainer, 'inside');
      scalebarTextContainer.inject(scalebarContainer, 'inside');
      scalebarDiv.inject(scalebarContainer, 'inside');

      return false;
   }; // create elements

   //---------------------------------------------------------------
   var modelUpdate = function (modelChanges) {
      return false;
   };

   //---------------------------------------------------------------
   var viewUpdate = function (viewChanges) {

         var scale;
	 var scalebarLen;
	 var voxel;
	 var numpix;
	 var txt;
	 var txtWidth;
	 
      if(viewChanges.initial === true || viewChanges.scale === true) {
         scale = emouseatlas.emap.tiledImageView.getScale();
         scalebarLen = emouseatlas.emap.tiledImageModel.getScalebarLen();
         voxel = model.getVoxelSize(false);
         //console.log("voxel ",voxel);
	 numpix = scalebarLen / voxel.x;

         $("scalebarDiv").setStyle("width",numpix + "px");
	 width = numpix + 20;
	 txtWidth = window.getComputedStyle($("scalebarTextContainer"), null).getPropertyValue("width");
         $("scalebarTextContainer").setStyle("width",txtWidth);
	 txt = scalebarLen / scale.cur;
         scalebarTextDiv.set('text', txt + mu);
      }

      //.................................
      if(viewChanges.toolbox === true) {
         if(view.toolboxVisible()) {
   	 $("scalebarContainer").setStyle("visibility","visible");
         } else {
   	 $("scalebarContainer").setStyle("visibility","hidden");
         }
      }

   };

   /*
   //---------------------------------------------------------------
   var setToolTip = function (text) {

      //console.log("%s setToolTip",shortName);
      // we only want 1 toolTip
      if(typeof(toolTip === 'undefined')) {
	 toolTip = new Element('div', {
	       'id': shortName + '-toolTipContainer',
	       'class': 'toolTipContainer'
	       });
	 toolTip.inject($(targetId).parentNode, 'inside');
      }
      $(shortName + '-toolTipContainer').set('text', toolTipText);
   };

   //--------------------------------------------------------------
   var showToolTip = function (show) {

      //console.log("%s showToolTip %s: x %s, y %s",shortName,show,x,y);
      var containerPos = emouseatlas.emap.tiledImageView.getToolContainerPos();
      var left;
      var top;
      left = $(shortName + '-container').getPosition().x;
      top = $(shortName + '-container').getPosition().y;
      if(show === true) {
	 $(shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'visible'});
      } else {
	 $(shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'hidden'});
      }
   };
   */

   //---------------------------------------------------------------
   var getName = function() {
      return "scalebar";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      getName: getName
   };

}();
