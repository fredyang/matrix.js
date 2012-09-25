matrix.define( "module1.js", function() {
	$( "#btnOk" ).attr( "disabled", false ).click( function() {
		$( "<h1 class='mymodule'>" + message + "</h1>" ).appendTo( "body" );
	} );
} );

