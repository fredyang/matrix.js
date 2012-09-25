/*
 <@require>
 http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.js
 </@require>
 */
(function( $, matrix ) {

	matrix.loader.set( "tmpl", {
		load: {
			compile: function( moduleId, sourceCode ) {
				$( sourceCode ).filter( "script" ).each( function() {
					$.template( this.id, $( this ).html() );
				} );
			},
			buildDependencies: "parseRequireTag"
		},

		url: "folder",

		fileExt: "html"
	} );

})( jQuery, matrix );
