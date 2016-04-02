var config   = require('../config');
var fs       = require('fs');
var Q        = require('q');
var releases = require('./releases');
var restify  = require('restify');

var server = restify.createServer();

server.pre(restify.pre.sanitizePath());

server.on('uncaughtException', function(req, res, route, err){
	console.error("Uncaught exception: %s", err);
	console.error(err.stack);
	console.error({
		client  : req.connection.remoteAddress,
		time    : req.time(),
		method  : req.method,
		url     : req.url,
		headers : req.headers
	});
});

server.get("/api/releases", function(req, res){
	res.cache('no-cache');
	releases.fetchReleases()
		.then(function(rels){
			rels.forEach(function(rel){
				rel.endDate   && (rel.endDate   = ~~(rel.endDate.getTime()/1000));
				// rel.startDate && (rel.startDate = ~~(rel.startDate.getTime()/1000));
			});
			res.send(rels);
		});
});

server.get("/api/releases/next", function(req, res){
	res.cache('no-cache');
	releases.fetchNextRelease()
		.then(function(rel){
			console.log("rel", rel);
			rel.endDate   = ~~(rel.endDate.getTime()/1000);
			// rel.startDate = ~~(rel.startDate.getTime()/1000);
			res.send(rel);
		})
		.done();
});

server.get({ path: '/', name: 'index' }, function(req, res, next){
	serveFile('ui/index.html', res, next, { cacheControl: 'no-cache' });
});

var serveNodeModules = restify.serveStatic({
	directory: 'node_modules',
	maxAge: 3600
});

server.get({ path: /\/node_modules\/(.*)/, name: "getNodeModule" }, function(req, res, next){
	req._path = req.params[0];
	serveNodeModules(req, res, next);
});

server.get({ path: /\/.*/, name: "getUiResource" }, restify.serveStatic({
	directory: './ui',
	maxAge: 3600
}));

server.listen(config.port, function(){
	console.log("Listening on port %d.", config.port);
});


function serveFile(filePath, res, next, opts){
	opts = opts || {};
	Q.nfcall(fs.stat, filePath)
		.then(function(stats){
			var fstream = fs.createReadStream(filePath);
			fstream.once('open', function (fd) {
				res.set('Content-Length', stats.size);
				res.set('Content-Type', 'text/html');
				res.set('Last-Modified', stats.mtime);
				if(opts.cacheControl){
					res.set('Cache-Control', opts.cacheControl);
				}
				res.writeHead(200);
				fstream.pipe(res, { end: true });
				fstream.once('end', function () {
					next(false);
				});
			});
		});
}
