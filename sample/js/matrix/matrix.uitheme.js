//add uitheme handler
(function( $, matrix ) {

	var ruitheme = /(\w+)\.uitheme$/;

	matrix.addHandler( "uitheme", "css", {
		url: function ( resource ) {
			var moduleName = ruitheme.exec( resource );
			moduleName = moduleName && moduleName[1];
			return matrix.fullUrl( matrix.baseUrl +  "jquery.ui/css/" + moduleName + "/jquery.ui.theme.css" );
		}
	} );

})( jQuery, matrix );
