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
			return matrix.resourceBaseUrl + matrix.matrixBaseUrl + "type." + matrix.resourceName( resourceKey ) + ".js";
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
