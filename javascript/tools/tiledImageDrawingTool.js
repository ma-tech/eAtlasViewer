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
//   tiledImageDrawingTool.js
//   Tool to drawing on a tiled image from an iip server
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
// tiledImageDrawingTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageDrawingTool = new Class ({
var tiledImageDrawingTool = new Class ({

   initialize: function(params) {

      //console.log("enter tiledImageDrawingTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;
      this.query = params.query;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.emapDraw = undefined;

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "drawControls";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      this.imagePath = this.model.getInterfaceImageDir();
      this.targetId = params.params.targetId;

      var allowClose = (typeof(params.params.allowClose) === 'undefined') ? false : params.params.allowClose;
      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:params.params.drag,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: this.imagePath,
					 allowClose: allowClose,
					 initiator:this});

      var x = parseInt(params.params.x);
      var y = parseInt(params.params.y);
      //console.log("layerTool: x ",x,", ",y);
      this.window.setPosition(x, y);

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

      this.layerNames = [];

      this.availableLineWidths = {
         "0": 1,
         "1": 2,
         "2": 4,
         "3": 8,
         "4": 16,
         "5": 32,
         "6": 64,
      };

      this.createElements();

      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function(modelChanges) {

      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'toolTextContainer_spacer w29'
      });

      var win = $(this.shortName + '-win');
      var topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(topEdge, 'inside');

      this.titleTextContainer = new Element('div', {
         'class': 'toolTextContainer'
      });

      this.titleTextDiv = new Element('div', {
         'class': 'draggable-textDiv'
      });
      this.titleTextDiv.set('text', this.shortName);

      var topEdge = $(this.shortName + '-topedge');

      this.titleTextDiv.inject(this.titleTextContainer, 'inside');
      this.titleTextContainer.inject(topEdge, 'inside');

      //----------------------------------------
      // the drawing toolbox container
      //----------------------------------------
      this.drawingToolBoxDiv = new Element('div', {
	 'id':'drawingToolBoxDiv'
      });

      //----------------------------------------
      // the line controls
      //----------------------------------------
      this.lineControlContainer = new Element('div', {
	 'id': 'lineControlContainer'
      });

      this.lineControlImgDiv = new Element('div', {
	 'id': 'lineControlImgDiv'
      });

      this.lineControlImg = new Element('img', {
	 'id': 'lineControlImg',
	 'src': this.imagePath + "width.png"
      });

      this.lineSelectDiv = new Element('div', {
	 'id': 'lineSelectDiv',
      });

      var lwid
      var options = '';

      lwid = this.availableLineWidths["0"];
      options = options + '<option value="0">'+lwid+'</option>';
      lwid = this.availableLineWidths["1"];
      options = options + '<option value="1">'+lwid+'</option>';
      lwid = this.availableLineWidths["2"];
      options = options + '<option value="2">'+lwid+'</option>';
      lwid = this.availableLineWidths["3"];
      options = options + '<option value="3">'+lwid+'</option>';
      lwid = this.availableLineWidths["4"];
      options = options + '<option value="4">'+lwid+'</option>';
      lwid = this.availableLineWidths["5"];
      options = options + '<option value="5">'+lwid+'</option>';
      lwid = this.availableLineWidths["6"];
      options = options + '<option value="6">'+lwid+'</option>';

      this.lineSelect = new Element('select', {
	 'id': 'lineSelect',
      });

      this.lineSelect.set('html', options);
      this.lineSelect.set('value', '3');

      //----------------------------------------
      // add them to the tool
      //----------------------------------------
      this.lineControlImg.inject(this.lineControlImgDiv, 'inside');
      this.lineControlImgDiv.inject(this.lineControlContainer, 'inside');

      this.lineSelect.inject(this.lineSelectDiv, 'inside');
      this.lineSelectDiv.inject(this.lineControlContainer, 'inside');

      this.lineControlContainer.inject(this.drawingToolBoxDiv, 'inside');
      
      //........................................
      //----------------------------------------
      // the container for undo / redo
      //----------------------------------------
      this.undoRedoContainer = new Element('div', {
	 'id': 'undoRedoContainer'
      });

      this.redoButton = new Element('div', {
	 'id': 'redoButton'
      });

      this.redoImg = new Element('img', {
	 'id': 'redoImg',
	 'src': this.imagePath + "redo2.png"
      });

      this.undoButton = new Element('div', {
	 'id': 'undoButton'
      });

      this.undoImg = new Element('img', {
	 'id': 'undoImg',
	 'src': this.imagePath + "undo2.png"
      });

      this.clearButton = new Element('div', {
	 'id': 'clearButton'
      });

      this.clearImg = new Element('img', {
	 'id': 'clearImg',
	 'src': this.imagePath + "clear2.png"
      });

      this.undoImg.inject(this.undoButton, 'inside');
      this.undoButton.inject(this.undoRedoContainer, 'inside');
      this.redoImg.inject(this.redoButton, 'inside');
      this.redoButton.inject(this.undoRedoContainer, 'inside');
      this.clearImg.inject(this.clearButton, 'inside');
      this.clearButton.inject(this.undoRedoContainer, 'inside');
      this.undoRedoContainer.inject(this.drawingToolBoxDiv, 'inside');

      //----------------------------------------
      // the container for the drawing tools
      //----------------------------------------
      this.drawingToolContainer = new Element('div', {
	 'id': 'drawingToolContainer'
      });

      this.drawRadioLabel = new Element('label', {
	 'id': 'drawRadioLabel',
	 'for': 'draw_mode'
      });
      this.drawRadio = new Element('input', {
	 'id': 'drawRadio',
	 'type': 'radio',
	 'value': 'draw',
	 'name': 'draw_mode',
	 'checked': 'true'
      });
      this.drawRadioImg = new Element('img', {
	 'id': 'drawRadioImg',
	 'src': this.imagePath + "pencil2.png"
      });

      this.eraseRadioLabel = new Element('label', {
	 'id': 'eraseRadioLabel',
	 'for': 'draw_mode'
      });
      this.eraseRadio = new Element('input', {
	 'id': 'eraseRadio',
	 'type': 'radio',
	 'value': 'erase',
	 'name': 'draw_mode'
      });
      this.eraseRadioImg = new Element('img', {
	 'id': 'eraseRadioImg',
	 'src': this.imagePath + "eraser3.png"
      });

      this.drawRadio.inject(this.drawRadioLabel, 'inside');
      this.drawRadioImg.inject(this.drawRadioLabel, 'inside');
      this.drawRadioLabel.inject(this.drawingToolContainer, 'inside');
      this.eraseRadio.inject(this.eraseRadioLabel, 'inside');
      this.eraseRadioImg.inject(this.eraseRadioLabel, 'inside');
      this.eraseRadioLabel.inject(this.drawingToolContainer, 'inside');
      this.drawingToolContainer.inject(this.drawingToolBoxDiv, 'inside');
      this.drawingToolBoxDiv.inject(win, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('undoButton');
      emouseatlas.emap.utilities.addButtonStyle('redoButton');
      emouseatlas.emap.utilities.addButtonStyle('clearButton');

      //----------------------------------------
      // event handlers
      //----------------------------------------
      this.lineSelect.addEvent('change',function(e) {
	 this.doLineSelect(e);
      }.bind(this));

      this.redoImg.addEvent('click',function(e) {
	 this.doClickRedo(e);
      }.bind(this));
      this.undoImg.addEvent('click',function(e) {
	 this.doClickUndo(e);
      }.bind(this));
      this.clearImg.addEvent('click',function() {
	 this.doClickClear();
      }.bind(this));

      this.drawRadio.addEvent('click',function(e) {
	 this.doClickRadio(e);
      }.bind(this));
      this.eraseRadio.addEvent('click',function(e) {
	 this.doClickRadio(e);
      }.bind(this));

   }, // createElements
   
   //---------------------------------------------------------------
   doClosed: function() {
      //console.log("%s doClosed:",this.name);
      this.window.setVisible(false);
      var modes = this.view.getModes();
      this.view.setMode(modes.move.name);
   },

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      var mode;
      var currentLayer;

      currentLayer = this.view.getCurrentLayer();

      if(viewChanges.initial === true) {
	 this.window.setVisible(false);
      }

      if(viewChanges.mode === true) {
	 mode = this.view.getMode();
         if(mode.name === "query" && this.query.getQueryType() === "spatial") {
	    this.window.setVisible(true);
	 } else {
	    this.window.setVisible(false);
	 }
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	}
      }
   }, // viewUpdate

   //---------------------------------------------------------------
   queryUpdate: function(queryChanges) {

      if(queryChanges.spatialSelected === true ||
            queryChanges.spatialImport === true) {
	 this.initDrawMode();
      }

      if(queryChanges.anatomySelected === true) {
	 this.window.setVisible(false);
      }

   }, // queryUpdate

   //---------------------------------------------------------------
   initDrawMode: function() {
      //console.log("initDrawMode:");
      this.window.setVisible(true);
      var params = {
         model: this.model,
	 view: this.view
      }
      if(this.emapDraw === undefined) {
	 this.emapDraw = new emouseatlas.emap.EmapDraw();
	 this.emapDraw.initialise(params);
      }
   }, // initDrawMode

   //---------------------------------------------------------------
   doLineSelect: function(e) {
      //console.log("%s doLineSelect:",this.name);
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }
      this.emapDraw.setPenSize(target, this.emapDraw);
   },

   //---------------------------------------------------------------
   doClickRadio: function(e) {
      //console.log("%s doClickRadio:",this.name);
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === undefined) {
         return false;
      }
      this.emapDraw.setDrawOrErase(target);
   },

   //---------------------------------------------------------------
   doClickRedo: function(e) {
      //console.log("%s doClickRedo:",this.name);
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === $('redoButton') || target === $('redoImg')) {
         this.emapDraw.doRedo();
      }
   },

   //---------------------------------------------------------------
   doClickUndo: function(e) {
      //console.log("%s doClickUndo:",this.name);
      var target = emouseatlas.emap.utilities.getTarget(e);
      if(target === $('undoButton') || target === $('undoImg')) {
         this.emapDraw.doUndo();
      }
   },

   //---------------------------------------------------------------
   doClickClear: function() {
      //console.log("%s doClickClear:",this.name);
      this.emapDraw.setDrawingAction(8);
   },

   //--------------------------------------------------------------
   setToolTip: function (text) {
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
      var containerPos = this.view.getToolContainerPos();
      var left;
      var top;
      //console.log("showToolTip left %s, top %s",left,top);
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
      var left = $(this.shortName + '-container').getPosition().x + this.width + 10;
      var top = $(this.shortName + '-container').getPosition().y - 5;
      var viz = $(this.shortName + '-container').getStyle('visibility');
      $(this.shortName + '-toolTipContainer').setStyles({'left': left, 'top': top, 'visibility': viz});
   },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }.bind(this)

});
