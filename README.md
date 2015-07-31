# jscrap : A very easy-to-use and lighweight web scrapper


`jscrap` is a very fast and easy-to-use web scrapper for node.js

### Installing 
```npm

	npm install jscrap
```

### Example:
```javascript
	var
	    jscrap = require('jscrap');

	jscrap.scrap("https://www.kernel.org/",function(err,$){
	    console.log("Latest Linux Kernel: ",$("article #latest_link > a").text().trim());
	    console.log("Released: ",$("article #releases tr:first-child td:nth-child(3)").text());
	});
```
### Supported selectors:

`jscrap` supports all the [zcsel](https://www.npmjs.org/package/zcsel) selectors and functions.
Watch out [zcsel](https://www.npmjs.org/package/zcsel) documentation.

### Options

The __`scrap()`__ function supports these options:

* __`debug`__ : Activates the debug mode. Defaults to `false`.
* __`followRedirects`__ : Number of redirects to follow. Defaults to `3`.
* __`charsetEncoding`__ : Document charset. Default to `utf-8`.
* __`headers`__ : Headers to pass with request. `Not set` by Default.
* __`timeout`__ : Timeout for request. `null` by Default.