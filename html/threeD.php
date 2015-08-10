<!DOCTYPE html>
<meta charset="UTF-8"/>

<?php
   $query = $_SERVER["QUERY_STRING"];
   $paramArray = array();
   parse_str($query, $paramArray);
?>

<script type="text/javascript">
   function doOnload() {
      var jso = {
	 "model": "<?php echo $paramArray[model] ?>",
         "comps": "<?php echo $paramArray[comps] ?>"
      }
      emouseatlas.emap.threeDAnatomy.initialise(jso);
   }
</script>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" >
   <head>
      <!-- css files -->
      <link rel="stylesheet" type="text/css" media="all" href="../css/utils/threeD.css" />
      <!-- javascript files -->
      <script type="text/javascript" src="../javascript/thirdParty/json2.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/mootools-core-1.4.5-full-nocompat.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/mootools-more-1.4.0.1.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/htmlparser.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/Detector.js"></script>
      <!-- the order here is important, make sure three comes before trackball -->
      <script type="text/javascript" src="../javascript/thirdParty/MARender/three.min.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/TrackballControls.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/MARender.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/STLLoader.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/VTKLoader.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/OBJLoader.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/BasicShader.js"></script>
      <script type="text/javascript" src="../javascript/thirdParty/MARender/BlendShader.js"></script>

      <script type="text/javascript" src="../javascript/utils/utilities.js"></script>
      <script type="text/javascript" src="../javascript/utils/drag.js"></script>
      <script type="text/javascript" src="../javascript/utils/ajaxContentLoader.js"></script>
      <script type="text/javascript" src="../javascript/tiledImageModel.js"></script>
      <script type="text/javascript" src="../javascript/tiledImageView.js"></script>
      <script type="text/javascript" src="../javascript/utils/threeDAnatomy.js"></script>
   </head>

   <body class="threeD" onload=doOnload()>
      <div id="threeDContainer" name="threeDContainer">
      </div>
   </body>
</html>
