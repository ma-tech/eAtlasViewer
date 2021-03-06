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
//   tiledImageLocatorTool.js
//   Tool to allow navigation around a High resolution tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageLocatorTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageLocatorTool = new Class ({
var tiledImageLocatorTool = new Class ({

   initialize: function(params) {

      //console.log("enter tiledImageLocatorTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this, "tiledImageLocatorTool");
      this.view.register(this, "tiledImageLocatorTool");

      this.maxWidth = params.params.width;
      this.maxHeight = params.params.height;
      this.zoneBorder = 1;

      this.name = "Locator";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      this.toolTipText = this.shortName;

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;
      this.toBottom = params.params.toBottom;
      this.borders = (params.params.borders === undefined) ? true : params.params.borders;
      this.borders = (this.borders === 'false' || this.borders === false) ? false : true;

      var imagePath = this.model.getInterfaceImageDir();
      //console.log("Locator: imagePath %s",imagePath);
      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         toBottom:this.toBottom,
                                         borders:this.borders,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: imagePath,
					 initiator:this });

      //console.log("x %s, y %s",params.params.x, params.params.y);
      this.window.setPosition(params.params.x, params.params.y);

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

      //this.window.win.style.position = 'absolute';

      this.imageContainer = new Element( 'div', {
	 'id': this.shortName+'-imagecontainer',
	 'class': 'imagecontainer'
      });
      this.imageContainer.inject( this.window.win , 'inside');

      this.image = new Element( 'img', {
	 id: this.shortName+'-image'
      });
      this.image.inject( this.imageContainer , 'inside');

      this.zone = new Element( 'div', {
	 'id': this.shortName+'-zone',
	 'class': 'zone',
	 'styles': {
	    'border': this.zoneBorder + 'px solid blue'
	 }
      });
      this.zone.inject( this.imageContainer , 'inside');
      this.zone.makeDraggable(emouseatlas.emap.utilities.getDragOpts(this.shortName+'-imagecontainer',0,this));

      //console.log("exit tiledImageLocatorTool.initialize");
      this.setToolTip(this.toolTipText);

      // this is a hack to fix the TPR demo
      this.stackofs = this.model.getWlzToStackOffset();
      //console.log("stackofs = ",stackofs);


   },

   //---------------------------------------------------------------
   handleDrag: function(done) {
      //console.log("enter tiledImageLocatorTool.handleDrag:");
      var x = 0.5;
      var y = 0.5;
      var imgFit = this.view.getImgFit();

      if (!imgFit.xfits) {
	 x = (this.zone.offsetLeft + this.zonewidth / 2) / this.navwidth;
      }
      if (!imgFit.yfits) {
	 y = (this.zone.offsetTop  + this.zoneheight / 2) / this.navheight;
      }
      //console.log("Locator x %d, y %d",x,y);

      this.view.setFocalPoint({x:x, y:y}, "locator");
      //console.log("exit tiledImageLocatorTool.handleDrag:");
   },


   //---------------------------------------------------------------
   modelUpdate: function(modelChanges, from) {

      //......................................................
      // this should fire whenever dst or rotation is changed
      //......................................................
      //console.log("tiledImageLocator modelUpdate:");
      if(modelChanges.sectionChanged === true) {
	 //console.log("tiledImageLocator.modelUpdate: dst | locator");
	 this.setNavDims();
	 this.window.setDimensions(this.navwidth + 4,this.navheight + 4);
	 this.setLocatorImage('modelUpdate.sectionChanged');
	 this.isWlz = this.model.isWlzData();
         this.setLocatorZone();
      } // modelChanges.fullImgDims

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("tiledImageLocator viewUpdate:");
      // do the setting up stuff
      if(viewChanges.initial === true) {
	 //console.log("locator: viewChanges.initial %s",viewChanges.initial);
	 this.isWlz = this.model.isWlzData();
	 this.window.setVisible(true);
	 this.setNavDims();
	 this.window.setDimensions(this.navwidth + 4,this.navheight + 4);
	 this.setLocatorImage('viewUpdate.initial');
	 this.setLocatorZone();
      } // viewChanges.initial
      
      //.................................
      if(viewChanges.scale === true) {
         //console.log("tiledImageLocator.viewUpdate: scale");
	 this.setNavDims();
	 this.window.setDimensions(this.navwidth + 4,this.navheight + 4);
	 this.setLocatorImage('viewUpdate.scale');
	 this.setLocatorZone();
      } // viewChanges.scale

      //.................................
      if(viewChanges.focalPoint === true) {
	 //console.log("locator: viewChanges.focalPoint %s",viewChanges.focalPoint);
	 this.setLocatorZone();
      } // viewChanges.focalPoint

      //.................................
      if(viewChanges.locator === true) {
         //console.log("tiledImageLocator.viewUpdate: locator");
	 this.setNavDims();
	 this.window.setDimensions(this.navwidth + 4,this.navheight + 4);
	 this.setLocatorImage('viewUpdate.locator');
	 this.setLocatorZone();
      } // viewChanges.wlzUpdated

      //.................................
      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }

   }, // viewUpdate

   //--------------------------------------------------------------
   setNavDims: function () {

      //console.log("locator: setNavDims");
      var fullImgDims = this.model.getFullImgDims();
      var w = this.maxWidth / fullImgDims.width;
      var h = this.maxHeight / fullImgDims.height;
      this.navscale = (w < h) ? w : h;
      this.navscale = (Math.round(this.navscale * 10000))/10000;
      //console.log("this.navscale ",this.navscale);

      this.navwidth  = (this.navscale * fullImgDims.width);
      this.navheight = (this.navscale * fullImgDims.height);

      //console.log("maxW %d, fullwidth %d, navwidth %d, navscale %f",this.maxWidth,fullImgDims.width, this.navwidth,this.navscale);
   }, // setNavDims

   //--------------------------------------------------------------
   getNavSrc: function () {

      //console.log("enter locator.getNavSrc:");

      var quality = this.model.getImgQuality();
      var server = this.model.getIIPServer();
      var layerData = this.model.getLayerData();
      var layerNames = this.model.getLayerNames();
      var layer = layerData[layerNames[0]];  // in future we will be able to select which layer provides the locator image
      var imgDir =  layer.imageDir;
      var imgName =  layer.imageName;
      var sampleRate = 1.0;  // this will have to be sorted out with Richard & Bill

      /*
      // for very large images the locator image must be sub-sampled.
      var locatorData = this.view.getLocatorData();
      var imgName = locatorData.imageName;
      var imgDir = locatorData.imageDir;
      var sampleRate = locatorData.sampleRate;
      */

      if (this.isWlz) {
	 var threeDInfo = this.model.getThreeDInfo();
	 //console.log("threeDInfo: ",threeDInfo);

	 //var navsrc = server + '?wlz=' +  this.model.getFileSystemRoot() + this.model.getDataRoot()+imgDir + imgName
	 var navsrc = server + '?wlz=' +  imgDir + imgName
	 + "&mod=" + threeDInfo.wlzMode
	 + "&fxp=" + (threeDInfo.fxp.x / sampleRate) + ',' + (threeDInfo.fxp.y / sampleRate) + ','+ (threeDInfo.fxp.z / sampleRate)
	 + "&scl=" + (this.navscale * sampleRate)
	 + "&dst=" + (threeDInfo.dst.cur - this.stackofs) * this.navscale
	 + "&pit=" + threeDInfo.pitch.cur
	 + "&yaw=" + threeDInfo.yaw.cur
	 + "&rol=" + threeDInfo.roll.cur
	 + "&qlt=" + quality.cur
	 + '&cvt=jpeg';
	 //console.log("navsrc %s",navsrc);
      } else {
	 //console.log("not wlz:");
	 var navsrc = server + '?fif=' + this.model.getFullImgFilename(layerNames[0])
	 //var navsrc = server + '?fif=' + imgName
	 + '&wid=' + this.navwidth * 2
	 + '&qlt=' + quality.cur
	 + '&cvt=jpeg';
	 //console.log("navsrc %s",navsrc);
      }

      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data
      if (this.model.isEurexpressData() &&
	  -1 != navsrc.indexOf("/fcgi-bin/wlziipsrv.fcgi"))
	  navsrc = navsrc.replace("emage_iipviewer", "eAtlasViewer");
      ///////////!!!!!  Please do not remove it, unless your changes are tested on eurExpress data

      //console.log("exit locator.getNavSrc:",navsrc);
      return navsrc;
   }, // getNavSrc

   //--------------------------------------------------------------
   setLocatorImage: function (caller) {

      //console.log("enter locator.setLocatorImage, called from %s",caller);
      if (!this.isWlz) {
	 //console.log("not wlz");
	 this.image.style.width = this.navwidth + 'px';
	 this.image.style.height = this.navheight + 'px';
	 this.imageContainer.style.width = this.navwidth + 'px';
	 this.imageContainer.style.height = this.navheight + 'px';
      }

      this.imageContainer.style.left = '2px';
      this.imageContainer.style.top = '2px';

      var src = this.getNavSrc();
      
      // do not know how browser fetches new image.src,
      //  make sure it does not fetch uncessary
      if (this.oldImg === undefined ||
	  this.oldImg != src) {
	this.image.src = src;
	this.oldImg = src;
      }

      //console.log("exit locator.setLocatorImage, called from %s",caller);
   }, // setLocatorImage

   //--------------------------------------------------------------
   setLocatorZone: function () {

      //console.log("enter locator.setLocatorZone");
      var focalPoint = this.view.getFocalPoint();
      var viewable = this.view.getViewableDims();
      var imgFit = this.view.getImgFit();
      var scale = this.view.getScale();

      this.zonewidth =  this.navscale * viewable.width  / scale.cur;
      this.zoneheight = this.navscale * viewable.height / scale.cur;

      // previously used $chk
      if (this.zonewidth || this.zonewidth === 0) {
	 this.zone.style.width = this.zonewidth - 2 * this.zoneBorder + 'px';
      }
      // previously used $chk
      if (this.zoneheight || this.zoneheight === 0) {
	 this.zone.style.height = this.zoneheight - 2 * this.zoneBorder + 'px';
      }

      // centres the 'zone'
      var x = focalPoint.x * this.navwidth - this.zonewidth/2;
      var y = focalPoint.y * this.navheight - this.zoneheight/2;

      if (x < 0) {
	 x = 0;
      } else if (imgFit.xfits) {
	 x = 0;
      } else if (x > this.navwidth - this.zonewidth) {
	 x = this.navwidth - this.zonewidth;
      }

      if (y < 0) {
	 y = 0;
      } else if (imgFit.yfits) {
	 y = 0;
      } else if (y > this.navheight - this.zoneheight) {
	 y = this.navheight - this.zoneheight;
      }

      // previously used $chk
      if (x || x === 0) {
	 this.zone.style.left = x + 'px';
      }
      // previously used $chk
      if (y || y === 0) {
	 this.zone.style.top = y + 'px';
      }
      //console.log("exit locator.setLocatorZone");

   }, // setLocatorZone

   //--------------------------------------------------------------
   setToolTip: function (text) {

      //console.log("%s setToolTip",this.shortName);
      // we only want 1 toolTip
      if(typeof(this.toolTip === 'undefined')) {
	 this.toolTip = new Element('div', {
	       'id': this.shortName + '-toolTipContainer',
	       'class': 'toolTipContainer'
	       });
	 //this.toolTip.inject($(this.targetId), 'inside');
	 this.toolTip.inject($(this.targetId).parentNode, 'inside');
      }
      $(this.shortName + '-toolTipContainer').set('text', this.toolTipText);
   },

   //--------------------------------------------------------------
   showToolTip: function (show) {

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
      console.log("%s doExpanded:",this.name);
      this.isCollapsed = false;
      var left = $(this.shortName + '-container').getPosition().x + this.navwidth + 10;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }

}); // end of class tiledImageLocatorTool
//----------------------------------------------------------------------------
