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
//   tiledImageFixedPointTool.js
//   Tool to manipulate FixedPoint in a High resolution tiled image from an iip server
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
// fixedPoint
//---------------------------------------------------------
emouseatlas.emap.fixedPoint = function() {

   var model;
   var view;
   var util;
   var trgt;
   var project;
   var xNumber;
   var yNumber;
   var zNumber;
   var okButton;
   var cancelButton;
   var isVisible;
   var fixedPointDragContainerId;
   var currentFxPt;
   var newFxPt;
   var cancelFxPt;
   var tmpFxPt;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var targetId;
      var target;
      var fixedPointToolContainer;
      var fixedPointTitleTextContainer;
      var fixedPointTitleTextDiv;
      var fs1;
      var fs2;
      var fs3;
      var fs4;
      var legend1;
      var legend2;
      var legend3;
      var legend4;
      var fixedPointDragContainer;
      var fixedPointMarkerContainer;
      var imgPath;
      var closeImg1;
      var closeImg2;

      //------------------------

      targetId = model.getProjectDivId();
      target = $(targetId);

      fixedPointDragContainer = $(fixedPointDragContainerId);

      if(fixedPointDragContainer) {
         fixedPointDragContainer.parentNode.removeChild(fixedPointDragContainer);
      }
      if(fixedPointMarkerContainer) {
         fixedPointMarkerContainer.parentNode.removeChild(fixedPointMarkerContainer);
      }
      
      //----------------------------------------
      // the drag container
      //----------------------------------------
      fixedPointDragContainer = new Element('div', {
         'id': fixedPointDragContainerId
      });

      //----------------------------------------
      // the tool container
      //----------------------------------------
      fixedPointToolContainer = new Element('div', {
         'id': 'fixedPointToolContainer',
         'class': 'fixedPointToolContainer'
      });

      fixedPointTitleTextContainer = new Element('div', {
         'class': 'fixedPointTitleTextContainer'
      });

      fixedPointTitleTextDiv = new Element('div', {
         'class': 'fixedPointTitleTextDiv'
      });
      fixedPointTitleTextDiv.set('text', 'fixed point');

      //----------------------------------------
      // the x number
      //----------------------------------------
      fs1 = new Element('fieldset', {
	 'id': 'xFieldset',
	 'name': 'xFieldset',
	 'class': 'xyz'
      });

      legend1 = new Element('legend', {
	 'id': 'xFieldsetLegend',
	 'class': 'xyz',
	 'name': 'xFieldsetLegend'
      });
      legend1.set('text', 'x');

      xNumber = new Element('input', {
	 'id': 'xNumber',
	 'class': 'xyz',
	 'type': 'number',
	 'readonly': 'readonly'
      });

      //----------------------------------------
      // the y number
      //----------------------------------------
      fs2 = new Element('fieldset', {
	 'id': 'yFieldset',
	 'name': 'yFieldset',
	 'class': 'xyz'
      });

      legend2 = new Element('legend', {
	 'id': 'yFieldsetLegend',
	 'class': 'xyz',
	 'name': 'yFieldsetLegend'
      });
      legend2.set('text', 'y');

      yNumber = new Element('input', {
	 'id': 'yNumber',
	 'class': 'xyz',
	 'type': 'number',
	 'readonly': 'readonly'
      });

      //----------------------------------------
      // the z number
      //----------------------------------------
      fs3 = new Element('fieldset', {
	 'id': 'zFieldset',
	 'name': 'zFieldset',
	 'class': 'xyz'
      });

      legend3 = new Element('legend', {
	 'id': 'zFieldsetLegend',
	 'class': 'xyz',
	 'name': 'zFieldsetLegend'
      });
      legend3.set('text', 'z');

      zNumber = new Element('input', {
	 'id': 'zNumber',
	 'class': 'xyz',
	 'type': 'number',
	 'readonly': 'readonly'
      });

      //-----------------------------------------------------------------------
      // the buttons
      //----------------------------------------
      fs4 = new Element('fieldset', {
         'id': 'buttonFieldset',
         'name': 'buttonFieldset',
         'class': 'fpfs'
      });
      
      okButton = new Element( 'div', {
	 'id': 'okButton',
	 'class': 'fpButton ok'
      });
      okButtonTxt = new Element( 'div', {
	 'id': 'okButtonTxt',
	 'class': 'fpButtonTxt ok'
      });
      okButtonTxt.set('text', 'ok');
      
      cancelButton = new Element( 'div', {
	 'id': 'cancelButton',
	 'class': 'fpButton cancel'
      });
      cancelButtonTxt = new Element( 'div', {
	 'id': 'cancelButtonTxt',
	 'class': 'fpButtonTxt cancel'
      });
      cancelButtonTxt.set('text', 'cancel');
      
      defaultButton = new Element( 'div', {
	 'id': 'defaultButton',
	 'class': 'fpButton default'
      });
      defaultButtonTxt = new Element( 'div', {
	 'id': 'defaultButtonTxt',
	 'class': 'fpButtonTxt default'
      });
      defaultButtonTxt.set('text', 'reset to default');

      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      imgPath = model.getInterfaceImageDir();
      closeImg1 = imgPath + "close_10x8.png";
      closeImg2 = imgPath + "close2_10x8.png";

      closeButton = new Element('div', {
	 'id': 'fixedPointCloseButton',
	 'class': 'closeButton fixedPoint'
      });

      closeImg = new Element( 'img', {
	 'id': 'closeImg',
	 'class': 'closeButtonImg',
	 'src': closeImg1
      });

      //---------------------------------------------------------

      //----------------------------------------
      // add the elements
      //----------------------------------------
      fixedPointDragContainer.inject(target, 'inside');
      fixedPointToolContainer.inject(fixedPointDragContainer, 'inside');

      closeImg.inject(closeButton, 'inside');
      closeButton.inject(fixedPointToolContainer, 'inside');

      fixedPointTitleTextDiv.inject(fixedPointTitleTextContainer, 'inside');
      fixedPointTitleTextContainer.inject(fixedPointToolContainer, 'inside');

      fs1.inject(fixedPointToolContainer, 'inside');
      fs2.inject(fixedPointToolContainer, 'inside');
      fs3.inject(fixedPointToolContainer, 'inside');
      fs4.inject(fixedPointToolContainer, 'inside');

      legend1.inject(fs1, 'inside');
      legend2.inject(fs2, 'inside');
      legend3.inject(fs3, 'inside');

      xNumber.inject(fs1, 'inside');
      yNumber.inject(fs2, 'inside');
      zNumber.inject(fs3, 'inside');

      okButton.inject(fs4, 'inside');
      cancelButton.inject(fs4, 'inside');
      defaultButton.inject(fs4, 'inside');

      okButtonTxt.inject(okButton, 'inside');
      cancelButtonTxt.inject(cancelButton, 'inside');
      defaultButtonTxt.inject(defaultButton, 'inside');

      //----------------------------------------
      // add button style
      //----------------------------------------
      emouseatlas.emap.utilities.addButtonStyle('okButton');
      emouseatlas.emap.utilities.addButtonStyle('cancelButton');
      emouseatlas.emap.utilities.addButtonStyle('defaultButton');
      emouseatlas.emap.utilities.addButtonStyle('fixedPointCloseButton');

      //----------------------------------------
      // the fixedPoint marker
      //----------------------------------------
      markerContainer = new Element('div', {
	 'id': 'fixedPointMarkerContainer',
	 'class': 'markerContainer'
      });

      markerArm0 = new Element('div', {
	 'id': 'fixedPointMarkerArm0',
	 'class': 'markerArm zero'
      });
      markerArm90 = new Element('div', {
	 'id': 'fixedPointMarkerArm90',
	 'class': 'markerArm ninety'
      });
      markerArm180 = new Element('div', {
	 'id': 'fixedPointMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      markerArm270 = new Element('div', {
	 'id': 'fixedPointMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      markerContainer.inject($('emapIIPViewerDiv'), 'inside');
      markerArm0.inject(markerContainer, 'inside');
      markerArm90.inject(markerContainer, 'inside');
      markerArm180.inject(markerContainer, 'inside');
      markerArm270.inject(markerContainer, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------

      okButton.addEvent('mouseup',function(e) {
         doFPButtonPressed(e);
      });

      cancelButton.addEvent('mouseup',function(e) {
         doFPButtonPressed(e);
      });

      defaultButton.addEvent('mouseup',function(e) {
         doFPButtonPressed(e);
      });

      closeButton.addEvent('click', function(event){
	 doClosed();
      }); 

      closeImg.addEvent('mouseover', function(){
	 closeImg.set('src', closeImg2);
      }); 
      
      closeImg.addEvent('mouseout', function(){
	 closeImg.set('src', closeImg1);
      }); 

   }; // createElements

   //---------------------------------------------------------------
   var setInitialFixedPoint = function() {

      var fp;

      fp = model.getThreeDInfo().defaultFxp;
      currentFxPt = fp;
      setFixedPointNumbers(fp);
   };

   //---------------------------------------------------------------
   var setFixedPointNumbers = function(fp) {

      //console.log("setFixedPointNumbers ",fp);
      xNumber.set('value', fp.x);
      yNumber.set('value', fp.y);
      zNumber.set('value', fp.z);

   };

   //---------------------------------------------------------------
   var doClosed = function() {

      var modes;
      //console.log("%s doClosed:",this.name);
      setMarkerVisible(false);
      setFixedPointToolVisible(false);
      modes = view.getModes();
      view.setMode(modes.move.name);
   };

   //---------------------------------------------------------------
   var setFixedPointToolVisible = function(visible) {

      //console.log("setFixedPointToolVisible %s",visible);
      var viz;

      viz = (visible) ? 'visible' : 'hidden';

      if(visible) {
	 cancelFxPt = model.getThreeDInfo().fxp;
      }
      fixedPointDragContainer.setStyle('visibility', viz);
   };

   //--------------------------------------------------------------
   var setMarkerVisible = function (yes) {

      var viz;

      viz = yes ? "visible" : "hidden";

      if(markerContainer) {
         markerArm0.setStyle('visibility', viz);
         markerArm90.setStyle('visibility', viz);
         markerArm180.setStyle('visibility', viz);
         markerArm270.setStyle('visibility', viz);
      }
   };

   //---------------------------------------------------------------
   var isSamePoint = function(point1, point2) {
      if(point1.x === point2.x && point1.y === point2.y && point1.z === point2.z) {
         return true;
      } else {
         return false;
      }
   };

   //---------------------------------------------------------------
   var doFPButtonPressed = function(e) {

      var target;
      var id;
      var indx;
      var prefix;
      var fp;

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 //console.log("doLayerPropsSliderChanged no target.id");
	 return;
      }

      indx = id.indexOf("Button");
      prefix = id.substring(0,indx);

      switch(prefix) {
         case "ok":
            doClosed();
	    break;
         case "cancel":
            fp = cancelFxPt;
            setFixedPointNumbers(fp);
            model.setFixedPoint(fp, "fixedPoint.doFPButtonPressed");
	    currentFxPt = {x:cancelFxPt.x, y:cancelFxPt.y, z:cancelFxPt.z};
	    break;
         case "default":
            fp = model.getThreeDInfo().defaultFxp;
	    cancelFxPt = {x:currentFxPt.x, y:currentFxPt.y, z:currentFxPt.z};
	    currentFxPt = fp;
            setFixedPointNumbers(fp);
            model.setFixedPoint(fp, "fixedPoint.doFPButtonPressed");
	    break;
      }
      setMarkerVisible(false);
   };

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      //console.log("enter tiledImageOpacityTool modelUpdate:",modelChanges);
      if(modelChanges.initial === true) {
      }
      //console.log("exit tiledImageOpacityTool modelUpdate:");
   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      var mode;
      var modes;
      var clickPos;
      var viewerPos;
      var l;
      var t;

      //console.log("enter tiledImageFixedPointTool viewUpdate:",viewChanges);
      if(viewChanges.initial === true) {
	 setFixedPointToolVisible(false);
         setInitialFixedPoint();
      }

      //...................................
      if(viewChanges.mode) {
         mode = view.getMode();
	 //console.log("viewChanges.mode %s",mode);
         modes = view.getModes();
         if(mode === modes['fixedPoint']) {
	    setFixedPointToolVisible(true);
	    currentFxPt = model.getThreeDInfo().fxp;
            setFixedPointNumbers(currentFxPt);
	    cancelFxPt = {x:currentFxPt.x, y:currentFxPt.y, z:currentFxPt.z};
         } else {
            setMarkerVisible(false);
            setFixedPointToolVisible(false);
         }
      }

      //...................................
      if(viewChanges.selectFixedPoint === true) {
	 //console.log("viewChanges.selectFixedPoint %s",viewChanges.selectFixedPoint);
	 newFxPt = view.getPossibleFixedPoint();
	 //console.log("newFxPt ",newFxPt);
         setFixedPointNumbers(newFxPt);
         clickPos = view.getMouseClickPosition();
         viewerPos = view.getViewerContainerPos();
	 l = clickPos.x - viewerPos.x -12;
	 t = clickPos.y - viewerPos.y -12;
	 //console.log("clickPos.x %d, clickPos.y %d, viewerPos.x %d, viewerPos.y %d",clickPos.x,clickPos.y,viewerPos.x,viewerPos.y);
	 setMarkerVisible(true);
	 markerContainer.setStyles({'left': l + 'px', 'top': t + 'px'});
         if(!isSamePoint(currentFxPt, newFxPt)) {
            model.setFixedPoint(newFxPt, "fixedPoint.viewUpdate selectFixedPoint");
	    currentFxPt = {x:newFxPt.x, y:newFxPt.y, z:newFxPt.z};
         }
      }

      //console.log("exit tiledImageFixedPointTool viewUpdate:");
   }; // viewUpdate

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      util = emouseatlas.emap.utilities;

      model.register(this);
      view.register(this);

      _debug = false;

      project = (params.project === undefined) ? "emap" : params.project;

      dropTargetId = model.getProjectDivId();

      fixedPointDragContainerId = "fixedPointDragContainer";

      createElements();

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;

      emouseatlas.emap.drag.register({drag:fixedPointDragContainerId, drop:dropTargetId});

      prevLayer = undefined;
      isVisible = false;

   }; // initialise

   //---------------------------------------------------------------
   var getName = function() {
      return "layerProperties";
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
