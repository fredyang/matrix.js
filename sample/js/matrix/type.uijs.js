//add uijs handler
(function( $, matrix ) {
	var rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,
		ruiModule = /jquery\.ui\.(\w+?)\.(js|css)/gi;

	//extend js handler
	matrix.addHandler( "uijs", "js", {

		url: function ( resourceKey ) {
			return  matrix.resourceBaseUrl + "jquery.ui/jquery.ui." + matrix.resourceName( resourceKey ) + ".min.js";
		},

		parse: function ( resourceKey, sourceCode ) {
			var dependencies = [],
				module,
				dependText = rdependencies.exec( sourceCode );

			if ( dependText = dependText && dependText[1] ) {
				//dependText is something like
				/*
				 *	jquery.ui.tabs.css
				 *	jquery.ui.core.js
				 *	jquery.ui.widget.js
				 */
				while ( module = ruiModule.exec( dependText ) ) {
					//find jquery.ui.xxx.css and convert it to xxx.uicss
					//find jquery.ui.xxx.js and convert it to xxx.uijs

					// "xx" + ".ui" + "js" == "core.uijs"
					// "xx" + ".ui" + "css" == "core.uicss"
					dependencies.push( module[1] + ".ui" + module[2] );
				}
				return dependencies.length ? dependencies.toString() : null;
			}

			return null;
		}
	} );

})( jQuery, matrix );