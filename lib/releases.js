var _         = require('lodash');
var auth      = require('./auth');
var config    = require('../config');
var extractor = require('./extractor');
var http      = require('http');
var Q         = require('q');
var request   = require('pr-request2');

module.exports.fetchNextRelease = function(){
	return fetchReleases()
		.then(function(releases){
			console.log("releases", releases);
			var now = new Date();
			return releases.reduce(function(prev, curr){
				return (curr.endDate && (curr.endDate > now) && (!prev.endDate || (curr.endDate < prev.endDate)))
					? curr
					: prev;
			}, { startDate: null, endDate: null, version: 'none' });
		});
};
 
var fetchReleases = module.exports.fetchReleases = function(){
	return Q.try(fetchReleaseJson)
		.spread(extractor.extractReleasesFromJson);
};

function fetchReleaseJson(){
	var auth = {
		username: config.jira.username,
		password: config.jira.password,
		sendImmediately: true
	};

	var jiraUrl = {
		protocol: 'http:',
		hostname: config.jira.hostname,
		port: config.jira.port
	};

	return Q.all([
		request({
			url: _.defaults({ pathname: '/rest/api/2/project/'+config.jira.projectKey }, jiraUrl),
			auth: auth,
			json: true
		}).get('body'),
		request({
			url: _.defaults({ pathname: '/rest/api/2/project/'+config.jira.projectKey+'/versions' }, jiraUrl),
			auth: auth,
			json: true
		}).get('body')
	]);
}