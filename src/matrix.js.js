//
//#debug
(function ( $, matrix ) {
	//#end_debug

	var rReleaseMethod = /\s*\/\*\s*release\s*:\s*([\w\W]+?)\s*\*\/\w*$/;

	matrix.addHandler( "js", {
		load : matrix.buildLoad(
			//resourcePreloaded
			function ( url ) {
				return !!($( "script" ).filter(
					function () {
						return this.src === url;
					} ).length);
			},
			//buildEvaluate
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
					$.globalEval( sourceCode );
					promise.defer.resolve();
				};
			} ),
		release: function ( resourceKey ) {
			var promise = matrix.promises( resourceKey );
			if ( promise && promise.release ) {
				promise.release();
			}
		}
	} );

	//#debug
})( jQuery, matrix );
//#end_debug