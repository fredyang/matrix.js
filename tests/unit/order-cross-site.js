matrix.module( "order-cross-site.js", "product-cross-site.js", function() {
	window.order = true;
}, function() {
	delete window.order;
} );