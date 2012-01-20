//add jqueryui_css handler
(function( $, matrix ) {


	matrix.addHandler( "jqueryui", "module", {
		// a moduleName.jqueryui depends on
		// moduleName.jquery_js,
		// core.jqueryui_css,
		// jqueryui_theme.module
		//
		// for example
		// dialog.jqueryui depends on
		//
		// dialog.jquery_js (base js extend url, parse(depends))
		// core.jqueryui_css (base css extend url)
		// jqueryui_theme.module (which depends on one of the themes such as
		// redmond.jqueryui_theme, which is base css extend url)
		depend: function( resourceKey ) {
			var moduleName = matrix.resourceName( resourceKey );
			return moduleName + ".jqueryui_js,core.jqueryui_css, jqueryui_theme.module";
		}
	} );

	matrix.addHandler( "jqueryui_css", "css", {
		url: function( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/base/jquery.ui." + matrix.resourceName( resourceKey ) + ".css";
		}
	} );

	var rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,
		ruiModule = /jquery\.ui\.(\w+?)\.(js|css)/gi;

	//extend js handler
	matrix.addHandler( "jqueryui_js", "js", {

		url: function( resourceKey ) {
			return  matrix.resourceBaseUrl + "jquery.ui/jquery.ui." + matrix.resourceName( resourceKey ) + ".min.js";
		},

		parse: function( resourceKey, sourceCode ) {
			var dependencies = [],
				module,
				dependText = rdependencies.exec( sourceCode );

			if (dependText = dependText && dependText[1]) {
				//dependText is something like
				/*
				 *	jquery.ui.tabs.css
				 *	jquery.ui.core.js
				 *	jquery.ui.widget.js
				 */
				while (module = ruiModule.exec( dependText )) {
					//find jquery.ui.xxx.css and convert it to xxx.jqueryui_css
					//find jquery.ui.xxx.js and convert it to xxx.jqueryui_js

					//module[1] is "xxx"
					//module[2] is "js" or "css"
					// "xxx" + ".ui" + "js" == "xxx.jqueryui_js"
					// "xxx" + ".ui" + "css" == "xxx.jqueryui_css"
					dependencies.push( module[1] + ".jqueryui_" + module[2] );
				}
				return dependencies.length ? dependencies.toString() : null;
			}

			return null;
		}
	} );

	matrix.addHandler( "jqueryui_theme", "css", {
		url: function( resourceKey ) {
			return matrix.resourceBaseUrl + "jquery.ui/css/" + matrix.resourceName( resourceKey ) + "/jquery.ui.theme.css";
		}
	} );

})( jQuery, matrix );