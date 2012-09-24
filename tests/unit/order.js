matrix.define( "order.js", "product.js", function() {
	window.order = true;
}, function() {
	delete window.order;
} );