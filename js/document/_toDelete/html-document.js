/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    TextDocument =	require("js/document/text-document").TextDocument,
    NJUtils = 		require("js/lib/NJUtils").NJUtils,
	GLWorld =			require("js/lib/drawing/world").World,
    MaterialsModel = require("js/models/materials-model").MaterialsModel;
////////////////////////////////////////////////////////////////////////
//
exports.HTMLDocument = Montage.create(TextDocument, {
    
    _selectionExclude: { value: null, enumerable: false },
    _htmlTemplateUrl: { value: "js/document/templates/montage-html/index.html", enumerable: false},
    _iframe: { value: null, enumerable: false },
    _server: { value: null, enumerable: false },
    _templateDocument: { value: null, enumerable: false },
    _selectionModel: { value: [], enumerable: false },
    _undoModel: { value: { "queue" : [], "position" : 0 }, enumerable: false},

    _document: { value: null, enumerable: false },
    _documentRoot: { value: null, enumerable: false },
    _liveNodeList: { value: null, enumarable: false },
    _stageBG: { value: null, enumerable: false },
    _window: { value: null, enumerable: false },
    _styles: { value: null, enumerable: false },
    _stylesheets: { value: null, enumerable: false },
    _stageStyleSheetId : { value: 'nj-stage-stylesheet', enumerable: false },
    _userDocument: { value: null, enumerable: false },
    _htmlSource: {value: "<html></html>", enumerable: false},
    _glData: {value: null, enumerable: false },
    _userComponents: { value: {}, enumarable: false},

    _elementCounter: { value: 1, enumerable: false },
    _snapping : { value: true, enumerable: false },
    _layoutMode: { value: "all", enumerable: false },
    _draw3DGrid: { value: false, writable: true },
    _swfObject: { value: false, enumerable: false },

    _zoomFactor: { value: 100, enumerable: false },

    cssLoadInterval: { value: null, enumerable: false },

    _savedLeftScroll: {value:null},
    _savedTopScroll: {value:null},

    _codeViewDocument:{
        writable: true,
        enumerable: true,
        value:null
    },


    //drawUtils state
    _gridHorizontalSpacing: {value:0},
    _gridVerticalSpacing: {value:0},
    //end - drawUtils state

    _undoStack: { value: [] },
    undoStack: {
        get: function() {
            return this._undoStack;
        },
        set:function(value){
            this._undoStack = value;
        }
    },

    _redoStack: { value: [], enumerable: false },

    redoStack: {
        get: function() {
            return this._redoStack;
        },
        set:function(value){
            this._redoStack = value;
        }
    },


    // GETTERS / SETTERS

    codeViewDocument:{
        get: function() { return this._codeViewDocument; },
        set: function(value) { this._codeViewDocument = value}
    },

    savedLeftScroll:{
        get: function() { return this._savedLeftScroll; },
        set: function(value) { this._savedLeftScroll = value}
    },

    savedTopScroll:{
        get: function() { return this._savedTopScroll; },
        set: function(value) { this._savedTopScroll = value}
    },

    gridHorizontalSpacing:{
        get: function() { return this._gridHorizontalSpacing; },
        set: function(value) { this._gridHorizontalSpacing = value}
    },

    gridVerticalSpacing:{
        get: function() { return this._gridVerticalSpacing; },
        set: function(value) { this._gridVerticalSpacing = value}
    },

    selectionExclude: {
        get: function() { return this._selectionExclude; },
        set: function(value) { this._selectionExclude = value; }
    },

    iframe: {
        get: function() { return this._iframe; },
        set: function(value) { this._iframe = value; }
    },

    server: {
        get: function() { return this._server; },
        set: function(value) { this._server = value; }
    },

    selectionModel: {
        get: function() { return this._selectionModel; },
        set: function(value) { this._selectionModel = value; }
    },

    undoModel: {
        get: function() { return this._undoModel; },
        set: function(value) { this._undoModel.queue = value.queue; this._undoModel.position = value.position; }
    },

    documentRoot: {
        get: function() { return this._documentRoot; },
        set: function(value) { this._documentRoot = value; }
    },

    stageBG: {
        get: function() { return this._stageBG; },
        set: function(value) { this._stageBG = value; }
    },

    elementCounter: {
        set: function(value) { this._elementCounter = value; },
        get: function() { return this._elementCounter; }
    },

    snapping: {
        get: function() { return this._snapping; },
        set: function(value) {
            if(this._snapping !== value) {
                this._snapping = value;
            }
        }
    },

    // TODO SEND THE EVENT --> Redraw the desired layout
    layoutMode: {
        get: function() { return this._layoutMode; },
        set: function(mode) { this._layoutMode = mode; }
    },

    draw3DGrid: {
        get: function() { return this._draw3DGrid; },
        set: function(value) {
            if(this._draw3DGrid !== value) {
                this._draw3DGrid = value;
            }
        }
    },

    userComponents: {
        get: function() {
            return this._userComponents;
        }
    },
//    _drawUserComponentsOnOpen:{
//        value:function(){
//            for(var i in this._userComponentSet){
//                console.log(this._userComponentSet[i].control)
//                this._userComponentSet[i].control.needsDraw = true;
//            }
//        }
//    },
    
    glData: {
    	get: function() {
			//
			var elt = this.iframe.contentWindow.document.getElementById("UserContent");
			//
			if (elt) {
                var matLib = MaterialsModel.exportMaterials();
				this._glData = [matLib];
				this.collectGLData(elt, this._glData );
			} else {
				this._glData = null
			}
			//	
			return this._glData;
		},
        set: function(value) {
			var elt = this.documentRoot;
			if (elt)
			{
				/*
				// Use this code to test the runtime version of WebGL
				var cvsDataMngr = Object.create(NinjaCvsRt.CanvasDataManager, {});
				cvsDataMngr.loadGLData(elt, value);
				*/

				// /*
				var nWorlds= value.length;
				for (var i=0;  i<nWorlds;  i++)
				{
					// get the data for the next canvas
					var importStr = value[i];

					// determine if it is the new (JSON) or old style format
					var id = null;
					var jObj = null;
					var index = importStr.indexOf( ';' );
					if ((importStr[0] === 'v') && (index < 24))
					{
						// JSON format.  pull off the
						importStr = importStr.substr( index+1 );
						jObj = JSON.parse( importStr );
						id = jObj.id;
					}
					else
					{
                        // at this point the data could be either the materials library or
                        // an old style world.  We can determine which by converting the string
                        // to an object via JSON.parse.  That operation will fail if the string
                        // is an old style world.
                        var matLibStr = 'materialLibrary;';
                        index = importStr.indexOf( matLibStr );
                        if (index == 0)
                        {
                            importStr = importStr.substr( matLibStr.length );
                            var matLibObj = JSON.parse( importStr );
                            MaterialsModel.importMaterials( matLibObj );
                        }
                        else
                        {
						    var startIndex = importStr.indexOf( "id: " );
						    if (startIndex >= 0) {
							    var endIndex = importStr.indexOf( "\n", startIndex );
							    if (endIndex > 0)
								    id = importStr.substring( startIndex+4, endIndex );
						    }
                        }
					}

					if (id != null)
					{
						var canvas = this.findCanvasWithID( id, elt );
						if (canvas)
						{
							if (!canvas.elementModel)
							{
								NJUtils.makeElementModel(canvas, "Canvas", "shape", true);
							}
							if (canvas.elementModel)
							{
								if (canvas.elementModel.shapeModel.GLWorld)
									canvas.elementModel.shapeModel.GLWorld.clearTree();

								if (jObj)
								{
									var useWebGL = jObj.webGL;
									var world = new GLWorld( canvas, useWebGL );
									world.importJSON( jObj );
								}

								this.buildShapeModel( canvas.elementModel, world );
							}
						}
					}
				}
				// */
			}
		}
    },

	buildShapeModel:
	{
		value: function( elementModel, world )
		{
            var shapeModel = elementModel.shapeModel;
			shapeModel.shapeCount	= 1;	// for now...
			shapeModel.useWebGl		= world._useWebGL;
			shapeModel.GLWorld		= world;
			var root = world.getGeomRoot();
			if (root)
			{
				shapeModel.GLGeomObj			= root;
				shapeModel.strokeSize			= root._strokeWidth;
				shapeModel.strokeStyle			= "solid";
				//shapeModel.strokeStyleIndex
				switch (root.geomType())
				{
					case root.GEOM_TYPE_RECTANGLE:
                        elementModel.selection = "Rectangle";
                        elementModel.pi = "RectanglePi";
						shapeModel.tlRadius = root._tlRadius;
						shapeModel.trRadius = root._trRadius;
						shapeModel.blRadius = root._blRadius;
						shapeModel.brRadius = root._brRadius;
						break;

					case root.GEOM_TYPE_CIRCLE:
                        elementModel.selection = "Oval";
                        elementModel.pi = "OvalPi";
						shapeModel.innerRadius = root._innerRadius;
						break;

					case root.GEOM_TYPE_LINE:
                        elementModel.selection = "Line";
                        elementModel.pi = "LinePi";
						shapeModel.slope = root._slope;
						break;

                    case root.GEOM_TYPE_BRUSH_STROKE:
                        elementModel.selection = "BrushStroke";
                        elementModel.pi = "BrushStrokePi";
						break;

                    case root.GEOM_TYPE_CUBIC_BEZIER:
                        elementModel.selection = "Subpath";
                        elementModel.pi = "SubpathPi";
                        break;

					default:
						console.log( "geometry type not supported for file I/O, " + root.geomType());
						break;
				}
			}
		}
	},

    zoomFactor: {
        get: function() { return this._zoomFactor; },
        set: function(value) { this._zoomFactor = value; }
    },

    /**
     * Add a reference to a component instance to the userComponents hash using the
     * element UUID
     */
    setComponentInstance: {
        value: function(instance, el) {
            this.userComponents[el.uuid] = instance;
        }
    },

    /**
     * Returns the component instance obj from the element
     */
    getComponentFromElement: {
        value: function(el) {
            if(el) {
                if(el.uuid) return this.userComponents[el.uuid];
            } else {
                return null;
            }
        }
    },

    /**
     * search the DOM tree to find a canvas with the given id
     */
	findCanvasWithID:  {
		value: function( id,  elt )  {
			var cid = elt.getAttribute( "data-RDGE-id" );
			if (cid == id)  return elt;

			if (elt.children)
			{
				var nKids = elt.children.length;
				for (var i=0;  i<nKids;  i++)
				{
					var child = elt.children[i];
					var foundElt = this.findCanvasWithID( id, child );
					if (foundElt)  return foundElt;
				}
			}
		}
	},
    
    
    
    ////////////////////////////////////////////////////////////////////
	//
    initialize: {
		value: function(file, uuid, iframe, callback) {
			this.application.ninja.documentController._hackRootFlag = false;
			//
			this._userDocument = file;
			//
			this.init(file.name, file.uri, file.extension, iframe, uuid, callback);
			//
            this.iframe = iframe;
            this.selectionExclude = ["HTML", "BODY", "Viewport", "UserContent", "stageBG"];
            this.currentView = "design";
			//

            this.iframe.src = this._htmlTemplateUrl;
            this.iframe.addEventListener("load", this, true);
        }
    },
    ////////////////////////////////////////////////////////////////////


	collectGLData: {
		value: function( elt,  dataArray )
		{
			if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld)
			{
				var data = elt.elementModel.shapeModel.GLWorld.exportJSON();
				dataArray.push( data );
			}

			if (elt.children)
			{
				var nKids = elt.children.length;
				for (var i=0;  i<nKids;  i++)
				{
					var child = elt.children[i];
					this.collectGLData( child, dataArray );
				}
			}
		}
	},


    // OLD

    inExclusion: {
        value: function(element) {
            if(this._selectionExclude.indexOf(element.id) === -1) {
                if(this._selectionExclude.indexOf(element.nodeName) === -1) {
                    return -1;
                }
            } else if (this._selectionExclude.indexOf(element.id) === -1) {
                return -1;
            } else {
                return 1;
            }
        }
    },

    GetElementFromPoint: {
        value: function(x, y) {
            return this._window.getElement(x,y);
        }
    },
    
    
    
    
    
    
    
    
	/* 		
            DOM Mutation Events:
          		
            DOMActivate, DOMFocusIn, DOMFocusOut, DOMAttrModified,
           	DOMCharacterDataModified, DOMNodeInserted, DOMNodeInsertedIntoDocument,
       		DOMNodeRemoved, DOMNodeRemovedFromDocument, DOMSubtreeModified, DOMContentLoaded
            		
  	*/
  	
  	
  	
  	/*
//TODO: Remove and clean up event listener (DOMSubtreeModified)
  	_hackCount: {
  		value: 0
  	},
*/
	////////////////////////////////////////////////////////////////////
	//
    handleEvent: {
        value: function(event){
        	//TODO: Clean up, using for prototyping save
        	this._templateDocument = {};
        	this._templateDocument.html = this.iframe.contentWindow.document;
        	this._templateDocument.head = this.iframe.contentWindow.document.getElementById("userHead");
        	this._templateDocument.body = this.documentRoot = this.iframe.contentWindow.document.getElementById("UserContent");
        	//TODO: Remove, also for prototyping
        	this.application.ninja.documentController._hackRootFlag = true;
        	//
            this.stageBG = this.iframe.contentWindow.document.getElementById("stageBG");
            this.stageBG.onclick = null;
            this._document = this.iframe.contentWindow.document;
            this._window = this.iframe.contentWindow;
            //
            for (var k in this._document.styleSheets) {
            	if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.setAttribute) {
            		this._document.styleSheets[k].ownerNode.setAttribute('data-ninja-template', 'true');
            	}
            }
            //
            if(!this.documentRoot.Ninja) this.documentRoot.Ninja = {};
            
            
            
            //TODO: Clean up, using for prototyping
            this._templateDocument.head.innerHTML = (this._userDocument.content.head.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));
            this._templateDocument.body.innerHTML = (this._userDocument.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));            
           	
            
            
            var scripttags = this._templateDocument.html.getElementsByTagName('script'), webgldata;  //TODO: Use querySelectorAll
            //
            for (var w in scripttags) {
            	if (scripttags[w].getAttribute) {
            		if (scripttags[w].getAttribute('data-ninja-webgl') !== null) {
            			//TODO: Add logic to handle more than one data tag
            			webgldata = JSON.parse((scripttags[w].innerHTML.replace("(", "")).replace(")", ""));
            		}
            	}
            }
            //
            if (webgldata) {
            	for (var n=0; webgldata.data[n]; n++) {
            		webgldata.data[n] = unescape(webgldata.data[n]);
            	}
            	this._templateDocument.webgl = webgldata.data;
            }
            
            
            
            //Temporarily checking for disabled special case
            var stags = this.iframe.contentWindow.document.getElementsByTagName('style'),
            	ltags = this.iframe.contentWindow.document.getElementsByTagName('link');
           	//
            for (var m = 0; m < ltags.length; m++) {
            	if (ltags[m].getAttribute('data-ninja-template') === null) {
            		if (ltags[m].getAttribute('disabled')) {
           				ltags[m].removeAttribute('disabled');
           				ltags[m].setAttribute('data-ninja-disabled', 'true');
           			}
           		}
           	}
            //
           	for (var n = 0; n < stags.length; n++) {
           		if (stags[n].getAttribute('data-ninja-template') === null) {
           			if (stags[n].getAttribute('disabled')) {
           				stags[n].removeAttribute('disabled');
           				stags[n].setAttribute('data-ninja-disabled', 'true');
            		}
            	}
            }
            
            
            
            //Adding a handler for the main user document reel to finish loading
            this._document.body.addEventListener("userTemplateDidLoad",  this.userTemplateDidLoad.bind(this), false);

            // Live node list of the current loaded document
            this._liveNodeList = this.documentRoot.getElementsByTagName('*');

            // TODO Move this to the appropriate location
            var len = this._liveNodeList.length;

            for(var i = 0; i < len; i++) {
                NJUtils.makeModelFromElement(this._liveNodeList[i]);
            }

            /* this.iframe.contentWindow.document.addEventListener('DOMSubtreeModified', function (e) { */ //TODO: Remove events upon loading once

            //TODO: When re-written, the best way to initialize the document is to listen for the DOM tree being modified
            setTimeout(function () {
            	
            	
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	if(this._document.styleSheets.length > 1) {
					//Checking all styleSheets in document
					for (var i in this._document.styleSheets) {
						//If rules are null, assuming cross-origin issue
						if(this._document.styleSheets[i].rules === null) {
							//TODO: Revisit URLs and URI creation logic, very hack right now
							var fileUri, cssUrl, cssData, query, prefixUrl, fileCouldDirUrl, docRootUrl;
							//
            				docRootUrl = this.application.ninja.coreIoApi.rootUrl+escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]).replace(/\/\//gi, '/'));
							//TODO: Parse out relative URLs and map them to absolute
							if (this._document.styleSheets[i].href.indexOf(this.application.ninja.coreIoApi.rootUrl) !== -1) {
								//
								cssUrl = this._document.styleSheets[i].href.split(this.application.ninja.coreIoApi.rootUrl)[1];
								fileUri = this.application.ninja.coreIoApi.cloudData.root+cssUrl;
								//TODO: Add error handling for reading file
								cssData = this.application.ninja.coreIoApi.readFile({uri: fileUri});
								//
								var tag = this.iframe.contentWindow.document.createElement('style');
								tag.setAttribute('type', 'text/css');
								tag.setAttribute('data-ninja-uri', fileUri);
								tag.setAttribute('data-ninja-file-url', cssUrl);
								tag.setAttribute('data-ninja-file-read-only', JSON.parse(this.application.ninja.coreIoApi.isFileWritable({uri: fileUri}).content).readOnly);
								tag.setAttribute('data-ninja-file-name', cssUrl.split('/')[cssUrl.split('/').length-1]);
								//Copying attributes to maintain same properties as the <link>
								for (var n in this._document.styleSheets[i].ownerNode.attributes) {
									if (this._document.styleSheets[i].ownerNode.attributes[n].value && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled' && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled') {
										if (this._document.styleSheets[i].ownerNode.attributes[n].value.indexOf(docRootUrl) !== -1) {
											tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value.split(docRootUrl)[1]);
										} else {
											tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value);
										}
									}
								}
								//
								fileCouldDirUrl = this._document.styleSheets[i].href.split(this._document.styleSheets[i].href.split('/')[this._document.styleSheets[i].href.split('/').length-1])[0];
								
								//TODO: Make public version of this.application.ninja.ioMediator.getNinjaPropUrlRedirect with dynamic ROOT
								tag.innerHTML = cssData.content.replace(/url\(()(.+?)\1\)/g, detectUrl);
								
								function detectUrl (prop) {
									return prop.replace(/[^()\\""\\'']+/g, prefixUrl);;
								}
								
								function prefixUrl (url) {
									if (url !== 'url') {
										if (!url.match(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi)) {
											url = fileCouldDirUrl+url;
										}
									}
									return url;
								}
								
								//Looping through DOM to insert style tag at location of link element
								query = this._templateDocument.html.querySelectorAll(['link']);
								for (var j in query) {
									if (query[j].href === this._document.styleSheets[i].href) {
										//Disabling style sheet to reload via inserting in style tag
										query[j].setAttribute('disabled', 'true');
										//Inserting tag
										this._templateDocument.head.insertBefore(tag, query[j]);
									}
								}
							} else {
								console.log('ERROR: Cross-Domain-Stylesheet detected, unable to load in Ninja');
								//None local stylesheet, probably on a CDN (locked)
								var tag = this.iframe.contentWindow.document.createElement('style');
								tag.setAttribute('type', 'text/css');
								tag.setAttribute('data-ninja-external-url', this._document.styleSheets[i].href);
								tag.setAttribute('data-ninja-file-read-only', "true");
								tag.setAttribute('data-ninja-file-name', this._document.styleSheets[i].href.split('/')[this._document.styleSheets[i].href.split('/').length-1]);
								//Copying attributes to maintain same properties as the <link>
								for (var n in this._document.styleSheets[i].ownerNode.attributes) {
									if (this._document.styleSheets[i].ownerNode.attributes[n].value && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled' && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled') {
										if (this._document.styleSheets[i].ownerNode.attributes[n].value.indexOf(docRootUrl) !== -1) {
											tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value.split(docRootUrl)[1]);
										} else {
											tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value);
										}
									}
								}
								/*
								
								//TODO: Figure out cross-domain XHR issue, might need cloud to handle
								var xhr = new XMLHttpRequest();
                    			xhr.open("GET", this._document.styleSheets[i].href, true);
                    			xhr.send();
                    			//
                    			if (xhr.readyState === 4) {
                        			console.log(xhr);
                    			}
                    			//tag.innerHTML = xhr.responseText //xhr.response;
								*/
                    			//Temp rule so it's registered in the array
                    			tag.innerHTML = 'noRULEjustHACK{background: #000}';
								//Disabling external style sheets
								query = this._templateDocument.html.querySelectorAll(['link']);
								for (var k in query) {
									if (query[k].href === this._document.styleSheets[i].href) {
										
										//TODO: Removed the temp insertion of the stylesheet
										//because it wasn't the proper way to do it
										//need to be handled via XHR with proxy in Cloud Sim
										
										//Disabling style sheet to reload via inserting in style tag
										//var tempCSS = query[k].cloneNode(true);
										//tempCSS.setAttribute('data-ninja-template', 'true');
										query[k].setAttribute('disabled', 'true');
										//this.iframe.contentWindow.document.head.appendChild(tempCSS);
										//Inserting tag
										this._templateDocument.head.insertBefore(tag, query[k]);
									}
								}
							}
                    	}
					}
					////////////////////////////////////////////////////////////////////////////
					////////////////////////////////////////////////////////////////////////////
					
					//TODO: Check if this is needed
					this._stylesheets = this._document.styleSheets;
					
					////////////////////////////////////////////////////////////////////////////
					////////////////////////////////////////////////////////////////////////////
					
					//TODO Finish this implementation once we start caching Core Elements
					// Assign a model to the UserContent and add the ViewPort reference to it.
					NJUtils.makeElementModel(this.documentRoot, "Stage", "stage");
                    NJUtils.makeElementModel(this.stageBG, "Stage", "stage");
					NJUtils.makeElementModel(this.iframe.contentWindow.document.getElementById("Viewport"), "Stage", "stage");

                    // Initialize the 3D properties
                    this.documentRoot.elementModel.props3D.init(this.documentRoot, true);
                    this.stageBG.elementModel.props3D.init(this.stageBG, true);
                    this.iframe.contentWindow.document.getElementById("Viewport").elementModel.props3D.init(this.iframe.contentWindow.document.getElementById("Viewport"), true);

					for(i = 0; i < this._stylesheets.length; i++) {
						if(this._stylesheets[i].ownerNode.id === this._stageStyleSheetId) {
							this.documentRoot.elementModel.defaultRule = this._stylesheets[i];
							break;
						}
					}
					 
					//Temporary create properties for each rule we need to save the index of the rule
					var len = this.documentRoot.elementModel.defaultRule.cssRules.length;
					for(var j = 0; j < len; j++) {
						//console.log(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText);
						if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "*") {
						
							this.documentRoot.elementModel.transitionStopRule = this.documentRoot.elementModel.defaultRule.cssRules[j];
						
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "body") {
							
							this.documentRoot.elementModel.body = this.documentRoot.elementModel.defaultRule.cssRules[j];
						
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "#Viewport") {
						
							this.documentRoot.elementModel.viewPort = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === ".stageDimension") {
						
							this.documentRoot.elementModel.stageDimension = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === ".stageView") {
							
							this.documentRoot.elementModel.stageView = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "#stageBG") {
							
							this.documentRoot.elementModel.stageBackground = this.documentRoot.elementModel.defaultRule.cssRules[j];
						}
					}
					
					this.callback(this);
					
					//Setting webGL data
					if (this._templateDocument.webgl) {
						this.glData = this._templateDocument.webgl;
					}
				}
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			
			
			
			
			
			}.bind(this), 1000);
			
			
            
            
     	}
    },

    ////////////////////////////////////////////////////////////////////

    // Handler for user content main reel. Gets called once the main reel of the template
    // gets deserialized.
    // Setting up the currentSelectedContainer to the document body.
    userTemplateDidLoad: {
        value: function(){
            //this.application.ninja.currentSelectedContainer = this.documentRoot;
        }
    },
    
    
    ////////////////////////////////////////////////////////////////////
    _setSWFObjectScript: {
        value: function() {
            if(!this._swfObject) {
                /*
                var swfObj = document.createElement("script");
                swfObj.type = "text/javascript";
                swfObj.src = "../../user-document-templates/external-libs/swf-object/swfobject.js";
                swfObj.id = "swfObject";
                var head= this._document.getElementsByTagName('head')[0];
                head.appendChild(swfObj);
                this._swfObject = true;
                */
            }
        }
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
	//
    livePreview: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add logic to handle save before preview
    		this.application.ninja.documentController.handleExecuteSaveAll(null);
    		//Temp check for webGL Hack
    		window.open(this.application.ninja.coreIoApi.rootUrl + this.application.ninja.documentController._activeDocument.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1]);
    		//chrome.tabs.create({url: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController._activeDocument.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1]});		
    	}
    },
	////////////////////////////////////////////////////////////////////
	//
	save: {
		enumerable: false,
    	value: function () {
    		//TODO: Add code view logic and also styles for HTML
    		if (this.currentView === 'design') {
    			var styles = [];
    			for (var k in this._document.styleSheets) {
    				if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.getAttribute) {
            			if (this._document.styleSheets[k].ownerNode.getAttribute('ninjatemplate') === null) {
            				styles.push(this._document.styleSheets[k]);
            			}
            		}
            	}
    			//return {mode: 'html', document: this._userDocument, mjs: this._userComponents, webgl: this.glData, styles: styles, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    			return {mode: 'html', document: this._userDocument, webgl: this.glData, styles: styles, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    		} else if (this.currentView === "code"){
    			//TODO: Would this get call when we are in code of HTML?
    		} else {
    			//Error
    		}
    	}
	},
	////////////////////////////////////////////////////////////////////
	//
	saveAll: {
		enumerable: false,
    	value: function () {
    		//TODO: Add code view logic and also styles for HTML
    		if (this.currentView === 'design') {
    			var css = [];
    			for (var k in this._document.styleSheets) {
    				if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.getAttribute) {
            			if (this._document.styleSheets[k].ownerNode.getAttribute('ninjatemplate') === null) {
            				css.push(this._document.styleSheets[k]);
            			}
            		}
            	}
    			//return {mode: 'html', document: this._userDocument, mjs: this._userComponents, webgl: this.glData, css: css, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    			return {mode: 'html', document: this._userDocument, webgl: this.glData, css: css, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    		} else if (this.currentView === "code"){
    			//TODO: Would this get call when we are in code of HTML?
    		} else {
    			//Error
    		}
    	}
	}
});