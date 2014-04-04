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
/*
---
name: Mif.Tree.implement
description: Mif.Tree extension
MifTree extensions for node manipulation specific to HGU project.

All project-specific additions should be implemented here, instead of the main MifTree file 
@author: NM
 */


Mif.Tree.implement({

        sysArr: [],

	/** 
		Overridden version of the function to allow process checkbox action (processCheck)
		and +/- node expansion (processExpand) 
	*/
	toggleClick: function(event){
		if(this.mouse.target == 'checkbox') {
			var y = this.mouse.coords.y;
			var node = this.$index[((y)/this.height).toInt()];
			this.processCheck(event.target.id, event.target.checked);
		};
		if(this.mouse.target != 'gadjet') return;
		this.mouse.node.toggle();
		//this.mouse.node.processExpand();
	},
	
	/** 
		Called from Mif.Tree.toggleClick
		displays domains corresponding to selected nodes
	*/
	processCheck: function(nodeId, checked){
		var node;

		//console.log("processCheck: nodeId %s, checked %s",nodeId,checked);

		node = this.root.getNodeById(nodeId.replace(/cb_/,''));
		node.state.checked = checked;
		this.root.checkChildren(nodeId, checked);

                if(this.showSystems) {
		   this.addSystem(nodeId, checked);
                }

		this.showSelected(nodeId, checked);

		return this;
	},

	/**
	Called from tiledImageView.getIndexDataAtMouseCallback
	 */
        processCheckExternal: function(nodeId){
           var node = this.root.getNodeById(nodeId.replace(/cb_/,''));
           node.state.checked = !node.state.checked;
           if($(nodeId)) {
              $(nodeId).checked = node.state.checked;
              this.root.showSelectedNodes();
           }
           return this;
        },

//----------------------------------------------------------------------------------
   // farms out call depending upon this.showSystems flag
   showSelected: function(nodeId) {

      var node;
      var checked;

      if(this.showSystems) {
         //console.log("showSelected: ",nodeId);
         node = this.root.getNodeById(nodeId.replace(/cb_/,''));
	 checked = node.state.checked;
         this.root.showSelectedSystems(nodeId, checked);
      } else {
         this.root.showSelectedNodes();
      }
      return false;
   },

//----------------------------------------------------------------------------------
   // adds a set of nodes to systemStack for display
   addSystem: function(nodeId, checked) {

      var nodes = [];
      var children = [];
      var idArr = [];
      var col = [];
      var bare_id;
      var el;
      var descendants;
      var num;
      var i;

      if(!checked) {
	 //console.log("not showing %s system",nodeId);
	 this.removeSystem(nodeId);
         return false;
      }

      bare_id = nodeId.replace(/cb_/,'');
      el = this.root.getNodeById(bare_id);
      //console.log("addSystem: ",el.id);
      nodes.push(el);
      if (el.hasChildren()){ 
         children = el.getDescendants([]);
         nodes.combine(children);
      }

      num = nodes.length;
      //console.log("nodes is %d long",num);
      for (i=0; i<num; i++) {
         id = nodes[i].id;
         idArr.push(id);
         //console.log("%s, %s",item.id,item.name);
         if ($("cb_" + id)){
            $("cb_" + id).checked = checked;
         }
         nodes[i].state.checked = checked; 
      }

      this.sysArr.push({family:idArr, col:el.color, name:el.name});

      //console.log("sysArr after adding ",this.sysArr);

      return false;

   },

//----------------------------------------------------------------------------------
   // removes a set of nodes from systemStack
   removeSystem: function(nodeId) {

      var tmpArr = [];
      var removed;
      var tmp;
      var len;
      var family = [];
      var bare_id;
      var i;

      bare_id = nodeId.replace(/cb_/,'');

      len = this.sysArr.length;
      //console.log("removeSystem: %s from %d length array",bare_id,len);

      while(this.sysArr.length > 0) {
	 tmp = this.sysArr.pop();
         //console.log("tmp.family: ",tmp.family);
	 if(tmp.family[0] === bare_id) {
	    removed = tmp;
	 } else {
	    tmpArr.push(tmp);
	 }
      }

      //console.log("after remove: ",tmpArr);
      //console.log("   removed: ",removed);
      //console.log("-----------------------");

      this.sysArr = [];
      //console.log("   removeSystem: tmpArr: ",tmpArr);
      while(tmpArr.length > 0) {
	 this.sysArr.push(tmpArr.pop());
      }

      tmpArr = [];

      //console.log("   removeSystem: returning: ",this.sysArr);

      return this.sysArr;
   },

//----------------------------------------------------------------------------------
   // gets the top level systems for the given node ids
   filterKidsFromArr: function(el, indx, arr) {

      var ret = [];
      var test;
      var id;
      var arrCopy = [];
      var childIds = [];
      var len;
      var i;

      //console.log("calling filterKids: with %s, at %d in ", el,indx,arr);

      len = arr.length;
      if(len <= 0) return false;

      for(i=0; i<len; i++) {
         arrCopy[i] = arr[i]
      }
      arrCopy.splice(indx,1);

      //console.log("arr ",arr);
      //console.log("--------------------------");
      //console.log("%s arrCopy ",el,arrCopy);

      test = this.root.getNodeById(el);
      if(test.hasChildren()) {
         children = test.getDescendants([]);
         len = children.length;
         for(i=0; i<len; i++) {
            childIds.push(children[i].id);
         }
         //console.log("children ",childIds);
	 // see if any of the children of el appear in arr
	 // and if they do include them in a list of elements to remove
      } else {
         //console.log("no children");
	 return ret;
      }

      len = arr.length;
      for(i=0; i<len; i++) {
         id = arr[i];
         if(childIds.indexOf(id) > -1) {
	    ret.push(id);
	 }
      }

      //console.log("returning ",ret);
      return ret;
   },

//----------------------------------------------------------------------------------
   // gets the top level systems for the given node ids
   removeChildren: function(ids) {

      var toRemove = [];
      var reducedIds = [];
      var id;
      var len;
      var len2;
      var i,j,k;

      id = ids[0];
      //console.log("enter removeChildren: %s ",id,ids);

      len = ids.length;
      for(i=0; i<len; i++) {
         toRemove = this.filterKidsFromArr(id, i, ids);
         //console.log("to remove ",toRemove);

	 len2 = toRemove.length;
	 if(len2 > 0) {
	    reducedIds = ids.filter(function(x) { return toRemove.indexOf(x) < 0 })
	    break;
	 }
      }

      if(reducedIds.length > 0) {
         this.removeChildren(reducedIds);
      }

      //console.log("exit removeChildren: %s ",reducedIds);
      return reducedIds;
   },

//----------------------------------------------------------------------------------
   // gets the top level systems for the given node ids
   findSystems: function() {

      var selected = [];
      var children = [];
      var idArr = [];
      var sysIds = [];
      var selIds = [];
      var reducedIds = [];
      var removed;
      var test;

      var len;
      var len2;
      var i,j,k;

      //Get all selected nodes
      selected = this.root.getSelectedNodes([]);
      if(selected === undefined || selected.length <= 0) {
         return undefined;
      }

      len = selected.length;
      for(i=0; i<len; i++) {
      	 selIds.push(selected[i].id);
      }
      //console.log("findSystems ",selIds);

      // now we have a list of selected ids, remove any children.
      test = this.root.getNodeById(selIds[0]);
      if(!test.hasChildren()) {
         removed = selIds.shift();
         //console.log("removing childless %s",removed);
      }

      reducedIds = this.removeChildren(selIds);
      //console.log("findSystems *** ",reducedIds);

      while(reducedIds.length > 0 && reducedIds.length > sysIds.length) {
	 //console.log(reducedIds);
	 if(reducedIds && reducedIds.length > 0) {
            sysIds.push(reducedIds.shift());
            reducedIds = this.removeChildren(reducedIds);
	 }
      }

      if(reducedIds && reducedIds.length > 0) {
         sysIds.push(reducedIds.shift());
      }
      //console.log("findSystems returning ",sysIds);

      return sysIds;
   },

//----------------------------------------------------------------------------------
	/** 
		Sets a flag to control display of child colours
	 */
        setShowSystems: function(val){

	   var sydIds = [];
	   var len;
	   var i;

           this.showSystems = val;
	   if(val) {
	      sysIds = this.findSystems();
	      if(sysIds === undefined) {
	         return false;
	      }
	      len = sysIds.length;
	      if(len > 0) {
  	         //console.log("sysIds ",sysIds);
  	         this.root.clearAll();
  	         for(i=0; i<len; i++) {
		    this.addSystem("cb_"+sysIds[i], true);
  	         }
	         this.showSelected("cb_"+sysIds[0], true);
	      }
	   } else {
	      this.showSelected();
	   }
           return false;
        },

//----------------------------------------------------------------------------------
	/** 
		Shows all domains in their corresponding colour
	 */
	showAllDomains: function(){
		this.root.showAllDomains();
		return this;
	},
	
//----------------------------------------------------------------------------------
	/** 
		Called from Tree.Draw
		sets current section(distance) to that corresponding to the middle section of a given domain
	 */
	center: function(section){
		return this;
	}, 
	
//----------------------------------------------------------------------------------
	/** 
		Called from the anatomy search form
		creates a list of all existing anatomy names as per tree nodes.
		The list has the form: {"value": 0, "text": "Brazil"},
	 */
	getNodeNames: function(){
		var data = [];
		var d = [];
		var nodes = this.root.getDescendants(d);
		nodes.each(function(node){
			var val = {"value": node.id, "text": node.name};
			data.include(val);
		});
		return data;
	}, 
	
//----------------------------------------------------------------------------------
	/** 
		Called from the anatomy search form
		finds a node on the tree by name, expands tree to that node and highlights it
	 */
	locateByName: function(name){
		var d = [];
		var found = [];
		var nodes = this.root.getDescendants(d);
		nodes.each(function(node){
			if (node.name == name){
				found.include(node);
			}
		});
		found.each(function(node){
			ontTree.expandTo(node);
			node.select(true);
		});
		return this;
	} 
	
	
});

/*
---
name: Mif.Tree.Draw.implement
Mif.Tree.Draw extensions for node manipulation specific to VFB project.

All project-specific additions should be implemented here, instead of the main MifTree file 
@author: NM
*/
/** 
	@TODO: 	implement generic version of the Tree.Draw, and put the override here
	Renders tree nodes in HTML
 */

Mif.Tree.Draw.getHTML = function(node,html){
                //console.log("Mif.Tree.Draw.getHTML node ",node);
		var prefix = node.tree.DOMidPrefix;

		var alf
	        // the alpha value required by css background: rgba(...) is from 0 to 1
	        // the alpha value required by IIP3DViewer is from 0 to 255
		if(!node.color) {
		   node.color = [240,240,240,255];
	        }
		alf = parseFloat(node.color[3] / 255);
		//console.log("alf ",alf);
		//console.log("Mif.Tree.Draw.getHTML  domainId %s",node.domainId);
		var bg = 'rgba(' + node.color[0] + ', ' + node.color[1] + ', ' + node.color[2] + ', ' + alf + ')';
		if(node.state.checked !== undefined){
			if (!node.hasCheckbox) node.state.checked=false;
		        //DomainId should be "" for clickable nodes with defined children, 
			// and it should be undefined (undeclared) for nodes with no domains associated (black nodes)
			var isDisabled = "";
			var titl = "Click to change colour";
			if (node.domainId === undefined) {
			   titl = "Click to change system colour";   
			}
			/*
			if(node.id === "0") { // the very top level
			   isDisabled = "disabled";
			   titl = "";   
			   bg = 'rgba(255,255,255,255)';
			}
			*/
			var colorPic = '<input class="pick" type="text" id="pic_'+ node.id + '"style="background:'+ bg +'" title="' + titl + '"' + ' ' + isDisabled + '/>' ;
			var checkbox='<input class="mif-tree-checkbox mif-tree-node-' + node.state.checked + '" type="checkbox" name="'+node.name + '" id="cb_'+ node.id + '" UID='+ node.id + '" style="vertical-align:middle;"' + isDisabled + '/>';
		}else{
			var checkbox = '';
		}
		html = html||[];
		var wrapper = new Element('div', {'id': prefix+node.UID, 'class': 'mif-tree-node '+(node.isLast() ? 'mif-tree-node-last' : ''), 'style' :(node.hidden ? 'display:none' : '')});
		var w1 = new Element('span', {'uid': node.UID, 'class': 'mif-tree-node-wrapper '+node.cls+(node.state.selected ? ' mif-tree-node-selected' : '')});
		html.push(
		'<div class="mif-tree-node ',(node.isLast() ? 'mif-tree-node-last' : ''),'"'+(node.hidden ? ' style="display:none"' : '')+' id="',prefix,node.UID,'">',
			'<span class="',node.cls,(node.state.selected ? ' mif-tree-node-selected' : ''),'" uid="',node.UID,'">',
				'<span class="mif-tree-gadjet mif-tree-gadjet-',node.getGadjetType(),'" uid="',node.UID,'">',Mif.Tree.Draw.zeroSpace,'</span>',
				'<span class="mif-tree-icon" uid="',node.UID,'">','</span>',
					'<span style="text-align:center"> ',checkbox,colorPic, '</span>',
				//'<span id="',node.id,'" class="mif-tree-name" uid="',node.UID,'">',node.name, '<a onclick="javaScript:tree.center(',node.center,')"> center </a>',
				'<span id="',node.id,'" class="mif-tree-name" uid="',node.UID,'">',node.name,
				'</span>',
			'</span>',
			'<div class="mif-tree-children" style="display:none"></div>',
		'</div>'
		);
		return html;
},

/*
---
name: Mif.Tree.Node. implement
description: Mif.Tree.Node extension
MifTree.Node extensions for node manipulation specific to VFB project.

All project-specific additions should be implemented here, instead of the main MifTree file 
@author: NM

 */

Mif.Tree.Node.implement({
	
	/** 
		Called from Mif.Tree.implement.toggleClick
		displays domains corresponding to selected nodes
	*/

	/*
	processExpand: function(state){
		if(this.state.open) {
			this.children.each(function(node){
				node.cpInit();
			});
		}
	},
	
	cpInit: function(){
		var sphere = new UvumiSphere("#pic_"+this.id,{
			onChange:function(input,hex){
				var id = input.id;
				id = id.substr(id.indexOf('_')+1);
				$(input).setStyle('background-color',hex);
				var node = ontTree.root.getNodeById(id);
				node.color = hex.hexToRgb(true);		
			}
		});
	},
	*/

      //---------------------------------------------------------
      // checked refers to the state of the checkbox that has changed
      //---------------------------------------------------------
      showSelectedNodes: function () {

         var values='';
         var el;
         var item;
         var num;
         var num2;
         var i;
         var j;
         
         //Get all selected nodes
         var allChildren = [];
         allChildren.combine(this.tree.root.getSelectedNodes([]));
         num = allChildren.length;
         for(i=0; i<num; i++) {
            el = allChildren[i];
            // we are only interested in selected (checked) elements.
            if ($("cb_" + el.id)){
               if($("cb_" + el.id).checked) {
                  //console.log("%s is selected",el.id);
                  if (el.domainId !== undefined && el.domainId != ""){
                     values = values + "&sel=" + el.domainId + "," + el.color;
                  }
               } else {
                  continue;
               }
            } else {
               continue;
            }
	 }

         this.tree.view.setSelections(values);
         return true;
      },

      //---------------------------------------------------------
      // checked refers to the state of the checkbox that has changed
      //---------------------------------------------------------
      //showSelectedSystems: function (systems, nodeId, checked) {
      showSelectedSystems: function (nodeId, checked) {

	 var system;
	 var family;
	 var col;
	 var name;
         var id;
         var bare_id;
	 var obj;
         var values='';
         var el;
         var item;
         var len;
         var num;
         var i;
         var j;
         
         bare_id = nodeId.replace(/cb_/,'');

	 len = this.tree.sysArr.length;
	 for(i=0; i<len; i++) {
	    system = this.tree.sysArr[i];
            family = system.family
            col = system.col
            name = system.name
	    
	    num = family.length;

            if(family[0] === bare_id && !checked) {
	       continue;
	    }
	    for(j=0; j<num; j++) {
	       id = family[j];
               obj = this.tree.root.getNodeById(id);
               if(obj) {
                  if (obj.domainId !== undefined && obj.domainId != ""){
                     values = values + "&sel=" + obj.domainId + "," + col;
                  }
  	       }
	    }
            //console.log("systems values: ",values);
	 }

         this.tree.view.setSelections(values);

         return true;
      },

	//---------------------------------------------------------
	// Selects/Deselects all child nodes of a node
	//---------------------------------------------------------
	checkChildren: function (nodeId, checked) {

	        var node;
		var values='';
		var el;
		var allChildren = [];
                var descendants;
                var bare_id = nodeId.replace(/cb_/,'');
		var item;
		var num;
		var i;

                //console.log("checkChildren: nodeId %s, %s",nodeId,checked);
                bare_id = nodeId.replace(/cb_/,'');
                node = $(nodeId);
                el = this.tree.root.getNodeById(bare_id);
                //console.log("showChildren: ",el.id);
                if (el.hasChildren()){ 
                   descendants = el.getDescendants([]);
		   num = descendants.length;
		   for(i=0; i<num; i++) {
		      item = descendants[i];
		      //if(item.domainId !== undefined) {
                         //console.log("%s, %s",item.id,item.name);
                         if ($("cb_" + item.id)){
                            $("cb_" + item.id).checked = checked;
                         }
                         item.state.checked = checked; 
		      //}
		   }
                }

		return false;
	},

	//---------------------------------------------------------
	// Sets new colour for selected node, regardless of having a domain or not
	//---------------------------------------------------------
	changeImageElementColour: function (id, rgba) {

            var allChildren = [];
            var node;
            var cols;
            var alf;

	    //console.log("changeImageElementColour: -->%s<-- ",id,rgba);
            
            node = this.tree.root.getNodeById(id);
	    //console.log("changeImageElementColour: node ",node);
	    if(node) {
	       // deal with the very top node
	       if(id === "0") {
		  alf = parseInt(rgba.alpha * 255);
		  cols = rgba.red + "," + rgba.green + "," + rgba.blue + "," + alf;
		  node.color[0] = rgba.red;
		  node.color[1] = rgba.green;
		  node.color[2] = rgba.blue;
		  node.color[3] = alf;
                  return false;
	       }
	       // deal with other node
               allChildren.combine(this.tree.root.getDescendants([]));
               allChildren.each(function(el){

                  if(el.id === node.id) {
   	          //change this element's colour
                     // the alpha value required by css background: rgba(...) is from 0 to 1
                     // the alpha value required by IIP3DViewer is from 0 to 255
                     alf = parseInt(rgba.alpha * 255);
                     cols = rgba.red + "," + rgba.green + "," + rgba.blue + "," + alf;
                     node.color[0] = rgba.red;
                     node.color[1] = rgba.green;
                     node.color[2] = rgba.blue;
                     node.color[3] = alf;
                  }
               });
	    }
            return false;
	},

	//---------------------------------------------------------
	// Display all painted domains
	//---------------------------------------------------------      
	showAllDomains: function () {
		var values='';
		//Get all selected nodes
		var allChildren = [];
		allChildren.combine(this.tree.root.getSignificantNodes([]));
		allChildren.each(function(el){
			//values = values + "&sel=" + el.domainId + "," + el.color + ","+ transparency;
			values = values + "&sel=" + el.domainId + "," + el.color;
			if ($("cb_"+el.id)){
			   $("cb_"+el.id).checked = true;
			}
			el.state.checked = true; 
		});

		//Compose and fire URL
		this.tree.view.setSelections(values);
		return true;
	},

	//---------------------------------------------------------
	// Clear all nodes (not just painted ones but their ancestors too)
	//---------------------------------------------------------      
	clearAll: function () {

            var values='';
            var allChildren = [];
	    var node;

            //Get all selected nodes
            allChildren.combine(this.tree.root.getDescendants([]));
            allChildren.each(function(el){
               if ($("cb_"+el.id)){
                  $("cb_"+el.id).checked = false;
               }
               el.state.checked = false; 
            });

	    // clear the top node, which isn't a child
            if ($("cb_0")){
               $("cb_0").checked = false;
	       node = this.tree.root.getNodeById("0");
	       if(node) {
	          node.state.checked = false;
	       }
            }

            // also clear the 'systems' array
            this.tree.sysArr = [];

            //Compose and fire URL
            this.tree.view.setSelections(values);
            return true;
	},

	//---------------------------------------------------------
	// Returns the list of all selected (checked) children nodes of a node
	//---------------------------------------------------------
	getSelectedNodes: function (allChildren) {
	   //console.log("getSelectedNodes "+ this.id + " : "+ this.domainId);  
		if (this.state.checked) {
			allChildren.include(this);
		}
		this.children.each(function(node){
			node.getSelectedNodes(allChildren);
		});
		return allChildren;
	},
	
	//---------------------------------------------------------
	// Returns the list of all children nodes of a node
	//---------------------------------------------------------
	getDescendants: function (children) {
	   //console.log("getDescendants "+ this.id + " : "+ this.domainId);  
		var list = this.getChildren();//list of all child checkboxes
		children.combine(list);
		this.children.each(function(node){
			node.getDescendants(children);
		});
		return children;
	},
	
	//---------------------------------------------------------
	// Returns the list of all selected children nodes that 
	// are significant, ie id is not empty and is defined
	//---------------------------------------------------------
	getSignificantNodes: function (allChildren) {
	   //console.log("getSignificantNodes: "+ this.id + " : "+ this.domainId);  
		var list = this.getChildren();//list of all child checkboxes
		list.each(function(item){
			if (item.domainId !== undefined && item.domainId != "") {
				allChildren.include(item);
			}
		});
		this.children.each(function(node){
			node.getSignificantNodes(allChildren);
		});
		return allChildren;
	},   
	
	//---------------------------------------------------------
	// Returns a node by id
	//---------------------------------------------------------
	getNodeById: function (nodeId) {    	
	   //console.log("getNodeById: ",nodeId);  
		var foundNode = null;
		if (this.id == nodeId) {
			foundNode = this;
			return foundNode;
		}
		var list =this.getChildren();   
		//console.log("getNodeById: list ",list);
		list.each(function(node){
		        //console.log("getNodeById: node ",node);
			var tmp = node.getNodeById(nodeId);
			if (tmp) {
				foundNode = tmp;
			}
		});
		return foundNode;
	},
	
	/**
	 *  Invoked from MIf.Tree.Node.Implement.select()
	 *  Displays annotation info for the node in the annotation div. 
	 */
	processSelection: function (){
	   //console.log("processSelection: external id ",this.fbId);  
	   //emouseatlas.emap.contextMenuActions.setExternalId(this.fbId);
           //$('annotation').load('ontology.php',{fbId:this.fbId});
	},
	
	/** 
		Overridden version of the function to allow processSelectionss
	 */
	select: function(state) {
		this.state.selected = state;
		this.processSelection();
		if(!Mif.Tree.Draw.isUpdatable(this)) return;
		var wrapper=this.getDOM('wrapper');
		wrapper[(state ? 'add' : 'remove')+'Class'](this.selectClass||'mif-tree-node-selected');
	}

});
