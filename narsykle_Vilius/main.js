var map;


function initMap(style) {
  console.info(style);

   //var control = new maplibreSearchBox.MapLibreSearchControl({
    //useMapFocusPoint: true,
  //});

   const geocoderApi = {
        forwardGeocode: async (config) => {
            const features = [];
            try {
                const request =
            `https://nominatim.openstreetmap.org/search?q=${
                config.query
            }&format=geojson&polygon_geojson=1&addressdetails=1`;
                const response = await fetch(request);
                const geojson = await response.json();
                for (const feature of geojson.features) {
                    const center = [
                        feature.bbox[0] +
                    (feature.bbox[2] - feature.bbox[0]) / 2,
                        feature.bbox[1] +
                    (feature.bbox[3] - feature.bbox[1]) / 2
                    ];
                    const point = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: center
                        },
                        place_name: feature.properties.display_name,
                        properties: feature.properties,
                        text: feature.properties.display_name,
                        place_type: ['place'],
                        center
                    };
                    features.push(point);
                }
            } catch (e) {
                console.error(`Failed to forwardGeocode with error: ${e}`);
            }

            return {
                features
            };
        }
    };

  map = new maplibregl.Map({
    container: "map",
    style: `map_styles/${style}.json`,
    center: [25.264657948724185, 54.671932714877194],
    zoom: 12,
    hash: true,
  });

  map.on("load", () => {
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      }),
      "top-right"
    ,
    );
  map.addControl(
    new maplibregl.FullscreenControl({
      container: document.querySelector('body')}),
      "top-left"
    ,
    );

  //map.addControl(control, "top-left");

    map.addControl(new maplibreGLMeasures.default({}), 'top-left');
    map.setMinZoom(6);

    map.addControl(
        new MaplibreGeocoder(geocoderApi, {
            maplibregl
        }),
        "top-left"
      )

    // TODO: pasinagrinėti, kaip apriboti žemėlapio extent

    // Užkraunami teminiai sluoksniai
    // Užkraunamas savivaldybių sluoksnis
    map.addSource("savivaldybes-source", {
      type: "raster",
      tiles: [
        "http://localhost/qgisserver/gelezinkeliai_savivaldybes?format=image/png&SERVICE=WMS&version=1.3.0&REQUEST=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=savivaldybes_pagal_gelezinkeliu_ilgi&bbox={bbox-epsg-3857}",
      ],
      tileSize: 512,
    });
    map.addLayer({
      id: "savivaldybes_pagal_gelezinkeliu_ilgi-layer",
      type: "raster",
      source: "savivaldybes-source",
      layout: {
        visibility: "none",
      },
      paint: {},
    });
     // Užkraunamas gelezinkelio begiu sluoksnis
    map.addSource("begiai-source", {
      type: "raster",
      tiles: [
        "http://localhost/qgisserver/gelezinkeliai?format=image/png&SERVICE=WMS&version=1.3.0&REQUEST=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=gelezinkelio_vezes&bbox={bbox-epsg-3857}",
      ],
      tileSize: 512,
    });
    map.addLayer({
      id: "gelezinkelio_vezes-layer",
      type: "raster",
      source: "begiai-source",
      layout: {
        visibility: "none",
      },
      paint: {},
    });
      // Užkraunamas gelezinkelio stociu sluoksnis
    map.addSource("stotys-source", {
      type: "raster",
      tiles: [
        "http://localhost/qgisserver/stotys?format=image/png&SERVICE=WMS&version=1.3.0&REQUEST=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=stotys&bbox={bbox-epsg-3857}",
      ],
      tileSize: 512,
    });
    map.addLayer({
      id: "stotys-layer",
      type: "raster",
      source: "stotys-source",
      layout: {
        visibility: "none",
      },
      paint: {},
    });
  });
}


initMap("topo");

function toggleLayer(layerId) {
  var layerVisibility = map.getLayoutProperty(layerId, "visibility");

  if (layerVisibility === "none") {
    map.setLayoutProperty(layerId, "visibility", "visible");
  } else {
    map.setLayoutProperty(layerId, "visibility", "none");
  }

  console.log(layerVisibility);
}

let navigationControl = new maplibregl.NavigationControl({
  visualizePitch: true,
  visualizeRoll: true,
  showZoom: true,
  showCompass: true,
});



var toolsEnabled = false;

function toggleTools() {
  if (!toolsEnabled) {
    map.addControl(navigationControl, "top-right");
    toolsEnabled = true;
  } else {
    map.removeControl(navigationControl);
    toolsEnabled = false;
  }
}