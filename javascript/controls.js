var controls;
var selectControl;
var highlightControl;
var measureControls;
var measureControl;
var datingControl;
var datingClickControl;
var circleControl;
var circleClickControl;
var isOverFeature;
var lastFeature;
var geolocate;


function initControls() {
	// ======
	// Messen
	// ======
	// style the sketch fancy
	var sketchSymbolizers = {
		"Point": {
			pointRadius: 4,
			graphicName: "square",
			fillColor: "white",
			fillOpacity: 1,
			strokeWidth: 1,
			strokeOpacity: 1,
			strokeColor: "#ff0000"
		},
		"Line": {
			strokeWidth: 3,
			strokeOpacity: 1,
			strokeColor: "#ff0000",
			strokeDashstyle: "dash"
		},
		"Polygon": {
			strokeWidth: 2,
			strokeOpacity: 1,
			strokeColor: "#ff0000",
			fillColor: "white",
			fillOpacity: 0.3
		}
	};

	var style = new OpenLayers.Style();
	style.addRules([
		new OpenLayers.Rule({symbolizer: sketchSymbolizers})
	]);

	var styleMap = new OpenLayers.StyleMap({"default": style});

	// allow testing of specific renderers via "?renderer=Canvas", etc
	var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
	renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

	measureControls = {
		line: new OpenLayers.Control.Measure(
			OpenLayers.Handler.Path, {
				persist: true,
				handlerOptions: {
					layerOptions: {
						renderers: renderer,
						styleMap: styleMap
					}
				}
			}
		),
		polygon: new OpenLayers.Control.Measure(
			OpenLayers.Handler.Polygon, {
				persist: true,
				handlerOptions: {
					layerOptions: {
						renderers: renderer,
						styleMap: styleMap
					}
				}
			}
		)
	};
	
	// zur Map hinzufuegen
	var measureControl;
	for(var key in measureControls) {
		measureControl = measureControls[key];
		measureControl.events.on({
			"measure": handleMeasurements
			,
			"measurepartial": handleMeasurements
		});
		map.addControl(measureControl);
	}
	
	// =============================================================================================

	// ================
	// Dating-Klick MAP
	// ================
	OpenLayers.Control.DatingClick = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},

		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.trigger
				}, this.handlerOptions
			);
		}, 

		trigger: onDatingpointSet
	});
	
	datingClickControl = new OpenLayers.Control.DatingClick();
    map.addControl(datingClickControl);
	
	// =============================================================================================

	// ================
	// Circle-Klick MAP
	// ================
	OpenLayers.Control.CircleClick = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},

		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.trigger
				}, this.handlerOptions
			);
		}, 

		trigger: onCircleSet
	});
	
	circleClickControl = new OpenLayers.Control.CircleClick();
    map.addControl(circleClickControl);
	
	// =============================================================================================
	
	// =========
	// MAP-Klick
	// =========
	OpenLayers.Control.MapClick = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},

		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.trigger
				}, this.handlerOptions
			);
		}, 

		trigger: onMapClicked
	});
	
	mapControl = new OpenLayers.Control.MapClick();
    map.addControl(mapControl);
	mapControl.activate();
	
	// =============================================================================================
	
	// ==============
	// Select-Control
	// ==============
	addMarkerSelectControl();
	
	// =============================================================================================
	
	// ===================
	// Geolocation-Control
	// ===================
	geolocate = new OpenLayers.Control.Geolocate({
		bind: false,
		geolocationOptions: {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 7000
		}
	});
	map.addControl(geolocate);
	
	geolocate.events.register("locationupdated",geolocate,function(e) {
		onLocationupdated(e);
	});
	geolocate.events.register("locationfailed",this,function() {
		OpenLayers.Console.log('Location detection failed');
	});
	
	// =============================================================================================
}

function onMapClicked() {
	hidePopup();
}


function addMarkerSelectControl() {
	// ===========================================
	// Steuerung um Features auswaehlen zu koennen
	// ===========================================
	// -----
	// HOVER
	// -----
	if (highlightControl) {
		map.removeControl(highlightControl);
	}
	highlightControl = new OpenLayers.Control.SelectFeature(layerArray, {
		hover: true,
		highlightOnly: true,
		renderIntent: 'temporary',
		eventListeners: {
			featurehighlighted: function(e) {onFeatureOver(e);}
		},
		callbacks: {
			out: function(event){
				onFeatureOut();
			}
		}
	});
	
	// ------
	// SELECT
	// ------
	if (selectControl) {
		map.removeControl(selectControl);
	}
	selectControl = new OpenLayers.Control.SelectFeature(layerArray, {
		onSelect: showPopup,
		onUnselect: hidePopup,
		multiple: false,
		toggle: true,
		clickout: true,
		hover: false
	});
	
	map.addControl(highlightControl);
	map.addControl(selectControl);
	highlightControl.activate();
	selectControl.activate();
}

function onFeatureOver(e) {
	isOverFeature = true;
	lastFeature = e.feature;
	setTimeout(function(){ checkIfHighlighted(e.feature) }, 1500);
}
function onFeatureOut() {
	isOverFeature = false;
}
function checkIfHighlighted(feature) {
	if (isOverFeature == true && lastFeature == feature) {
		selectControl.unselectAll();
		selectControl.select(feature);
	}
}

function stopMapDragging() {
	for (var i = 0; i< map.controls.length; i++) {
		if (map.controls[i].displayClass == 
								"olControlNavigation") {
			map.controls[i].deactivate();
		}
	}
}

function startMapDragging() {
	for (var i = 0; i< map.controls.length; i++) {
		if (map.controls[i].displayClass == 
								"olControlNavigation") {
			map.controls[i].activate();
		}
	}
}



