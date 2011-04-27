//
//#debug
(function( $, matrix ) {
	//#end_debug

	matrix.addHandler( "css", {
		load: matrix.buildLoad(
			function ( url ) {
				return !!($( "link" ).filter(
					function () {
						return this.href === url && !this.matrix;
					} ).length);
			},
			function ( resource, url, sourceCode ) {
				var promise = matrix.promises( resource );
				return function () {
					matrix.log( "add css @ <link href='" + url + "' " + "rel='stylesheet' type='text/css' />" );
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
					return this.href === url;
				} ).remove();
		}
	} );

	//#debug
})( jQuery, matrix );
//#end_debug
