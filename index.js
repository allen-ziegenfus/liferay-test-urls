


var sanitize = require("sanitize-filename");
var fs = require("fs");
var request = require("request");
var winston = require("winston");
var logger = winston.createLogger({
	level: 'info',
	transports: [
		new(winston.transports.Console)()
	]
});

var servers = JSON.parse(fs.readFileSync("servers.json"));

const cheerio = require('cheerio');

var urlstring= fs.readFileSync("urls.txt").toString();
var urls = urlstring.split("\n");


servers.forEach(server => {
	if (!fs.existsSync(server.host)){
		fs.mkdirSync(server.host);
	}
	urls.forEach(url => {
		console.log(url);

		var requestUrl = server.server + url;
		console.log(requestUrl);
		request.get(requestUrl, function(err, httpResponse, body) {
			console.log(httpResponse.statusCode);
			const markup = cheerio.load(body);

			var result = {};
			result['meta-description'] = markup('head meta[name="description"]').attr('content');
			result['og-description'] = markup('head meta[property="og:description"]').attr('content');
			result['og-url'] = markup('head meta[property="og:url"]').attr('content');
			result['og-image'] = markup('head meta[property="og:image"]').attr('content');
			result['og-title'] = markup('head meta[property="og:title"]').attr('content');
			result['title'] = markup('head title').text();

			fs.writeFileSync("./" + server.host + "/" + sanitize(url) + ".json", JSON.stringify(result, null, '\t'));
		});
	});

});
