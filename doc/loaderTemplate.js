(function( $ ) {

	matrix.loader.set( "linkerWithoutFilters", {
		//mandatory
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

	matrix.loader.set( "linkerUsingFilters", {
		//mandatory
		load: {
			//optional
			staticLoaded: function( moduleId ) {
				return true;
			},
			//optional if you have crossSiteLoad
			compile: function( moduleId, sourceCode ) {

			},
			//optional if all your resource is local
			crossSiteLoad: function( moduleId ) {

			},

			//optional
			//this provide some static dependencies by
			//parsing the source code
			buildDependencies: function( moduleId, sourceCode ) {
				//return "x.js, b.html, c.css";
			},

			//optional
			//this
			buildUnload: function( sourceCode, moduleId ) {
				//return new Function (sourceCode);
			}
		}
		//the remaining is same as above linker

	} );

})( jQuery );