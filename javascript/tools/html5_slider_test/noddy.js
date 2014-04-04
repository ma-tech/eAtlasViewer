//---------------------------------------------------------
//   Namespace:
//---------------------------------------------------------
if(!emouseatlas) {
   var emouseatlas = {};
}
if(!emouseatlas.emap) {
   emouseatlas.emap = {};
}

//---------------------------------------------------------
// module for noddy
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.noddy = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------
   var utils = emouseatlas.emap.utilities;

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var targetDiv;

   //---------------------------------------------------------
   //  private  methods
   //---------------------------------------------------------
   var createElements = function () {

      var dragContainer;
      var sliderContainer;
      var sliderForm;
      var fs1;
      var fs2;
      var legend1;
      var legend2;
      var opacitySlider;
      var redSlider;
      var greenSlider;
      var blueSlider;
      var opacityValText;
      var redValText;
      var greenValText;
      var blueValText;

      dragContainer = new Element('div', {
         'id': 'dragContainer'
      });

      sliderContainer = new Element('div', {
         'id': 'sliderContainer'
      });

      sliderForm = new Element('form', {
         'id': 'sliderForm',
	 'name': 'sliderForm'
      });

      fs1 = new Element('fieldset', {
         'id': 'opacityFieldset',
	 'name': 'opacityFieldset',
	 'class': 'opacity'
      });

      fs2 = new Element('fieldset', {
         'id': 'filterFieldset',
	 'name': 'filterFieldset',
	 'class': 'filter'
      });

      legend1 = new Element('legend', {
         'id': 'opacityFieldsetLegend',
	 'name': 'opacityFieldsetLegend'
      });
      legend1.set('text', 'opacity');

      legend2 = new Element('legend', {
         'id': 'filterFieldsetLegend',
	 'name': 'filterFieldsetLegend'
      });
      legend2.set('text', 'filter');

      opacitySlider = new Element('input', {
         'id': 'opacitySlider',
	 'name': 'opacitySlider',
	 'class': 'opacity',
	 'type': 'range',
	 'min': 0,
	 'max': 255,
	 'value': 178.5
      });

      redSlider = new Element('input', {
         'id': 'redSlider',
	 'name': 'redSlider',
	 'class': 'layerPropsSlider red',
	 'type': 'range',
	 'min': 0,
	 'max': 255,
	 'value': 50
      });

      greenSlider = new Element('input', {
         'id': 'greenSlider',
	 'name': 'greenSlider',
	 'class': 'green',
	 'type': 'range',
	 'min': 0,
	 'max': 255,
	 'value': 175
      });

      blueSlider = new Element('input', {
         'id': 'blueSlider',
	 'name': 'blueSlider',
	 'class': 'blue',
	 'type': 'range',
	 'min': 0,
	 'max': 255,
	 'value': 100
      });

      opacityValText = new Element('input', {
         'id': 'opacityValText',
	 'class': 'opacity',
	 'type': 'text',
	 'readOnly': 'readonly'
      });
      opacityValText.set('value', "178");

      redValText = new Element('input', {
         'id': 'redValText',
	 'class': 'red',
	 'type': 'text',
	 'readOnly': 'readonly'
      });
      redValText.set('value', "50");

      greenValText = new Element('input', {
         'id': 'greenValText',
	 'class': 'green',
	 'type': 'text',
	 'readOnly': 'readonly'
      });
      greenValText.set('value', "175");

      blueValText = new Element('input', {
         'id': 'blueValText',
	 'class': 'blue',
	 'type': 'text',
	 'readOnly': 'readonly'
      });
      blueValText.set('value', "100");

      //--------------------------------
      // add the elements
      //--------------------------------
      dragContainer.inject(targetDiv, 'inside');
      sliderContainer.inject(dragContainer, 'inside');
      sliderForm.inject(sliderContainer, 'inside');
      fs1.inject(sliderForm, 'inside');
      legend1.inject(fs1, 'inside');
      opacitySlider.inject(fs1, 'inside');
      opacityValText.inject(fs1, 'inside');
      fs2.inject(sliderForm, 'inside');
      legend2.inject(fs2, 'inside');
      redSlider.inject(fs2, 'inside');
      redValText.inject(fs2, 'inside');
      greenSlider.inject(fs2, 'inside');
      greenValText.inject(fs2, 'inside');
      blueSlider.inject(fs2, 'inside');
      blueValText.inject(fs2, 'inside');

      //--------------------------------
      // add event handlers
      //--------------------------------

      opacitySlider.addEvent('input',function(e) {
         doLayerPropsSliderChanged(e);
      });
      opacitySlider.addEvent('mousedown',function(e) {
         enableDrag(e);
      });
      opacitySlider.addEvent('mouseup',function(e) {
         enableDrag(e);
      });
      redSlider.addEvent('input',function(e) {
         doLayerPropsSliderChanged(e);
      });
      redSlider.addEvent('mousedown',function(e) {
         enableDrag(e);
      });
      redSlider.addEvent('mouseup',function(e) {
         enableDrag(e);
      });
      greenSlider.addEvent('input',function(e) {
         doLayerPropsSliderChanged(e);
      });
      greenSlider.addEvent('mousedown',function(e) {
         enableDrag(e);
      });
      greenSlider.addEvent('mouseup',function(e) {
         enableDrag(e);
      });
      blueSlider.addEvent('input',function(e) {
         doLayerPropsSliderChanged(e);
      });
      blueSlider.addEvent('mousedown',function(e) {
         enableDrag(e);
      });
      blueSlider.addEvent('mouseup',function(e) {
         enableDrag(e);
      });

   };

   //---------------------------------------------------------
   var doLayerPropsSliderChanged = function (e) {

      var target;
      var id;
      var val;
      var indx;
      var prefix;
      var textIp;

      if(e.preventDefault) {
	 e.preventDefault();
      }
      if(e.stopPropagation) {
	 e.stopPropagation();
      }

      target = emouseatlas.emap.utilities.getTarget(e);
      //yes = !target.checked;

      id = target.id;
      if(id === undefined || id === null || id === "") {
	 console.log("doLayerPropsSliderChanged no target.id");
	 return;
      }

      val = target.value;
      //console.log("doLayerPropsSliderChanged target.id %s %d",id, val);

      indx = id.indexOf("Slider");
      prefix = id.substring(0,indx);
      textIp = $(prefix + "ValText");
      textIp.set('value', val);
   };

   //---------------------------------------------------------
   var enableDrag = function (e) {

      //console.log(e);
      var dragContainer = $("dragContainer");

      if(e.type.toLowerCase() === "mousedown") {
         dragContainer.setAttribute("draggable", false);
      } else if(e.type.toLowerCase() === "mouseup") {
         dragContainer.setAttribute("draggable", true);
      }

   };

   //---------------------------------------------------------
   //  public  methods
   //---------------------------------------------------------
   var initialise = function (target) {

      targetDiv = $(target);
      createElements();

      var dropTargetId = "bigContainer";
      emouseatlas.emap.drag.register({drag:"dragContainer", drop:dropTargetId});

   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise
   };

}(); // end of module drag
