var something = 'does this work';

var placesAutocomplete = places({
	appId: 'plHJ3V77N7R0',
	apiKey: '15c839632d2df1c8823fe9d3cd8988f5',
	container: document.querySelector('#address-input')
});

// console.log(placesAutocomplete);
placesAutocomplete.on('change', (e) => {
	console.log(e.suggestion);
	var inputObject = e.suggestion;

	var cityName = inputObject.name;
	var countryCode = inputObject.countryCode;

	console.log(cityName, countryCode);

	var settings = {
		async: true,
		crossDomain: true,
		url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=us&namePrefix=miami',
		method: 'GET',
		headers: {
			'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
			'x-rapidapi-key': '8671db22c0mshaa910c9a37cdeb0p1568fejsn57c4371fdcb4'
		}
	};

	$.ajax(settings).then(function(response) {
		console.log(response);
	});
});

// placesAutocomplete.on('submit', function() {
// 	var cityInput = placesAutocomplete.getVal();
// 	console.log(cityInput);
// });
