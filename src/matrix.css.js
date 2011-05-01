//
//#debug
(function( $, matrix ) {
	//#end_debug

	matrix.addHandler( "css", {
		load: matrix.buildLoad(
			//resourcePreloaded
			function ( url ) {
				return !!($( "link" ).filter(
					function () {
						return this.href === url &&  $(this).attr('matrix');
					} ).length);
			},
			//buildEvaluate
			function ( resourceKey, url, sourceCode ) {
				return function () {
					matrix.log( "\tevaluating css " + url );
					var promise = matrix.promises( resourceKey );
					$( "<link href='" + url + "' " + "rel='stylesheet' type='text/css' matrix='1' />" ).appendTo( "head" );
					setTimeout( function () {
						promise.defer.resolve();
					}, 1 );
				};
			} ),

		release: function ( resourceKey ) {
			var url = matrix.url( resourceKey );
			$( "link" ).filter(
				function () {
					return this.href === url && $(this).attr('matrix');
				} ).remove();
		}
	} );

	//#debug
})( jQuery, matrix );
//#end_debug
