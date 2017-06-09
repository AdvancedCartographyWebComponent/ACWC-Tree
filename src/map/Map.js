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
import Filter2 from './Filter2';
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
      markerLayer : null,
      geojson: null,
      driversFilter: '*',
      numUser: null,
      sidebar:null
    };
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
    this.generateIcon = this.generateIcon.bind(this);
    this.showIcons = this.showIcons.bind(this);
    this.hideIcons = this.hideIcons.bind(this);
  }

  componentDidMount() {

    // later, you can stop observing
    //observer.disconnect();
    if(this.isServer !=="false"){
      this.postData();
    }else{
      this.getData();
    }
    window.testValue = null;
    this.checkDataSource = setInterval(
      () => {
        //console.log("window.testValue",window.testValue);
        if(window.testValue&&(!this.testValue||md5(JSON.stringify(window.testValue))!=md5(JSON.stringify(this.testValue)))){
          console.log("differ");
          this.testValue = window.testValue;
        }
      },
      100
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.urlQuery&&this.props.geoData&&!this.state.geojson){
      this.setState({
        geojson:this.props.geoData
      });
    }
    if (!this.state.map&&this.state.geojson) {
      this.init(this._mapNode);
      var target = document.getElementById('testGlobal');

      this.postDataID = setInterval(
        () => {
          if(this.isServer!=="false"){
            this.postData();
          }
        },
        10000
      );
    };
    if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
      console.log(windowGlobal.testGlobal);
      this.addGeoJSONLayer(this.state.geojson);
    }
    if (this.state.driversFilter !== prevState.driversFilter) {
      this.filterGeoJSONLayer();
    }
    if (prevProps.serverData&&md5(JSON.stringify(this.props.serverData))!==md5(JSON.stringify(prevState.serverData))) {
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
    this.state.map.remove();
     clearInterval(this.postDataID);
  }

  getData() {
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
        cur.transformSparqlQueryToGeoJSON(res.data.results.bindings);
        cur.props.actions.getDataFromUrlForMap(cur.geoCollection);
        cur.setState({
          numUser: cur.geoCollection.features.length,
          geojson: cur.geoCollection
        });}
        else{
          cur.props.actions.getDataFromUrlForMap(res.data);
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
    this.state.geojsonLayer.clearLayers();
    this.state.markerLayer.clearLayers();
    this.state.geojsonLayer.addData(this.state.geojson);
    this.state.markerLayer.addLayer(this.state.geojsonLayer).addTo(this.state.map);
    this.zoomToFeature(this.state.geojsonLayer);
  }
  generateIcon(count,iconIndex,iconStyle,color,shape,className,iconSize,number){
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
        shape: "circle",
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
    shape?template['shape']=shape:null;
    iconIndex?template['iconAnchor'] = [-35*Math.cos(2*Math.PI*(iconIndex-1) /count+offset),35*Math.sin(2*Math.PI*(iconIndex-1) /count+offset)]:null;
    iconIndex?template['animation'] = iconIndex:null;
    className?template['className'] = template['className'].concat(" ",className):null;
    iconSize?template['iconSize'] = iconSize :null;
    number?template['number'] = number :null;
    if(!iconIndex||iconIndex == 0) {
      template['isAnchor'] = true;
    }
    var outerHTMLElement = L.MyMarkers.icon(template).createIcon().outerHTML;
    return outerHTMLElement;
  }
  showIcons(marker,num){
    console.log('showIcons',marker._icon.children);
    var count = 1;
    num?count = num:null;

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
    console.log('hideIcons',marker._icon.children);
    for (var obj in marker._icon.children) {
      if(obj>0){
        marker._icon.children[obj].className =this.replaceString(' show','',marker._icon.children[obj].className);
      }
    }
    marker.dragging._marker._icon.style.width ?marker.dragging._marker._icon.style.width= 35*1+"px":null;
    marker.dragging._marker._icon.style.height ?marker.dragging._marker._icon.style.height= 35*1+"px":null;
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
    const test = (feature.properties.NAME===(this.state.driversFilter));
    if (this.state.driversFilter === '*' || test !== false) {
      return true;
    }
  }
  pointToLayer(feature, latlng) {

    var cur = this;
    var redMarker = this.generateIcon()


    var iconNum = 6;//Change when have data
    //generateIcon(count,iconIndex,iconStyle,color,shape,className,iconSize,number)
    var Marker1 = this.generateIcon();
    var Marker2 = this.generateIcon(iconNum-1,1,'plane','CADETBLUE','star','surround')
    var Marker3 =this.generateIcon(iconNum-1,2,'battery-1','#5262b7','star','surround');
    var Marker4 =this.generateIcon(iconNum-1,3,'battery-1','#5262b7','star','surround');
    var Marker5 =this.generateIcon(iconNum-1,4,'battery-1','#5262b7','star','surround');
    var Marker6 =this.generateIcon(iconNum-1,5,'battery-1','#5262b7','star','surround');
    var markers = Marker1.concat(Marker2,Marker3,Marker4,Marker5,Marker6);
    var testMarker = L.marker(latlng,{icon: L.divIcon({className: 'markers', html:markers, iconSize:[35,35],iconAnchor : [17,42]}),riseOnHover:true})
                      .on('click',(e)=>{
                        console.log("click button, show sidebar",cur.props.actions);
                        cur.props.actions.clickMarker(e.target,feature);
                        document.getElementById('carte').style.width="50%";
                        //document.getElementById('testGlobal').setAttribute('test','555');
                        this.state.map.setView(e.target.getLatLng());
                      },);
    return testMarker;
  }

  onEachFeature(feature, marker) {
    var cur = this;
    var iconNum = 6;//Change when have data
    if (feature.properties && feature.properties.NAME) {

      var icon_url = "favicon.ico";
      /*const popupContent = `<img src = ${icon_url}></img><h3>${feature.properties.NAME}</h3>
              <strong>Is Here</strong>`;
      var popup = L.popup().setContent(popupContent);*/
      var isChanged = false;
      //marker.bindPopup(popup,{offset:L.point(1, -32)});
      marker.on('mouseover', function (e) {
        if(!isChanged) {
          console.log(marker);
          cur.showIcons(marker,iconNum);
          //this.openPopup();
          isChanged = true;
        }
      });
      marker.on('mouseout', function (e) {
        //this.closePopup();
        cur.hideIcons(marker);
        //this.setIcon(L.divIcon({className: 'marker', html:Marker1, iconSize:[35,45],iconAnchor : [17,42]}));
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
    return (

      <div id="mapUI">

        {
          cur.state.geojson &&false&&
            <Filter2
              curState={cur.state.geojson}
              filterUsers={cur.updateFilter} />
          }

        <div ref={(node) => { cur._mapNode = node}} id="map" />
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
