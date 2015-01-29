define	( [ './PnodePresentation.js'
		  ]
		, function(PnodePresentation) {

function SelectorNodePresentation(infoObj) {
	PnodePresentation.apply(this, []);
	console.log("SelectorNodePresentation::constructor", infoObj);
	this.selector = { name: 'There should be a name here'
					, type: ['selector']
					};
	if(infoObj) {
		 this.selector.name = infoObj.config.MR.name;
		}
}

SelectorNodePresentation.prototype = new PnodePresentation();
SelectorNodePresentation.prototype.className = 'SelectorNode';

SelectorNodePresentation.prototype.Render = function() {
	var root = PnodePresentation.prototype.Render.apply(this, []);
	this.divDescription.innerHTML = '';
	this.divDescription.appendChild( document.createTextNode(this.selector.name) );
	return root;
}

SelectorNodePresentation.prototype.serialize	= function() {
	var json = PnodePresentation.prototype.serialize.apply(this, []);
	// Describe action here
	json.subType	= 'SelectorNodePresentation';
	json.selector = { name	: this.selector.name
					, type	: this.selector.type
					};
	return json;
}

SelectorNodePresentation.prototype.unserialize	= function(json, PresoUtils) {
	// Describe action here
	PnodePresentation.prototype.unserialize.apply(this, [json, PresoUtils]);
	this.selector.name	= json.selector.name;
	this.selector.type	= json.selector.type;
	return this;
}

return SelectorNodePresentation;
});