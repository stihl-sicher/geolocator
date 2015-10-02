var firstGeolocation = true;

/*function getPosition() {
	startGeolocation();
}

var pulsate = function(feature) {
    var point = feature.geometry.getCentroid(),
        bounds = feature.geometry.getBounds(),
        radius = Math.abs((bounds.right - bounds.left)/2),
        count = 0,
        grow = 'up';

    var resize = function(){
        if (count>16) {
            clearInterval(window.resizeInterval);
        }
        var interval = radius * 0.03;
        var ratio = interval/radius;
        switch(count) {
            case 4:
            case 12:
                grow = 'down'; break;
            case 8:
                grow = 'up'; break;
        }
        if (grow!=='up') {
            ratio = - Math.abs(ratio);
        }
        feature.geometry.resize(1+ratio, point);
        geolocationLayer.drawFeature(feature);
        count++;
    };
    window.resizeInterval = window.setInterval(resize, 50, point, radius);
};

function startGeolocation() {
	restrictionOff();
	setBaselayerByName('OpenTopoMap');
	
	geolocationLayer.removeAllFeatures();
	geolocate.deactivate();
	geolocate.watch = true;
	firstGeolocation = true;
	geolocate.activate();
}

function stopGeolocation() {
	geolocationLayer.removeAllFeatures();
	geolocate.deactivate();
}

function onLocationupdated(e) {
	var style = {
		fillColor: 'rgb(0,158,111)',
		fillOpacity: 0.3,
		strokeWidth: 0
	};

	geolocationLayer.removeAllFeatures();
	var circle = new OpenLayers.Feature.Vector(
		OpenLayers.Geometry.Polygon.createRegularPolygon(
			new OpenLayers.Geometry.Point(e.point.x, e.point.y),
			e.position.coords.accuracy/2,
			40,
			0
		),
		{},
		style
	);
	geolocationLayer.addFeatures([
		circle,
		new OpenLayers.Feature.Vector(
			e.point,
			{},
			{
				graphicName: 'circle',
				strokeColor: '#fff',
				fillColor: 'rgb(0,158,111)',
				strokeWidth: 2,
				fillOpacity: 1,
				pointRadius: 10
			}
		)
	]);
	if (firstGeolocation) {
		map.zoomToExtent(geolocationLayer.getDataExtent());
		pulsate(circle);
		firstGeolocation = false;
		// this.bind = true;
		this.bind = false;
	}
	
	// Koordinate ins Routing-Startfeld eintragen
	var routingStartField = dom.byId('startTxtfield');
	routingStartField.value = 'Aktueller Standpunkt';
	
	var locationPoint = new OpenLayers.Geometry.Point(e.point.x, e.point.y).transform(
			map.getProjectionObject(), // transform from WGS 1984
			new OpenLayers.Projection("EPSG:4326") // to Spherical Mercator Projection
		);

	var routingCoordsStartDiv = dom.byId('startTxtfieldCoords');
	routingCoordsStartDiv.value = locationPoint.y + "," + locationPoint.x;
}*/

 function getPosition(){

   if (navigator.geolocation) {
   		alert("GEOLOC");
       var pos = navigator.geolocation.getCurrentPosition(success, showError, {
  enableHighAccuracy: true,
  timeout: 120000,
  maximumAge: 120000
});
   }
   else{
     alert("GeoLocation wird vom Browser nicht unterstützt");
     jumpTo(startLon, startLat, 15 - zoomOffset);
   }

 }

 function success(pos) {
	
	 var crd = pos.coords;
	 lon = crd.longitude;
	 lat = crd.latitude;
	 alert(lat+" "+lon);
 };

 function showError(error)
 {
 	var x = "";
   switch(error.code)
   {
     case error.PERMISSION_DENIED:
     x = "User denied the request for Geolocation.";
     break;
     case error.POSITION_UNAVAILABLE:
     x = "Location information is unavailable.";
     break;
     case error.TIMEOUT:
     x = "The request to get user location timed out.";
     break;
     case error.UNKNOWN_ERROR:
     x = "An unknown error occurred.";
     break;
   }
   if (navigator.notification) {
	   navigator.notification.alert(x);
	} else {
		alert(x);
	}
 }