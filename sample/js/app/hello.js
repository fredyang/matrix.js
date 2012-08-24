(function( $ ) {

	var app = {};
	var content = $( "<h1>hello world!</h1>" );
	var dummy;

	function createLotsMemory () {
		dummy = [];
		for (var i = 0; i < 999999; i++) {
			dummy.push( (new Date).toString() );
		}

		for (var i = 0; i < 999999; i++) {
			dummy.push( function() {
				return new Date();
			} );
		}
	}

	app.load = function( view ) {
		createLotsMemory();
		$( view ).append( content );
	};
	app.release = function() {
		dummy = null;
		content.remove();
	};

	appStore.hello = app;

})( jQuery );