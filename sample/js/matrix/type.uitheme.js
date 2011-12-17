//add uitheme handler
(function( $, matrix ) {

	matrix.addHandler( "uitheme", "css", {
		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/" + matrix.resourceName( resourceKey ) + "/jquery.ui.theme.css";
		}
	} );

})( jQuery, matrix );
