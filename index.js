/*jshint esversion: 6 */

var cheerio = require('cheerio');
var fs = require('fs');
var rp = require('request-promise');
var sanitize = require('sanitize-filename');

var servers = JSON.parse(fs.readFileSync('servers.json'));
var urlstring = fs.readFileSync('urls.txt').toString();

var urls = urlstring.split('\n');

servers.forEach(
	server => {
		if (!fs.existsSync(server.host)) {
			fs.mkdirSync(server.host);
		}
		urls.forEach(
			url => {
				var requestUrl = server.server + url;

				var crawl = {
					uri: requestUrl,
					transform: function(body) {
						return cheerio.load(body);
					}
				};

				rp(crawl).then(
					function($) {
						console.log('Fetching ' + requestUrl);

						var result = {};

						result['meta-description'] = $('head meta[name="description"]').attr('content');
						result['og-description'] = $('head meta[property="og:description"]').attr('content');
						result['og-url'] = $('head meta[property="og:url"]').attr('content');
						result['og-image'] = $('head meta[property="og:image"]').attr('content');
						result['og-title'] = $('head meta[property="og:title"]').attr('content');
						result.title = $('head title').text();
						result.url = url;

						servers.forEach(
							server => {
								result['og-url'] = result['og-url'].replace(server.server, '');
								result['og-image'] = result['og-image'].replace(server.server, '');
							}
						);

						fs.writeFileSync('./' + server.host + '/' + sanitize(url) + '.json', JSON.stringify(result, null, '\t'));
					}
				).catch(
					function(err) {
						var result = {};

						result.error = err.statusCode;
						result.url = url;

						fs.writeFileSync('./' + server.host + '/' + sanitize(url) + '.json', JSON.stringify(result, null, '\t'));
					}
				);
			}
		);
	}
);