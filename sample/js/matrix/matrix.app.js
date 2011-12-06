//add app handler
(function( $, matrix ) {

	//extend js handler
	var handler = matrix.addHandler( "app", "js", {

		//add url method
		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "app/" + matrix.resourceName( resourceKey ) + ".js";
		}

	} );

	var _load = handler.load;

	handler.load = function ( resourceKey ) {
		var _promise = _load( resourceKey );

		var appName = matrix.resourceName( resourceKey )

		var appDefer = $.Deferred();
		var appPromise = appDefer.promise();
		appPromise.parentDefer = _promise.parentDefer;

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