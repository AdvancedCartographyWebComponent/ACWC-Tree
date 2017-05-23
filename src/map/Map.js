import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'font-awesome/css/font-awesome.min.css'
//import 'leaflet-extra-markers/dist/images'
// using webpack json loader we can import our geojson file like this
// import local components Filter and ForkMe
import { connect } from 'react-redux'
import actions from '../../action/action';
//import * as actions from '../action/action'
import { bindActionCreators } from 'redux';
import Filter2 from './Filter2';
import axios from 'axios';
import md5 from 'MD5';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {};
config.params = {
  center: [2.334345,48.836703],
  zoomControl: false,
  zoom: 1,
  maxZoom: 30,
  minZoom: 1,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};
//48.836703, 2.334345
config.tileLayer = {
  uri: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  params: {
    minZoom: 1,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    id: '',
    accessToken: ''
  }
};
const USER_TYPE = "https://deductions.github.io/drivers.owl.ttl#Driver";
const SERVICE_PORT = "http://localhost:9000/position";

// array to store unique names of Brooklyn subway lines,
// this eventually gets passed down to the Filter component
let UserNames = [];

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      markerLayer : null,
      geojson: null,
      driversFilter: '*',
      numUser: null
    };
    //console.log("url search",this.props);
    this.isServer = this.props.isServer?this.props.isServer:"false";
    this.urlQuery = this.props.urlQuery?this.props.urlQuery:null;
    this.geoCollection = {};
    this.prevGeoCollection = null;
    this._mapNode = null;
    this.updateFilter = this.updateFilter.bind(this);
    this.onEachFeature = this.onEachFeature.bind(this);
    this.pointToLayer = this.pointToLayer.bind(this);
    this.filterFeatures = this.filterFeatures.bind(this);
    this.filterGeoJSONLayer = this.filterGeoJSONLayer.bind(this);
    this.plot = this.plot.bind(this);
    this.postData = this.postData.bind(this);
    this.entityShortName = this.entityShortName.bind(this);
    this.transformToGeoJSON = this.transformToGeoJSON.bind(this);
    this.getDataFromUrl = this.getDataFromUrl.bind(this);
    this.transformSparqlQueryToGeoJSON = this.transformSparqlQueryToGeoJSON.bind(this);
  }

  componentDidMount() {
    // code to run just after the component "mounts" / DOM elements are created
    // we could make an AJAX request for the GeoJSON data here if it wasn't stored locally
    //console.log("get data");
    if(this.isServer !=="false"){
      this.postData();
    }else{
      this.getData();
    }
    //this.postData();
    // create the Leaflet map object
    ////console.log(this._mapNode);
    //if (!this.state.map&&this.state.geojson) this.init(this._mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    ////console.log("hello");
    if(this.urlQuery&&this.props.geoData&&!this.state.geojson){
      console.log("urlQuery",this.props.geoData);
      this.setState({
        geojson:this.props.geoData
      });
    }
    if (!this.state.map&&this.state.geojson) {
      this.init(this._mapNode);
      this.postDataID = setInterval(
        () => {
          //console.log("testInterval");
          //console.log(Math.round(new Date().getTime()));
          if(this.isServer!=="false"){
            this.postData();
          }
        },
        10000
      );
    };
    if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
      // add the geojson overlay
      ////console.log("hello1");
      this.addGeoJSONLayer(this.state.geojson);
    }
    // check to see if the filter has changed or data changes
    if (this.state.driversFilter !== prevState.driversFilter) {
      // filter / re-render the geojson overlay
      //console.log("hello2");
      //console.log(this.geoCollection);
      this.filterGeoJSONLayer();
    }
    if (prevProps.serverData&&md5(JSON.stringify(this.props.serverData))!==md5(JSON.stringify(prevState.serverData))) {
      // filter / re-render the geojson overlay
      //console.log("hello3");
      //console.log(this.geoCollection);
      UserNames=[];
      this.filterGeoJSONLayer();
    }
    if(md5(JSON.stringify(prevProps.geoData))!==md5(JSON.stringify(this.props.geoData))){
      console.log("geoData changed");
      console.log("prev",prevProps.geoData);
      console.log("this",this.props.geoData);
      this.setState({
        geojson:this.props.geoData
      });
    }
    if(prevState.geojson&&md5(JSON.stringify(prevState.geojson))!==md5(JSON.stringify(this.state.geojson))){
      console.log("geojson changed do filterGeoJSONLayer");
      console.log("prev",prevState.geojson);
      console.log("this",this.state.geojson);
      UserNames=[];
      this.filterGeoJSONLayer();
    }
  }

  componentWillUnmount() {
    // code to run just before unmounting the component
    // this destroys the Leaflet map object & related event listeners
    this.state.map.remove();
     clearInterval(this.postDataID);
  }

  getData() {
    // could also be an AJAX request that results in setting state with the geojson data
    // for simplicity sake we are just importing the geojson data using webpack's json loader
    //console.log("hello redux geoData",this.props.geoData);
    if(this.urlQuery){
      this.getDataFromUrl(this.urlQuery);
    }
    else{
      this.setState({
        numUser: this.props.geoData.features.length,
        geojson: this.props.geoData
      });
    }
  }
  getDataFromUrl(url){
    var cur = this;
    //console.log(url.slice(1,4));

    console.log("map data from url",url.slice(5));
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: url.slice(5),
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
      if(url.slice(1,4)==="sql"){
        //console.log(res.data.results.bindings);
        cur.transformSparqlQueryToGeoJSON(res.data.results.bindings);
        cur.props.actions.getDataFromUrlForMap(cur.geoCollection);
        //console.log(cur.geoCollection);
        cur.setState({
          numUser: cur.geoCollection.features.length,
          geojson: cur.geoCollection
        });}
        else{
          cur.props.actions.getDataFromUrlForMap(res.data);
          /*cur.setState({
            numUser: res.data.features.length,
            geojson: res.data
          });*/
        }
    });
  }


  entityShortName(iri){
      if (typeof iri === 'undefined') {
          return true;
      } else {
          return iri.split('#')[1];
      }
  }

  plot(cur,JSONData){
      //console.log(JSONData);
      if (typeof JSONData['@graph'] === 'undefined') {
        //console.log(cur.entityShortName(JSONData['@type']));
          if (cur.entityShortName(JSONData['@type']) === 'Driver') {
          // if (typeof JSONData.name !== 'undefined') {
              //console.log('chauffeur isolé');
              cur.transformToGeoJSON([JSONData],cur);
              //Pins.unMark();
              //Pins.mark(JSONData);
          } else {
              //console.log('Impossible d’interpréter le format de données');
          }
      } else {
          // var points = JSONData['@graph'].filter(function (objet) {return (typeof objet.name !== 'undefined')});
          var points = JSONData['@graph'].filter(function (objet) {return ( cur.entityShortName(objet['@type']) === 'Driver'); });
          if (points.length > 0) {
              // TODO : la fonction plot n'affiche plus seulement les chauffeurs mais tous les
              // points envoyés par le serveur quelle que soit leur nature
              //console.log(points.length.toString()+' chauffeur(s) en activité');
              //Pins.repaint(points);
              //console.log(points);
              cur.transformToGeoJSON(points);
          } else {
              //console.log('Aucun chauffeur à afficher sur la carte');
          }
      }
      //$('#presents').html(Pins.markers.length + " chauffeur(s) en service");
  }

  transformToGeoJSON(data){
    //console.log("transform data",data);
    //console.log("current geoCollection data",this.geoCollection);
    ////console.log("defalut geo",defaultGeoCollection);
    data.map(
      (value, index)=>
      {

        var geoFeatures ={
          "type": "Feature",
          "geometry" : {
            "type": "Point",
            "coordinates": [value["long"], value["lat"]],
          },
          "properties" : {
            "NAME": value["name"],
            "URL" : value["url"]
          }
        }
        //console.log("value:",value);
        //console.log("mapping data index:",index,"-- geoFeatures data:",geoFeatures);
        this.geoCollection.features.push(geoFeatures);
        //console.log("mapping data geoCollection:",this.geoCollection);
      });
    //console.log("after transform geoCollection is:",this.geoCollection);
    ////console.log("defalut geo",defaultGeoCollection);
        /*{ "type": "Feature",
          "properties": {
            "NAME": "user2",
            "URL": "http:\/\/www.xxx.xxx\/xxx\/xxx\/"},
          "geometry": {
            "type": "Point",
            "coordinates": [ 2.354345,48.816703 ] }
        }*/
  }
  transformSparqlQueryToGeoJSON(data){
    //console.log("transform data",data);
    //console.log("current geoCollection data",this.geoCollection);
    ////console.log("defalut geo",defaultGeoCollection);
    data.map(
      (value, index)=>
      {

        var geoFeatures ={
          "type": "Feature",
          "geometry" : {
            "type": "Point",
            "coordinates": [value["LON"]["value"], value["LAT"]["value"]],
          },
          "properties" : {
            "NAME": value["LAB"]["value"],
            "URL" : value["LAB"]["value"]
          }
        }
        //console.log("value:",value);
        //console.log("mapping data index:",index,"-- geoFeatures data:",geoFeatures);
        this.geoCollection.features.push(geoFeatures);
        //console.log("mapping data geoCollection:",this.geoCollection);
      });
    //console.log("after transform geoCollection is:",this.geoCollection);
    ////console.log("defalut geo",defaultGeoCollection);
        /*{ "type": "Feature",
          "properties": {
            "NAME": "user2",
            "URL": "http:\/\/www.xxx.xxx\/xxx\/xxx\/"},
          "geometry": {
            "type": "Point",
            "coordinates": [ 2.354345,48.816703 ] }
        }*/
  }
  postData(){

    var current = {
        "@context": "https://deductions.github.io/drivers.context.jsonld",
        "@type": USER_TYPE,
        "lat": 48.826703 ,
        "long": 2.344345,
        "timestamp": Math.round(new Date().getTime()),
        "@id" : "lalala",
        "error": 0
      };
    var currentPosition = JSON.stringify(current);
    this.prevGeoCollection = this.geoCollection;
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    ////console.log("defalut geo",defaultGeoCollection);
    /*//console.log("setDefault to geoCollection:",this.geoCollection);
    //console.log("setDefault to geoCollection:",this.prevGeoCollection.features);
    //console.log("geoCollection:",md5(JSON.stringify(this.geoCollection)));
    //console.log("prevGeoCollection:",md5(JSON.stringify(this.prevGeoCollection)));*/
    //console.log("currentPosition done start post");
    //console.log("--current geoCollection",this.geoCollection);
    var cur = this;
    axios({
      method: 'post',
      url: SERVICE_PORT,
      data: currentPosition,
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
    }).then(function(res) {
      // Traitement des positions des chaffeurs
      ////console.log(res);
      ////console.log("this:",cur);
      cur.plot(cur,res.data);
      ////console.log("plot done");
      if(md5(JSON.stringify(cur.geoCollection))!==md5(JSON.stringify(cur.prevGeoCollection))){
        ////console.log("data diffs, reset state");
        cur.props.actions.updateServerData(cur.geoCollection);
        cur.setState({
          numUser: cur.geoCollection.features.length,
          geojson: cur.geoCollection
        });
        ////console.log("get data done set state geojson");
      }


    })
    .catch(function (error) {
      ////console.log(error);
    });


  }

  updateFilter(e) {
    let userSelected = e.target.value;
    // change the subway line filter
    if (userSelected === "All Info") {
      userSelected = "*";
    }
    // update our state with the new filter value
    this.setState({
      driversFilter: userSelected
    });
  }

  addGeoJSONLayer(geojson) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    const geojsonLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeature,
      pointToLayer: this.pointToLayer,
      filter: this.filterFeatures
    });
    // add our GeoJSON layer to the Leaflet map object
    //TODO Add marker here
    var markers = L.markerClusterGroup({
	      showCoverageOnHover: false
    });
    console.log("markers initial success?",markers?"yes":"no");
    markers.addLayer(geojsonLayer).addTo(this.state.map);
    //geojsonLayer.addTo(this.state.map);
    // store the Leaflet GeoJSON layer in our component state for use later
    this.setState(
      {
        geojsonLayer,
        markerLayer:markers
     });
    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(geojsonLayer);
  }

  filterGeoJSONLayer() {
    // clear the geojson layer of its data

    //console.log("geojsonLayer:",this.state.geojsonLayer);
    this.state.geojsonLayer.clearLayers();
    this.state.markerLayer.clearLayers();
    // re-add the geojson so that it filters out subway lines which do not match state.filter
    ////console.log("remove and add data");
    this.state.geojsonLayer.addData(this.state.geojson);
    this.state.markerLayer.addLayer(this.state.geojsonLayer).addTo(this.state.map);
    //markers.addLayer(geojsonLayer).addTo(this.state.map);
    // fit the map to the new geojson layer's geographic extent
    this.zoomToFeature(this.state.geojsonLayer);
  }

  zoomToFeature(target) {
    // pad fitBounds() so features aren't hidden under the Filter UI element
    var fitBoundsParams = {
      paddingTopLeft: [10,10],
      paddingBottomRight: [10,10],
      maxZoom : 14
    };
    //console.log("zooming");
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }

  filterFeatures(feature, layer) {
    // filter the subway entrances based on the map's current search filter
    // returns true only if the filter value matches the value of feature.properties.LINE
    const test = (feature.properties.NAME===(this.state.driversFilter));
    ////console.log("test:"+test+"---tt:"+(test !== false));
    ////console.log("driverFilter:"+this.state.driversFilter+"-----dt:"+(this.state.driversFilter === '*'));
    ////console.log(this.state.driversFilter === '*' || test !== false);
    if (this.state.driversFilter === '*' || test !== false) {
      return true;
    }
  }

  pointToLayer(feature, latlng) {
    // renders our GeoJSON points as circle markers, rather than Leaflet's default image markers
    // parameters to style the GeoJSON markers
    /*var markerParams = {
      radius: 7,
      fillColor: 'red',
      color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 1
    };*/
    var redMarker = L.ExtraMarkers.icon({
      icon: 'fa-bars',
      markerColor: 'red',
      shape: 'square',
      prefix: 'fa'
    });
    return L.marker(latlng, {icon: redMarker,}).on('click',()=>{
      return console.log("alala");
    });
    //return L.circleMarker(latlng, markerParams);
  }

  onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.NAME) {

      // if the array for unique subway line names has not been made, create it
      // there are 19 unique names total

      //console.log("enter onEachFeature");
        // add subway line name if it doesn't yet exist in the array
      if (UserNames.indexOf(feature.properties.NAME) === -1){
        UserNames.push(feature.properties.NAME);
        if (this.state.geojson.features.indexOf(feature) === this.state.numUser - 1) {
          // use sort() to put our values in alphanumeric order
          UserNames.sort();
          // finally add a value to represent all of the subway lines
          UserNames.unshift('All Info');
        }
      }


      // on the last GeoJSON feature

      // assemble the HTML for the markers' popups (Leaflet's bindPopup method doesn't accept React JSX)
      const popupContent = `<h3>${feature.properties.NAME}</h3>
              <strong>Is Here</strong>`;
      //console.log("add pop done:"+popupContent);
      // add our popups
      layer.bindPopup(popupContent);

  }
}

  init(id) {
    //console.log("hello init");
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);
    L.control.zoom({ position: "bottomleft"}).addTo(map);
    L.control.scale({ position: "bottomleft"}).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    // set our state to include the tile layer
    this.setState({ map:map, tileLayer:tileLayer });
  }

  render() {
    //console.log("hey");
    //console.log(this.state.geojson);
    //console.log("map url search",this.props);
    var cur = this;
    //console.log(this);
    return (

      <div id="mapUI">

        {
          /* render the Filter component only after the subwayLines array has been created */

          //TODO UserNames change after render filter again, so maybe send messages directly to the filter...

          cur.state.geojson &&
            <Filter2
              curState={cur.state.geojson}
              filterUsers={cur.updateFilter} />
          }
        <div ref={(node) => { /*//console.log("hello"+node+this.count);this.count=this.count+1;*/cur._mapNode = node}} id="map" />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  urlDataForMap:state.urlDataForMap,
  geoData:state.geoData,
  serverData:state.serverData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
