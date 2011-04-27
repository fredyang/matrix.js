
//#debug
(function( $, matrix ) {
//#end_debug

	matrix.addHandler( "module", {
		//load method just load the resource it use
		//don't care about its dependencies
		load: function ( resource ) {
			var dependencies = matrix.depend( resource );
			var defer = $.Deferred();

			if ( dependencies ) {
				matrix.load( dependencies, function () {
					defer.resolve();
				} );
			} else {
				defer.resolve();
			}

			return defer.promise();
		},
		url: function ( resource ) {
			return resource;
		}
	} );

	//#debug
})( jQuery, matrix );
//#end_debug
