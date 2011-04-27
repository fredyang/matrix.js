matrix.depend( {
	"ui.theme.module": "redmond.uitheme",
	"ui.css.module": "ui.core.uicss, ui.theme.module",
	"dialog.module": "ui.css.module, dialog.uijs",
	"ui.module" : "matrix.uijs.js, matrix.uicss.js, matrix.uitheme.js"
} );

matrix.baseUrl = "js/";
matrix.debug();

