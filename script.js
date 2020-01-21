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

function getCurrencyDetails(countryID) {
	console.log('currency call');

	var queryURL = 'https://wft-geo-db.p.rapidapi.com/v1/locale/currencies?countryId=' + countryID;

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

	$.ajax(settings).then(function(response) {
		console.log('currency', response);

		var currencyCode = response.data[0].code;

		var url = 'https://currency13.p.rapidapi.com/convert/100/USD/' + currencyCode;

		var settings = {
			async: true,
			crossDomain: true,
			url: url,
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'currency13.p.rapidapi.com',
				'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
			}
		};

		$.ajax(settings).then(function(response) {
			console.log(response);
		});
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
		console.log('city details', response);

		// grabbing population
		var population = response.data.population || 'Not Available';

		// in meters
		var elevation = response.data.elevationMeters || 'Not Available';

		// timezone code for another api call
		var timezone = response.data.timezone;

		// City ID for the nearby cities function call
		var cityID = response.data.id;

		// getting country code for currency details call
		var countryID = response.data.countryCode;

		// Empty the more info section before appending new data
		$('#moreInfo').empty();

		var popEl = $('<p>').text('Population: ' + population);
		var elevationEl = $('<p>').text('Elevation (m): ' + elevation);

		// Wait 1.5 seconds because our API takes one call per second max for free plan
		setTimeout(function() {
			getCurrentTime(timezone).then(function(currentTime) {
				console.log(currentTime);

				var timeEl = $('<p>').text('Current Time: ' + currentTime);
				$('#moreInfo').append(popEl, elevationEl, timeEl);

				setTimeout(function() {
					getCurrencyDetails(countryID);
				}, 1500);
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

function getCurrentWeather(cityName) {
	var queryURL =
		'https://api.openweathermap.org/data/2.5/weather?q=' +
		cityName +
		'&APPID=7ed6e592c87c5c5e7c239aee3ee410d9&units=imperial';

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).then(function(response) {
		console.log(response);
		var temp = response.main.temp;
		var description = response.weather[0].description;
		var feelsLike = response.main['feels_like'];
		var status = response.weather[0].main;
		var hi = response.main['temp_max'];
		var low = response.main['temp_min'];

		console.log(hi, low, typeof hi, typeof low);

		var windSpeed = response.wind.speed;

		$('#weather').empty();

		var tempEl = $('<p>').text('Temperature: ' + temp + ' ' + String.fromCharCode(176) + 'F');
		var feelsLikeEl = $('<p>').text('Feels like: ' + feelsLike + ' ' + String.fromCharCode(176) + 'F');
		var statusEl = $('<p>').text('Status: ' + status);
		var descripEl = $('<p>').text('Description: ' + description);
		var windSpeedEl = $('<p>').text('Wind speed: ' + windSpeed + ' mph');
		var lowEl = $('<p>').text('Low: ' + low + ' ' + String.fromCharCode(176) + 'F');
		var hiEl = $('<p>').text('High: ' + hi + ' ' + String.fromCharCode(176) + 'F');

		$('#weather').append(tempEl, feelsLikeEl, statusEl, descripEl, windSpeedEl, lowEl, hiEl);

		// var lat = response.coord.lat;
		// var long = response.coord.lon;
		// uvIndex(lat, long);

		// $('#temp').text(temp + ' ' + String.fromCharCode(176) + 'F');
		// $('#humidity').text(humidity + '%');
		// $('#wind-speed').text(windSpeed + ' mph');
	});
}

function getCityInfo(cityName) {
	var queryURL =
		'https://tripadvisor1.p.rapidapi.com/locations/search?limit=1&sort=relevance&offset=0&lang=en_US&currency=USD&units=mi&query=' +
		cityName;

	var settings = {
		async: true,
		crossDomain: true,
		url: queryURL,
		method: 'GET',
		headers: {
			'x-rapidapi-host': 'tripadvisor1.p.rapidapi.com',
			'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
		}
	};

	$.ajax(settings).then(function(response) {
		console.log('new response', response);

		var cityDescription = response.data[0]['result_object']['geo_description'];
		var imgURL = response.data[0]['result_object'].photo.images.large.url;

		console.log(cityDescription, imgURL);

		var cityDescEl = $('<p>').text(cityDescription);
		var cityImg = $('<img src=' + imgURL + ' alt=city image>');

		$('.city-name').empty();
		$('#cityInfo').empty();
		$('.city-name').text(cityName);
		$('#cityInfo').append(cityImg, cityDescEl);
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

	getCurrentWeather(cityName);
	getCityInfo(cityName);

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
