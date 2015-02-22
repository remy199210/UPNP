define	( [ './DragDrop.js'
		  , './utils.js'
		  , './Presentations/PresoUtils.js'
		  , './Presentations/PnodePresentation.js'
		  , './async.js'
		  ]
		, function( DragDrop, utils, PresoUtils
				  , PnodePresentation
				  , async
				  , BrickUPnP_MediaRenderer
				  ) {
					  
var editor = {
	  htmlNodeTypes		: null
	, htmlNodeProgram	: null
	, createDragNode		: function(name, config) {
		 var div = document.createElement('div');
			div.appendChild( document.createTextNode(name) );
			div.setAttribute('class', "instructionType Pnode Implemented");
			if(typeof config.nodeType === "string") {config.nodeType = [config.nodeType];}
			for(var i=0; i<config.nodeType.length; i++) {
				 div.classList.add( config.nodeType[i] );
				}
			if(config.isNotType) {div.classList.remove( config.isNotType );}
		 DragDrop.newDraggable( div
							  , { constructor	: config.constructor
							    , htmlNode		: div
								, nodeType		: config.nodeType
								, config		: config
								}
							  );
		 return div;
		}
	, createCateg	: function(name) {
		 var details	= document.createElement('details');
		 var summary	= document.createElement('summary');
			details.appendChild( summary );
			summary.innerHTML = name;
		 this.htmlNodeTypes.appendChild( details );
		 return {details: details, summary: summary, appendChild: function(c) {details.appendChild(c); return this;}}
		}
	, init	: function(classNodeTypes, htmlNodeProgram, socket) {
		 console.log('Editor init', classNodeTypes, htmlNodeProgram);
		 this.htmlNodeProgram = htmlNodeProgram;
		 var self = this;
		 this.socket = socket;
		 socket.on( 'updateState'
				  , function(json) {
						 console.log('updateState : ', json);
						 var obj = PnodePresentation.prototype.getPnode(json.objectId);
						 console.log("\t=> obj :", obj);
						 if(obj) {
							 obj.setState(json.prevState, json.nextState);
							}
						});
		 
		 // console.log('async:', async);
		 // Configure html
		 this.htmlNodeTypes = document.getElementById('instructionTypes');
		 
		 // Control flow instructions
		 this.createCateg("Controls"	).appendChild( this.createDragNode( 'Program'
													 , { constructor	: PresoUtils.get('ProgramNode')
													   , nodeType		: 'ProgramNode'
													   } )
										).appendChild( this.createDragNode( 'Parrallel'
													 , { constructor	: PresoUtils.get('ParalleNode')
													   , nodeType		: 'ParalleNode'
													   } )
										).appendChild( this.createDragNode( 'Sequence'
													 , { constructor	: PresoUtils.get('SequenceNode')
													   , nodeType		: 'SequenceNode'
													   } )
										).appendChild( this.createDragNode( 'When'
													 , { constructor	: PresoUtils.get('WhenNode')
													   , nodeType		: 'WhenNode'
													   } )
										).appendChild( this.createDragNode( 'Event'
													 , { constructor	: PresoUtils.get('EventNode')
													   , nodeType		: 'EventNode'
													   , isNotType		: 'Pnode'
													   } )
										).appendChild( this.createDragNode( 'Controller'
													 , { constructor	: PresoUtils.get('PcontrolBrick')
													   , nodeType		: 'PcontrolBrick'
													   } )
										).appendChild( this.createDragNode( 'Filter (hide/expose)'
													 , { constructor	: PresoUtils.get('PfilterPresentation')
													   , nodeType		: 'PfilterNode'
													   } )
										);
		 // Create new draggable for variables
		 this.createCateg("Variables").appendChild( this.createDragNode( 'New selector'
													 , { constructor	: PresoUtils.get('Var_DefinitionPresentation')
													   , nodeType		: 'DefinitionNode'
													   } )
										).appendChild( this.createDragNode( 'New sub-program'
													 , { constructor	: PresoUtils.get('Program_DefinitionPresentation')
													   , nodeType		: 'DefinitionNode'
													   } )
										);
		 // Create new draggable for MediaRenderer
		 this.MR_categ = 
		 this.createCateg("MediaRenderer").appendChild( this.createDragNode( 'Load'
													 , { constructor	: PresoUtils.get('MR_load_NodePresentation')
													   , nodeType		: 'ActionNode'
													   } )
										).appendChild( this.createDragNode( 'Play'
													 , { constructor	: PresoUtils.get('MR_Play_NodePresentation')
													   , nodeType		: 'ActionNode'
													   } )
										).appendChild( this.createDragNode( 'Pause'
													 , { constructor	: PresoUtils.get('MR_Pause_NodePresentation')
													   , nodeType		: 'ActionNode'
													   } )
										).appendChild( this.createDragNode( 'Stop'
													 , { constructor	: PresoUtils.get('MR_Stop_NodePresentation')
													   , nodeType		: 'ActionNode'
													   } )
										).appendChild( this.createDragNode( 'Every media renderers'
													 , { constructor	: PresoUtils.get('MR_Selector_everyMediaRenderers')
													   , nodeType		: 'SelectorNode'
													   } )
										).appendChild( this.createDragNode( 'Every media servers'
													 , { constructor	: PresoUtils.get('MR_Selector_everyMediaServers')
													   , nodeType		: 'SelectorNode'
													   } )
										);
		 
		 // Process variables and bricks
		 var variables = {};
		 if(self.rootProgram) {variables.nodeId = self.rootProgram.PnodeID;}
		 utils.XHR( 'POST', '/getContext'
				  , { variables	: variables
					, onload	: function() {
						 var json = JSON.parse( this.responseText ); 
						 console.log('/getContext of ', variables.nodeId, ':', json );
						 var i, brick, variable;
						 // Bricks
						 for(i in json.bricks) {
							 brick = json.bricks[i];
							 if(brick.type.indexOf('BrickUPnP_MediaRenderer') !== -1) {
								 self.MR_categ.appendChild( self.createDragNode( brick.name
													   , { constructor	: PresoUtils.get('MR_Instance_SelectorNodePresentation')
													     , nodeType		: brick.type.concat( ['SelectorNode'] )
														 , id			: brick.id
														 , uuid			: brick.id
														 , name			: brick.name
													     } )
													   );
								}
							}
						 // Variables
						 for(i in json.variables) {
							 variable = json.variables[i];
							 if(variable.type.indexOf('BrickUPnP_MediaRenderer') !== -1) {
								 self.MR_categ.appendChild( self.createDragNode( variable.name
													   , { constructor	: PresoUtils.get('Var_UsePresentation')
													     , nodeType		: variable.type.concat( ['SelectorNode', 'variable'] )
														 , id			: variable.id
														 , name			: variable.name
													     } )
													   );
								}
							}
						}
				    }
				  );
		 
		 // Process Media Renderer and media servers
		 /* => done via /getContext HTTP POST
		 utils.XHR( 'GET', '/get_MediaDLNA'
				  , {onload : function() {
							 var res = JSON.parse( this.responseText );
							 // console.log( res );
							 for(var i=0; i<res.MediaRenderer.length; i++) {
								 var MR = res.MediaRenderer[i];
								 self.MR_categ.appendChild( self.createDragNode( MR.name
													   , { constructor	: PresoUtils.get('MR_Instance_SelectorNodePresentation')
													     , nodeType		: ['SelectorNode', 'BrickUPnP_MediaRenderer']
														 , uuid			: MR.uuid
														 , MR			: MR
													     } )
													   );
								}
							}
				    }
				  );
		 */
		 // Create new draggable for Hue
		 this.createCateg("Hue lamp").appendChild( this.createDragNode( 'on...'
												 , { constructor	: PresoUtils.get('PeventBrickPresentation_Hue')
												   , nodeType		: 'EventNode'
												   , isNotType		: 'Pnode'
												   } )
									);
													   
		 // Main drop zone for programs
		 DragDrop.newDropZone( htmlNodeProgram
							 , { acceptedClasse		: 'ProgramNode'
							   , CSSwhenAccepted	: 'possible2drop'
							   , CSSwhenOver		: 'ready2drop'
							   , ondrop				: function(evt, draggedNode, infoObj) {
									 var Pnode = new infoObj.constructor();
									 self.rootProgram = Pnode;
									 htmlNodeProgram.appendChild( Pnode.init('').Render() );
									}
							   }
							 );
		// Buttons to interact with the server
		 var bt_send	= document.getElementById('sendToServer')
		   , bt_load	= document.getElementById('loadFromServer')
		   , bt_start	= document.getElementById('startProgram')
		   , bt_stop	= document.getElementById('stopProgram');
		 bt_load.onclick = function() {
								 var inputHidden = document.getElementById('programId');
								 var ressource = '/loadProgram';
								 if(inputHidden) {
									 ressource += '?programId=' + encodeURIComponent( inputHidden.value );
									}
								 utils.XHR( 'GET', ressource
										  , { onload	: function() {
												 // console.log('getting program from server, server sent:', this);
												 if(this.responseText !== '') {
													 var json = JSON.parse( this.responseText );
													 self.loadProgram(json);
													}
												}
											}
										  );
								};
		 bt_load.onclick(); // Direct call !
		 
		 bt_send.addEventListener( 'click'
								 , function() {
									 var variables		= {program: JSON.stringify(self.rootProgram.serialize())};
									 var inputHidden	= document.getElementById('programId');
									 if(inputHidden) {variables.programId = inputHidden.value;}
									 utils.XHR( 'POST', '/loadProgram'
											  , { variables	: variables
												, onload	: function() {
													 // console.log('loadProgram, server sent:', this);
													 var json = JSON.parse( this.responseText );
													 self.loadProgram(json);
													}
												}
											  );
									}
								 , false );
		 bt_start.addEventListener( 'click'
								  , function() {
										var inputHidden = document.getElementById('programId');
										if(inputHidden) {utils.XHR( 'POST', '/Start'
																  , {variables: {programId: inputHidden.value}}
																  ); }
										}
								  , false );
		 bt_stop.addEventListener ( 'click'
								  , function() {
										var inputHidden = document.getElementById('programId');
										if(inputHidden) {utils.XHR( 'POST', '/Stop'
																  , {variables: {programId: inputHidden.value}}
																  ); }
										}
								  , false );
		}
	, sendProgram	: function() {
		
		}
	, loadProgram	: function(json) {
		 var prog = PresoUtils.unserialize( json );
		 // Unplug previous program if it exists
		 // console.log('Unplug program');
		 this.htmlNodeProgram.innerText = '';
		 // Plug the new one
		 // console.log('Plug parsed program');
		 this.rootProgram = prog;
		 this.htmlNodeProgram.appendChild( prog.Render() );
		 var inputHidden = document.getElementById('programId');
		 if(inputHidden === null) {
			 inputHidden = document.createElement('input');
			 inputHidden.setAttribute('type' , 'hidden');
			 inputHidden.setAttribute('id'   , 'programId');
			 inputHidden.setAttribute('value', prog.PnodeID);
			 document.body.appendChild( inputHidden );
			}
		 inputHidden.setAttribute('value', prog.PnodeID);
		}
};

return editor;
});