/*!
 * matrix JavaScript Library v0.1
 * http://semanticsworks.com/p/matrix-library.html
 *
 * Copyright 2011, Fred Yang
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/gpl-2.0
 *
 * Date: Wed Apr 27 14:38:19 2011 -0400
 *///
(function ( $, undefined ) {

	var _urls = {},
		_promises = {},
		_dependencies = {},
		_handlers = {},
		dummyLink = document.createElement( "a" ),
		//match string "ref2, ref1" in  "/* Depends: ref2, ref1 */"
		rheader = /^\s*\/\*\s*Depends\s*:\s*([\w\W]+?)\s*\*\//i,
		rcomma = /,/,
		rspace = /\s+/g,
		slice = [].slice,
		rextension = /\.(\w+)$/,
		accessUrl,
		matrix = function( resources, fn ) {
			var promise;
			if ( typeof resources === "string" ) {
				promise = loadParallel( resources );
			} else {
				promise = loadSeries( resources );
			}

			var callbacks = fn && slice.call( arguments, 1 );
			return callbacks ? promise.done.apply( promise, callbacks ) : promise;
		};

	window.matrix = matrix;
	matrix.load = matrix;

	//the following members can be extended by new handler
	$.extend( matrix, {

		//load: matrix,

		release: function( resources ) {
			var i,
				singleResource,
				dependencies,
				handler,
				refCount,
				promise;

			if ( typeof resources === "string" ) {

				resources = split( resources );
			}

			//if there is only one resource
			if ( resources.length === 1 ) {

				singleResource = resources[0];

				promise = matrix.promises( singleResource );
				//make sure it will not throw exception when
				// releasing some resource which is not in page
				if ( !promise ) {
					return;
				}

				handler = getHandler( singleResource );

				if ( !promise.preload ) {
					refCount = --promise.refCount;
					if ( refCount === 0 ) {
						handler.release && handler.release( singleResource );

						//delete the promises associated with the resource
						matrix.promises( singleResource, undefined );

						if ( (dependencies = matrix.depend( singleResource )) ) {
							matrix.release( dependencies );
						}
					}
				}

			} else {
				//releaseAll
				for ( i = 0; i < resources.length; i ++ ) {
					matrix.release( resources[i] );
				}
			}
		},

		url: function ( resource, url ) {
			var args;

			if ( typeof resource === "string" ) {
				var handler = getHandler( resource );
				if ( handler.url ) {
					return handler.url( resource );
				}
			}

			//if resource's url is not in database
			//and user is trying to get it,
			// use resource value as url
			if ( (typeof resource === "string" ) && !_urls[resource] && url === undefined ) {
				url = matrix.baseUrl + resource;
				args = [resource, url];
			} else {
				args = slice.call( arguments );
			}

			return accessUrl.apply( null, args );
		},

		/**
		 * it returns null, meaning the it has no dependencies
		 * or an array of resource keys
		 */
		parseDepends: function ( resource, sourceCode ) {
			var handler = getHandler( resource );
			if ( handler.parseDepends ) {
				return handler.parseDepends( sourceCode );
			}

			var depends = rheader.exec( sourceCode );
			return (depends && depends[1] ) || null;
		}

	} );

	function buildAccess( items, keyFn, valueFn ) {
		//access method to array
		return function access( key, value ) {

			if ( typeof key === "object" ) {
				for ( var k in key ) {
					access( k, key[k] );
				}
				return items;
			}

			if ( keyFn ) {
				key = keyFn( key );
			}
			if ( value === undefined ) {
				if ( arguments.length === 1 ) {
					return items[key];

				} else {
					delete items[key];
				}
			} else {
				if ( valueFn ) {
					value = valueFn( value, key );
				}
				return (items[key] = value);
			}
		};
	}

	// members to configure matrix
	$.extend( matrix, {

		depend: function ( resource, dependencies, reload ) {

			if ( typeof resource === "object" ) {
				reload = dependencies;
				for ( var key in resource ) {
					if ( resource.hasOwnProperty( key ) ) {
						matrix.depend( key, resource[key], reload );
					}
				}
				return;
			}

			if ( dependencies === undefined ) {
				if ( arguments.length == 1 ) {
					return _dependencies[resource];
				} else {
					delete _dependencies[resource];
				}

			} else {

				//if caller ask for reload and the resources has been loaded
				//then we need to reload
				var needToReload = reload && matrix.promises( resource );

				if ( needToReload ) {
					matrix.release( resource, true );
					_dependencies[resource] = dependencies;
					return matrix.load( resource );
				} else {
					return (_dependencies[resource] = dependencies);
				}
			}

		},

		promises : buildAccess( _promises, matrix.url ),

		//the url relative to the current location
		baseUrl: "",

		//the url relative to the baseUrl
		homeUrl: "matrix/",



		loadHandlers: function ( names ) {
			if ( typeof names === "string" ) {
				names = split( names );
			}
			for ( var i = 0; i < names.length; i ++ ) {
				names[i] = matrix.homeUrl + "matrix." + names[i] + ".js";
			}
			names = names.toString();
			return matrix( names );
		}
	} );

	//members used to create new handlers
	$.extend( matrix, {
		addHandler: function ( name, baseName, extension ) {
			if ( typeof baseName === "object" ) {
				extension = baseName;
				baseName = null;
			}

			return (_handlers[name] = $.extend( {}, _handlers[baseName], extension ));
		},

		buildLoad: function ( checkPreload, buildSourceEvaluator ) {

			var loadResource = function ( resource, url, deepParse ) {


				$.get( url, null, null, "text" ).success( function ( sourceCode ) {
					var evaluate = buildSourceEvaluator( resource, url, sourceCode );

					var dependencies;
					var shouldDeepParse = deepParse && (dependencies = matrix.parseDepends( resource, sourceCode ));

					if ( shouldDeepParse ) {
						//set dependencies so that it can be used in release method
						matrix.depend( resource, dependencies );

						matrix.load( dependencies, evaluate );

					} else {
						evaluate();
					}
				} );
			};

			return function ( resource ) {

				var dependencies,
					defer = $.Deferred(),
					promise = defer.promise(),
					url = matrix.url( resource );

				var preLoad = checkPreload( url );
				if ( preLoad ) {
					promise.preload = true;
					defer.resolve();
					return promise;
				}

				promise.defer = defer;
				dependencies = matrix.depend( resource );

				if ( dependencies ) {
					matrix.load( dependencies, function () {
						loadResource( resource, url, false );
					} );
				}
				else if ( dependencies === null ) {
					//dependencies is explicitly set to null,
					// meaning that the resource has no dependencies
					loadResource( resource, url, false );

				} else {
					//dependencies is unknown, need to deep parse content
					loadResource( resource, url, true );

				}

				return promise;
			};
		}

	} );

	// public utilities
	$.extend( matrix, {
		fullUrl: function ( relativeUrl ) {
			dummyLink.href = relativeUrl;
			return dummyLink.href;
		},

		debug: function () {

			this._dependencies = _dependencies;
			this._urls = _urls;
			this._promises = _promises;
			this._handlers = _handlers;
		}
	} );

	accessUrl = buildAccess( _urls, undefined, matrix.fullUrl );

	function split( refString ) {
		var s = refString.replace( rspace, "" );
		return s.split( rcomma );
	}

	//resources is string
	function loadParallel( resources ) {
		var promises = [],
			promise;
		resources = split( resources );

		if ( resources.length === 1 ) {
			promise = loadOne( resources[0] );
		}
		else {
			for ( var i = 0; i < resources.length; i++ ) {
				promises.push( loadOne( resources[i] ) );
			}
			promise = $.when.apply( $, promises );
		}

		return addLoadMethod( promise );
	}

	//resources is array
	function loadSeries( resources ) {
		var promise,
			i = 0,
			temp,
			resource;

		for ( i = 0; i < resources.length; i ++ ) {
			resource = resources[i];
			if ( i === 0 ) {
				promise = matrix.load( resource );
			} else {
				promise = promise.load( resource );
			}
		}

		return addLoadMethod( promise );
	}

	function getHandler( resource ) {
		var resourceType = rextension.exec( resource );
		resourceType = resourceType && resourceType[1];
		if ( !resourceType ) {
			$.error( "missing extension in reference, can't get handler" );
		}

		var handler = _handlers[resourceType];
		if ( !handler ) {
			$.error( "handler has not been registered" );
		}
		return handler;
	}

	function loadOne( resource ) {
		var handler,
			promise = matrix.promises( resource );

		if ( !promise ) {
			handler = getHandler( resource );
			promise = handler.load( resource );

			if ( !promise.preload ) {
				promise.refCount = 1;
			}
			matrix.promises( resource, promise );
		} else {
			if ( !promise.preload ) {
				promise.refCount ++;
			}
		}

		return promise;
	}

	/*this method allow user serialize loading of resource*/
	function addLoadMethod( promise ) {
		var bridgeDefer = $.Deferred();
		promise.load = function () {
			var args = slice.call( arguments, 0 );
			promise.done( function () {
				matrix.apply( null, args ).done( function () {
					bridgeDefer.resolve();
				} );
			} );
			return addLoadMethod( bridgeDefer.promise() );
		};

		return promise;
	}



	matrix.addHandler( "module", {
		//load method just load the resource it use
		//don't care about its dependencies
		load: function ( resource ) {
			var dependencies = matrix.depend( resource );
			var defer = $.Deferred();

			if ( dependencies ) {
				matrix.load( dependencies, function () {
					defer.resolve();
				} );
			} else {
				defer.resolve();
			}

			return defer.promise();
		},
		url: function ( resource ) {
			return resource;
		}
	} );

//

	var rReleaseMethod = /\s*\/\*\s*release\s*:\s*([\w\W]+?)\s*\*\/\w*$/;

	matrix.addHandler( "js", {
		load : matrix.buildLoad(
			//checkPreload
			function ( url ) {
				return !!($( "script" ).filter(
					function () {
						return this.src === url;
					} ).length);
			},
			//buildSourceEvaluator
			function ( resource, url, sourceCode ) {
				//build release method defined in the script
				var promise = matrix.promises( resource );

				var releaseMethod = rReleaseMethod.exec( sourceCode );

				if ( releaseMethod && releaseMethod[1] ) {
					//the defer object has been created in imp method
					//so it is safe to use it here
					promise.release = new Function( releaseMethod[1] );
				}

				return function () {
					$.globalEval( sourceCode );
					promise.defer.resolve();
				};
			} ),
		release: function ( resource ) {
			var promise = matrix.promises( resource );
			if ( promise && promise.release ) {
				promise.release();
			}
		}
	} );


	matrix.addHandler( "css", {
		load: matrix.buildLoad(
			//checkPreload
			function ( url ) {
				return !!($( "link" ).filter(
					function () {
						return this.href === url &&  $(this).attr('matrix');
					} ).length);
			},
			//buildSourceEvaluator
			function ( resource, url, sourceCode ) {
				var promise = matrix.promises( resource );
				return function () {
					$( "<link href='" + url + "' " + "rel='stylesheet' type='text/css' matrix='true' />" ).appendTo( "head" );
					setTimeout( function () {
						promise.defer.resolve();
					}, 1 );
				};
			} ),

		release: function ( resource ) {
			var url = matrix.url( resource );
			$( "link" ).filter(
				function () {
					return this.href === url && $(this).attr('matrix');
				} ).remove();
		}
	} );

})( jQuery );