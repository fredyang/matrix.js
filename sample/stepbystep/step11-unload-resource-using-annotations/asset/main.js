/*
 <@unload>
 dummy = null;
 delete window.dummy;
 </@unload>
 * */
(function( $ ) {

	var dummy = [];
	for (var i = 0; i < 999999; i++) {
		dummy.push( (new Date).toString() );
	}

	for (var i = 0; i < 999999; i++) {
		dummy.push( function() {
			return new Date();
		} );
	}

	window.dummy = dummy;
})( window );