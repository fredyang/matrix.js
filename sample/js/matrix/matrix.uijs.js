//add uijs handler
(function( $, matrix ) {
	//like core.uijs
	var	rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,
		ruiModule = /jquery\.ui\.(\w+?)\.(js|css)/gi;

	//extend js handler
	matrix.addHandler( "uijs", "js", {

		url: function ( resourceKey ) {
			return matrix.fullUrl( matrix.baseUrl +  "jquery.ui/jquery.ui." + matrix.resourceName( resourceKey ) + ".min.js" );
		},

		parseDepends: function ( sourceCode ) {
			var dependencies = [],
				module,
				dependText = rdependencies.exec( sourceCode );

			if ( dependText = dependText && dependText[1] ) {
				while ( module = ruiModule.exec( dependText ) ) {
					// core + .ui + js == core.uijs
					dependencies.push( module[1] + ".ui" + module[2] );
				}
				return dependencies.length ? dependencies.toString() : null;
			}

			return null;
		}
	} );

})( jQuery, matrix );