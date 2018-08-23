/*	jshint esversion: 6 */

var cheerio = require('cheerio');
var fs = require('fs');
var rp = require('request-promise');
var sanitize_filename = require('sanitize-filename');

var servers = JSON.parse(fs.readFileSync('servers.json'));

var urlstrings = fs.readFileSync('urls.txt').toString();

var urls = urlstrings.split('\n');

var sanitize = function(filename) {
	var sanitized = filename.replace(/^\//g, '');

	sanitized = sanitized.replace(/\//g, '-slash-');
	return sanitize_filename(sanitized);
};

var resultsDirectoryRoot = './urls';

if (!fs.existsSync(resultsDirectoryRoot)) {
	fs.mkdirSync(resultsDirectoryRoot);
}

var writeResult = function(resultsDirectory, filename, result) {
	fs.writeFileSync(resultsDirectory + '/' + sanitize(filename) + '.json', JSON.stringify(result, null, '\t'));
};

servers.forEach(
	server => {
		var resultsDirectory = resultsDirectoryRoot + '/' + server.host;

		if (!fs.existsSync(resultsDirectory)) {
			fs.mkdirSync(resultsDirectory);
		}
		urls.forEach(
			url => {
				var requestUrl = server.server + url;

				var crawl_and_parse = {
					uri: requestUrl,
					transform: function(body, response) {
						return cheerio.load(body);
					}
				};

				rp(crawl_and_parse).then(
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

						writeResult(resultsDirectory, url, result);
					}
				).catch(
					function(err) {
						var result = {};

						result.error = err.statusCode;
						result.url = url;

						writeResult(resultsDirectory, url, result);
					}
				);
			}
		);
	}
);