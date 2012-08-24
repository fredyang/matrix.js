(function() {
	function loadApp () {
		matrix( "demo.view" ).done( function() {
			$( "#btnLoadDemo" ).attr( "disabled", true );
			$( "#btnReleaseDemo" ).attr( "disabled", false )
		} );
	}

	$( "#btnLoadDemo" ).click( loadApp );

	$( "#btnReleaseDemo" ).click( function() {
		matrix.unload( "demo.view" );
		$( "#btnLoadDemo" ).attr( "disabled", false );
		$( "#btnReleaseDemo" ).attr( "disabled", true )
	} );

	loadApp();

})();