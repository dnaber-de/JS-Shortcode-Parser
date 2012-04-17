( function() {
	window.onload = function() {

		var canvas = document.getElementById( 'place' );

		var c = document.getElementById( 'console' );

		var Parser = {

			canvas : null,

			pre : '',

			post : '',

			selection : '',

			start : 0,

			end : 0,

			shortcode : null,

			/**
			 * read in the state of the textarea
			 *
			 * @return void
			 */
			read : function() {

				if ( document.selection ) {
					// ie stuff here
				}
				else if ( Parser.canvas.selectionStart || 0 === Parser.canvas.selectionStart ) {

					var start  = 0;
					var pos    = Parser.canvas.selectionStart; // current possiton of the cursor
					var posEnd = Parser.canvas.selectionEnd;
					var end    = Parser.canvas.value.length; // end of text
					var length = end - pos; // length of the part after the cursor

					Parser.pre       = Parser.canvas.value.substr( start, pos );
					Parser.post      = Parser.canvas.value.substr( pos, length );
					Parser.selection = Parser.canvas.value.substr( pos, posEnd - pos );

					//for debugging
					//c.value = Parser.post;
				}
				Parser.parse();
			},

			/**
			 * pases the stuf before and after the cursor
			 *
			 * @return void
			 */
			parse : function() {

				var sc      = {};
				var scFound = null;

				// look if the selection matches a un-chunked shortcode
				var scExp = new RegExp (
					'^\\s*'              // whitespace?
					+ '\\[\\s*'          // shortcodes stars with a braket
					+	'(\\w+)\\s*'     // the shortcode name followed by optional whitespace
					+	'([^\\]\\/]*)?'  // the attributes
					+ '\\/?\\]'          // self-closing single tag?
					+ '(?:'              // optional: shortcode element with closing tag
					+	'([^\\[]*)'      // the elements content
					+	'\\[\\/\\1\\]'
					+ ')?'
					+ '\\s*$'
				);

				// chunk a single attribute
				var scAttsExp = new RegExp (
					  '\\s*'
					+ '(\\w+)'     //attributes name
					+ '\\s*'
					+ '\\='        //asign-operator
					+ '("|\')'        // single or double qoute
					+ '(\\w*)'     // attributes value
					+ '\\2'        // closing quote
				);

				if ( ! scExp.test( Parser.selection ) )
					Parser.checkNeighbourhood();

				if ( ! scExp.test( Parser.selection ) )
					return;


				scFound = scExp.exec( Parser.selection );
				console.log( scFound );
				sc.name = scFound[ 1 ];
				// parse the attributes
				if ( 'undefined' != typeof( scFound[ 2 ] ) ) {
					var atts = scFound[ 2 ].split( ' ' );
					var attsFound = null;
					sc.atts = {};
					for ( i in atts ) {
						if ( ! scAttsExp.test( atts[ i ] ) )
							continue;
						attsFound = scAttsExp.exec( atts[ i ] );
						sc.atts[ attsFound[ 1 ] ] = attsFound[ 3 ];
					}
				}
				if ( 'undefined' != typeof( scFound[ 3 ] ) )
					sc.content = scFound[ 3 ];

				if ( sc.atts ) {
					console.log( sc );
				}

			},

			/**
			 * checks the text before and after the cursor
			 *
			 * @retun bool
			 */
			checkNeighbourhood : function() {

				var before = '';
				var after  = '';

				if ( -1 === Parser.pre.indexOf( '[' ) || -1 === Parser.post.indexOf( ']' ) )
					return false; //cursor is not in a shortcode

				// strip everything before the last opening braket
				before = Parser.pre.substr(
					Parser.pre.lastIndexOf( '[' ),
					Parser.pre.length
				);
				// if the cursor is set in the closing tag...
				if (
					0 === before.indexOf( '[/' )
				|| (
						0 === before.indexOf( '[' )
					&&  0 === Parser.post.indexOf( '/' )
					)
				) {
					// find the last OPENING tag
					before = Parser.pre.substr( 0, Parser.pre.lastIndexOf( '[' ) );
					before = Parser.pre.substr( before.lastIndexOf( '[' ), Parser.pre.length );
				}

				// strip everything after the first closing braket
				after = Parser.post.substr(
					0,
					Parser.post.indexOf( ']' ) + 1
				);

				// if the cursor is in the opening tag
				if (
					-1 !== Parser.post.indexOf( '[/' )
				&&	Parser.post.indexOf( ']' ) < Parser.post.indexOf( '[/' )
				&&  Parser.post.indexOf( '[' ) >=  Parser.post.indexOf( '[/' )
				) {
					//find the first closing tag
					after = Parser.post.substr(
						0,
						Parser.post.indexOf( ']', Parser.post.indexOf( '[/' ) ) + 1
					);
				}

				if ( -1 === after.indexOf( '[/' ) &&  -1 !== after.indexOf( '[' ) )
					return false; // cursor is in between two different shortcodes


				Parser.selection = before + after;

				return true;
			}
		}
		Parser.canvas = canvas;
		canvas.onclick = Parser.read;
		// canvas.onkeyup = Parser.read;
	}
} )();


