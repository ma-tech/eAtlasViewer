<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

<?php
   $query = $_SERVER["QUERY_STRING"];
   $paramArray = array();
   parse_str($query, $paramArray);
?>

      <script type="text/javascript"> 
         function doOnload() { 
      jso = { 
         "modelDataUrl":"../../../application/zebrafish/sections/coronal/tiledImageModelData.jso", 
         "urlSpecifiedSection":"<?php echo $paramArray["section"] ?>" 
      }
         emouseatlas.emap.tiledImageModel.initialise(jso); 
         } 
      </script> 
      
      <head> 
      
      <meta name="keywords" content="Internet Imaging Protocol IIP IIPImage" />
      <meta name="description" content="High Resolution Remote Image Viewing" />
      <meta name="copyright" content="&copy; 2003-2007 Ruven Pillay" />

      <link rel="stylesheet" type="text/css" media="all" href="../../../application/zebrafish/sections/project.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tiledImage.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tooltips.css" />
      
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/layer.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/layerProperties.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/query.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/querySection.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/queryTerm.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/draggableWindow.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/rotation.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/fixedPoint.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/scale.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/scalebar.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/refresh.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/measuring.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/selector.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/locator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/expressionKey.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/tools/slider.css" />
 
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/utils/busyIndicator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="../../../css/utils/marker.css" />
      <link rel="stylesheet" media="all" type="text/css" href="../../../css/utils/help.css" />  
      <link rel="stylesheet" media="all" type="text/css" href="../../../css/utils/emapMenu.css" />

      <link rel="stylesheet" media="all" type="text/css" href="../../../css/tree/tree.css" />
      <link rel="stylesheet" media="all" type="text/css" href="../../../css/tree/colourPick.css" />                    
      <link rel="stylesheet" media="all" type="text/css" href="../../../css/tree/autocomplete.css" />      

      <script type="text/javascript" src="../../../javascript/thirdParty/json2.js"></script>
      <script type="text/javascript" src="../../../javascript/thirdParty/mootools-core-1.3.2.js"></script>
      <script type="text/javascript" src="../../../javascript/thirdParty/mootools-more-1.3.2.1.js"></script>
      <script type="text/javascript" src="../../../javascript/thirdParty/mifTree.js"></script>
      
      <script type="text/javascript" src="../../../javascript/utils/busyIndicator.js"></script>
      <script type="text/javascript" src="../../../javascript/utils/viewerInfoFrame.js"></script>
      <script type="text/javascript" src="../../../javascript/utils/utilities.js"></script>
      <script type="text/javascript" src="../../../javascript/utils/ajaxContentLoader.js"></script>
      <script type="text/javascript" src="../../../javascript/utils/tiledImageHelp.js"></script>
      <script type="text/javascript" src="../../../javascript/utils/emapMenu.js"></script>
      
      <script type="text/javascript" src="../../../javascript/tiledImageModel.js"></script>
      <script type="text/javascript" src="../../../javascript/tiledImageView.js"></script>
      <script type="text/javascript" src="../../../javascript/emapIIPViewer.js"></script>    
      
      <script type="text/javascript" src="../../../javascript/tools/draggableWindow.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/expressionLevelKey.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/sliderComponent.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageLocatorTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageSelectorTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageDistanceTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageLayerTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/queryTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/querySectionTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/queryTermTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImagePropertiesTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageFixedPointTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageRotationTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageScaleTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageScalebar.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageRefreshTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tools/tiledImageMeasuringTool.js"></script>
 
      <script type="text/javascript" src="../../../javascript/tree/treeImplementHGU.js"></script>
      <script type="text/javascript" src="../../../javascript/tree/tiledImageTreeTool.js"></script>
      <script type="text/javascript" src="../../../javascript/tree/colorPicker.js"></script>
      <script type="text/javascript" src="../../../javascript/tree/colorPickerInit.js"></script>
      
      <script type="text/javascript" src="/emap/javascript/ga_tracking.js"></script>
      </head>
      
     

   <body onload=doOnload();
      <div id="projectDiv">

	 <div id="logoContainer" class="ema_sections">
	    <img src="../../../images/ema_logo_transparent_70.png"></img>
	 </div>

         <center>
         <div id="wlzIIPViewerIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">WlzIIPViewer Help</h4>
               <h6 class="help">(Click the <img src="../../../images/help-26.png" class="helpIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="../../../images/close_10x8.png">
               </div>
            </div>
            <iframe id="wlzIIPViewerIFrame" class="wlzIIPViewerIFrame" src="../../../html/helpFrame.html" name="wlzIIPViewerIFrame" scrolling="no">
            </iframe>
         </div>
         <div id="wlzIIPViewerInfoIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerInfoIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">Model Information</h4>
               <h6 class="help">(Click the <img src="../../../images/info-26.png" class="infoIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerInfoIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="../../../images/close_10x8.png">
               </div>
            </div>
	    <iframe id="wlzIIPViewerInfoIFrame" class="wlzIIPViewerIFrame modelInfo" src="../../../html/infoFrame.html" name="wlzIIPViewerInfoIFrame" scrolling="no">
	    </iframe>
         </div>
         </center>

	 <div id="pageHeaderDiv" class="sections">
	    <div id="wlzIIPViewerTitle">
               Juvenile zebrafish - 2011-10-sam29-33-10mmJuvenile-wt-pta: Coronal Sections
            </div>
	 </div>

	 <div id="toolContainerDiv" class="ema_sections">
	    <div id="contextMenuHintDiv" class="ema_sections">
	       right-click over main image for context menu
	    </div>
	 </div>

	 <center>      
            <div id="helpFrameIconContainer" class="helpFrameIconContainer">
               <img id="helpFrameIconImg" src="../../../images/help-26.png"></img>
            </div>

	    <div id="emapIIPViewerDiv" class="ema_sections" ></div>
	 </center>

      </div>

   </body>

</html>

