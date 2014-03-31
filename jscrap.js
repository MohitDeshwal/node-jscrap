"use strict";

var
	http       = require('http'),
	https      = require('https'),
	zlib       = require('zlib'),
	htmlparser = require("htmlparser"),
	zcsel      = require('zcsel');

exports.scrap = function(url_or_data,opts,handler) {

	var
		self = this,
		args = Array.prototype.slice.call(arguments, 0),
		data = url_or_data,
		pHandler,
		parser;

	url_or_data = args.shift() || null;
	handler = args.pop()       || null;
	opts = args.shift()        || null;
	if ( !url_or_data )
		throw new Error("No URL or HTML data to scrap");
	if ( !handler )
		throw new Error("No callback");

	// Input is an URL ? Get it!
	_if ( data.match(/^https?:\/\//),
		function(next){
			self._get(url_or_data,opts,function(err,pageData,res){
				if ( err )
					return next(err,res);
				data = pageData;
				next(null,res);
			});
		},
		function(err,res) {
			if ( err )
				return handler(err,null,res);

			// Parse
			pHandler = new htmlparser.DefaultHandler(function(err,doc){

				// Initialize document with ZCSEL and return it
				return (err ? handler(err,null) : handler(null,zcsel.initDom(doc)));

			});
			parser = new htmlparser.Parser(pHandler);
			return parser.parseComplete(data);
		}
	);

};

exports._get = function(url,opts,handler) {

	var
		args = Array.prototype.slice.call(arguments, 0),
		httpMod,
		zipDecoder,
		content = "";

	url = args.shift()    || null;
	handler = args.pop()  || null;
	opts = args.shift()   || { followRedirects: 3, charsetEncoding: "utf-8" };
	if ( !url )
		throw new Error("No URL to GET");
	if ( !handler )
		throw new Error("No callback");

	// GET
	httpMod = url.match(/^https:/) ? https : http;
	httpMod.get(url,function(res){
		if ( res.statusCode > 400 )
			return handler(new Error("Got HTTP status code "+res.statusCode),null,res);
		if ( res.statusCode >= 300 && res.statusCode < 400 ) {
			if ( res.headers['location'] != null && res.headers['location'].match(/^https?:\/\/.+/) && opts.followRedirects ) {
				opts.followRedirects--;
				return exports._get(res.headers['location'],handler);
			}
			return handler(new Error("Found redirect without Location header"),null,res);
		}

		// Watch content encoding
		if ( res.headers['content-encoding'] ) {
			var enc = res.headers['content-encoding'].toString().toLowerCase().replace(/^\s*|\s*$/g,"");
			if ( enc == "gzip" )
				zipDecoder = zlib.createGunzip();
			else if ( enc == "deflate" )
				zipDecoder = zlib.createInflate();
			else
				return handler(new Error("Unsupported document encoding '"+enc+"'"),null);
			res.pipe(zipDecoder);
		}

		// GET data
		(zipDecoder || res).setEncoding(opts.charsetEncoding || "utf-8");
		(zipDecoder || res).on('data',function(d){ content += d.toString(); });
		(zipDecoder || res).on('end',function(){
			return handler(null,content,res);
		});
	})
	.on('error',function(err){
		return handler(err,null,null);
	});

};

function _if(cond,a,b){
	return cond ? a(b) : b();
}
