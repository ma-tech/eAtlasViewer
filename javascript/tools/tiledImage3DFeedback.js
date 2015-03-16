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
//   tiledImage3DFeedback.js
//   Tool to change pitch and yaw of plane through 3D wlz object tiled image from an iip server
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------

//---------------------------------------------------------
// tiledImage3DFeedback
//---------------------------------------------------------
//emouseatlas.emap.tiledImage3DFeedback = new Class ({
var tiledImage3DFeedback = new Class ({

   initialize: function(params) {

      //console.log("enter tiledImage3DFeedback.initialize: ",params);
      this.model = params.model;
      this.view = params.view;

      this.model.register(this);
      this.view.register(this);

      this._debug = false;

      this.width = params.params.width;
      this.height = params.params.height;
      //this.navImage = params.params.navImage;
      //console.log("width %s, height %s",this.width, this.height);
      this.drag = params.params.drag;
      //console.log("drag %s",this.drag);

      this.toRad = Math.PI / 180.0;

      this.targetId = params.params.targetId;
      this.isWlz = this.model.isWlzData();
      this.isKeySection = this.model.getKeySections().length > 0 ? true : false;

      this.name = "3DFeedback";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      this.x3d_id = "threeDFeedback";

      this.toolTipText = this.shortName;

      this.imagePath = this.model.getInterfaceImageDir();
      //console.log("3DFeedback: imagePath %s",this.imagePath);

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
                                         title:this.shortName,
					 view:this.view,
					 imagePath: this.imagePath,
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

      //console.log("exit tiledImage3DFeedback.initialize");
      this.setToolTip(this.toolTipText);

      this.x3domHelpIconContainer;
      this.x3domHelpIconImg;
      this.keepX3domHelpFrame = false;

      this.vp_arr = [];
      this.createElements();

   },

   //---------------------------------------------------------------
   createElements: function () {

      var win;
      var topEdge;
      var x3d;
      var scene;
      var param;

      var x3dInfo;
      var fxpTrans;
      var initTrans;

      /*
      var axes_inline;
      var axes_url;
      var axes_transform;
      */

      var embryo_group;
      var embryo_transform;
      var embryo_inline;
      var embryo_initial_orient;
      var embryo_initial_trans;
      var embryo_url;

      var disc_data;
      var disc_colour;
      var disc_transparency;
      var disc_height;
      var disc_radius;
      var disc_group;
      var disc_transform_fix;
      var disc_transform_scl;
      var disc_transform_xsi;
      var disc_transform_eta;
      var disc_transform_zet;
      var disc_transform_dst;
      var disc_initial_orient;
      var disc_initial_trans;
      var disc_shape;
      var disc_cylinder;
      var disc_appearance;
      var disc_material;

      var background;
      var bgc_obj;
      var bgc_css;
      var vp;
      var vp_count;
      var styl;
      var styl_border;
      var styl_float;
      var styl_height;
      var styl_width;
      var styl_x;
      var styl_y;
      var i;

      //.................................................
      win = $(this.shortName + '-win');
      topEdge = $(this.shortName + '-topedge');

      x3dInfo = this.model.getX3dInfo();
      //console.log("x3dInfo ",x3dInfo);
      fxpTrans = x3dInfo.fxpTrans.x + " " + x3dInfo.fxpTrans.y + " " + x3dInfo.fxpTrans.z;
      initTrans = x3dInfo.initTrans.x + " " + x3dInfo.initTrans.y + " " + x3dInfo.initTrans.z;

      threeDInfo = this.model.getThreeDInfo();

      disc_data = x3dInfo.disc;
      disc_colour = disc_data.colour.r + " " + disc_data.colour.g + " " + disc_data.colour.b;
      disc_height = disc_data.height;
      disc_radius = disc_data.radius;
      disc_transparency = disc_data.transparency;
      disc_initial_orient = disc_data.rot.xsi + " " + disc_data.rot.eta + " " + disc_data.rot.zeta + " " + disc_data.rot.rad;
      disc_initial_trans = disc_data.trans.x + " " + disc_data.trans.y + " " + disc_data.trans.z;

      embryo_url = x3dInfo.url;

      embryo_data = x3dInfo.embryo;
      //console.log("embryo_data ",embryo_data);
      if(embryo_data.rot) {
         embryo_initial_orient = embryo_data.rot.xsi + " " + embryo_data.rot.eta + " " + embryo_data.rot.zeta + " " + embryo_data.rot.rad;
      }
      if(embryo_data.trans) {
         embryo_initial_trans = embryo_data.trans.x + " " + embryo_data.trans.y + " " + embryo_data.trans.z;
      }

      styl = x3dInfo.style;
      styl_border = styl.border;
      styl_float = styl.float;
      styl_height = styl.height;
      styl_width = styl.width;
      styl_x = styl.x;
      styl_y = styl.y;

      this.vp_arr = [];
      vp_count = x3dInfo.viewpoints.length;

      bgc_obj = x3dInfo.bgCol;
      bgc_css = bgc_obj.r + " " + bgc_obj.g + " " + bgc_obj.b;

      //.................................................
      x3d = document.createElement('X3D');
      x3d.setAttribute('id', this.x3d_id);
      x3d.setAttribute('xmlns', 'http://www.web3d.org/specifications/x3d-namespace');
      x3d.setAttribute('showlog', 'false');
      x3d.setAttribute('showStat', 'false');
      x3d.setAttribute('width', styl_width);  // required for flash fallback case
      x3d.setAttribute('height', styl_height);  // required for flash fallback case
      x3d.setStyle('x', styl_x);
      x3d.setStyle('y', styl_y);
      x3d.setStyle('width', styl_width);
      x3d.setStyle('height', styl_height);
      x3d.setStyle('border', styl_border);
      x3d.style.float = styl_float;

      //................
      //set value to true for debugging
      scene = document.createElement('Scene');
      scene.setAttribute('DEF', 'scene');
      param = document.createElement('param');
      param.setAttribute('name', 'showLog');
      param.setAttribute('value', 'false');

      //................
      /*
      axes_transform = document.createElement('Transform');
      axes_transform.setAttribute('id', 'axes_trans');
      axes_transform.setAttribute('DEF', 'axes_trans');

      axes_url = "x3d/CoordinateAxes.x3d";
      axes_inline = document.createElement('Inline');
      axes_inline.setAttribute('url', axes_url);
      */

      //................

      disc_group = document.createElement('Group');
      //---------------------------------------------
      //console.log("fxpTrans ",fxpTrans);
      disc_transform_fix = document.createElement('Transform');
      disc_transform_fix.setAttribute('id', 'fixTr');
      disc_transform_fix.setAttribute('translation', fxpTrans);

      disc_transform_scl = document.createElement('Transform');
      disc_transform_scl.setAttribute('id', 'sclTr');
      disc_transform_scl.setAttribute('scale', '1.0 1.0 1.0');

      disc_transform_xsi = document.createElement('Transform');
      disc_transform_xsi.setAttribute('id', 'xsiTr');
      disc_transform_xsi.setAttribute('rotation', '0 0 1 0.0');
      disc_transform_xsi.setAttribute('center', initTrans);

      disc_transform_eta = document.createElement('Transform');
      disc_transform_eta.setAttribute('id', 'etaTr');
      disc_transform_eta.setAttribute('rotation', '0 1 0 0.0');
      disc_transform_eta.setAttribute('center', initTrans);

      disc_transform_zet = document.createElement('Transform');
      disc_transform_zet.setAttribute('id', 'zetTr');
      disc_transform_zet.setAttribute('rotation', '1 0 0 0.0');
      disc_transform_zet.setAttribute('center', initTrans);

      disc_transform_dst = document.createElement('Transform');
      disc_transform_dst.setAttribute('id', 'dstTr');
      disc_transform_dst.setAttribute('translation', initTrans);

      //console.log("disc_initial_trans ",disc_initial_trans);
      disc_transform = document.createElement('Transform');
      disc_transform.setAttribute('id', 'discTr');
      disc_transform.setAttribute('translation', disc_initial_trans);
      disc_transform.setAttribute('rotation', disc_initial_orient);

      //---------------------------------------------
      disc_shape = document.createElement('Shape');
      disc_appearance = document.createElement('Appearance');

      disc_material = document.createElement('Material');
      disc_material.setAttribute('id', 'secMat');
      disc_material.setAttribute('diffuseColor', disc_colour);
      disc_material.setAttribute('transparency', disc_transparency);

      disc_cylinder = document.createElement('Cylinder');
      disc_cylinder.setAttribute('id', 'section');
      disc_cylinder.setAttribute('radius', disc_radius);
      disc_cylinder.setAttribute('height', disc_height);

      //................
      embryo_group = document.createElement('Group');
      //---------------------------------------------
      embryo_transform = document.createElement('Transform');
      embryo_transform.setAttribute('id', 'embTr');
      if(embryo_initial_trans !== undefined) {
         embryo_transform.setAttribute('translation', embryo_initial_trans);
      }
      if(embryo_initial_orient !== undefined) {
         embryo_transform.setAttribute('rotation', embryo_initial_orient);
      }

      embryo_inline = document.createElement('Inline');
      embryo_inline.setAttribute('url', embryo_url);
      embryo_inline.setAttribute('DEF', 'embryonic');

      //................
      background = document.createElement('Background');
      background.setAttribute('skyColor', bgc_css);

      //................
      for(i=0; i < vp_count; i++) {
         this.vp_arr[i] = document.createElement('Viewpoint');
      }

      //................
      // help icon for x3dom feedback
      this.x3domHelpIconContainer = new Element( 'div', {
         'id': 'x3domHelpFrameIconContainer',
         'class': 'helpFrameIconContainer x3domHelp'
      });
      this.x3domHelpIconImg = new Element( 'img', {
         'id': 'x3domHelpFrameIconImg',
         'src': this.imagePath + 'help-26.png'
      });

      this.x3domHelpIconContainer.appendChild(this.x3domHelpIconImg);

      this.x3domHelpIconContainer.addEvent('click', function() {
         this.doX3domHelpIconClicked(true);
      }.bind(this));

      this.x3domHelpIconContainer.addEvent('mouseover', function() {
         this.doMouseOverHelpIcon();
      }.bind(this));

      this.x3domHelpIconContainer.addEvent('mouseout', function() {
         this.doMouseOutHelpIcon();
      }.bind(this));

      //------------------------------------------------------------------
      // Note: innermost transforms are executed first
      // Apply rotations in the correct order
      //------------------------------------------------------------------
      win.appendChild(x3d);
      win.appendChild(this.x3domHelpIconContainer);

      //.............
      x3d.appendChild(scene);
      x3d.appendChild(param);

      //.............
      //scene.appendChild(axes_transform);
      //axes_transform.appendChild(axes_inline);

      //.............
      for(i=0; i<vp_count; i++) {
         scene.appendChild(this.vp_arr[i]);
      }
      scene.appendChild(background);
      scene.appendChild(disc_group);
      scene.appendChild(embryo_group);

      //.............
      disc_group.appendChild(disc_transform_fix);
      disc_transform_fix.appendChild(disc_transform_scl);
      disc_transform_scl.appendChild(disc_transform_xsi);
      disc_transform_xsi.appendChild(disc_transform_eta);
      disc_transform_eta.appendChild(disc_transform_zet);
      disc_transform_zet.appendChild(disc_transform_dst);
      disc_transform_dst.appendChild(disc_transform);
      //.............
      // the disc
      disc_transform.appendChild(disc_shape);
      disc_shape.appendChild(disc_appearance);
      disc_shape.appendChild(disc_cylinder);
      disc_appearance.appendChild(disc_material);

      //.............
      // the embryo
      embryo_group.appendChild(embryo_transform);
      embryo_transform.appendChild(embryo_inline);
      //........................................................................................................

      //console.log("finished creating x3d elements");
      return false;

   }, // createElements

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges, from) {

      if(modelChanges.locator === true) {
         this.setNewPos();
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("tiledImage3DFeedback viewUpdate:");
      var feedback;
      var tmp;

      // do the setting up stuff
      if(viewChanges.initial === true) {
	 //console.log("locator: viewChanges.initial %s",viewChanges.initial);
	 this.window.setVisible(true);
	 this.window.setDimensions(this.width,this.height);
	 
	 /*
	 x3dom.ready = function() {
	     alert("Hi peeps");
	 };
	 x3dom.runtime.ready = function() {
	     alert("About to render something the first time");
         };
	 */

         x3dom.reload();

         // trying out some runtime stuff
	 /*
         feedback = document.getElementById(this.x3d_id);
	 feedback.runtime.debug(false);
	 feedback.runtime.statistics(false);
	 tmp = feedback.runtime.navigationType();
	 //console.log("navigationType initially %s",tmp);
	 //feedback.runtime.lookAt();
	 //feedback.runtime.lookAround();
	 //feedback.runtime.walk();
	 //tmp = feedback.runtime.navigationType();
	 //console.log("navigationType now %s",tmp);
	 tmp = feedback.runtime.speed();
	 console.log("speed orig %s",tmp);
	 feedback.runtime.speed(0.1);
	 tmp = feedback.runtime.speed();
	 console.log("speed now %s",tmp);
	 */

         this.setViewpoints();
      }; // viewChanges.initial

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
   // the embryo starts out centred at the fixed point (initially the centre of the bounding box but generally offset from 0,0,0)
   // the disc starts out centred at 0,0,0  of the x3d scene.
   // You can either move the embryo to 0,0,0 (makes life complicated, especially if fixed point is changed)
   // or move the disc to be centred at the fixed point, which is what we shall do.
   // The fixed point must be scaled by the normalised voxel values.
   // Note: in x3d the centre of rotation is a property of the viewpoint. Rotation of an object in local coordinates requires
   // the transform object to have an offset from world coordinates (the 'center' property of the transform object).
   //---------------------------------------------------------------
   setViewpoints: function () {

      var vp;
      var vp_data;
      var vp_count;
      var vp_fov;
      var vp_jump;
      var vp_description;
      var vp_trans;
      var vp_orient;
      var default_vp;
      var embryo_fxp;
      var tr_x;
      var tr_y;
      var tr_z;
      var x3dInfo;
      var threeDInfo;
      var bbox;
      var bbox_extent_x;
      var bbox_extent_y;
      var bbox_extent_z;
      var bbox_max_dim;
      var zofs;
      var i;

      x3dInfo = this.model.getX3dInfo();
      threeDInfo = this.model.getThreeDInfo();
      bbox = this.model.getBoundingBox();

      //......................................
      // viewpoint setup
      //......................................
      bbox_extent_x = bbox.x.max - bbox.x.min;
      bbox_extent_y = bbox.y.max - bbox.y.min;
      bbox_extent_z = bbox.z.max - bbox.z.min;

      bbox_max_dim = bbox_extent_x;
      bbox_max_dim = (bbox_extent_y > bbox_max_dim) ? bbox_extent_y  : bbox_max_dim;
      bbox_max_dim = (bbox_extent_z > bbox_max_dim) ? bbox_extent_y  : bbox_max_dim;

      if(this.isKeySection) {
         embryo_fxp = {};
	 embryo_fxp.x = x3dInfo.embryo.origFxp.x;
	 embryo_fxp.y = x3dInfo.embryo.origFxp.y;
	 embryo_fxp.z = x3dInfo.embryo.origFxp.z;
         zofs = (3 * 794) + embryo_fxp.z;
      } else {
         embryo_fxp = threeDInfo.scaledFxp;
         zofs = (3 * bbox_max_dim) + embryo_fxp.z;
      }

      //console.log("embryo_fxp ",embryo_fxp);
      //console.log("bbox ",bbox);

      default_vp = {};
      default_vp.fov = 0.35;
      default_vp.jump = false;
      default_vp.description = 'default viewpoint';
      default_vp.trans =  embryo_fxp.x + ' ' + embryo_fxp.y + ' ' + zofs;
      default_vp.orient = '0 1 0 0.0';
      default_vp.center = embryo_fxp.x + ' ' + embryo_fxp.y + ' ' + embryo_fxp.z;

      vp_data = x3dInfo.viewpoints;
      vp_count = vp_data.length;

      for(i=0; i < vp_count; i++) {
         vp = vp_data[i];
	 //console.log("vp ",vp);

         vp_fov = (vp.fov === undefined) ? default_vp.fov : vp.fov;
         vp_jump = (vp.jump === undefined) ? default_vp.jump : vp.jump;
         vp_description = (vp.description === undefined) ? default_vp.description : vp.description;
         vp_trans = (vp.trans === undefined) ? default_vp.trans : vp.trans.x + " " + vp.trans.y + " " + vp.trans.z;
         vp_orient = (vp.orient == undefined) ? default_vp.orient : vp.orient.xsi + " " + vp.orient.eta + " " + vp.orient.zeta + " " + vp.orient.rad;

         this.vp_arr[i].setAttribute('fieldOfView', vp_fov);
         this.vp_arr[i].setAttribute('jump', vp_jump);
         this.vp_arr[i].setAttribute('description', vp_description);
         this.vp_arr[i].setAttribute('position', vp_trans);
         this.vp_arr[i].setAttribute('orientation', vp_orient);
         this.vp_arr[i].setAttribute('centerOfRotation', default_vp.center);
      }

      this.vp_arr[0].setAttribute('set_bind','true')
      
   }, // setViewpoints

   //---------------------------------------------------------------
   setNewPos: function() {

      var threeD;
      var dst;
      var pit;
      var yaw;
      var rol;
      var toRad;
      // Section transform parameters
      var scl = 1;
      var fpx = 0;
      var fpy = 0;
      var fpz = 0;
      var mod = WlzThreeDViewMode.WLZ_UP_IS_UP_MODE;

      threeD = this.model.getThreeDInfo();
      //console.log("setNewPos: threeD ",threeD);
      //scl = this.view.getScale().cur;
      
      dst = threeD.dst.cur;
      pit = threeD.pitch.cur * this.toRad;
      yaw = threeD.yaw.cur * this.toRad;
      rol = threeD.roll.cur * this.toRad;

      fpx = threeD.scaledFxp.x;
      fpy = threeD.scaledFxp.y;
      fpz = threeD.scaledFxp.z;

      //console.log("setting: mod %d, dst %d, pit %d, yaw %d, rol %d, scl %d",mod,dst,pit,yaw,rol,scl);
      
      this.secTransformSet(mod, dst, pit, yaw, rol, scl, fpx, fpy, fpz);


   }, // setNewPos

   //---------------------------------------------------------------
   secTransformSet: function (mod, dst, pit, yaw, rol, scl, fxx, fxy, fxz) {

      // Set section transform
      var dTr = document.getElementById('dstTr');
      var zTr = document.getElementById('zetTr');
      var eTr = document.getElementById('etaTr');
      var xTr = document.getElementById('xsiTr');
      var sTr = document.getElementById('sclTr');
      var fTr = document.getElementById('fixTr');
      var tr = new WlzThreeDViewStruct();
      var ks_dst;

      tr.setViewMode(mod);
      tr.setDist(dst)
      tr.setTheta(yaw);
      tr.setPhi(pit);
      tr.setZeta(rol);
      tr.setScale([scl, scl, scl]);
      tr.setFixed([fxx, fxy, fxz]);
      tr.computeAngles();

      if(this.isKeySection) {
         ks_dst = tr.dist * 1.55 - 373;
         dTr.setAttribute('translation', '0 0 ' + ks_dst);
         //console.log("secTransformSet: key section");
	 return;
      }
      dTr.setAttribute('translation', '0 0 ' + tr.dist);
      xTr.setAttribute('rotation',    '0 0 1 ' + tr.xsi);
      eTr.setAttribute('rotation',    '0 1 0 ' + tr.eta);
      zTr.setAttribute('rotation',    '0 0 1 ' + tr.zeta);
      sTr.setAttribute('scale',       1.0 / tr.scale[0] + ' ' + 1.0 / tr.scale[1] + ' ' + 1.0 / tr.scale[2]);
      fTr.setAttribute('translation', tr.fixed[0] + ' ' + tr.fixed[1] + ' ' + tr.fixed[2]);

   }, // secTransformSet

   //---------------------------------------------------------------
   // called when help icon clicked
   //---------------------------------------------------------------
   doX3domHelpIconClicked: function (event) {
      //console.log("click");
      if(this.keepX3domHelpFrame === false) {
         this.keepX3domHelpFrame = true;
	 this.addHelpCloseEvent();
         this.showX3domHelpContainer();
         this.view.showX3domHelpFrame();
      } else {
         this.keepX3domHelpFrame = false;
	 this.removeHelpCloseEvent();
         this.hideX3domHelpContainer();
         this.view.hideX3domHelpFrame();
      }
   },

   //---------------------------------------------------------------
   // event handler for close button
   //---------------------------------------------------------------
   closeX3domHelp: function (event, that) {
      that.hideX3domHelpContainer();
      that.view.hideX3domHelpFrame();
      this.keepX3domHelpFrame = false;
   },
   //},

   //---------------------------------------------------------------
   // called on mouseover help icon
   //---------------------------------------------------------------
   doMouseOverHelpIcon: function (event) {
      //console.log("over");
      this.showX3domHelpContainer();
      this.view.showX3domHelpFrame();
   },

   //---------------------------------------------------------------
   // called on mouseout help icon
   //---------------------------------------------------------------
   doMouseOutHelpIcon: function (event) {
      //console.log("out");
      if(this.keepX3domHelpFrame) {
         return false;
      }
      this.hideX3domHelpContainer();
      this.view.hideX3domHelpFrame();
      this.keepX3domHelpFrame = false;
   },

   //---------------------------------------------------------
   addHelpCloseEvent: function () {
      var closeDiv = document.getElementById("wlzIIPViewerX3domHelpIFrameCloseDiv");
      if(closeDiv) {
	 emouseatlas.emap.utilities.addEvent(closeDiv, 'mouseup', function(e) {
	    this.closeX3domHelp(e, this);
	 }.bind(this), false);
      }
   },

   //---------------------------------------------------------
   removeHelpCloseEvent: function () {
      var closeDiv = document.getElementById("wlzIIPViewerX3domHelpIFrameCloseDiv");
      if(closeDiv) {
	 emouseatlas.emap.utilities.removeEvent(closeDiv, 'mouseup', function(e) {
	    this.closeX3domHelp(e, this);
	 }.bind(this), false);
      }
   },

   //---------------------------------------------------------
   showX3domHelpContainer: function () {
      var div = document.getElementById("wlzIIPViewerX3domHelpIFrameContainer");
      div.style.visibility = "visible";
   },
   
   //---------------------------------------------------------
   hideX3domHelpContainer: function () {
      var div = document.getElementById("wlzIIPViewerX3domHelpIFrameContainer");
      div.style.visibility = "hidden";
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
      //console.log("%s doExpanded:",this.name);
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

}); // end of class tiledImage3DFeedback
//----------------------------------------------------------------------------
