matrix.baseUrl = "js/";
matrix.debug();

matrix.depend( {
	"uitheme.module": "redmond.uitheme",
	"uicss.module": "core.uicss, uitheme.module"
} );

$.each( "accordion,autocomplete,button,datepicker,dialog,progressbar,resizable,selectable,slider,tabs".split( "," ),
	function (index, value) {
		var resourceKey = value + ".module";
		var depends = value + ".uijs, " + value +  ".uicss, uicss.module";
		matrix.depend(resourceKey, depends);
	} );


$.each( "draggable,droppable,mouse,position,sortable".split( "," ),
	function (index, value) {
		var resourceKey = value + ".module";
		var depends = value + ".uijs, uicss.module";
		matrix.depend(resourceKey, depends);
	} );
