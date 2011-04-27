//add app handler
(function( $, matrix ) {
	var rapp = /(\w+)\.app$/;

	//extend js handler
	var handler = matrix.addHandler( "app", "js", {

		//add url method
		url: function ( resource ) {

			var appName = rapp.exec( resource );
			appName = appName && appName[1];

			return matrix.fullUrl( matrix.baseUrl + "app/" + appName + ".js" );
		}

	} );

	var _load = handler.load;

	handler.load = function ( resource ) {
		var _promise = _load( resource );

		var appName = rapp.exec( resource );
		appName = appName && appName[1];

		var appDefer = $.Deferred();
		var appPromise = appDefer.promise();
		appPromise.defer = _promise.defer;

		_promise.done( function () {
			var appContent = window[appName].load();
			appDefer.resolve( appContent );
		} );

		return appPromise;
	};

	handler.release = function ( resource ) {
		var appName = rapp.exec( resource );
		appName = appName && appName[1];
		window[appName].release();
		window[appName] = undefined;
	}

})( jQuery, matrix );