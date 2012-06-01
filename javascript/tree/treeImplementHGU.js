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
		this.mouse.node.processExpand();
	},
	
	/** 
		Called from Mif.Tree.toggleClick
		displays domains corresponding to selected nodes
	*/
	processCheck: function(nodeId, checked){
		var node = this.root.getNodeById(nodeId.replace(/cb_/,''));
		node.state.checked = checked;
		this.root.showSelected();
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
              this.root.showSelected();
           }
           return this;
        },

	/** 
		Shows all domains in their corresponding colour
	 */
	showAllDomains: function(){
		this.root.showAllDomains();
		return this;
	},
	
	/** 
		Called from Tree.Draw
		sets current section(distance) to that corresponding to the middle section of a given domain
	 */
	center: function(section){
		return this;
	}, 
	
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
		var prefix = node.tree.DOMidPrefix;
		if(node.state.checked !== undefined){
			if (!node.hasCheckbox) node.state.checked=false;
		    //DomainId should be "" for clickable nodes with defined children, 
			// and it should be undefined (undeclared) for nodes with no domains associated (black nodes)
			var isDisabled = "";
			//if (node.domainId === undefined) isDisabled = "disabled";   
			var colorPic = '<input class="pick" type="text" id="pic_'+ node.id + '"style="background-color:'+node.color.rgbToHex()+'" title="Click to change colour"' + isDisabled + '/>' ;
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

	//---------------------------------------------------------
	// Returns the list of checked nodes in the form of a url parameters
	//---------------------------------------------------------
	showSelected: function (nodeId) {
	   //console.log("treeImplementHGU.showSelected for nodeId ",nodeId);
		var transparency = 200; //default transparency level
		var groupTransparency = 100; //default group transparency level
		var values='';
		//Get all selected nodes
		var allChildren = [];
		allChildren.combine(this.tree.root.getSelectedNodes([]));		
		allChildren.each(function(el){
			//If a current selected node has children - add them all in parent's colour
			if (el.hasChildren()){ 
				var descendants = el.getDescendants([]);
				var color = el.color;
				descendants.each(function(item){
					if (item.domainId !== undefined && item.domainId != ""){
						values = values + "&sel=" + item.domainId + "," + color + ","+ groupTransparency;
					}
				})
			}
			if (el.domainId !== undefined && el.domainId != ""){
				values = values + "&sel=" + el.domainId + "," + el.color + ","+ transparency;
			}
		});
		//Compose and fire URL
		this.tree.view.setSelections(values);
		return true;
	},

	//---------------------------------------------------------
	// Returns the list of all painted domains
	//---------------------------------------------------------      
	showAllDomains: function (state) {
		var transparency = 200; //default transparency level
		var values='';
		//Get all selected nodes
		var allChildren = [];
		allChildren.combine(this.tree.root.getSignificantNodes([]));
		allChildren.each(function(el){
			values = values + "&sel=" + el.domainId + "," + el.color + ","+ transparency;
			if ($("cb_"+el.id)){
			   $("cb_"+el.id).checked = state;
			}
			el.state.checked = state; 
		});
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
		list.each(function(node){
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
