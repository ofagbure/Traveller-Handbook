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

function converCurrency(exchangeRate, currencyCode) {
	var inputVal = $('#from-amt').val();

	console.log(typeof inputVal, inputVal);
	if (inputVal !== '') {
		var inputNum = parseInt(inputVal);
		console.log(typeof inputNum, inputNum);
		var newValue = (inputNum * exchangeRate).toFixed(2);
		console.log(typeof newValue, newValue);

		$('#currencySummary').empty();

		$('#currencySummary').text(inputVal + ' USD is equal to ' + newValue + ' ' + currencyCode);
	}
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

		var to = currencyCode;
		var from = 'USD';

		var callURL = 'https://currency-exchange.p.rapidapi.com/exchange?q=1.0&from=' + from + '&to=' + to;

		var settings = {
			async: true,
			crossDomain: true,
			url: callURL,
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'currency-exchange.p.rapidapi.com',
				'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
			}
		};

		$.ajax(settings).done(function(response) {
			// string value of the currency with a ton of decimal places
			console.log(typeof response);

			var exchangeRate = parseFloat(response);

			var ptag = $('<p id= currencySummary>').text('1 USD is equal to ' + response + ' ' + currencyCode);

			$('#Currency').prepend(ptag);

			$('.btn').on('click', function() {
				converCurrency(exchangeRate, currencyCode);
			});
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

		if (elevation !== 'Not Available') {
			var numElevation = parseInt(elevation);
			// converting meters to feet
			numElevation = numElevation * 3.281;
			elevation = numElevation.toString() + ' ft';
		}

		// timezone code for another api call
		var timezone = response.data.timezone;

		// City ID for the nearby cities function call
		var cityID = response.data.id;

		// getting country code for currency details call
		var countryID = response.data.countryCode;

		// Empty the more info section before appending new data
		$('#moreInfo').empty();

		var popEl = $('<p>').text('Population: ' + population);
		var elevationEl = $('<p>').text('Elevation: ' + elevation);

		// Wait 1.5 seconds because our API takes one call per second max for free plan
		setTimeout(function() {
			getCurrentTime(timezone).then(function(currentTime) {
				var hour = currentTime.substring(0, 2);
				console.log(hour);
				var rest = currentTime.substring(2);
				if (parseInt(hour) > 12) {
					hour = hour - 12;
					currentTime = hour + rest + ' PM';
				} else if (hour === 12) {
					currentTime = hour + rest + ' PM';
				} else {
					currentTime = hour + rest + ' AM';
				}
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

		$('#temp').text(temp + ' ' + String.fromCharCode(176) + 'F');
		$('#feels').text(feelsLike + ' ' + String.fromCharCode(176) + 'F');
		// $('').text('Status: ' + status);
		$('#description').text(description);
		$('#wind').text(windSpeed + ' mph');
		$('#low').text(low + ' ' + String.fromCharCode(176) + 'F');
		$('#high').text(hi + ' ' + String.fromCharCode(176) + 'F');
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

	$('.results-card').fadeIn(1500);
	$('#currencySummary').empty();

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
