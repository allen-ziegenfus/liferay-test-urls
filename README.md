# Test Urls

This is a simple node project to do simplified testing on markup / response headers retrieved from a set of servers. 

It was created to be able to test SEO relevant markup in the head of a document.

It can also test redirects by extracting response headers.

## How does it work

1. Reads in a list of URLs e.g. [urls.txt](urls.txt) or [redirects.txt](redirects.txt) and a list of servers to test [servers.json](servers.json).
2. Fetches markup or response headers using request-promise 
3. If needed, loads markup for further processing with the jQuery-like cheerio module: [https://github.com/cherriojs/cheerio](https://github.com/cheeriojs/cheerio)
4. Extracts relevant information from the markup / response headers and stores the results in a JSON file. These are stored pro server in an corresponding directory. 
5. As the case may be, the results are massaged to make it easier to test (server names changed so that environment differences are suppressed)

Once the relevant information is harvested it is then easy to either compare the results between two servers, or the results from an earlier run on the same server (e.g. with git).

## Setup

```npm i``` to install dependencies. Configure your servers / urls in urls.txt or redirects.txt and servers.json.

## Running it

```node index.js``` will run the basic URL test pulling from urls.txt and checking SEO information

```node test-redirects.js``` will test redirects by fetching the response headers from the urls listed in redirects.txt