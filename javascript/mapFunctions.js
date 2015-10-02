// Hier werden alle Layer reingesteckt
var layerArray = new Array();
var clusterArray = new Array();
var directionsDisplay;
var directionsService;
var measureControls;
var measureControl = null;
var datingLonLat = null;
var circleLonLat = null;
var controlname = "";
var googleMap;
var activeRoutingId = "btnRoutCar";
var zoomOffset = 0;
var positionAtRoutingStart;
var zoomAtRoutingStart;
var emptyTileURL = "http://www.maptiler.org/img/none.png";
var mapMinZoom = 15;
var mapMaxZoom = 17;
var isCircleMode = false;
var isRoutingMode = false;
var activeLayer = null;
var activeMap = "Tiles";
var isInitialized = false;


function addPointLayers() {
	var zoom = map.getZoom();
	
	request.post(serverUrlViewer + 'php/mapElements/index.php', {
		data: {
			mandant: mandant,
			func: "getMarker",
			ebeneID: 0,
			foiID: 0,
			favID:0,
			zoom: zoom + parseInt(zoomOffset)
		},
    	// Parse data from JSON to a JavaScript object
        handleAs: "json"
    }).then(function(data){
		
		addPoints(data);
		
	},
    function(error){
    	// Display the error returned
        alert('Fehler beim Laden der Punktobjekte!');
    });
}

function addPoints(data) {
	for (var i=0; i < layerArray.length; i++)
	{
		if (layerArray[i].name != "Higlight Layer" && layerArray[i].name != "Dating Display Layer") {
			layerArray[i].removeAllFeatures();
		}
	}

	// ===============================================
	// Alle Punkte aus verschiedenen ukats durchlaufen
	// ===============================================
	for (var i = 0; i < data.items.length; i++) {
		var data_ = data.items[i];		
		var layername = data.items[i].ukat;		
		var vectorLayer = "";
		var clusterLayer = "";
		
		// -----------------------------------------------------------------------------------------		
		var markerStyle = new OpenLayers.StyleMap({  // Style für die POI's
			"default": new OpenLayers.Style({ 
				externalGraphic: data.items[i].file + "_off.png",
				graphicOpacity: 1.0,
				graphicWidth: 32,
				graphicHeight: 46,
				// graphicZIndex: 1,
				graphicXOffset: -16,
				graphicYOffset: -46,
				backgroundGraphic: "icons/schatten.png",
				backgroundWidth: 35,
				backgroundHeight: 52,
				backgroundXOffset: -16,
                backgroundYOffset: -46
			}),       
			"select": new OpenLayers.Style({ 
				// externalGraphic: data.items[i].file + "_on.png", 
				// graphicOpacity: 1.0,
				// graphicWidth: 32,
				// graphicHeight: 46,
				// // graphicZIndex: 1
				// graphicXOffset: -16,
				// graphicYOffset: -46
			})
		});
		
		var clusterStyle = new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({ 
				externalGraphic: serverUrlViewer + "framework/plus.png", 
				graphicWidth: 10,
				graphicHeight: 10,
				// graphicZIndex: 10,
				graphicXOffset: 10,
				graphicYOffset: -19
			})
			,
			"select": new OpenLayers.Style({ 
				externalGraphic: serverUrlViewer + "framework/plus.png", 
				graphicWidth: 10,
				graphicHeight: 10,
				// graphicZIndex: 10,
				graphicXOffset: 10,
				graphicYOffset: -19
			})
			,
			"temporary": new OpenLayers.Style({ 
				externalGraphic: serverUrlViewer + "framework/plus.png", 
				graphicWidth: 10,
				graphicHeight: 10,
				// graphicZIndex: 10,
				graphicXOffset: 10,
				graphicYOffset: -19
			})
		});
		// -----------------------------------------------------------------------------------------
		
		vectorLayer = getLayerInArrayById(layername);
		clusterLayer = getLayerInArrayById(layername + '_cluster');
		if (vectorLayer == null)
		{
			// Layer noch nicht in Array vorhanden -> erzeugen und in Array stecken
			vectorLayer = new OpenLayers.Layer.Vector(layername,{
				styleMap: markerStyle
				// ,
				// eventListeners: {
					// // featureover: function(e) {
						// // alert('gehovert');
					// // },
					// featureclick: function(e) {showPopup(e.feature);}
				// }
			});
			
			layerArray.push(vectorLayer);
			
			map.addLayer(vectorLayer);
		}
		if (clusterLayer == null)
		{
			// Layer noch nicht in Array vorhanden -> erzeugen und in Array stecken
			clusterLayer = new OpenLayers.Layer.Vector(layername + "_cluster",{
				styleMap: clusterStyle,
				// rendererOptions: { zIndexing: true} 
			});			
			
			layerArray.push(clusterLayer);
			
			map.addLayer(clusterLayer);
		}
		
		// vectors.setVisibility(false);

		// ===========================
		// Zeichnen des Cluster-Bildes
		// ===========================
		if ((data.items[i].id).indexOf('|') > -1)
		{
			var clusterPoint = new OpenLayers.Geometry.Point(data.items[i].lon, data.items[i].lat).transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
					map.getProjectionObject() // to Spherical Mercator Projection
			);
			clusterLayer.addFeatures([new OpenLayers.Feature.Vector(clusterPoint)]);
		}
		
		// ====================
		// Zeichnen des Markers
		// ====================
		var point = new OpenLayers.Geometry.Point(data.items[i].lon, data.items[i].lat).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
		);
		// =========================================================================================
		// Hier werdem dem Marker CUSTOM ATTRIBUTES mitgegeben
		// =========================================================================================
		var pointAttributes = {
			'anzeigename':data.items[i].info,
			'id':data.items[i].id,
			'image':data.items[i].file,
			'type':data.items[i].type,
			'lat':data.items[i].lat,
			'lon':data.items[i].lon,
			'file':data.items[i].file
		};
		// =========================================================================================

		var vector = [new OpenLayers.Feature.Vector(point,pointAttributes)];
		vectorLayer.addFeatures(vector);	
	}
	
	addMarkerSelectControl();
}

function addDatingPoint(lonLat, message) {
	var point = new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
		);
		
	var pointAttributes = {'anzeigename': message, 'id': '-1', 'image':'framework/datingMarker'};
	
	var feature = new OpenLayers.Feature.Vector(point,pointAttributes);
	
	var features = [feature];
	datingDisplayLayer.addFeatures(features);
	
	selectControl.select(feature);
}

function loadPolyline(ukats) {
	
}

function drawPolyline(layer, data) {
	var polylinePoints = [];
	for (var i = 0; i < data.length; i++) {
		var coord = data[i];
		var point = new OpenLayers.Geometry.Point(coord.lng(), coord.lat());
		// transform from WGS 1984 to Spherical Mercator
		point.transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
		);
		polylinePoints.push(point);
	}

	var polyline = new OpenLayers.Geometry.LineString(polylinePoints);
	var polylineFeature = new OpenLayers.Feature.Vector(polyline);
	layer.addFeatures([polylineFeature]);
}

function loadPolygon(ukats) {
	
}

function drawPolygon(data) {
	
}

// =================================================================================================

// ======================
// Layer-Array Funktionen
// ======================
function getLayerInArrayById(id) {
	for (var i = 0; i < layerArray.length; i++) {
		if (id == layerArray[i].name) {
			return layerArray[i];
			break;
		}
	}
	return null;
}

function removeLayer(name) {
	var layer = getLayerInArrayById(name);
	if (layer != null) {	
		layer.removeAllFeatures();
		var clusterLayer = getLayerInArrayById(name + "_cluster");	
		clusterLayer.removeAllFeatures();
	}
}

function removeAllLayers() {
	for (var i = 0; i < layerArray.count; i++) {
		if (layerArray[i]) {
			layerArray[i].removeAllFeatures();
		}
	}
}

// =================================================================================================

// ===============
// TOOL-FUNKTIONEN
// ===============

// ======
// Messen
// ======
function handleMeasurements(event) {
	var geometry = event.geometry;
	var units = event.units;
	var order = event.order;
	var measure = event.measure;
	var out = "";
	if(order == 1) {
		// Strecke
		if (measure > 10000) {
			measure = measure / 1000;
			units = "km";
		}
		out += measure.toFixed(1) + " " + units;
	} else {
		// Flaeche
		if (measure > 1000000) {
			measure = measure / 1000000;
			units = "km";
		}
		out += measure.toFixed(1) + " " + units + "<sup>2</" + "sup>";
	}
	
	dom.byId('tfMWResult').innerHTML = out;
}

function startMeasuring(controlname_) {
	controlname = controlname_;
	if (measureControl) {
		measureControl.deactivate();
	}
	if (isCircleMode) {
		stopCircleMode();
	}
	
	measureControl = measureControls[controlname_];
	measureControl.geodesic = true;
	measureControl.activate();
	// var button = dom.byId('btnMWStrecke');
}

function resetMeasuring() {
	if (measureControl) {
		measureControl.cancel();
		if (controlname = "line") {
			dom.byId('tfMWResult').innerHTML = "0.0 m";
		} else if (controlname = "polygone") {
			dom.byId('tfMWResult').innerHTML = "0.0 m<sub>2</sub>";
		}
	}
	if (isCircleMode) {
		circleLayer.removeAllFeatures();
   		circleLabelLayer.removeAllFeatures();
	}
}

function stopMeasuring(fChange) {
	// Alle Messwerkzeuge auf inaktiv setzen
	removeMWActiveClasses();

	if (measureControl) {
		measureControl.deactivate();
	}
	measureControl = undefined;
	if (!fChange) {
		closeMW();
	}
}

// =======
// Routing
// =======
function initRoutingDialog() {
	googleMap = new google.maps.Map(dom.byId("routingMapDiv"), {
		center : new google.maps.LatLng(0, 0),
		zoom : 12,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		zoomControl : false,
		mapTypeControl : false,
		streetViewControl : false,
		overviewMapControl : false,
		draggable: false,
		scrollwheel: false,
		disableDoubleClickZoom: true
	});
	
	gmap2_dynmap(googleMap);	
	function gmap2_dynmap(gmap2) {
		var Styles = [
			{
				featureType: "poi.business",
				stylers: [
					{ visibility: "off" }
				]
			},
			{
				featureType: "poi.medical",
				stylers: [
					{ visibility: "off" }
				]
			}			
		]; 
		gmap2.setOptions({styles: Styles}); 
	}
	
	var center_ol = map.getCenter().transform(
		map.getProjectionObject(), // to Spherical Mercator Projection
		new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
	);
	var center_google = new google.maps.LatLng(center_ol.lat, center_ol.lon);
	googleMap.setCenter(center_google);
}

function checkStartRouting() {
	var routingStartField = dom.byId('startTxtfield');
	var routingDestField = dom.byId('destTxtfield');
	var routingStartFieldCoords = dom.byId('startTxtfieldCoords');
	var routingDestFieldCoords = dom.byId('destTxtfieldCoords');
	if (routingStartField.value.length > 0) {
		// if (routingDestField.value.length > 0 || routingDestFieldCoords.value.length > 0) {
		if (routingDestField.value.length > 0) {
			startRouting();
		}  else {
			routingDestField.focus();
		}
	} else {
		routingStartField.focus();
	}
}

function clearRoutingFieldStart() {
	var routingStartField = dom.byId('startTxtfield');
	routingStartField.value = "";
}

function clearRoutingCoordFieldStart() {
	var routingStartFieldCoords = dom.byId('startTxtfieldCoords');
	routingStartFieldCoords.value = "";
}

function clearRoutingFieldDest() {
	var routingDestField = dom.byId('destTxtfield');
	routingDestField.value = "";
}

function clearRoutingCoordFieldDest() {
	var routingDestField = dom.byId('destTxtfieldCoords');
	routingDestField.value = "";
}

function clearRoutingFields() {
	clearRoutingFieldStart();
	clearRoutingCoordFieldStart();
	clearRoutingFieldDest();	
	clearRoutingCoordFieldDest();
}

function startRouting() {
	isRoutingMode = true;

	var routingDiv = dom.byId('routingContent');
	
	// Google-Map leeren
	clearRoutingResults_google();
	// Wegbeschreibungs-Div leeren
	routingDiv.innerHTML = "";
	
	var startString = dom.byId("startTxtfield").value;
	var startCoordsString = dom.byId("startTxtfieldCoords").value;
	if (startCoordsString.length > 0)
	{
		// Wenn Koordinaten vorhanden -> diese benutzen
		startString = startCoordsString;
	}
	
	var destString = dom.byId("destTxtfield").value;
	var destCoordsString = dom.byId("destTxtfieldCoords").value;
	if (destCoordsString.length > 0)
	{
		// Wenn Koordinaten vorhanden -> diese benutzen
		destString = destCoordsString;
	}
	
	directionsDisplay = new google.maps.DirectionsRenderer();
	directionsService = new google.maps.DirectionsService();
	directionsDisplay.setMap(googleMap);
	directionsDisplay.setPanel(dom.byId("routingContent"));
	
	var travelmode = google.maps.TravelMode.DRIVING;
	if (activeRoutingId == "btnRoutCar") {
		travelmode = google.maps.TravelMode.DRIVING;
	} else if (activeRoutingId == "btnRoutWalk") {
		travelmode = google.maps.TravelMode.WALKING;
	} else if (activeRoutingId == "btnRoutBike") {
		travelmode = google.maps.TravelMode.BICYCLING;
	} else if (activeRoutingId == "btnRoutBus")	{
		travelmode = google.maps.TravelMode.TRANSIT;
	}
	
	var request = {
		origin : startString,
		destination : destString,
		travelMode : travelmode
	};
	directionsService.route(request, function (result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
			
			var routePath = result.routes[0].overview_path;
			var routeBounds_google = result.routes[0].bounds;
			// GOOGLE-Bounds !!!
			routeBounds_google = result.routes[0].bounds;
			var ne = routeBounds_google.getNorthEast();
			var sw = routeBounds_google.getSouthWest();  
		  
			routeBounds_ol = new OpenLayers.Bounds();
			
			routeBounds_ol.extend(new OpenLayers.LonLat(ne.lng(), ne.lat()).transform(
						  new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
						  map.getProjectionObject() // to Spherical Mercator Projection
						  ));
			routeBounds_ol.extend(new OpenLayers.LonLat(sw.lng(), sw.lat()).transform(
						  new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
						  map.getProjectionObject() // to Spherical Mercator Projection
						  ));	
					
			showRoutingInMap(routePath, routeBounds_ol);
		}
	});
}

function showRoutingInMap(routePath, routeBounds) {
	clearTemps();
	
	// Routing-Karte aktivieren
	setBaselayerByName('OpenTopoMap');
	
	if (routePath != null) {
		drawPolyline(routingLayer1, routePath, true);
		
		// Start ...
		var point = new OpenLayers.Geometry.Point(routePath[0].lng(), routePath[0].lat()).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
		);
		routingLayer1.addFeatures([new OpenLayers.Feature.Vector(point)]);
		// ... und Ziel markieren
		var point = new OpenLayers.Geometry.Point(routePath[routePath.length-1].lng(), routePath[routePath.length-1].lat()).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
		);
		routingLayer2.addFeatures([new OpenLayers.Feature.Vector(point)]);
		
		// Begrenzung aufheben
		restrictionOff();
		map.zoomToExtent(routeBounds, false);
		// Noch einmal rauszoomen, damit die Route zwischen die Fenster passt
		map.zoomOut();
	}	
}

function stopRouting() {
	if (isRoutingMode) {
		// Routenpolygon loeschen
		clearRoutingResults_ol();
		
		// Begrenzung einschalten
		restrictionOn();
		
		isRoutingMode = false; 
	}
}

function clearRoutingResults_ol() {
	if (isRoutingMode) {
		// Routing-Layer leeren
		try {
			routingLayer1.removeAllFeatures();
			routingLayer2.removeAllFeatures();
		} catch (e) {}
	}
}

function clearRoutingResults_google() {
	if (directionsDisplay) {
		directionsDisplay.setMap(null);
		directionsDisplay = null;
	}
}

function setRoutingType(id) {
	var button = dom.byId(id);
	dojo.query("#btnRoutCar").removeClass("aktiv");
	dojo.query("#btnRoutWalk").removeClass("aktiv");
	dojo.query("#btnRoutBike").removeClass("aktiv");
	dojo.query("#btnRoutBus").removeClass("aktiv");
	dojo.query("#" + id).addClass("aktiv");
	activeRoutingId = id;
	
	// direkt neu Routen, wenn Felder gefuellt
	checkStartRouting();
}

// ============
// Dating-Point
// ============
function startDatingMode() {
	stopCircleMode();
	stopMeasuring();
	
	closeTooldivAtMobile();
	
	var content = "";
	content += "<div>Klicken Sie in die Karte um einen Treffpunkt festzulegen</div>";
	// content += "<button id='buttonOne' data-dojo-type='dijit.form.Button' data-dojo-props='onClick:getDatingMessage' type='button' style='position:relative; top:5px;'>OK</button><span id='noDatingCoordsSpan'>Bitte klicken Sie erst in die Karte um einen Treffpunkt festzulegen!</span>";
 	
	showInfo("Treffpunkt versenden", content, infoDialog);

	datingClickControl.activate();
}

function getDatingMessage() {
	if (datingLonLat != null) {
		content = "<div>Nachricht</div>";
		content += "<textarea id='datingTextarea' name='datingTextarea' data-dojo-type='dijit/form/Textarea' style='width:234px;'></textarea>";
		content += "<div><button id='buttonTwo' data-dojo-type='dijit.form.Button' data-dojo-props='onClick:sendDatingPoint' type='button' style='position:relative; top:5px;'>OK</button></div>";
		
		showInfo("Treffpunkt versenden", content, nachrichtDialog);
		hideDialog(infoDialog);
	} else {
		// Warnung, dass kein Treffpunkt festgelegt wurde
		dom.byId('noDatingCoordsSpan').style['display'] = 'block';
	}
}

function stopDatingMode() {
	datingLonLat = null;	
	
	datingClickControl.deactivate();
	datingEditLayer.removeAllFeatures();
}

function sendDatingPoint() {
	if (datingLonLat != null) {
		// var encodedSelection = catMenu.getEncodedSelection();

		// var encodedLayerStrings = "";

		// for (var i = 0; i < wmsArray.length; i++) {
			// var els = wmsArray[i].getEncodedLayers();

			// if (els != "") {
				// if (encodedLayerStrings != "")
					// encodedLayerStrings += ",";
				// encodedLayerStrings += '{"t":"' + wmsArray[i].layers.title + '","a":' + els + '}';
				// if (debug) {
					// log.debug("EncodedLayers: " + els);
					// log.debug("an URL: " + wmsArray[i].layers.wms_url);
				// }

			// }
		// }

		// encodedLayerStrings = "[" + encodedLayerStrings + "]";
		// var b64LayerStrings = escape(Tool.encode(encodedLayerStrings));

		// //var mty = map.getMapTypeId();
		// var mty = 0;
		// var selectedIndex = 0;
		// if (mapCombo == null) {
			// mapCombo = document.getElementById("mapselect");
		// }
			// if (mapCombo.selectedIndex > -1) 
			// {
				// selectedIndex = mapCombo.selectedIndex;
			// }
		
		// mty = mapCombo.options[selectedIndex].value;
		var datingMessage = dom.byId('datingTextarea').value;
		if (!datingMessage.length > 0) {
			datingMessage = 'Meeting-Point';
		}
		datingMessage = Tool.encode(datingMessage);

		// var receiver = $F('receiver');

		var bodyHtml = "\nIhnen wurde ein REVILAK-Treffpunkt geschickt :\n\n";

		// bodyHtml += "http://" + server + "/" + mandant + "?dpLat=" + datingPoint_marker_set.getPosition().lat() + "&dpLon=" + datingPoint_marker_set.getPosition().lng() + "&z=" + map.getZoom() + "&m=" + escape(datingMessage) + "&mty=" + mty + "&ew=" + b64LayerStrings;
		bodyHtml += serverUrlViewer + "?lat=" + datingLonLat.lat + "&lon=" + datingLonLat.lon + "&zoom=1&m=" + escape(datingMessage);

		// if (encodedSelection != "") {
			// bodyHtml += "&es=" + encodedSelection;
		// }

		try {
			window.location.href = "mailto:" + "" + "?subject=REVILAK-Treffpunkt&body=" + escape(bodyHtml);
		} catch (e) {
			myAlert("Das Versenden ist aufgrund ihrer Sicherheitseinstellungen ihres Browers nicht möglich !");
		}

		hideDialog(nachrichtDialog);
		//stopDatingMode();
	} else {
		// Warnung, dass kein Treffpunkt festgelegt wurde
		dom.byId('noDatingCoordsSpan').style['display'] = 'block';
	}
}

// =======
// Umkreis
// =======
function toggleCircleMode() {
	if (isCircleMode) {
		stopCircleMode();
	} else {
		startMWCircle();
	}
}

function startCircleMode() {		
	var content = "";
	content += "<div>Klicken Sie in die Karte um Entfernungsringe um diesen Punkt einzublenden</div>";
	// content += "<button id='buttonOne' data-dojo-type='dijit.form.Button' data-dojo-props='onClick:hideDialog(infoDialog)' type='button' style='position:relative; top:5px;'>OK</button>";
 	
	//showInfo("Enternungsringe", content, infoDialog);
	
	circleClickControl.activate();
	
	isCircleMode = true;
}

function stopCircleMode() {
	// Alle Messwerkzeuge auf inaktiv setzen
	removeMWActiveClasses();

	circleLonLat = null;	
	
	circleClickControl.deactivate();
	
	circleLayer.removeAllFeatures();
	circleLabelLayer.removeAllFeatures();
	
	hideDialog(infoDialog);
	
	isCircleMode = false;
	
	// activateSelectMode(); // *** Select-Mode ***	
}

function generateCircles(lon, lat, x, y) {
	// strokeWidth: 2,
	// strokeOpacity: 1,
	// strokeColor: "#009E6F",
	// fillColor: "white",
	// fillOpacity: 0.3
	circleLayer.addFeatures ([
		CIRCLE( {lat: lat, lon: lon, radius: 1000, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "#ffffff", fillOpacity: 0.3, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 900, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 800, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 700, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 600, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 500, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 400, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 300, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 200, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		CIRCLE( {lat: lat, lon: lon, radius: 100, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		// CIRCLE( {lat: lat, lon: lon, radius: 75, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.8, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		// CIRCLE( {lat: lat, lon: lon, radius: 50, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.8, fillColor: "white", fillOpacity: 0, nPoints: 80}),
		// CIRCLE( {lat: lat, lon: lon, radius: 25, strokeWidth: 1, strokeColor: "#ff0000", strokeOpacity: 0.8, fillColor: "white", fillOpacity: 0, nPoints: 80}),
			// CIRCLE( {lat: 50.2, lon: 6.8, radius: 5000, strokeColor: 'blue', nPoints: 5}),
			// CIRCLE( {lat: 50.6, lon: 7.3, radius: 20000, fillColor: 'green', strokeColor: 'black', strokeWidth: 6}),
			// CIRCLE( {lat: 50.3, lon: 6.6, radius: 50000, fillColor: 'blue', strokeColor: 'blue', nPoints: 100}),
			// CIRCLE( {lat: 50.5, lon: 7.0, radius: 100000, strokeColor: 'yellow', strokeOpacity: 0.5, strokeWidth: 30, fillOpacity: 0})
	]);
	
	drawTextOnCircle(x, y, lat, 200, 0);
	drawTextOnCircle(x, y, lat, 400, 0);
	drawTextOnCircle(x, y, lat, 600, 0);
	drawTextOnCircle(x, y, lat, 800, 0);
	drawTextOnCircle(x, y, lat, 1000, 0);
	
	drawTextOnCircle(x, y, lat, 200, 90);
	drawTextOnCircle(x, y, lat, 400, 90);
	drawTextOnCircle(x, y, lat, 600, 90);
	drawTextOnCircle(x, y, lat, 800, 90);
	drawTextOnCircle(x, y, lat, 1000, 90);
	
	drawTextOnCircle(x, y, lat, 200, 180);
	drawTextOnCircle(x, y, lat, 400, 180);
	drawTextOnCircle(x, y, lat, 600, 180);
	drawTextOnCircle(x, y, lat, 800, 180);
	drawTextOnCircle(x, y, lat, 1000, 180);
	
	drawTextOnCircle(x, y, lat, 200, 270);
	drawTextOnCircle(x, y, lat, 400, 270);
	drawTextOnCircle(x, y, lat, 600, 270);
	drawTextOnCircle(x, y, lat, 800, 270);
	drawTextOnCircle(x, y, lat, 1000, 270);
}

function drawTextOnCircle(center_x, center_y, lat, circle_radius, rotation) {
	var labelDirection_rad = -(rotation / 180 * Math.PI) + (Math.PI / 2);
	var radius = (circle_radius || 1000.0) / Math.cos (lat * 3.1415926535 / 180.0);
	var x = center_x + Math.cos (labelDirection_rad) * radius;
	var y = center_y + Math.sin (labelDirection_rad) * radius;
	
	// create a point feature
	var point = new OpenLayers.Geometry.Point(x, y);
	var labelPointFeature = new OpenLayers.Feature.Vector(point);
	labelPointFeature.attributes = {
		name: circle_radius,
		angle: rotation
	};
	circleLabelLayer.addFeatures([labelPointFeature]);
}


// =================================================================================================

// ===================
// Listener-Funktionen
// ===================
function onZoomend() {
	// hidePopup(); // Nur ausfuehren, wenn 
	
	// !!! wird direkt beim Start angesprochen !!!	
	addPointLayers();
}

function onActivelayerLoadend() {
	// =====================
	// BEI JEDEM FERTIGLADEN
	// =====================
	// ...

// =================================================================================================

	// ============================================================
	// HIER KOMMEN DIE SACHEN REIN, DIE NUR BEI DER INITIALISIERUNG
	// AUSGEFUEHRT WERDEN SOLLEN
	// ============================================================
	if (isInitialized == false) {
		// Prioritaet bei der Auswahl des Startpunktes
		// 1. Powerlink
		// 2. Datingpoint
		// 3. Startpunkt aus config
		if (powerLinkId.length > 0) {
			// =========
			// Powerlink
			// =========
			executePowerlink(powerLinkId, "FOI");
		} else {
			if (datingMessage) {
				var lonLat = new OpenLayers.LonLat(startLon, startLat);
				var message = Tool.decode(datingMessage);
				addDatingPoint(lonLat, message);
			}	
		}
		
		isInitialized = true;
	}
}

function onDatingpointSet(e) {
	var coords = map.getLonLatFromPixel(e.xy);
	
	datingLonLat = coords.clone().transform(
		map.getProjectionObject(), // to Spherical Mercator Projection
		new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
	);
	
	var point = new OpenLayers.Geometry.Point(coords.lon, coords.lat);
	
	datingEditLayer.removeAllFeatures();
	datingEditLayer.addFeatures([new OpenLayers.Feature.Vector(point)]);
	
	var noDatingCoordsSpan = dom.byId('noDatingCoordsSpan');
	if (noDatingCoordsSpan) {
		noDatingCoordsSpan.style['display'] = 'none';
	}
	
	getDatingMessage();
}

function onDatingpointMove(e) {
	var coords = e.geometry;
	
	var point = coords.clone().transform(
		map.getProjectionObject(), // to Spherical Mercator Projection
		new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
	);
	
	datingLonLat = new OpenLayers.LonLat(point.x, point.y);
}

function onCircleSet(e) {
	var coords = map.getLonLatFromPixel(e.xy);
	
	circleLonLat = coords.clone().transform(
		map.getProjectionObject(), // to Spherical Mercator Projection
		new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
	);
	
	var point = new OpenLayers.Geometry.Point(coords.lon, coords.lat);
	
	circleLayer.removeAllFeatures();
	circleLabelLayer.removeAllFeatures();
	
	// Umkreise zeichnen
	generateCircles(circleLonLat.lon, circleLonLat.lat, coords.lon, coords.lat);
	
	circleLayer.addFeatures([new OpenLayers.Feature.Vector(point)]);
}

// =================================================================================================

// =================
// Dialog-Funktionen
// =================
function hideInfoDialog() {
	infoDialog.hide();
}

function hideDialog(dialog) {
	dialog.hide();
}

function onDialogClose(e,f) {
	stopDatingMode();
}

function onDialogClose(e) {
	stopDatingMode();
}


function onInfoDialogClose(e) {
	if (typeof e !== "undefined") {
		stopDatingMode();
	}
}

// =================================================================================================

// ===============
// Hilfsfunktionen
// ===============
function roundTo(number, count) {
	return Math.round(number * Math.pow(10, count)) / Math.pow(10, count) ;
}

function jumpTo(lon, lat, zoom) {
	lonLat = new OpenLayers.LonLat(lon,lat).transform(
		new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		map.getProjectionObject() // to Spherical Mercator Projection
	);

	map.setCenter(lonLat,zoom);
}

function zoomIn() {
	map.zoomTo(map.getZoom() + 1);
}

function zoomOut() {
	map.zoomTo(map.getZoom() - 1);
}

function getViewerUrl() {
	return dojo.doc.location.href;
}

function getURL(bounds) { 
	bounds = this.adjustBounds(bounds);
	var res = this.getServerResolution();
	var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
	var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
	var z = this.getServerZoom();
	if (this.map.baseLayer.CLASS_NAME === 'OpenLayers.Layer.Bing') {
		z+=1;
	}

	var path = this.serviceVersion + "/" + this.layername + "/" + z + "/" + x + "/" + y + "." + this.type; 
	var url = this.url;
	if (OpenLayers.Util.isArray(url)) {
		url = this.selectUrl(path, url);
	}
	// // Hier Verschneidung mit Restriction
	// if (restrictedExtent.intersectsBounds(bounds) && (z >= mapMinZoom) && (z <= mapMaxZoom)) {
		return url + path;
	// } else {
		// return emptyTileURL;
	// }
} 

function showInfo(title, content, dialog) {
	dialog.set("content",content);
	dialog.set("title",title);
	dialog.show();
	dojo.query(".dijitDialogUnderlayWrapper").style("display","none");
}

function createBounds(lb_lon, lb_lat, rt_lon, rt_lat) {
	var extent = null;

	var leftBottom = new OpenLayers.LonLat(lb_lon,lb_lat) // Center of the map
	.transform(
	  new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	  new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
	)
	var rightTop = new OpenLayers.LonLat(rt_lon,rt_lat) // Center of the map
	.transform(
	  new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	  new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
	)
	extent = new OpenLayers.Bounds(leftBottom.lon, leftBottom.lat, rightTop.lon, rightTop.lat);
	
	return extent;
}

function setBaselayerByName(name, node) {
	if (map) {
		if (name == "OSM" || name == "Tiles" || name == "GoogleHybrid") {
			zoomOffset = parseInt(config.zoomMin);
		} else if (name == "BingLuftbild") {
			zoomOffset = 1;
		} else if (name == "GooglePhysical") {
			zoomOffset = 3;
		}
		if (node !== undefined) {
			require([ "dojo/dom", "dojo/query", "dojo/dom-class"], function(dom, query, domClass) {
				query(".mapButton").forEach(function(node, index, nodelist){
					domClass.remove(node, "selected");
				});
				domClass.add(node,"selected");
			});
		}

		activeLayer = map.getLayersByName(name)[0];
		if (name != 'OpenTopoMap') {
			activeMap = name;
		}
		
		// =====================
		// LISTENER registrieren
		// =====================
		if (activeLayer != null)
		{
			if (!activeLayer.events.listeners.loadend) {
				activeLayer.events.register('loadend', map, onActivelayerLoadend);
			}
		}
		// =====================
		
		map.setBaseLayer(activeLayer);
		
		if (name == "OSM" || name == 'Tiles' || name == 'BingLuftbild') {
			if (isRoutingMode) {
				stopRouting();
			} else {
				restrictionOn();
			}
		}
	}
}

function clearTemps() {
	// Alle Punkte deselektieren
	selectControl.unselectAll();
	
	// Routing-Layer leeren
	try {
		routingLayer1.removeAllFeatures();
		routingLayer2.removeAllFeatures();
	} catch (e) {}
	
	// Popups entfernen
	hidePopup();
}

function clearHighlights() {
	highlightLayer.removeAllFeatures();
}

function restrictionOn() {
	// Begrenzung der Map einschalten
	if (map) {
		// Evtl. auf letzen Punkt in der BBox springen
		if (zoomAtRoutingStart) {
			map.zoomTo(zoomAtRoutingStart - zoomOffset);
			zoomAtRoutingStart = null;
		}
		if (positionAtRoutingStart) {
			map.setCenter(positionAtRoutingStart);
			positionAtRoutingStart = null;
		}
		
		map.setOptions({restrictedExtent: restrictedExtent});
	}
}

function restrictionOff() {
	// Begrenzung der Map ausschalten
	if (map) {
		// Position und Zoomstufe merken, damit beim Beenden des Routings
		// wieder dorthin gesprungen werden kann
		positionAtRoutingStart = map.getCenter();
		zoomAtRoutingStart = map.getZoom() + zoomOffset;
	
		map.setOptions({restrictedExtent: null});
	}
}

function highlightFeature(data) {
	// clearHighlights();
	
	// =================================================================
	// Hier kann das jumpTo unterdrueckt werden
	var executeJumpTo = true;
	if (typeof(arguments[1])!="undefined") executeJumpTo = arguments[1];
	// =================================================================
	
	highlightPointFeature(data, executeJumpTo);
}

function highlightPointFeature(data, executeJumpTo) {
	var lon = data.lon;
	var lat = data.lat;
	
	// hidePopup(); 24.09.15
	
	highlightLayer.removeAllFeatures();
	
	// Kontrolle, ob keine Nullwerte ankommen
	if (lat > 40 && lon > 4) {
		// Hinspringen, wenn keine Parameter in der
		// Url uebergeben wurden
		if (executeJumpTo) {
			jumpTo(lon, lat, 17);
		}
		
		// Highligt-Marker setzen
		var lonLat = new OpenLayers.LonLat(lon, lat);
		
		var point = new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat).transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
					map.getProjectionObject() // to Spherical Mercator Projection
			);
			
		var pointAttributes = {
			'anzeigename': data.anzeigename,
			'image':data.file,
			'type': data.type,
			'id': data.id,
			'lat': data.lat,
			'lon': data.lon,
			'file': data.file
		};
		
		var feature = new OpenLayers.Feature.Vector(point,pointAttributes);
		
		var features = [feature];
		
		// Style aendern
		var highlightStyle = new OpenLayers.StyleMap({ 
		"default": new OpenLayers.Style({
				externalGraphic: data.file + "_off.png", 
				graphicOpacity: 1.0,
				graphicWidth: 32, //data.style.graphicWidth,
				graphicHeight: 46, //data.style.graphicHeight,
				// graphicZIndex: 1,
				graphicXOffset: -16,  //data.style.graphicXOffset
				graphicYOffset: -46,   //data.style.graphicYOffset
				backgroundGraphic: "icons/schatten.png",
				backgroundWidth: 35,
				backgroundHeight: 52,
				backgroundXOffset: -16,
				backgroundYOffset: -46
			}),
		"select": new OpenLayers.Style({
				externalGraphic: data.file + "_off.png", 
				graphicOpacity: 1.0,
				graphicWidth: 32, //data.style.graphicWidth,
				graphicHeight: 46, //data.style.graphicHeight,
				// graphicZIndex: 1,
				graphicXOffset: -16,  //data.style.graphicXOffset
				graphicYOffset: -46,   //data.style.graphicYOffset
				backgroundGraphic: "icons/schatten.png",
				backgroundWidth: 35,
				backgroundHeight: 52,
				backgroundXOffset: -16,
				backgroundYOffset: -46
			})
		});
		highlightLayer.styleMap = highlightStyle;
		
		highlightLayer.addFeatures(features);
		
		selectControl.select(feature);
	}
}





// tmp
function changeBanner() {
	nextBanner();
	setTimeout(changeBanner, 6000);
}
bannerCounter = -1;
// linkArray = ["http://www.luerzerhof.at/wellnessurlaub/beheizter-aussenpool-hallenbad/", "http://www.salute-club.de/", "http://www.hotel-gast.at/", "http://www.zweirad-kraft.de/", "http://www.freibad-schladen.de/"];
bannerArray = ["1.gif","2.jpg","3.gif","4.PNG","5.gif","6.png","7.gif","8.jpg","9.gif","10.png","11.gif","12.png","13.gif","14.png","15.gif","16.png","17.gif","18.jpg","19.gif","20.png","21.gif","22.png","23.png","24.png"];
function nextBanner() {
	bannerCounter++;
	var bannerIndex = bannerCounter % 24;
	var bannerDiv = dom.byId('banner');
	// bannerDiv.innerHTML = '<a href="' + linkArray[bannerIndex] + '" target="_blank"><img src="banner/' + (bannerIndex) + '"><a>';
	bannerDiv.innerHTML = '<img src="banner/' + (bannerArray[bannerIndex]) + '">';
}




