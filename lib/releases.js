var auth      = require('./auth');
var config    = require('../config');
var extractor = require('./extractor');
var http      = require('http');
var Q         = require('q');

module.exports.fetchNextRelease = function(){
	return fetchReleases()
		.then(function(releases){
			var now = new Date();
			return releases.reduce(function(prev, curr){
				return (curr.endDate && (curr.endDate > now) && (!prev.endDate || (curr.endDate < prev.endDate)))
					? curr
					: prev;
			}, { startDate: null, endDate: null, version: 'none' });
		});
};

var fetchReleases = module.exports.fetchReleases = function(){
	return Q.try(auth.fetchSessionId)
		.then(fetchReleaseXml)
		.then(extractor.extractReleasesFromXml);
};

function fetchReleaseXml(sessionId){
	var deferred = Q.defer();
	var resBody = '';

	http.get({
		hostname: config.jira.hostname,
		port: config.jira.port,
		headers: {
			cookie: 'JSESSIONID='+sessionId
		},
		path: "/browse/"+config.jira.projectKey+"?selectedTab=com.atlassian.jira.plugin.system.project%3Aversions-panel&decorator=none&contentOnly=true"
	}, function(res){
		if(res.statusCode == 302){
			//TODO invalidate session and try again
			console.info("Logged out of JIRA");
			auth.expireSession();
			deferred.resolve(
				Q.try(auth.fetchSessionId)
					.then(fetchReleaseXml)
			);
		}

		res.on('data', function(chunk){
			resBody += chunk;
		});

		res.on('end', function(){
			var xml = JSON.parse(resBody).content;
			console.info("Downloaded release XML from JIRA.");
			deferred.resolve(xml);
		});
	});

	return deferred.promise;
}