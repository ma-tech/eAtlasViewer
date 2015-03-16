WlzThreeDViewMode = {
  WLZ_STATUE_MODE:      0,
  WLZ_UP_IS_UP_MODE:    1,
  WLZ_FIXED_LINE_MODE:	2,
  WLZ_ZERO_ZETA_MODE:	3,
  WLZ_ZETA_MODE:	4
}

WlzThreeDViewStruct = function () {
  this.theta 		= 0.0;
  this.phi		= 0.0;
  this.zeta		= 0.0;
  this.xsi		= 0.0;
  this.eta		= 0.0;
  this.dist		= 0.0;
  this.scale		= 1.0;
  this.voxelSize	= [1.0, 1.0, 1.0];
  this.voxelRescale	= 0;
  this.viewMode		= WlzThreeDViewMode.WLZ_STATUE_MODE; // 0
  this.up		= [0.0, 0.0, -1.0];
  this.fixed		= [0.0, 0.0, 0.0];
  this.fixed2		= [0.0, 0.0, 0.0];
  this.fixedLineAngle	= 0.0;

  this.setTheta = function(theta) {
    this.theta = theta;
  }
  this.setPhi = function(phi) {
    this.phi = phi;
  }
  this.setZeta = function(zeta) {
    this.zeta = zeta;
  }
  this.setDist = function(dist) {
    this.dist = dist;
  }
  this.setScale = function(scale) {
    this.scale = scale;
  }
  this.setVoxelSize = function(voxelSize) {
    this.voxelSize = voxelSize;
  }
  this.setVoxelRescaleFlg = function(voxelRescaleFlg) {
    this.voxelRescaleFlg = voxelRescaleFlg;
  }
  this.setViewMode = function(viewMode) {
    this.viewMode = viewMode;
  }
  this.setUp = function(up) {
    this.up = up;
  }
  this.setFixed = function(fixed) {
    this.fixed = fixed;
  }
  this.setFixed2 = function(fixed2) {
    this.fixed2 = fixed2;
  }
  this.setFixedLineAngle = function(fixedLineAngle) {
    this.fixedLineAngle = fixedLineAngle;
  }

  // modifies zeta depending upon WlzThreeDViewMode.
  this.computeAngles = function()
  {
    this.xsi = this.theta;
    this.eta = this.phi;
    switch(this.viewMode){
      case WlzThreeDViewMode.WLZ_STATUE_MODE:
	this.zeta = 0.0 - this.xsi;
	break;
      case WlzThreeDViewMode.WLZ_UP_IS_UP_MODE:
	{
	  var cosT, sinT, cosP, sinP, uppX, uppY;

	  cosT = Math.cos(this.theta);
	  sinT = Math.sin(this.theta);
	  cosP = Math.cos(this.phi);
	  sinP = Math.sin(this.phi);
	  if((this.voxelRescale & 0x1) === 0x1){
	    uppX =  (this.up[0] * this.voxelSize[0] * cosP * cosT) +
		    (this.up[1] * this.voxelSize[1] * cosP * sinT) -
		    (this.up[2] * this.voxelSize[2] * sinP);
	    uppY = -(this.up[0] * this.voxelSize[0] * sinT) +
		    (this.up[1] * this.voxelSize[1] * cosT);
	  }
	  else {
	    uppX =  (this.up[0] * cosP * cosT) +
		    (this.up[1] * cosP * sinT) -
		    (this.up[2] * sinP);
	    uppY = -(this.up[0] * sinT) + (this.up[1] * cosT);
	  }
	  this.zeta = this.viewStructAtan2(uppX, uppY);
	}
	break;
      case WlzThreeDViewMode.WLZ_ZERO_ZETA_MODE:
	zeta = 0.0;
	break;
      case WlzThreeDViewMode.WLZ_ZETA_MODE:
	zeta = this.zeta;
	break;
      case WlzThreeDViewMode.WLZ_FIXED_LINE_MODE:
	{
	  var cosT, sinT, cosP, sinP, uppX, uppY;
	  var fX, fY, fZ;

	  cosT = Math.cos(this.theta);
	  sinT = Math.sin(this.theta);
	  cosP = Math.cos(this.phi);
	  sinP = Math.sin(this.phi);
	  fX = this.fixed2[0] - this.fixed[0];
	  fY = this.fixed2[1] - this.fixed[1];
	  fZ = this.fixed2[2] - this.fixed[2];
	  if((this.voxelRescale & 0x1) === 0x1){
	    fX = fX * this.voxelSize[0];
	    fY = fY * this.voxelSize[1];
	    fZ = fZ * this.voxelSize[2];
	  }
	  uppX = (fX * cosP * cosT + fY * cosP * sinT - fZ * sinP);
	  uppY = (-fX * sinT + fY * cosT);
	  this.zeta = -(this.fixedLineAngle - 
	                this.viewStructAtan2(uppY, uppX));
	}
	break;
      default:
	break;
    }
    // Get zeta into the range 0 to 2*pi
    while(this.zeta > 2.0 * Math.PI){
      this.zeta = this.zeta - 2.0 * Math.PI;
    }
    while(this.zeta < 0.0){
      this.zeta = this.zeta + 2.0 * Math.PI;
    }
  }
  this.viewStructAtan2 = function(x, y) {
    var ang = 0.0;
    var eps = 1.e-6;
    if((Math.abs(y) > eps) || (Math.abs(x) > eps)){
      ang = Math.atan2(x, y);
    }
    return(ang);
  }

}
