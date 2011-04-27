//add uicss handler
(function( $, matrix ) {

	var ruicss = /(\w+)\.uicss$/;
	matrix.addHandler( "uicss", "css", {
		url: function ( resource ) {
			var moduleName = ruicss.exec( resource );
			moduleName = moduleName && moduleName[1];
			return matrix.fullUrl( matrix.baseUrl +  "jquery.ui/css/base/jquery.ui." + moduleName + ".css" );
		}
	} );
})( jQuery, matrix );