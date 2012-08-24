(function( $, matrix ) {

	var appStore = {};
	window.appStore = appStore;

	matrix.loader.set( "app", "js", {
		unload: function( moduleId ) {
			appStore[matrix.fileName( moduleId )].release();
			delete appStore[matrix.fileName( moduleId )];
		},
		url: "folder"
	} );

})( jQuery, matrix );