matrix.define( "product-cross-site.js", function() {
	window.product = true;
}, function() {
	delete window.product;
} );

