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
//   measuringTool.js
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
// measuringTool
//---------------------------------------------------------
emouseatlas.emap.measuringTool = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   // private members
   var model;
   var view;
   var imagePath;

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

      model = params.model;
      view = params.view;

      model.register(this, "measuringTool");
      view.register(this, "measuringTool");

      /*
      imagePath = params.imagePath;

      isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      // we are reading in the params from a json file so they will be strings.
      width = parseInt(params.params.width);
      height = parseInt(params.params.height);

      sliderLength = width - 25;

      imagePath = model.getInterfaceImageDir();
      //console.log(imagePath);

      targetId = params.params.targetId;

      drag = params.params.drag;
      borders = params.params.borders;
      transparent = params.params.transparent;

      bgc = (params.params.bgc === undefined) ? "#fff" : params.params.bgc;

      visible = true;

      x = parseInt(params.params.x);
      y = parseInt(params.params.y);
      //console.log("layerTool: x ",x,", ",y);

      window.setPosition(x, y);

      layerNames = [];

      pixres = model.getPixelResolution();
      mu = pixres.units;
      createElements();

      setDimensions(width, height);
      */

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(modelChanges) {

      var win = $(shortName + '-win');

      titleTextContainer = new Element('div', {
         'class': 'measuringTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'measuringTitleTextDiv'
      });
      titleTextDiv.set('text', 'distance');

      var topEdge = $(shortName + '-topedge');

      titleTextDiv.inject(titleTextContainer, 'inside');
      titleTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the container for distance
      //----------------------------------------
      distContainer = new Element('div', {
	 'id':'measuringToolDistCoordDiv',
	 'class':'measuringToolCoordDiv'
      });

      distValueContainer = new Element('div', {
	 'id':'measuringToolValueContainerDiv',
	 'class':'measuringToolCoordDiv'
      });

      distValueText = new Element('div', {
	 'class':'measuringToolValueText'
      });
      distValueText.appendText('0 ' + mu[0]);

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      distValueText.inject(distValueContainer, 'inside');
      distValueContainer.inject(distContainer, 'inside');
      distContainer.inject(win, 'inside');

      //----------------------------------------
      // the measurement origin marker
      //----------------------------------------
      originMarkerContainer = new Element('div', {
	 'id': 'measurementOriginMarkerContainer',
	 'class': 'markerContainer'
      });
      originMarkerContainer.inject($('emapIIPViewerDiv'), 'inside');

      originMarkerArm0 = new Element('div', {
	 'id': 'measurementOriginMarkerArm0',
	 'class': 'markerArm zero'
      });
      originMarkerArm90 = new Element('div', {
	 'id': 'measurementOriginMarkerArm90',
	 'class': 'markerArm ninety'
      });
      originMarkerArm180 = new Element('div', {
	 'id': 'measurementOriginMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      originMarkerArm270 = new Element('div', {
	 'id': 'measurementOriginMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      originMarkerArm0.inject(originMarkerContainer, 'inside');
      originMarkerArm90.inject(originMarkerContainer, 'inside');
      originMarkerArm180.inject(originMarkerContainer, 'inside');
      originMarkerArm270.inject(originMarkerContainer, 'inside');

      //----------------------------------------
      // the measurement target marker
      //----------------------------------------
      targetMarkerContainer = new Element('div', {
	 'id': 'measurementTargetMarkerContainer',
	 'class': 'markerContainer'
      });
      targetMarkerContainer.inject($('emapIIPViewerDiv'), 'inside');

      targetMarkerArm0 = new Element('div', {
	 'id': 'measurementTargetMarkerArm0',
	 'class': 'markerArm zero'
      });
      targetMarkerArm90 = new Element('div', {
	 'id': 'measurementTargetMarkerArm90',
	 'class': 'markerArm ninety'
      });
      targetMarkerArm180 = new Element('div', {
	 'id': 'measurementTargetMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      targetMarkerArm270 = new Element('div', {
	 'id': 'measurementTargetMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      targetMarkerArm0.inject(targetMarkerContainer, 'inside');
      targetMarkerArm90.inject(targetMarkerContainer, 'inside');
      targetMarkerArm180.inject(targetMarkerContainer, 'inside');
      targetMarkerArm270.inject(targetMarkerContainer, 'inside');

   }; // createElements

   //---------------------------------------------------------------
   var doClosed = function() {
      //console.log("%s doClosed:",name);
      setOriginMarkerVisible(false);
      setTargetMarkerVisible(false);
      setMeasuringToolVisible(false);
      var modes = view.getModes();
      view.setMode(modes.move.name);
   };

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      //console.log("enter tiledImageOpacityTool modelUpdate:",modelChanges);

      if(modelChanges.initial === true) {
      }

      //console.log("exit tiledImageOpacityTool modelUpdate:");
   }; // modelUpdate

   //---------------------------------------------------------------
   // if the opacity has been changed, update the slider text
   var viewUpdate = function(viewChanges, from) {

      //console.log("enter tiledImageMeasuringTool viewUpdate:",viewChanges);

      var dx;
      var dy;
      var dz;
      var dist;
      var origin;
      var point;
      var scale;
      var unit;

      if(viewChanges.initial) {
	 setMeasuringToolVisible(false);
         setOriginMarkerVisible(false);
         setTargetMarkerVisible(false);
      }

      //...................................
      if(viewChanges.mode) {
	 var mode = view.getMode();
	 //console.log("mode ",mode);
	 if(mode.name === 'measuring') {
	    setMeasuringToolVisible(true);
            setOriginMarkerVisible(false);
            setTargetMarkerVisible(false);
	 } else {
	    setMeasuringToolVisible(false);
            setOriginMarkerVisible(false);
            setTargetMarkerVisible(false);
	 }
      }

      if(viewChanges.measuringOrigin) {
	 var pixres = model.getPixelResolution();
         setOriginMarkerVisible(false);
         setTargetMarkerVisible(false);
         var clickPos = view.getMouseClickPosition();
         var viewerPos = view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x -12;
	 var top = clickPos.y - viewerPos.y -12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 originMarkerContainer.setStyles({'left': left, 'top': top});
         setOriginMarkerVisible(true);
         distValueText.set('text', '0 ' + mu[0]);
      }

      if(viewChanges.measuringTarget) {
	 var isWlz = model.isWlzData();
	 var pixres = model.getPixelResolution();
         var clickPos = view.getMouseClickPosition();
         var viewerPos = view.getViewerContainerPos();
	 var left = clickPos.x - viewerPos.x - 12;
	 var top = clickPos.y - viewerPos.y - 12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 targetMarkerContainer.setStyles({'left': left, 'top': top});
         setTargetMarkerVisible(true);
	 origin = view.getMeasurementOrigin();
	 point = view.getMeasurementTarget();
	 if(isWlz) {
	    dx = (point.x - origin.x) * pixres.x;
	    dx = (Math.round(dx * 100))/100;
	    dy = (point.y - origin.y) * pixres.y;
	    dy = (Math.round(dy * 100))/100;
	    dz = (point.z - origin.z) * pixres.z;
	    dz = (Math.round(dz * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
	    dist = (Math.round(dist * 100))/100;
	    //console.log("distb targ %d",dist);
	 } else {
	    scale = view.getScale();
	    dx = point.x - origin.x;
	    dx = dx * pixres.x / scale.cur;
	    dx = (Math.round(dx * 100))/100;
	    dy = point.y - origin.y;
	    dy = dy * pixres.y / scale.cur;
	    dy = (Math.round(dy * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy);
	    //dist = (Math.round(dist * 100))/100;
	    dist = Math.round(dist);
	 }
	 if(dist < 1000) {
	    unit = mu[0];
	 } else {
	    unit = mu[1];
	    dist = (Math.round(dist / 10))/100;
	 }
         distValueText.set('text', dist + ' ' + unit);
      }

      if(viewChanges.measuring) {
	 var isWlz = model.isWlzData();
	 var pixres = model.getPixelResolution();
	 origin = view.getMeasurementOrigin();
	 point = view.getMeasurementPoint();
	 if(isWlz) {
	    dx = (point.x - origin.x) * pixres.x;
	    dx = (Math.round(dx * 100))/100;
	    dy = (point.y - origin.y) * pixres.y;
	    dy = (Math.round(dy * 100))/100;
	    dz = point.z - origin.z;
	    dz = (point.z - origin.z) * pixres.z;
	    dz = (Math.round(dz * 100))/100;
	    //console.log("dx %d, dy %d, dz %d",dx,dy,dz);
	    dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
	    dist = (Math.round(dist * 100))/100;
	 } else {
	    scale = view.getScale();
	    dx = point.x - origin.x;
	    dx = dx * pixres.x / scale.cur;
	    dx = (Math.round(dx * 100))/100;
	    dy = point.y - origin.y;
	    dy = dy * pixres.y / scale.cur;
	    dy = (Math.round(dy * 100))/100;
	    dist = Math.sqrt(dx*dx + dy*dy);
	    //dist = (Math.round(dist * 100))/100;
	    dist = Math.round(dist);
	 }
	 if(dist < 1000) {
	    unit = mu[0];
	 } else {
	    unit = mu[1];
	    dist = (Math.round(dist / 10))/100;
	 }
         distValueText.set('text', dist + ' ' + unit);
      }

      if(viewChanges.scale) {
         setOriginMarkerVisible(false);
         setTargetMarkerVisible(false);
      }

      //console.log("exit tiledImageMeasuringTool viewUpdate:");
   }; // viewUpdate

   //---------------------------------------------------------------
   var setMeasuringToolVisible = function(visible) {
      window.setVisible(visible);
   };

   //--------------------------------------------------------------
   var setOriginMarkerVisible = function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(originMarkerContainer) {
         originMarkerArm0.setStyle('visibility', viz);
         originMarkerArm90.setStyle('visibility', viz);
         originMarkerArm180.setStyle('visibility', viz);
         originMarkerArm270.setStyle('visibility', viz);
      }
   };

   //--------------------------------------------------------------
   var setTargetMarkerVisible = function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(targetMarkerContainer) {
         targetMarkerArm0.setStyle('visibility', viz);
         targetMarkerArm90.setStyle('visibility', viz);
         targetMarkerArm180.setStyle('visibility', viz);
         targetMarkerArm270.setStyle('visibility', viz);
      }
   };

   //---------------------------------------------------------
   var getName = function () {
      //console.log(observer);
      return 'measuringTool';
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      getName: getName,
   };

}; // end of function measuringTool
