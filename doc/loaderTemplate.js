(function( $ ) {

	matrix.loader.set( "loaderName", "baseLoaderName", {

		//mandatory
		//load is function
		load: function( moduleId ) {
			//if you can return the module immediately
			//return it now , return module
			//
			//if not, your can return a promise object
			//
			//in your processing code make sure
			// to defer.resolve(moduleId, module) later
		},

		//optional
		unload: function( moduleId ) {

		},

		//optional
		//return a url relative to matrix.baseUrl or an absolute url
		url: function( moduleId ) {

		},

		//optional
		//get the depedencies of a moduleId
		require: function( moduleId ) {
			//return a resourceString or resourceArray
			//return "a.html, b.js";
		},

		//optional
		//the first handler that be execute
		//when promise is done
		done: function( moduleId ) {

		},

		//optional
		//the first handler that be execute
		//when promise is failed
		fail: function( moduleId ) {

		},

		//this is optional
		//it is necessary when we use file name to calcualate url,
		// and the loader name is different from extension of
		//of physical file name
		fileExt: "file extension"
	} );

	matrix.loader.set( "loaderName", "baseloaderName", {
		//mandatory
		//load is pipeline object
		load: {

			//optional
			//determine whether moduleId is staticalLoaded
			staticLoaded: function( moduleId ) {
				return true;
			},

			//optional if you have crossSiteLoad
			//return the compile result or nothing
			compile: function( moduleId, sourceCode ) {

			},

			//optional if all your resource is local
			//if your resource can be cross site you need to implement this
			//return a promise
			crossSiteLoad: function( moduleId ) {
				//return promise
			},

			//optional
			//this provide some static dependencies by
			//parsing the source code
			buildDependencies: function( moduleId, sourceCode ) {
				//return "x.js, b.html, c.css";
			},

			//optional
			//return a function () {}
			buildUnload: function( sourceCode, moduleId ) {
				//return a function () {}
			}

		},

		////////////the following is same as loaderWithLoadFunction
		//optional
		unload: function( moduleId ) {

		},

		//optional
		//return a url relative to matrix.baseUrl or an absolute url
		url: function( moduleId ) {

		},

		//optional
		require: function( moduleId ) {
			//return a resourceString or resourceArray
			//return "a.html, b.js";
		},

		//optional
		//the first handler that be execute
		//when promise is done
		done: function( moduleId ) {

		},

		//optional
		//the first handler that be execute
		//when promise is failed
		fail: function( moduleId ) {

		},

		//this is optional
		//it is necessary when we use file name to calcualate url,
		// and the loader name is different from extension of
		//of physical file name
		fileExt: "file extension"

	} );

})( jQuery );