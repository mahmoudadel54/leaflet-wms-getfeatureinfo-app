//create base map (layer ==> tileLayer)
var myBasemap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});


//wms layer 
var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {   //server link
    layers: 'nexrad-n0r-900913',    //layer name
    format: 'image/png',
    transparent: true,
    attribution: "Weather data © 2012 IEM Nexrad"
});

var egyptLayer = L.tileLayer.wms("https://geowebservices.stanford.edu/geoserver/wms/druid", {
    layers: "druid:sb596hv9668",
    format: 'image/png',
    transparent: true,
})



//create map 
var myMap = L.map("mapid", {
    center: [43.389081939117496, -86.923828125],
    zoom: 3,
    attributionControl: false,               //hide this default attribution
    // zoomControl:false
    layers: [myBasemap, nexrad, egyptLayer]
})
//implement wms getFeatureInfo on egypt layer
myMap.on('click', (e) => {
    console.log({ event: e });
    fetch("https://geowebservices.stanford.edu/geoserver/wms/druid?" +
        `&bbox=${e.latlng.lng - 0.2},${e.latlng.lat - 0.2},${e.latlng.lng + 0.2},${e.latlng.lat + 0.2}` +
        "&INFO_FORMAT=application/json" +
        "&REQUEST=GetFeatureInfo" +
        "&EXCEPTIONS=application/vnd.ogc.se_xml" +
        "&SERVICE=WMS" +
        "&VERSION=1.1.1" +
        "&WIDTH=970&HEIGHT=485&X=486&Y=165" +
        "&LAYERS=druid:sb596hv9668" +
        "&QUERY_LAYERS=druid:sb596hv9668" +
        "&TYPENAME=druid:sb596hv9668").
        then(function (res) {
            return res.json()
        })
        .then(function (geojsonData) {                //pure data

            // console.log({geojsonData});
            if (geojsonData.features.length) {
                alert("Here is a feature")
            }
        })
})