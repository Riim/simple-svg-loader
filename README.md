# simple-svg-loader

## config:

```js
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');

module.exports = {
	entry: {
		main: [path.join(__dirname, 'src/main.js')].concat(
			glob.sync('assets/icons/*.svg').map(function(p) {
				return path.join(__dirname, p);
			})
		)
	},

	module: {
		loaders: [
			{
				test: /\.svg$/,
				loader: 'simple-svg'
			}
		]
	}
};
```

## or individual requirement:

```js
require('simple-svg!./icons/home.svg');
```

## use:

```html
<a href="/">
	<svg viewBox="0 0 20 20" class="icon"><use xlink:href="#home"></use></svg>
	Home
</a>
```

### with change id:

```js
require('simple-svg?id=icon-home!./icons/home.svg');
```
```html
<svg viewBox="0 0 20 20" class="icon"><use xlink:href="#icon-home"></use></svg>
```

### and styles:

```css
.icon {
	display: inline-block;
	margin-top: -.1em;
	width: 1em;
	height: 1em;
	vertical-align: middle;
	fill: currentColor;
}

.icon-2x,
.icon-3x,
.icon-4x {
	margin-top: 0;
}

.icon-2x {
	width: 2em;
	height: 2em;
}

.icon-3x {
	width: 3em;
	height: 3em;
}

.icon-4x {
	width: 4em;
	height: 4em;
}

.icon-full {
	width: 100%;
	height: 100%;
}
```
