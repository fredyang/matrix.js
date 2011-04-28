
//#debug
(function( $, matrix ) {
//#end_debug

	matrix.addHandler( "module", {
		//load method just load the resource it use
		//don't care about its dependencies
		load: function ( resource ) {
			//matrix.log("loading module : " + resource)
			var dependencies = matrix.depend( resource );
			var defer = $.Deferred();

			if ( dependencies ) {
				//matrix.log("\tloading dependencies : " + dependencies);
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
