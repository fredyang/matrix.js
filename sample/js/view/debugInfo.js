/*
 <@require>
 debugInfo.tmpl
 </@require>
 */
(function() {
	var $content;

	function refreshDebugInfo () {
		var counters = matrix.debug.moduleCounters();
		var data = [];
		for (var key in counters) {
			data.push( {
				url: matrix.url( key ),
				moduleId: key,
				refCount: counters[key].refCount
			} );
		}
		var temp = $.tmpl( "debugInfo", [data] );
		if (!$content) {
			$content = temp;
		} else {
			debugInfo.content.replaceWith( temp );
			debugInfo.content = temp;

		}

		temp.find( ".release" ).click( function() {
			matrix.unload( "debugInfo.view" );
		} );

	}

	refreshDebugInfo();
	matrix.done( refreshDebugInfo );
	matrix.unload( refreshDebugInfo );

	var debugInfo = viewStore.debugInfo = {
		release: function() {
			matrix.done( refreshDebugInfo, true );
			matrix.unload( refreshDebugInfo, true );
		},
		content: $content
	}
})();
