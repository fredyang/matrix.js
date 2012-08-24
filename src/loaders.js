//the following defined four built-in adapters( js0, js, cs0, css, module, adapter )
//
//#debug
(function( $ ) {
	//#end_debug

	//#debug
	var loaderCommands = matrix.loader.commands;
	var loadFilters = matrix.loader.loadFilters;
	var findLoader = matrix.debug.findLoader;
	var fullUrl = matrix.debug.fullUrl;
	var removeHash = matrix.debug.removeHash;
	//#end_debug

	var setLoader = matrix.loader.set,

		//if yo have code like the following in javascript,
		//the part delete window.depend2 will be extracted
		/* <@unload>
		 delete window.depend2;
		 </@unload>
		 */
		runloadStatement = /<@unload>([\w\W]+?)<\/@unload>/i,

		//match string "ref2, ref1" in
		/* <@depends>
		 ref2, ref1
		 <@depends>
		 */
		rDependHeader = /<@depends>([\w\W]+?)<\/@depends>/i;

	$.extend( true, loaderCommands, {
		load: {
			cacheImage: function( moduleId ) {
				var defer = $.Deferred(),
					promise = defer.promise(),
					url = matrix.url( moduleId );

				var img = new Image();
				img = new Image();
				img.onload = function() {
					defer.resolve( moduleId, url );
				};
				img.onerror = function() {
					defer.reject( moduleId, url );
				};
				img.src = url;
				return promise;
			}

		},
		unload: {
			removeCssLinkTag: function( moduleId ) {
				var url = fullUrl( matrix.url( moduleId ) );
				$( "link" ).filter(
					function() {
						return this.href === url && $( this ).attr( 'loadedByMatrix' );
					} ).remove();
			}
		},
		url: {
			moduleId: function( moduleId ) {
				return moduleId;
			},
			//this url expect module is put into its folder under baseUrl
			//for example, your module is view.loader, tmpl.loader, you expect
			//this module is under baseUrl/loader folder, with the file name
			//view.js and tmpl.js, as the fileExt of the loader is "js"
			folder: function( moduleId ) {
				var fileExt = findLoader( moduleId ).fileExt;

				var fileName = fileExt ? matrix.fileName( moduleId ) + "." + fileExt :
					moduleId;

				return matrix.fileExt( moduleId ) + "/" + fileName;
			}
		}
	} );

	function linkCss ( moduleId ) {
		$( "<link href='" + matrix.url( moduleId ) + "' " + "rel='stylesheet' type='text/css' loadedByMatrix='1' />" ).appendTo( "head" );
	}

	$.extend( true, loadFilters, {
		staticLoaded: {
			returnFalse: function() {
				return false;
			},

			hasScriptTag: function( moduleId ) {
				return !!($( "script" ).filter(
					function() {
						return removeHash( this.src ) === removeHash( matrix.url( moduleId ) );
					} ).length);
			},

			hasCssLinkTag: function( moduleId ) {
				return !!($( "link" ).filter(
					function() {
						return removeHash( this.href ) === removeHash( matrix.url( moduleId ) ) &&
						       !$( this ).attr( 'loadedByMatrix' );
					} ).length);
			}
		},
		getSource: {
			getTextByAjax: function( moduleId ) {
				return $.get( matrix.url( moduleId ), null, null, "text" );
			}
		},
		compile: {
			globalEval: function( moduleId, sourceCode ) {
				return $.globalEval( sourceCode );
			},
			localEval: function( moduleId, sourceCode ) {
				return eval( sourceCode );
			},
			linkCss: linkCss
		},
		crossSiteLoad: {
			//can not use $.getScript directly, as matrix.resolve
			getScript: function( moduleId ) {
				var defer = $.Deferred(),
					promise = defer.promise();

				promise.defer = defer;

				$.getScript( matrix.url( moduleId ) ).then(
					function() {
						setTimeout( function() {
							if (!defer.dontResolve) {
								defer.resolve( moduleId );
								delete promise.defer;
							}
						}, 5 );
					},
					function() {
						defer.reject( moduleId );
						delete promise.defer;
					} );

				return promise;
			},

			linkCss: linkCss
		},
		buildUnload: {
			parseUnloadTag: function( sourceCode ) {
				var unloadStatements = runloadStatement.exec( sourceCode );
				return unloadStatements &&
				       unloadStatements[1] &&
				       new Function( unloadStatements[1] );
			}
		},
		buildDependencies: {
			parseDependsTag: function( moduleId, sourceCode ) {
				var depends = rDependHeader.exec( sourceCode );
				return (depends && depends[1] ) || null;
			}
		}
	} );

	//a special module which is a package of modules, like a container
	setLoader( "pack", {
		load: matrix.loader.resolveDependencies( $.noop ),
		url: "moduleId"
	} );

	//js adapter try to parse the content of js file
	setLoader( "js", {
		load: {
			staticLoaded: "hasScriptTag",
			crossSiteLoad: "getScript",
			//getSource: "getTextByAjax",
			compile: "globalEval",
			buildDependencies: "parseDependsTag",
			buildUnload: "parseUnloadTag"
		},
		//this is necessary because if you have a sub loader inherite from
		//from this, and you don't want to inherited sub loader to specify this again
		fileExt: "js"
	} );

	setLoader( "loader", "js", {
		url: "folder"
	} );

	//css adapter tries to parse the content of css file
	setLoader( "css", {
		load: {
			staticLoaded: "hasCssLinkTag",
			crossSiteLoad: "linkCss",
			compile: "linkCss",
			buildDependencies: "parseDependsTag"
		},
		unload: "removeCssLinkTag",
		fileExt: "css"
	} );

	setLoader( "image", {
		load: "cacheImage",
		noRefCount: true
	} );

	//make img linker can handle module with these file extension
	matrix.loader.handleFileTypes( "image", "jpg,png,bmp,gif" );
	//fred test

})( jQuery );
