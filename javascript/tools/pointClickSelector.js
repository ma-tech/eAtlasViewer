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
//   pointClickSelector.js
//   Tool to allow slice selection in a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// pointClickSelector
//---------------------------------------------------------
//emouseatlas.emap.pointClickSelector = new Class ({
var pointClickSelector = new Class ({

   initialize: function(params) {

      //console.log("enter pointClickSelector.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this.name = "pointClickSelector";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      this.maxDim = params.params.maxdim;
      this.width = params.params.width;
      this.height = params.params.height;
      this.targetId = params.params.targetId;
      this.drag = params.params.drag;
      this.borders = (params.params.borders === undefined) ? true : params.params.borders;
      this.borders = (this.borders === 'false' || this.borders === false) ? false : true;

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
                                         borders:this.borders,
                                         title:this.name,
					 view:this.view,
					 width:this.width,
					 height:this.height,
					 imagePath: this.imagePath,
					 initiator:this});
      //console.log("pointClickSelector: x %s, y %s",params.params.x, params.params.y);
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

      this.pointClickImgData = this.model.getPointClickImgData();
      this.nSections = this.model.getFullDepth(); // number of virtual sections covering complete image
      this.nSections = (this.nSections === undefined) ? 100 : this.nSections;

      this.zsel = this.model.getZSelectorInfo();
      this.createElements();

      this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function () {

      var win = $(this.shortName + '-win');

      var topEdge = $(this.shortName + '-topedge');

      this.cursorBarWidth = 1; // the width of the line that indicated the current section

      this.imageContainer = new Element( 'div', {
	 id: 'selector-imageContainer'
      });
      this.imageContainer.inject( this.window.win , 'inside');

      this.image = new Element('img', {
         'id': 'selector-image',
         'class': 'selector-image'
      });

      var imgW = this.zsel.width;
      var imgH = this.zsel.height;
      //console.log("image: W %s, H %s",imgW,imgH);

      this.image.inject( this.imageContainer , 'inside');

      this.cursorBarContainer = new Element( 'div', {
	 id: 'selector-cursorBarContainer',
         'class': 'selector-cursor'
      });
      this.cursorBarContainer.inject( this.imageContainer , 'inside');
      //this.cursorBarContainer.makeDraggable(emouseatlas.emap.utilities.getDragOpts('selector-imageContainer',100,this));

      this.cursorBar = new Element( 'div', {
	 'id': 'selector-cursorBar',
         'class': 'selector-cursor'
      });
      this.cursorBar.inject( this.cursorBarContainer , 'inside');

      if(this.getSelectorSrc() === undefined) {
         this.cursorBar.style.visibility = 'hidden';
      }

      //------------------------------------
      var dragTarget = this.shortName + '-win';
      $(dragTarget).addEvent('mouseup', function(e) {
         this.doMouseUp(e);
      }.bind(this));
      //------------------------------------

      this.controlDiv = new Element( 'div', {
	 'id': 'selector-controlDiv'
      });
      this.controlDiv.inject( this.window.win , 'inside');

      //------------------------------------
      this.dropDownDiv = new Element( 'div', {
	 'id': 'selector-dropDownDiv'
      });
      this.dropDown = new Element('select', {
	 'id': 'selector-dropDown',
	 'class': 'selector-dropDown'
      });

      var optionArr = this.getSectionLabels();
      //optionArr = ["a","b","c","d","e","f","g","h","i","j","k","l"];
      var len = optionArr.length;
      var option;
      var i;
      var optionTxt;
      var spantex;

      //console.log("this.pointClickImgData ",this.pointClickImgData);

      if(this.pointClickImgData.subplate) {
         optionTxt = "Plate " + this.pointClickImgData.subplate + ", ";
      } else {
         optionTxt = " ";
      }

      for(i=0; i<len; i++) {
         spantex = optionTxt + '<span style="font-weight:bold;color:#cc00cc;"> ' + optionArr[i] + '</span>'
         option = new Element('option', {
	    'id':'selector-option' + i,
	    'class': 'selector-option',
	    'value': i
	    //'text': optionTxt + optionArr[i]
	 });
	 option.inject(this.dropDown, 'inside');
	 option.set('html', spantex);
      }

      this.dropDown.inject(this.dropDownDiv, 'inside');
      this.dropDownDiv.inject(this.controlDiv, 'inside');
      this.dropDown.addEvent('change',function(e) {
         this.doDropDownChanged(e);
      }.bind(this));

   }, // createElements

   //---------------------------------------------------------------
   getSectionLabels: function() {

      var labelArr = [];
      var map;
      var len;
      var i;

      map = this.pointClickImgData.sectionMap;

      len = map.length;
      for(i=0; i<len; i++) {
         labelArr[i] = map[i].label;
      }

      //console.log(this.pointClickImgData);
      return labelArr;
   },

   //---------------------------------------------------------------
   handleDrag: function(done) {
      var distance = this.model.getDistance();
      var offset = this.getSliceOffset();
      //console.log("handleDrag: distance %d, slice offset %d",distance,offset);
      /*
      var newDist = offset * this.nSections - this.wlzToStackOffset;
      newDist = newDist > distance.max ? distance.max : newDist;
      newDist = newDist < distance.min ? distance.min : newDist;
      this.model.modifyDistance(newDist);
      */
   },
   
   //---------------------------------------------------------------
   doMouseUp: function(e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var klass = target.get('class');
      //var pattern = /(selector-cursor|selector-image|edge)/i;
      var pattern = /(selector-cursor)/i;
      if(klass.match(pattern) != null) {
	 //console.log("pointClickSelector: %s doMouseUp",klass);
	 this.view.updateDst();
      } else {
	 //console.log("pointClickSelector: doMouseUp on something else ");
      }

   }, // doMouseUp

   //---------------------------------------------------------------
   doDropDownChanged: function(e) {

      var target = emouseatlas.emap.utilities.getTarget(e);
      var klass = target.get('class');
      var pattern = /(selector-dropDown)/i;
      var indx;

      if(klass.match(pattern) != null) {
	 indx = target.selectedIndex;
	 //console.log("pointClickSelector: %s dropDown changed to indx %d",klass,indx);
	 this.model.setDistance(indx);
      } else {
	 //console.log("pointClickSelector: some other dropDown changed ");
      }

   }, // doMouseUp

   //---------------------------------------------------------------
   getSliceOffset: function() {

      var ofs;

      if (this.zsel.orientation == 'vertical') {
	 ofs = this.cursorBarContainer.offsetLeft / (this.dragWidth - this.cursorBarWidth);
      } else if (this.zsel.orientation == 'horizontal') {
	 ofs = this.cursorBarContainer.offsetTop / (this.dragHeight - this.cursorBarWidth);
      } else {
	 alert("Error: selector orientation "+this.zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",this.zsel.orientation," is invalid or undefined");
      }
      //console.log("getSliceOffset: %f",ofs);
      return ofs;
   },

   /*
   //---------------------------------------------------------------
   setSliceOffset: function(val) {

      //console.log("setSliceOffset: ",val);
      var ofs;

      if(this.model.getFullDepth() === 1) {
	 val = 0.5;
      }

      if (this.zsel.orientation == 'vertical') {
	 this.cursorBarContainer.style.left = val * (this.dragWidth) + this.leftDragOffset + 'px';
      } else if (this.zsel.orientation == 'horizontal') {
	 ofs = val * (this.dragHeight) + this.topDragOffset;
	 ofs = parseInt(ofs);
	 console.log("ofs %d",ofs);
	 this.cursorBarContainer.style.top = ofs + 'px';
      } else {
	 alert("Error: selector orientation "+this.zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",this.zsel.orientation," is invalid or undefined");
      }
   },
   */

   //---------------------------------------------------------------
   setSectionOffset: function(dist) {

      var sectionMap = [];
      var perc;
      var section;
      var ofs;
      var dropDownIndx;

      //console.log(this.pointClickImgData);
      //console.log("setSectionOffset: ",dist);
      sectionMap = this.pointClickImgData.sectionMap;
      section = sectionMap[dist].section;
      //console.log("section -->",section);
      //console.log("nSections -->",this.nSections);

      perc = parseFloat(section / this.nSections);

      //console.log("perc %d",perc);
      //console.log("setSectionOffset: this.dragHeight %f, this.topDragOffset %f",this.dragHeight,this.topDragOffset);
      //console.log("setSectionOffset: this.dragWidth %f, this.leftDragOffset %f",this.dragWidth,this.leftDragOffset);

      if (this.zsel.orientation == 'vertical') {
	 ofs = perc * (this.dragWidth) + this.leftDragOffset;
	 ofs = parseInt(ofs);
	 //console.log("ofs %d",ofs);
	 this.cursorBarContainer.style.left = ofs + 'px';
      } else if (this.zsel.orientation == 'horizontal') {
	 ofs = perc * (this.dragHeight) + this.topDragOffset;
	 ofs = parseInt(ofs);
	 //console.log("ofs %d",ofs);
	 this.cursorBarContainer.style.top = ofs + 'px';
      } else {
	 alert("Error: selector orientation "+this.zsel.orientation+" is invalid or undefined");
	 //console.log("getSliceOffset: selector orientation ",this.zsel.orientation," is invalid or undefined");
      }

      dropDownIndx = this.dropDown.selectedIndex;
      if(dropDownIndx !== dist) {
         this.dropDown.selectedIndex = dist;
      }
   },

   //--------------------------------------------------------------
   getSelectorName: function () {

      //console.log("enter selector.getSelectorName:");

      var layerData;
      var layerNames;
      var layer;
      var selectorName;
      var aspectRatio;
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

      if(layer.selectorName === undefined || layer.selectorName === "") {
         return undefined;
      }

      if(this.zsel.imgRange && this.zsel.imgRange.length > 1) {
         num = this.zsel.imgRange.length;
         //console.log("getting selector name for kaufman with %d ranges",num);
         if(num > 1) {
            distance = this.model.getDistance();
            cur = distance.cur;
            cur2 = (this.model.isArrayStartsFrom0()) ? cur : cur - 1;
            cur3 = cur2 + this.wlzToStackOffset;
            //console.log("d %d, imgRange ",cur3,this.zsel.imgRange);
	    for(i=0; i<num; i++) {
	       entry = this.zsel.imgRange[i];
	       if(cur3 >= entry.min && cur3 <= entry.max) {
	          //console.log("using %s",entry.name);
		  selectorName = entry.name;
		  break;
	       }
	    }
         }
      } else {
         selectorName = layer.selectorName;
      }

      return selectorName;
   },

   //--------------------------------------------------------------
   getSelectorSrc: function () {

      //console.log("enter selector.getSelectorSrc:");

      var selectorSrc;
      var quality;
      var server;
      var layerData;
      var layerNames;
      var layer;
      var dataPath;
      var selectorName;
      
      quality = this.model.getImgQuality();
      server = this.model.getIIPServer();
      layerData = this.model.getLayerData();
      layerNames = this.model.getLayerNames();
      layer = layerData[layerNames[0]];  // in future we should be able to select which layer provides the selector Image
      dataPath =  layer.imageDir;
      
      selectorName = this.getSelectorName();

      if(selectorName === undefined || selectorName === "") {
         return undefined;
      }

      selectorSrc = server + '?fif=' + dataPath + selectorName
         + '&qlt='
         + quality.cur
         + '&cvt=jpeg';
/* 
      selectorSrc = server + '?fif=' + dataPath + selectorName
         + '&wid='
         + this.zsel.width
         + '&qlt='
         + quality.cur
         + '&cvt=jpeg';
*/
      
      //console.log("exit selector.getSelectorSrc:",selectorSrc);
      return selectorSrc;

   }, // getSelectorSrc

   //--------------------------------------------------------------
   setSelectorImage: function () {

      //console.log("enter selector.setSelectorImage");
      //console.log("zsel ",this.zsel);

      //this.image.style.width = this.zsel.width + 'px';
      //this.image.style.height = this.zsel.height + 'px';
      //this.imageContainer.style.width = this.zsel.width + 'px';
      //this.imageContainer.style.height = this.zsel.height + 'px';

      //this.imageContainer.style.left = '2px';
      this.imageContainer.style.top = '2px';

      this.image.src = this.getSelectorSrc();

      //console.log("exit selector.setSelectorImage");
   }, // setSelectorImage

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      //console.log("enter Selector modelUpdate:",modelChanges);
      var distance;


      if(modelChanges.dst) {
         //console.log("this.model.isArrayStartsFrom0 ",this.model.isArrayStartsFrom0());
	 distance = this.model.getDistance().cur;
	 this.setSectionOffset(distance);

         this.setSelectorImage();
      }

      //console.log("exit Selector modelUpdate:");
   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("enter Selector viewUpdate:",viewChanges);
      var distance;
      var dcur;
      var layerNames;
      var fullname;
      var name;
      var indx;
      var shortname;
      //var pointClickImg;
      //var fbText;
      var cur3;
      var viz;

      if(viewChanges.initial) {
	 distance = this.model.getDistance();
	 dcur = distance.cur;
         this.setSelectorImage();
	 this.window.setVisible(true);
	 this.fitSelectorImage(dcur);
      } // initial

      if(viewChanges.locator) {
	 distance = this.model.getDistance();
	 dcur = distance.cur;
         this.setSelectorImage();
	 this.fitSelectorImage(dcur);
      } // locator
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
   fitSelectorImage: function(dcur) {

      var entry;
      var num;
      var aspectRatio;
      var selector;
      var topstr;
      var toppx;
      var imgWStr;
      var imgW;
      var imgH;
      var cur2;
      var cur3;
      var sliceOffset;
      var fullDepth;
      var totHeight;
      var controlDivWidth;
      var controlDivHeight;
      var imageContainerLeftOffset;

      if(this.zsel.imgRange && this.zsel.imgRange.length > 1) {
         num = this.zsel.imgRange.length;
	 distance = this.model.getDistance();
	 cur = distance.cur;
	 cur2 = (this.model.isArrayStartsFrom0()) ? cur : cur - 1;
	 cur3 = cur2 + this.wlzToStackOffset;
	 //console.log("d %d, imgRange ",cur3,this.zsel.imgRange);
	 for(i=0; i<num; i++) {
	    entry = this.zsel.imgRange[i];
	    if(cur3 >= entry.min && cur3 <= entry.max) {
	       //console.log("using %s",entry.name);
	       aspectRatio = entry.aspectRatio;
	       break;
	    }
	 }
      } else {
         aspectRatio = this.zsel.aspectRatio; 
      }

      //console.log("fitSelectorImage: aspectRatio %f",aspectRatio);

      imgWStr = window.getComputedStyle(this.image, null).getPropertyValue("width");
      indx = imgWStr.indexOf("px");
      imgW = Number(imgWStr.substring(0,indx));

      imgH = parseInt(imgW / aspectRatio);
      this.controlDiv.style.top = Number(imgH) + Number(10) + 'px';

      // for Kaufman point and click we need to adjust the position of the locator for plates 3 & 4
      // when a different embryo is displayed.
      selector = $('pointclickselector-container');
      topstr = window.getComputedStyle(selector, null).getPropertyValue("top");
      indx = topstr.indexOf("px");
      toppx = topstr.substring(0,indx);
      this.view.updateLocatorPosition(toppx, imgH);

      this.dragHeight = imgH;
      this.topDragOffset = 0;

      this.dragWidth = imgW;
      this.leftDragOffset = 0;

      this.cursorBar.setStyles({
	    'width': imgW 
      });

      if (this.zsel.orientation == 'horizontal') {
	 this.cursorBarContainerHeight = 5;
	 //this.topDragOffset =  - (this.cursorBarContainerHeight / 2);
	 this.cursorBarContainer.style.width = imgW + 'px';
	 this.cursorBarContainer.style.height = this.cursorBarContainerHeight + 'px';
	 this.cursorBar.style.left = '0px';
	 this.cursorBar.style.top = (this.cursorBarContainerHeight / 2) + 'px';
	 this.cursorBar.style.width = imgW + 'px';
	 this.cursorBar.style.height = this.cursorBarWidth + 'px';
      } else if (this.zsel.orientation == 'vertical') {
	 this.cursorBarContainerWidth = 5;
	 //this.leftDragOffset =  - (this.cursorBarContainerWidth / 2);
	 this.cursorBarContainer.style.width = this.cursorBarContainerWidth + 'px';
	 this.cursorBarContainer.style.height = (imgH-20) + 'px';
	 this.cursorBar.style.left = (this.cursorBarContainerWidth / 2) + 'px';
	 this.cursorBar.style.top = '0px';
	 this.cursorBar.style.width = this.cursorBarWidth + 'px';
	 this.cursorBar.style.height = imgH + 'px';
      }

      this.setSectionOffset(dcur);

   }, // fitSelectorImage

   //--------------------------------------------------------------
   getFeedbackText: function (text) {

      var len;
      var frontBit;
      //var lastBit;
      //var spantex;
      //var ihtml;

      len = text.length;
      frontBit = text.substring(0,len-1);
      //lastBit = text.substring(len-1);
      //spantex = '<span style="font-weight:bold;color:#cc00cc;"> ' + lastBit + '</span>'
      //ihtml = frontBit + ': ' + spantex;

      //return ihtml;
      return frontBit;
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
   }


}); // pointClickSelector
