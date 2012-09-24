//the first parameter "name.js" means the following defined a module named "name.js"
matrix.define( "name.js", function() {
	window.name = "world";
} );

matrix.define( "greeting.js", function() {
	window.greeting = "hello";
} );
