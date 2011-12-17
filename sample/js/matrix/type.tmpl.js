(function ( $, matrix ) {

	//<!-- Depends: common.tmpl -->
	var rDependsHeader = /^\s*<!--\s*Depends\s*:\s*([\w\W]+?)\s*-->/i;

	matrix.addHandler( "tmpl", {
		load: matrix.buildLoad(
			function () {
				return false;
			},
			function ( resourceKey, url, sourceCode ) {

				return function () {

					$( sourceCode ).each( function() {
						$.template( this.id, $( this ).html() );
					} );

					matrix.promises( resourceKey ).parentDefer.resolve();
				};
			} ),

		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "tmpl/" + matrix.resourceName( resourceKey ) + ".html";
		}

		, parse: function (resourceKey, sourceCode) {
			var depends = rDependsHeader.exec( sourceCode );
			return (depends && depends[1] ) || null;

		}
	} );

})( jQuery, matrix );
