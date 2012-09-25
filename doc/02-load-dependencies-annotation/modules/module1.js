/*
 <@require>
 localization.js, module1.css
 </@require>
 */
$( "#btnOk" ).attr( "disabled", false ).click( function() {
	$( "<h1 class='mymodule'>" + message + "</h1>" ).appendTo( "body" );
} );
