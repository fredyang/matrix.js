/*
 <@depends>
 http://coffeescript.org/extras/coffee-script.js
 </@depends>
 * */

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
