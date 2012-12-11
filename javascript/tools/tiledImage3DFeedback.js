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

      this.name = "3DFeedback";
      this.shortName = this.name.toLowerCase().split(" ").join("");

      this.x3d_id = "threeDFeedback";

      this.toolTipText = this.shortName;

      var imagePath = this.model.getInterfaceImageDir();
      //console.log("3DFeedback: imagePath %s",imagePath);

      this.window = new DraggableWindow({targetId:this.targetId,
                                         drag:this.drag,
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

      //console.log("exit tiledImage3DFeedback.initialize");
      this.setToolTip(this.toolTipText);

      this.createElements();

   },

   //---------------------------------------------------------------
   createElements: function () {

      var win;
      var topEdge;
      var threeDInfo;
      var x3dInfo;
      var x3d;
      var scene;
      var group_disc;
      var group_embryo;
      var transform_fix;
      var transform_scl;
      var transform_xsi;
      var transform_eta;
      var transform_zet;
      var transform_dst;
      var transform_sec;
      var shape;
      var appearance;
      var material;
      var transform;
      var inline;
      var viewpoint;
      var background;
      var fxp;
      var fxpTrans;
      var initTrans;
      var disc;
      var discColour;
      var discHeight;
      var discRadius;
      var discRot;
      var discTrans;
      var discTransparency;
      var url;
      var bgCol;
      var styl;
      var stylBorder;
      var stylFloat;
      var stylHeight;
      var stylWidth;
      var stylX;
      var stylY;
      var viewpoints;
      var vp;
      var vpDescription;
      var vpFOV;
      var vpTrans;
      var vpOrient;
      var bgc;
      var bgCol;

      //.................................................
      win = $(this.shortName + '-win');
      topEdge = $(this.shortName + '-topedge');

      x3dInfo = this.model.getX3dInfo();
      threeDInfo = this.model.getThreeDInfo();

      fxp = threeDInfo.fxp.x + " " + threeDInfo.fxp.y + " " + threeDInfo.fxp.z;

      fxpTrans = x3dInfo.fxpTrans.x + " " + x3dInfo.fxpTrans.y + " " + x3dInfo.fxpTrans.z;
      initTrans = x3dInfo.initTrans.x + " " + x3dInfo.initTrans.y + " " + x3dInfo.initTrans.z;

      disc = x3dInfo.disc;
      discColour = disc.colour.r + " " + disc.colour.g + " " + disc.colour.b;
      discHeight = disc.height;
      discRadius = disc.radius;
      discRot = disc.rot.xsi + " " + disc.rot.eta + " " + disc.rot.zeta + " " + disc.rot.rad;
      discTrans = disc.trans.x + " " + disc.trans.y + " " + disc.trans.z;
      discTransparency = disc.transparency;

      url = x3dInfo.url;

      styl = x3dInfo.style;
      stylBorder = styl.border;
      stylFloat = styl.float;
      stylHeight = styl.height;
      stylWidth = styl.width;
      stylX = styl.x;
      stylY = styl.y;

      vp = x3dInfo.viewpoints[0]; // only consider 1 at the moment
      vpDescription = vp.description;
      vpFOV = vp.fov;
      vpTrans = vp.trans.x + " " + vp.trans.y + " " + vp.trans.z;
      vpOrient = vp.orient.xsi + " " + vp.orient.eta + " " + vp.orient.zeta + " " + vp.orient.rad;

      bgc = x3dInfo.bgCol;
      bgCol = bgc.r + " " + bgc.g + " " + bgc.b;

      if(this._debug) {
         console.log("==================================================================");
         console.log("fxp", fxp);
         console.log("fxpTrans ", fxpTrans);
         console.log("initTrans ", initTrans);
         console.log("discColour ", discColour);
         console.log("discHeight ", discHeight);
         console.log("discRadius ", discRadius);
         console.log("discRot ", discRot);
         console.log("discTrans ", discTrans);
         console.log("discTransparency ", discTransparency);
         console.log(url);
         console.log("stylBorder ",stylBorder);
         console.log("stylFloat ",stylFloat);
         console.log("stylHeight ",stylHeight);
         console.log("stylWidth ",stylWidth);
         console.log("stylX ",stylX);
         console.log("stylY ",stylY);
         console.log("vpDescription ",vpDescription);
         console.log("vpFOV ",vpFOV);
         console.log("vpTrans ",vpTrans);
         console.log("vpOrient ",vpOrient);
         console.log("bgCol ",bgCol);
         console.log("==================================================================");
      }

      //.................................................
      x3d = document.createElement('X3D');
      x3d.setAttribute('id', this.x3d_id);
      x3d.setAttribute('xmlns', 'http://www.web3d.org/specifications/x3d-namespace');
      x3d.setAttribute('showlog', 'false');
      x3d.setAttribute('showStat', 'false');
      x3d.setAttribute('width', stylWidth);  // required for flash fallback case
      x3d.setAttribute('height', stylHeight);  // required for flash fallback case
      x3d.setStyle('x', stylX);
      x3d.setStyle('y', stylY);
      x3d.setStyle('width', stylWidth);
      x3d.setStyle('height', stylHeight);
      x3d.setStyle('border', stylBorder);
      x3d.style.float = stylFloat;

      scene = document.createElement('Scene');
      scene.setAttribute('DEF', 'scene');

      group_disc = document.createElement('Group');

      transform_fix = document.createElement('Transform');
      transform_fix.setAttribute('id', 'fixTr');
      transform_fix.setAttribute('translation', fxpTrans);

      transform_scl = document.createElement('Transform');
      transform_scl.setAttribute('id', 'sclTr');
      transform_scl.setAttribute('scale', '1.0 1.0 1.0');

      transform_xsi = document.createElement('Transform');
      transform_xsi.setAttribute('id', 'xsiTr');
      transform_xsi.setAttribute('rotation', '0 0 1 0.0');
      transform_xsi.setAttribute('center', initTrans);

      transform_eta = document.createElement('Transform');
      transform_eta.setAttribute('id', 'etaTr');
      transform_eta.setAttribute('rotation', '0 1 0 0.0');
      transform_eta.setAttribute('center', initTrans);

      transform_zet = document.createElement('Transform');
      transform_zet.setAttribute('id', 'zetTr');
      transform_zet.setAttribute('rotation', '1 0 0 0.0');
      transform_zet.setAttribute('center', initTrans);

      transform_dst = document.createElement('Transform');
      transform_dst.setAttribute('id', 'dstTr');
      transform_dst.setAttribute('translation', initTrans);
      //console.log("this.transform_dst ",this.transform_dst);

      transform_sec = document.createElement('Transform');
      transform_sec.setAttribute('id', 'secTr');
      transform_sec.setAttribute('translation', discTrans);
      transform_sec.setAttribute('rotation', discRot);

      shape = document.createElement('Shape');

      appearance = document.createElement('Appearance');

      material = document.createElement('Material');
      material.setAttribute('id', 'secMat');
      material.setAttribute('diffuseColor', discColour);
      material.setAttribute('transparency', discTransparency);

      cylinder = document.createElement('Cylinder');
      cylinder.setAttribute('id', 'section');
      cylinder.setAttribute('radius', discRadius);
      cylinder.setAttribute('height', discHeight);

      group_embryo = document.createElement('Group');

      transform = document.createElement('Transform');

      inline = document.createElement('Inline');
      inline.setAttribute('DEF', 'embryonic');
      //inline.setAttribute('url', 'obj/embryonicvs111gml.x3d');
      inline.setAttribute('url', url);

      viewpoint = document.createElement('Viewpoint');
      viewpoint.setAttribute('fieldOfView', vpFOV);
      //viewpoint.setAttribute('position', '230 140 2000');
      viewpoint.setAttribute('position', vpTrans);
      viewpoint.setAttribute('description', vpDescription);
      viewpoint.setAttribute('orientation', vpOrient);
      //viewpoint.setAttribute('centerOfRotation', '230 140 150');
      viewpoint.setAttribute('centerOfRotation', fxp);

      background = document.createElement('Background');
      background.setAttribute('skyColor', bgCol);

      //------------------------------------------------------------------
      win.appendChild(x3d);

      x3d.appendChild(scene);

      scene.appendChild(viewpoint);
      scene.appendChild(background);
      scene.appendChild(group_disc);
      scene.appendChild(group_embryo);

      group_disc.appendChild(transform_fix);
      transform_fix.appendChild(transform_scl);
      transform_scl.appendChild(transform_xsi);
      transform_xsi.appendChild(transform_eta);
      transform_eta.appendChild(transform_zet);
      transform_zet.appendChild(transform_dst);
      transform_dst.appendChild(transform_sec);

      transform_sec.appendChild(shape);

      shape.appendChild(appearance);
      shape.appendChild(cylinder);

      appearance.appendChild(material);

      group_embryo.appendChild(transform);

      transform.appendChild(inline);

      //------------------------------------------------------------------
      //console.log("finished creating x3d elements");
      return false;
   }, // createElements

   //---------------------------------------------------------------
   modelUpdate: function(modelChanges, from) {

      if(modelChanges.sectionChanged === true) {
         //console.log("tiledImage3DFeedback sectionChanged:");
         this.setNewPos();
      }

   }, // modelUpdate

   //---------------------------------------------------------------
   viewUpdate: function(viewChanges) {

      //console.log("tiledImage3DFeedback viewUpdate:");

      // do the setting up stuff
      if(viewChanges.initial === true) {
	 //console.log("locator: viewChanges.initial %s",viewChanges.initial);
	 this.isWlz = this.model.isWlzData();
	 this.window.setVisible(true);
	 this.window.setDimensions(this.width,this.height);

         x3dom.reload();
         this.setInitialPos();
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
   setInitialPos: function () {

      //console.log("setInitialPos");
      // Section transform parameters
      var sDstV = 0;
      var sPitV = 0;
      var sYawV = 0;
      var sRolV = 0;
      var sSclV = 1;
      var sFxxV = 0;
      var sFxyV = 0;
      var sFxzV = 0;
      var sModV = WlzThreeDViewMode.WLZ_UP_IS_UP_MODE;

      this.secTransformSet(sModV, sDstV, sPitV, sYawV, sRolV, sSclV,
	    sFxxV, sFxyV, sFxzV);

   }, // setInitialPos

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
      //scl = this.view.getScale().cur;
      
      dst = threeD.dst.cur;
      pit = threeD.pitch.cur * this.toRad;
      yaw = threeD.yaw.cur * this.toRad;
      rol = threeD.roll.cur * this.toRad;

      fpx = threeD.fxp.x;
      fpy = threeD.fxp.y;
      fpz = threeD.fxp.z;

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
      //fxx = 223; fxy = 136; fxz = 152; // Bad HACK!
      var tr = new WlzThreeDViewStruct();
      tr.setViewMode(mod);
      tr.setDist(dst)
      tr.setTheta(yaw);
      tr.setPhi(pit);
      tr.setZeta(rol);
      tr.setScale([scl, scl, scl]);
      tr.setFixed([fxx, fxy, fxz]);
      tr.computeAngles();
      dTr.setAttribute('translation', '0 0 ' + tr.dist);
      xTr.setAttribute('rotation',    '0 0 1 ' + tr.xsi);
      eTr.setAttribute('rotation',    '0 1 0 ' + tr.eta);
      zTr.setAttribute('rotation',    '0 0 1 ' + tr.zeta);
      sTr.setAttribute('scale',       1.0 / tr.scale[0] + ' ' + 1.0 / tr.scale[1] + ' ' + 1.0 / tr.scale[2]);
      fTr.setAttribute('translation', tr.fixed[0] + ' ' + tr.fixed[1] + ' ' + tr.fixed[2]);
   }, // setInitialPos

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
   }

}); // end of class tiledImage3DFeedback
//----------------------------------------------------------------------------
