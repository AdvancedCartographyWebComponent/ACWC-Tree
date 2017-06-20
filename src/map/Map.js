import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster'
import Info from '../info/Info'
import serverContext from '../../Context/Server.config.js'
import mapContext from '../../Context/Map.config.js'
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
//import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
//import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'font-awesome/css/font-awesome.min.css'
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
import LoadingPage from './LoadingPage';
import axios from 'axios';
import md5 from 'MD5';
import './css/markers.css'
import './marker-icon/marker.js'
//import './marker-icon/_marker.scss'

let config = {};
config.params = mapContext.params;
config.tileLayer = mapContext.tileLayer;
const USER_TYPE = serverContext.USER_TYPE;
const SERVICE_PORT = serverContext.SERVICE_PORT;
console.log("window",window);
var windowGlobal = window;
let UserNames = [];
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojsonLayerForPath:null,
      markerCluster : null,
      geojson: null,
      driversFilter: '*',
      numUser: null,
      sidebar:null
    };
    this.isServer = this.props.isServer?this.props.isServer:"false";
    this.geojsonDivision = {};
    this.geoPathDivision = {};
    this.urlQuery = this.props.urlQuery?this.props.urlQuery:null;
    this.geoCollection = {};
    this.prevGeoCollection = null;
    this._mapNode = null;
    this.isTyping = false;
    //this.updateFilter = this.updateFilter.bind(this);
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
    this.generateIcon = this.generateIcon.bind(this);
    this.showIcons = this.showIcons.bind(this);
    this.hideIcons = this.hideIcons.bind(this);
    this.markerAndIcons = this.markerAndIcons.bind(this);
    this.updateProgressBar = this.updateProgressBar.bind(this);
  }

  componentDidMount() {
    if(this.isServer !=="false"){
      this.postData();
    }else{
      this.getData();
    }
    if (!this.state.map) {
      this.init(this._mapNode);
      //var target = document.getElementById('testGlobal');
      console.log("map init");
      this.postDataID = setInterval(
        () => {
          if(this.isServer!=="false"){
            this.postData();
          }
        },
        10000
      );
    };
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("checkedItem",this.props.checkedItem);
    if(this.props.isTyping){
    }
    else{
      /*if(this.urlQuery&&this.props.geoData&&!this.state.geojson){
        console.log("test1");
        this.setState({
          geojson:this.props.geoData
        });
      }*/
      //console.log("typing",this.props.isTyping);

      if ((this.props.geoData||this.props.geojsonForPath) && this.state.map && !this.state.markerCluster ) {
        console.log("test2");
        this.addGeoJSONLayer(this.props.geoData,this.props.geojsonForPath);
        return;
      }
      /*if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
        console.log("test2");
        this.addGeoJSONLayer(this.state.geojson,this.props.geojsonForPath);
      }*/
      /*if (prevProps.serverData&&md5(JSON.stringify(this.props.serverData))!==md5(JSON.stringify(prevState.serverData))) {
        //UserNames=[];
        this.filterGeoJSONLayer();
      }*/
      if(md5(JSON.stringify(prevProps.checkedItem))!=md5(JSON.stringify(this.props.checkedItem))){
        //console.log("checkedItem changed",prevProps.checkedItem,this.props.checkedItem,"this state markerCluster",this.state.markerCluster);
        for(var index in this.geojsonDivision){
          //console.log("index",index,"this.state.markerCluster",this.state.markerCluster,"this.geojsonDivision",this.geojsonDivision);
          if(this.props.checkedItem.length==0){
            this.state.markerCluster.addLayer(this.geojsonDivision[index]);
            this.state.map.addLayer(this.geoPathDivision[index]);
          }else {
            if(this.props.checkedItem.indexOf(index)==-1){
              this.state.markerCluster.removeLayer(this.geojsonDivision[index]);
              this.state.map.removeLayer(this.geoPathDivision[index]);
            }else {
              this.state.markerCluster.addLayer(this.geojsonDivision[index]);
              this.state.map.addLayer(this.geoPathDivision[index]);
            }
          }
        }
        return;
      }
      if(prevProps.geoData&&md5(JSON.stringify(prevProps.geoData))!==md5(JSON.stringify(this.props.geoData))){
        console.log("geoData changed");
        this.filterGeoJSONLayer();
        return;
      }
      /*if(md5(JSON.stringify(prevProps.geoData))!==md5(JSON.stringify(this.props.geoData))){
        console.log("geoData changed");
        this.setState({
          geojson:this.props.geoData
        });
      }
      if(prevState.geojson&&md5(JSON.stringify(prevState.geojson))!==md5(JSON.stringify(this.state.geojson))){
        console.log("geojson changed do filterGeoJSONLayer");
        //UserNames=[];
        this.filterGeoJSONLayer();
      }*/
    }
  }

  componentWillUnmount() {
    this.state.map.remove();
     clearInterval(this.postDataID);
  }



  getData() {
    if(this.urlQuery){
      this.getDataFromUrl(this.urlQuery);
    }
    else{
      window.mapDataUrl = null;
      window.geojsonUrl = null;
      window.isTrajet = true;
      this.isTrajet = true;
      this.checkDataSource = setInterval(
        () => {
          if(window.mapDataUrl&&(!this.mapDataUrl||md5(JSON.stringify(window.mapDataUrl))!=md5(JSON.stringify(this.mapDataUrl)))){
            console.log("mapDataUrl differ");
            this.mapDataUrl = window.mapDataUrl;
            this.getDataFromUrl(window.mapDataUrl);
          }
          if(window.geojsonUrl&&(!this.geojsonUrl||md5(JSON.stringify(window.geojsonUrl))!=md5(JSON.stringify(this.geojsonUrl)))){
            console.log("geojsonUrl differ");
            this.geojsonUrl = window.geojsonUrl;
            this.getGeojsonFromUrl(window.geojsonUrl);
          }
          if(window.isTrajet!=this.isTrajet){
            console.log("isTrajet differ");
            this.isTrajet = window.isTrajet;
            this.props.actions.isTrajet(this.isTrajet);
          }
        },
        100
      );
    }
  }
  getDataFromUrl(url){
    var cur = this;
    console.log("map data from url",url.slice(1,4),url.slice(5));
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: url.slice(1,4)=="geo"?url.slice(5):null,
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
      cur.props.actions.getDataFromUrlForMap(res.data);
    }).catch(function (error) {
      console.log(error);
    });;
  }
  getGeojsonFromUrl(url){
    var cur = this;
    console.log("getGeojsonFromUrl",url.slice(1,4),url.slice(5));
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: url.slice(1,4)=="geo"?url.slice(5):null,
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
        cur.props.actions.receiveGeoDataFromUrl(res.data);
    }).catch(function (error) {
      console.log(error);
    });;
  }


  entityShortName(iri){
      if (typeof iri === 'undefined') {
          return true;
      } else {
          return iri.split('#')[1];
      }
  }

  plot(cur,JSONData){
      if (typeof JSONData['@graph'] === 'undefined') {
          if (cur.entityShortName(JSONData['@type']) === 'Driver') {
              cur.transformToGeoJSON([JSONData],cur);
          } else {
          }
      } else {
          var points = JSONData['@graph'].filter(function (objet) {return ( cur.entityShortName(objet['@type']) === 'Driver'); });
          if (points.length > 0) {
              cur.transformToGeoJSON(points);
          } else {
          }
      }
  }

  transformToGeoJSON(data){
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
        this.geoCollection.features.push(geoFeatures);
      });
  }
  transformSparqlQueryToGeoJSON(data){
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
        this.geoCollection.features.push(geoFeatures);
      });
  }
  postData(){

    var current = {
        "@context": serverContext.ONTOLOGY,
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
      cur.plot(cur,res.data);
      if(md5(JSON.stringify(cur.geoCollection))!==md5(JSON.stringify(cur.prevGeoCollection))){
        cur.props.actions.updateServerData(cur.geoCollection);
        cur.setState({
          numUser: cur.geoCollection.features.length,
          geojson: cur.geoCollection
        });
      }
    })
    .catch(function (error) {
    });
  }

  /*updateFilter(e) {
    let userSelected = e.target.value;
    // change the subway line filter
    if (userSelected === "All Info") {
      userSelected = "*";
    }
    // update our state with the new filter value
    this.setState({
      driversFilter: userSelected
    });
  }*/

  updateProgressBar(processed, total, elapsed, layersArray) {
    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');
    if (elapsed > 1000) {
      // if it takes more than a second to load, display the progress bar:
      progress.style.display = 'block';
      progressBar.style.width = Math.round(processed/total*100) + '%';
    }

    if (processed === total) {
      // all markers processed - hide the progress bar:
      progress.style.display = 'none';
    }
  }
  addGeoJSONLayer(geojson,geojsonForPath) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    var myStyle_1 = {
    "color": "#c936c3",
    "weight": 2,
    "opacity": 0.70
    };
    var myStyle_2 = {
    "color": "#1500ff",
    "weight": 2,
    "opacity": 0.70
    };
    var markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkProgress: this.updateProgressBar,
      spiderfyOnMaxZoom : false
    });
    markerCluster.on('clusterclick', function (a) {
       // a.layer is actually a cluster
       //TODO add function to greate number of points
       if(a.layer._zoom == mapContext.params.maxZoom){
         if(a.layer.getAllChildMarkers().length>100){
           console.log('cluster ' + a.layer.getAllChildMarkers().length);
         }else {
           a.layer.spiderfy();
         }

       }
    });
    //console.log("geojson",geojson);
    for (var geojsonIndex in geojson) {
      var geojsonLayer = L.geoJson(geojson[geojsonIndex], {
        onEachFeature: this.onEachFeature,
        pointToLayer: this.pointToLayer,
        filter: this.filterFeatures
      });
      this.geojsonDivision[geojson[geojsonIndex].features[0].properties.Name] = geojsonLayer;
      markerCluster.addLayer(geojsonLayer);
    }
    markerCluster.addTo(this.state.map);
    //console.log("geojsonDivision",this.geojsonDivision);
    //console.log("geojsonForPath in map",geojsonForPath,this.state.map);
    for (var index in geojsonForPath["features"]) {
      var geojsonLayerForPath = this.isTrajet?L.geoJson(geojsonForPath["features"][index], {
        style: function(feature) {
          switch (feature.properties.Name) {
              case "71": return myStyle_1;
              case "97":   return myStyle_2;
          }
        }
      }):null;
      geojsonLayerForPath?geojsonLayerForPath.addTo(this.state.map):null;
      this.geoPathDivision[geojsonForPath["features"][index]["properties"]["Name"]] = geojsonLayerForPath;
    }
    //console.log("this.geoPathDivision",this.geoPathDivision);
    //this.zoomToFeature(this.geojsonDivision);
    // add our GeoJSON layer to the Leaflet map object
    //TODO
    this.setState(
      {
        geojsonLayerForPath:geojsonLayerForPath,
        markerCluster:markerCluster
     });
  }

  filterGeoJSONLayer() {
    //this.state.geojsonLayer.clearLayers();
    //console.log("this.props.checkedItem",this.props.checkedItem);
    this.state.markerCluster.clearLayers();
    for (var i in this.geoPathDivision) {
      this.state.map.removeLayer(this.geoPathDivision[i]);
    }

    this.geojsonDivision = {};
    this.geoPathDivision = {};
    //this.state.markerLayer.addLayer(this.geojsonDivision[0]);
    this.addGeoJSONLayer(this.props.geoData,this.props.geojsonForPath);
    //this.state.geojsonLayer.addData(this.props.geoData);
    //this.zoomToFeature(this.state.geojsonLayer);
    //this.state.markerLayer.addLayer(this.state.geojsonLayer).addTo(this.state.map);

  }
  generateIcon(count,iconIndex,iconStyle,color,className,number){
    /*
    options: {
        iconSize: [ 35, 45 ],
        iconAnchor: [ 17, 42 ],
        popupAnchor: [ 1, -32 ],
        shadowAnchor: [ 10, 12 ],
        shadowSize: [ 36, 16 ],
        className: "my-marker",
        prefix: "",
        extraClasses: "",
        icon: "",
        innerHTML: "",
        color: "red",
        number: "",
        animation : "1"
    }
    */
    var template = {
      icon: 'fa-bars',
      color: 'lightcoral',
      shape: 'star',
      prefix: 'fa',
      iconAnchor : [0,0],
      className : 'my-marker',
      iconSize :[35,35],
      number : "",
      animation : null
    }
    var offset = Math.PI*(1-2*(count-1)/count)/2;
    iconStyle?template['icon']='fa-'.concat(iconStyle):null;
    color?template['color']=color:null;
    iconIndex>0?template['iconAnchor'] = [-35*Math.cos(2*Math.PI*(iconIndex-1) /count+offset),35*Math.sin(2*Math.PI*(iconIndex-1) /count+offset)]:null;
    iconIndex>0?template['animation'] = iconIndex:null;
    className?template['className'] = template['className'].concat(" ",className):null;
    number?template['number'] = number :null;
    if(!iconIndex||iconIndex == 0) {
      template['isAnchor'] = true;
    }
    var outerHTMLElement = L.MyMarkers.icon(template).createIcon().outerHTML;
    return outerHTMLElement;
  }
  showIcons(marker){
    //console.log('showIcons',marker._icon.children);
    var count = 1;
    for (var obj in marker._icon.children) {
      if(obj>0){
        marker._icon.children[obj].className = marker._icon.children[obj].className.concat(' show');
      }
    }
    marker.dragging._marker._icon.style.width?marker.dragging._marker._icon.style.width = 35+"px":null;
    marker.dragging._marker._icon.style.height?marker.dragging._marker._icon.style.height = 35+"px":null;
  }
  replaceString(oldS, newS, fullS) {
    for (var i = 0; i < fullS.length; ++i) {
      if (fullS.substring(i, i + oldS.length) == oldS) {
        fullS = fullS.substring(0, i) + newS + fullS.substring(i + oldS.length, fullS.length);
      }
    }
    return fullS;
  }
  hideIcons(marker){
    //console.log('hideIcons',marker._icon.children);
    for (var obj in marker._icon.children) {
      if(obj>0){
        marker._icon.children[obj].className =this.replaceString(' show','',marker._icon.children[obj].className);
      }
    }
    marker.dragging._marker._icon.style.width ?marker.dragging._marker._icon.style.width= 35+"px":null;
    marker.dragging._marker._icon.style.height ?marker.dragging._marker._icon.style.height= 35+"px":null;
  }
  zoomToFeature(target) {
    var fitBoundsParams = {
      paddingTopLeft: [10,10],
      paddingBottomRight: [10,10],
      maxZoom : 14
    };
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }
  filterFeatures(feature, layer) {
    const test = (feature.properties.Name===(this.state.driversFilter));
    if (this.state.driversFilter === '*' || test !== false) {
      return true;
    }
  }
  markerAndIcons(info){
    var cur = this;
    var markerAndIconsString = "";
    var iconNum = info?info.length:null;
    //console.log("markerAndIcons",info,iconNum);
    if(info){
      for(var i=0;i<iconNum;i++){
        if(i==0){
          markerAndIconsString = markerAndIconsString.concat(cur.generateIcon(iconNum-1,i,info[i]));
        }else{
          markerAndIconsString = markerAndIconsString.concat(cur.generateIcon(iconNum-1,i,info[i][0],'CADETBLUE','surround',info[i][0]=="number"?info[i][1]:null));
        }
      }
    }else{
      markerAndIconsString = this.generateIcon();
    }
    return markerAndIconsString;
  }
  pointToLayer(feature, latlng) {

    var cur = this;
    var redMarker = this.generateIcon()
    if(feature.geometry.type =="Point"){
      var Marker1 = this.markerAndIcons(feature.properties.markerAndIcons?feature.properties.markerAndIcons:null);
      var markers = Marker1;
      var testMarker = L.marker(latlng,{icon: L.divIcon({className: 'markers', html:markers, iconSize:[35,35],iconAnchor : [17,42]}),riseOnHover:true})
                        .on('click',(e)=>{
                          console.log("click button, show sidebar",cur.props.actions);
                          cur.props.actions.clickMarker(e.target,feature);
                          document.getElementById('carte').style.width="50%";
                          //document.getElementById('testGlobal').setAttribute('test','555');
                          this.state.map.setView(e.target.getLatLng());
                        },);
      return testMarker;
    }else{
      return null;
    }
  }

  onEachFeature(feature, marker) {
    var cur = this;
    if (feature.geometry.type =="Point"&&feature.properties) {
      var isChanged = false;
      marker.on('mouseover', function (e) {
        if(!isChanged) {
          console.log(marker);
          cur.showIcons(marker);
          isChanged = true;
        }
      });
      marker.on('mouseout', function (e) {
        cur.hideIcons(marker);
        isChanged=false;
      });
  }
}

  init(id) {
    var cur = this;
    if (this.state.map) return;
    let map = L.map(id, config.params);
    map.on('click',function () {
      console.log("click map");
      cur.props.actions.closeSideBar();
      document.getElementById('carte').style.width="76%";
    })
    L.control.zoom({ position: "bottomleft"}).addTo(map);
    L.control.scale({ position: "bottomleft"}).addTo(map);
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    this.setState({ map:map, tileLayer:tileLayer});
  }

  render() {
    var cur = this;
    console.log("render map");
    return (
      <div id="mapUI">
        {
          cur.props.isTyping &&
            <LoadingPage/>
        }
        <div ref={(node) => { cur._mapNode = node}} id="map" />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  geoData:state.geoData,
  serverData:state.serverData,
  isTyping : state.isTyping,
  geojsonForPath : state.geojsonForPath,
  checkedItem : state.checkedItem
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
