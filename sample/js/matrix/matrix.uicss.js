//add uicss handler
(function( $, matrix ) {

	matrix.addHandler( "uicss", "css", {
		url: function ( resourceKey ) {
			return matrix.fullUrl( matrix.baseUrl + "jquery.ui/css/base/jquery.ui." + matrix.resourceName( resourceKey ) + ".css" );
		}
	} );
})( jQuery, matrix );