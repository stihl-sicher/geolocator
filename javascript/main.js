var map;
var config;
var dom;
var request;
var selectControl;
var Dialog;
var restrictedExtent;
var infoDialog;
var routingLayer1;
var routingLayer2;
var datingEditLayer;
var circleLayer;
var circleLabelLayer;
var highlightLayer;
var geolocationLayer;
var datingMessage;
var query;
var on;
var restStore;
var mandant;
var powerLinkId = "";
var domClass;
var allResolutionsArray = [/*5*/4891.9698095703125,/*6*/2445.9849047851562,/*7*/1222.9924523925781,/*8*/611.4962261962891,/*9*/305.74811309814453,/*10*/152.87405654907226,/*11*/76.43702827453613,/*12*/38.218514137268066,/*13*/19.109257068634033, /*14*/9.554628534317017, /*15*/4.777314267158508,/*16*/2.388657133579254,/*17*/1.194328566789627,/*18*/0.5971642833948135,/*19*/0.29858214169740677,/*20*/0.14929107084870338];
var usedResolutionsArray = [];
var startLat, startLon;


require([
	'dojo/ready',
	'dojo/dom',
	'dojo/dom-style',
	'dojo/request',
	'dijit/Dialog',
	'dojo/io-query',
	'dojo/query',
	'dojo/on',
	'dojo/keys',
	'dojo/store/JsonRest',
    'dijit/form/ComboBox',
	'dojox/validate',
	'dojo/dom-class',
	
	'dijit/form/TextBox',	
	'dojo/NodeList-dom',
	'dojo/domReady'
],
function (
ready,
dom_,
domStyle,
request_,
Dialog_,
ioQuery,
query_,
on_,
keys,
JsonRest,
ComboBox,
validate,
domClass_
) {
	dom = dom_;
	request = request_;
	Dialog = Dialog_;
	query = query_;
	on = on_;
	domClass = domClass_;
	// =====
	// ready
	// =====
	ready(function() {
	
		getUrlParameter();
		loadConfig();
		
		// =========================================================================================
		
		// ======================
		// URL-Parameter auslesen
		// ======================
		function getUrlParameter() {
			paramsObj = ioQuery.queryToObject(decodeURIComponent(dojo.doc.location.search.slice(1)));
			
			if (paramsObj.mandant) {
				mandant = paramsObj.mandant;
			} else {
				mandant = "uff";
			}
		}		
		
		// ===================
		// Konfiguration laden
		// ===================
		function loadConfig() {
			request.post(serverUrlViewer + 'php/ajax_control.php', {
				data: {
					functionId: '0',
					mandant: mandant
				},
		    	// Parse data from JSON to a JavaScript object
		        handleAs: "json"
		    }).then(function(data){
				config = data;
				
				// Parameter ueber die Url...
				checkUrlParameter();
				
				initializeMap();
			},
		    function(error){
		    	// Display the error returned
		        alert('Fehler beim Laden der Konfiguration aus der Datenbank!');
		    });
		}
		
		// =======================
		// URL-Parameter auswerten
		// =======================
		function checkUrlParameter() {			
			// ----------
			// Zentrieren
			// ----------
			if (paramsObj.lat && paramsObj.lon) {
				config.lat = paramsObj.lat; // ueberschreiben
				config.lon = paramsObj.lon; // ueberschreiben
			}
			
			// ------
			// Zoomen
			// ------
			if (paramsObj.zoom) {
				config.zoom = parseInt(paramsObj.zoom) + parseInt(config.zoomMin); // ueberschreiben
			}
			
			// ------------------
			// Minimale Zoomstufe
			// ------------------
			if (paramsObj.zoomMin) {
				config.zoomMin = paramsObj.zoomMin;
			}
			// ------------------
			// Maximale Zoomstufe
			// ------------------
			if (paramsObj.zoomMax) {
				config.zoomMax = paramsObj.zoomMax;
			}
			
			// -------------
			// Kartenauswahl
			// -------------
			if (paramsObj.mty) {
				config.maptype = paramsObj.mty;
			}
			
			// --------------
			// Dating-Message
			// --------------
			if (paramsObj.m) {
				datingMessage = paramsObj.m;
			}
			
			// ----------
			// Power-Link
			// ----------
			if (paramsObj.mid) {
				powerLinkId = (paramsObj.mid).toString();
			}

			// if (paramsObj.es) {
				// preselectedCats = paramsObj.es;
			// }

			// if (paramsObj.ew) {
				// preselectedWMS = paramsObj.ew;
			// }
		}

		// =========================
		// Initialisierung der Karte
		// =========================
		function initializeMap() {
			startLon = parseFloat(config.lon);
			startLat = parseFloat(config.lat);
			
			// Layer-Resolutions bestimmen
			for (i = config.zoomMin - 5; i < allResolutionsArray.length - (20 - config.zoomMax); i++) {
				usedResolutionsArray.push(allResolutionsArray[i]);
			}
			zoomOffset = config.zoomMin;
			
			// Sprache setzen
			OpenLayers.Lang.setCode('de');

			// Geolocate-Control initialisieren
			var geolocate = new OpenLayers.Control.Geolocate({
				geolocationOptions: {
					enableHighAccuracy: false,
					maximumAge: 0,
					timeout: 7000
				}
			});
			
			// =============================
			// Begrenzung auf den Ausschnitt
			// =============================
			var bbox_split = unescape(config.projectBBox).split(',');
			restrictedExtent = createBounds(parseFloat(bbox_split[0]),parseFloat(bbox_split[1]),parseFloat(bbox_split[2]),parseFloat(bbox_split[3]));

			// *******************
			// Map-Objekt erzeugen
			// *******************
			map = new OpenLayers.Map('maparea', {
				units: 'km',
				// fallThrough: true,
				projection: new OpenLayers.Projection("EPSG:900913"),
				displayProjection: new OpenLayers.Projection("EPSG:4326"),
				controls: [
					new OpenLayers.Control.Navigation(), 
					new OpenLayers.Control.Attribution(),
					geolocate
				],

				maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34, 20037508.34, 20037508.34),
				
				layers: [ 
					// Baselayer erstellen und zur Map hinzufügen
					new OpenLayers.Layer.OSM(
						"OSM",
						null,
						{
							transitionEffect: 'resize',
							isBaseLayer: true,
							zoomOffset: parseInt(config.zoomMin),
							resolutions: usedResolutionsArray
						}
					)
					,					
					new OpenLayers.Layer.XYZ(
						"OEPNV",
						["http://tile.memomaps.de/tilegen/${z}/${x}/${y}.png"],
						{
							isBaseLayer: true,
							sphericalMercator: true,
							zoomOffset: parseInt(config.zoomMin),
							resolutions: usedResolutionsArray
						}
					)
					,
					new OpenLayers.Layer.XYZ(
						"OpenTopoMap",
						["http://opentopomap.org/${z}/${x}/${y}.png"],
						{
							isBaseLayer: true,
							sphericalMercator: true,
							zoomOffset: 8,
							resolutions: [/*8*/611.4962261962891,/*9*/305.74811309814453,/*10*/152.87405654907226,/*11*/76.43702827453613,/*12*/38.218514137268066,/*13*/19.109257068634033, /*14*/9.554628534317017, /*15*/4.777314267158508]
						}
					)
					,
					new OpenLayers.Layer.Google(
						"GoogleHybrid",
						{
							type: google.maps.MapTypeId.HYBRID,
							minZoomLevel: parseInt(config.zoomMin),
							maxZoomLevel: parseInt(config.zoomMax)
						}
					)
					,
					new OpenLayers.Layer.Google(
						"GoogleRoadmap",
						{
							type: google.maps.MapTypeId.ROADMAP,
							minZoomLevel: 3,
							maxZoomLevel: 15
						}
					)
					,					
					new OpenLayers.Layer.XYZ(
						"Tiles", "http://demo.googis.de/3v/tiles/eggenfelden/${z}/${x}/${y}.png",
						{
							transitionEffect: 'resize',
							isBaseLayer: true,
							zoomOffset: parseInt(config.zoomMin),
							resolutions: usedResolutionsArray
						}
					)
					,
					new OpenLayers.Layer.Google(
						"GooglePhysical",
						{
							type: google.maps.MapTypeId.TERRAIN,
							minZoomLevel: 3,
							maxZoomLevel: 15
						}
					),
					new OpenLayers.Layer.Bing({
						key: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf",
						type: "Aerial",
						name: "BingLuftbild",
						// transitionEffect: 'resize',
						isBaseLayer: true
						// ,
						// minZoomLevel: 3,
						// maxZoomLevel: 15
					})
				]

			});
			// tmp
			// siehe style.css->olControlOverviewMapExtentRectangle
			map.Z_INDEX_BASE['Popup'] = 10000;
			
			// ================
			// Kartentyp setzen
			// ================
			 setBaselayerByName(config.maptype);
			
			// =========================
			// Routing-Layer hinzufuegen
			// =========================
			var routingStyle1 = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style({
						strokeColor: '#ff0000',
						strokeWidth: 5,
						strokeOpacity: 0.6,
						externalGraphic: serverUrlViewer + "framework/routing_a.png", 
						graphicOpacity: 1.0,
						graphicWidth: 22,
						graphicHeight: 40,
						// graphicZIndex: 1,
						graphicXOffset: -11,
						graphicYOffset: -40
					})
				});

			routingLayer1 = new OpenLayers.Layer.Vector("Routing Layer 1",{
					styleMap: routingStyle1,
					// rendererOptions: { zIndexing: true} 
				});
				
			var routingStyle2 = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style({
						externalGraphic: serverUrlViewer + "framework/routing_b.png", 
						graphicOpacity: 1.0,
						graphicWidth: 22,
						graphicHeight: 40,
						// graphicZIndex: 1,
						graphicXOffset: -11,
						graphicYOffset: -40
					})
				});

			routingLayer2 = new OpenLayers.Layer.Vector("Routing Layer 2",{
					styleMap: routingStyle2,
					// rendererOptions: { zIndexing: true} 
				});
	
			map.addLayers([routingLayer1, routingLayer2]);
			
			// ==============================
			// Dating-Point-Layer hinzufuegen
			// ==============================
			var datingStyle = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style({
						externalGraphic: serverUrlViewer + "framework/datingMarker_on.png", 
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
					})
				});
			
			datingEditLayer = new OpenLayers.Layer.Vector("Dating Edit Layer", {
					styleMap: datingStyle
				});

			map.addLayers([datingEditLayer]);
			
			datingDisplayLayer = new OpenLayers.Layer.Vector("Dating Display Layer", {
					styleMap: datingStyle
				});

			map.addLayers([datingDisplayLayer]);
			layerArray.push(datingDisplayLayer); // selektiebar machen

			// =====================================
			// Layer fuer Umkreisanzeige hinzufuegen
			// =====================================
			var circleStyle = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style({
						externalGraphic: serverUrlViewer + "framework/pin.png", 
						graphicOpacity: 1.0,
						graphicWidth: 15,
						graphicHeight: 23,
						// graphicZIndex: 1,
						graphicXOffset: -8,
						graphicYOffset: -23
					})
				});
				
			var circleLabelStyle = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style({
						label : "${name}",                    
						fontColor: "#ff0000",
						fontSize: "14px",
						fontFamily: "Courier New, monospace",
						fontWeight: "bold",
						fontOpacity: 0.8,
						labelAlign: "cb",
						labelXOffset: 0,
						labelYOffset: 0,
						labelOutlineColor: "white",
						labelOutlineWidth: 3,
						angle: "${angle}"
					})
				});
			
			circleLayer = new OpenLayers.Layer.Vector('Circle Layer', {
				styleMap: circleStyle
			});
			
			circleLabelLayer = new OpenLayers.Layer.Vector('Circle Label Layer', {
				styleMap: circleLabelStyle,
				renderers: ["MySVG"]
			}); 
			map.addLayers([circleLayer, circleLabelLayer]);
			
			// ===========================
			// Highlight-Layer hinzufuegen
			// ===========================
			highlightLayer = new OpenLayers.Layer.Vector("Higlight Layer", {
				// rendererOptions: { zIndexing: true}
			});

			map.addLayers([highlightLayer]);
			layerArray.push(highlightLayer); // selektiebar machen
			
			// =============================
			// Geolocation-Layer hinzufuegen
			// =============================
			geolocationLayer = new OpenLayers.Layer.Vector('Geolocation Layer');
			map.addLayers([geolocationLayer]);
			
			// ============================
			// Uebersichtskarte hinzufuegen
			// ============================
			var overviewMap = new OpenLayers.Control.OverviewMap({
				maximized: true,
				maximizeTitle: 'Übersichtskarte anzeigen',
				minimizeTitle: 'Übersichtskarte ausblenden',
				layers: [
					new OpenLayers.Layer.Bing({
						key: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf",
						type: "Road",
							name: "BingStrassenkarte"
					})
				],
				minRatio: 10
			});
			map.addControl(overviewMap);			
			
			// Festsetzen der Begrenzung
			map.restrictedExtent = restrictedExtent;
			
			// ====================
			// Controls hinzufuegen
			// ====================
			initControls(); // -> control.js
			
			// ====================
			// Listener hinzufuegen
			// ====================
			// ---
			// DOM
			// ---
			window.onresize = function()
			{
				setTimeout( function() { map.updateSize();} );
			}

			// ----------
			// OpenLayers
			// ----------
			map.events.register('zoomend', map, onZoomend);
			map.events.register("moveend",map,function() {
				updateLinkForPrint(null);
			});
			
			// ----
			// dojo
			// ----
			// ROUTING
			var routingStartField = dom.byId('startTxtfield');
			var routingDestField = dom.byId('destTxtfield');
			on(routingStartField, "keypress", function(event) {
				if (event.keyCode == keys.ENTER) {
					checkStartRouting();
				} else {
					clearRoutingCoordFieldStart();
				}
			});
			on(routingDestField, "keypress", function(event) {
				if (event.keyCode == keys.ENTER) {
					checkStartRouting();
				} else {
					clearRoutingCoordFieldDest();
				}
			});
			
			
			// ===============================================
			// Verstecktes Koordinatenfeld fuer Routing leeren
			// ===============================================
			clearRoutingFields();
			
			infoDialog = new Dialog({
				title: "",
				content: "",
				class: "nonModal"
				// ,
				// style: ""
			});
			
			nachrichtDialog = new Dialog({
				title: "",
				content: "",
				class: "nachrichtDialog"
			});
			
			nachrichtDialog.connect(nachrichtDialog, "hide", function(e,f){
				onDialogClose(e,f); 
			});
			
			infoDialog.connect(infoDialog, "hide", function(e){
				onInfoDialogClose(e); 
			});
			
			fillKategorien();

			// =======================
			// Zum Startpunkt springen
			// =======================
			// Prioritaet bei der Auswahl des Startpunktes
			// 1. Powerlink
			// 2. Datingpoint
			// 3. Startpunkt aus config
			// if (powerLinkId.length == 0) {
				setStartPosition();
			// }
			
		}
		
		function setStartPosition() {
			var startzoom = parseFloat(config.zoom) - parseFloat(config.zoomMin);			
			jumpTo(startLon, startLat, startzoom);
		}
		
	});
	
	
});

// ******************
// Vektor-Layer (fix)
// ******************
// routingLayer1
// routingLayer2
// datingEditLayer
// datingDisplayLayer
// highlightLayer
