//the first parameter "name.js" means the following defined a module named "name.js"
matrix.module( "name.js", function() {
	window.name = "world";
} );

matrix.module( "greeting.js", function() {
	window.greeting = "hello";
} );
