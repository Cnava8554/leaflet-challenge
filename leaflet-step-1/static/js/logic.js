var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function (data) {
    console.log(data)
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function onEachFeature(features, layer) {
    layer.bindPopup(`<h3>${features.properties.place}</h3><hr><p>${new Date(features.properties.updated)}</p>`);
  }

  function changeColor(features) {
    if (features.properties.mag > 5)
    return 'violet'
    else if (features.properties.mag > 3)
    return 'yellow'
    else if (features.properties.mag > 1)
    return 'green'
    else 
    return 'red'
  };

  function changeSize(features) {
    if (features.geometry.coordinates[2] > 100)
    return 0
    else return features.geometry.coordinates[2]
  };

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(features, latlng) {
        return L.circleMarker(latlng)
    },
    style: function geojsonMarkerOptions(features) {
        return {
            radius: changeSize(features),
            fillColor: changeColor(features),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        }
    }
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {

  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var baseMaps = {
    "Street Map": street//,
 //   "Topographic Map": topo
  };

//  let tectonicplates = new L.LayerGroup()
 // let overlayMaps = {
 //   Earthquakes: earthquakes,
 //   'Tectonic Plates': tectonicplates
//  };

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  let legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function(myMap) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 3, 5],
        colors = ['green', 'yellow', 'violet', 'red'];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' + 
        grades[i] + (grades[i+1] ? `&ndash;` + grades[i+1] +'<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

  d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(function (data) {

    L.geoJSON(data, {

    }).addTo(tectonicplates);

  tectonicplates.addTo(myMap)
  });
}