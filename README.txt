=========================================
    typical 3D IIP viewer structure
=========================================

====
Note:
====
--------------------------------------------------------------------------------------------------------------------------------------------------------
i)    The directory structure is somewhat flexible as it is specified in the main configuration file (see below).
ii)   The path to the main configuration file is specified in your .php file
      (for example: "modelDataUrl":"/eAtlasViewer_dev/application/kaufman/plate33a/tiledImageModelData.jso")
iii)  The name of the main configuration file can be whatever you like but for the rest of this README it will be referred to as tiledImageModelData.jso
iv)   The configuration files are in json format. They should be visible to web browsers (ie below the document root of your web server).
--------------------------------------------------------------------------------------------------------------------------------------------------------

===========
Directories:
===========
--------------------------------------------------------------------------------------------------------------------------------------------------------
application ---            Configuration files for the 3D IIP Viewer, such as 
                           tiledImageModelData.jso: (location of web server, IIP server, image data, initial conditions etc),
		           tileImageToolParams.jso: (selection configuration and positioning of various interface tools)
		           Application specific stylesheet (for example application/<project name>/project.css) which must be referenced from your .php file.

application/menu ---       Configuration files for menus used in the 3D IIP Viewer (the actual location is specified in tiledImageModelData.jso).
application/tree ---       Configuration files for trees used in the 3D IIP Viewer (the actual location is specified in tiledImageModelData.jso).
application/images ---     Application specific images for use in the 3D IIP Viewer interface (the actual location is specified in a javascript file).
.................................
javascript ---             tiledImageView.js and tiledImageModel.js (these are the MVC kernel of the IIP Viewer).

javascript/tools ---       various interface tools
javascript/utils ---       various interface utilities
javascript/thirdParty ---  javascript libraries, including MooTools, json2 and mifTree
.................................
css  ---                   Style sheets for the 3D IIP Viewer.
css/tools ---              Style sheets for the 3D IIP Viewer tools.
css/utils ---              Style sheets for the 3D IIP Viewer utils such as menus.

Note: Application-specific style sheets should go in (for example) application/<project name>/project.css and be referenced from your .php file 
.................................
images ---                 Images used in the 3D IIP Viewer interface.

Note: Application-specific images should go in (for example) application/<project name>/images.
.................................
html ---                   Web pages for 'help' and 'info' content in the 3D IIP Viewer interface. Used in IFrames.

Note: Application-specific web pages should go in (for example) application/<project name>/html.
--------------------------------------------------------------------------------------------------------------------------------------------------------


==============================
Typical client / server set-up:
==============================
--------------------------------------------------------------------------------------------------------------------------------------------------------
3D IIP Server ---         Is an fcgi application on a server machine.
.................................
image data ---            Typically lives on the same machine as the 3D IIP Server (the path to the image data is specified in tiledImageModelData.jso).
.................................
3D IIP Viewer ---         Is a web application on a web-server machine which is typically different from the 3D IIP Server machine.
                          The viewer is run by a web browser visiting your .php file.
.................................
Image requests ---        The apache configuration file 'http.conf' on the 3D IIP Viewer machine should be configured to forward fcgi requests to a port on the 3D IIP Server.
                          Images are requested by sending a url to the 3D IIP Server. Details may be found in the EMAP Technical Report 'IIP extension for Woolz sectioning'.
.................................


=========================
javascript debug messages:
=========================
--------------------------------------------------------------------------------------------------------------------------------------------------------
console.log ---          The 3D IIP Viewer will not run if console.log messages are being used and firebug is not open.
                         For this reason comment out all console.log messages before releasing a version of the 3D IIP Viewer.


===============================================================================================================================================================================

