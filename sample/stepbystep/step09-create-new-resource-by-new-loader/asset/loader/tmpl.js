/*
 <@require>
 http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.js
 </@require>
 */
(function( $, matrix ) {

	matrix.loader.set( "tmpl", {
		load: {
			staticLoaded: function( moduleId ) {
				return !!$.template[moduleId];
			},
			compile: function( moduleId, sourceCode ) {
				$( sourceCode ).filter( "script" ).each( function() {
					$.template( this.id, $( this ).html() );
				} );
			}
		},

		url: "folder",

		fileExt: "html"
	} );

})( jQuery, matrix );
