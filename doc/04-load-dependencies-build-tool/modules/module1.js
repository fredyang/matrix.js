matrix.define(
	"module1.js", //current module id
	"localization.js, module1.css", //depenencies
	function() {
		$( "#btnOk" ).attr( "disabled", false ).click( function() {
			$( "<h1 class='mymodule'>" + message + "</h1>" ).appendTo( "body" );
		} );
	} );

matrix.define( "localization.js", function() {
	window.message = "hello world!";
} );
