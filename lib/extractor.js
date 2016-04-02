require('d8');
require('d8/locale/en-US');

module.exports.extractReleasesFromJson = function(projectJson, versionJson){
	var projectName = projectJson.name;

	return versionJson.map(function(versionItem){
		console.log("releaseDate =", versionItem.releaseDate);
		var endDate = (versionItem.releaseDate) ? Date.toDate(versionItem.releaseDate, 'Y-m-d') : null;

		return {
			project: projectName,
			version: versionItem.name,
			versionNumber: versionItem.description,
			endDate: endDate
		};
	});
};