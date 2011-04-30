matrix.debug();

test( "url resolution", function () {
	equal( matrix.baseUrl, "", "baseUrl default to empty string" );
	equal( matrix.homeUrl, "matrix/", "homeUrl default to 'matrix'" );

	var expected = matrix.fullUrl( "x.js" );
	var resourceUrl = matrix.url( "x.js" );
	equal( resourceUrl, expected, "resource url is the based on the resource name and url of the loaded document" );

	matrix.url( "x.js", "y.js" );
	expected = matrix.fullUrl( "y.js" );
	resourceUrl = matrix.url( "x.js" );
	equal( resourceUrl, expected, "resource name 'x.js' can be mapped to 'y.js' explicity" );

} );


asyncTest( "resource parallel load test", function() {
	matrix.baseUrl = "unit/";

	matrix.load( "d1.test, d2.test, d3.test" ).done( function () {

		ok( test.d1 && test.d2 && test.d3, "can load in parallel" );
		matrix.release( "d1.test, d2.test, d3.test" );
		ok( !test.d1 && !test.d2 && !test.d3, "can release all" );

		start();
	} );
} );

asyncTest("load by order test", function () {
	matrix.baseUrl = "unit/"

	matrix.load("d1.test, d2.test, d3.test", true, function () {

		equal(matrix.depend("d1.test"), null, "dependencies is automatic generated");
		equal(matrix.depend("d2.test"), "d1.test", "dependencies is automatic generated");
		equal(matrix.depend("d3.test"), "d2.test", "dependencies is automatic generated");

		ok( test.d1 && test.d2 && test.d3, "can load in parallel" );

		matrix.release( "d3.test" );
		ok( !test.d1 && !test.d2 && !test.d3, "when d3 release, d1, d2 will release automatic" );
		matrix.depend("d1.test", undefined)
		matrix.depend("d2.test", undefined)
		matrix.depend("d3.test", undefined)
		start();
	});
});

asyncTest( "resource serial load test", function () {
	matrix.baseUrl = "unit/";

	matrix.load( ["d1.test", "d2.test", "d3.test", "d4.test"], function () {
		ok( test.d1 && test.d2 && test.d3 && test.d4, "can load in series" );

		equal( test.results.toString(), "d1,d2,d3,d4", "when load in series, they are can load in seqential order" )

		matrix.release( "d1.test, d2.test, d3.test, d4.test" );
		ok( !test.d1 && !test.d2 && !test.d3 && !test.d4, "can release all" );

		start();
	} );

} );

asyncTest( "parallel resource registration/load test", function () {
	matrix.baseUrl = "unit/";

	matrix.depend( "d1.test", "d2.test, d3.test" );
	equal( matrix.depend( "d1.test" ), "d2.test, d3.test", "dependencies register successfully" )
	matrix.load( "d1.test", function () {
		ok( test.d1 && test.d2 && test.d3, "parallel dependencies is resolved according to registration" );
		matrix.release( "d1.test, d2.test, d3.test" );
		matrix.depend( "d1.test", undefined );
		start();
	} );
} );

asyncTest( "serail resource dependency test", function () {
	matrix.baseUrl = "unit/";
	matrix.depend( "d3.test", ["d1.test", "d2.test"] );

	deepEqual( matrix.depend( "d3.test" ), ["d1.test", "d2.test"], "dependencies register successfully" )

	matrix.load( "d3.test", function () {
		ok( test.d1 && test.d2 && test.d3, "serial dependencies is resolved according to registration" );
		equal( test.results, "d1,d2,d3", "can load in series" );
		matrix.release( "d1.test, d2.test, d3.test" );
		start();
	} );
} );

test( "reference count test", function () {
	matrix.load( "a.module" );
	ok( matrix.promises("a.module"), "after loaded a promise is added" );
	matrix.release( "a.module" );
	ok( !matrix.promises("a.module"), "after released,  a promise is removed" );

	matrix.depend( "a.module", "b.module, c.module" );
	matrix.depend( "d.module", "b.module, c.module" );
	matrix.load( "a.module" );
	equal( matrix.promises("a.module").refCount, 1, "a.module.refCount === 1" );
	equal( matrix.promises("b.module").refCount, 1, "b.module.refCount === 1" );
	equal( matrix.promises("c.module").refCount, 1, "c.module.refCount === 1" );
	ok( matrix.promises("a.module") && matrix.promises("b.module") && matrix.promises("c.module"), "a,b,c are loaded" );
	matrix.load( "d.module" );
	ok( matrix.promises("a.module") && matrix.promises("b.module")
		    && matrix.promises("c.module")
		&& matrix.promises("d.module"), "a,b,c,d are loaded" );

	equal( matrix.promises("a.module").refCount, 1, "a.module.refCount === 1" );
	equal( matrix.promises("b.module").refCount, 2, "b.module.refCount === 2" );
	equal( matrix.promises("c.module").refCount, 2, "c.module.refCount === 2" );
	equal( matrix.promises("d.module").refCount, 1, "c.module.refCount === 1" );

	matrix.release( "d.module" );
	equal( matrix.promises("a.module").refCount, 1, "a.module.refCount === 1" );
	equal( matrix.promises("b.module").refCount, 1, "b.module.refCount === 1" );
	equal( matrix.promises("c.module").refCount, 1, "c.module.refCount === 1" );
	ok( !matrix.promises("d.module"), "d is released" );

	matrix.release( "a.module" );
	ok( !matrix.promises("a.module")
		    && !matrix.promises("b.module")
		    && !matrix.promises("c.module")
		&& !matrix.promises("d.module"), "a,b,c,d are released" );
} );

module( "test js handler" );

asyncTest( "test default load by baseUrl and release method creation", function() {
	matrix.baseUrl = "unit/"
	matrix.load( "depend1.js" ).done( function ( data ) {
		ok( window.depend1, "can solve depend1.js accoding to baseUrl" );
		matrix.release( "depend1.js" );
		ok( !window.depend1, "can create release method by passing content of js file" );
		start();
	} );
} );

asyncTest( "can resolve/release multiple independent reference", function() {
	matrix.baseUrl = "unit/";
	matrix.load( "depend1.js, depend2.js, depend3.js" ).done( function ( data ) {
		ok( window.depend1 && window.depend2 && window.depend3, "depend1 depend2 and depend3 are all resolved" );
		matrix.release( "depend1.js, depend2.js, depend3.js" );
		ok( !window.depend1 && !window.depend2 && !window.depend3, "depend1 depend2 depend3 are all released" );
		start();
	} );
} );

asyncTest( "test programmatic dependency registration", function() {

	matrix.baseUrl = "unit/";

	matrix.depend( "depend1.js", "depend2.js" );

	matrix.load( "depend1.js" ).done( function ( data ) {
		start();
		ok( window.depend1 && window.depend2, "depend1 and depend2 are both resolved" );
		matrix.release( "depend1.js, depend2.js" );
		ok( !window.depend1 && !window.depend2, "depend1 and depend2 are both released" );
		matrix.depend( "depend1.js", null );
		var dependencies = matrix.depend( "depend1.js", null );
		ok( !dependencies, "sub reference has been destroyed" );
	} );
} );

test( "test static linked script", function () {

	matrix.baseUrl = "unit/"
	var url = "depend5.js";
	matrix.load( url );
	ok( matrix.promises(url), "promise is immediately resolved" );
	ok( matrix.promises(url).preload, "depend5.js is preload" );
	matrix.release( "depend5.js" );
	ok( matrix.promises(url), "statically linked script can not be released" );
} );

asyncTest( "test double reference to resource", function() {

	matrix.baseUrl = "unit/"

	ok( !window.depend1, "it has been released" );

	matrix.load( "depend1.js", function ( data ) {
		start();
		ok( window.depend1, "depend1 already defined in depend1.js" );

	}, function () {
		matrix.load( "depend1.js" ).done( function ( data ) {
			//here we don't need to use start(),
			// because promise resolve immediately
			ok( window.depend1, "depend1 already defined in depend1.js" );
			matrix.release( "depend1.js" );
			ok( window.depend1, "resource is still alive because it is double referenced" );
			matrix.release( "depend1.js" );
			ok( !window.depend1, "after two release call, it has been released" );
		} );

	} );
} );

asyncTest( "javascript release test", function () {
	matrix.baseUrl = "unit/"

	ok( !window.depend1, "depend1 initially is undefined" );
	ok( !window.depend2, "depend2 initially is undefined" );
	ok( !window.depend3, "depend3 initially is undefined" );

	matrix.depend( {
		"depend2.js" : "depend1.js",
		"depend3.js" : "depend2.js, depend1.js"
	} );

	matrix.load( "depend3.js", function () {
		start();
		ok( window.depend1 && window.depend2 && window.depend3, "depend1/2/3 has been defined" );
		matrix.release( "depend3.js", true );
		ok( !window.depend1, "depend1 has been deleted" );
		ok( !window.depend2, "depend2 has been deleted" );
		ok( !window.depend3, "depend3 has been deleted" );

		matrix.depend( {
			"depend2.js" : undefined,
			"depend3.js" : undefined
		} );
	} );
} );

asyncTest( "javascript dependencies registration test (programmatic and manifest)", function () {

	matrix.baseUrl = "unit/";

	matrix.depend( {
		"depend2.js" : "depend1.js",
		"depend3.js" : "depend2.js, depend1.js"
	} );

	//depend4 depends on depend3.js using manifest
	matrix.load( "depend4.js", function () {
		start();
		ok( depend1 && depend2 && depend3 && depend4, "depend1/2/3/4 are all resolved, because programmatic and manifest registration work together" );
		matrix.release( "depend4.js" );
		ok( !window.depend1 && !window.depend2 && !window.depend3 && !window.depend4, "depend1/2/3/4 are all released, because programmatic and manifest registration work together" );
		matrix.depend( {
			"depend2.js" : undefined,
			"depend3.js" : undefined,
			"depend4.js" : undefined
		} );

	} );
} );

asyncTest( "serialize resolving test", function () {
	matrix.baseUrl = "unit/";

	ok( !window.depend1 && !window.depend2 && !window.depend3, "depend1/2/3 initially are not defined" );

	matrix.load( "depend3.js" ).load( "depend2.js" ).load( "depend1.js" ).done( function () {
		ok( window.depend1 && window.depend1 && window.depend3, "depend1/2/3 are all resolved in serial" );
		matrix.release( "depend3.js" );
		ok( window.depend1 && window.depend1 && !window.depend3, "only depend3 is released" );
		start();
	} );
} );

module( "test css handler" );

asyncTest( "css load and release test", function () {

	matrix.baseUrl = "unit/";

	var _color = $( "#testcss" ).css( "color" );
	var _fontSize = $( "#testcss" ).css( "font-size" );

	matrix.load( "base.css", function () {
		var color = $( "#testcss" ).css( "color" );
		var fontSize = $( "#testcss" ).css( "font-size" );
		equal( color, "rgb(255, 0, 0)" );
		equal( fontSize, "20px" );
		matrix.release( "base.css" );
		setTimeout( function () {
			color = $( "#testcss" ).css( "color" );
			fontSize = $( "#testcss" ).css( "font-size" );
			ok( (color === _color) && (fontSize === _fontSize), "style is revert back when css is released" )
		}, 1 );
		start();
	} );
} );

asyncTest( "css dependencies test", function () {

	matrix.baseUrl = "unit/";

	var _color = $( "#testcss" ).css( "color" );
	var _fontSize = $( "#testcss" ).css( "font-size" );

	matrix.load( "child.css", function () {
		var color = $( "#testcss" ).css( "color" );
		var fontSize = $( "#testcss" ).css( "font-size" );
		equal( color, "rgb(255, 0, 0)", "color is defined in base.css" );
		equal( fontSize, "30px" );
		matrix.release( "child.css" );
		setTimeout( function () {
			color = $( "#testcss" ).css( "color" );
			fontSize = $( "#testcss" ).css( "font-size" );
			ok( (color === _color) && (fontSize === _fontSize), "style is revert back when css is released" )
		}, 1 );
		start();
	} );

} );
