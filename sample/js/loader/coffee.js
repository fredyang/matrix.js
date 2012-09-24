/*
 <@depends>
ref/coffee-script.js
 </@depends>
 * */

// http://coffeescript.org/extras/coffee-script.js

(function() {

	matrix.loader.set( "coffee", {
		load: {
			compile: function( moduleId, sourceCode ) {
				$.globalEval( CoffeeScript.compile( sourceCode, {
					bare: true
				} ) );
			}
		},

		url: "folder"
	} );

	window.cf = CoffeeScript;

})();
