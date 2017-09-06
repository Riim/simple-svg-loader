# simple-svg-loader

## config:

```js
var webpack = require('webpack');

module.exports = {
	module: {
		rules: [
			{
				test: /\.svg$/,
				loader: 'simple-svg-loader'
			}
		]
	}
};
```

## use:

```js
import './icons/home.svg';
```
```html
<a href="/">
	<svg viewBox="0 0 32 32"><use xlink:href="#home"></use></svg>
	Home
</a>
```

### change id:

```js
import './icons/home.svg?id=icon-home';
```
```html
<svg viewBox="0 0 32 32"><use xlink:href="#icon-home"></use></svg>
```
