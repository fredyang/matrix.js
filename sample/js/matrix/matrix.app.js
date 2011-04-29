//add app handler
(function( $, matrix ) {

	//extend js handler
	var handler = matrix.addHandler( "app", "js", {

		//add url method
		url: function ( resourceKey ) {

			var appName = matrix.resourceName( resourceKey )

			return matrix.fullUrl( matrix.baseUrl + "app/" + appName + ".js" );
		}

	} );

	var _load = handler.load;

	handler.load = function ( resourceKey ) {
		var _promise = _load( resourceKey );

		var appName = matrix.resourceName( resourceKey )

		var appDefer = $.Deferred();
		var appPromise = appDefer.promise();
		appPromise.defer = _promise.defer;

		_promise.done( function () {
			var appContent = window[appName].load();
			appDefer.resolve( appContent );
		} );

		return appPromise;
	};

	handler.release = function ( resourceKey ) {
		var appName = matrix.resourceName( resourceKey )
		window[appName].release();
		window[appName] = undefined;
	}

})( jQuery, matrix );