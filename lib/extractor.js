var DomParser = require('xmldom').DOMParser;
var xpath     = require('xpath');

require('d8');
require('d8/locale/en-US');

module.exports.extractReleasesFromXml = function(xml){
	var doc = new DomParser().parseFromString(xml);
	var query = "//tr[@class='vevent']";
	var vevents = xpath.select(query, doc);

	var releases = [];

	vevents.forEach(function(vevent){
		var version;
		var date = '';

		version = xpath.select1("./@data-version-name", vevent).value;
		var dateNode = xpath.select1(".//*[@class='release-date']//*[@class='dtstart dtend hidden']/text()", vevent);
		date = (dateNode) ? Date.toDate(dateNode.nodeValue, 'Y-m-d<T>H-i') : null;
		
		releases.push({
			version: version,
			date: date
		});
	});

	return releases;
};