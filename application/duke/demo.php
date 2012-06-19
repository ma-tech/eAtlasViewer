<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

<?php
   if (isset($_GET['wlz'])) {
      $wlz = $_GET['wlz'];
   } 
?>

<script type="text/javascript">
   function doOnload() {
      jso = { "modelDataUrl":"/eAtlasViewer_demo/application/duke/demo/tiledImageModelData.jso" };
      emouseatlas.emap.tiledImageModel.initialise(jso);
   }
</script>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" >

   <head>
      <meta name="author" content="Ruven Pillay &lt;ruven@users.sourceforge.netm&gt;, Tom Perry &lt;T.Perry@hgu.mrc.ac.uk&gt; and others" />
      <meta name="keywords" content="Internet Imaging Protocol IIP IIPImage" />
      <meta name="description" content="High Resolution Remote Image Viewing" />
      <meta name="copyright" content="&copy; 2003-2007 Ruven Pillay" />

      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/application/duke/project.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tiledImage.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tooltips.css" />
      
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/layer.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/layerProperties.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/draggableWindow.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/pitchYaw.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/rotation.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/fixedPoint.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/scale.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/scalebar.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/refresh.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/measuring.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/equivalentSection.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/selector.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/locator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/expressionKey.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/tools/slider.css" />
 
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/utils/busyIndicator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_demo/css/utils/marker.css" />
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_demo/css/utils/help.css" />  
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_demo/css/utils/emapMenu.css" />

      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_demo/css/tree/tree.css" />
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_demo/css/tree/colourPick.css" />                    
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_demo/css/tree/autocomplete.css" />      
      
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/thirdParty/json2.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/thirdParty/mootools-core-1.3.2.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/thirdParty/mootools-more-1.3.2.1.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/thirdParty/mifTree.js"></script>
      
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/busyIndicator.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/viewerInfoFrame.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/utilities.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/ajaxContentLoader.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/tiledImageHelp.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/utils/emapMenu.js"></script>
      
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tiledImageModel.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tiledImageView.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/emapIIPViewer.js"></script>    
      
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/draggableWindow.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/expressionLevelKey.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/sliderComponent.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageLocatorTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageSelectorTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageDistanceTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageLayerTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImagePropertiesTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageFixedPointTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImagePitchYawTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageRotationTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageScaleTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageScalebar.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageRefreshTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageEquivalentSectionTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tools/tiledImageMeasuringTool.js"></script>
 
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tree/treeImplementHGU.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tree/tiledImageTreeTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tree/colorPicker.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_demo/javascript/tree/colorPickerInit.js"></script>

   </head>

   <body onload=doOnload();
      <div id="projectDiv">

	 <div id="logoContainer" class="ema_wlz">
	    <img src="/eAtlasViewer_demo/images/ema_logo_transparent_70.png"></img>
	 </div>

         <center>
         <div id="wlzIIPViewerIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">WlzIIPViewer Help</h4>
               <h6 class="help">(Click the <img src="/eAtlasViewer_demo/images/help-26.png" class="helpIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="/eAtlasViewer_demo/images/close_10x8.png">
               </div>
            </div>
            <iframe id="wlzIIPViewerIFrame" class="wlzIIPViewerIFrame" src="/eAtlasViewer_demo/html/helpFrame.html" name="wlzIIPViewerIFrame" scrolling="no">
            </iframe>
         </div>
         <div id="wlzIIPViewerInfoIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerInfoIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">Model Information</h4>
               <h6 class="help">(Click the <img src="/eAtlasViewer_demo/images/info-26.png" class="infoIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerInfoIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="/eAtlasViewer_demo/images/close_10x8.png">
               </div>
            </div>
	    <iframe id="wlzIIPViewerInfoIFrame" class="wlzIIPViewerIFrame modelInfo" src="/eAtlasViewer_demo/html/infoFrame.html" name="wlzIIPViewerInfoIFrame" scrolling="no">
	    </iframe>
         </div>
         </center>

	 <div id="pageHeaderDiv" class="ema_wlz">
	    <div id="wlzIIPViewerTitle">
               adc & grass
            </div>
	 </div>

	 <div id="toolContainerDiv" class="ema_wlz">
	    <div id="contextMenuHintDiv" class="ema_wlz">
	       right-click over main image for context menu
	    </div>
	 </div>

	 <center>      
            <div id="helpFrameIconContainer" class="helpFrameIconContainer">
               <img id="helpFrameIconImg" src="/eAtlasViewer_demo/images/help-26.png"></img>
            </div>

	    <div id="emapIIPViewerDiv" class="ema_wlz" ></div>
	 </center>

      </div>

   </body>


</html>
