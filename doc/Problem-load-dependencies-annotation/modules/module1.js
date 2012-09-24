/*
 <@depends>
 localization.js, module1.css
 </@depends>
 */
$( "#btnOk" ).attr( "disabled", false ).click( function() {
	$( "<h1 class='mymodule'>" + message + "</h1>" ).appendTo( "body" );
} );
