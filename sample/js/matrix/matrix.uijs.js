//add uijs handler
(function( $, matrix ) {
	//like core.uijs
	var ruijs = /(\w+)\.uijs$/,
		rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,
		ruiModule = /jquery\.ui\.(\w+?)\.(js|css)/gi;

	//extend js handler
	matrix.addHandler( "uijs", "js", {

		//add url method
		url: function ( resource ) {
			//extract "core" from "core.uijs"
			var moduleName = ruijs.exec( resource );
			moduleName = moduleName && moduleName[1];

			return matrix.fullUrl( matrix.baseUrl +  "jquery.ui/jquery.ui." + moduleName + ".min.js" );
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