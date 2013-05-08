var http = require('http');
var config = require('../config');
var Q = require('q');

var sessionIdPromise = null;

module.exports.fetchSessionId = function(){
	sessionIdPromise = sessionIdPromise || refreshSession();
	return sessionIdPromise;
};

module.exports.expireSession = function(){
	sessionIdPromise = null;
};

function refreshSession(){
	var deferred = Q.defer();

	var req = http.request({
		hostname: config.jira.hostname,
		port: 8080,
		path: '/login.jsp',
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		}
	}, function(res){
		if(res.statusCode >= 400){
			deferred.reject(res);
		} else {
			var cookieHeader = res.headers['set-cookie'].join(' ');
			var sessionId = cookieHeader.match(/JSESSIONID=([A-Z0-9]+);/)[1];
			deferred.resolve(sessionId);
		}
	});

	req.write('os_username='+encodeURIComponent(config.jira.username)+'&os_password='+encodeURIComponent(config.jira.password)+'&os_destination=');
	req.end();

	return deferred.promise;
}