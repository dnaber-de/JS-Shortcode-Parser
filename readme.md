# JS Shortcode Parser

Finding Shortcodes (BBCodes) in Textareas.

## How to use
```javascript
window.onkeyup( function() {
	var shortcode = document.getElementById( 'myTextarea' ).getShortcode();
}
```

### Element.getShortcode()
Return: NULL|Object
The Object consists of
* string Object.name
* object Object.attr (Optional)
* string Object.content (Optional)
