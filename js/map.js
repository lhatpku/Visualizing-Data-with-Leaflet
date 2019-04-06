// Selectable backgrounds of our map - tile layers:
// grayscale background.
var grayScale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGhhdHBrdSIsImEiOiJjanRlemoydzMwNXp0NDltZzNzemJhZ3ZsIn0.sbwGYqyHKFYZeLZ5wNRl1A");

// satellite background.
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGhhdHBrdSIsImEiOiJjanRlemoydzMwNXp0NDltZzNzemJhZ3ZsIn0.sbwGYqyHKFYZeLZ5wNRl1A");

// outdoors background.
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGhhdHBrdSIsImEiOiJjanRlemoydzMwNXp0NDltZzNzemJhZ3ZsIn0.sbwGYqyHKFYZeLZ5wNRl1A");

// map object to an array of layers we created.
var map = L.map("mapid", {
  center: [35, -98],
  zoom: 6,
  layers: [grayScale, satellite, outdoors]
});

// adding the 'graymap' layer.
grayScale.addTo(map);

// layers for two different sets of data, earthquakes and tectonicplates.
var faultLines = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Satellite: satellite,
  Grayscale: grayScale,
  Outdoors: outdoors
};

// overlays 
var overlayMaps = {
  "Fault Lines": faultLines,
  "Earthquakes": earthquakes
};

// control which layers are visible.
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleInfo(feature) {
    return {
      fillOpacity: 1,
      opacity: 0.8,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Color by magnitude
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#663f3f";
      case magnitude > 4:
        return "#825050";
      case magnitude > 3:
        return "#965b5b";
      case magnitude > 2:
        return "#b26c6c";
      case magnitude > 1:
        return "#cc7a7a";
      default:
        return "#f49292";
    }
  }

  // earthquake radius
  function getRadius(magnitude) {
    return magnitude * 2 + 1;
  }

  // add layer
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>" + "Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);


  var legend = L.control({
    position: "bottomleft"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#f49292",
      "#cc7a7a",
      "#b26c6c",
      "#965b5b",
      "#825050",
      "#663f3f"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;

  };


  legend.addTo(map);

  // retrive Tectonic Plate Geo Jason. 
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "black",
        weight: 2
      })
      .addTo(faultLines);

      faultLines.addTo(map);
    });
});
