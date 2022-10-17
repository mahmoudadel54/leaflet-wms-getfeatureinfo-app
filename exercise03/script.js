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
var features = [],i = 0, popup;
myMap.on("click", (e) => {
  console.log({ event: e });
  let size = myMap.getSize();
  let bbox = myMap.getBounds().toBBoxString();
  console.log({ size, bbox });
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
      "&TYPENAME=geonode:egy_wfp_acrcountries_points_wfp_2018" +
      "&FEATURE_COUNT=10" //here to get more than features put this param: FEATURE_COUNT
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (geojsonData) {
      //pure data
      console.log(geojsonData.features);
      if (geojsonData.features.length) {
        features = geojsonData.features;
        let latlng = L.latLng(
          geojsonData.features[i].geometry.coordinates[1],
          geojsonData.features[i].geometry.coordinates[0]
        );
        console.log(latlng, i, features, i === features.length - 1);
        popup = L.popup().setLatLng(latlng).setContent(`<div>
        <div id='popup-content'>  
        <p> Count: ${features.length}/${i+1}</p>
          <p > ${features[i].properties.adm2_name} </p>
          </div>
          <br></br>
          <br></br>
        <div style="display:flex; justify-content:space-around;">  
          <button style='margin:5px' id='prev'>Prev</button>
        
          <button style='margin:5px' id='next'>Next</button>
  </div>
          </div>
          `);
        popup.on("add", () => {
          if (features.length === 1)
            document.getElementById("next").style = "cursor: not-allowed;";
          document.getElementById("prev").style = "cursor: not-allowed;";

          document.getElementById("prev").addEventListener("click", (e) => {
            console.log("decrease", i, popup);
            if (i) {
              i--;
              document.getElementById(
                "popup-content"
              ).innerHTML = `<p> Count: ${features.length}/${i+1}</p>
              <p > ${features[i].properties.adm2_name} </p>
            `;

              if (!i)
                document.getElementById("prev").style = "cursor: not-allowed;";
              if (document.getElementById("next").style.cursor == "not-allowed")
                document.getElementById("next").style = "cursor: auto;";
            }
          });
          document.getElementById("next").addEventListener("click", (e) => {
            console.log("increase", i, popup);

            if (i < features.length - 1) {
              i++;

              document.getElementById(
                "popup-content"
              ).innerHTML = ` <p> Count: ${features.length}/${i+1}</p>
              <p > ${features[i].properties.adm2_name} </p>
            `;
              if (i == features.length - 1)
                document.getElementById("next").style = "cursor: not-allowed;";
              if (document.getElementById("prev").style.cursor == "not-allowed")
                document.getElementById("prev").style = "cursor: auto;";
            }
          });
        });
        popup.on("remove", () => {
            console.log('remove');
          i = 0;
          features = [];
          
          popup.removeFrom(myMap);
            popup = undefined;
        });

        // popup.on("contentupdate", () => {
        //     console.log('update');
        //   i = 0;
        //   features = [];
        // });
        popup.openOn(myMap);
      }
    });
});
