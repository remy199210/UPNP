define( [ //'../webServer/webServer.js'
	    ]
	  , function(/*webServer*/) {
var states		= {0:'stopped', 1:'started'};
var id			= 0;
var D_nodes		= {};
var D_classes	= {};

// Definition of a node for programs
var Pnode = function(parent, children) {
	 this.parent	= parent	|| null;
	 this.children	= children	|| [];
		 if(parent) {parent.children.push(this);}
		 for(var i in children) {children[i].parent = this;}
	 this.state		= 0;
	 this.name		= '';
	 this.id		= 'Node' + (id++);
	 D_nodes[this.id] = this;
	 return this;
	}
Pnode.prototype.constructor = Pnode;
Pnode.prototype.className	= 'Pnode';

Pnode.prototype.dispose		= function() {
	delete D_nodes[this.id];
	this.id = 'obsolet ' + this.id;
	while(this.children.length) {this.children[0].setParent(null);}
	this.setParent(null);
	return this;
}
Pnode.prototype.getClasses	= function() {return [Pnode.prototype.className];}
Pnode.prototype.getD_classes= function() {return D_classes;}
Pnode.prototype.appendClass	= function(classe) {D_classes[classe.prototype.className] = classe;}

// API for starting, stopping the instruction
Pnode.prototype.serialize	= function() {
	var json =	{ className: this.className
				, PnodeID: this.id
				, children: []
				};
	if(this.subType) {json.subType = this.subType;}
	for(var i in this.children) {
		 json.children.push( this.children[i].serialize() );
		}
	return json;
}
Pnode.prototype.unserialize	= function(json, Putils) {
	// className and id are fixed by the constructor of the object itself
	if(json.subType) {this.subType = json.subType;} else {this.subType = undefined; delete this.subType;}
	var children = this.children.slice();
	var i;
	for(i=0; i<children.length		; i++) {children[i].setParent(null);}
	for(i=0; i<json.children.length	; i++) {Putils.unserialize(json.children[i], Putils).setParent(this);}
	return this;
} 

Pnode.prototype.isInstanceOf= function(classe)	{return this.getClasses().indexOf(classe) >= 0;}

Pnode.prototype.getNode			= function(id)	{return D_nodes[id];}
Pnode.prototype.substituteIdBy	= function(id)	{
	 // Is there an object already having that id ?
	 var obj = Pnode.prototype.getNode( id );
	 if(obj) {obj.dispose(); console.log("Replacing object", id, ':', obj.className);}
	 
	 // Replacing id and registrations
	 delete D_nodes[this.id];
	 this.id	= id;
	 D_nodes[id]= this;
	 
	 return this;
	}

Pnode.prototype.setName		= function(name)	{this.name = name; return this;}
Pnode.prototype.setParent	= function(node)	{
	if(this.parent) {
		 var pos = this.parent.children.indexOf(this);
		 this.parent.children.splice(pos, 1);
		}
	this.parent = node;
	if(node) {node.children.push(this);}
	return this;
}

Pnode.prototype.Start = function() {
	// Log the execution ?
	return this.setState(1);
}
Pnode.prototype.Stop = function() {
	if(this.state !== 0) {
		 // Stop the execution
		 for(var i=0; i<this.children.length; i++) {
			 this.children[i].Stop();
			}
		}
	return this.setState(0);
}

Pnode.prototype.getStateName = function() {return states[this.state];}
Pnode.prototype.getState = function() {return this.state;}
Pnode.prototype.setState = function(state) {
	var prevState = this.state;
	this.state = state;
	if(prevState !== state) {
		 if(this.cb_setState) {this.cb_setState.apply(this, [this, prevState, state]);}
		 if(Pnode.prototype.CB_setState) {
			 console.log('emit', this.className, this.id, this.name, ':', prevState, '->', state);
			 Pnode.prototype.CB_setState.apply(this, [this, prevState, state]);
			}
		 // console.log(this.className, "setting state to ", state);
		 if(this.parent) this.parent.childStateChanged(this, prevState, state);
		 return true;
		} else {return false;}
}
Pnode.prototype.on_setState = function(cb) {this.cb_setState = cb;}
Pnode.prototype.CB_setState = null;

Pnode.prototype.childStateChanged = function(child, prevState, newState) {}

Pnode.prototype.call = function(call) {
	// Propagate an action call if it is not forbidden
	if(this.parent) {
		 return this.parent.call(call);
		} else {error("Call cannot be propagated");}
}

Pnode.prototype.getContextDescription = function() {
	var context = this.getContext();
	var json = {bricks:{}, variables:{}};
	var i;
	for(i in context.bricks) {
		 json.bricks[i] = context.bricks[i].getDescription();
		}
	for(i in context.variables) {
		 json.variables[i] = context.variables[i].getDescription();
		}
	return json;
}

Pnode.prototype.getContext = function() {
	// Propagate a call for context information
	if(this.parent) {
		 return this.parent.getContext();
		} else {return {};}
}

return Pnode;
});