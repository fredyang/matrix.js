/*
 <@require>
 orders.tmpl,
 dialog.widget
 </@require>
 * */
(function( $ ) {
	var $dialog = $( "<p>You are using orders module</p>" );
	var $content = $.tmpl( "orders", null );
	$content.find( ".showInfo" ).click( function() {
		$dialog.dialog();
	} );
	viewStore.Orders = {
		release: function() {
			$dialog.remove();
		},
		content: $content
	}
})( jQuery );