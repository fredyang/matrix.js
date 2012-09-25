/*
 <@require>
 accounts.tmpl,
 dialog.widget
 </@require>
 * */
(function( $ ) {

	var dummy;

	function createLotsMemory () {
		dummy = [];
		for (var i = 0; i < 99999; i++) {
			dummy.push( function() {
				return new Date();
			} );
		}
	}

	createLotsMemory();

	var $dialog = $( "<p>You are using Accounts module</p>" );
	var $content = $.tmpl( "accounts", null );
	$content.find( ".showInfo" ).click( function() {
		$dialog.dialog();
	} );

	viewStore.Accounts = {
		release: function() {
			dummy = null;
			$dialog.remove();
		},
		content: $content
	}
})( jQuery );