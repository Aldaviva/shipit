var auth      = require('./auth');
var config    = require('../config');
var extractor = require('./extractor');
var http      = require('http');
var Q         = require('q');

var fetchReleases = module.exports.fetchReleases = function(){
	return Q.try(auth.fetchSessionId)
		.then(fetchReleaseXml)
		.then(extractor.extractReleasesFromXml);
};

module.exports.fetchNextRelease = function(){
	return fetchReleases()
		.then(function(releases){
			var now = new Date();
			return releases.reduce(function(prev, curr){
				return (curr.date && (curr.date > now) && (!prev.date || (curr.date < prev.date)))
					? curr
					: prev;
			}, { date: null, version: 'none' });
		});
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
			console.info(res.statusCode, res.headers.location);
		}

		res.on('data', function(chunk){
			resBody += chunk;
		});

		res.on('end', function(){
			var xml = JSON.parse(resBody).content;
			deferred.resolve(xml);
		});
	});

	return deferred.promise;
}