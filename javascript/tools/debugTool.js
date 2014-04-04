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
//   debugTool.js
//   Tool to debug 2D/3D coordinate issues.
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
//---------------------------------------------------------
var debugTool = new Class ({

   initialize: function(params) {

      //console.log("enter debugTool.initialize: ",params);
      //this.model = params.model;
      //this.view = params.view;
      this.model = emouseatlas.emap.tiledImageModel;
      this.view = emouseatlas.emap.tiledImageView;
      this.query = emouseatlas.emap.tiledImageQuery;

      this.model.register(this);
      this.view.register(this);
      this.query.register(this);

      this.isHorizontal = (typeof(params.params.isHorizontal) === 'undefined') ? true : params.params.isHorizontal;

      this.name = "debugTool";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      // we are reading in the params from a json file so they will be strings.
      this.width = parseInt(params.params.width);
      this.height = parseInt(params.params.height);

      var imagePath = this.model.getInterfaceImageDir();
       
      var isWlz = this.model.isWlzData();

      this.targetId = params.params.targetId;

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:params.params.drag,
					 thinTopEdge:params.params.thinTopEdge,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: imagePath,
					 initiator:this});

      var x = parseInt(params.params.x);
      var y = parseInt(params.params.y);


      this.transformedBoundingBoxOrig;
      this.transformedBoundingBoxExt;
      this.threeDInfo;
      //this.getTransformedBoundingBox();
      this.createElements();
      //----------------------------------------
      this.window.setPosition(x, y);
      this.window.setDimensions(this.width, this.height);

   },

   //---------------------------------------------------------
   createElements: function() {

      //console.log("debugTool createElements");

      var win = $(this.shortName + '-win');
      // make sure existing elements are removed.
      // or they will appear multiple times
      emouseatlas.emap.utilities.removeChildNodes(win);

      //.................................................
      // spacer to move feedback text away from left edge
      //.................................................
      this.spacer = new Element('div', {
         'class': 'sliderTextContainer_spacer5'
      });

      this.topEdge = $(this.shortName + '-topedge');
      this.spacer.inject(this.topEdge, 'inside');

      this.sliderTextContainer = new Element('div', {
         'class': 'sliderTextContainer'
      });

      this.sliderTextDiv = new Element('div', {
         'class': 'sliderTextDiv'
      });
      emouseatlas.emap.utilities.removeChildNodes(this.sliderTextDiv);
      this.sliderTextDiv.set('text', 'Debug Info');

      this.sliderTextDiv.inject(this.sliderTextContainer, 'inside');
      this.sliderTextContainer.inject(this.topEdge, 'inside');

      //----------------------------------------
      // containers for the debug items
      //----------------------------------------

      var browser_div;
      var browser_label;
      var browser_val_div;
      var browser_x_div;
      var browser_x_label;
      this.browser_x_val;
      var browser_y_div;
      var browser_y_label;
      this.browser_y_val;
      //-------------------------
      var Viewport_div;
      var viewer_label;
      var viewer_val_div;
      var viewer_x_div;
      var viewer_x_label;
      this.viewer_x_val;
      var viewer_y_div;
      var viewer_y_label;
      this.viewer_y_val;
      //-------------------------
      var image_div;
      var image_label;
      var image_val_div;
      var image_x_div;
      var image_x_label;
      this.image_x_val;
      var image_y_div;
      var image_y_label;
      this.image_y_val;
      //-------------------------
      var wlz3d_div;
      var wlz3d_label;
      var wlz3d_val_div;
      var wlz3d_x_div;
      var wlz3d_x_label;
      this.wlz3d_x_val;
      var wlz3d_y_div;
      var wlz3d_y_label;
      this.wlz3d_y_val;
      var wlz3d_z_div;
      var wlz3d_z_label;
      this.wlz3d_y_val;
      //-------------------------
      var wlzTrfmSec_div;
      var wlzTrfmSec_label;
      var wlzTrfmSec_val_div;
      var wlzTrfmSec_x_div;
      var wlzTrfmSec_x_label;
      this.wlzTrfmSec_x_val;
      var wlzTrfmSec_y_div;
      var wlzTrfmSec_y_label;
      this.wlzTrfmSec_y_val;
      //-------------------------
      var wlzTrfmBBOrig_div;
      var wlzTrfmBBOrig_label;
      var wlzTrfmBBOrig_val_div;
      var wlzTrfmBBOrig_x_div;
      var wlzTrfmBBOrig_x_label;
      this.wlzTrfmBBOrig_x_val;
      var wlzTrfmBBOrig_y_div;
      var wlzTrfmBBOrig_y_label;
      this.wlzTrfmBBOrig_y_val;
      var wlzTrfmBBOrig_z_div;
      var wlzTrfmBBOrig_z_label;
      this.wlzTrfmBBOrig_z_val;
      //-------------------------
      var wlzTrfmBBExt_div;
      var wlzTrfmBBExt_label;
      var wlzTrfmBBExt_val_div;
      var wlzTrfmBBExt_x_div;
      var wlzTrfmBBExt_x_label;
      this.wlzTrfmBBExt_x_val;
      var wlzTrfmBBExt_y_div;
      var wlzTrfmBBExt_y_label;
      this.wlzTrfmBBExt_y_val;
      var wlzTrfmBBExt_z_div;
      var wlzTrfmBBExt_z_label;
      this.wlzTrfmBBExt_z_val;
      //-------------------------

      var item_klass = 'debugItem';
      var label_klass = 'debugItemLabel';
      var txt_klass = 'debugItemTxt';
      var coord_klass = 'debugItemCoord';
      var label_coord_klass = 'debugItemCoordLabel';
      var val_coord_klass = 'debugItemCoordVal';

      var i = 0;
      var hh = 20;
      var top = i*hh;
      var txtwid = this.width - 30;

      //---------------------------------------------------------------
      browser_div = new Element('div', {
        'id': 'browser_div',
	    'class': item_klass
      });
      browser_div.setStyles({
         'top': top + 'px'
      });

      browser_label_div = new Element('div', {
        'id': 'browser_label_div',
	'class': label_klass
      });
      browser_label_div.set("text", "browser:");

      browser_val_div = new Element('div', {
        'id': 'browser_val_div',
        'class': txt_klass
      });

      browser_x_div = new Element('div', {
        'id': 'browser_x_div',
        'class': coord_klass
      });

      browser_x_label = new Element('div', {
        'id': 'browser_x_label',
	'class': label_coord_klass
      });
      browser_x_label.set("text", "X");

      this.browser_x_val = new Element('div', {
        'id': 'browser_x_val',
        'class': val_coord_klass
      });

      browser_y_div = new Element('div', {
        'id': 'browser_y_div',
        'class': coord_klass
      });

      browser_y_label = new Element('div', {
        'id': 'browser_y_label',
	'class': label_coord_klass
      });
      browser_y_label.set("text", "Y");

      this.browser_y_val = new Element('div', {
        'id': 'browser_y_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      viewer_div = new Element('div', {
        'id': 'viewer_div',
	    'class': item_klass
      });
      viewer_div.setStyles({
         'top': top + 'px'
      });

      viewer_label_div = new Element('div', {
        'id': 'viewer_label_div',
	'class': label_klass
      });
      viewer_label_div.set("text", "viewer:");

      viewer_val_div = new Element('div', {
        'id': 'viewer_val_div',
        'class': txt_klass
      });

      viewer_x_div = new Element('div', {
        'id': 'viewer_x_div',
        'class': coord_klass
      });

      viewer_x_label = new Element('div', {
        'id': 'viewer_x_label',
	'class': label_coord_klass
      });
      viewer_x_label.set("text", "X");

      this.viewer_x_val = new Element('div', {
        'id': 'viewer_x_val',
        'class': val_coord_klass
      });

      viewer_y_div = new Element('div', {
        'id': 'viewer_y_div',
        'class': coord_klass
      });

      viewer_y_label = new Element('div', {
        'id': 'viewer_y_label',
	'class': label_coord_klass
      });
      viewer_y_label.set("text", "Y");

      this.viewer_y_val = new Element('div', {
        'id': 'viewer_y_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      image_div = new Element('div', {
        'id': 'image_div',
	    'class': item_klass
      });
      image_div.setStyles({
         'top': top + 'px'
      });

      image_label_div = new Element('div', {
        'id': 'image_label_div',
	'class': label_klass
      });
      image_label_div.set("text", "image:");

      image_val_div = new Element('div', {
        'id': 'image_val_div',
        'class': txt_klass
      });

      image_x_div = new Element('div', {
        'id': 'image_x_div',
        'class': coord_klass
      });

      image_x_label = new Element('div', {
        'id': 'image_x_label',
	'class': label_coord_klass
      });
      image_x_label.set("text", "X");

      this.image_x_val = new Element('div', {
        'id': 'image_x_val',
        'class': val_coord_klass
      });

      image_y_div = new Element('div', {
        'id': 'image_y_div',
        'class': coord_klass
      });

      image_y_label = new Element('div', {
        'id': 'image_y_label',
	'class': label_coord_klass
      });
      image_y_label.set("text", "Y");

      this.image_y_val = new Element('div', {
        'id': 'image_y_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      wlz3d_div = new Element('div', {
        'id': 'wlz3d_div',
	    'class': item_klass
      });
      wlz3d_div.setStyles({
         'top': top + 'px'
      });

      wlz3d_label_div = new Element('div', {
        'id': 'wlz3d_label_div',
	'class': label_klass
      });
      wlz3d_label_div.set("text", "wlz3d:");

      wlz3d_val_div = new Element('div', {
        'id': 'wlz3d_val_div',
        'class': txt_klass
      });

      wlz3d_x_div = new Element('div', {
        'id': 'wlz3d_x_div',
        'class': coord_klass
      });

      wlz3d_x_label = new Element('div', {
        'id': 'wlz3d_x_label',
	'class': label_coord_klass
      });
      wlz3d_x_label.set("text", "X");

      this.wlz3d_x_val = new Element('div', {
        'id': 'wlz3d_x_val',
        'class': val_coord_klass
      });

      wlz3d_y_div = new Element('div', {
        'id': 'wlz3d_y_div',
        'class': coord_klass
      });

      wlz3d_y_label = new Element('div', {
        'id': 'wlz3d_y_label',
	'class': label_coord_klass
      });
      wlz3d_y_label.set("text", "Y");

      this.wlz3d_y_val = new Element('div', {
        'id': 'wlz3d_y_val',
        'class': val_coord_klass
      });

      wlz3d_z_div = new Element('div', {
        'id': 'wlz3d_z_div',
        'class': coord_klass
      });

      wlz3d_z_label = new Element('div', {
        'id': 'wlz3d_z_label',
	'class': label_coord_klass
      });
      wlz3d_z_label.set("text", "Z");

      this.wlz3d_z_val = new Element('div', {
        'id': 'wlz3d_z_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      wlzTrfmSec_div = new Element('div', {
        'id': 'wlzTrfmSec_div',
	    'class': item_klass
      });
      wlzTrfmSec_div.setStyles({
         'top': top + 'px'
      });

      wlzTrfmSec_label_div = new Element('div', {
        'id': 'wlzTrfmSec_label_div',
	'class': label_klass
      });
      wlzTrfmSec_label_div.set("text", "wlzTrfmSec:");

      wlzTrfmSec_val_div = new Element('div', {
        'id': 'wlzTrfmSec_val_div',
        'class': txt_klass
      });

      wlzTrfmSec_x_div = new Element('div', {
        'id': 'wlzTrfmSec_x_div',
        'class': coord_klass
      });

      wlzTrfmSec_x_label = new Element('div', {
        'id': 'wlzTrfmSec_x_label',
	'class': label_coord_klass
      });
      wlzTrfmSec_x_label.set("text", "X");

      this.wlzTrfmSec_x_val = new Element('div', {
        'id': 'wlzTrfmSec_x_val',
        'class': val_coord_klass
      });

      wlzTrfmSec_y_div = new Element('div', {
        'id': 'wlzTrfmSec_y_div',
        'class': coord_klass
      });

      wlzTrfmSec_y_label = new Element('div', {
        'id': 'wlzTrfmSec_y_label',
	'class': label_coord_klass
      });
      wlzTrfmSec_y_label.set("text", "Y");

      this.wlzTrfmSec_y_val = new Element('div', {
        'id': 'wlzTrfmSec_y_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      wlzTrfmBBOrig_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_div',
	    'class': item_klass
      });
      wlzTrfmBBOrig_div.setStyles({
         'top': top + 'px'
      });

      wlzTrfmBBOrig_label_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_label_div',
	'class': label_klass
      });
      wlzTrfmBBOrig_label_div.set("text", "wlzTrfmOrig:");

      wlzTrfmBBOrig_val_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_val_div',
        'class': txt_klass
      });

      wlzTrfmBBOrig_x_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_x_div',
        'class': coord_klass
      });

      wlzTrfmBBOrig_x_label = new Element('div', {
        'id': 'wlzTrfmBBOrig_x_label',
	'class': label_coord_klass
      });
      wlzTrfmBBOrig_x_label.set("text", "X");

      this.wlzTrfmBBOrig_x_val = new Element('div', {
        'id': 'wlzTrfmBBOrig_x_val',
        'class': val_coord_klass
      });

      wlzTrfmBBOrig_y_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_y_div',
        'class': coord_klass
      });

      wlzTrfmBBOrig_y_label = new Element('div', {
        'id': 'wlzTrfmBBOrig_y_label',
	'class': label_coord_klass
      });
      wlzTrfmBBOrig_y_label.set("text", "Y");

      this.wlzTrfmBBOrig_y_val = new Element('div', {
        'id': 'wlzTrfmBBOrig_y_val',
        'class': val_coord_klass
      });

      wlzTrfmBBOrig_z_div = new Element('div', {
        'id': 'wlzTrfmBBOrig_z_div',
        'class': coord_klass
      });

      wlzTrfmBBOrig_z_label = new Element('div', {
        'id': 'wlzTrfmBBOrig_z_label',
	'class': label_coord_klass
      });
      wlzTrfmBBOrig_z_label.set("text", "Z");

      this.wlzTrfmBBOrig_z_val = new Element('div', {
        'id': 'wlzTrfmBBOrig_z_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------
      i++;
      top = i*hh;

      wlzTrfmBBExt_div = new Element('div', {
        'id': 'wlzTrfmBBExt_div',
	    'class': item_klass
      });
      wlzTrfmBBExt_div.setStyles({
         'top': top + 'px'
      });

      wlzTrfmBBExt_label_div = new Element('div', {
        'id': 'wlzTrfmBBExt_label_div',
	'class': label_klass
      });
      wlzTrfmBBExt_label_div.set("text", "wlzTrfmExt:");

      wlzTrfmBBExt_val_div = new Element('div', {
        'id': 'wlzTrfmBBExt_val_div',
        'class': txt_klass
      });

      wlzTrfmBBExt_x_div = new Element('div', {
        'id': 'wlzTrfmBBExt_x_div',
        'class': coord_klass
      });

      wlzTrfmBBExt_x_label = new Element('div', {
        'id': 'wlzTrfmBBExt_x_label',
	'class': label_coord_klass
      });
      wlzTrfmBBExt_x_label.set("text", "X");

      this.wlzTrfmBBExt_x_val = new Element('div', {
        'id': 'wlzTrfmBBExt_x_val',
        'class': val_coord_klass
      });

      wlzTrfmBBExt_y_div = new Element('div', {
        'id': 'wlzTrfmBBExt_y_div',
        'class': coord_klass
      });

      wlzTrfmBBExt_y_label = new Element('div', {
        'id': 'wlzTrfmBBExt_y_label',
	'class': label_coord_klass
      });
      wlzTrfmBBExt_y_label.set("text", "Y");

      this.wlzTrfmBBExt_y_val = new Element('div', {
        'id': 'wlzTrfmBBExt_y_val',
        'class': val_coord_klass
      });

      wlzTrfmBBExt_z_div = new Element('div', {
        'id': 'wlzTrfmBBExt_z_div',
        'class': coord_klass
      });

      wlzTrfmBBExt_z_label = new Element('div', {
        'id': 'wlzTrfmBBExt_z_label',
	'class': label_coord_klass
      });
      wlzTrfmBBExt_z_label.set("text", "Z");

      this.wlzTrfmBBExt_z_val = new Element('div', {
        'id': 'wlzTrfmBBExt_z_val',
        'class': val_coord_klass
      });
      //---------------------------------------------------------------


      //----------------------------------------
      // add them to the tool
      //----------------------------------------

      browser_div.inject(win, 'inside');
      browser_label_div.inject(browser_div, 'inside');
      browser_val_div.inject(browser_div, 'inside');
      browser_x_div.inject(browser_val_div, 'inside');
      browser_x_label.inject(browser_x_div, 'inside');
      this.browser_x_val.inject(browser_x_div, 'inside');
      browser_y_div.inject(browser_val_div, 'inside');
      browser_y_label.inject(browser_y_div, 'inside');
      this.browser_y_val.inject(browser_y_div, 'inside');
      //----------------------------
      viewer_div.inject(win, 'inside');
      viewer_label_div.inject(viewer_div, 'inside');
      viewer_val_div.inject(viewer_div, 'inside');
      viewer_x_div.inject(viewer_val_div, 'inside');
      viewer_x_label.inject(viewer_x_div, 'inside');
      this.viewer_x_val.inject(viewer_x_div, 'inside');
      viewer_y_div.inject(viewer_val_div, 'inside');
      viewer_y_label.inject(viewer_y_div, 'inside');
      this.viewer_y_val.inject(viewer_y_div, 'inside');
      //----------------------------
      image_div.inject(win, 'inside');
      image_label_div.inject(image_div, 'inside');
      image_val_div.inject(image_div, 'inside');
      image_x_div.inject(image_val_div, 'inside');
      image_x_label.inject(image_x_div, 'inside');
      this.image_x_val.inject(image_x_div, 'inside');
      image_y_div.inject(image_val_div, 'inside');
      image_y_label.inject(image_y_div, 'inside');
      this.image_y_val.inject(image_y_div, 'inside');
      //----------------------------
      wlz3d_div.inject(win, 'inside');
      wlz3d_label_div.inject(wlz3d_div, 'inside');
      wlz3d_val_div.inject(wlz3d_div, 'inside');
      wlz3d_x_div.inject(wlz3d_val_div, 'inside');
      wlz3d_x_label.inject(wlz3d_x_div, 'inside');
      this.wlz3d_x_val.inject(wlz3d_x_div, 'inside');
      wlz3d_y_div.inject(wlz3d_val_div, 'inside');
      wlz3d_y_label.inject(wlz3d_y_div, 'inside');
      this.wlz3d_y_val.inject(wlz3d_y_div, 'inside');
      wlz3d_z_div.inject(wlz3d_val_div, 'inside');
      wlz3d_z_label.inject(wlz3d_z_div, 'inside');
      this.wlz3d_z_val.inject(wlz3d_z_div, 'inside');
      //----------------------------
      wlzTrfmSec_div.inject(win, 'inside');
      wlzTrfmSec_label_div.inject(wlzTrfmSec_div, 'inside');
      wlzTrfmSec_val_div.inject(wlzTrfmSec_div, 'inside');
      wlzTrfmSec_x_div.inject(wlzTrfmSec_val_div, 'inside');
      wlzTrfmSec_x_label.inject(wlzTrfmSec_x_div, 'inside');
      this.wlzTrfmSec_x_val.inject(wlzTrfmSec_x_div, 'inside');
      wlzTrfmSec_y_div.inject(wlzTrfmSec_val_div, 'inside');
      wlzTrfmSec_y_label.inject(wlzTrfmSec_y_div, 'inside');
      this.wlzTrfmSec_y_val.inject(wlzTrfmSec_y_div, 'inside');
      //----------------------------
      wlzTrfmBBOrig_div.inject(win, 'inside');
      wlzTrfmBBOrig_label_div.inject(wlzTrfmBBOrig_div, 'inside');
      wlzTrfmBBOrig_val_div.inject(wlzTrfmBBOrig_div, 'inside');
      wlzTrfmBBOrig_x_div.inject(wlzTrfmBBOrig_val_div, 'inside');
      wlzTrfmBBOrig_x_label.inject(wlzTrfmBBOrig_x_div, 'inside');
      this.wlzTrfmBBOrig_x_val.inject(wlzTrfmBBOrig_x_div, 'inside');
      wlzTrfmBBOrig_y_div.inject(wlzTrfmBBOrig_val_div, 'inside');
      wlzTrfmBBOrig_y_label.inject(wlzTrfmBBOrig_y_div, 'inside');
      this.wlzTrfmBBOrig_y_val.inject(wlzTrfmBBOrig_y_div, 'inside');
      wlzTrfmBBOrig_z_div.inject(wlzTrfmBBOrig_val_div, 'inside');
      wlzTrfmBBOrig_z_label.inject(wlzTrfmBBOrig_z_div, 'inside');
      this.wlzTrfmBBOrig_z_val.inject(wlzTrfmBBOrig_z_div, 'inside');
      //----------------------------
      wlzTrfmBBExt_div.inject(win, 'inside');
      wlzTrfmBBExt_label_div.inject(wlzTrfmBBExt_div, 'inside');
      wlzTrfmBBExt_val_div.inject(wlzTrfmBBExt_div, 'inside');
      wlzTrfmBBExt_x_div.inject(wlzTrfmBBExt_val_div, 'inside');
      wlzTrfmBBExt_x_label.inject(wlzTrfmBBExt_x_div, 'inside');
      this.wlzTrfmBBExt_x_val.inject(wlzTrfmBBExt_x_div, 'inside');
      wlzTrfmBBExt_y_div.inject(wlzTrfmBBExt_val_div, 'inside');
      wlzTrfmBBExt_y_label.inject(wlzTrfmBBExt_y_div, 'inside');
      this.wlzTrfmBBExt_y_val.inject(wlzTrfmBBExt_y_div, 'inside');
      wlzTrfmBBExt_z_div.inject(wlzTrfmBBExt_val_div, 'inside');
      wlzTrfmBBExt_z_label.inject(wlzTrfmBBExt_z_div, 'inside');
      this.wlzTrfmBBExt_z_val.inject(wlzTrfmBBExt_z_div, 'inside');

      //----------------------------------------
      // add event handlers
      //----------------------------------------

      //----------------------------------------
      // the mouse click marker
      //----------------------------------------
      this.markerContainer = new Element('div', {
	 'id': 'fixedPointMarkerContainer',
	 'class': 'markerContainer'
      });
      this.markerContainer.inject($('emapIIPViewerDiv'), 'inside');

      this.markerArm0 = new Element('div', {
	 'id': 'fixedPointMarkerArm0',
	 'class': 'markerArm zero'
      });
      this.markerArm90 = new Element('div', {
	 'id': 'fixedPointMarkerArm90',
	 'class': 'markerArm ninety'
      });
      this.markerArm180 = new Element('div', {
	 'id': 'fixedPointMarkerArm180',
	 'class': 'markerArm oneEighty'
      });
      this.markerArm270 = new Element('div', {
	 'id': 'fixedPointMarkerArm270',
	 'class': 'markerArm twoSeventy'
      });

      this.markerArm0.inject(this.markerContainer, 'inside');
      this.markerArm90.inject(this.markerContainer, 'inside');
      this.markerArm180.inject(this.markerContainer, 'inside');
      this.markerArm270.inject(this.markerContainer, 'inside');


   }, // createElements

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges) {

      if(modelChanges.sectionChanged === true) {
	 this.reset();
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges, from) {

      var queryModes;

      if(viewChanges.initial === true) {
	 this.window.setVisible(false);
      }

      //...................................
      if(viewChanges.mode === true) {
	 var mode = this.view.getMode();
         //console.log("mode.name ",mode.name);
	 if(mode.name === "debug") {
	    this.window.setVisible(true);
	 } else {
	    this.window.setVisible(false);
	    this.setMarkerVisible(false);
	 }
      }

      //...................................
      if(viewChanges.debugPoint === true) {
	 //console.log("viewChanges.debugPoint");
	 if(this.isWlz) {
            this.getTransformedBoundingBox();
	 } else {
	    alert("Sorry, debug info only available with wlz data at the moment");
	 }
      }

      if(viewChanges.toolbox === true) {
	var viz = this.view.toolboxVisible();
	if(viz === true) {
	   this.window.setVisible(true);
        } else if(viz === false) {
	   this.window.setVisible(false);
	   this.setMarkerVisible(false);
	}
      }
   }, // viewUpdate

   //---------------------------------------------------------------
   queryUpdate: function(queryChanges) {

      if(queryChanges.type === true) {
         // do nothing
      }

   }, // queryUpdate

   //--------------------------------------------------------------
   showDebugInfo: function () {
         var debugPoint;
         var browserPos;
         var imgPos;
         var viewerPos;
         var viewCoords;
	 var trfSecCoords;
	 var fixed;
	 var scale;

	 scale = this.view.getScale().cur;
         debugPoint = this.view.getDebugPoint();
         browserPos = this.view.getMouseClickPosition();
         imgPos = this.view.getMousePositionInImage({x:browserPos.x, y:browserPos.y});
	 imgPos.x = (imgPos.x / scale);
	 imgPos.y = (imgPos.y / scale);
         viewerPos = this.view.getViewerContainerPos();
         viewCoords = {};
	 trfSecCoords = {};
	 fixed = 1;

	 /*
	 console.log("scale ",scale);
	 console.log("debugPoint ",debugPoint);
	 console.log("browserPos.x %d, browserPos.y %d",browserPos.x,browserPos.y);
	 console.log("imgPos.x %d, imgPos.y %d",imgPos.x,imgPos.y);
	 console.log("viewerPos.x %d, viewerPos.y %d",viewerPos.x,viewerPos.y);
	 */

	 viewCoords.x = browserPos.x - viewerPos.x;
	 viewCoords.y = browserPos.y - viewerPos.y;

	 trfSecCoords.x = this.transformedBoundingBoxOrig.x + (1.0 * imgPos.x);
	 trfSecCoords.y = this.transformedBoundingBoxOrig.y + (1.0 * imgPos.y);

	 this.browser_x_val.set("text", this.trimDecimal(browserPos.x, fixed));
	 this.browser_y_val.set("text", this.trimDecimal(browserPos.y, fixed));

	 this.viewer_x_val.set("text", this.trimDecimal(viewCoords.x, fixed));
	 this.viewer_y_val.set("text", this.trimDecimal(viewCoords.y, fixed));

	 this.image_x_val.set("text", this.trimDecimal(imgPos.x, fixed));
	 this.image_y_val.set("text", this.trimDecimal(imgPos.y, fixed));

	 this.wlz3d_x_val.set("text", this.trimDecimal(debugPoint.x, fixed));
	 this.wlz3d_y_val.set("text", this.trimDecimal(debugPoint.y, fixed));
	 this.wlz3d_z_val.set("text", this.trimDecimal(debugPoint.z, fixed));

	 this.wlzTrfmSec_x_val.set("text", this.trimDecimal(trfSecCoords.x, fixed));
	 this.wlzTrfmSec_y_val.set("text", this.trimDecimal(trfSecCoords.y, fixed));

	 this.wlzTrfmBBOrig_x_val.set("text", this.trimDecimal(this.transformedBoundingBoxOrig.x, fixed));
	 this.wlzTrfmBBOrig_y_val.set("text", this.trimDecimal(this.transformedBoundingBoxOrig.y, fixed));
	 this.wlzTrfmBBOrig_z_val.set("text", this.trimDecimal(this.transformedBoundingBoxOrig.z, fixed));

	 this.wlzTrfmBBExt_x_val.set("text", this.trimDecimal(this.transformedBoundingBoxExt.x, fixed));
	 this.wlzTrfmBBExt_y_val.set("text", this.trimDecimal(this.transformedBoundingBoxExt.y, fixed));
	 this.wlzTrfmBBExt_z_val.set("text", this.trimDecimal(this.transformedBoundingBoxExt.z, fixed));

	 var left = browserPos.x - viewerPos.x -12;
	 var top = browserPos.y - viewerPos.y -12;
	 this.markerContainer.setStyles({'left': left, 'top': top});
	 this.setMarkerVisible(true);
   }, // showDebugInfo

   //--------------------------------------------------------------
   trimDecimal: function (num, fixed) {
      
      var ret;

      ret = (Math.floor(num * 100) / 100).toFixed(fixed)
      //console.log("trimDecimal: returning ",ret);
      return ret;
   }, // trimDecimal

   //--------------------------------------------------------------
   setMarkerVisible: function (visible) {
      var viz = (visible) ? 'visible' : 'hidden';
      if(this.markerContainer) {
         this.markerArm0.setStyle('visibility', viz);
         this.markerArm90.setStyle('visibility', viz);
         this.markerArm180.setStyle('visibility', viz);
         this.markerArm270.setStyle('visibility', viz);
      }
   },

   //--------------------------------------------------------------
   getTransformedBoundingBox: function() {

      var transformedBBArray = [];
      var transformedBoundingBoxUrl;
      var jsonStr;
      var ajaxParams;
      var len;
      var section;
      var i;
      var webServer;
      var iipServer;
      var currentLayer;
      var layerData;
      var layer;
      
      
      this.threeDInfo = this.model.getThreeDInfo();
      //console.log("threeDInfo ",this.threeDInfo);

      webServer = this.model.getWebServer();
      iipServer = this.model.getIIPServer();
      currentLayer = this.view.getCurrentLayer();
      layerData = this.model.getLayerData();
      layer;

      if(webServer === undefined || iipServer === undefined) {
         //console.log("webServer or iipServer undefined");
         return undefined;
      }

      if(layerData === null) {
         //console.log("layerData null");
         return undefined;
      }

      layer = layerData[currentLayer];
      if(layer === undefined || layer === null) {
         //console.log("layer undefined");
         return undefined;
      }


      transformedBoundingBoxUrl = 
         iipServer + "?wlz=" +  layer.imageDir + layer.imageName                                                                                                
         + "&mod=" + this.threeDInfo.wlzMode                                                                                                                                               
         + "&fxp=" + this.threeDInfo.fxp.x + ',' + this.threeDInfo.fxp.y + ','+ this.threeDInfo.fxp.z                                                                                                
         + "&dst=" + this.threeDInfo.dst.cur                                                                                                                                                              
         + "&pit=" + this.threeDInfo.pitch.cur
         + "&yaw=" + this.threeDInfo.yaw.cur
         + "&rol=" + this.threeDInfo.roll.cur
         + "&obj=Wlz-transformed-3d-bounding-box";

      //console.log("transformedBoundingBoxUrl ",transformedBoundingBoxUrl);

      ajaxParams = {
         url:transformedBoundingBoxUrl,
	 method:"POST",
	 callback: function (response) {
	    this.getTransformedBoundingBoxCallback(response);
	 }.bind(this),
	 contentType:"",
	 urlParams:"",
	 async:true,
	 noCache:false
      }

      var ajax = new emouseatlas.emap.ajaxContentLoader();
      ajax.loadResponse(ajaxParams);

   },

   //---------------------------------------------------------
   getTransformedBoundingBoxCallback: function (response) {

      var values;
      var valArr = [];
      var x;
      var y;
      var z;

      // get model data via ajax
      //----------------
      response = emouseatlas.emap.utilities.trimString(response);
      if(response === null || response === undefined || response === "") {
	 return undefined;
      }

      values = response.split("Wlz-transformed-3d-bounding-box:")[1]
      valArr = values.split(" ");
      //console.log("getTransformedBoundingBoxCallback valArr = ",valArr);
      x = parseInt(valArr[4]);
      y = parseInt(valArr[2]);
      z = parseInt(valArr[0]);
      //console.log("getTransformedBoundingBoxCallback x %f, y %f, z %f",x,y,z);

      this.transformedBoundingBoxOrig = {x:x, y:y, z:z};
      //console.log("transformedBoundingBoxOrig ",this.transformedBoundingBoxOrig);

      x = parseInt(valArr[5]);
      y = parseInt(valArr[3]);
      z = parseInt(valArr[1]);
      //console.log("getTransformedBoundingBoxCallback x %f, y %f, z %f",x,y,z);

      this.transformedBoundingBoxExt = {x:x, y:y, z:z};
      
      // this has to wait until we have the transformed bounding box
      this.showDebugInfo();

   },

   //---------------------------------------------------------------
   reset: function() {

       this.setMarkerVisible(false);

       this.browser_x_val.set("text", "");
       this.browser_y_val.set("text", "");

       this.viewer_x_val.set("text", "");
       this.viewer_y_val.set("text", "");

       this.image_x_val.set("text", "");
       this.image_y_val.set("text", "");

       this.wlz3d_x_val.set("text", "");
       this.wlz3d_y_val.set("text", "");
       this.wlz3d_z_val.set("text", "");

       this.wlzTrfmSec_x_val.set("text", "");
       this.wlzTrfmSec_y_val.set("text", "");

       this.wlzTrfmBBOrig_x_val.set("text", "");
       this.wlzTrfmBBOrig_y_val.set("text", "");
       this.wlzTrfmBBOrig_z_val.set("text", "");

       this.wlzTrfmBBExt_x_val.set("text", "");
       this.wlzTrfmBBExt_y_val.set("text", "");
       this.wlzTrfmBBExt_z_val.set("text", "");

    },

   //---------------------------------------------------------------
   getName: function() {
      return this.name;
   }.bind(this)

});
