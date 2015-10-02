var routingBtn;
var markerIcon;
var popup;

// ========================================================
// Konfig
// ========================================================
// // Icongroesse
// var iconWidth = 32;
// var iconHeight = 46;
// var iconXOffset = -16;
// var iconYOffset = -46; // vorher 32 x 37
// ========================================================

function closestTo(number, set) {
	var closest = set[0];
	var prev = Math.abs(set[0] - number);
	for (var i = 1; i < set.length; i++) {
		var diff = Math.abs(set[i] - number);
		if (diff < prev) {
			prev = diff;
			closest = set[i];
		}
	}
	return closest;
}

OpenLayers.Popup.prototype.addRoutingButton = function(lat, lon, destText) {
	routingBtn = document.createElement('IMG');
	routingBtn.style['position'] = 'absolute';
	routingBtn.style['width'] = '32px';
	routingBtn.style['height'] = '32px';
	routingBtn.style['border'] = 0;
	routingBtn.style['cursor'] = 'pointer';
	routingBtn.src = 'framework/routing_btn.png';
	routingBtn.style['left'] = '-0px';
	routingBtn.style['top'] = '0px';
	routingBtn.title = 'Routing';
	routingBtn.onclick = function(){startRoutingWindow(); setRoutingDestCoords(lat, lon, destText); checkStartRouting();};
	
	routingBtn.style['-webkit-box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
	routingBtn.style['-moz-box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
	routingBtn.style['box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
};

OpenLayers.Popup.prototype.addMarkerIcon = function(image) {
	markerIcon = document.createElement('IMG');
	markerIcon.style['position'] = 'absolute';
	markerIcon.style['width'] = '32px';
	markerIcon.style['height'] = '46px';
	markerIcon.style['border'] = 0;
	markerIcon.style['cursor'] = 'pointer';
	markerIcon.src = image;
	markerIcon.style['left'] = '33px';
	markerIcon.style['top'] = '0px';
	// markerIcon.onclick = function(){startRoutingWindow(); setRoutingDestCoords(lat, lon, destText); checkStartRouting();};
	
	// markerIcon.style['-webkit-box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
	// markerIcon.style['-moz-box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
	// markerIcon.style['box-shadow'] = '3px 3px 3px 0px rgba(0,0,0,0.75)';
};

function setRoutingDestCoords(lat, lon, destText) {
	var routingDestDiv = dom.byId('destTxtfield');
	routingDestDiv.value = destText;
	
	var routingCoordsDestDiv = dom.byId('destTxtfieldCoords');
	routingCoordsDestDiv.value = lat + "," + lon;
}

function showPopup(feature) {
	hidePopup(); // Wichtig!!!
	
	popup = new OpenLayers.Popup.FramedCloud(
	'popup', // id
	new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y), // lonlat
	new OpenLayers.Size(200,200), // size 
	getContent(feature), // contentHTML
	new OpenLayers.Icon(
		'',
		new OpenLayers.Size(0, 0),
		new OpenLayers.Pixel(0, 0)
	), // anchor
	false, // closeBox
	null // closeBoxCallback
    );
    popup.minSize = new OpenLayers.Size(100, 32); // w h 
    popup.maxSize = new OpenLayers.Size(200, 200); // h auch in #popup_contentDiv anpassen
    popup.autoSize = true;

	popup.calculateNewPx = function(px){
		if(popup.size !== null){
			px = px.add(-49, -46);  // *1 Position des ganzen Popups verschieben -> popup.css#popup_GroupDiv
			return px;
		}
	};
	
	popup.getSafeContentSize = function(size){
		var new_h;
		var new_w;
		// make sure the popup isn't being sized too large or small.
		// if it is find which of the limits are closer.
		if(size.w > popup.maxSize.w || size.w < popup.minSize.w){
			new_w = closestTo(size.w, [popup.maxSize.w, popup.minSize.w]);
		} else {
			new_w = size.w;
		}
		if(size.h > popup.maxSize.h || size.h < popup.minSize.h){
			new_h = closestTo(size.h, [popup.maxSize.h, popup.minSize.h]);
		} else {
			new_h = size.h;
			// because of the way openlayers calculates the height for the internal content 
			// of a popup it's possible to adjust the width down to the min which pushes
			// the content down beyond the originally calculated height.
			// anything with a height greater than 113 seemed to have this problem so I'm just
			// adding a flat 35 pixels to keep the overflow from occurring
			// if(size.h > 113){
				// new_h += 35;
			// }
			if(size.h > 30){
				new_h += 22;
			}
			if(size.h < 30){
				new_h -= 10;
			}
		}
		// build a new size object with the new_h and new_w vars and return it.
		return new OpenLayers.Size(new_w + 38, new_h - 6);
	};

	// Koordinaten dem Routingbutton zuweisen
	var coord_latLon = feature.geometry.clone().transform(
		map.getProjectionObject(), // to Spherical Mercator Projection
		new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
	);
	
	var destText = "";
	var feature_text = feature.attributes.anzeigename;
	if(typeof feature_text != 'undefined'){
		if (feature_text.indexOf('|') > 0) {
			// Cluster-Marker
			destText = "Ausgewählter Punkt aus Karte";
		} else {
			destText = feature_text;
		}
		popup.addRoutingButton(roundTo(coord_latLon.y, 5), roundTo(coord_latLon.x, 5), destText);
		popup.addMarkerIcon(feature.attributes.image + "_on.png");

		// add the popup to the map
		map.addPopup(popup);

		// ======================
		// Popup-Groesse anpassen
		// ======================
		var popup_contentDiv = document.getElementById('popup_contentDiv');
		var popup_contentDiv_width = popup_contentDiv.style.width;
		popup_contentDiv_width = popup_contentDiv_width.replace("px", "");
		popup_contentDiv_width -= 52;  // *3 style.css -> .infobubbleContent.padding: 7px;
		popup_contentDiv.setAttribute('style', 'width:' + popup_contentDiv_width + 'px !important');
		
		// ==========================
		// Routing-Button hinzufuegen
		// ==========================
		var popupGroupDiv = document.getElementById('popup_GroupDiv');
		var popupDiv = document.getElementById('popup');
		popupDiv.insertBefore(routingBtn, popupGroupDiv);
		
		// =====================
		// Marker-Icon einfuegen
		// =====================
		popupDiv.insertBefore(markerIcon, popupGroupDiv);
	 }
}

function getContent(feature) {
	var popupDivHtml = "";
	var attributes = feature.attributes;
	if (attributes.anzeigename) {
		var anzeigename_split = (attributes.anzeigename).split('|');
		var id_split = (attributes.id).split('|');
		var objCount = anzeigename_split.length;
		var status = "even";
		for (var i = 0; i < objCount; i++) {
			if (i % 2 == 0)
			{
				status = "even";
			}
			else
			{
				status = "odd";
			}
			
			if (attributes.id != '0' && attributes.id != '-1') {
				popupDivHtml += "<div class='infobubbleContent " + status + "' onclick='showFoiInfo(\"" + id_split[i] + "\",\"" + feature.attributes.type + "\");' title='anklicken'>" + anzeigename_split[i].trim() + "</div>";
			} else if(attributes.id == '-1') { 
				// Bei Highlighting -> keine Anzeige des Textes im Infofenster
				popupDivHtml += "<div class='infobubbleContent " + status + "'>" + anzeigename_split[i].trim() + "</div>";
			} else if(attributes.id == '0') { 
				// Bei Dating-Marker -> keine Anzeige des Textes im Infofenster
				popupDivHtml += "<div class='infobubbleContent infobubbleDatingmessage'><em>" + "<strong>Nachricht:</strong><br>" + anzeigename_split[i].trim() + "</em></div>";
			}
		}
		popupDivHtml += "</div>";
		
		// // Bei Punkt ohne Clusterung -> direkt Informationen anzeigename
		// if (objCount == 1 && attributes.id != '0') { // Bei Dating-Marker keine Anzeige des Textes im Infofenster
			// createInfoJson(anzeigename_split[0].trim());
		// }
	}
	
	return popupDivHtml;
}

function hidePopup() {
	// Um bei der Auswahl eines geclusterten Punktes
	// den Marker des Einzelpunktes zu loeschen
	// highlightLayer.removeAllFeatures();
	
	// if a popup is opened
	if(popup) {
		
		// remove it from the map
		map.removePopup(popup);
		
		// destroy it
		try {
			popup.destroy();
		} catch(err) {
			var error = err.message;
		}
		
		// delete the reference
		popup = null;
	}
}


