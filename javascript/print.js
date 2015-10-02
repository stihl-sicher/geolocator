function updateLinkForPrint(_foi) {
	var center = map.getCenter();
	center = new OpenLayers.Geometry.Point(center.lon, center.lat).transform(
               map.getProjectionObject(),
               new OpenLayers.Projection("EPSG:4326")
           );
	var zoom = map.getZoom();
	var link = "index.php?print=1&lat="+center.y+"&lon="+center.x+"&zoom="+zoom;
	// Meeting-Point hat Prioritaet
	if (datingMessage) {
			link += "&m=" + datingMessage;
		} else {
			if (aktuelleInfo["id"] !== null && aktuelleInfo["type"] === "FOI") {
				link += "&mid="+aktuelleInfo["id"];
			}
		}
	document.getElementById("printLink").setAttribute("href",link);
}