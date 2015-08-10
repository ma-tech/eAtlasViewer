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
//   dontShowAgain.js
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
emouseatlas.emap.dontShowAgain = function() {

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

      model.register(this);
      view.register(this);
      query.register(this);

      //console.log("dontShowAgain initialise");

      project = (params.project === undefined) ? "emap" : params.project;

      dropTargetId = model.getProjectDivId();
      trgt = "emapIIPViewerDiv"; // doesn't allow dragging?

      MAX_TO_SHOW = view.getMax3dToShow();

      mu = ' \u03BCm';
      createElements();
      emouseatlas.emap.drag.register({drag:"dontShowAgainContainer", drop:dropTargetId});

   }; // initialise

   //---------------------------------------------------------------
   var createElements = function(modelChanges) {

      //console.log("dontShowAgain createElements");
      var dontShowAgainContainer;
      var selectedTerms;
      var key;
      var termDets;
      var latestClickedRow;
      var numItems;
      var i;
      var klass;
      var top;
      var titleText;
      var explainContainer;;
      var explainDiv;;
      var explanation;;
      var explainH;;
      var itemDiv;
      var itemIdContainer;
      var itemIdDiv;
      var itemDescContainer;
      var itemDescDiv;
      var itemRadioContainer;
      var itemRadio;
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

      dontShowAgainContainer = new Element('div', {
	 'id': 'dontShowAgainContainer'
      });
      //target = $(trgt);
      target = $(dropTargetId);
      dontShowAgainContainer.inject(target, 'inside');

      queryModes = model.getQueryModes();

      titleTextContainer = new Element('div', {
         'class': 'dontShowAgainTitleTextContainer'
      });

      titleTextDiv = new Element('div', {
         'class': 'dontShowAgainTitleText'
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
      titleTextContainer.inject(dontShowAgainContainer, 'inside');

      //----------------------------------------
      // container for the explanation
      //----------------------------------------

      explainContainer = new Element('div', {
         'id': 'dontShowAgainExplainContainer',
         'class': 'dontShowAgainExplainContainer'
      });

      explainDivHeader = new Element('h3', {
         'id': 'dontShowAgainExplainDivHeader',
         'class': 'dontShowAgainExplainDivHeader'
      });
      explainDivHeader.set('text', "Warning");

      explainDiv = new Element('div', {
         'id': 'dontShowAgainExplainDiv',
         'class': 'dontShowAgainExplainDiv'
      });

      switch (project.toLowerCase()) {
         case 'emap':
            explanation = "there is a potential performance issue if too many 3d surfaces are displayed at once";
	    break;
	 default:
            explanation = "there is a potential performance issue if too many 3d surfaces are displaye at onced";
      }
      explainDiv.set('text', explanation);

      explainContainer.inject(dontShowAgainContainer, 'inside');
      explainDivHeader.inject(explainContainer, 'inside');
      explainDiv.inject(explainContainer, 'inside');

      explainH = parseInt(window.getComputedStyle(explainDiv, null).getPropertyValue("height"));
      //console.log("explainH ",explainH);

      //============================================================
      //----------------------------------------
      // spacer
      //----------------------------------------
      dontShowAgainSpacer_1 = new Element('div', {
         "class": "dontShowAgainSpacer"
      });
      dontShowAgainSpacer_1.inject(dontShowAgainContainer, 'inside');

      dontShowAgainSpacerBGdark_1 = new Element('div', {
         "class": "dontShowAgainSpacerBGdark"
      });
      dontShowAgainSpacerBGlight_1 = new Element('div', {
         "class": "dontShowAgainSpacerBGlight"
      });
      dontShowAgainSpacerBGdark_1.inject(dontShowAgainSpacer_1, 'inside');
      dontShowAgainSpacerBGlight_1.inject(dontShowAgainSpacer_1, 'inside');

      //----------------------------------------
      // the container for the buttons
      //----------------------------------------
      buttonContainer = new Element('div', {
	 'id': 'dontShowAgainButtonContainer',
	 'class': 'dontShowAgainButtonContainer'
      });

      buttonDiv = new Element('div', {
	 'id': 'dontShowAgainButtonDiv',
	 'class': 'dontShowAgainButtonDiv'
      });

      okButton = new Element('div', {
	 'id': 'dontShowAgainOKButton',
	 'class': 'dontShowAgainButton ok'
      });
      okButton.appendText('Continue');

      cancelButton = new Element('div', {
	 'id': 'dontShowAgainCancelButton',
	 'class': 'dontShowAgainButton cancel'
      });
      cancelButton.appendText('Cancel');

      okButton.inject(buttonDiv, 'inside');
      cancelButton.inject(buttonDiv, 'inside');
      buttonDiv.inject(buttonContainer, 'inside');
      buttonContainer.inject(dontShowAgainContainer, 'inside');

      emouseatlas.emap.utilities.addButtonStyle('dontShowAgainOKButton');
      emouseatlas.emap.utilities.addButtonStyle('dontShowAgainCancelButton');

      //----------------------------------------
      // add event handlers for the buttons
      //----------------------------------------

      okButton.addEvent('mouseup', function(e){
	 doOKButtonClicked(e);
      });

      cancelButton.addEvent('mouseup', function(e){
	 doCancel();
      });

      //----------------------------------------
      // the container for the 'always show' radio buttons
      //----------------------------------------
      radioContainer = new Element('div', {
	 'id': 'dontShowAgainRadioContainer',
	 'class': 'dontShowAgainRadioContainer'
      });

      radioNeverDiv = new Element('div', {
	 'id': 'dontShowAgainRadioNeverDiv',
	 'class': 'dontShowAgainRadioDiv'
      });

      radioAlwaysDiv = new Element('div', {
	 'id': 'dontShowAgainRadioAlwaysDiv',
	 'class': 'dontShowAgainRadioDiv'
      });

      radioAskDiv = new Element('div', {
	 'id': 'dontShowAgainRadioAskDiv',
	 'class': 'dontShowAgainRadioDiv'
      });

      radioNever = new Element('input', {
         "type": "radio",
         "checked": true,
	 'id': 'dontShowAgainRadioNever',
	 'name': 'dontShowAgainRadio',
	 'class': 'dontShowAgain'
      });

      radioNeverLabel = new Element('label', {
	 'id': 'dontShowAgainRadioLabelNever',
	 'class': 'dontShowAgainRadio'
      });
      radioNeverLabelTxt = "never display more than " + MAX_TO_SHOW + " surfaces";
      radioNeverLabel.set('text', radioNeverLabelTxt);
      radioNeverLabel.for = 'dontShowAgainRadioLabelNever';
      //.........................
      radioAlways = new Element('input', {
         "type": "radio",
         "checked": false,
	 'id': 'dontShowAgainRadioAlways',
	 'name': 'dontShowAgainRadio',
	 'class': 'dontShowAgain'
      });

      radioAlwaysLabel = new Element('label', {
	 'id': 'dontShowAgainRadioLabelAlways',
	 'class': 'dontShowAgainRadio'
      });
      radioAlwaysLabel.set('text', "display what is selected");
      radioNeverLabel.for = 'dontShowAgainRadioLabelAlways';
      //.........................
      /*
      radioAsk = new Element('input', {
         "type": "radio",
         "checked": false,
	 'id': 'dontShowAgainRadioAsk',
	 'name': 'dontShowAgainRadio',
	 'class': 'dontShowAgain'
      });

      radioAskLabel = new Element('label', {
	 'id': 'dontShowAgainRadioLabelAsk',
	 'class': 'dontShowAgainRadio'
      });
      radioAskLabel.set('text', "always ask me");
      radioNeverLabel.for = 'dontShowAgainRadioLabelAsk';
      */
      //.........................

      radioContainer.inject(dontShowAgainContainer, 'inside');
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
      /*
      dontShowAgainSpacer_2 = new Element('div', {
         "id": "dontShowAgainSpacer_2",
         "class": "dontShowAgainSpacer"
      });
      dontShowAgainSpacer_2.inject(dontShowAgainContainer, 'inside');

      dontShowAgainSpacerBGdark_2 = new Element('div', {
         "class": "dontShowAgainSpacerBGdark"
      });
      dontShowAgainSpacerBGlight_2 = new Element('div', {
         "class": "dontShowAgainSpacerBGlight"
      });
      dontShowAgainSpacerBGdark_2.inject(dontShowAgainSpacer_2, 'inside');
      dontShowAgainSpacerBGlight_2.inject(dontShowAgainSpacer_2, 'inside');
      */

      //----------------------------------------
      // the container for the 'don't show again' checkbox
      //----------------------------------------
      chkbxContainer = new Element('div', {
	 'id': 'dontShowAgainChkbxContainer',
	 'class': 'dontShowAgainChkbxContainer'
      });

      chkbxDiv = new Element('div', {
	 'id': 'dontShowAgainChkbxDiv',
	 'class': 'dontShowAgainChkbxDiv'
      });

      chkbx = new Element('input', {
         "type": "checkbox",
         "checked": false,
	 'id': 'dontShowAgainChkbx',
	 'class': 'dontShowAgain'
      });

      chkbxLabel = new Element('label', {
	 'id': 'dontShowAgainChkbxLabel',
	 'class': 'dontShowAgainChkbx',
	 'for': 'dontShowAgainChkbx'
      });
      chkbxLabel.set('text', "don't show this warning again");

      chkbxContainer.inject(dontShowAgainContainer, 'inside');
      chkbxDiv.inject(chkbxContainer, 'inside');
      chkbx.inject(chkbxDiv, 'inside');
      chkbxLabel.inject(chkbxDiv, 'inside');

      //----------------------------------------
      // add event handlers for the checkbox
      //----------------------------------------

      chkbx.addEvent('click', function(e){
	 doChkbxChanged(e);
      });

   }; // createElements

   //---------------------------------------------------------------
   var modelUpdate = function(modelChanges) {

   }; // modelUpdate

   //---------------------------------------------------------------
   var viewUpdate = function(viewChanges, from) {

      if(viewChanges.dontShowAgainDialog) {
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
	    radio = $('dontShowAgainRadioLabelNever');
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
      container = $("dontShowAgainContainer");
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

      radioAlways= $('dontShowAgainRadioAlways');
      //if(radioAlways.checked) {
         view.okToProceed3d();
      //}
   };

   //---------------------------------------------------------------
   var getName = function() {
      return "dontShowAgain";
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
