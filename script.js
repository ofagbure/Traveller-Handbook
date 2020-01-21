// Algolia third-party api
var placesAutocomplete = places({
	appId: 'plHJ3V77N7R0',
	apiKey: '15c839632d2df1c8823fe9d3cd8988f5',
	container: document.querySelector('#address-input')
});

function getCurrentTime(timezone) {
	if (!timezone) {
		return 'Not Available';
	}
	// settings
	var settings = {
		async: true,
		crossDomain: true,
		url: 'https://wft-geo-db.p.rapidapi.com/v1/locale/timezones/' + timezone + '/time',
		method: 'GET',
		headers: {
			'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
			'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
		}
	};

	return $.ajax(settings).then(function(response) {
		// console.log(response, response.data);
		console.log(response.data);
		var currentTime = response.data.substring(0, 5);

		return currentTime;
	});
}

// Geo DB city details api request
function getCityDetails(cityID) {
	console.log('getCityDetails');
	// creating query URL with input cityID
	var queryURL = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities/' + cityID;

	// preparing settings with new url
	var settings = {
		async: true,
		crossDomain: true,
		url: queryURL,
		method: 'GET',
		headers: {
			'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
			'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
		}
	};

	// calling city details api request
	$.ajax(settings).then(function(response) {
		console.log(response);

		// grabbing population
		var population = response.data.population || 'Not Available';

		// in meters
		var elevation = response.data.elevationMeters || 'Not Available';

		// timezone code for another api call
		var timezone = response.data.timezone;

		// Wait 1.5 seconds because our API takes one call per second max for free plan
		setTimeout(function() {
			getCurrentTime(timezone).then(function(currentTime) {
				console.log(currentTime);

				var popEl = $('<p>').text('Population: ' + population);
				var elevationEl = $('<p>').text('Elevation (m): ' + elevation);
				var timeEl = $('<p>').text('Current Time: ' + currentTime);
				$('#moreInfo').append(popEl, elevationEl, timeEl);
			});
		}, 1500);
	});
}

// initial ajax request from GeoDB cities API
function getCities(settings) {
	console.log('getCities');
	$.ajax(settings).then(function(response) {
		console.log(response);

		// grabbing city ID for the upcoming api requests
		var cityID = response.data[0].id;
		// console.log(cityID);

		// Wait 1.5 seconds because our API takes one call per second max for free plan
		setTimeout(function() {
			getCityDetails(cityID);
		}, 1500);
	});
}

// the event listener for the input box
placesAutocomplete.on('change', (e) => {
	// saving the input object in a variable
	var inputObject = e.suggestion;
	console.log(inputObject);

	$('.results-card').show();
	$('.intro-card').hide();

	// grabbing city name and country code from the input, and latitude and longitude
	// formatting the long and lat to how the api wants to recieve it
	var cityName = inputObject.name;
	var countryCode = inputObject.countryCode;
	var lng =
		inputObject.latlng.lng.toString().charAt(0) === '-'
			? inputObject.latlng.lng.toFixed(4)
			: '%2B' + inputObject.latlng.lng.toFixed(4);
	var location = inputObject.latlng.lat.toFixed(4) + lng;

	// creating the query URL for the ajax request
	var queryURL =
		'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=' +
		countryCode +
		'&namePrefix=' +
		cityName +
		'&location=' +
		location +
		'&radius=10';

	// creating settings object for the ajax call, including the url above
	var settings = {
		async: true,
		crossDomain: true,
		url: queryURL,
		method: 'GET',
		headers: {
			'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
			'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
		}
	};

	// function to call the ajax request
	getCities(settings);
});
