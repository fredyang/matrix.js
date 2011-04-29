//add uitheme handler
(function( $, matrix ) {

	matrix.addHandler( "uitheme", "css", {
		url: function ( resourceKey ) {
			return matrix.fullUrl( matrix.baseUrl +  "jquery.ui/css/" + matrix.resourceName( resourceKey ) + "/jquery.ui.theme.css" );
		}
	} );

})( jQuery, matrix );
