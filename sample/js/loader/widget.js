//
(function( $, matrix ) {

	var rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,

		//used to extract "xxx" in jquery.ui.xxx.js
		rWidgetFileName = /jquery\.ui\.(\w+?)\.js/gi;

	matrix.loader.set( "widget", "pack", {
		// widgetName.widget always require on the following
		//
		// widgetName.widget_js,
		// core.widget_css,
		// ui_theme.pack
		//
		// for example
		// dialog.widget require on
		//
		// dialog.widget_js
		// core.widget_css
		// ui_theme.pack
		//
		//ui_theme.pack is container for actaul theme
		//an actual theme is like redmond.ui_theme
		require: function( moduleId ) {
			var widgetName = matrix.fileName( moduleId );
			return widgetName + ".widget_js, core.widget_css, ui_theme.pack";
		}
	} );

	matrix.loader.set( "widget_js", "js", {
		load: {

			//return null means there is no dependency
			buildDependencies: function( moduleId, sourceCode ) {
				var dependencies = [],
					widgetFileName,
					dependText = rdependencies.exec( sourceCode );

				if (dependText = dependText && dependText[1]) {
					//dependText is something like
					/*
					 *	jquery.ui.core.js
					 *	jquery.ui.widget.js
					 */
					while (widgetFileName = rWidgetFileName.exec( dependText )) {
						//convert jquery.ui.xxx.js to xxx.widget_js
						dependencies.push( widgetFileName[1] + ".widget_js" );
					}
					return dependencies.length ? dependencies.toString() : null;
				}

				return null;
			}

		},

		url: function( moduleId ) {
			return  matrix.baseUrl + "jquery.ui/jquery.ui." + matrix.fileName( moduleId ) + ".min.js";
		},

		require: function( moduleId ) {
			var widgetName = matrix.fileName( moduleId );
			//draggable,droppable,mouse,position,sortable,widget does not have a css
			if ("draggable,droppable,mouse,position,sortable,widget".indexOf( widgetName ) == -1) {
				return widgetName + ".widget_css";
			}
		}

	} );

	//use convention to find widget css
	matrix.loader.set( "widget_css", "css", {
		url: function( moduleId ) {
			var widgetName = matrix.fileName( moduleId );
			return matrix.baseUrl + "jquery.ui/css/base/jquery.ui." + widgetName + ".css";
		}
	} );

	//use convention to find theme css
	matrix.loader.set( "ui_theme", "css", {
		url: function( moduleId ) {
			var themeName = matrix.fileName( moduleId );
			return matrix.baseUrl + "jquery.ui/css/themes/" + themeName + "/jquery.ui.theme.css";
		}
	} );

	//no_theme is the default theme
	matrix.require( "ui_theme.pack", "smoothness.ui_theme" );

})( jQuery, matrix );