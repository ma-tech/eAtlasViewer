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
// the 'if' prevents overwriting existing namespace
//---------------------------------------------------------
if(!emouseatlas) {
   var emouseatlas = {};
}
if(!emouseatlas.emap) {
   emouseatlas.emap = {};
}

//---------------------------------------------------------
// encapsulating threeDUtils in an object preserves namespace
//---------------------------------------------------------
if(!emouseatlas.emap.threeDUtils) {

   emouseatlas.emap.threeDUtils = {

      // the rotation sequence types
      //---------------------------------------------------------
      TYPE_1:                      1,    // non-circular, repeated axis:	131, 212, 323
      TYPE_2:                      2,    // non-circular, non-repeated axis:	132, 213, 321
      TYPE_3:                      3,    // circular, repeated axis:		121, 232, 313
      TYPE_4:                      4,    // circular, non-repeated axis:	123, 231, 312
      //---------------------------------------------------------
      MINVAL: 0.00000000001,

      DEBUG: false,


      //---------------------------------------------------------
      doDebug: function () {

	 var q = {x:0.360423, y:0.439679, z:0.391904, w:0.723317};
	 var rotOrder = [3,1,2];
	 var eulers;
	 
	 eulers = emouseatlas.emap.threeDUtils.quatToEuler(q, rotOrder);
	 console.log(eulers);
      },

      //---------------------------------------------------------
      degToRad: function (deg) {
	 var rad;
	 rad =  (Math.PI / 180.0) * deg;
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("%d deg = %d rad",deg,rad);

	 return rad;
      },

      //---------------------------------------------------------
      radToDeg: function (rad) {
	 var deg;
	 deg =  (180.0 / Math.PI) * rad;
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("%d rad = %d deg ",rad,deg);

	 return deg;
      },

      //---------------------------------------------------------
      eulerToQuat: function (yaw, pitch, roll, rads) {

         var w;
         var x;
         var y;
         var z;
         var c1;
         var c2;
         var c3;
         var s1;
         var s2;
         var s3;
	 var nmin;
	 var ret = {};

         //nmin = Math.MIN_VALUE;

         nmin = 0.00001;
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("Math.MIN_VALUE ",nmin);

	 yaw = rads ? yaw : emouseatlas.emap.threeDUtils.degToRad(yaw);
	 pitch = rads ? pitch : emouseatlas.emap.threeDUtils.degToRad(pitch);
	 roll = rads ? roll : emouseatlas.emap.threeDUtils.degToRad(roll);
         
	 c1 = Math.cos(yaw / 2.0);
	 c2 = Math.cos(pitch / 2.0);
	 c3 = Math.cos(roll / 2.0);
	 s1 = Math.sin(yaw / 2.0);
	 s2 = Math.sin(pitch / 2.0);
	 s3 = Math.sin(roll / 2.0);

	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("eulerToQuaternion: c1 %d, c2 %d, c3 %d",c1,c2,c3);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("eulerToQuaternion: s1 %d, s2 %d, s3 %d",s1,s2,s3);

	 w = c1*c2*c3 - s1*s2*s3;
	 x = s1*s2*c3 + c1*c2*s3;
	 y = s1*c2*c3 + c1*s2*s3;
	 z = c1*s2*c3 - s1*c2*s3;


	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("eulerToQuaternion: w %d, x %d, y %d, z %d ",w,x,y,z);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("eulerToQuaternion: abs values  w %d",Math.abs(w));

	 ret.w = Math.abs(w) > nmin ? w : 0.0;
	 ret.x = Math.abs(x) > nmin ? x : 0.0;
	 ret.y = Math.abs(y) > nmin ? y : 0.0;
	 ret.z = Math.abs(z) > nmin ? z : 0.0;

	 return ret;

      }, //eulerToQuat

      // we need to know the order of rotation used.
      // we will assume it is 312 or zxy as this is the example in 
      // the technical note by Noel Hughes that this is taken from
      //---------------------------------------------------------
      quatToEuler: function (Qg, rotOrder) {

	 var rads; // true if we want the results in radians
	 var type;
         var V3;
         var V3rot;
	 var Qgnorm; // make sure the input quaternion is normalised.
	 var theta_1_2;
	 var theta2;
	 var theta3;

	 rads = false;

	 type = emouseatlas.emap.threeDUtils.rotSeqType(rotOrder);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("rotSeqType ",type);

         Qgnorm = emouseatlas.emap.threeDUtils.normaliseQuat(Qg);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("Qgnorm ",Qgnorm);

	 V3 = emouseatlas.emap.threeDUtils.getVecN(rotOrder, 3);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3 ",V3);

	 V3rot = emouseatlas.emap.threeDUtils.rotateVecByQuat(V3, Qgnorm);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3rot ",V3rot);

	 theta_1_2 = emouseatlas.emap.threeDUtils.getTheta_1_2(V3rot, rotOrder, rads);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("theta_1_2 ",theta_1_2);

	 theta_3 = emouseatlas.emap.threeDUtils.getTheta_3(theta_1_2, rotOrder, Qgnorm, V3rot, rads);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("theta_3 ",theta_3);

	 return {theta1:theta_1_2[0], theta2:theta_1_2[1], theta3:theta_3};
      },

      //---------------------------------------------------------
      getVecN: function (order,n) {

	  var ret = {};
	  var which;

	  which = order[n-1];

	  switch(which) {
	     case 1:
		ret = {x:1, y:0, z:0};
		break;
	     case 2:
		ret = {x:0, y:1, z:0};
		break;
	     case 3:
		ret = {x:0, y:0, z:1};
		break;
	  }

	  return ret;
      },

      //---------------------------------------------------------
      getTheta_1_2: function (V3rot, rotOrder, rads) {

	  var ret;
	  var type;
	  var opp;
	  var adj;
	  var i1;
	  var i2;
	  var i3;
	  var V3rot_arr;
	  var V3rot_i1;
	  var V3rot_i1n;
	  var V3rot_i1nn;
	  var theta1_rad;
	  var theta1_deg;
	  var theta2_rad;
	  var theta2_deg;
	  var arg;

	  V3rot_arr = [V3rot.x, V3rot.y, V3rot.z];

	  type = emouseatlas.emap.threeDUtils.rotSeqType(rotOrder);

	  i1 = rotOrder[0] -1;
	  i2 = rotOrder[1] -1;
	  i3 = rotOrder[2] -1;

          V3rot_i1 = V3rot_arr[i1];
          V3rot_i1n = V3rot_arr[i2];
          V3rot_i1nn = V3rot_arr[i3];
          if(emouseatlas.emap.threeDUtils.DEBUG) console.log("rotOrder ",rotOrder);
          if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3rot_i1 %d, V3rot_i1n %d, V3rot_i1nn %d",V3rot_i1, V3rot_i1n, V3rot_i1nn);

	  switch(type) {
	     case 1:
		opp = V3rot_i1nn;
		adj = V3rot_i1n;
		arg =  opp / adj;
		theta1_rad = Math.atan(arg);
		theta1_deg = emouseatlas.emap.threeDUtils.radToDeg(theta1_rad);

		arg = V3rot_i1;
		theta2_rad = Math.acos(arg);
		theta2_deg = emouseatlas.emap.threeDUtils.radToDeg(theta2_rad);
		break;
	     case 2:
		opp = V3rot_i1nn;
		adj = V3rot_i1n;
		arg = opp / adj;
		theta1_rad = Math.atan(arg);
		theta1_deg = emouseatlas.emap.threeDUtils.radToDeg(theta1_rad);

		arg = V3rot_i1;
		theta2_rad = -1 * Math.asin(arg);
		theta2_deg = emouseatlas.emap.threeDUtils.radToDeg(theta2_rad);
		break;
	     case 3:
		opp = V3rot_i1n;
		adj = V3rot_i1nn;
		arg = -1 * opp / adj;
		theta1_rad = Math.atan(arg);
		theta1_deg = emouseatlas.emap.threeDUtils.radToDeg(theta1_rad);

		arg = V3rot_i1;
		theta2_rad = Math.acos(arg);
		theta2_deg = emouseatlas.emap.threeDUtils.radToDeg(theta2_rad);
		break;
	     case 4:
		opp = V3rot_i1n;
		adj = V3rot_i1nn;
		arg = -1 * opp / adj;
		theta1_rad = Math.atan(arg);
		theta1_deg = emouseatlas.emap.threeDUtils.radToDeg(theta1_rad);

		arg = V3rot_i1;
		theta2_rad = Math.asin(arg);
		theta2_deg = emouseatlas.emap.threeDUtils.radToDeg(theta2_rad);
		break;
	  }

	  ret = [];
	  ret[0] = rads ? emouseatlas.emap.threeDUtils.fixn(theta1_rad, 8) : emouseatlas.emap.threeDUtils.fixn(theta1_deg, 4);
	  ret[1] = rads ? emouseatlas.emap.threeDUtils.fixn(theta2_rad, 8) : emouseatlas.emap.threeDUtils.fixn(theta2_deg, 4);

	  return ret;
      },

      //---------------------------------------------------------
      getTheta_3: function (theta_1_2, rotOrder, Qgnorm, V3rot, rads) {

	  var ret;
	  var i1;
	  var i2;
	  var i3;
	  var i3n;
	  var Q1;
	  var Q2;
	  var Q12;
	  var Q1arr;
	  var Q2arr;
	  var Q12arr;
	  var halfTheta1;
	  var halfTheta2;
	  var cosHalfTheta1;
	  var cosHalfTheta2;
	  var sinHalfTheta1;
	  var sinHalfTheta2;
	  var V3n;
	  var V3n12;
	  var V3ng;
	  var V3n12DotV3ng;
	  var V3n12CrossV3ng;
	  var slope;
	  var magTheta3;
	  var signTheta3;
	  var theta3;

          halfTheta1 = theta_1_2[0] / 2.0;
          halfTheta2 = theta_1_2[1] / 2.0;

	  if(!rads) {
	     halfTheta1 = emouseatlas.emap.threeDUtils.degToRad(halfTheta1);
	     halfTheta2 = emouseatlas.emap.threeDUtils.degToRad(halfTheta2);
	  }

	  cosHalfTheta1 = Math.cos(halfTheta1);
	  cosHalfTheta1 = emouseatlas.emap.threeDUtils.fixn(cosHalfTheta1, 6);

	  cosHalfTheta2 = Math.cos(halfTheta2);
	  cosHalfTheta2 = emouseatlas.emap.threeDUtils.fixn(cosHalfTheta2, 6);

	  sinHalfTheta1 = Math.sin(halfTheta1);
	  sinHalfTheta1 = emouseatlas.emap.threeDUtils.fixn(sinHalfTheta1, 6);

	  sinHalfTheta2 = Math.sin(halfTheta2);
	  sinHalfTheta2 = emouseatlas.emap.threeDUtils.fixn(sinHalfTheta2, 6);

	  i1 = rotOrder[0] -1;
	  i2 = rotOrder[1] -1;
	  i3 = rotOrder[2] -1;
	  i3n = i1;

	  Q1arr = [0.0, 0.0, 0.0, cosHalfTheta1]
	  Q1arr[i1] = sinHalfTheta1;
	  Q1 = {x:Q1arr[0], y:Q1arr[1], z:Q1arr[2], w:Q1arr[3]};

	  Q2arr = [0.0, 0.0, 0.0, cosHalfTheta2]
	  Q2arr[i2] = sinHalfTheta2;
	  Q2 = {x:Q2arr[0], y:Q2arr[1], z:Q2arr[2], w:Q2arr[3]};

	  Q12 = emouseatlas.emap.threeDUtils.multiplyQuat(Q1,Q2);
	  Q12 = emouseatlas.emap.threeDUtils.quatFixn(Q12, 6);

	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("Q1 ",Q1);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("Q2 ",Q2);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("Q12 ",Q12);

	  V3nArr = [0.0, 0.0, 0.0];
	  V3nArr[i3n] = 1.0;
	  V3n = {x:V3nArr[0], y:V3nArr[1], z:V3nArr[2]}; 
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3n ",V3n);

	  V3n12 = emouseatlas.emap.threeDUtils.rotateVecByQuat(V3n,Q12);
	  V3ng = emouseatlas.emap.threeDUtils.rotateVecByQuat(V3n,Qgnorm);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3n12 ",V3n12);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3ng ",V3ng);

	  V3n12DotV3ng = emouseatlas.emap.threeDUtils.dotProduct(V3n12, V3ng);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3n12DotV3ng ",V3n12DotV3ng);

	  magTheta_3 = Math.acos(V3n12DotV3ng);
	  magTheta_3 = rads ? emouseatlas.emap.threeDUtils.radToDeg(magTheta_3) : emouseatlas.emap.threeDUtils.radToDeg(magTheta_3);
	  magTheta_3 = rads ? emouseatlas.emap.threeDUtils.fixn(magTheta_3, 8) : emouseatlas.emap.threeDUtils.fixn(magTheta_3, 4);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("magTheta_3 ",magTheta_3);

	  V3n12CrossV3ng = emouseatlas.emap.threeDUtils.crossProduct(V3n12, V3ng);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("V3n12CrossV3ng ",V3n12CrossV3ng);

          slope = emouseatlas.emap.threeDUtils.dotProduct(V3n12CrossV3ng, V3rot);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("slope ",slope);

	  signTheta_3 = emouseatlas.emap.threeDUtils.signof(slope);
	  if(emouseatlas.emap.threeDUtils.DEBUG) console.log("signTheta_3 ",signTheta_3);

	  theta_3 = signTheta_3 ? magTheta_3 : -1 * magTheta_3;

	  return theta_3;

      },  // getTheta_3

      //---------------------------------------------------------
      quatTo3x3: function (q) {
      },

      //---------------------------------------------------------
      axisAngleToQuat: function (x, y, z, ang, rads) {

         var qw;
         var qx;
         var qy;
         var qz;
         var s;
         var c;
	 var nmin;
	 var ret = {};

         //nmin = Math.MIN_VALUE;

         nmin = 0.00001;

	 ang = rads ? ang : emouseatlas.emap.threeDUtils.degToRad(ang);

	 s = Math.sin(ang/2);
	 c = Math.cos(ang/2);

	 s = Math.abs(s) > nmin ? s : 0;
	 c = Math.abs(c) > nmin ? c : 0;

	 qx = x * s;
	 qy = y * s;
	 qz = z * s;
	 qw = c;

	 return {w:qw, x:qx, y:qy, z:qz};;
      },

      //---------------------------------------------------------
      quatToAxisAngle: function (q, rads) {

         var x;
         var y;
         var z;
	 var nmin;
	 var nquat;
	 var angle;
	 var sr;
	 var ret;

	 // NOTE:  look at sign for various components (lots of minus signs!)

	 nquat = {};
	 ret = {};

         //nmin = Math.MIN_VALUE;

         nmin = 0.00001;

	 //ang = rads ? ang : emouseatlas.emap.threeDUtils.degToRad(ang);

	 //if (qw > 1) {
	    nquat = emouseatlas.emap.threeDUtils.normaliseQuat({w:q.w, x:q.x, y:q.y, z:q.z}); // if qw>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
	 //}

	 angle = 2.0 * Math.acos(nquat.w);

	 sr = Math.sqrt(1 - nquat.w * nquat.w); // assuming quaternion normalised then w is less than 1, so term always positive.

	 if (sr < 0.001) { // test to avoid divide by zero, sr is always positive due to sqrt. If sr close to zero then direction of axis not important
	    x = nquat.x;     // if it is important that axis is normalised then replace with x=1; y=z=0;
	    y = nquat.y;
	    z = nquat.z;
	 } else {
	    x = nquat.x / sr; // normalise axis
	    y = nquat.y / sr;
	    z = nquat.z / sr;
	 }

	 return {x:x, y:y, z:z, angle:angle};;
      },

      //---------------------------------------------------------
      normaliseQuat: function (quat) {

         var sumsqrs;
         var mag;
	 var nquat;
	 var ret;

	 sumsqrs = quat.w * quat.w + quat.x * quat.x + quat.y * quat.y + quat.z * quat.z

         mag = Math.sqrt(sumsqrs);

	 nquat = quat;

	 nquat.w = nquat.w / mag;
	 nquat.x = nquat.x / mag;
	 nquat.y = nquat.y / mag;
	 nquat.z = nquat.z / mag;

	 ret = emouseatlas.emap.threeDUtils.quatFixn(nquat, 10);

	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("normaliseQuat: quat = ",ret);
	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("normaliseQuat: nquat = ",ret);

         return ret;

      },

      //---------------------------------------------------------
      multiplyQuat: function (q1, q2) {

         var qres;
         var ret;
         var w1;
         var w2;
         var x1;
         var x2;
         var y1;
         var y2;
         var z1;
         var z2;

         w1 = q1.w;
         w2 = q2.w;
         x1 = q1.x;
         x2 = q2.x;
         y1 = q1.y;
         y2 = q2.y;
         z1 = q1.z;
         z2 = q2.z;

         qres = {};
         qres.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
         qres.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
         qres.y = w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2;
         qres.z = w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2;

	 ret = emouseatlas.emap.threeDUtils.quatFixn(qres, 6);

	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("multiplyQuat: quats ",q1,q2,ret);

         return ret;

      },

      //---------------------------------------------------------
      vecMag: function (vec) {

         var sum;
         var mag;
         var ret;

         sum = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
         mag = Math.sqrt(sum);

	 ret = emouseatlas.emap.threeDUtils.fixn(mag, 6);

         if(emouseatlas.emap.threeDUtils.DEBUG) console.log("magnitude of ",vec,", ",ret);

         return ret;
      },

      //---------------------------------------------------------
      dotProduct: function (v1, v2) {

         var dotty;

         dotty = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

         if(emouseatlas.emap.threeDUtils.DEBUG) console.log("dot product of ",v1,v2,dotty);

         return dotty;
      },

      //---------------------------------------------------------
      crossProduct: function (v1, v2) {

         var c1;
         var c2;
         var c3;
	 var cross;
	 var ret;

         c1 = v1.y * v2.z - v1.z * v2.y;
         c2 = v1.z * v2.x - v1.x * v2.z;
         c3 = v1.x * v2.y - v1.y * v2.x;

         cross = {x:c1, y:c2, z:c3};
	 ret = emouseatlas.emap.threeDUtils.quatFixn(cross, 6);

         if(emouseatlas.emap.threeDUtils.DEBUG) console.log("cross product of ",v1,v2,ret);

         return ret;
      },

      //---------------------------------------------------------
      rotateVecByQuat: function (vec,q) {

         var qvec;
         var conj;
	 var prod1;
	 var prod2;
	 var vrot;
	 var ret;

         qvec = {x:vec.x, y:vec.y, z:vec.z, w:0};
         conj = {x:-q.x, y:-q.y, z:-q.z, w:q.w};

	 prod1 = emouseatlas.emap.threeDUtils.multiplyQuat(q, qvec);

	 prod2 = emouseatlas.emap.threeDUtils.multiplyQuat(prod1, conj);

	 vrot = {x:prod2.x, y:prod2.y, z:prod2.z}; 

	 ret = emouseatlas.emap.threeDUtils.vecFixn(vrot,6);

	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("rotateVecByQuat: ",vec,q,ret);

	 return ret;
      },

      //---------------------------------------------------------
      quatFixn: function (q, n) {

	 var ret;
	 var x;
	 var y;
	 var z;
	 var w;

         x = q.x && !isNaN(q.x) ? q.x.toFixed(n) : 0;
         y = q.y && !isNaN(q.y) ? q.y.toFixed(n) : 0;
         z = q.z && !isNaN(q.z) ? q.z.toFixed(n) : 0;
         w = q.w && !isNaN(q.w) ? q.w.toFixed(n) : 0;

         x = Math.abs(x) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(x);
         y = Math.abs(y) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(y);
         z = Math.abs(z) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(z);
         w = Math.abs(w) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(w);

	 ret = {x:x, y:y, z:z, w:w};

	 return ret;
      },

      //---------------------------------------------------------
      vecFixn: function (vec, n) {

	 var ret;
	 var x;
	 var y;
	 var z;

         x = vec.x && !isNaN(vec.x) ? vec.x.toFixed(n) : 0;
         y = vec.y && !isNaN(vec.y) ? vec.y.toFixed(n) : 0;
         z = vec.z && !isNaN(vec.z) ? vec.z.toFixed(n) : 0;

         x = Math.abs(x) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(x);
         y = Math.abs(y) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(y);
         z = Math.abs(z) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(z);

	 ret = {x:x, y:y, z:z};

	 return ret;
      },

      //---------------------------------------------------------
      fixn: function (num, n) {

	 var ret;
	 var tmp;

         if(typeof(num) === "string") {
	    tmp = parseFloat(num);
	    if(isNaN(tmp)) {
	       return undefined;
	    }
	 } else {
	    tmp = num;
	 }

	 if(emouseatlas.emap.threeDUtils.DEBUG) console.log("typeof tmp is ",typeof(tmp));

         ret = !isNaN(tmp) ? tmp.toFixed(n) : 0;
         ret = Math.abs(ret) < emouseatlas.emap.threeDUtils.MINVAL ? 0 : Number(ret);

	 return ret;
      },

      //---------------------------------------------------------
      rotSeqType: function (order) {

         var one;
         var two;
         var three;

	 one = order[0];
	 two = order[1];
	 three = order[2];

         switch(one) {
	    //................................
            case 1:
               switch(two) {
                  case 2:
                     switch(three) {
                        case 1:
			   type = emouseatlas.emap.threeDUtils.TYPE_3		// 121
            	           break;
                        case 3:
			   type = emouseatlas.emap.threeDUtils.TYPE_4		// 123
            	           break;
                     }
      	             break;
                  case 3:
                     switch(three) {
                        case 1:
			   type = emouseatlas.emap.threeDUtils.TYPE_1		// 131
            	           break;
                        case 2:
			   type = emouseatlas.emap.threeDUtils.TYPE_2		// 132
            	           break;
                     }
      	             break;
               }
	       break;
	    //................................
            case 2:
               switch(two) {
                  case 1:
                     switch(three) {
                        case 2:
			   type = emouseatlas.emap.threeDUtils.TYPE_1		// 212
            	           break;
                        case 3:
			   type = emouseatlas.emap.threeDUtils.TYPE_2		// 213
            	           break;
                     }
      	             break;
                  case 3:
                     switch(three) {
                        case 1:
			   type = emouseatlas.emap.threeDUtils.TYPE_4		// 231
            	           break;
                        case 2:
			   type = emouseatlas.emap.threeDUtils.TYPE_3		// 232
            	           break;
                     }
      	             break;
               }
	       break;
	    //................................
            case 3:
               switch(two) {
                  case 1:
                     switch(three) {
                        case 2:
			   type = emouseatlas.emap.threeDUtils.TYPE_4		// 312
            	           break;
                        case 3:
			   type = emouseatlas.emap.threeDUtils.TYPE_3		// 313
            	           break;
                     }
      	             break;
                  case 2:
                     switch(three) {
                        case 1:
			   type = emouseatlas.emap.threeDUtils.TYPE_2		// 321
            	           break;
                        case 3:
			   type = emouseatlas.emap.threeDUtils.TYPE_1		// 323
            	           break;
                     }
      	             break;
               }
	       break;
         }

         return type;

      }, // rotSeqType:

      //---------------------------------------------------------
      signof: function (x) {
          return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
      }


   }; // emouseatlas.emap.threeDUtils

}
