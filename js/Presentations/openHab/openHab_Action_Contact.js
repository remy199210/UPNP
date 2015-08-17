var openHab_Action	= require( './openHab_Action.js' )
  // , utils		= require( '../../../utils.js' )
  , DragDrop		= require( '../../DragDrop.js' )
  , openHabTypes	= require( '../../openHabTypes.js' )
  , str_template	= require( 'raw!./templates/openHab_Action_Contact.html' )
  , html_template	= document.createElement( "div" )
  ;
  
html_template.innerHTML = str_template;

// 
var openHab_Action_Contact = function() {
	 openHab_Action.apply(this, []);
	 this.mustDoRender = true;
	 return this;
	}

openHab_Action_Contact.prototype = Object.create( openHab_Action.prototype );
openHab_Action_Contact.prototype.constructor = openHab_Action_Contact;

openHab_Action_Contact.prototype.init		= function(PnodeID, parent, children) {
	 openHab_Action.prototype.init.apply(this, [PnodeID, parent, children]);
	 return this;
	}

openHab_Action_Contact.prototype.serialize = function() {
	 var json = openHab_Action.prototype.serialize.apply(this, []);
	 json.subType = 'openHab_Action_Contact';
	 return json;
	}

openHab_Action_Contact.prototype.forceRender		= function() {
	this.mustDoRender = true;
	return openHab_Action.prototype.forceRender.apply(this, []);
}

openHab_Action_Contact.prototype.Render = function() {
	 var self = this;
	 var root = openHab_Action.prototype.Render.apply(this,[]);
	 if(this.mustDoRender) {
		 this.mustDoRender = false;
		 root.classList.add( "openHab_Action_Contact" );
		 this.copyHTML(html_template, this.html.actionName);
		 this.html.OpenClose			= root.querySelector("select.contact");
		 this.html.OpenClose.value		= this.action.method = this.action.method || 'Do_Open';
		 this.html.OpenClose.onchange	= function() {self.action.method = this.value;}
		 DragDrop.updateConfig	( this.dropZoneSelectorId
								, { acceptedClasse: [[openHabTypes.OpenClosed]]
								  }
								);
		}
	 return root;
	}
	

module.exports = openHab_Action_Contact;
