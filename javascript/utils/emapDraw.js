//---------------------------------------------------------
//   emapDraw.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   may use MooTools
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
// function EmapDraw, can be instantiated with the 'new' keyword
//---------------------------------------------------------
emouseatlas.emap.EmapDraw = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   // private members
   var view;
   var model;
   var query;
   var drawingCanvas;
   var drawingContext;
   var scale;
   //var lastScale;
   var strokeStyle;
   var compositeTypes;
   //var screenPath;
   //var sectionPath;
   var pathx;
   var pathy;
   var viewport;
   var imgDims;
   var viewable;
   //var viewerContainerPos;
   //var ofs;
   
   // from CanvasPainter
   //....................
   var canvasWidth;
   var canvasHeight;

   var startPos;
   var curPos;

   var curDrawMode; // if drawing, false if erasing

   var drawColor;
   var eraseColor;

   var drawCompOp;
   var eraseCompOp;

   var drawActions;
   var curDrawAction;
   var lastDrawAction;
   var selectedDrawAction;
   var selectedDrawMode;

   var vscroll;

   var curLineWidth;
   var selectedLineWidth;
   var availableWidths;

   var mouseIsDown;

   var drawing;
   var undoNodes;

   var querySectionChanged;
   var isInitialised = false;

   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

     //Draw Functions
     var drawPath = function(X, Y, context) {
       //console.log("drawPath");
       var len = X.length;
       if(len <= 0) return;
       context.save();
       context.beginPath();
       context.lineCap = "round";
       context.moveTo(X[0] * scale, Y[0] * scale);
       for(var i=1; i<len; i++) {
          context.lineTo(X[i] * scale, Y[i] * scale);
       }
       setStrokeStyle(drawColor);
       context.stroke();
       context.restore();
     };
         
     //---------------------------------------------------------
     var drawPencil = function(pntFrom, pntTo, context) {
      //console.log("drawPencil");
      if(isNaN(pntFrom) || isNaN(pntTo)) {
         return false;
      }
      context.save();
      context.beginPath();
      context.lineCap = "round";
      context.moveTo(pntFrom.x,pntFrom.y);
      context.lineTo(pntTo.x,pntTo.y);
      context.stroke();
      //context.closePath();
      context.restore();
     };
  
     //---------------------------------------------------------
     var drawLine = function(pntFrom, pntTo, context) {
       context.beginPath();
       context.moveTo(pntFrom.x,pntFrom.y);
       context.lineTo(pntTo.x,pntTo.y);
       context.stroke();
       //context.closePath();
     };
  
     //---------------------------------------------------------
     var drawRectangle = function(pntFrom, pntTo, context) {
      context.fillRect(pntFrom.x, pntFrom.y, pntTo.x - pntFrom.x, pntTo.y - pntFrom.y);
     };
  
     //---------------------------------------------------------
     var drawCircle = function (pntFrom, pntTo, context) {
      var centerX = Math.max(pntFrom.x,pntTo.x) - Math.abs(pntFrom.x - pntTo.x)/2;
      var centerY = Math.max(pntFrom.y,pntTo.y) - Math.abs(pntFrom.y - pntTo.y)/2;
      context.beginPath();
      var distance = Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
      context.arc(centerX, centerY, distance/2,0,Math.PI*2 ,true);
      context.fill();
      //context.closePath();
     };
  
     //---------------------------------------------------------
     var clearDrawingCanvas = function(from) {
       //console.log("clearDrawingCanvas from %s",from);
       drawingContext.clearRect(0,0,drawingCanvas.width,drawingCanvas.height);
     };

     //---------------------------------------------------------
     var clearDrawing = function(from) {
       //console.log("clearDrawing from %s",from);
       clearDrawingCanvas("clearDrawing");
       drawing.splice(0,drawing.length);
       undoNodes.splice(0,undoNodes.length);
     };
  
     //---------------------------------------------------------
     var setLineWidth =  function(w) {
        drawingContext.lineWidth = w;
     };
  
     //---------------------------------------------------------
     var setDrawMode =  function(mode) {
       if(mode) {
          //console.log("setDrawMode draw");
          setColor(drawColor);
          setGlobalCompositeOperation();
       } else {
          //console.log("setDrawMode erase");
          setColor(eraseColor);
          setGlobalCompositeOperation();
       }
     };
  
     //---------------------------------------------------------
     var setColor =  function(col) {
       //console.log("setColor ",col);
       setStrokeStyle(col);
       setFillStyle(col);
     };
  
     //---------------------------------------------------------
     var setStrokeStyle = function(col) {
        drawingContext.strokeStyle = col;
      };
  
     //---------------------------------------------------------
     var setFillStyle = function(col) {
        drawingContext.fillStyle = col;
     };
  
     //---------------------------------------------------------
     var setGlobalCompositeOperation = function() {
        //console.log("setGlobalCompositeOperation curDrawMode ",curDrawMode);
        if(curDrawMode) {
           drawingContext.globalCompositeOperation = drawCompOp;
        } else {
           drawingContext.globalCompositeOperation = eraseCompOp;
        }
     };
  
     //-------------------------------------------------------------------
     // called from select control event handler
     var setPenSize = function(sel) {
        var indx = sel.selectedIndex;
	curLineWidth = availableWidths[indx];
	selectedLineWidth = curLineWidth;
        setLineWidth(curLineWidth);
     };
  
     //-------------------------------------------------------------------
     // called from radio button event handler
     var setDrawOrErase = function(radio) {
        if(radio == document.getElementById("drawRadio")) {
           if(radio.checked) {
     	      curDrawMode = true;
     	      curDrawAction = 0;
           }
        }  else if(radio == document.getElementById("eraseRadio")) {
           if(radio.checked) {
     	      curDrawMode = false;
     	      curDrawAction = 0;
           }
        }
	selectedDrawMode = curDrawMode;
        setDrawMode(curDrawMode);
     };

     //----------------------------------------------------------
     var setDrawingAction = function(action) {
        //console.log("setDrawingAction curDrawAction ",curDrawAction);
	if(curDrawAction === undefined) {
	   lastDrawAction = action;
	} else {
	   lastDrawAction = curDrawAction;
	}
        curDrawAction = action;

	if(curDrawAction === 8) {
	   recordDrawingAction();
	   curDrawAction = lastDrawAction;
	   clearDrawingCanvas("setDrawingAction");
	}
	//console.log("lastDrawAction %d, currentDrawAction %d",lastDrawAction,curDrawAction);
	selectedDrawAction = curDrawAction;
     };
  	
     //----------------------------------------------------------
     var getDistance = function(pntFrom, pntTo) {
        return Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
     };
  
     //----------------------------------------------------------

     //---------------------------------------------------------
     // This is called on mouseMove and mouseUp events and when clear button is pressed
     // The recorded drawing is at 1:1 scale
     var recordDrawingAction = function() {

	//console.log("curDrawAction ",curDrawAction);
        if(drawing.length == 0 && pathx.length == 0) {
           if(curDrawAction == 0) {
	      if(startPos) {
                 pathx[0] = startPos.x / scale; 
                 pathy[0] = startPos.y / scale; 
	      }
           } else {
              drawing.push(addNode());
              //printDrawingNodes(drawing, "drawing after addNode");
           }
        } else {
	   if(mouseIsDown) { // only for pencil
	      if(pathx.length == 0) {
		 pathx[0] = startPos.x / scale;
		 pathy[0] = startPos.y / scale;
	      } else {
		 pathx[pathx.length] = curPos.x / scale;
		 pathy[pathy.length] = curPos.y / scale;
	      }
	   } else {
	      // mouse up
	      if(curDrawAction == 0) {
		 if(pathx.length > 0) {
		    var node = addNode();
		    drawing.push(node);
                    //printDrawingNodes(drawing, "drawing after addNode");
		    pathx = [];
		    pathy = [];
		 }
	      } else {
	         //console.log("curDrawAction ",curDrawAction);
		 drawing.push(addNode());
	      }
	   }
        }
     };
  
     //---------------------------------------------------------
     var addNode = function() {
       //console.log("addNode");
       var drawingNode = {};
       var x;
       var y;
       var w;
       drawingNode.p = new Array(2);  //points array
       x = startPos.x / scale;
       y = startPos.y / scale;
       drawingNode.p[0] = {x:x, y:y};
       x = curPos.x / scale;
       y = curPos.y / scale;
       drawingNode.p[1] = {x:x, y:y};
       drawingNode.a = curDrawAction; //action
       drawingNode.m = curDrawMode; // draw, erase
       w = curLineWidth / scale;
       drawingNode.w = w; //width
       drawingNode.x = pathx;
       drawingNode.y = pathy;
       return drawingNode;
     };
  	
     //---------------------------------------------------------
     // implements the undo function
     //---------------------------------------------------------
     var removeLastNode = function() {
       //console.log("removeLastNode");
       if(drawing.length == 0) {
          //console.log("removeLastNode returning");
          return;
       }
       undoNodes.push(drawing.pop());
       //printDrawingNodes(drawing, "drawing after undo");
       paintDrawing();
     };
  	
     //---------------------------------------------------------
     // implements the redo function
     //---------------------------------------------------------
     var addLastRemovedNode = function() {
       //console.log("addLastRemovedNode ",undoNodes);
       if(undoNodes.length === 0) {
          //console.log("addLastRemovedNode  returning");
          return;
       }
       drawing.push(undoNodes.pop());
       //printDrawingNodes(drawing, "drawing after redo");
       //console.log(getDrawing());
       paintDrawing();
     };

     //-----------------------------------------------------
     // called from undo button event handler
     var doUndo = function() {
        //console.log("undo");
        removeLastNode();
     };
  
     //-----------------------------------------------------
     // called from redo button event handler
     var doRedo = function() {
        //console.log("redo");
        addLastRemovedNode();
     };
  
     //-----------------------------------------------------
     var paintDrawing = function() {	

       //console.log("enter paintDrawing");
       //printDrawingNodes(drawing, "paintDrawing");

       clearDrawingCanvas("paintDrawing");
       var lineWidth;
       var drawingNode;
       var len;
       var len2;
       var i;
       var n;

       len = drawing.length;
       //console.log(getDrawing());
       for(i = 0; i < len; i++) {
          drawingNode = drawing[i];
	  //console.log("painting ----- action %s, mode %s",drawingNode.a, drawingNode.m);
	  curLineWidth = drawingNode.w * scale;
          setLineWidth(curLineWidth);
          curDrawMode = drawingNode.m;
          setDrawMode(curDrawMode);
     
          if(drawingNode.a === 0) {
             drawPath(drawingNode.x, drawingNode.y, drawingContext, false);
          }  else {
             len2 = drawingNode.p.length - 1;
             for(n = 0; n < len2; n++) {
                drawActions[drawingNode.a](drawingNode.p[n], drawingNode.p[n+1], drawingContext, false);
             }
          }
       }
       setSelectedSettings();
       //console.log("exit paintDrawing");
     };
  
     //-----------------------------------------------------
     var setSelectedSettings = function() {	
	curLineWidth = selectedLineWidth;
        setLineWidth(curLineWidth);
	curDrawMode = selectedDrawMode;
        setDrawMode(curDrawMode);
	curDrawAction = selectedDrawAction;
        setDrawingAction(curDrawAction);
     };

     //-----------------------------------------------------
     var getCircleCentre = function(p1, p2) {
        var cent = [];
        var x = Math.max(p1.x,p2.x) - Math.abs(p1.x - p2.x)/2;	 
        var y = Math.max(p1.y,p2.y) - Math.abs(p1.y - p2.y)/2;
        cent[0] = Math.floor(x);
        cent[1] = Math.floor(y);
        return cent;
     };
  
     //---------------------------------------------------------
     var getCircleRadius = function(p1, p2) {
        var rad = (Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)))/2.0;
        return Math.floor(rad);
     };

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------

   var initialise = function (params) {
      view = params.view;
      view.register(this);
      model = params.model;
      model.register(this);
      query = emouseatlas.emap.tiledImageQuery;
      query.register(this);
      curDrawMode = true;
      curDrawAction = 0;
      scale = view.getScale().cur;
      //lastScale = scale;
      selectedDrawMode = curDrawMode;
      selectedDrawAction = curDrawAction;
      availableWidths = [1,2,4,8,16,32,64];
      curLineWidth = availableWidths[3];
      selectedLineWidth = curLineWidth;
      drawColor = "rgba(255,0,255,1.0)";
      eraseColor = "rgba(255,255,255,1.0)";
      compositeTypes = [
         'source-over','source-in','source-out','source-atop',
         'destination-over','destination-in','destination-out','destination-atop',
         'lighter','darker','copy','xor'
      ];
      drawActions = [drawPencil, drawPencil, drawLine, drawLine, drawRectangle, drawRectangle, drawCircle, drawCircle, clearDrawingCanvas];
      drawCompOp = compositeTypes[0];
      eraseCompOp = compositeTypes[6];
      //view.popDrawingCanvas();
      addCanvas("initialise");
      setDrawMode(curDrawMode);
      setLineWidth(curLineWidth);
      drawing = [];
      undoNodes = [];
      pathx = [];
      pathy = [];
      querySectionChanged = false;
      isInitialised = true;
      //console.log("emapDraw initialised");
   };

   //---------------------------------------------------------------
   var addCanvas = function(from) {
      //console.log("addCanvas from %s",from);

      var layerDiv;
      var fullImgDims;
      var imgFits;
      var viewable;

      layerDiv = $('grey_tileFrame');
      if(!layerDiv) {
         return false;
      }

      fullImgDims = model.getFullImgDims();
      //scale = view.getScale().cur;
      //console.log("addCanvas: scale %d, imgW %d", scale,fullImgDims.width);

      imgFits = view.getImgFit();
      //console.log("addCanvas: imgFits ", imgFits);

      viewable = view.getViewableDims();
      //console.log("addCanvas: viewable W %d, viewable H %d", viewable.width,viewable.height);

      canvasWidth = (imgFits.xfits) ? viewable.width : fullImgDims.width * scale;
      canvasHeight = (imgFits.yfits) ? viewable.height : fullImgDims.height * scale;
      //console.log("addCanvas: W %d, H %d", canvasWidth,canvasWidth);
      
      drawingCanvas = new Element('canvas', {
            'id': 'drawingCanvas',
            'class': 'drawing',
	    'width': canvasWidth + 'px',
	    'height': canvasHeight + 'px'
         });
      drawingCanvas.inject(layerDiv, 'inside');
      drawingCanvas.setStyle('visibility', 'visible');
      if (drawingCanvas.getContext('2d')){
         drawingContext = drawingCanvas.getContext('2d');
	 drawingContext.lineWidth = "10";
	 drawingContext.lineCap = "round";
	 drawingContext.lineJoin = "round";
      }

   };

   /*
   //---------------------------------------------------------------
   var removeCanvas = function(from) {
      //console.log("removeCanvas from %s",from);

      var canvas;
      var layerDiv;
      var fullImgDims;
      var imgFits;
      var viewable;

      layerDiv = $('grey_tileFrame');
      if(!layerDiv) {
         return false;
      }

      canvas = $('drawingCanvas');
      //console.log("canvas ",canvas);

   };
   */

   //---------------------------------------------------------
   var modelUpdate = function (changes) {

      var fullImgDims;
      var fullWlzObj;
      var imgFits;
      var viewable;
      var copy;
      var names;
      var curName;
      var curSection;
      var data;
      var len;
      var i;

      //......................
      if(changes.dst && !querySectionChanged) {
	 //console.log("view changes.viewport");
	 clearDrawingCanvas("modelUpdate dst");
	 view.popDrawingCanvas();
         addCanvas("changes.viewport");
         setDrawMode(curDrawMode);
	 clearDrawing("changes.viewport && !querySectionChanged");
	 paintDrawing();
      }

      //.........................
      // If section has changed due to user selection
      // we need to re-size the canvas
      // after the new section has loaded.
      //.........................
      if(changes.setSection) {
	 //console.log("view changes.setSection");
	 clearDrawingCanvas("modelUpdate set section");
	 view.popDrawingCanvas();
         addCanvas("changes.viewport");
         setDrawMode(curDrawMode);
	 paintDrawing();
	 querySectionChanged = false;
      }

      //.........................
      // If section has changed due to distance or rotation change,
      // we need to clear the drawing, but if it has changed due to
      // clicking an item in the section chooser don't clear the drawing.
      //.........................
      if(changes.sectionChanged) {
	 //console.log("view changes.sectionChanged");
	 clearDrawingCanvas("modelUpdate sectionChanged");
	 view.popDrawingCanvas();
         addCanvas("changes.viewport");
         setDrawMode(curDrawMode);
         curSection = model.getCurrentSection();
         if(isSelectedQuerySection(curSection)) {
            //console.log("IT'S A QUERY SECTION");
         } else {
	    clearDrawing("changes.viewport && !querySectionChanged");
         }
	 paintDrawing();
	 querySectionChanged = false;
      }

   };

   //---------------------------------------------------------
   var viewUpdate = function (changes) {

      var previousSectionParams;

      if(changes.startDrawing) {

         //console.log("startDrawing");
         //console.log("drawingContext ",drawingContext);

	 mouseIsDown = true;

	 startPos = view.getDrawOrigin();
         //console.log("startPos ",startPos);

         if (drawingContext){
	    drawingContext.beginPath();
	    drawingContext.moveTo(startPos.x, startPos.y);
	 }
      }

      //......................
      if(changes.draw) {

         //console.log("draw");

	 curPos = view.getDrawPoint();
         //console.log("curPos ",curPos);

	 if(curPos === undefined || curPos === null) {
            //console.log("viewUpdate: draw, returning");
	    return false;
	 }

         if (drawingContext){
	    drawingContext.lineTo(curPos.x, curPos.y);
	    drawingContext.stroke();
	    recordDrawingAction();
         }
      }

      //......................
      if(changes.endDrawing) {

         //console.log("endDrawing");

	 mouseIsDown = false;
	 recordDrawingAction();
	 //console.log(drawing);
	 query.saveDrawingOnSection();
      }

      //......................
      if(changes.scale) {
         //console.log("view changes.scale");
	 //lastScale = scale;
	 scale = view.getScale().cur;
	 //printDrawingInfo();
	 view.popDrawingCanvas();
         addCanvas("changes.scale || changes.mode");
         setDrawMode(curDrawMode);
	 paintDrawing();
      }

      //......................
      if(changes.mode) {
         //console.log("view changes.mode");
	 /*
	 //lastScale = scale;
	 scale = view.getScale().cur;
	 //printDrawingInfo();
	 view.popDrawingCanvas();
         addCanvas("changes.scale || changes.mode");
         setDrawMode(curDrawMode);
	 paintDrawing();
	 */
      }

      //.........................
      // If viewport changes
      // we need to re-draw any painting.
      //.........................
      if(changes.viewport && !querySectionChanged) {
	 //console.log("view changes.viewport");
	 clearDrawingCanvas();
	 view.popDrawingCanvas();
         addCanvas("changes.viewport");
         setDrawMode(curDrawMode);
	 paintDrawing();
      }

   };

   //---------------------------------------------------------
   var queryUpdate = function (changes) {

      //......................
      if(changes.saveQuerySection) {
         //console.log("model saveQuerySection");
	 copy = copyDrawing(drawing);
         //console.log("query saveQuerySection copy ",copy);
	 query.setQuerySectionData(copy);
      }

      //.........................
      // Section change due to user selection
      //......................
      if(changes.changeQuerySection) {
         //console.log("model changeQuerySection");
	 querySectionChanged = true;
	 names = query.getAllQuerySectionNames();
	 curName = query.getQuerySectionName();
         //console.log("changes.changeQuerySection current name %s", curName);
	 len = names.length;
	 i;
	 for(i=0; i<len; i++) {
            //console.log("name %s", names[i]);
	    if(names[i] === curName) {
	       break;
	    }
	 }
	 data = query.getQuerySectionData(names[i]);
	 copy = copyDrawing(data.drg);
	 drawing = copy;
	 //console.log(copy);
	 querySectionChanged = true;
      }
   };

   //---------------------------------------------------------
   // utility methods
   //---------------------------------------------------------

   // returns true if the section we have now changed to is the current selected query section.
   //
   var isSelectedQuerySection = function (testSection) {

      var querySection;
      var selectedQuerySectionName;
      var sectionNames;
      var name;
      var numSections;
      var i;

      sectionNames = query.getAllQuerySectionNames();
      selectedQuerySectionName = query.getQuerySectionName();
      numSections = sectionNames.length;

      for(i=0; i<numSections; i++) {
         name = sectionNames[i];
         querySection = query.getQuerySectionAtIndex(i);
         //console.log("isExistingQuerySection: querySection ",querySection);
         if(emouseatlas.emap.utilities.isSameSection(testSection, querySection)) {
            if(name === selectedQuerySectionName) {
               return true;
            } else {
               //console.log("query section exists but isn't the selected one");
            }
         }
      }

      return false;
   };

   //---------------------------------------------------------
   var copyDrawing = function (drg) {

      var theCopy = [];
      var len = drg.length;
      var i;

      if(len <= 0) {
         //console.log("zero length drawing");
         return theCopy;
      } else {
         //console.log("length of drawing: %d",len);
      }

      for(i=0; i<len; i++) {
         theCopy[theCopy.length] = copyDrawingNode(drg[i]);
      }

      return theCopy;
   };

   //---------------------------------------------------------
   var copyDrawingNode = function (node) {

      var theCopy = {};
      var len;
      var i;

      theCopy.p = [];
      theCopy.p[0] = node.p[0];
      theCopy.p[1] = node.p[1];

      theCopy.a = node.a;
      theCopy.m = node.m;
      theCopy.w = node.w;

      theCopy.x = [];
      theCopy.y = [];
      len = node.x.length;
      for(i=0; i<len; i++) {
         theCopy.x[i] = node.x[i];
         theCopy.y[i] = node.y[i];
      }

      return theCopy;
   };

   //---------------------------------------------------------
   var printDrawingNodes = function (arr, msg) {

      if(arr === undefined || arr === null) {
         return false;
      }

      var len = arr.length;
      var i;
      var action;
      var mode;
      var scl;

      console.log(msg);

      for(i=0; i<len; i++) {
         action = arr[i].a;
         mode = arr[i].m;
         //console.log("node %d action %s, mode %s",i,action,mode);
         console.log(arr[i]);
      }

   };

   //---------------------------------------------------------
   var printDrawingInfo = function () {

      var fullImgDims = model.getFullImgDims();
      var lastNode;
      var lastPoint;

      console.log("img %d, %d scale %d, ",fullImgDims.width,fullImgDims.height,scale);

      if(drawing === undefined || drawing === null || drawing.length === 0) {
         return false;
      }
      lastNode = drawing[drawing.length - 1];

      if(lastNode === undefined || lastNode === null) {
         return false;
      }
      lastPoint = lastNode.p[1];

      console.log("last point %d, %d",lastPoint.x,lastPoint.y);

   };

   //---------------------------------------------------------
   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      viewUpdate: viewUpdate,
      modelUpdate: modelUpdate,
      queryUpdate: queryUpdate,
      setDrawOrErase: setDrawOrErase,
      setPenSize: setPenSize,
      clearDrawingCanvas: clearDrawingCanvas,
      setDrawingAction: setDrawingAction,
      doUndo: doUndo,
      doRedo: doRedo
   };

}; // end of function EmapSpatialQuery
//----------------------------------------------------------------------------
