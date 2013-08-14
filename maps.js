/*
	GRIGORESCU Irina 342C4
	      Tema 1 IOC
	     Hai la drum!
*/

// variabila pentru harta
var map;
// variabila pentru drum
var roadPath;
// variabila pentru a numi markerele de la 1..
var n = 0;
// variabila pentru a retine drumul
var drumDescris = [];
// variabila pentru a retine distanta in km
var distanceR = 0;
// variabila pentru direction display
var directionsDisplay = new google.maps.DirectionsRenderer();
// variabila pentru numele markerelor
var title = [];

// functie de initializare
function initialize() {
	// optiuni pentru harta
	var mapOptions = {
		zoom: 14, // zoom-ul initial
		center: new google.maps.LatLng(44.418, 26.037), // setare centru harta in Drumul Taberei, Bucuresti
		mapTypeId: google.maps.MapTypeId.ROADMAP // tipul hartii
	};

	// harta propriu-zisa si pozitia in pagina
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	// Listener pentru right click pe harta (adaugare de markere)
	google.maps.event.addListener(map, "rightclick", function(event) {
		// se iau variabilele pentru latitudine si longitudine din event. se vor folosi la crearea marker-ului
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		var location = new google.maps.LatLng(lat,lng);

		// creare marker nou la pozitia click-ului in harta
		var marker = new google.maps.Marker({
		  position: location,
		  map: map,
		  clickable: true,
		  title: (n+1).toString()
		}); 
		title.push((n+1).toString());
		n += 1;

		drumDescris.push(location);

		// Listener pentru click-ul pe marker - setare nume predefinit de utilizator (vezi instructiunile din pagina html)
		google.maps.event.addListener(marker, 'click', function() {
			// luam input-ul dat de user
			var mName = document.getElementById('inputMarker').value;
			// adaugam numele nou in arrayul title
			title[parseInt(marker.title)-1] = mName;
			// setam titlul marker-ului
			marker.setTitle(mName);
		});	
	});
	
}

// functie pentru stergere markere
function deleteRoad() {
	for(var i = 0; i < drumDescris.length ; i++)
	{
		drumDescris[i].setMap(null);
	}
	distanceR = 0;
}

// functie pentru creare drum
function createRoad() {
	var directionsService = new google.maps.DirectionsService();
	directionsDisplay.setMap(map);

	// punctul de plecare (primul marker)
	var start = drumDescris[0];
	// destinatia (ultimul marker)
	var end = drumDescris[drumDescris.length-1];
	// waypoint-urile
	var waypts = [];

	// adaugarea waypoint-urilor
	for (var i = 0; i < drumDescris.length-1; i++) {
		waypts.push({location: drumDescris[i], stopover: true});
	}

	// request-ul
	var request = {
		origin: start,
		destination: end,
		waypoints: waypts,
		optimizeWaypoints: true,
		travelMode: google.maps.DirectionsTravelMode.WALKING
	};
	
	// creare ruta
	directionsService.route(request, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(response);
		var route = response.routes[0];
		var summaryPanel = document.getElementById('directions_panel');
		summaryPanel.innerHTML = '';
		// For each route, display summary information.
		for (var i = 0; i < route.legs.length; i++) {
		  var routeSegment = i + 1;
		  summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>';
		  summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
		  summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
		  summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
		}
	  }
	});
}

// functie pentru calcul distanta
function computeDistance() {
	var distance = 0;
	var dist1 = 0;
	var dist2 = 0;
	
	for(var i = 0; i < (drumDescris.length-1) ; i++)
	{
		dist1 = drumDescris[i];
		dist2 = drumDescris[i+1];
		
		distance += google.maps.geometry.spherical.computeDistanceBetween(dist1, dist2);
	}
	
	distanceR = Math.round((distance/1000)*100)/100;
	var summaryPanel = document.getElementById('distanta');
	summaryPanel.innerHTML = '';
	summaryPanel.innerHTML += (distanceR + ' km');
}

// Generate the XML file
function XML() {
	var ruta = directionsDisplay.directions.routes[0];
	var marker = "";
	XML = "";
	
	XML += "&lt?xml version=\"1.0\" encoding=\"ISO-8859-1\"?&gt"
	XML += "<p>" + "\n&ltroute&gt" + "</p>";
	
	for(var i = 0; i < ruta.legs.length ; i++)
	{
		marker = ruta.legs[i].start_address; 						
		XML += "<p>" + "&ltmarker&gt" + "</p>";
		XML += "<p>" + "&ltid&gt" + i + "&lt/id&gt" + "</p>";
		XML += "<p>" + "&ltname&gt" + title[i] + "&lt/name&gt" + "</p>";
		XML += "<p>" + "&ltdescriere&gt" + marker + "&lt/descriere&gt" + "</p>";
		XML += "<p>" + "&lt/marker&gt" + "</p>";
	}	
	XML += "<p>" + "&lt/ruta&gt" + "</p>";
	
	document.getElementById("XML").innerHTML = XML;
}

google.maps.event.addDomListener(window, 'load', initialize);

