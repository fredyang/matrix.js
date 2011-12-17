//add jqueryui_css handler
(function( $, matrix ) {

	matrix.addHandler( "jqueryui", "module", {
		depend: function ( resourceKey ) {
			var resourceName = matrix.resourceName( resourceKey );
			return resourceName + ".jqueryui_js,core.jqueryui_css, jqueryui_theme.module";
		}
	} );

	matrix.addHandler( "jqueryui_css", "css", {
		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/base/jquery.ui." + matrix.resourceName( resourceKey ) + ".css";
		}
	} );

	var rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,
		ruiModule = /jquery\.ui\.(\w+?)\.(js|css)/gi;

	//extend js handler
	matrix.addHandler( "jqueryui_js", "js", {

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
					//find jquery.ui.xxx.css and convert it to xxx.jqueryui_css
					//find jquery.ui.xxx.js and convert it to xxx.jqueryui_js

					// "core" + ".ui" + "js" == "core.jqueryui_js"
					// "core" + ".ui" + "css" == "core.jqueryui_css"
					dependencies.push( module[1] + ".jqueryui_" + module[2] );
				}
				return dependencies.length ? dependencies.toString() : null;
			}

			return null;
		}
	} );

	matrix.addHandler( "jqueryui_theme", "css", {
		url: function ( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/" + matrix.resourceName( resourceKey ) + "/jquery.ui.theme.css";
		}
	} );

})( jQuery, matrix );