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
//   nextPaintedSectionTool.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// nextPaintedSectionTool
//---------------------------------------------------------
var nextPaintedSectionTool = new Class ({

   initialize: function(params) {

      this.view = params.view;
      this.model = params.model;
      this.name = "NextPaintedSection";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;
      this.borders = params.params.borders;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
					 transparent:true,
					 borders:this.borders,
					 toBottom: false,
                                         title:this.name,
					 view:this.view,
					 imagePath: this.imagePath,
					 initiator:this});

      this.window.setDimensions(this.width, this.height);
      this.window.setPosition(params.params.x, params.params.y);

      /*
      //this.setToolTip(this.toolTipText);

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
      */

      this.createElements();

      this.paintedSectionArr = undefined;

      this.model.register(this);
      this.view.register(this);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function () {

      var win = $(this.shortName + '-win');

      var firstImgSrc = this.imagePath + "firstIcon_10x12.png";
      var lastImgSrc = this.imagePath + "lastIcon_10x12.png";
      var prevImgSrc = this.imagePath + "prevIcon_10x12.png";
      var nextImgSrc = this.imagePath + "nextIcon_10x12.png";

      this.titleTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.titleTextSpacer = new Element('div', {
         'id': 'nextColourSectionTextSpacer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      this.titleTextDiv.set('text', 'Colour Section');

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside', 'inside');
      this.titleTextSpacer.inject(topEdge, 'inside', 'inside');
      this.titleTextContainer.inject(topEdge, 'inside', 'inside');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      this.buttonContainer = new Element('div', {
	 'id': 'paintedSectionButtonContainer'
      });

      this.firstButton = new Element('div', {
         'id': 'paintedSectionFirstButton',
	 'class': 'paintedSectionButton first'
      });
      this.firstImgDiv = new Element( 'div', {
	 'id': 'firstImgDiv',
	 'class': 'paintedSectionButtonDiv'
      });
      this.firstImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': firstImgSrc
      });
      //this.firstButton.appendText('<<');

      this.lastButton = new Element('div', {
         'id': 'paintedSectionLastButton',
	 'class': 'paintedSectionButton last'
      });
      this.lastImgDiv = new Element( 'div', {
	 'id': 'lastImgDiv',
	 'class': 'paintedSectionButtonDiv'
      });
      this.lastImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': lastImgSrc
      });
      //this.lastButton.appendText('>>');

      this.prevButton = new Element('div', {
         'id': 'paintedSectionPrevButton',
	 'class': 'paintedSectionButton prev'
      });
      this.prevImgDiv = new Element( 'div', {
	 'id': 'prevImgDiv',
	 'class': 'paintedSectionButtonDiv'
      });
      this.prevImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': prevImgSrc
      });
      //this.prevButton.appendText('<');

      this.nextButton = new Element('div', {
         'id': 'paintedSectionNextButton',
	 'class': 'paintedSectionButton next'
      });
      this.nextImgDiv = new Element( 'div', {
	 'id': 'nextImgDiv',
	 'class': 'paintedSectionButtonDiv'
      });
      this.nextImg = new Element( 'img', {
	 'class': 'decImg',
	 'src': nextImgSrc
      });
      //this.nextButton.appendText('>');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      this.buttonContainer.inject(win, 'inside');
      this.firstButton.inject(this.buttonContainer, 'inside');
      this.prevButton.inject(this.buttonContainer, 'inside');
      this.nextButton.inject(this.buttonContainer, 'inside');
      this.lastButton.inject(this.buttonContainer, 'inside');

      this.firstImg.inject(this.firstImgDiv, 'inside');
      this.firstImgDiv.inject(this.firstButton, 'inside');

      this.lastImg.inject(this.lastImgDiv, 'inside');
      this.lastImgDiv.inject(this.lastButton, 'inside');
      
      this.nextImg.inject(this.nextImgDiv, 'inside');
      this.nextImgDiv.inject(this.nextButton, 'inside');

      this.prevImg.inject(this.prevImgDiv, 'inside');
      this.prevImgDiv.inject(this.prevButton, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('paintedSectionFirstButton');
      emouseatlas.emap.utilities.addButtonStyle('paintedSectionLastButton');
      emouseatlas.emap.utilities.addButtonStyle('paintedSectionPrevButton');
      emouseatlas.emap.utilities.addButtonStyle('paintedSectionNextButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      this.firstButton.addEvent('click',function() {
	 this.doFirstPaintedSection();
      }.bind(this));

      this.lastButton.addEvent('click',function() {
	 this.doLastPaintedSection();
      }.bind(this));

      this.prevButton.addEvent('click',function() {
	 this.doPrevPaintedSection();
      }.bind(this));

      this.nextButton.addEvent('click',function() {
	 this.doNextPaintedSection();
      }.bind(this));

      return false;
   },

   //---------------------------------------------------------------
   modelUpdate: function (modelChanges) {
      return false;
   },

   //---------------------------------------------------------------
   viewUpdate: function (viewChanges) {

      if(viewChanges.initial === true) {
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   },

   //---------------------------------------------------------------
   doFirstPaintedSection: function () {

      //console.log("doFirstPaintedSection:");
      if(this.paintedSectionArr === undefined) {
         this.paintedSectionArr = this.model.getPaintedSectionArr();
      }

      if(this.paintedSectionArr === null || this.paintedSectionArr === undefined || this.paintedSectionArr.length <= 0) {
         return false;
      }

      //dist = this.model.getDistance();
      this.model.setDistance(this.paintedSectionArr[0]);
   },

   //---------------------------------------------------------------
   doLastPaintedSection: function () {

      var len;
      //console.log("doLastPaintedSection:");
      if(this.paintedSectionArr === undefined) {
         this.paintedSectionArr = this.model.getPaintedSectionArr();
      }

      if(this.paintedSectionArr === null || this.paintedSectionArr === undefined || this.paintedSectionArr.length <= 0) {
         return false;
      }

      len = this.paintedSectionArr.length;
      this.model.setDistance(this.paintedSectionArr[len-1]);
   },

   //---------------------------------------------------------------
   doPrevPaintedSection: function () {

      var dist;
      var len;
      var i;

      //console.log("doPrevPaintedSection:");
      if(this.paintedSectionArr === undefined) {
         this.paintedSectionArr = this.model.getPaintedSectionArr();
      }

      if(this.paintedSectionArr === null || this.paintedSectionArr === undefined || this.paintedSectionArr.length <= 0) {
         return false;
      }

      //console.log(this.paintedSectionArr);

      len = this.paintedSectionArr.length - 1;
      dist = this.model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=len; i>-1; i--) {
         val = this.paintedSectionArr[i];
	 //console.log("val %d",val);
         if(val < dist.cur) {
	    this.model.setDistance(val);
	    return;
	 }
      }
   },

   //---------------------------------------------------------------
   doNextPaintedSection: function () {
      
      var dist;
      var len;
      var val;
      var i;

      //console.log("doNextPaintedSection:");
      if(this.paintedSectionArr === undefined) {
         this.paintedSectionArr = this.model.getPaintedSectionArr();
      }

      //console.log(this.paintedSectionArr.reverse());

      len = this.paintedSectionArr.length;
      dist = this.model.getDistance();
      //console.log("dist %d",dist.cur);

      for(i=0; i<len; i++) {
	 //console.log("val %d",val);
         val = this.paintedSectionArr[i];
         if(val > dist.cur) {
	    this.model.setDistance(val);
	    return;
	 }
      }

   },

   //---------------------------------------------------------------
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
   }

});
