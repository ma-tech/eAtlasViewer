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
//   draggableWindow.js
//   utility class
//   Uses MooTools
//   author Tom Perry
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   none
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
/**
 *   @param target is the element that contains the draggable window.
 *   @param title is the name of the draggable window.
 *   @param view is the tiledImage view.
 *   @param initiator is the Class that initiated this DraggableWindow.
 */
var DraggableWindow = new Class ({

   initialize: function(params) {

      //console.log("enter DraggableWindow.initialize ",title);
      
      this.edgeWidth = 2;
      this.topEdgeWidth = 10;
      this.title = params.title.toLowerCase().split(" ").join("");
      this.collapse = false;
      this.prevEventOver = true;
      this.view = params.view;
      this.initiator = params.initiator;
      this.target = params.targetId;
      this.imagePath = params.imagePath;
      this.allowClose = params.allowClose;

      this.canDrag = (params.drag === undefined) ? false : params.drag;
      if(typeof(params.drag)  === "string") {
          this.canDrag = (params.drag === "true") ? true : false;
      }

      this.borders = (params.borders === undefined) ? true : params.borders;
      if(typeof(params.borders)  === "string") {
          this.borders = (params.borders === "false") ? false : true;
      }
      //console.log("%s borders = %s",this.initiator.name,this.borders);

      this.toRight = (params.toRight === undefined) ? false : params.toRight;
      if(typeof(params.toRight)  === "string") {
          this.toRight = (params.toRight === "true") ? true : false;
      }
      //console.log("%s this.toRight %s",this.initiator.name, this.toRight);

      this.toBottom = (params.toBottom === undefined) ? false : params.toBottom;
      if(typeof(params.toBottom)  === "string") {
          this.toBottom = (params.toBottom === "true") ? true : false;
      }
      //console.log("%s this.toBottom %s",this.initiator.name, this.toBottom);

      this.isTransparent = (params.transparent === undefined) ? false : params.transparent;
      if(typeof(params.transparent)  === "string") {
          this.isTransparent = (params.transparent === "true") ? true : false;
      }
      //console.log("%s transparent %s",this.initiator.name, this.isTransparent);

      this.borders = (params.borders === undefined) ? true : params.borders;
      if(typeof(params.borders)  === "string") {
          this.borders = (params.borders === "false") ? false : true;
      }

      this.hasThinTopEdge = (params.thinTopEdge === undefined) ? false : params.thinTopEdge;
      if(typeof(params.thinTopEdge)  === "string") {
          this.hasThinTopEdge = (params.thinTopEdge === "true") ? true : false;
      }
      if(this.hasThinTopEdge) {
	 this.topEdgeWidth = 2;
      }

      this.view.register(this);

      this.container = new Element( 'div', {
	 'id': this.title + '-container',
	 'class': 'draggable-container'
      });

      this.container.inject($(params.targetId), 'inside');

      this.left = new Element('div', {
	 'id': this.title + '-leftedge',
	 'class': 'edge'
      });

      this.left.inject(this.container, 'inside');

      this.right = new Element('div', {
	 'id': this.title + '-rightedge',
	 'class': 'edge'
      });

      this.right.inject(this.container, 'inside');

      this.top = new Element('div', {
	 'id': this.title + '-topedge',
	 'class': 'edge'
      });

      this.top.inject(this.container, 'inside');

      this.bottom = new Element('div', {
	 'id': this.title + '-bottomedge',
	 'class': 'edge'
      });

      this.bottom.inject(this.container, 'inside');

      this.tlCorner = new Element('div', {
	 'id': this.title + '-tlcorner',
	 'class': 'corner corner-tl'
      }).inject(this.container, 'inside');

      this.trCorner = new Element('div', {
	 'id': this.title + '-trcorner',
	 'class': 'corner corner-tr'
      }).inject(this.container, 'inside');

      var handleClass = (this.canDrag) ? "draggable-handle" : "draggable-handle disabled";
      this.handle = new Element( 'div', {
	 'id': this.title + '-handle',
	 'class': handleClass
      });

      this.handle.inject( this.container , 'inside');

      //this.handle.innerHTML = "<h4>"+title+"</h4>"; //maze: don't display title for border=10px

      //---------------------------------------------------------
      // the collapse button
      //---------------------------------------------------------
      this.collapseButton = new Element('div', {
	 'id': this.title + '-collapsebutton'
      });

      //this.collapseButton.inject( this.handle , 'inside');

      this.collapseButton.addEvent('click', function(event){
	 if ( this.prevEventOver ) {
	    if ( !this.collapsed ) {
	       this.initiator.doCollapsed();
	       this.collapseWindow();
	    } else {
	       this.expandWindow();
	       this.initiator.doExpanded();
	    }
	 }
      }.bind(this)); 

      this.collapseButton.addEvent('mouseover', function(){
	 //this.collapseButton.setStyle('background-color', 'white');
      }.bind(this)); 
      
      this.collapseButton.addEvent('mouseleave', function(){
	 //this.collapseButton.setStyle('background-color', '#676969');
      }.bind(this)); 

      //---------------------------------------------------------
      // the close button
      //---------------------------------------------------------
      this.closeDiv = new Element('div', {
	 'id': this.title + '-closeDiv'
      });

      var close = this.imagePath + "close_10x8.png";
      var close2 = this.imagePath + "close2_10x8.png";

      this.closeImg = new Element( 'img', {
	 'id': 'closeImg',
	 'src': close
      });

      if(this.allowClose === true || this.allowClose === 'true') {
	 this.closeImg.inject( this.handle , 'inside');
      }

      this.closeImg.addEvent('click', function(event){
	 //this.setVisible(false);
	 this.initiator.doClosed();
      }.bind(this)); 

      this.closeImg.addEvent('mouseover', function(){
	 this.closeImg.set('src', close2);
      }.bind(this)); 
      
      this.closeImg.addEvent('mouseleave', function(){
	 this.closeImg.set('src', close);
      }.bind(this)); 
      //---------------------------------------------------------

      //console.log("this.title+'-handle' = %s", this.title+'-handle');
      if(this.canDrag === true) {
         if(this.borders) {
	    this.container.makeDraggable(emouseatlas.emap.utilities.getDragOpts(null,0,this,this.title+'-handle'));
	 } else {
	    this.container.makeDraggable(emouseatlas.emap.utilities.getDragOpts(null,0,this,this.title+'-win'));
	 }
      }

      this.win = new Element( 'div', {
	 'id': this.title + '-win',
	 'class': "draggable-win"
      });

      this.win.inject( this.container , 'inside');

      //console.log("exit DraggableWindow.initialize");

   },  // initialize

   //--------------------------------------------------------------
   // don't let the tools be dragged outside the 'viewport'
   handleDrag: function(done) {
      //console.log("enter DraggableWindow.handleDrag");
      if(done) {
	 var viewport = this.view.getViewportDims();
	 var vpWidth = viewport.width;
	 var vpHeight = viewport.height;

         var x = this.container.offsetLeft;
         var y = this.container.offsetTop;
	 x = (x < 0) ? this.edgeWidth : x;
	 x = (x > vpWidth - this.width) ? (vpWidth - (this.width + (3 * this.edgeWidth))) : x;
	 y = (y < 0) ? this.topEdgeWidth : y;
	 y = (y > vpHeight - this.height) ? (vpHeight - (this.height + (3 * this.edgeWidth))) : y;

	 //console.log("vpw %d, thisW %d, x %d, %d",vpWidth,this.width,x,(x+this.width));
	 this.setPosition(x,y);
	 this.distToEdge = this.calcDistToEdges();
	 this.findClosestEdges();
      }

      //console.log("exit DraggableWindow.handleDrag");
   },

   //--------------------------------------------------------------
   viewUpdate: function(viewChanges) {


      if(viewChanges.viewport === true) {

         //console.log("enter DraggableWindow.viewUpdate viewport ",this.initiator.name);

	 // ----------------------------------------
	 // maintain the closest distance to an edge
	 // ----------------------------------------

	 var dists = this.calcDistToEdges();
	 this.findClosestEdges(dists);
         //console.log("viewUpdate: this.leftClosest %s, this.topClosest %s",this.leftClosest,this.topClosest);
         //console.log("viewUpdate: this.oldLeftClosest %s, this.oldTopClosest %s",this.oldLeftClosest,this.oldTopClosest);

	 var viewport = this.view.getViewportDims();
	 var vpWidth = viewport.width;
	 var vpHeight = viewport.height;

         var x;
         var y;

	 if(this.leftClosest === this.oldLeftClosest) {
	    // if the closest edge hasn't changed OK to adjust position of object to maintain gap.
	    if(this.leftClosest === true) {
	       x = this.distToEdge.left;
	    } else {
	       x = vpWidth - (this.distToEdge.right + this.width);
	    }
	 } else {
	    if(this.oldLeftClosest === false) {
	       // If the right edge has moved to right maintain r gap.
	       x = vpWidth - (this.distToEdge.right + this.width);
	    } else {
	       // Don't move just reset distances
	       this.distToEdge = dists;
	       this.oldLeftClosest = this.leftClosest;
	    }
	 }

	 if(this.topClosest === this.oldTopClosest) {
	    // if the closest edge hasn't changed OK to adjust position of object to maintain gap.
	    if(this.topClosest === true) {
	       y = this.distToEdge.top;
	    } else {
	       y = vpHeight - (this.distToEdge.bottom + this.height);
	    }
	 } else {
	    if(this.oldTopClosest === false) {
	       // If the bottom edge has moved down maintain b gap.
	       y = vpHeight - (this.distToEdge.bottom + this.height);
	    } else {
	       // Don't move just reset distances
	       this.distToEdge = dists;
	       this.oldTopClosest = this.topClosest;
	    }
	 }

	 if(this.canDrag === true) {
	    this.setPosition(x,y);
	 }

         //console.log("exit DraggableWindow.viewUpdate ",this.initiator.name);
      }

   },

   //--------------------------------------------------------------
   setVisible: function(visible) {
      //console.log("enter DraggableWindow.setVisible:",visible);
      if (visible === true) {
	 //this.setDisplay('block');
	 this.container.style.visibility = 'visible';
      } else {
	 //this.setDisplay('none');
	 this.container.style.visibility = 'hidden';
      }
      //console.log("exit DraggableWindow.setVisible:",visible);
   },

   //--------------------------------------------------------------
   getVisibility: function() {
      //console.log("draggableWindow ",this.initiator.name);
      //console.log(this.container.style.visibility);
      return this.container.style.visibility;
   },

   //--------------------------------------------------------------
   setDisplay: function(val) {
      //console.log("enter DraggableWindow.setDisplay:",val);
      this.container.style.display = val;
      //console.log("exit DraggableWindow.setDisplay:",val);
   },

   //--------------------------------------------------------------
   setPosition: function(x,y) {

      // console.log("enter DraggableWindow.setPosition:",this.initiator.name,x,y);
      this.x = x;
      this.y = y;
      
      if(this.toRight) {
         this.container.style.right = this.x + 'px';
      } else {
         this.container.style.left = this.x + 'px';
      }

      if(this.toBottom) {
	 this.container.style.bottom = this.y + 'px';
      } else {
	 this.container.style.top = this.y + 'px';
      }
      //this.applyPosition();
   },

   //--------------------------------------------------------------
   /*
   applyPosition: function() {

      //console.log("enter DraggableWindow.applyPosition");
      var viewport = this.view.getViewportDims();
      //console.log("DraggableWindow.applyPosition viewport.width %s, viewport.height %s",viewport.width,viewport.height);
      if (this.x >= 0) {
	 this.container.style.left = this.x + 'px';
      } else if (this.x < 0) {
	 // Would set style.right here, but this is overridden by MooTools when dragging
	 //this.container.style.left = viewport.width - this.width - 2 * this.edgeWidth + this.x + 'px';
	 this.container.style.right =  (-1)*this.x + 'px';
      }

      if (this.y >= 0) {
	 this.container.style.top = this.y + 'px';
      } else if (this.y < 0) {
	 this.container.style.top = viewport.height - this.height - 2 * this.edgeWidth + this.y + 'px';
      }


      //console.log("exit DraggableWindow.applyPosition");
   },
   */

   //--------------------------------------------------------------
   // this can only be called after setDimensions() as we need this.width etc.
   //--------------------------------------------------------------
   setDraggableStyles: function() {

      this.container.setStyles({
                                'zIndex':'100',
                                'display':'block',
				'width':Math.round(this.width + 2*this.edgeWidth) + 'px',
				'height':Math.round(this.height + this.edgeWidth * 2) + 'px'
			       });

      if(this.borders) {
	 this.left.setStyles({
			      'width':'2px',
			      'height':Math.round(this.height + this.edgeWidth) + 'px',
			      'left':'0px',
			      'top':this.edgeWidth + 'px'
			     });

	 this.right.setStyles({
			       'width':'2px',
			       'height':Math.round(this.height + this.edgeWidth) + 'px',
			       'right':'0px',
			       'top':this.edgeWidth + 'px'
			      });

	 this.top.setStyles({
			     'width':Math.round(this.width + 2*this.edgeWidth - 2*this.topEdgeWidth) + 'px',
			     'height':this.topEdgeWidth + 'px',
			     'left':this.topEdgeWidth + 'px',
			     'top':this.edgeWidth - this.topEdgeWidth + 'px'
			    });

	 this.bottom.setStyles({
				'width':Math.round(this.width) + 'px',
				'height':'2px',
				'left':'2px',
				'bottom':'0px'
			       });

	 var cornerNW = this.imagePath + "corners/NW10.png";
	 this.tlCorner.setStyles({
				  'width':this.topEdgeWidth + 'px',
				  'height':this.topEdgeWidth + 'px',
				  'top':this.edgeWidth - this.topEdgeWidth + 'px',
				  'background-image':'url(' + cornerNW + ')'
				 });

	 var cornerNE = this.imagePath + "corners/NE10.png";
	 this.trCorner.setStyles({
				  'width':this.topEdgeWidth + 'px',
				  'height':this.topEdgeWidth + 'px',
				  'top':this.edgeWidth - this.topEdgeWidth + 'px',
				  'left':this.width + 2*this.edgeWidth - this.topEdgeWidth + 'px',
				  'background-image':'url(' + cornerNE + ')'
				 });

	 var tmpl = (this.width > 34) ? '10px' : '5px';
	 this.collapseButton.setStyles({
					'width':'15px',
					'height':'13px',
					'left':tmpl,
					'top':'4px',
					'position':'absolute',
					'cursor':'pointer',
					'title': 'Click to collapse window'
				       });

	 this.closeDiv.setStyles({
				  'background-color':'676969',
				  'right':'10px',
				  'top':'4px',
				  'position':'absolute',
				  'cursor':'pointer',
				  'title':'Click to close window'
				 });


	 this.closeImg.setStyles({
				  'background-color': '#aaaaaa',
				  'right': '5px',
				  'top': '1px',
				  'position': 'absolute',
				  'cursor': 'pointer',
				  'title': 'Click to close window'
				 });
      } // if borders
                   
      var kurs;
      if(this.canDrag) {
         kurs = 'move';
      } else {
         kurs = 'default';
      }
      this.handle.setStyles({
			     'width':Math.round(this.width + this.edgeWidth * 2) + 'px',
			     'height':Math.round(this.height + this.edgeWidth + this.topEdgeWidth) + 'px',
			     'top':this.edgeWidth - this.topEdgeWidth + 'px',
		             'cursor':kurs
			    });

      var bkg = "white";
      if(this.isTransparent === true) {
	 bkg = "transparent";
      }
      this.win.setStyles({
                          'width':Math.round(this.width) + 'px',
                          'height':Math.round(this.height) + 'px',
	                  'top': this.edgeWidth + 'px',
	                  'left': this.edgeWidth + 'px',
	                  'background': bkg
                         });
   }, // setDraggableStyles

   //--------------------------------------------------------------
   setDimensions: function(wid,hei) {

      //if(this.title === 'treetool') {
      //   console.log("enter DraggableWindow.setDimensions for %s, %d, %d",this.title, wid, hei);
      //}
      //console.log("enter DraggableWindow.setDimensions:",wid,hei);
      this.width = Number(wid);
      this.height = Number(hei);

      this.distToEdge = this.calcDistToEdges();
      //console.log("setDimensions: this.distToEdge ",this.distToEdge);

      // make sure controls are visible if they are initially placed outside the window.
      var viewport = this.view.getViewportDims();
      var vpWidth = viewport.width;
      var vpHeight = viewport.height;
      //console.log("setDimensions: vpHeight %d",vpHeight);

      if(this.distToEdge.left < 0) {
	 //console.log("setDimensions: l < 0");
         this.distToEdge.left = 2*this.edgeWidth;
	 this.distToEdge.right = parseInt(viewport.width - (this.width + 2*this.edgeWidth));
      }
      if(this.distToEdge.left > (viewport.width-(this.width+2*this.edgeWidth))) {
	 //console.log("setDimensions: r > width");
         this.distToEdge.left = parseInt(viewport.width - (this.width + 2*this.edgeWidth));
	 this.distToEdge.right = 2*this.edgeWidth;
      }

      if(this.distToEdge.top < 0) {
	 //console.log("setDimensions: t < 0");
         this.distToEdge.top = 2*this.edgeWidth;
	 this.distToEdge.bottom = parseInt(viewport.height - (this.height + 2*this.edgeWidth));
      }
      if(this.distToEdge.top > (viewport.height-(this.height+2*this.edgeWidth))) {
	 //console.log("setDimensions: b > height");
         this.distToEdge.top = parseInt(viewport.height - (this.height + 2*this.edgeWidth));
	 this.distToEdge.bottom = this.topEdgeWidth;
      }

      if(this.canDrag) {
	 this.setPosition(this.distToEdge.left, this.distToEdge.top);
	 this.calcDistToEdges();
	 this.findClosestEdges();
      }

      this.setDraggableStyles();
      //console.log("exit DraggableWindow.setDimensions for ",this.title);

   },

   //--------------------------------------------------------------
   getDimensions: function() {
      return {w:this.width, h:this.height};
   },

   //--------------------------------------------------------------
   // this can only be called after setDimensions() as we need this.width etc.
   //--------------------------------------------------------------
   calcDistToEdges: function() {
      //console.log("enter calcDistToEdges ",this.initiator.name);
      var viewport = this.view.getViewportDims();
      var vpWidth = viewport.width;
      var vpHeight = viewport.height;

      var l = parseInt(this.container.style.left);
      var r = vpWidth - (l + this.width);
      var t = parseInt(this.container.style.top);
      var b = vpHeight - (t + this.height);

      //console.log("calcDistToEdges: vpWidth %d, w %d, l %d, r %d",vpWidth,this.width,l,r);
      //console.log("exit calcDistToEdges ",this.initiator.name);
      return {left:l, right:r, top:t, bottom:b};

   /*
      if(this.initiator.name.toLowerCase() === "treetool") {
         console.log(this.initiator.name);
	 var bottomOfTree = this.container.getCoordinates(window).bottom;
	 var bottomOfWindow = window.getSize().y;
	 console.log("gap %d",bottomOfWindow-bottomOfTree);
      }
      var windowSize = window.getSize();
      var containerCoords = this.container.getCoordinates(window);
      var gapL = containerCoords.left;
      var gapR = windowSize.x - containerCoords.right;
      var gapT = containerCoords.top;
      var gapB = windowSize.y - containerCoords.bottom;

      if(this.initiator.name.toLowerCase() === "treetool") {
	 console.log("containerCoords ",containerCoords);
	 console.log("windowSize ",windowSize);
	 console.log("L %d, R %d, T %d, B %d",gapL,gapR,gapT,gapB);
      }

      return {left:gapL, right:gapR, top:gapT, bottom:gapB};
      */
   },

   //--------------------------------------------------------------
   findClosestEdges: function(d2e) {

      //console.log("enter findClosestEdges ",this.initiator.name);
      //console.log("d2e ",d2e)

      var dists = (typeof(d2e) === 'undefined') ? this.distToEdge : d2e;

      if(typeof(this.oldLeftClosest) !== 'undefined') {
         this.oldLeftClosest = this.leftClosest;
      }
      if(typeof(this.oldTopClosest) !== 'undefined') {
         this.oldTopClosest = this.topClosest;
      }

      this.leftClosest = (dists.left <= dists.right) ? true : false;
      this.topClosest = (dists.top <= dists.bottom) ? true : false;

      if(typeof(this.oldLeftClosest) === 'undefined') {
         this.oldLeftClosest = this.leftClosest;
      }
      if(typeof(this.oldTopClosest) === 'undefined') {
         this.oldTopClosest = this.topClosest;
      }

      //console.log("findClosestEdges: this.leftClosest %s",this.leftClosest);
      //console.log("exit findClosestEdges ",this.initiator.name);
   },

   //console.log("enter DraggableWindow.setDimensions:",wid,hei);
   //--------------------------------------------------------------
   /*
   * Author: Maze 1 April 2009
   * add collapse and expand functionality to window
   */
   collapseWindow: function(){

      //console.log("enter DraggableWindow.collapseWindow");
      this.prevEventOver = false;
      this.collapsed = true;

      this.expandWidth = this.win.getWidth();
      this.expandHeight = this.left.getHeight();
      var collapseWidth = 30;
      var collapseWidth2 = 36;
      var collapseWidth3 = 16;
      var collapseHeight = 0;
      var collapseHeight2 = 5;
      var collapseHeight3 = 16;

      //all components inside window disappear first
      var children = this.win.getChildren();
      //children.setStyle('opacity', '0');

      this.container.set('morph', { onComplete:function(){ this.prevEventOver = true; }.bind(this) }); //remove onComplete function for expand

      this.container.morph({height: collapseHeight2, width: collapseWidth2});
      this.win.morph({height:collapseHeight, width:collapseWidth}); //background morphs as well
      this.handle.morph({height: collapseHeight3, width: collapseWidth2});
      this.left.morph({height: collapseHeight});
      this.right.morph({height: collapseHeight});
      this.top.morph({width: collapseWidth3});
      this.bottom.morph({width: collapseWidth2 - 4});
      //console.log("exit DraggableWindow.collapseWindow");
   },

   //--------------------------------------------------------------
   setCollapsed: function(enabled) {

      //console.log("enter DraggableWindow.setCollapsed",enabled);
      if(enabled==true) {
	 this.collapseWindow();
      } else {
	 this.expandWindow();
      }
      //console.log("exit DraggableWindow.setCollapsed",enabled);
   },

   //--------------------------------------------------------------
   expandWindow: function(){

      //console.log("enter DraggableWindow.expandWindow this.expandWidth ",this.expandWidth,", this.expandHeight ",this.expandHeight);
      this.prevEventOver = false;
      this.collapsed = false;

      //attach fully expanded event listener to container element
      this.container.set('morph', { onComplete:function(){ this.showChildren(); }.bind(this) });

      this.container.morph({height: Math.round(this.height + this.edgeWidth * 2), width: Math.round(this.width + 2*this.edgeWidth)});
      this.win.morph({height: Math.round(this.height), width: Math.round(this.width)});
      this.handle.morph({height:this.expandHeight, width: this.expandWidth});
      this.left.morph({height:this.expandHeight});
      this.right.morph({height:this.expandHeight});
      this.top.morph({width: Math.round(this.width + 2*this.edgeWidth - 2*this.topEdgeWidth)});
      this.bottom.morph({ width:this.expandWidth});
      //console.log("exit DraggableWindow.expandWindow");
   },

   //--------------------------------------------------------------
   showChildren: function(){ //only show children after window has fully expanded

      //console.log("enter DraggableWindow.showChildren:");
      this.win.getChildren().each( function(el){
	 var fadeIn = new Fx.Morph(el, {
	    duration:1000,
	    onComplete: function(){
	       this.prevEventOver = true;
	    }.bind(this)
	 });
	 fadeIn.start({opacity : 1});
      }.bind(this) );
      //console.log("exit DraggableWindow.showChildren:");
   }
   // end of maze code

}); // end of class DraggableWindow
//----------------------------------------------------------------------------
