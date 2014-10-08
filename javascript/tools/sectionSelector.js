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
//   sectionSelector.js
//   Tool to allow slice selection in a High resolution tiled image from an iip server
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
// sectionSelector
//---------------------------------------------------------
emouseatlas.emap.sectionSelector = function() {

   var model;
   var view;
   var util;
   var trgt;
   var selectorDragContainerId;
   var selectorImageContainer;
   var selectorImage;
   var x_left;
   var y_top;
   var maxDim;
   var dataSubType;
   var kaufman;
   var wlzToStackOffset;
   var cursorBarContainer;
   var cursorBar;
   var cursorBarWidth;
   var cursorBarContainerWidth;
   var cursorBarContainerHeight;
   var MOUSE_DOWN;
   var EXT_CHANGE;
   var NUMBER_CHANGE;
   var _debug;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------
   var createElements = function () {

      var targetId;
      var target;
      var selectorDragContainer;
      //------------------------

      targetId = model.getProjectDivId();
      target = $(targetId);

      selectorDragContainer = $(selectorDragContainerId);

      if(selectorDragContainer) {
         selectorDragContainer.parentNode.removeChild(selectorDragContainer);
      }
      
      //----------------------------------------
      // the sectionSelector drag container
      //----------------------------------------
      selectorDragContainer = new Element('div', {
         'id': selectorDragContainerId
      });

      selectorDragContainer.setStyles({
         "top": y_top + "px",
         "left": x_left + "px"
      });

      //----------------------------------------
      // the image container
      //----------------------------------------
      selectorImageContainer = new Element('div', {
         'id': 'selectorImageContainer',
         'class': 'selectorImageContainer'
      });

      selectorDragContainer.inject(target, 'inside');
      selectorImageContainer.inject(selectorDragContainer, 'inside');

      //-------------------------------------------------------------------------------
      selectorImage = new Element('img', {
         'class': 'selectorImage'
      });
      selectorImage.inject(selectorImageContainer , 'inside');

      cursorBarContainer = new Element( 'div', {
	 id: 'selectorCursorBarContainer',
         'class': 'selectorCursorBarContainer'
      });
      cursorBarContainer.inject( selectorImageContainer , 'inside');
      // the following needs a mootools class object to pass as the bind param.
      //cursorBarContainer.makeDraggable(emouseatlas.emap.utilities.getDragOpts('selectorImageContainer', 100, this));

      //------------------------------------
      selectorImageContainer.addEvent('mousedown', function(e) {
         e.preventDefault();
      });
      //------------------------------------
      selectorImageContainer.addEvent('mouseup', function(e) {
         doMouseUp(e);
      });

      cursorBar = new Element( 'div', {
	 id: 'selectorCursorBar',
         'class': 'selectorCursorBar'
      });
      cursorBar.inject( cursorBarContainer , 'inside');

   }; // createElements

   //---------------------------------------------------------------
   var handleDrag = function(done) {
      var distance = model.getDistance();
      var fullDepth = model.getFullDepth();
      var offset = getSliceOffset();
      var newDist = offset * fullDepth - wlzToStackOffset;
      //console.log("dist.max %d, dist.min",distance.max,distance.min);
      newDist = newDist > distance.max ? distance.max : newDist;
      newDist = newDist < distance.min ? distance.min : newDist;
      //console.log("distance %f, fullDepth %d, offset %f, newDist %d",distance.cur,fullDepth,offset,newDist);
      model.modifyDistance(newDist);
   };
   
   //---------------------------------------------------------------
   var doMouseUp = function(e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("selector mouseup target.id %s",target.id);
      var klass = target.get('class');
      var pattern = /(selector-cursor|selector-image|edge)/i;
      if(klass.match(pattern) != null) {
	 //console.log("sectionSelector: %s doMouseUp",klass);
	 view.updateDst();
      } else {
	 //console.log("sectionSelector: doMouseUp on unkown target ",klass);
      }

   }; // doMouseUp

   //---------------------------------------------------------------
   var setSliceOffset = function(val) {

      //console.log("setSliceOffset: ",val);
      var zsel = model.getZSelectorInfo();

      if(model.getFullDepth() === 1) {
	 val = 0.5;
      }

      if (zsel.orientation == 'vertical') {
	 cursorBarContainer.style.left = val * (dragWidth) + leftDragOffset + 'px';
      } else if (zsel.orientation == 'horizontal') {
	 cursorBarContainer.style.top = val * (dragHeight) + topDragOffset + 'px';
      } else {
	 alert("Error: selector orientation "+zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",zsel.orientation," is invalid or undefined");
      }
   };

   //--------------------------------------------------------------
   var getSelectorName = function (zsel) {

      //console.log("enter selector.getSelectorName:");

      var layerData;
      var layerNames;
      var layer;
      var selectorName;
      var distance;
      var cur;
      var cur2;
      var cur3;
      var num;
      var entry;
      var min;
      var max;
      var i;

      layerData = model.getLayerData();
      layerNames = model.getLayerNames();
      layer = layerData[layerNames[0]];  // in future we should be able to select which layer provides the selector Image

      if(kaufman) {
         num = zsel.imgRange.length;
         //console.log("getting selector name for kaufman with %d ranges",num);
         if(num > 1) {
            distance = model.getDistance();
            cur = distance.cur;
            cur2 = (model.isArrayStartsFrom0()) ? cur : cur - 1;
            cur3 = cur2 + wlzToStackOffset;
            //console.log("d %d, imgRange ",cur3,zsel.imgRange);
	    for(i=0; i<num; i++) {
	       entry = zsel.imgRange[i];
	       if(cur3 >= entry.min && cur3 <= entry.max) {
	          //console.log("using %s",entry.name);
		  selectorName = entry.name;
		  break;
	       }
	    }
         } else {
            selectorName = layer.selectorName;
         }
      } else {
         selectorName = layer.selectorName;
      }

      return selectorName;
   };

   //--------------------------------------------------------------
   var getSelectorSrc = function (zsel) {

      //console.log("enter selector.getSelectorSrc:");

      var selectorSrc;
      var quality;
      var server;
      var layerData;
      var layerNames;
      var layer;
      var dataPath;
      var selectorName;

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (model.isEurexpressData()) {
         selectorSrc = zsel.fullname;
      } else {
       ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 quality = model.getImgQuality();
	 server = model.getIIPServer();
	 layerData = model.getLayerData();
	 layerNames = model.getLayerNames();
	 layer = layerData[layerNames[0]];  // in future we should be able to select which layer provides the selector Image
	 dataPath =  layer.imageDir;

	 selectorName = getSelectorName(zsel);

	 selectorSrc = server + '?fif=' + dataPath + selectorName
	    + '&wid='
	    + zsel.width
	    + '&qlt='
	    + quality.cur
	    + '&cvt=jpeg';
      }

      //console.log("exit selector.getSelectorSrc:",selectorSrc);
      return selectorSrc;

   }; // getSelectorSrc

   //--------------------------------------------------------------
   var setSelectorImage = function () {

      //console.log("enter selector.setSelectorImage");
      var zsel = model.getZSelectorInfo();
      //console.log("zsel ",zsel);

      selectorImage.style.width = zsel.width + 'px';
      selectorImage.style.height = zsel.height + 'px';
      selectorImageContainer.style.width = zsel.width + 'px';
      selectorImageContainer.style.height = zsel.height + 'px';

      //selectorImageContainer.style.left = '2px';
      //selectorImageContainer.style.top = '2px';

      selectorImage.src = getSelectorSrc(zsel);

      //console.log("exit selector.setSelectorImage");
   }; // setSelectorImage

   //--------------------------------------------------------------
   var fitSelectorImage = function(zsel, dcur) {

      var scaleFactor;
      var tl;
      var br;
      var cur2;
      var cur3;
      var sliceOffset;
      var fullDepth;
      var totHeight;
      //var feedbackWidth;
      //var feedbackHeight;
      var imageContainerLeftOffset;
      var imageOffset;

      // make sure the zsel image fits the max dimension specified
      scaleFactor = (zsel.width > zsel.height) ? maxDim / zsel.width : maxDim / zsel.height;
      if (scaleFactor > 1) {
	 scaleFactor = 1; 
      }

      scaledSelectorWidth = (scaleFactor * zsel.width);
      scaledSelectorHeight = (scaleFactor * zsel.height);
      //console.log("scaleFactor %f, scaledSelectorWidth %f, scaledSelectorHeight %f",scaleFactor,scaledSelectorWidth,scaledSelectorHeight);

      // if the selector image has borders we must allow for them
      tl = 0;
      br = 0;
      if (zsel.border_tl !== undefined) {
	 tl = scaleFactor * zsel.border_tl;
      }
      if (zsel.border_br !== undefined) {
	 br = scaleFactor * zsel.border_br;
      }

      // the actual usable image dimensions (not including borders).
      dragWidth = scaledSelectorWidth - (tl + br);
      dragHeight = scaledSelectorHeight - (tl + br)
      //console.log("dragWidth %f, tl %f, br %f",dragWidth,tl,br);

      // ----maze------- Offsets of drag constraint div relative to image
      topDragOffset = 0;
      leftDragOffset = 0;

      if (zsel.orientation == 'horizontal') {
	 //   dragHeight = dragHeight - tl - br + cursorBarWidth;
	 //   topDragOffset = tl - cursorBarWidth / 2;
	 cursorBarContainerHeight = 5;
	 topDragOffset = tl - (cursorBarContainerHeight / 2);
	 cursorBarContainer.style.width = scaledSelectorWidth + 'px';
	 cursorBarContainer.style.height = cursorBarContainerHeight + 'px';
	 cursorBar.style.left = '0px';
	 cursorBar.style.top = (cursorBarContainerHeight / 2) + 'px';
	 cursorBar.style.width = scaledSelectorWidth + 'px';
	 cursorBar.style.height = cursorBarWidth + 'px';
      } else if (zsel.orientation == 'vertical') {
	 cursorBarContainerWidth = 5;
	 leftDragOffset = tl - (cursorBarContainerWidth / 2);
	 cursorBarContainer.style.width = cursorBarContainerWidth + 'px';
	 cursorBarContainer.style.height = scaledSelectorHeight + 'px';
	 cursorBar.style.left = (cursorBarContainerWidth / 2) + 'px';
	 cursorBar.style.top = '0px';
	 cursorBar.style.width = cursorBarWidth + 'px';
	 cursorBar.style.height = scaledSelectorHeight + 'px';
      }
      //console.log("leftDragOffset %f",leftDragOffset);

      selectorImageContainer.style.width = scaledSelectorWidth + 'px';
      selectorImageContainer.style.height = scaledSelectorHeight + 'px';
      selectorImage.style.width = scaledSelectorWidth + 'px';
      selectorImage.style.height = scaledSelectorHeight + 'px';

      cur2 = (model.isArrayStartsFrom0()) ? dcur : dcur - 1;
      cur3 = cur2 + wlzToStackOffset;
      fullDepth = model.getFullDepth();
      sliceOffset = cur3 / fullDepth;
      setSliceOffset(sliceOffset);

      totWidth = (dragWidth > scaledSelectorWidth) ? dragWidth : scaledSelectorWidth;
      totHeight = (dragHeight > scaledSelectorHeight) ? dragHeight : scaledSelectorHeight;
      if (leftDragOffset < 0) {
	 totWidth = scaledSelectorWidth - leftDragOffset * 2;
      }
      if (topDragOffset < 0) {
	 totHeight = scaledSelectorHeight - topDragOffset * 2;
      }

      /*
      //feedbackWidth = $('selector-feedbackContainer').getWidth();
      //feedbackHeight = $('selector-feedbackContainer').getHeight();

      //totWidth = (totWidth < feedbackWidth) ? feedbackWidth : totWidth;
      //console.log("feedbackWidth %s, feedbackHeight %s, totWidth %s",feedbackWidth,feedbackHeight,totWidth);

      window.setDimensions(totWidth, totHeight + feedbackHeight + 4);

      imageContainerLeftOffset = Math.floor((totWidth - scaledSelectorWidth) / 2);
      //console.log("imageContainerLeftOffset %s",imageContainerLeftOffset);
      selectorImageContainer.style.left = imageContainerLeftOffset + 'px';

      imageOffset = $('selectorImageContainer').style.left;
      //console.log("imageOffset = ", imageOffset);
      */

   }; // fitSelectorImage

//================================================================
/*
//emouseatlas.emap.sectionSelector = new Class ({
var sectionSelector = new Class ({

   initialize: function(params) {

      //console.log("enter sectionSelector.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.name = "Selector";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      this.maxDim = params.params.maxdim;
      this.targetId = params.params.targetId;
      this.drag = params.params.drag;

      this.invertArrows = (params.params.invert === undefined) ? false : params.params.invert;
      this.invertArrows = (this.invertArrows === 'true' || this.invertArrows === true) ? true : false;

      this.useFilename = (params.params.useFilename === undefined) ? false : params.params.useFilename;
      this.useFilename = (this.useFilename === 'true' || this.useFilename === true) ? true : false;

      var dataSubType = this.model.getDataSubType();
      //console.log("dataSubType %s",dataSubType);
      this.kaufman = (dataSubType === 'kaufman') ? true : false;
      //console.log("this.kaufman %s",this.kaufman);

     this.wlzToStackOffset = this.model.getWlzToStackOffset();

      this.imagePath = this.model.getInterfaceImageDir();
      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         title:this.name,
					 view:this.view,
					 imagePath: this.imagePath,
					 initiator:this});
      //console.log("sectionSelector: x %s, y %s",params.params.x, params.params.y);
      this.window.setPosition(params.params.x, params.params.y);

      // for tooltips
      this.window.handle.addEvent('mouseover', function(){
	 this.ttchain = new Chain();
	 var showTip = function () {
	    this.showToolTip(true);
	 }.bind(this);
	 this.ttchain.chain(showTip);
	 this.ttchain.callChain.delay(500, this.ttchain);
      }.bind(this));
      this.window.handle.addEvent('mouseout', function(){
         if(typeof(this.ttchain) === 'undefined') {
	    this.showToolTip(false);
	 } else {
	    this.ttchain.clearChain();
	    this.showToolTip(false);
	 }
      }.bind(this));

      this.createElements();

      this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function () {

      var win = $(this.shortName + '-win');

      this.titleTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.titleTextSpacer = new Element('div', {
         'id': 'selectorTitleTextSpacer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.titleTextDiv.set('text', 'Section');

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside', 'inside');
      this.titleTextSpacer.inject(topEdge, 'inside', 'inside');
      this.titleTextContainer.inject(topEdge, 'inside', 'inside');

      this.cursorBarWidth = 1; // the width of the line that indicated the current section

      this.imageContainer = new Element( 'div', {
	 id: 'selector-imageContainer'
      });
      this.imageContainer.inject( this.window.win , 'inside');

      this.image = new Element('img', {
         'class': 'selector-image'
      });
      this.image.inject( this.imageContainer , 'inside');

      this.cursorBarContainer = new Element( 'div', {
	 id: 'selector-cursorBarContainer',
         'class': 'selector-cursor'
      });
      this.cursorBarContainer.inject( this.imageContainer , 'inside');
      this.cursorBarContainer.makeDraggable(emouseatlas.emap.utilities.getDragOpts('selector-imageContainer',100,this));

      this.cursorBar = new Element( 'div', {
	 id: 'selector-cursorBar',
         'class': 'selector-cursor'
      });
      this.cursorBar.inject( this.cursorBarContainer , 'inside');

      //------------------------------------
      var dragTarget = this.shortName + '-win';
      $(dragTarget).addEvent('mouseup', function(e) {
         this.doMouseUp(e);
      }.bind(this));
      //------------------------------------

      this.feedback = new Element( 'div', {
	 'id': 'selector-feedbackContainer'
      });
      this.feedback.inject( this.window.win , 'inside');

      this.feedbackText = new Element( 'div', {
	 'id': 'selector-feedbackText'
      });
      this.feedbackText.inject( this.feedback , 'inside');

      this.incDiv = new Element( 'div', {
	 'id': 'selector-incDiv'
      });

      var uparr = this.imagePath + "upArrow_10.png";
      var downarr = this.imagePath + "downArrow_10.png";

      this.incImg = new Element( 'img', {
	 'id': 'selector-incImg',
	 'class': 'selector-image',
	 'src': uparr
      });

      this.incImg.inject(this.incDiv, 'inside');
      this.incDiv.inject(this.feedback, 'inside');
      this.incImg.addEvent('click',function() {
         var dst = this.model.getDistance();
         if(this.invertArrows) {
	   this.model.setDistance(1 * dst.cur  - 1);
	 } else {
            this.model.setDistance(1 * dst.cur  + 1);
	 }
      }.bind(this));

      this.decDiv = new Element( 'div', {
	 'id': 'selector-decDiv'
      });
      this.decImg = new Element( 'img', {
	 'id': 'selector-decImg',
	 'class': 'selector-image',
	 'src': downarr
      });

      this.decImg.inject(this.decDiv, 'inside');
      this.decDiv.inject(this.feedback, 'inside');
      this.decImg.addEvent('click',function() {
         var dst = this.model.getDistance();
         if(this.invertArrows) {
	   this.model.setDistance(1 * dst.cur  + 1);
	 } else {
	   this.model.setDistance(1 * dst.cur  - 1);
	 }
      }.bind(this));

   }, // createElements

   //---------------------------------------------------------------
   handleDrag: function(done) {
      var distance = this.model.getDistance();
      var fullDepth = this.model.getFullDepth();
      var offset = this.getSliceOffset();
      var newDist = offset * fullDepth - this.wlzToStackOffset;
      //console.log("dist.max %d, dist.min",distance.max,distance.min);
      newDist = newDist > distance.max ? distance.max : newDist;
      newDist = newDist < distance.min ? distance.min : newDist;
      //console.log("distance %f, fullDepth %d, offset %f, newDist %d",distance.cur,fullDepth,offset,newDist);
      this.model.modifyDistance(newDist);
   },
   
   //---------------------------------------------------------------
   doMouseUp: function(e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      //console.log("selector mouseup target.id %s",target.id);
      var klass = target.get('class');
      var pattern = /(selector-cursor|selector-image|edge)/i;
      if(klass.match(pattern) != null) {
	 //console.log("sectionSelector: %s doMouseUp",klass);
	 this.view.updateDst();
      } else {
	 //console.log("sectionSelector: doMouseUp on unkown target ",klass);
      }

   }, // doMouseUp


   //---------------------------------------------------------------
   getSliceOffset: function() {

      var zsel = this.model.getZSelectorInfo();
      var ofs;

      if (zsel.orientation == 'vertical') {
	 ofs = this.cursorBarContainer.offsetLeft / (this.dragWidth - this.cursorBarWidth);
      } else if (zsel.orientation == 'horizontal') {
	 ofs = this.cursorBarContainer.offsetTop / (this.dragHeight - this.cursorBarWidth);
      } else {
	 alert("Error: selector orientation "+zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",zsel.orientation," is invalid or undefined");
      }
      //console.log("getSliceOffset: %f",ofs);
      return ofs;
   },

   //---------------------------------------------------------------
   setSliceOffset: function(val) {

      //console.log("setSliceOffset: ",val);
      var zsel = this.model.getZSelectorInfo();

      if(this.model.getFullDepth() === 1) {
	 val = 0.5;
      }

      if (zsel.orientation == 'vertical') {
	 this.cursorBarContainer.style.left = val * (this.dragWidth) + this.leftDragOffset + 'px';
      } else if (zsel.orientation == 'horizontal') {
	 this.cursorBarContainer.style.top = val * (this.dragHeight) + this.topDragOffset + 'px';
      } else {
	 alert("Error: selector orientation "+zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",zsel.orientation," is invalid or undefined");
      }
   },

   //--------------------------------------------------------------
   getSelectorName: function (zsel) {

      //console.log("enter selector.getSelectorName:");

      var layerData;
      var layerNames;
      var layer;
      var selectorName;
      var distance;
      var cur;
      var cur2;
      var cur3;
      var num;
      var entry;
      var min;
      var max;
      var i;

      layerData = this.model.getLayerData();
      layerNames = this.model.getLayerNames();
      layer = layerData[layerNames[0]];  // in future we should be able to select which layer provides the selector Image

      if(this.kaufman) {
         num = zsel.imgRange.length;
         //console.log("getting selector name for kaufman with %d ranges",num);
         if(num > 1) {
            distance = this.model.getDistance();
            cur = distance.cur;
            cur2 = (this.model.isArrayStartsFrom0()) ? cur : cur - 1;
            cur3 = cur2 + this.wlzToStackOffset;
            //console.log("d %d, imgRange ",cur3,zsel.imgRange);
	    for(i=0; i<num; i++) {
	       entry = zsel.imgRange[i];
	       if(cur3 >= entry.min && cur3 <= entry.max) {
	          //console.log("using %s",entry.name);
		  selectorName = entry.name;
		  break;
	       }
	    }
         } else {
            selectorName = layer.selectorName;
         }
      } else {
         selectorName = layer.selectorName;
      }

      return selectorName;
   },

   //--------------------------------------------------------------
   getSelectorSrc: function (zsel) {

      //console.log("enter selector.getSelectorSrc:");

      var selectorSrc;
      var quality;
      var server;
      var layerData;
      var layerNames;
      var layer;
      var dataPath;
      var selectorName;

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (this.model.isEurexpressData()) {
         selectorSrc = zsel.fullname;
      } else {
       ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
	 quality = this.model.getImgQuality();
	 server = this.model.getIIPServer();
	 layerData = this.model.getLayerData();
	 layerNames = this.model.getLayerNames();
	 layer = layerData[layerNames[0]];  // in future we should be able to select which layer provides the selector Image
	 dataPath =  layer.imageDir;

	 selectorName = this.getSelectorName(zsel);

	 selectorSrc = server + '?fif=' + dataPath + selectorName
	    + '&wid='
	    + zsel.width
	    + '&qlt='
	    + quality.cur
	    + '&cvt=jpeg';
      }

      //console.log("exit selector.getSelectorSrc:",selectorSrc);
      return selectorSrc;

   }, // getSelectorSrc

   //--------------------------------------------------------------
   setSelectorImage: function () {

      //console.log("enter selector.setSelectorImage");
      var zsel = this.model.getZSelectorInfo();
      //console.log("zsel ",zsel);

      this.image.style.width = zsel.width + 'px';
      this.image.style.height = zsel.height + 'px';
      this.imageContainer.style.width = zsel.width + 'px';
      this.imageContainer.style.height = zsel.height + 'px';

      this.imageContainer.style.left = '2px';
      this.imageContainer.style.top = '2px';

      this.image.src = this.getSelectorSrc(zsel);

      //console.log("exit selector.setSelectorImage");
   }, // setSelectorImage

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("enter Selector modelUpdate:",modelChanges);
      var distance;
      var cur;
      var cur2;
      var cur3;
      var fullDepth;
      var sliceOffset;
      var layerNames;
      var fullname;
      var name;
      var indx;
      var shortname;
      var pointClickImg;
      var fbText;
      var zsel;
      var num;
      var i;

      if(modelChanges.dst) {
         //console.log("this.model.isArrayStartsFrom0 ",this.model.isArrayStartsFrom0());
	 distance = this.model.getDistance();
	 cur = distance.cur;
	 cur2 = (this.model.isArrayStartsFrom0()) ? cur : cur - 1;
	 cur3 = cur2 + this.wlzToStackOffset;
	 //console.log("distance.cur %d, this.wlzToStackOffset %d",cur,this.wlzToStackOffset)
	    
	 fullDepth = this.model.getFullDepth();
	 //console.log("Selector.modelUpdate modelChanges.dst: cur2 %d, fullDepth %d",cur2, fullDepth);
	 sliceOffset = cur3 / fullDepth;
	 this.setSliceOffset(sliceOffset);

	 if(this.useFilename) {
	    layerNames = this.model.getLayerNames();
            fullname = this.model.getFullImgFilename(layerNames[0]); // in future we will be able to select the appropriate layer
            name = emouseatlas.emap.utilities.getFilenameFromPath(fullname);
            indx = name.indexOf('.');
            shortname = name.substring(0, indx);
	    this.feedbackText.set('text', shortname);
	 } else if(this.kaufman) {
	    pointClickImg = this.model.getPointClickImg();
	    fbText = this.getFeedbackText(pointClickImg);
	    this.feedbackText.innerHTML=(fbText);
            this.setSelectorImage();
	 } else {
	    cur3 = (this.model.isPyrTiffData()) ? cur - 1 : cur;
	    this.feedbackText.set('text', "section: "+ (cur3).toString());
	 }
      }

      //console.log("exit Selector modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("enter Selector viewUpdate:",viewChanges);
      var distance;
      var dcur;
      var zsel;
      var layerNames;
      var fullname;
      var name;
      var indx;
      var shortname;
      var pointClickImg;
      var fbText;
      var cur3;
      var viz;

      if(viewChanges.initial || viewChanges.locator) {
	 distance = this.model.getDistance();
	 dcur = distance.cur;
	 zsel = this.model.getZSelectorInfo();

         this.setSelectorImage();

	 if(this.useFilename) {
	    layerNames = this.model.getLayerNames();
            fullname = this.model.getFullImgFilename(layerNames[0]); // in future we will be able to select the appropriate layer
            name = emouseatlas.emap.utilities.getFilenameFromPath(fullname);
            indx = name.indexOf('.');
            shortname = name.substring(0, indx);
	    this.feedbackText.set('text', shortname);
	 } else if(this.kaufman) {
	    pointClickImg = this.model.getPointClickImg();
	    fbText = this.getFeedbackText(pointClickImg);
	    this.feedbackText.innerHTML=(fbText);
	 } else {
	    cur3 = (this.model.isPyrTiffData()) ? dcur - 1 : dcur;
	    this.feedbackText.set('text', "section: "+ (cur3).toString());
	 }

	 this.window.setVisible(true);

	 this.fitSelectorImage(zsel, dcur);

      } // initial

      //console.log("exit Selector viewUpdate:");

      if(viewChanges.toolbox === true) {
	viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }

   }, // viewUpdate


   //---------------------------------------------------------------
   fitSelectorImage: function(zsel, dcur) {

      var scaleFactor;
      var tl;
      var br;
      var cur2;
      var cur3;
      var sliceOffset;
      var fullDepth;
      var totHeight;
      var feedbackWidth;
      var feedbackHeight;
      var imageContainerLeftOffset;
      var imageOffset;

      // make sure the zsel image fits the max dimension specified
      scaleFactor = (zsel.width > zsel.height) ? this.maxDim / zsel.width : this.maxDim / zsel.height;
      if (scaleFactor > 1) {
	 scaleFactor = 1; 
      }

      this.scaledSelectorWidth = (scaleFactor * zsel.width);
      this.scaledSelectorHeight = (scaleFactor * zsel.height);
      //console.log("scaleFactor %f, scaledSelectorWidth %f, scaledSelectorHeight %f",scaleFactor,this.scaledSelectorWidth,this.scaledSelectorHeight);

      // if the selector image has borders we must allow for them
      tl = 0;
      br = 0;
      if (zsel.border_tl !== undefined) {
	 tl = scaleFactor * zsel.border_tl;
      }
      if (zsel.border_br !== undefined) {
	 br = scaleFactor * zsel.border_br;
      }

      // the actual usable image dimensions (not including borders).
      this.dragWidth = this.scaledSelectorWidth - (tl + br);
      this.dragHeight = this.scaledSelectorHeight - (tl + br)
      //console.log("dragWidth %f, tl %f, br %f",this.dragWidth,tl,br);

      // ----maze------- Offsets of drag constraint div relative to image
      this.topDragOffset = 0;
      this.leftDragOffset = 0;

      if (zsel.orientation == 'horizontal') {
	 //   this.dragHeight = this.dragHeight - tl - br + this.cursorBarWidth;
	 //   this.topDragOffset = tl - this.cursorBarWidth / 2;
	 this.cursorBarContainerHeight = 5;
	 this.topDragOffset = tl - (this.cursorBarContainerHeight / 2);
	 this.cursorBarContainer.style.width = this.scaledSelectorWidth + 'px';
	 this.cursorBarContainer.style.height = this.cursorBarContainerHeight + 'px';
	 this.cursorBar.style.left = '0px';
	 this.cursorBar.style.top = (this.cursorBarContainerHeight / 2) + 'px';
	 this.cursorBar.style.width = this.scaledSelectorWidth + 'px';
	 this.cursorBar.style.height = this.cursorBarWidth + 'px';
      } else if (zsel.orientation == 'vertical') {
	 this.cursorBarContainerWidth = 5;
	 this.leftDragOffset = tl - (this.cursorBarContainerWidth / 2);
	 this.cursorBarContainer.style.width = this.cursorBarContainerWidth + 'px';
	 this.cursorBarContainer.style.height = this.scaledSelectorHeight + 'px';
	 this.cursorBar.style.left = (this.cursorBarContainerWidth / 2) + 'px';
	 this.cursorBar.style.top = '0px';
	 this.cursorBar.style.width = this.cursorBarWidth + 'px';
	 this.cursorBar.style.height = this.scaledSelectorHeight + 'px';
      }
      //console.log("leftDragOffset %f",this.leftDragOffset);

      this.imageContainer.style.width = this.scaledSelectorWidth + 'px';
      this.imageContainer.style.height = this.scaledSelectorHeight + 'px';
      this.image.style.width = this.scaledSelectorWidth + 'px';
      this.image.style.height = this.scaledSelectorHeight + 'px';

      cur2 = (this.model.isArrayStartsFrom0()) ? dcur : dcur - 1;
      cur3 = cur2 + this.wlzToStackOffset;
      fullDepth = this.model.getFullDepth();
      sliceOffset = cur3 / fullDepth;
      this.setSliceOffset(sliceOffset);

      this.totWidth = (this.dragWidth > this.scaledSelectorWidth) ? this.dragWidth : this.scaledSelectorWidth;
      totHeight = (this.dragHeight > this.scaledSelectorHeight) ? this.dragHeight : this.scaledSelectorHeight;
      if (this.leftDragOffset < 0) {
	 this.totWidth = this.scaledSelectorWidth - this.leftDragOffset * 2;
      }
      if (this.topDragOffset < 0) {
	 totHeight = this.scaledSelectorHeight - this.topDragOffset * 2;
      }

      feedbackWidth = $('selector-feedbackContainer').getWidth();
      feedbackHeight = $('selector-feedbackContainer').getHeight();

      this.totWidth = (this.totWidth < feedbackWidth) ? feedbackWidth : this.totWidth;
      //console.log("feedbackWidth %s, feedbackHeight %s, this.totWidth %s",feedbackWidth,feedbackHeight,this.totWidth);

      this.window.setDimensions(this.totWidth, totHeight + feedbackHeight + 4);

      imageContainerLeftOffset = Math.floor((this.totWidth - this.scaledSelectorWidth) / 2);
      //console.log("imageContainerLeftOffset %s",imageContainerLeftOffset);
      this.imageContainer.style.left = imageContainerLeftOffset + 'px';

      this.feedback.style.top = totHeight + 2 + 'px';

      imageOffset = $('selector-imageContainer').style.left;
      //console.log("imageOffset = ", imageOffset);

   }, // fitSelectorImage

   //--------------------------------------------------------------
   getFeedbackText: function (text) {

      var len;
      var frontBit;
      var lastBit;
      var spantex;
      var ihtml;

      len = text.length;
      frontBit = text.substring(0,len-1);
      lastBit = text.substring(len-1);
      spantex = '<span style="font-weight:bold;color:#cc00cc;"> ' + lastBit + '</span>'
      ihtml = frontBit + ': ' + spantex;

      return ihtml;
   },

   //--------------------------------------------------------------
   setToolTip: function (text) {

      //console.log("%s setToolTip",this.shortName);
      // we only want 1 toolTip
      if(typeof(this.toolTip === 'undefined')) {
	 this.toolTip = new Element('div', {
	       'id': this.shortName + '-toolTipContainer',
	       'class': 'toolTipContainer'
	       });
	 this.toolTip.inject($(this.targetId).parentNode, 'inside');
      }
      $(this.shortName + '-toolTipContainer').set('text', this.toolTipText);
   },

   //--------------------------------------------------------------
   showToolTip: function (show) {

      //console.log("%s showToolTip %s: x %s, y %s",this.shortName,show,this.x,this.y);
      var containerPos = this.view.getToolContainerPos();
      var left;
      var top;
      left = $(this.shortName + '-container').getPosition().x;
      top = $(this.shortName + '-container').getPosition().y;
      if(show === true) {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'visible'});
      } else {
	 $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': 'hidden'});
      }
   },

   //---------------------------------------------------------------
   doCollapsed: function() {
      //console.log("%s doCollapsed:",this.name);
      this.isCollapsed = true;
      var left = $(this.shortName + '-container').getPosition().x + 45;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   doExpanded: function() {
      //console.log("%s doExpanded:",this.name);
      this.isCollapsed = false;
      var left = $(this.shortName + '-container').getPosition().x + this.totWidth + 10;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },
*/


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

      dataSubType = model.getDataSubType();
      //console.log("dataSubType %s",dataSubType);
      kaufman = (dataSubType === 'kaufman') ? true : false;
      //console.log("this.kaufman %s",this.kaufman);

      wlzToStackOffset = model.getWlzToStackOffset();

      selectorDragContainerId = "selectorDragContainer";
      dropTargetId = model.getProjectDivId();

      x_left = params.x; 
      y_top = params.y; 
      maxDim = params.maxdim;

      cursorBarWidth = 1;

      createElements();

      MOUSE_DOWN = false;

      EXT_CHANGE = false;
      NUMBER_CHANGE = false;

      //emouseatlas.emap.drag.register({drag:selectorDragContainerId, drop:dropTargetId});

   }; // initialise

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

      //console.log("enter Selector modelUpdate:",modelChanges);
      var distance;
      var cur;
      var cur2;
      var cur3;
      var fullDepth;
      var sliceOffset;
      var layerNames;
      var fullname;
      var name;
      var indx;
      var shortname;
      var pointClickImg;
      var fbText;
      var zsel;
      var num;
      var i;

      if(modelChanges.dst) {
         //console.log("model.isArrayStartsFrom0 ",model.isArrayStartsFrom0());
	 distance = model.getDistance();
	 cur = distance.cur;
	 cur2 = (model.isArrayStartsFrom0()) ? cur : cur - 1;
	 cur3 = cur2 + wlzToStackOffset;
	 //console.log("distance.cur %d, wlzToStackOffset %d",cur,wlzToStackOffset)
	    
	 fullDepth = model.getFullDepth();
	 //console.log("Selector.modelUpdate modelChanges.dst: cur2 %d, fullDepth %d",cur2, fullDepth);
	 sliceOffset = cur3 / fullDepth;
	 setSliceOffset(sliceOffset);

	 if(useFilename) {
	    layerNames = model.getLayerNames();
            fullname = model.getFullImgFilename(layerNames[0]); // in future we will be able to select the appropriate layer
            name = emouseatlas.emap.utilities.getFilenameFromPath(fullname);
            indx = name.indexOf('.');
            shortname = name.substring(0, indx);
	    feedbackText.set('text', shortname);
	 } else if(kaufman) {
	    pointClickImg = model.getPointClickImg();
	    fbText = getFeedbackText(pointClickImg);
	    feedbackText.innerHTML=(fbText);
            setSelectorImage();
	 } else {
	    cur3 = (model.isPyrTiffData()) ? cur - 1 : cur;
	    feedbackText.set('text', "section: "+ (cur3).toString());
	 }
      }

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      var initState;
      var dst;
      var dcur;
      var zsel;
      var invDist;
      var distCur;

      if(viewChanges.initial === true) {
	 dst = model.getDistance();
	 dcur = dst.cur;
	 zsel = model.getZSelectorInfo();
         setSelectorImage();
	 fitSelectorImage(zsel, dcur);
      }

      //...................................

   }; // viewUpdate


   //---------------------------------------------------------------
   var getName = function() {
      return "sectionSelector";
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


}(); // sectionSelector
