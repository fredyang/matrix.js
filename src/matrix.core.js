//
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
		rresourceType = /\.(\w+)$/,
		rresourceName = /(.+)\.\w+$/,
		accessUrl,
		matrix = function( resourceKeys, fn ) {
			var promise;
			if ( typeof resourceKeys === "string" ) {
				promise = loadParallel( resourceKeys );
			} else {
				promise = loadSeries( resourceKeys );
			}

			var callbacks = fn && slice.call( arguments, 1 );
			return callbacks ? promise.done.apply( promise, callbacks ) : promise;
		};

	window.matrix = matrix;
	matrix.load = matrix;

	//the following members can be extended by new handler
	$.extend( matrix, {

		//load: matrix,

		release: function( resourceKeys ) {
			var i,
				resourceKey,
				dependencies,
				handler,
				refCount,
				promise;

			if ( typeof resourceKeys === "string" ) {

				resourceKeys = split( resourceKeys );
			}

			//if there is only one resource
			if ( resourceKeys.length === 1 ) {

				resourceKey = resourceKeys[0];

				promise = matrix.promises( resourceKey );
				//make sure it will not throw exception when
				// releasing some resource which is not in page
				if ( !promise ) {
					return;
				}

				handler = getHandler( resourceKey );

				if ( !promise.preload ) {
					refCount = --promise.refCount;
					if ( refCount === 0 ) {
						handler.release && handler.release( resourceKey );

						//delete the promises associated with the resource
						matrix.promises( resourceKey, undefined );

						if ( (dependencies = matrix.depend( resourceKey )) ) {
							matrix.release( dependencies );
						}
					}
				}

			} else {
				//releaseAll
				for ( i = 0; i < resourceKeys.length; i ++ ) {
					matrix.release( resourceKeys[i] );
				}
			}
		},

		url: function ( resourceKey, url ) {
			var args;

			if ( typeof resourceKey === "string" ) {
				var handler = getHandler( resourceKey );
				if ( handler.url ) {
					return handler.url( resourceKey );
				}
			}

			//if resource's url is not in database
			//and user is trying to get it,
			// use resource value as url
			if ( (typeof resourceKey === "string" ) && !_urls[resourceKey] && url === undefined ) {
				url = matrix.baseUrl + resourceKey;
				args = [resourceKey, url];
			} else {
				args = slice.call( arguments );
			}

			return accessUrl.apply( null, args );
		},

		/**
		 * it returns null, meaning the it has no dependencies
		 * or an array of resource keys
		 */
		parseDepends: function ( resourceKey, sourceCode ) {
			var handler = getHandler( resourceKey );
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

		depend: function ( resourceKey, dependencies, reload ) {

			if ( typeof resourceKey === "object" ) {
				reload = dependencies;
				for ( var key in resourceKey ) {
					if ( resourceKey.hasOwnProperty( key ) ) {
						matrix.depend( key, resourceKey[key], reload );
					}
				}
				return;
			}

			if ( dependencies === undefined ) {
				if ( arguments.length == 1 ) {
					return _dependencies[resourceKey];
				} else {
					delete _dependencies[resourceKey];
				}

			} else {

				//if caller ask for reload and the resources has been loaded
				//then we need to reload
				var needToReload = reload && matrix.promises( resourceKey );

				if ( needToReload ) {
					matrix.release( resourceKey, true );
					_dependencies[resourceKey] = dependencies;
					return matrix.load( resourceKey );
				} else {
					return (_dependencies[resourceKey] = dependencies);
				}
			}

		},

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

			var fetchResource = function ( resourceKey, url, deepParse ) {

				matrix.log( "fetching @ " + url );

				$.get( url, null, null, "text" ).success( function ( sourceCode ) {
					var evaluate = buildSourceEvaluator( resourceKey, url, sourceCode );

					var dependencies;
					var shouldDeepParse = deepParse && (dependencies = matrix.parseDepends( resourceKey, sourceCode ));

					if ( shouldDeepParse ) {
						//set dependencies so that it can be used in release method
						matrix.depend( resourceKey, dependencies );

						//matrix.log("\tloading dependencies in manifest of " + resource + ":" + dependencies);
						matrix.load( dependencies, evaluate );

					} else {
						evaluate();
					}
				} );
			};

			return function ( resourceKey ) {

				var dependencies,
					defer = $.Deferred(),
					promise = defer.promise(),
					url = matrix.url( resourceKey );

				var preLoad = checkPreload( url );
				if ( preLoad ) {
					promise.preload = true;
					defer.resolve();
					return promise;
				}

				promise.defer = defer;
				//matrix.log("prepare loading : " + resource)
				dependencies = matrix.depend( resourceKey );

				if ( dependencies ) {
					//matrix.log("\tloading registered dependencies : " + resource)
					matrix.load( dependencies, function () {
						fetchResource( resourceKey, url, false );
					} );
				}
				else if ( dependencies === null ) {
					//dependencies is explicitly set to null,
					// meaning that the resource has no dependencies
					fetchResource( resourceKey, url, false );

				} else {
					//dependencies is unknown, need to deep parse content
					fetchResource( resourceKey, url, true );

				}

				return promise;
			};
		}

	} );

	// public utilities
	$.extend( matrix, {

		promises : buildAccess( _promises, matrix.url ),

		fullUrl: function ( relativeUrl ) {
			dummyLink.href = relativeUrl;
			return dummyLink.href;
		},

		resourceType: function ( resourceKey ) {
			var resourceType = rresourceType.exec( resourceKey );
			resourceType = resourceType && resourceType[1];
			if ( !resourceType ) {
				$.error( "missing resource type in resourceKey" );
			}
			return resourceType;
		},

		resourceName: function ( resourceKey ) {
			var resourceName = rresourceName.exec( resourceKey );
			return resourceName && resourceName[1];
		},

		debug: function () {
			//#debug
			this.log = function ( msg ) {
				var console = window.console;
				console && console.log && console.log( msg );
			};
			//#end_debug

			this._dependencies = _dependencies;
			this._urls = _urls;
			this._promises = _promises;
			this._handlers = _handlers;
		}
		//#debug
		,

		log: $.noop
		//#end_debug
	} );

	accessUrl = buildAccess( _urls, undefined, matrix.fullUrl );

	function split( refString ) {
		var s = refString.replace( rspace, "" );
		return s.split( rcomma );
	}

	//resources is string
	function loadParallel( resourceKeys ) {
		var promises = [],
			promise;
		resourceKeys = split( resourceKeys );

		if ( resourceKeys.length === 1 ) {
			promise = loadOne( resourceKeys[0] );
		}
		else {
			for ( var i = 0; i < resourceKeys.length; i++ ) {
				promises.push( loadOne( resourceKeys[i] ) );
			}
			promise = $.when.apply( $, promises );
		}

		return addLoadMethod( promise );
	}

	//resources is array
	function loadSeries( resourceKeys ) {
		var promise,
			i = 0,
			temp,
			resourceKey;

		for ( i = 0; i < resourceKeys.length; i ++ ) {
			resourceKey = resourceKeys[i];
			if ( i === 0 ) {
				promise = matrix.load( resourceKey );
			} else {
				promise = promise.load( resourceKey );
			}
		}

		return addLoadMethod( promise );
	}

	function getHandler( resourceKey ) {
		var handler = _handlers[matrix.resourceType(resourceKey)];
		if ( !handler ) {
			$.error( "handler has not been registered" );
		}
		return handler;
	}

	function loadOne( resourceKey ) {
		var handler,
			promise = matrix.promises( resourceKey );

		if ( !promise ) {
			handler = getHandler( resourceKey );
			promise = handler.load( resourceKey );

			if ( !promise.preload ) {
				promise.refCount = 1;
			}
			matrix.promises( resourceKey, promise );
		} else {
			if ( !promise.preload ) {
				promise.refCount ++;
			}
		}

		return promise;
	}

	/*this method allow user serialize fetching and evaluation of resource*/
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

	//#debug
})( jQuery );
//#end_debug
