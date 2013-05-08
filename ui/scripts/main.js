(function(){

	var nextRelease;
	var counter = $('.counter');
	var displayedFields = ['weeks', 'days', 'hours', 'minutes', 'seconds'];

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
		$.getJSON("api/releases/next", function(res){
			nextRelease = {
				version: res.version,
				date: new Date(res.date*1000)
			};

			updateCounter();
			updateVersion();
		});
	}

	function firstRenderCounter(){
		_.each(displayedFields, function(field){
			counter.append($('<div>', { 'class': field })
				.append($('<div>', { 'class': 'count' }))
				.append($('<div>', { 'class': 'label' }))
			);
		});
	}

	function updateCounter(){
		var allFields = _.keys(SINGULARS);

		var fieldsToOmit = '-' + _.difference(allFields, displayedFields).join(' -');
		var dateDifference = nextRelease.date.diff(fieldsToOmit);

		_.defaults(dateDifference, EMPTY_DATE_DIFF);

		_.omit(dateDifference, 'value', 'tense');

		_.each(dateDifference, function(val, key){
			var column = $("."+key, counter);

			var countEl = $('.count', column);
			countEl.text(val);

			var labelEl = $('.label', column);
			labelEl.text((val === 1) ? SINGULARS[key] : key);
		});

		console.log(dateDifference);
	}

	function updateVersion(){
		$('.version').text(nextRelease.version);
	}


	firstRenderCounter();

	setInterval(fetchNextRelease, 5*60*1000);
	fetchNextRelease();

	setInterval(updateCounter, 1000);

})();