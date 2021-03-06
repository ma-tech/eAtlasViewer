<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<meta charset="UTF-8"/>

<?php
   # from http://php.net/manual/en/function.parse-str.php 
   # contributed by: Evan K 30-Jul-2007 12:43
   # gets round the need to include [] for each array entry in the url
   function proper_parse_str($str) {
     # result array
     $arr = array();
   
     # split on outer delimiter
     $pairs = explode('&', $str);
   
     # loop through each pair
     foreach ($pairs as $i) {
       # split into name and value
       list($name,$value) = explode('=', $i, 2);
      
       # if name already exists
       if( isset($arr[$name]) ) {
         # stick multiple values into an array
         if( is_array($arr[$name]) ) {
           $arr[$name][] = $value;
         }
         else {
           $arr[$name] = array($arr[$name], $value);
         }
       }
       # otherwise, simply stick it in a scalar
       else {
         $arr[$name] = $value;
       }
     }
   
     # return result array
     return $arr;
   }

   $query = proper_parse_str($_SERVER['QUERY_STRING']);

/*
   $components = $query["components"];
   $subplate = $query["subplate"];
   $editor = isset($query["editor"]);

   #var_dump($query);
   #var_dump($components);
   #var_dump($editor);

   #echo ("2nd component is  {$components[1]}");
   echo ("subplate is  $subplate");
   echo (", editor is  -->$editor<--");
*/
if(empty($_GET)) {
   echo "No GET variables";
} else {
   $urlParams = $_GET;
}
   print_r($query); 

?>

<script type="text/javascript">
   function doOnload() {

      /*
      components = <?php echo json_encode($components); ?>;
      subplate = <?php echo $subplate; ?>;
      editor = <?php echo $editor; ?>;

      jso = {"modelDataUrl":"/eAtlasViewer_dev/application/kaufman/plate33b/tiledImageModelData.jso",
             "editor":"<?php echo isset($paramArray["editor"]) ?>",
             "subplate":"<?php echo $query["subplate"] ?>",
             "components":components
      };
      jso = {"modelDataUrl":"/eAtlasViewer_dev/application/kaufman/plate33b/tiledImageModelData.jso",
             "editor":editor,
             "subplate":subplate,
             "components":components
      };
      jso = {"modelDataUrl":"/eAtlasViewer_dev/application/kaufman/plate33b/tiledImageModelData.jso"};
      */
      jso = {"modelDataUrl":"/eAtlasViewer_dev/application/kaufman/plate33b/tiledImageModelData.jso",
             "editor":"<?php echo isset($query["editor"]) ?>",
             "subplate":"<?php echo $query["subplate"] ?>",
             "compArr":<?php echo json_encode($query["comp"]); ?>
      };

      emouseatlas.emap.tiledImageModel.initialise(jso);
   }
</script>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" >

   <head>
      <meta name="author" content="Ruven Pillay &lt;ruven@users.sourceforge.netm&gt;, Tom Perry &lt;T.Perry@hgu.mrc.ac.uk&gt; and others" />
      <meta name="keywords" content="Internet Imaging Protocol IIP IIPImage" />
      <meta name="description" content="High Resolution Remote Image Viewing" />
      <meta name="copyright" content="&copy; 2003-2007 Ruven Pillay" />

      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/application/kaufman/project.css" />

      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tiledImage.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tooltips.css" />
      
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/layer.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/layerProperties.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/sectionChooser.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/draggableWindow.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/pitchYaw.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/rotation.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/fixedPoint.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/scale.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/scalebar.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/refresh.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/measuring.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/draw.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/equivalentSection.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/selector.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/locator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/expressionKey.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/slider.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/tools/pointClick.css" />
 
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/utils/busyIndicator.css" />
      <link rel="stylesheet" type="text/css" media="all" href="/eAtlasViewer_dev/css/utils/marker.css" />
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/utils/help.css" />  
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/utils/emapMenu.css" />
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/utils/canvas.css" />

      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/tree/tree.css" />
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/tree/colourPick.css" />                    
      <link rel="stylesheet" media="all" type="text/css" href="/eAtlasViewer_dev/css/tree/autocomplete.css" />      

      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/thirdParty/json2.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/thirdParty/mootools-core-1.3.2.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/thirdParty/mootools-more-1.3.2.1.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/thirdParty/mifTree.js"></script>
      
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/busyIndicator.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/viewerInfoFrame.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/utilities.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/ajaxContentLoader.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/tiledImageHelp.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/emapMenu.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/utils/emapDraw.js"></script>
      
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tiledImageModel.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tiledImageView.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/emapIIPViewer.js"></script>    
      
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/draggableWindow.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/expressionLevelKey.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/sliderComponent.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageLocatorTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageSelectorTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageDistanceTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageLayerTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageSectionChooser.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImagePropertiesTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageFixedPointTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImagePitchYawTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageRotationTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageScaleTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageScalebar.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageRefreshTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageEquivalentSectionTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageMeasuringTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/tiledImageDrawingTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tools/pointClick.js"></script>
 
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tree/treeImplementHGU.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tree/tiledImageTreeTool.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tree/colorPicker.js"></script>
      <script type="text/javascript" src="/eAtlasViewer_dev/javascript/tree/colorPickerInit.js"></script>
   </head>

   <body onload=doOnload();

      <div id="projectDiv">

	 <div id="logoContainer">
	    <img src="/eAtlasViewer_dev/images/ema_logo_transparent_70.png"></img>
	 </div>

         <center>
         <div id="wlzIIPViewerIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">WlzIIPViewer Help</h4>
               <h6 class="help">(Click the <img src="/eAtlasViewer_dev/images/help-26.png" class="helpIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="/eAtlasViewer_dev/images/close_10x8.png">
               </div>
            </div>
            <iframe id="wlzIIPViewerIFrame" class="wlzIIPViewerIFrame" src="/eAtlasViewer_dev/html/helpFrame_2D.html" name="wlzIIPViewerIFrame" scrolling="no">
            </iframe>
         </div>
         <div id="wlzIIPViewerInfoIFrameContainer" class="wlzIIPViewerIFrameContainer">
            <div id="wlzIIPViewerInfoIFrameTopDiv" class="wlzIIPViewerIFrameTopDiv">
               <h4 class="help">Model Information</h4>
               <h6 class="help">(Click the <img src="/eAtlasViewer_dev/images/info-26.png" class="infoIcon"> icon to keep this page displayed.)</h6>
               <div id="wlzIIPViewerInfoIFrameCloseDiv" class="wlzIIPViewerIFrameCloseDiv">
                  <img class="iframeClose" src="/eAtlasViewer_dev/images/close_10x8.png">
               </div>
            </div>
	    <iframe id="wlzIIPViewerInfoIFrame" class="wlzIIPViewerIFrame modelInfo" src="/eAtlasViewer_dev/html/infoFrame.html" name="wlzIIPViewerInfoIFrame" scrolling="no">
	    </iframe>
         </div>
         </center>

	 <div id="pageHeaderDiv" class="multiple">
            <!--
            <div id="infoFrameIconContainer" class="infoFrameIconContainer">
               <img id="infoFrameIconImg" src="/eAtlasViewer_dev/images/info-26.png"></img>
            </div>
            -->
	    <div id="wlzIIPViewerTitle">
               Plate 33b (14.5 dpc) TS 22-23 from Kaufman Atlas
            </div>
	 </div>

	 <div id="toolContainerDiv">
	    <div id="contextMenuHintDiv">
	       right-click over main image for context menu
	    </div>
	 </div>

	 <center>      
	    <div id="emapIIPViewerDiv" class="pointClick" >
               <div id="helpFrameIconContainer" class="helpFrameIconContainer">
                  <img id="helpFrameIconImg" src="/eAtlasViewer_dev/images/help-26.png"></img>
               </div>
	    </div>
	    <div id="pointClickTableDiv" >
	    </div>
	 </center>

      </div>

   </body>

</html>

