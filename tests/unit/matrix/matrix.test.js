(function ( $, matrix ) {

	var test = window.test = {};
	test.results = [];

	matrix.addHandler( "test", "module", {
		load: function ( resource ) {
			//Math.floor(Math.random()*11)

			var defer = $.Deferred();

			var dependencies = matrix.depend( resource );
			if ( dependencies ) {
				matrix( dependencies ).done( function () {
					test[matrix.resourceName( resource )] = true;
					test.results.push( matrix.resourceName( resource ) );
					defer.resolve();
				} );
			} else {

				setTimeout( function () {
					test[matrix.resourceName( resource )] = true;
					test.results.push( matrix.resourceName( resource ) );
					defer.resolve();
				}, Math.floor( Math.random() * 11 ) * 10 );
			}

			return defer.promise();

		},
		release : function ( resource ) {
			//revert the side effect

			delete test[matrix.resourceName( resource )];
			//test.results.push( resource );
			for ( var i = 0; i < test.results.length; i++ ) {
				if ( test.results[i] === matrix.resourceName( resource ) ) {
					test.results.splice( i, 1 );
				}
			}
		}

	} );

})( jQuery, matrix );
