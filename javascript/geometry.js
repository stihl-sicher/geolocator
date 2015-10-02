function CIRCLE (circle) {

	var center = OpenLayers.Layer.SphericalMercator.forwardMercator(circle.lon, circle.lat);

	var style = {
		strokeColor:	(circle.strokeColor	|| 'red'	),
		strokeWidth:	(circle.strokeWidth	|| 2		),
		strokeOpacity:	(circle.strokeOpacity	|| 1.0		),
		fill:		(circle.fillOpacity!==0			),
		fillColor:	(circle.fillColor	|| 'yellow'	),
		fillOpacity:	(circle.fillOpacity	|| 0.5		),
		pointerEvents:	'visiblePainted'
	}

	var radius = (circle.radius || 1000.0) / Math.cos (circle.lat * 3.1415926535 / 180.0);

	var nPoints= circle.nPoints || 32;
	var delta  = 2 * 3.1415926535 / nPoints;

	var list = [];
	for (var i=0; i<nPoints; i++) {

		var alpha = i * delta;
		var x = center.lon + Math.cos (alpha) * radius;
		var y = center.lat + Math.sin (alpha) * radius;
		list.push (new OpenLayers.Geometry.Point(x, y));
	}

	var geometry = new OpenLayers.Geometry.LinearRing (list);
	var feature  = new OpenLayers.Feature.Vector (geometry, null, style);

	return feature;
}