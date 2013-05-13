var DomParser = require('xmldom').DOMParser;
var xpath     = require('xpath');

require('d8');
require('d8/locale/en-US');

module.exports.extractReleasesFromXml = function(xml){
	var doc = new DomParser().parseFromString(xml);
	var vevents = xpath.select("//tr[@class='vevent']", doc);

	var releases = [];

	vevents.forEach(function(vevent){
		var version;
		var endDate = '';

		version = xpath.select1("./@data-version-name", vevent).value;

		var endDateNode = xpath.select1(".//*[@class='release-date']//*[@class='dtstart dtend hidden']/text()", vevent);
		endDate = (endDateNode) ? Date.toDate(endDateNode.nodeValue, 'Y-m-d<T>H-i') : null;
		
		releases.push({
			version: version,
			endDate: endDate
		});
	});

	return releases;
};