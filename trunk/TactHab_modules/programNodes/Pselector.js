define( [ './Pnode.js'
	    ]
	  , function(Pnode) {
// console.log('Pnode is a ', Pnode);
// Definition of a node for programs
var Pselector = function(parent, children) {
	 Pnode.prototype.constructor.apply(this, [parent, children]);
	 this.selector = {};
	 return this;
	}

// API for starting, stopping the instruction
Pselector.prototype = new Pnode();
Pselector.prototype.className	= 'Pselector';
Pnode.prototype.appendClass( Pselector );

var classes = Pnode.prototype.getClasses().slice();
classes.push(Pselector.prototype.className);
Pselector.prototype.getClasses	= function() {return classes;};

Pselector.prototype.serialize	= function() {
	var json =	Pnode.prototype.serialize.apply(this, []);
	json.selector = { name	: this.selector.name
					, type	: this.selector.type
					};
	return json;
}

Pselector.prototype.unserialize	= function(json, Putils) {
	Pnode.prototype.unserialize.apply(this, [json, Putils]);
	// className and id are fixed by the constructor of the object itself
	this.selector.name	= json.selector.name;
	this.selector.type	= json.selector.type;
	return this;
}

return Pselector;
});