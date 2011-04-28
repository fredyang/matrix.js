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
			function ( resource, url, sourceCode ) {
				var promise = matrix.promises( resource );
				return function () {
					matrix.log( "\trunning css " + url );
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

	//#debug
})( jQuery, matrix );
//#end_debug
