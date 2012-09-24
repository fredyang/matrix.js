(function( $ ) {

	matrix.loader.set( "loaderWithLoadFunction", {
		//mandatory
		//load is function
		load: function( moduleId ) {
			//your can return a promise object
			//but make sure to defer.resolve(moduleId, optionalResult)
			//
			//or return optionalResult
		},

		//optional
		unload: function( moduleId ) {

		},

		//optional
		//return a url relative to matrix.baseUrl or an absolute url
		url: function( moduleId ) {

		},

		//optional
		depends: function( moduleId ) {
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

		}
	} );

	matrix.loader.set( "loaderWithLoadPipeline", {
		//mandatory
		//load is pipeline object
		load: {
			//the other missing load task will be filled by default value in buildLoadFnWithFilters
			/*
			 var staticLoaded = filters.staticLoaded || loadFilters.staticLoaded.returnFalse,
			 getSource = filters.getSource || loadFilters.getSource.getTextByAjax,
			 compile = filters.compile,
			 crossSiteLoad = filters.crossSiteLoad,
			 buildDependencies = filters.buildDependencies,
			 buildUnload = filters.buildUnload;
			 */
			//optional
			staticLoaded: function( moduleId ) {
				return true;
			},

			//optional if you have crossSiteLoad
			//return the compile result or nothing
			compile: function( moduleId, sourceCode ) {

			},

			//optional if all your resource is local
			//return a promise
			crossSiteLoad: function( moduleId ) {

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
		depends: function( moduleId ) {
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

		}

	} );

})( jQuery );