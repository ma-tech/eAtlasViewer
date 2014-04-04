/*
 * Copyright (C) 2011 Medical research Council, UK.
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
//   tiledImageExpressionSectionTool.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImageExpressionSectionTool
//---------------------------------------------------------
//emouseatlas.emap.tiledImageExpressionSectionTool = new Class ({
var tiledImageExpressionSectionTool = new Class ({


   initialize: function(params) {

      //console.log("enter tiledImageExpressionSectionTool.initialize: ",params);
      this.model = params.model;
      this.view = params.view;
      this.sectionName = params.sectionName;
      this.section = params.section;

      this.model.register(this);
      this.view.register(this);

      this.isHorizontal = false;

      this.name = "ExpressionSectionTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");
      this.toolTipText = this.shortName;
      
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);
      this.title = params.params.title;

      //console.log("tiledImageExpressionSectionTool: this.height %s",this.height);

      var imagePath = this.model.getInterfaceImageDir();

      this.targetId = params.params.targetId;

      this.drag = params.params.drag;

      this.window = new DraggableWindow({targetId:this.targetId,
					    drag:this.drag,
					    title:this.name,
					    view:this.view,
					    imagePath: imagePath,
					    initiator:this});
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

      if (this.section !== undefined) {
	var win = $(this.shortName + '-win');

	this.sectionTitle = new Element('div', {
	    'id':'sectionDiv',
						'class':'sectionToolTitleText',
						'text':params.params.title
						});
	
	this.sectionTitle.inject(win, 'inside');
	
	//----------------------------------------
	// div for selection combobox
	//----------------------------------------
	this.sectionContainer = new Element('div');
	this.sectionComboBox = new Element( 'select', {'id':'expressionSection'});
	
	var item=' ';
	for (var i = 0; i < this.sectionName.length; i++)
	  item += '<option value="'+i+'">'+this.sectionName[i]+'</option>';

	this.sectionComboBox.set('html', item);
	this.sectionComboBox.inject(this.sectionContainer, 'inside');
	this.sectionContainer.inject(win, 'inside');
	
	//----------------------------------------
	// add the events
	//----------------------------------------
	this.sectionComboBox.addEvent('mouseup',function() {
					this.setSelection();
				      }.bind(this));
      }

      //-----------------------------------------
      this.window.setDimensions(this.width, this.height);
      this.setToolTip(this.toolTipText);

      this.layerNames = [];

   }, // initialize

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      if(viewChanges.initial === true) {
	 this.window.setVisible(true);
      }
   },

   //---------------------------------------------------------------
   setSelection: function() {
      var index = this.sectionComboBox.selectedIndex;
      if (index !== undefined && 
	  this.sectionName !== undefined &&
	  index < this.sectionName.length ) {
	var pos = this.sectionName[index];
	var vals = {x:this.section[pos].x, y:this.section[pos].y, z:this.section[pos].z};
	this.model.setSection(this.section[pos].x, this.section[pos].y, this.section[pos].z, this.section[pos].phi, this.section[pos].theta, undefined, this.section[pos].dst, "sectiontool");
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
   }

});
