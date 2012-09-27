//
(function( $, matrix ) {

	var rdependencies = /^\s*\/\*[\w\W]*Depends:([\w\W]+)\*\//,

		//used to extract "xxx" in jquery.ui.xxx.js
		rWidgetFileName = /jquery\.ui\.(\w+?)\.js/gi;

	//a widget module is a group of js, css files
	//this js, css has its own url conventions
	//here we create a widget loader which inherite from pack loader
	matrix.loader.set( "widget", "pack", {
		// xxx.widget always require on the following
		//
		// xxx.widget_js,
		// core.widget_css,
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
					dependenciesAnnotation = rdependencies.exec( sourceCode );

				if (dependenciesAnnotation = dependenciesAnnotation && dependenciesAnnotation[1]) {
					//dependenciesAnnotation is something like
					/*
					 *	jquery.ui.core.js
					 *	jquery.ui.widget.js
					 */
					while (widgetFileName = rWidgetFileName.exec( dependenciesAnnotation )) {
						//convert jquery.ui.xxx.js to xxx.widget_js
						dependencies.push( widgetFileName[1] + ".widget_js" );
					}
				}

				return dependencies.length ? dependencies.toString() : null;
			}

		},

		url: function( moduleId ) {
			return  matrix.baseUrl + "jquery.ui/jquery.ui." + matrix.fileName( moduleId ) + ".min.js";
		},

		require: function( moduleId ) {
			var widgetName = matrix.fileName( moduleId );
			//if widget is not one of draggable,droppable,mouse,position,sortable,widget
			//it has a css file
			if ("draggable,droppable,mouse,position,sortable,widget".indexOf( widgetName ) == -1) {
				return widgetName + ".widget_css";
			}
		}

	} );

	//widget's css is placed and named according to a convention,
	//we can use this convention to calcuate the url of a widget
	matrix.loader.set( "widget_css", "css", {
		url: function( moduleId ) {
			var widgetName = matrix.fileName( moduleId );
			return matrix.baseUrl + "jquery.ui/css/base/jquery.ui." + widgetName + ".css";
		}
	} );

	//theme's css is placed and named according to a convention,
	//we can use this convention to calcuate the url of a theme
	matrix.loader.set( "ui_theme", "css", {
		url: function( moduleId ) {
			var themeName = matrix.fileName( moduleId );
			return matrix.baseUrl + "jquery.ui/css/themes/" + themeName + "/jquery.ui.theme.css";
		}
	} );

	//the ui_theme.pack by default depends on smoothness.ui_theme
	//In other words, default ui theme is smoothness
	//we can change the dependencies to change the theme
	matrix.require( "ui_theme.pack", "smoothness.ui_theme" );

})( jQuery, matrix );