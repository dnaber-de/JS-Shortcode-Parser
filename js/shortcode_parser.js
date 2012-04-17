/**
 * ShortcodeParser
 *
 * A text parser for what WordPress calls Shortcodes. (Or BBCodes)
 *
 * It findes Shortcodes of the following shemes
 * [name]
 * [name /]
 * [name attr="value"]content[/name]
 *
 * @version 0.1
 * @author David Naber <kontakt@dnaber.de>
 * @license MIT
 */


/**
 * attach method .getShortcode() to the Element type
 */
if ( 'undefined' == typeof Element.prototype.getShortcode ) {

	Element.prototype.getShortcode = function () {
		if ( 'textarea' !== this.tagName.toLowerCase() )
			return;
		var Parser = new ShortcodeParser( this );
		Parser.read();
		return Parser.shortcode;

	}

}
var ShortcodeParser = function ( canvas ) {

	this.canvas = canvas;
	this.pre = '';
	this.post = '';
	this.selection = '';
	this.start = 0;
	this.end = 0;
	this.shortcode = {};

	/**
	 * read in the state of the textarea
	 *
	 * @return void
	 */
	this.read = function() {

		if ( document.selection ) {
			// ie stuff here
		}
		else if ( this.canvas.selectionStart || 0 === this.canvas.selectionStart ) {

			var start  = 0;
			var pos    = this.canvas.selectionStart; // current possiton of the cursor
			var posEnd = this.canvas.selectionEnd;
			var end    = this.canvas.value.length; // end of text
			var length = end - pos; // length of the part after the cursor

			this.pre       = this.canvas.value.substr( start, pos );
			this.post      = this.canvas.value.substr( pos, length );
			this.selection = this.canvas.value.substr( pos, posEnd - pos );

			this.shortcode.start  = pos;
			this.shortcode.end    = posEnd;

		}
		this.parse();
	};

	/**
	 * pases the stuf before and after the cursor
	 *
	 * @return void
	 */
	this.parse = function() {

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

		if ( ! scExp.test( this.selection ) )
			this.checkNeighbourhood();

		if ( ! scExp.test( this.selection ) ) {
			this.shortcode = null;
			return;
		}


		scFound = scExp.exec( this.selection );

		this.shortcode.name = scFound[ 1 ];
		// parse the attributes
		if ( 'undefined' != typeof( scFound[ 2 ] ) ) {
			var atts = scFound[ 2 ].split( ' ' );
			var attsFound = null;
			this.shortcode.atts = {};
			for ( i in atts ) {
				if ( ! scAttsExp.test( atts[ i ] ) )
					continue;
				attsFound = scAttsExp.exec( atts[ i ] );
				this.shortcode.atts[ attsFound[ 1 ] ] = attsFound[ 3 ];
			}
		}
		if ( 'undefined' != typeof( scFound[ 3 ] ) )
			this.shortcode.content = scFound[ 3 ];

	};

	/**
	 * checks the text around the cursor
	 *
	 * @retun bool
	 */
	this.checkNeighbourhood = function() {

		var before = '';
		var after  = '';

		if ( -1 === this.pre.indexOf( '[' ) || -1 === this.post.indexOf( ']' ) )
			return false; //cursor is not in a shortcode

		// strip everything before the last opening braket
		before = this.pre.substr(
			this.pre.lastIndexOf( '[' ),
			this.pre.length
		);
		// if the cursor is set in the closing tag...
		if (
			0 === before.indexOf( '[/' )
		|| (
				0 === before.indexOf( '[' )
			&&  0 === this.post.indexOf( '/' )
			)
		) {
			// find the last OPENING tag
			before = this.pre.substr( 0, this.pre.lastIndexOf( '[' ) );
			before = this.pre.substr( before.lastIndexOf( '[' ), this.pre.length );
		}

		// strip everything after the first closing braket
		after = this.post.substr(
			0,
			this.post.indexOf( ']' ) + 1
		);

		// if the cursor is in the opening tag
		if (
			-1 !== this.post.indexOf( '[/' )
		&&	this.post.indexOf( ']' ) < this.post.indexOf( '[/' )
		&&  this.post.indexOf( '[' ) >=  this.post.indexOf( '[/' )
		) {
			//find the first closing tag
			after = this.post.substr(
				0,
				this.post.indexOf( ']', this.post.indexOf( '[/' ) ) + 1
			);
		}

		if ( -1 === after.indexOf( '[/' ) &&  -1 !== after.indexOf( '[' ) )
			return false; // cursor is in between two different shortcodes

		this.shortcode.start = this.canvas.value.lastIndexOf( before );
		this.shortcode.end   = this.canvas.value.indexOf( after ) + after.length;
		this.selection = before + after;

		return true;
	}
};

