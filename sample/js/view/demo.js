/*
 <@require>
 ../css/demos.css, demo.tmpl, dashboard.view,	debugInfo.view
 </@require>
 */
$( function() {
	var $content = $.tmpl( "demo", null ).appendTo( "body" );
	$( ".debugInfo" ).html( viewStore.debugInfo.content );
	$( ".dashboard" ).html( viewStore.dashboard.content );

	viewStore.demo = {
		content: $content
	}
} );
