matrix.depend( {
	"tmpl.handler" : "http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.js",
	"uicss.module": "core.uicss, uitheme.module",
	"uitheme.module": "redmond.uitheme"
} );

$.each(
	("accordion,autocomplete,button,datepicker,dialog," +
	 "progressbar,resizable,selectable,slider,tabs," +
	 "draggable,droppable,mouse,position,sortable").split( "," ),

	function ( index, value ) {
		var resourceKey = value + ".module";
		var depends = value + ".uijs, uicss.module";

		//matrix.depend("accordion", "accordion.uijs, uicss.module");
		matrix.depend( resourceKey, depends );
	}
);




matrix.debug();
matrix.resourceBaseUrl = "/sample/js/";


//optionally register your resource handler
//matrix.loadResourceHandlers("app,config,tmpl,uicss,uijs,uitheme");

