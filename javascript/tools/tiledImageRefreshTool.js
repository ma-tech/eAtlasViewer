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
//   tiledImageRefreshTool.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageRefreshTool
//---------------------------------------------------------
var tiledImageRefreshTool = new Class ({

   initialize: function(params) {

      this.view = params.view;
      this.model = params.model;
      this.name = "RefreshTool";
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

      this.model.register(this);
      this.view.register(this);

   }, // initialize

   //---------------------------------------------------------------
   createElements: function () {

      var topEdge = $(this.shortName + '-topedge');
      var win = $(this.shortName + '-win');

      //----------------------------------------
      // the refresh div
      //----------------------------------------
      this.refreshButton = new Element('div', {
         'id': 'refreshButton'
      });

      //----------------------------------------
      // the text button
      //----------------------------------------
      this.refreshTextContainer = new Element('div', {
         'id': 'refreshTextContainer'
      });

      this.refreshTextDiv = new Element('div', {
         'id': 'refreshTextDiv'
      });

      this.refreshTextDiv.appendText('reload image');

      this.refreshTextDiv.inject(this.refreshTextContainer, 'inside');
      this.refreshTextContainer.inject(this.refreshButton, 'inside');
      this.refreshButton.inject(win, 'inside');

      emouseatlas.emap.utilities.addButtonStyle("refreshButton");

      //----------------------------------------
      // add the events
      //----------------------------------------
      this.refreshButton.addEvent('click',function() {
         this.view.refreshImage();
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
