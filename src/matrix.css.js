//
//#debug
(function( $, matrix ) {
	//#end_debug

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
			function ( resourceKey, url, sourceCode ) {
				var promise = matrix.promises( resourceKey );
				return function () {
					matrix.log( "\tevaluating css " + url );
					$( "<link href='" + url + "' " + "rel='stylesheet' type='text/css' matrix='true' />" ).appendTo( "head" );
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
