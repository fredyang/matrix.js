//this is for development, always generate a new hash per page load
matrix.baseUrl = "unit/";
var debug = matrix.debug;
var fullUrl = debug.fullUrl;
//manually add a script tag as staticLoadeded for later test
var script = document.createElement( 'script' );
script.type = 'text/javascript';
script.src = "unit/depend5.js";
document.head.appendChild( script );
var loaderStore = matrix.debug.loaderStore;

var dummyKeys = [];

function assertEmpty () {
	var counters = matrix.debug.moduleCounters();
	var isReleaseReleased = true;
	for (var i = 0; i < counters.length; i++) {
		if (counters[i].moduleId.indexOf( ".loader" ) == -1) {
			isReleaseReleased = false;
		}
	}
	ok( isReleaseReleased &&
	    !debug.urlStore.length &&
	    !debug.promiseStore.length
		, "store is empty" )
}

function buildUrl ( moduleId ) {
	return moduleId + "abc";
}

var resolvedDummyValue = {};

matrix.loader.set( "dummy", {
	load: matrix.loader.resolveDependencies( function( moduleId ) {
		console.log( "loaded dummy" + moduleId );
		dummyKeys.push( matrix.fileName( moduleId ) );
		return resolvedDummyValue;
	} ),
	unload: function( moduleId ) {
		console.log( "released dummy" );
		dummyKeys.remove( matrix.fileName( moduleId ) );
	},
	url: buildUrl

} );

test( "module url calcualtion", function() {
	equal( matrix.url( "x.js" ), fullUrl( "x.js" ), "matrix.url(moduleId) return the default url of a module" );
	matrix.url( "x.js", "actualFileName.extualExtension" );

	equal( matrix.url( "x.js" ), fullUrl( "actualFileName.extualExtension" ),
		"you can specify and a url for a module type using matrix.url(moduleId, url)," +
		"which override a url" );

	equal( matrix.url( "x.dummy" ), fullUrl( buildUrl( "x.dummy" ) ), "a module linker can also return the url of a module" );
	matrix.url( "x.dummy", "abc.js" );
	equal( matrix.url( "x.dummy" ), fullUrl( "abc.js" ), "explicit set url can override" +
	                                                     "the linker.url method" );
	matrix.hash( "1", "x" );
	equal( matrix.hash(), "x=1", "matrix.hash(value, key) will create a hash key=value" );
	ok( matrix.url( "abc.js" ).indexOf( "?x=1" ) != -1, "if a url is local url, a version hash is appended" );
	ok( matrix.url( "http://d.com/x.js" ), "http://d.com/x.js", "if a url is external, no version hash " +
	                                                            " is appended" );
	matrix.hash( "" );
	equal( matrix.hash(), "", "matrix.hash('') will disable matrix.hash" );
	assertEmpty();
} );

test( "fileName and fileExt", function() {
	var moduleId = "a.b.c.d";
	equal( matrix.fileName( moduleId ), "a.b.c",
		"matrix.fileName return the the part without extension" );

	equal( matrix.fileExt( moduleId ), "d",
		"matrix.fileExt return the extension part of the module key" )

} );

asyncTest( "get loader test", function() {
	matrix( "test1.dummy" ).done( function( moduleId, result ) {

		equal( dummyKeys[0], "test1",
			"if module id is moduleNmae.moduleType, " +
			"by default the matrix will use moduleType to pick the module loader" );

		debugger;
		ok( moduleId == "test1.dummy" && result == resolvedDummyValue,
			"when a module is resolved, the first value of callback is always the moduleId, " +
			" the second value is optional, it can be the value returned from the load method." );

	} );

	matrix.unload( "test1.dummy" );

	matrix( "test.notExistAdapter" ).fail( function( moduleId ) {
		equal( moduleId, "test.notExistAdapter",
			"if loader does not exists for an loader, it failed" );
		start();
	} );

	ok( !loaderStore.dynamic, "module loader for module type 'dyanmic' is not statically loaded" );

	matrix( "test.dynamic" ).done( function( moduleId ) {
		ok( loaderStore.dynamic, "loading a module will try to load the module loader first" );
		matrix.unload( moduleId );
		start();
	} );

	assertEmpty();
} );

asyncTest( "module parallel load and unload", function() {

	ok( !matrix.debug.moduleCounters( "d1.dummy" ) && !matrix.debug.moduleCounters( "dummy.dummy" ) && !matrix.debug.moduleCounters( "d3.dummy" ),
		"before module is loaded, its promise object is null" );

	matrix( "d1.dummy, d2.dummy, d3.dummy" ).done( function() {
		ok( dummyKeys.join() == "d1,d2,d3", "can load in parallel" );

		ok( matrix.debug.moduleCounters( "d1.dummy" ) && matrix.debug.moduleCounters( "d2.dummy" ) && matrix.debug.moduleCounters( "d3.dummy" ),
			"after module is loaded, its promise object is loaded" );

		matrix.unload( "d1.dummy, d2.dummy, d3.dummy" );
		ok( dummyKeys.length == 0, "module can be unloaded" );

		ok( !matrix.debug.moduleCounters( "d1.dummy" ) && !matrix.debug.moduleCounters( "d2.dummy" ) && !matrix.debug.moduleCounters( "d3.dummy" ),
			"after module is unloaded, its promise object also removed" );

		assertEmpty();
		start();

	} );
} );

asyncTest( "module parallel failed", function() {

	matrix( "d1.dummy, d2.dummy, d3.abc" ).fail( function( moduleId ) {
		ok( "x", "if one on parallel module fail, the master promise fail" );
		equal( dummyKeys.length, 0, "all module including partially loaded and failed loaded" +
		                            " will be ununloaded" );

		start();
	} );

} );

asyncTest( "load by order test", function() {
	var loadByOrder = true;

	ok( matrix.depends( "d1.dummy" ) === undefined &&
	    matrix.depends( "d2.dummy" ) == undefined &&
	    matrix.depends( "d3.dummy" ) == undefined,
		"by default module's dependency is undefined" );

	matrix( "d1.dummy, d2.dummy, d3.dummy", loadByOrder ).done( function() {

		ok( matrix.depends( "d1.dummy" ) === undefined &&
		    matrix.depends( "d2.dummy" ) == "d1.dummy" &&
		    matrix.depends( "d3.dummy" ) == "d2.dummy",
			"if resoruce is loadByOrder, then the module dependencies is generate first" );

		ok( dummyKeys.join() == "d1,d2,d3", "can load in parallel" );

		matrix.unload( "d3.dummy" );

		ok( dummyKeys.length == 0, "when d3 unload, d1, d2 will unload automatic" );

		matrix.depends( "d1.dummy", undefined );
		matrix.depends( "d2.dummy", undefined );
		matrix.depends( "d3.dummy", undefined );

		start();
	} );
} );

asyncTest( "module serial load test", function() {
	matrix( ["d1.dummy", "d2.dummy", "d3.dummy", "d4.dummy"] ).done( function() {

		equal( dummyKeys.join(),
			"d1,d2,d3,d4", "when load in series, they are can load in seqential order" )

		matrix.unload( "d1.dummy, d2.dummy, d3.dummy, d4.dummy" );
		ok( dummyKeys.length === 0, "can unload all" );

		assertEmpty();
		start();
	} );

} );

asyncTest( "module serial failed to load", function() {
	matrix( ["d1.dummy", "d2.dummy", "d5.abc", "d3.dummy", "d4.dummy"] ).fail( function() {
		ok( dummyKeys.length == 0, "when serial module failed, all module is unloaded" );
		matrix.depends( "d1.dummy", undefined );
		matrix.depends( "d2.dummy", undefined );
		matrix.depends( "d3.dummy", undefined );
		matrix.depends( "d4.dummy", undefined );
		matrix.depends( "d5.abc", undefined );
		assertEmpty();
		start();
	} );

} );

asyncTest( "parallel module registration/load test", function() {
	assertEmpty();
	matrix.depends( "d1.dummy", "d2.dummy, d3.dummy" );
	equal( matrix.depends( "d1.dummy" ), "d2.dummy, d3.dummy", "dependencies register successfully" )
	matrix( "d1.dummy" ).done( function() {
		ok( dummyKeys.join() == "d2,d3,d1", "parallel dependencies is resolved according to registration" );
		matrix.unload( "d1.dummy" );
		matrix.depends( "d1.dummy", undefined );
		assertEmpty();
		start();
	} );
} );

asyncTest( "serial module dependency test", function() {
	matrix.depends( "d3.dummy", ["d1.dummy", "d2.dummy"] );

	deepEqual( matrix.depends( "d3.dummy" ), ["d1.dummy", "d2.dummy"], "dependencies register successfully" )

	matrix( "d3.dummy" ).done( function() {
		equal( dummyKeys.join(), "d1,d2,d3", "can load in series" );
		matrix.unload( "d1.dummy, d2.dummy, d3.dummy" );
		start();
	} );
} );

test( "reference count test", function() {
	matrix( "a.pack" );
	ok( matrix.debug.moduleCounters( "a.pack" ), "after loaded a promise is added" );
	matrix.unload( "a.pack" );
	ok( !matrix.debug.moduleCounters( "a.pack" ), "after unloaded,  a promise is removed" );

	matrix.depends( "a.pack", "b.pack, c.pack" );
	matrix.depends( "d.pack", "b.pack, c.pack" );
	matrix( "a.pack" );
	equal( matrix.debug.moduleCounters( "a.pack" ).refCount, 1, "a.pack.refCount === 1" );
	equal( matrix.debug.moduleCounters( "b.pack" ).refCount, 1, "b.pack.refCount === 1" );
	equal( matrix.debug.moduleCounters( "c.pack" ).refCount, 1, "c.pack.refCount === 1" );
	ok( matrix.debug.moduleCounters( "a.pack" ) && matrix.debug.moduleCounters( "b.pack" ) && matrix.debug.moduleCounters( "c.pack" ), "a,b,c are loaded" );
	matrix( "d.pack" );
	ok( matrix.debug.moduleCounters( "a.pack" ) && matrix.debug.moduleCounters( "b.pack" )
		    && matrix.debug.moduleCounters( "c.pack" )
		&& matrix.debug.moduleCounters( "d.pack" ), "a,b,c,d are loaded" );

	equal( matrix.debug.moduleCounters( "a.pack" ).refCount, 1, "a.pack.refCount === 1" );
	equal( matrix.debug.moduleCounters( "b.pack" ).refCount, 2, "b.pack.refCount === 2" );
	equal( matrix.debug.moduleCounters( "c.pack" ).refCount, 2, "c.pack.refCount === 2" );
	equal( matrix.debug.moduleCounters( "d.pack" ).refCount, 1, "c.pack.refCount === 1" );

	matrix.unload( "d.pack" );
	equal( matrix.debug.moduleCounters( "a.pack" ).refCount, 1, "a.pack.refCount === 1" );
	equal( matrix.debug.moduleCounters( "b.pack" ).refCount, 1, "b.pack.refCount === 1" );
	equal( matrix.debug.moduleCounters( "c.pack" ).refCount, 1, "c.pack.refCount === 1" );
	ok( !matrix.debug.moduleCounters( "d.pack" ), "d is unloaded" );

	matrix.unload( "a.pack" );
	ok( !matrix.debug.moduleCounters( "a.pack" )
		    && !matrix.debug.moduleCounters( "b.pack" )
		    && !matrix.debug.moduleCounters( "c.pack" )
		&& !matrix.debug.moduleCounters( "d.pack" ), "a,b,c,d are unloaded" );
} );

module( "test js loader" );

asyncTest( "test default load by baseUrl and unload method creation", function() {
	matrix( "depend1.js" ).done( function( data ) {
		ok( window.depend1, "can solve depend1.js accoding to baseUrl" );
		matrix.unload( "depend1.js" );
		ok( !window.depend1, "can create unload method by parsing content of js file" );
		start();
	} );
} );

asyncTest( "can resolve/unload multiple independent reference", function() {
	matrix( "depend1.js, depend2.js, depend3.js" ).done( function( data ) {
		ok( window.depend1 && window.depend2 && window.depend3, "depend1 depend2 and depend3 are all resolved" );
		matrix.unload( "depend1.js, depend2.js, depend3.js" );
		ok( !window.depend1 && !window.depend2 && !window.depend3, "depend1 depend2 depend3 are all unloaded" );
		start();
	} );
} );

asyncTest( "test programmatic dependency registration", function() {

	matrix.depends( "depend1.js", "depend2.js" );

	matrix( "depend1.js" ).done( function( data ) {
		start();
		ok( window.depend1 && window.depend2, "depend1 and depend2 are both resolved" );
		matrix.unload( "depend1.js, depend2.js" );
		ok( !window.depend1 && !window.depend2, "depend1 and depend2 are both unloaded" );
		matrix.depends( "depend1.js", null );
		var dependencies = matrix.depends( "depend1.js" );
		ok( !dependencies, "sub reference has been destroyed" );
	} );
} );

test( "test static loaded script", function() {
	var moduleId = "depend5.js";
	matrix( moduleId );
	ok( matrix.debug.moduleCounters( moduleId ), "promise is immediately resolved" );
	ok( matrix.debug.moduleCounters( moduleId ).refCount == "staticLoaded", "depend5.js is staticLoaded" );
	matrix.unload( "depend5.js" );
	ok( matrix.debug.moduleCounters( moduleId ), "statically loaded script can not be unloaded" );
} );

asyncTest( "test double reference to module", function() {

	ok( !window.depend1, "it has been unloaded" );

	matrix( "depend1.js" ).done( function( data ) {
		start();
		ok( window.depend1, "depend1 already defined in depend1.js" );

	}, function() {
		matrix( "depend1.js" ).done( function( data ) {
			//here we don't need to use start(),
			// because promise resolve immediately
			ok( window.depend1, "depend1 already defined in depend1.js" );
			matrix.unload( "depend1.js" );
			ok( window.depend1, "module is still alive because it is double referenced" );
			matrix.unload( "depend1.js" );
			ok( !window.depend1, "after two unload call, it has been unloaded" );
		} );

	} );
} );

asyncTest( "javascript unload test", function() {
	ok( !window.depend1, "depend1 initially is undefined" );
	ok( !window.depend2, "depend2 initially is undefined" );
	ok( !window.depend3, "depend3 initially is undefined" );

	matrix.depends( {
		"depend2.js": "depend1.js",
		"depend3.js": "depend2.js, depend1.js"
	} );

	matrix( "depend3.js" ).done( function() {
		start();
		ok( window.depend1 && window.depend2 && window.depend3, "depend1/2/3 has been defined" );
		matrix.unload( "depend3.js", true );
		ok( !window.depend1, "depend1 has been deleted" );
		ok( !window.depend2, "depend2 has been deleted" );
		ok( !window.depend3, "depend3 has been deleted" );

		matrix.depends( {
			"depend2.js": undefined,
			"depend3.js": undefined
		} );
	} );
} );

asyncTest( "javascript dependencies registration test (programmatic and manifest)", function() {

	matrix.depends( {
		"depend2.js": "depend1.js",
		"depend3.js": "depend2.js, depend1.js"
	} );

	//depend4 depends on depend3.js using manifest
	matrix( "depend4.js" ).done( function() {
		ok( depend1 && depend2 && depend3 && depend4, "depend1/2/3/4 are all resolved, because programmatic and manifest registration work together" );
		matrix.unload( "depend4.js" );
		ok( !window.depend1 && !window.depend2 && !window.depend3 && !window.depend4, "depend1/2/3/4 are all unloaded, because programmatic and manifest registration work together" );
		matrix.depends( {
			"depend2.js": undefined,
			"depend3.js": undefined,
			"depend4.js": undefined
		} );
		start();

	} );
} );

asyncTest( "serialize resolving test", function() {
	ok( !window.depend1 && !window.depend2 && !window.depend3, "depend1/2/3 initially are not defined" );

	matrix( "depend3.js" ).nextLoad( "depend2.js" ).nextLoad( "depend1.js" ).done( function() {
		ok( window.depend1 && window.depend1 && window.depend3, "depend1/2/3 are all resolved in serial" );
		matrix.unload( "depend3.js" );
		ok( window.depend1 && window.depend1 && !window.depend3, "only depend3 is unloaded" );
		start();
	} );
} );

module( "matrix.define" );

asyncTest( "load js file defined with matrix.define using js loader", function() {
	matrix( "order.js" ).done( function( moduleId, result ) {
		ok( window.product, "can load js file's dependencies with matrix.provide" );
		ok( window.order, "can load js files with matrix.provide" );

		matrix.unload( "order.js" );

		ok( !window.order, "can unload js file with matrix.provide" );
		ok( !window.product, "can unload js file's dependencies with matrix.provide" );
		start();
	} );
} );

asyncTest( "load js file defined with matrix.provide using crossSiteLoad", function() {
	var originalJsLoader = matrix.loader.get( "js" );
	var modifiedJsLoader = $.extend( true, {}, originalJsLoader );
	delete modifiedJsLoader.compile;

	matrix.loader.set( "js", modifiedJsLoader );

	matrix( "order-cross-site.js" ).done( function( moduleId, result ) {
		ok( window.product, "can load js file's dependencies with matrix.provide" );
		ok( window.order, "can load js files with matrix.provide" );

		matrix.unload( "order-cross-site.js" );

		ok( !window.order, "can unload js file with matrix.provide" );
		ok( !window.product, "can unload js2 file's dependencies with matrix.provide" );
		matrix.loader.set( "js", originalJsLoader );
		start();
	} );
} );

module( "test css loader" );

asyncTest( "css load and unload test", function() {

	var $testElem = $( '<p class="myclass">some text here</p>' ).appendTo( "#qunit-fixture" );
	var originalColor = $testElem.css( "color" );
	var originalFontSize = $testElem.css( "font-size" );

	matrix( "base.css" ).done( function() {
		setTimeout( function() {
			var color = $testElem.css( "color" );
			var fontSize = $testElem.css( "font-size" );

			ok( color == "rgb(255, 0, 0)" && fontSize == "20px",
				"matrix can load css" );

			matrix.unload( "base.css" );
			setTimeout( function() {
				color = $testElem.css( "color" );
				fontSize = $testElem.css( "font-size" );
				ok( (color === originalColor) && (fontSize === originalFontSize),
					"matrix can unload style" );

				start();
			}, 100 );

		}, 100 );

	} );
} );

asyncTest( "css dependencies test", function() {

	var $testElem = $( '<p class="myclass">some text here</p>' ).appendTo( "#qunit-fixture" );
	var originalColor = $testElem.css( "color" );
	var originalFontSize = $testElem.css( "font-size" );

	matrix( "child.css" ).done( function() {

		setTimeout( function() {

			var color = $testElem.css( "color" );
			var fontSize = $testElem.css( "font-size" );

			ok( color = "rgb(255, 0, 0)" &&
			            fontSize == "30px", "matrix can load css in order" );

			matrix.unload( "child.css" );

			setTimeout( function() {
				color = $testElem.css( "color" );
				fontSize = $testElem.css( "font-size" );

				ok( (color === originalColor) && (fontSize === originalFontSize),
					"matrix can unload all related css" );

				start();

			}, 100 );

		}, 100 );

	} );

} );

asyncTest( "image module", function() {
	var url = "http://farm1.staticflickr.com/181/401519259_35964da1ac_z.jpg";
	matrix( url ).done( function( url ) {
		ok( "image loader works" );
		start();
	} );
	expect( 1 );
} );
