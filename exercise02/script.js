//create base map (layer ==> tileLayer)
var myBasemap = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  }
);

//wms layer

var egyptLayer = L.tileLayer.wms(
  "https://geonode.wfp.org/geoserver/geonode/wfs",
  {
    layers: "geonode:egy_wfp_acrcountries_points_wfp_2018",
    format: "image/png",
    transparent: true,
  }
);

//create map
var myMap = L.map("mapid", {
  center: [30, 30],
  zoom: 8,
  attributionControl: false, //hide this default attribution
  // zoomControl:false
  layers: [myBasemap, egyptLayer],
});
//implement wms getFeatureInfo on egypt layer
myMap.on("click", (e) => {
  console.log({ event: e });
  let size = myMap.getSize();
  let bbox = myMap.getBounds().toBBoxString();
  console.log({ size, bbox});
  fetch(
    "https://geonode.wfp.org/geoserver/geonode/wms?" +
      `&bbox=${bbox}` +
      `&WIDTH=${size.x}&HEIGHT=${size.y}&X=${e.containerPoint.x}&Y=${e.containerPoint.y}` +
      "&INFO_FORMAT=application/json" +
      "&REQUEST=GetFeatureInfo" +
      "&EXCEPTIONS=application/vnd.ogc.se_xml" +
      "&SERVICE=WMS" +
      "&VERSION=1.1.1" +
      "&LAYERS=geonode:egy_wfp_acrcountries_points_wfp_2018" +
      "&QUERY_LAYERS=geonode:egy_wfp_acrcountries_points_wfp_2018" +
      "&TYPENAME=geonode:egy_wfp_acrcountries_points_wfp_2018"
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (geojsonData) {
      //pure data
      console.log(geojsonData);
      if (geojsonData.features.length) {
        let latlng = L.latLng(geojsonData.features[0].geometry.coordinates[1],geojsonData.features[0].geometry.coordinates[0]);
        console.log(latlng);
        L.popup()
        .setLatLng(latlng)
        .setContent(`<p> ${geojsonData.features[0].properties.adm2_name} </p>`)
        .openOn(myMap);
      }
    });
});

//implement WFS getFeature request

// fetch("https://geonode.wfp.org/geoserver/geonode/wfs?service=wfs&version=2.0.0&REQUEST=GetFeature&TYPENAMES=geonode:egy_wfp_acrcountries_points_wfp_2018&outputFormat=application/json")
// .then(res=>res.json())
// .then(data=>{
//     let wfsLayer = L.geoJSON(data,{

//     }).bindPopup(function (layer) {
//         return layer.feature.properties.adm2_name;
//     }).addTo(myMap);

//     console.log(data);
// })
