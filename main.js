import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import {
    Cluster,
    OSM,
    Vector as VectorSource
} from 'ol/source';
import {
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style,
    Text
} from 'ol/style';
import {fromLonLat} from 'ol/proj';


// Initialise a map view
var view = new View({
    center: [1602780.550322602, -455617.5544681195],
    zoom: 2
});

// Initialise a map
var map = new Map({
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    target: 'map',
    view: view
});

// Add geolocation to map
var geolocation = new Geolocation({
    tracking: true,
    projection: view.getProjection()
});

// Centralise map based on geolocation
geolocation.on('change', function () {
    view = map.getView()
    view.setCenter(geolocation.getPosition())
    view.setZoom(10)
});

// Add outer circle
var accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

// Add user dot
var positionFeature = new Feature();
positionFeature.setStyle(new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({
            color: '#3399CC'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 3
        })
    })
}));

// Add user location overlay to map
geolocation.on('change:position', function () {
    var coordinates = geolocation.getPosition();
    console.log(coordinates);
    positionFeature.setGeometry(coordinates ?
        new Point(coordinates) : null);
    geolocation.setTracking(false);
});

new VectorLayer({
    map: map,
    source: new VectorSource({
        features: [accuracyFeature, positionFeature]
    })
});


/* Add Confirmed Case Marks */
var confirmedMarks = new Array();

confirmedMarks.push(new Feature(new Point(fromLonLat([145.128093, -37.627633]))));

var source = new VectorSource({
    features: confirmedMarks
});

var clusterSource = new Cluster({
    distance: 100,
    source: source
});

var styleCache = {};
new VectorLayer({
    map: map,
    source: clusterSource,
    style: function (feature) {
        var size = feature.get('features').length;
        var style = styleCache[size];
        // console.log(style)
        if (!style) {
            style = new Style({
                image: new CircleStyle({
                    radius: 10,
                    stroke: new Stroke({
                        width: 2,
                        color: '#fff'
                    }),
                    fill: new Fill({
                        color: 'red'
                    })
                }),
                text : new Text({
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            });
            styleCache[size] = style;
        }
        return style;
    }
});