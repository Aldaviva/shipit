(function(){

	var nextRelease;
	var counter = $('.counter');
	var displayedFields = ['weeks', 'days', 'hours', 'minutes'];

	var SINGULARS = {
		'milliseconds' : 'millisecond',
		'seconds'      : 'second',
		'minutes'      : 'minute',
		'hours'        : 'hour',
		'days'         : 'day',
		'weeks'        : 'week',
		'months'       : 'month',
		'years'        : 'year'
	};

	var EMPTY_DATE_DIFF = _.zipObject(_.keys(SINGULARS), _.times(_.keys(SINGULARS).length, function(){ return 0; }));

	function fetchNextRelease(){
		// nextRelease = {
		// 	version: "Catalyst Aventador",
		// 	endDate: new Date(2015, 3-1, 31, 12+1, 32, 0, 0)
		// };
        //
		// updateCounter();
		// updateVersion();

		$.ajax({
			dataType: "json",
			// url: "http://releasestatus.bluejeansnet.com/sieve/cgi-bin/releases/current",
			url: "api/releases/next",
			cache: false,
			success: function(res){
				nextRelease = {
					version: res.version,
					versionNumber: res.versionNumber,
					endDate: new Date(res.endDate*1000).adjust(Date.HOUR, 12+9), //1:32 pm TODO should be 9:00 pm
					project: res.project
					// version: res.name,
					// endDate: new Date(res.dates.z2)
				};

				updateCounter();
				updateVersion();
			}
		});
	}

	function firstRenderCounter(){
		_.each(displayedFields, function(field, idx){
			idx && counter.append($('<hr>'));
			
			counter.append($('<div>', { 'class': field })
				.append($('<div>', { 'class': 'count' }))
				.append($('<div>', { 'class': 'label' }))
			);
		});
	}

	function updateCounter(){
		var allFields = _.keys(SINGULARS);

		var fieldsToOmit = '-' + _.difference(allFields, displayedFields).join(' -');
		var dateDifference = nextRelease.endDate.diff(fieldsToOmit);

		_.defaults(dateDifference, EMPTY_DATE_DIFF);

		_.omit(dateDifference, 'value', 'tense');

		_.each(dateDifference, function(val, key){
			var column = $("."+key, counter);

			var countEl = $('.count', column);
			countEl.text(val);

			var labelEl = $('.label', column);
			labelEl.text((val === 1) ? SINGULARS[key] : key);
		});
	}

	function updateVersion(){
		$('.version').text(nextRelease.project + ' ' + nextRelease.version + ' ' + nextRelease.versionNumber);
	}


	firstRenderCounter();

	setInterval(fetchNextRelease, 15*60*1000);
	fetchNextRelease();

	setInterval(updateCounter, 1000);

})();
