/*!
 * matrix.js JavaScript Library v0.2pre
 * http://blog.semanticsworks.com/p/matrixjs-javascript-library.html
 *
 * Copyright 2011, Fred Yang
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/gpl-2.0
 *
 * Date: Tue Dec 6 01:29:26 2011 -0500
 *///
(function ( $, undefined ) {

	var _urls = {},
		_promises = {},
		_dependencies = {},
		_handlers = {},
		dummyLink = document.createElement( "a" ),
		//match string "ref2, ref1" in  "/* Depends: ref2, ref1 */"
		rDependHeader = /^\s*\/\*\s*Depends\s*:\s*([\w\W]+?)\s*\*\//i,
		rComma = /,/,
		rSpace = /\s+/g,
		slice = [].slice,
		rResourceType = /\.(\w+)$/,
		rResourceName = /(.+)\.\w+$/,
		accessUrl,
		rHttpOrRoot = /^http[s]?:\/\/|^\//,
		previousPromise,
		rUrl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
		ajaxLocParts = rUrl.exec( location.href.toLowerCase() ) || [],

		//for parallel loading
		// matrix([holdReady,] resourceString, dependencyInOrder)
		//
		//for serial loading and mixed serial/parallel loading strategy
		// matrix([holdReady,] resourceArray)
		matrix = window.matrix = function( holdReady, resourceGroup, dependencyInOrder ) {

			var currentPromise;
			if ( typeof holdReady !== "boolean" ) {
				//by default it is false
				dependencyInOrder = resourceGroup;
				resourceGroup = holdReady;
				holdReady = false;
			}

			holdReady = holdReady && !$.isReady;

			//always save the current promise to previousPromise for use in andLoad
			currentPromise = previousPromise = smartLoad( resourceGroup, dependencyInOrder );

			if ( holdReady ) {

				$.holdReady( true );

				currentPromise.done( function () {
					$.ready( true );
				} );
			}

			return currentPromise;
		};

	function smartLoad( resourceGroup, dependencyInOrder ) {

		var i,
			keys;

		if ( typeof resourceGroup === "string" ) {

			if ( dependencyInOrder ) {
				//create dependency in order
				keys = split( resourceGroup );
				for ( i = 0; i < keys.length; i ++ ) {
					if ( i === 0 ) {
						if ( !matrix.depend( keys [i] ) ) {
							matrix.depend( keys [i], null );
						}
					}
					if ( i < keys.length - 1 ) {
						matrix.depend( keys[i + 1], keys[i] );
					}
				}

				resourceGroup = keys[keys.length - 1];
			}

			return loadInParallel( resourceGroup );

		} else if ( $.isArray( resourceGroup ) ) {

			//if it is resourceArray, load one after previous is completely loaded
			return loadInSerial( resourceGroup );

		}

		throw "resource parameter should be an array or string";

	}

	//add a promise.thenLoad method dynamically, so that it can
	//be used load other resource when current promise finished
	//the thenLoad method is a smartLoad method, use the same way in which
	//you call matrix
	function decoratePromise( promise ) {
		var nextDefer = $.Deferred();

		promise.thenLoad = function () {
			var loadArguments = slice.call( arguments );
			promise.done( function () {
				matrix.apply( null, loadArguments ).done( function ( content ) {
					nextDefer.resolve( content );
				} );
			} );
			return decoratePromise( nextDefer.promise() );
		};
		//TODO: test promise.andLoad function
		promise.andLoad = function () {
			var oldPendingPromise = previousPromise;
			var currentPromise = matrix.apply( null, arguments );
			return decoratePromise( $.when( currentPromise, oldPendingPromise ) );
		};

		return promise;
	}

	//resourceString is like "a.js, b.css, c.tmpl"
	function loadInParallel( resourceString ) {
		var promises = [],
			promise,
			resourceArray = split( resourceString );

		if ( resourceArray.length === 1 ) {
			promise = tryLoadSingleResource( resourceArray[0] );
		}
		else {
			for ( var i = 0; i < resourceArray.length; i++ ) {
				promises.push( tryLoadSingleResource( resourceArray[i] ) );
			}
			promise = $.when.apply( $, promises );
		}

		return decoratePromise( promise );
	}

	//resources can be "a.js, b.css, c.tmpl"
	//it can be ["a.js", "b.css", "c.tmpl"]
	//or ["a.js,b.css", ["c.tmpl", "d.tmpl"], "e.css"] and so on
	//it serial load the top level resource unit, within each resource unit, use smart
	//loader matrix
	function loadInSerial( resources ) {
		var promise,
			i = 0,
			resourceKey;
		if ( typeof resources === "string" ) {
			resources = split( resources );
		}

		for ( i = 0; i < resources.length; i ++ ) {

			resourceKey = resources[i];

			if ( i === 0 ) {
				//we don't know whether resourceKey is a string or array
				promise = smartLoad( resourceKey );
			} else {
				//thenLoad is serialized load
				promise = promise.thenLoad( resourceKey );
			}
		}

		return decoratePromise( promise );
	}

	//the following members can be extended by new handler
	$.extend( matrix, {

		// release(resourceString)
		// release(resourceArray)
		//release method does not care about dependencies, it just remove reference
		release: function( resourceArray ) {
			var i,
				resourceKey,
				dependencies,
				handler,
				promise;

			if ( typeof resourceArray === "string" ) {

				resourceArray = split( resourceArray );
			}

			//if there is only one resource
			if ( resourceArray.length === 1 ) {

				resourceKey = resourceArray[0];

				promise = matrix.promises( resourceKey );

				//make sure it will not throw exception when
				// releasing some resource which is not in page
				if ( !promise || promise.preload ) {
					return;
				}

				handler = getHandler( resourceKey );

				if ( --promise.refCount === 0 ) {

					handler.release && handler.release( resourceKey );

					//delete the promises associated with the resource
					matrix.promises( resourceKey, undefined );

					if ( (dependencies = matrix.depend( resourceKey )) ) {

						matrix.release( dependencies );
					}
				}

			} else {

				//releaseAll
				for ( i = 0; i < resourceArray.length; i ++ ) {
					matrix.release( resourceArray[i] );
				}

			}
		},

		url: function ( resourceKey, url ) {

			if ( typeof resourceKey === "string" ) {
				var handler = getHandler( resourceKey );
				if ( handler.url ) {
					//because it by pass the following, handler.url function should resolve
					//the resulted url relative to the location.href
					return handler.url( resourceKey );
				}
			}

			if ( !_urls[resourceKey] && url === undefined ) {
				//if resource's url is not in database
				//and user is trying to get it, register it first, then return the result
				//the default strategy of url resolving is use matrix.baseUrl + resourceKey
				return accessUrl( resourceKey,
					rHttpOrRoot.test( resourceKey ) ? resourceKey :
						matrix.resourceBaseUrl + resourceKey );

			} else {

				return accessUrl.apply( null, arguments );

			}

		},

		/**
		 * it returns null, meaning the it has no dependencies
		 * or an array of resource keys
		 */
		parse: function ( resourceKey, sourceCode ) {
			var depends,
				handler = getHandler( resourceKey );
			if ( handler.parse ) {

				depends = handler.parse( resourceKey, sourceCode );

			} else {
				//use the default parser
				depends = rDependHeader.exec( sourceCode );
				depends = (depends && depends[1] ) || null;
			}

			matrix.depend( resourceKey, depends );
			return depends;
		}

	} );

	function buildAccess( items, convertKey, convertValue ) {
		//access method to array
		return function access( key, value ) {

			if ( typeof key === "object" ) {
				for ( var k in key ) {
					access( k, key[k] );
				}
				return items;
			}

			if ( convertKey ) {
				key = convertKey( key );
			}
			if ( value === undefined ) {
				if ( arguments.length === 1 ) {
					return items[key];

				} else {
					delete items[key];
				}
			} else {
				if ( convertValue ) {
					value = convertValue( value, key );
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
					return matrix( resourceKey );
				} else {
					return (_dependencies[resourceKey] = dependencies);
				}
			}

		},

		loadResourceHandlers: function ( handlerNames ) {
			matrix( $.map( split( handlerNames ),
				function ( value ) {
					return value + ".handler";
				} ).toString() );
		},
		//the url relative to the current location
		//it is used to calculate the real relative url of resource key
		//
		//you can leave this to be empty, if your resource key
		//already is already relative url based on current page
		resourceBaseUrl: "",

		//the url of the matrix folder, which contains all the matrix files
		//this url is relative the resourceBaseUrl. You are advised to put
		// your matrix folder inside the resourceBaseUrl, so that you don't need
		// to change it. If you have other folder setup, you should
		// change this value, otherwise the feature to automatically load resource handler
		// might have problem.
		matrixBaseUrl: "matrix/"
	} );

	function isCrossDomain( url ) {
		var parts = rUrl.exec( url.toLowerCase() );
		return !!( parts &&
		           ( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
		             ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
		             ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
	}

	//members used to create new handlers
	$.extend( matrix, {
		addHandler: function ( name, baseName, extension ) {
			if ( typeof baseName === "object" ) {
				extension = baseName;
				baseName = null;
			}

			return (_handlers[name] = $.extend( {}, _handlers[baseName], extension ));
		},

		/**
		 * a factory to build a load method
		 * @param fnIsResourceStaticLinked, is a function(url), which check whether the reourse has
		 * been preloaded
		 * @param fnBuildEvaluate, is a function(resourceKey, url, sourceCode), which do some
		 * pre-processing, and return a evaluate method
		 */
		buildLoad: function ( fnIsResourceStaticLinked, fnBuildEvaluate, fnCrossDomainFetch ) {

			var fetch = function ( resourceKey, url, deepParse ) {

				matrix.log( "fetching @ " + url );

				if ( isCrossDomain( url ) ) {
					matrix.log( "\tcross-domain evaluating  " + url );
					fnCrossDomainFetch( url ).done( function ( content ) {
						matrix.promises( resourceKey ).parentDefer.resolve( content );
					} );
				} else {
					$.get( url, null, null, "text" ).success( function ( sourceCode ) {
						var evaluate = fnBuildEvaluate( resourceKey, url, sourceCode );

						var dependencies = deepParse && matrix.parse( resourceKey, sourceCode );

						if ( dependencies ) {
							//set dependencies so that it can be used in release method
							matrix.depend( resourceKey, dependencies );

							//matrix.log("\tloading dependencies in manifest of " + resource + ":" + dependencies);
							matrix( dependencies ).done( evaluate );

						} else {
							evaluate();
						}
					} );
				}

			};

			return function ( resourceKey ) {

				var dependencies,
					defer = $.Deferred(),
					promise = defer.promise(),
					url = matrix.url( resourceKey );

				var staticLinked = fnIsResourceStaticLinked( url );
				if ( staticLinked ) {
					promise.preload = true;
					defer.resolve();
					return promise;
				}

				//save the promise's parent defer for later resolve
				//this is very important, because the defer object itself don't know when to
				//resolve, it has too be resolved at holder of the promise
				promise.parentDefer = defer;
				//matrix.log("prepare loading : " + resource)
				dependencies = matrix.depend( resourceKey );

				if ( dependencies ) {
					//matrix.log("\tloading registered dependencies : " + resource)
					matrix( dependencies ).done( function () {
						fetch( resourceKey, url, false );
					} );
				}
				else if ( dependencies === null ) {
					//dependencies is explicitly set to null,
					// meaning that the resource has no dependencies
					fetch( resourceKey, url, false );

				} else {
					//dependencies is unknown, need to deep parse content
					fetch( resourceKey, url, true );

				}

				return promise;
			};
		}

	} );

	// public utilities
	$.extend( matrix, {

		//return function (resourceKey)
		promises : buildAccess( _promises, matrix.url ),

		fullUrl: function ( relativeUrl ) {
			dummyLink.href = relativeUrl;
			return dummyLink.href;
		},

		resourceType: function ( resourceKey ) {
			return rResourceType.exec( resourceKey )[1];
		},

		resourceName: function ( resourceKey ) {
			return rResourceName.exec( resourceKey )[1];
		},

		debug: function () {
			//#debug
			this.log = function ( msg ) {
				var console = window.console;
				console && console.log && console.log( msg );
			};
			//#end_debug
			//matrix.debug.enabled = true;
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

	function split( text ) {
		var s = text.replace( rSpace, "" );
		return s.split( rComma );
	}

	function getHandler( resourceKey ) {
		return _handlers[matrix.resourceType( resourceKey )];
	}

	function tryLoadSingleResource( resourceKey ) {
		var handler = getHandler( resourceKey );
		if ( !handler ) {
			return matrix( matrix.resourceType( resourceKey ) + ".handler" )
				.thenLoad( resourceKey );
		}
		return loadSingleResource( resourceKey );
	}

	function loadSingleResource( resourceKey ) {

		var handler,
			promise = matrix.promises( resourceKey );
		if ( !promise ) {

			handler = getHandler( resourceKey );
			if ( !handler ) {
				throw "There is no handler for resource type" + matrix.resourceType( resourceKey );
			}
			promise = handler.load( resourceKey );

			//add the promise into resourceKey
			matrix.promises( resourceKey, promise );
		}

		//preload resource will never be counted for reference
		//as we don't want that to be unloaded
		if ( !promise.preload ) {
			promise.refCount = promise.refCount ? promise.refCount + 1 : 1;
		}

		return promise;
	}

	//#debug
})( jQuery );
//#end_debug
//
//#debug
(function( $, matrix ) {
	//#end_debug

	matrix.addHandler( "module", {
		//load method just load the resource it use
		//don't care about its dependencies
		load: function ( resourceKey ) {
			//matrix.log("loading module : " + resource)
			var dependencies = matrix.depend( resourceKey );
			var defer = $.Deferred();

			if ( dependencies ) {
				//matrix.log("\tloading dependencies : " + dependencies);
				matrix( dependencies ).done( function () {
					defer.resolve();
				} );
			} else {
				defer.resolve();
			}

			return defer.promise();
		},

		url: function ( resourceKey ) {
			return resourceKey;
		}
	} );

	var rReleaseMethod = /\s*\/\*\s*release\s*:\s*([\w\W]+?)\s*\*\/\w*$/;

	matrix.addHandler( "js", {
		//load is function ()
		//start of load method
		load : matrix.buildLoad(

			//fnIsResourceStaticLinked
			function ( url ) {
				return !!($( "script" ).filter(
					function () {
						return this.src === url;
					} ).length);
			},

			//fnBuildEvaluate
			function ( resourceKey, url, sourceCode ) {
				//build release method defined in the script
				var promise = matrix.promises( resourceKey );

				var releaseMethod = rReleaseMethod.exec( sourceCode );

				if ( releaseMethod && releaseMethod[1] ) {
					//the defer object has been created in imp method
					//so it is safe to use it here
					promise.release = new Function( releaseMethod[1] );
				}

				return function () {
					matrix.log( "\tevaluating js  " + url );

					//#debug
					//the following is debugging in browser, as $.globalEval() caused problem
					//in viewing the source in debugger, and this code will be remove from
					//release version
					if ( matrix.debug.enabled ) {
						var script = document.createElement( "script" ),
							head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

						script.src = url;
						script.onload = script.onreadystatechange = function ( _, isAbort ) {
							if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

								script.onload = script.onreadystatechange = null;

								promise.parentDefer.resolve();
							}
						}
						head.insertBefore( script, head.firstChild );
						return;
					}
					//#end_debug

					$.globalEval( sourceCode );
					promise.parentDefer.resolve();
				};
			},

			//fnCrossDomainFetch( url )
			$.getScript
		),

		//end of load method

		release: function ( resourceKey ) {
			var promise = matrix.promises( resourceKey );
			if ( promise && promise.release ) {
				promise.release();
			}
		}
	} );

	matrix.addHandler( "handler", "js", {

		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + matrix.matrixBaseUrl + "matrix." + matrix.resourceName( resourceKey ) + ".js";
		}

	} );

	matrix.addHandler( "css", {
		load: matrix.buildLoad(
			//fnIsResourceStaticLinked
			function ( url ) {
				return !!($( "link" ).filter(
					function () {
						return this.href === url && $( this ).attr( 'matrix' );
					} ).length);
			},
			//fnBuildEvaluate
			function ( resourceKey, url ) {
				return function () {
					matrix.log( "\tevaluating css " + url );
					var promise = matrix.promises( resourceKey );
					$( "<link href='" + url + "' " + "rel='stylesheet' type='text/css' matrix='1' />" ).appendTo( "head" );
					setTimeout( function () {
						promise.parentDefer.resolve();
					}, 1 );
				};
			},

			//fnCrossDomainFetch( url )
			function ( url ) {
				$( "<link href='" + url + "' " + "rel='stylesheet' type='text/css' matrix='1' />" ).appendTo( "head" );

				var d = $.Deferred();
				setTimeout( function () {
					d.resolve();
				} );
				return d.promise();
			}
		),

		release: function ( resourceKey ) {
			var url = matrix.url( resourceKey );
			$( "link" ).filter(
				function () {
					return this.href === url && $( this ).attr( 'matrix' );
				} ).remove();
		}
	} );

	//#debug
})( jQuery, matrix );
//#end_debug
