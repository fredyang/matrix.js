(function( $ ) {

	var viewStore = {};
	window.viewStore = viewStore;

	matrix.loader.set( "view", "js", {
		unload: function( moduleId ) {
			var viewName = matrix.fileName( moduleId );
			var release = viewStore[viewName].release;
			//view.release is optional
			release && release();
			//view.content is required
			viewStore[viewName].content.remove();
			delete viewStore[viewName];
		},
		url: "folder"
	} );

})( jQuery );