var
    jscrap = require('jscrap'),
    start = new Date();
var port = 3000;
var ip ="127.0.0.1";
// HTTP server setup
var http = require('http');
http.createServer(function (req, res) {

    res.writeHead(200, {  // Tell Browser to wait
        'Content-Type': 'text/plain'
    });

    function echoData(text1, text2) {

        res.end(text1 + " | " + text2);
    }

    function scrapData(callback) {
        jscrap.scrap("https://www.kernel.org/", {
            debug: true
        }, function (err, $) {
            text1 = "Latest Linux Kernel: " + $("article #latest_link > a").text();
            text2 = "Released: " + $("article #releases tr:first-child td:nth-child(3)").text();

            if (err) {
                console.log(err);
            }

            callback(text1, text2);
        });
    };

    scrapData(echoData);


}).listen(port, ip);
console.log('Server running at http://127.0.0.1:1337/');