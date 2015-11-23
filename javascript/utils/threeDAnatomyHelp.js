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
//   threeDAnatomyHelp.js
//---------------------------------------------------------

//---------------------------------------------------------
//   Dependencies:
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
// module for threeDAnatomyHelp
// encapsulating it in a module to preserve namespace
//---------------------------------------------------------
emouseatlas.emap.threeDAnatomyHelp = function () {
//---------------------------------------------------------

   var view;
   var type;
   var wlist;
   var wind;
   var hideOK;
   var name;
   var _document;
   var _console;
   var helpIFrame;

   //---------------------------------------------------------
   var initialise = function(params) {

      //_console.log("threeDAnatomyHelp.initialize: params ",params);

      view = params.view;
      view.register(this);

      type = params.type;

      hideOK = false;

      name = "threeDAnatomyHelp";

   };

   //  Toggles visibility for the IFrame (not its container).
   //---------------------------------------------------------------
   var viewUpdate = function (changes) {

      if(changes.show3dAnatomyHelp) {
         wlist = view.get3dWindowList();
         wind = wlist[wlist.length -1];
         _document = wind.document;
         _console = wind.opener.console;
         helpIFrame = _document.getElementById(type + "IFrame");
         helpIFrame.setStyle('visibility', 'visible');
      }

      if(changes.hide3dAnatomyHelp) {
         wlist = view.get3dWindowList();
         wind = wlist[wlist.length -1];
         _document = wind.document;
         helpIFrame = _document.getElementById(type + "IFrame");
         helpIFrame.setStyle('visibility', 'hidden');
      }
   };

   //---------------------------------------------------------------
   var getName = function() {
      return name;
   };

   //---------------------------------------------------------
   // expose 'public' properties
   //---------------------------------------------------------
   // don't leave a trailing ',' after the last member or IE won't work.
   return {
      initialise: initialise,
      getName: getName,
      viewUpdate: viewUpdate
   };

}(); // end of module threeDAnatomyHelp
//----------------------------------------------------------------------------
