//add uicss handler
(function( $, matrix ) {

	matrix.addHandler( "uicss", "css", {
		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/base/jquery.ui." + matrix.resourceName( resourceKey ) + ".css";
		}
	} );
})( jQuery, matrix );