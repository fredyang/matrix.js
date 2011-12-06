(function ( $ ) {

	var app = window["hello"] = {};
	var content = $( "<h1>hello world!</h1>" );
	var dummy = [];

	app.load = function () {

		for ( var i = 0; i < 999999; i ++ ) {
			dummy.push( (new Date).toString() );
		}

		for ( var i = 0; i < 999999; i ++ ) {
			dummy.push( function () {
				return new Date();
			} );
		}

		return content;
	};
	app.release = function () {
		dummy = [];
		content.remove();
	}

})( jQuery );