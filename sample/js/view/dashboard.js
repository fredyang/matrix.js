/*
 <@require>
 dashboard.tmpl,	tabs.widget
 </@require>
 */
$( function() {

	var references = {};

	var tempView;

	var $content = $.tmpl( "dashboard", null );

	$content.find( ".dispose" ).click( function() {
		matrix.unload( "dashboard.view" );
	} );

	var $tabs = $( "#tabs", $content ).tabs( {
		add: function( e, ui ) {
			$( ui.panel ).append( tempView.content );
			tempView = null;
		}
	} );

	$content.find( ".module" ).change( function() {
		var viewName = $( this ).attr( "view" );
		var fullViewName = $( this ).attr( "view" ) + ".view";
		if (this.checked) {
			matrix( fullViewName ).done( function( moduleId, view ) {
				tempView = viewStore[viewName];
				$tabs.tabs( "add", "#" + viewName, viewName )
					.tabs( "select", "#" + viewName );
				references[fullViewName] = true;
			} );
		} else {
			var index = $( "li", $tabs ).index( $( "#" + viewName ).parent() );
			$tabs.tabs( "remove", index );
			matrix.unload( fullViewName );
			delete references[fullViewName];
		}
	} );

	viewStore.dashboard = {

		release: function() {
			for (var key in references) {
				matrix.unload( key );
			}
		},

		content: $content
	};

} );
