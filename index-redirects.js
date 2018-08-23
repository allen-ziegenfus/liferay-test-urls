/*	jshint esversion: 6 */

var fs = require('fs');
var rp = require('request-promise');
var sanitize_filename = require('sanitize-filename');

var servers = JSON.parse(fs.readFileSync('servers.json'));

var redirectstrings = fs.readFileSync('redirects.txt').toString();

var redirects = redirectstrings.split('\n');

var sanitize = function(filename) {
	var sanitized = filename.replace(/^\//g, '');

	sanitized = sanitized.replace(/\//g, '-slash-');
	return sanitize_filename(sanitized);
};


var resultsDirectoryRoot = './redirects';

if (!fs.existsSync(resultsDirectoryRoot)) {
	fs.mkdirSync(resultsDirectoryRoot);
}

var writeResult = function(resultsDirectory, filename, result) {
	fs.writeFileSync('./' + resultsDirectory + '/' + sanitize(filename) + '.json', JSON.stringify(result, null, '\t'));
};

servers.forEach(
	server => {
		var resultsDirectory = resultsDirectoryRoot + '/' + server.host;

		if (!fs.existsSync(resultsDirectory)) {
			fs.mkdirSync(resultsDirectory);
		}
		redirects.forEach(
			redirect => {
				var requestUrl = server.server + redirect;

				var test_redirect = {
					followRedirect: false,
					resolveWithFullResponse: true,
					uri: requestUrl
				};

				rp(test_redirect).then(
					function(response) {
						var result = {};

						result.response = response.statusCode;
						result.url = redirect;

						writeResult(resultsDirectory, redirect, result);
					}
				).catch(
					function(response) {
						var result = {};

						result.location = response.response.headers.location;
						result.response = response.statusCode;
						result.url = redirect;

						if (result.location) {
							result.location = result.location.replace('-nightly', '');
							result.location = result.location.replace('-uat', '');
						}

						writeResult(resultsDirectory, redirect, result);
					}
				);
			}
		);
	}
);