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
//   threeDAnatomyWarning.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
//   Uses MooTools
//---------------------------------------------------------

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
//---------------------------------------------------------
emouseatlas.emap.threeDAnatomyWarning = function() {

   //---------------------------------------------------------
   // modules
   //---------------------------------------------------------

   //---------------------------------------------------------
   // private members
   //---------------------------------------------------------
   var model;
   var view;
   var query;
   var util;
   var trgt;
   var project;
   var MAX_TO_SHOW;


   //---------------------------------------------------------
   //   private methods
   //---------------------------------------------------------

   //---------------------------------------------------------
   // event handlers
   //---------------------------------------------------------

   //---------------------------------------------------------
   //   public methods
   //---------------------------------------------------------
   var initialise = function (params) {

      model = emouseatlas.emap.tiledImageModel;
      view = emouseatlas.emap.tiledImageView;
      query = emouseatlas.emap.tiledImageQuery;
      util = emouseatlas.emap.utilities;

      model.register(this, "threeDAnatomyWarning");
      view.register(this, "threeDAnatomyWarning");

      //console.log("threeDAnatomyWarning initialise");

      project = (params.project === undefined) ? "emap" : params.project;

      dropTargetId = model.getProjectDivId();
      trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      MAX_TO_SHOW = view.getMax3dToShow();

      mu = ' \u03BCm';
      createElements();
      emouseatlas.emap.drag.register({drag:"threeDAnatomyWarningContainer", drop:dropTargetId}, "threeDAnatomyWarning");

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(modelChanges) {

      //console.log("threeDAnatomyWarning createElements");
      var threeDAnatomyWarningContainer;
      var selectedTerms;
      var key;
      var termDets;
      var latestClickedRow;
      var numItems;
      var i;
      var klass;
      var top;
      var titleText;
      var warningContainer;;
      var warningDiv;;
      var warning;;
      var warningH;;
      var remedyContainer;
      var remedyDiv;
      var remedy;
      var remedyH;
      var neverContainer;
      var neverDiv;
      var never;
      var neverH;
      /*
      var buttonContainer;
      var okButtonContainer;
      var okButtonDiv;
      var cancelButtonContainer;
      var cancelButtonDiv;
      var radioContainer;
      var radioDiv;
      var radioNever;
      var radioNeverLabel;
      var radioNeverLabelTxt;
      var radioAlways;
      var radioAlwaysLabel;
      var radioAsk;
      var radioAskLabel;
      var chkbxContainer;
      var chkbxDiv;
      var chkbx;
      var chkbxLabel;
      */

      threeDAnatomyWarningContainer = new Element('div', {
	 'id': 'threeDAnatomyWarningContainer'
      });
      //target = $(trgt);
      target = $(dropTargetId);
      threeDAnatomyWarningContainer.inject(target, 'inside');

      queryModes = model.getQueryModes();

      /*
      titleTextContainer = new Element('div', {
         'class': 'threeDAnatomyWarningTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'threeDAnatomyWarningTitleText'
      });
      switch (project.toLowerCase()) {
         case 'emap':
            titleText = "3d window.";
	    break;
	 default:
            titleText = "3d window.";
      }
      titleTextDiv.set('text', titleText);

      titleTextDiv.inject(titleTextContainer, 'inside');
      titleTextContainer.inject(threeDAnatomyWarningContainer, 'inside');
      */

      //----------------------------------------
      // container for the warning
      //----------------------------------------

      warningContainer = new Element('div', {
         'id': 'threeDAnatomyWarningWarningContainer',
         'class': 'threeDAnatomyWarningMsgContainer'
      });

      warningDivHeader = new Element('h3', {
         'id': 'threeDAnatomyWarningWarningDivHeader',
         'class': 'threeDAnatomyWarningMsgDivHeader'
      });
      warningDivHeader.set('text', "Warning");

      warningDiv = new Element('div', {
         'id': 'threeDAnatomyWarningWarningDiv',
         'class': 'threeDAnatomyWarningMsgDiv'
      });

      switch (project.toLowerCase()) {
         case 'emap':
	 default:
	    warning = "<center>";
            warning += "Displaying too many 3d surfaces in a web browser can cause your computer to become slow or un-responsive.";
	    warning += "<center>";
	    break;
      }
      warningDiv.innerHTML = warning;

      warningContainer.inject(threeDAnatomyWarningContainer, 'inside');
      warningDivHeader.inject(warningContainer, 'inside');
      warningDiv.inject(warningContainer, 'inside');

      warningH = parseInt(window.getComputedStyle(warningDiv, null).getPropertyValue("height"));
      //console.log("warningH ",warningH);

      //----------------------------------------
      // container for the remedy
      //----------------------------------------

      remedyContainer = new Element('div', {
         'id': 'threeDAnatomyWarningRemedyContainer',
         'class': 'threeDAnatomyWarningMsgContainer'
      });

      /*
      remedyDivHeader = new Element('h3', {
         'id': 'threeDAnatomyWarningRemedyDivHeader',
         'class': 'threeDAnatomyWarningMsgDivHeader'
      });
      remedyDivHeader.set('text', "Warning");
      */

      remedyDiv = new Element('div', {
         'id': 'threeDAnatomyWarningRemedyDiv',
         'class': 'threeDAnatomyWarningMsgDiv remedy'
      });

      switch (project.toLowerCase()) {
         case 'emap':
	 default:
	    remedy = "<center>";
	    remedy += "If this happens you may wish to limit the number of anatomy components which are selected for display (checked in the tree).";
	    remedy += "<br><br>(Closing and re-starting your web-browser should restore normal browser performance.)";
	    remedy += "<br><br><span class='never'>This message will not be shown again.</span>";
	    remedy += "<center>";
	    break;
      }
      remedyDiv.innerHTML = remedy;

      remedyContainer.inject(threeDAnatomyWarningContainer, 'inside');
      //remedyDivHeader.inject(remedyContainer, 'inside');
      remedyDiv.inject(remedyContainer, 'inside');

      remedyH = parseInt(window.getComputedStyle(remedyDiv, null).getPropertyValue("height"));
      //console.log("explainH ",explainH);

      //============================================================
      //----------------------------------------
      // spacer
      //----------------------------------------
      threeDAnatomyWarningSpacer_1 = new Element('div', {
         "class": "threeDAnatomyWarningSpacer"
      });
      threeDAnatomyWarningSpacer_1.inject(threeDAnatomyWarningContainer, 'inside');

      threeDAnatomyWarningSpacerBGdark_1 = new Element('div', {
         "class": "threeDAnatomyWarningSpacerBGdark"
      });
      threeDAnatomyWarningSpacerBGlight_1 = new Element('div', {
         "class": "threeDAnatomyWarningSpacerBGlight"
      });
      threeDAnatomyWarningSpacerBGdark_1.inject(threeDAnatomyWarningSpacer_1, 'inside');
      threeDAnatomyWarningSpacerBGlight_1.inject(threeDAnatomyWarningSpacer_1, 'inside');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      buttonContainer = new Element('div', {
	 'id': 'threeDAnatomyWarningButtonContainer',
	 'class': 'threeDAnatomyWarningButtonContainer'
      });

      buttonDiv = new Element('div', {
	 'id': 'threeDAnatomyWarningButtonDiv',
	 'class': 'threeDAnatomyWarningButtonDiv'
      });

      okButton = new Element('div', {
	 'id': 'threeDAnatomyWarningOKButton',
	 'class': 'threeDAnatomyWarningButton ok'
      });
      okButton.appendText('Continue');

      cancelButton = new Element('div', {
	 'id': 'threeDAnatomyWarningCancelButton',
	 'class': 'threeDAnatomyWarningButton cancel'
      });
      cancelButton.appendText('Cancel');

      okButton.inject(buttonDiv, 'inside');
      cancelButton.inject(buttonDiv, 'inside');
      buttonDiv.inject(buttonContainer, 'inside');
      buttonContainer.inject(threeDAnatomyWarningContainer, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('threeDAnatomyWarningOKButton');
      emouseatlas.emap.utilities.addButtonStyle('threeDAnatomyWarningCancelButton');

      //----------------------------------------
      // add event handlers for the buttons
      //----------------------------------------

      okButton.addEvent('mouseup', function(e){
	 doOKButtonClicked(e);
      });

      cancelButton.addEvent('mouseup', function(e){
	 doCancel();
      });

      /*
      //----------------------------------------
      // the container for the 'always show' radio buttons
      //----------------------------------------
      radioContainer = new Element('div', {
	 'id': 'threeDAnatomyWarningRadioContainer',
	 'class': 'threeDAnatomyWarningRadioContainer'
      });

      radioNeverDiv = new Element('div', {
	 'id': 'threeDAnatomyWarningRadioNeverDiv',
	 'class': 'threeDAnatomyWarningRadioDiv'
      });

      radioAlwaysDiv = new Element('div', {
	 'id': 'threeDAnatomyWarningRadioAlwaysDiv',
	 'class': 'threeDAnatomyWarningRadioDiv'
      });

      radioAskDiv = new Element('div', {
	 'id': 'threeDAnatomyWarningRadioAskDiv',
	 'class': 'threeDAnatomyWarningRadioDiv'
      });

      radioNever = new Element('input', {
         "type": "radio",
         "checked": true,
	 'id': 'threeDAnatomyWarningRadioNever',
	 'name': 'threeDAnatomyWarningRadio',
	 'class': 'threeDAnatomyWarning'
      });

      radioNeverLabel = new Element('label', {
	 'id': 'threeDAnatomyWarningRadioLabelNever',
	 'class': 'threeDAnatomyWarningRadio'
      });
      radioNeverLabelTxt = "never display more than " + MAX_TO_SHOW + " surfaces";
      radioNeverLabel.set('text', radioNeverLabelTxt);
      radioNeverLabel.for = 'threeDAnatomyWarningRadioLabelNever';
      //.........................
      radioAlways = new Element('input', {
         "type": "radio",
         "checked": false,
	 'id': 'threeDAnatomyWarningRadioAlways',
	 'name': 'threeDAnatomyWarningRadio',
	 'class': 'threeDAnatomyWarning'
      });

      radioAlwaysLabel = new Element('label', {
	 'id': 'threeDAnatomyWarningRadioLabelAlways',
	 'class': 'threeDAnatomyWarningRadio'
      });
      radioAlwaysLabel.set('text', "display what is selected");
      radioNeverLabel.for = 'threeDAnatomyWarningRadioLabelAlways';
      //.........................
      /*
      radioAsk = new Element('input', {
         "type": "radio",
         "checked": false,
	 'id': 'threeDAnatomyWarningRadioAsk',
	 'name': 'threeDAnatomyWarningRadio',
	 'class': 'threeDAnatomyWarning'
      });

      radioAskLabel = new Element('label', {
	 'id': 'threeDAnatomyWarningRadioLabelAsk',
	 'class': 'threeDAnatomyWarningRadio'
      });
      radioAskLabel.set('text', "always ask me");
      radioNeverLabel.for = 'threeDAnatomyWarningRadioLabelAsk';
      //.........................

      radioContainer.inject(threeDAnatomyWarningContainer, 'inside');
      radioNeverDiv.inject(radioContainer, 'inside');
      radioAlwaysDiv.inject(radioContainer, 'inside');
      radioAskDiv.inject(radioContainer, 'inside');
      radioNever.inject(radioNeverDiv, 'inside');
      radioNeverLabel.inject(radioNeverDiv, 'inside');
      radioAlways.inject(radioAlwaysDiv, 'inside');
      radioAlwaysLabel.inject(radioAlwaysDiv, 'inside');
      //radioAsk.inject(radioAskDiv, 'inside');
      //radioAskLabel.inject(radioAskDiv, 'inside');

      //----------------------------------------
      // add event handlers for the checkbox
      //----------------------------------------

      radioNever.addEvent('click', function(e){
	 doRadioClicked(e);
      });

      radioAlways.addEvent('click', function(e){
	 doRadioClicked(e);
      });

      //----------------------------------------
      // spacer
      //----------------------------------------
      */
      /*
      threeDAnatomyWarningSpacer_2 = new Element('div', {
         "id": "threeDAnatomyWarningSpacer_2",
         "class": "threeDAnatomyWarningSpacer"
      });
      threeDAnatomyWarningSpacer_2.inject(threeDAnatomyWarningContainer, 'inside');

      threeDAnatomyWarningSpacerBGdark_2 = new Element('div', {
         "class": "threeDAnatomyWarningSpacerBGdark"
      });
      threeDAnatomyWarningSpacerBGlight_2 = new Element('div', {
         "class": "threeDAnatomyWarningSpacerBGlight"
      });
      threeDAnatomyWarningSpacerBGdark_2.inject(threeDAnatomyWarningSpacer_2, 'inside');
      threeDAnatomyWarningSpacerBGlight_2.inject(threeDAnatomyWarningSpacer_2, 'inside');
      */

      /*
      //----------------------------------------
      // the container for the 'don't show again' checkbox
      //----------------------------------------
      chkbxContainer = new Element('div', {
	 'id': 'threeDAnatomyWarningChkbxContainer',
	 'class': 'threeDAnatomyWarningChkbxContainer'
      });

      chkbxDiv = new Element('div', {
	 'id': 'threeDAnatomyWarningChkbxDiv',
	 'class': 'threeDAnatomyWarningChkbxDiv'
      });

      chkbx = new Element('input', {
         "type": "checkbox",
         "checked": false,
	 'id': 'threeDAnatomyWarningChkbx',
	 'class': 'threeDAnatomyWarning'
      });

      chkbxLabel = new Element('label', {
	 'id': 'threeDAnatomyWarningChkbxLabel',
	 'class': 'threeDAnatomyWarningChkbx',
	 'for': 'threeDAnatomyWarningChkbx'
      });
      chkbxLabel.set('text', "don't show this warning again");

      chkbxContainer.inject(threeDAnatomyWarningContainer, 'inside');
      chkbxDiv.inject(chkbxContainer, 'inside');
      chkbx.inject(chkbxDiv, 'inside');
      chkbxLabel.inject(chkbxDiv, 'inside');

      //----------------------------------------
      // add event handlers for the checkbox
      //----------------------------------------

      chkbx.addEvent('click', function(e){
	 doChkbxChanged(e);
      });
      */

   }; // createElements

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      if(viewChanges.threeDAnatomyWarningDialog) {
         setVisible(true);
      }

   }; // viewUpdate

   //---------------------------------------------------------------
   var doRadioClicked = function(e) {

      var trgt;
      var idlc;
      var radio;
      var txt;
      var max;

      trgt = emouseatlas.emap.utilities.getTarget(e);
      idlc = trgt.id.toLowerCase();
      //console.log("doRadioClicked: %s clicked",trgt.id);

      switch(idlc) {
         case "dontshowagainradioalways":
            //console.log("doRadioClicked: radioAlways %s idlc",idlc);
	    view.setMax3dToShow(undefined);
	    break;
         case "dontshowagainradionever":
	    // it may be (in future) that the user can set the max suraces to display
            //console.log("doRadioClicked: radioNever %s idlc",idlc);
	    max = view.getOrigMax3dToShow();
            txt = "never display more than " + max + surfaces;
	    radio = $('threeDAnatomyWarningRadioLabelNever');
            radio.set('text', txt);
	    view.setMax3dToShow(max);
	    break;
      }

   }; // doRadioClicked

   //---------------------------------------------------------------
   var doChkbxChanged = function(e) {

      var trgt;
      var idlc;
      var show;

      trgt = emouseatlas.emap.utilities.getTarget(e);
      idlc = trgt.id.toLowerCase();

      show = !trgt.checked;
      //console.log("doChkbxChanged: %s checked %s",trgt.id, show);

      view.setShowDontShowAgainDialog(show);

   }; // doChkbxChanged

   //---------------------------------------------------------------
   var setVisible = function(yes) {

      var container;
      var viz;

      viz = (yes) ? "visible" : "hidden";
      container = $("threeDAnatomyWarningContainer");
      container.setStyle("visibility", viz);
   };

   //---------------------------------------------------------------
   var doCancel = function() {
      setVisible(false);
   };

   //---------------------------------------------------------------
   var doOKButtonClicked = function() {
      
      var alwaysRadio;

      setVisible(false);

      radioAlways= $('threeDAnatomyWarningRadioAlways');
      //if(radioAlways.checked) {
         view.okToProceed3d();
      //}
   };

   //---------------------------------------------------------------
   var getName = function() {
      return "threeDAnatomyWarning";
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      modelUpdate: modelUpdate,
      viewUpdate: viewUpdate,
      setVisible: setVisible,
      getName: getName
   };

}();
