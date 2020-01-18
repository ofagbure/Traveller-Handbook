// Algolia third-party api
var placesAutocomplete = places({
	appId: 'plHJ3V77N7R0',
	apiKey: '15c839632d2df1c8823fe9d3cd8988f5',
	container: document.querySelector('#address-input')
});

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
	});
}

// initial ajax request from GeoDB cities API
function getCities(settings) {
	console.log('getCities');
	$.ajax(settings).then(function(response) {
		console.log(response);

		// grabbing city ID for the upcoming api requests
		var cityID = response.data[0].id;
		console.log(cityID);

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

	// grabbing city name and country code from the input, and latitude and longitude
	var cityName = inputObject.name;
	var countryCode = inputObject.countryCode;
	var location = inputObject.latlng.lat.toString() + inputObject.latlng.lng.toString();

	// console.log(typeof location, location);

	// console.log(cityName, countryCode);

	// creating the query URL for the ajax request
	var queryURL =
		'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=' +
		countryCode +
		'&namePrefix=' +
		cityName +
		'&location=' +
		location +
		'&radius=10';

	// console.log(queryURL);

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
