// Algolia third-party api
var placesAutocomplete = places({
	appId: 'plHJ3V77N7R0',
	apiKey: '15c839632d2df1c8823fe9d3cd8988f5',
	container: document.querySelector('#address-input')
});

// Geo DB city details api request
function getCityDetails(cityID) {
	// code coming soon
}

// initial ajax request from GeoDB cities API
function getCities(settings) {
	$.ajax(settings).then(function(response) {
		console.log(response);

		// grabbing city ID for the upcoming api requests
		var cityID = response.data[0].id;
		console.log(cityID);
	});
}

// the event listener for the input box
placesAutocomplete.on('change', (e) => {
	// saving the input object in a variable
	var inputObject = e.suggestion;

	// grabbing city name and country code from the input
	var cityName = inputObject.name;
	var countryCode = inputObject.countryCode;
	// console.log(cityName, countryCode);

	// creating the query URL for the ajax request
	var queryURL =
		'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=' + countryCode + '&namePrefix=' + cityName;

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
