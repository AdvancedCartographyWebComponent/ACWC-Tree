import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster'
import serverContext from '../../Context/Server.config.js'
import mapContext from '../../Context/Map.config.js'
import CommandModal from '../Command/CommandModal'
import LoginModal from '../Login/LoginModal'
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'font-awesome/css/font-awesome.min.css'
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
import LoadingPage from './LoadingPage';
import axios from 'axios';
import md5 from 'MD5';
import './css/markers.css'
import './marker-icon/marker.js'
let config = {};
var tableData = [];
config.params = mapContext.params;
config.tileLayer = mapContext.tileLayer;
//TODO ?zoom=7&&centerx=48.836703centery=2.334345
const USER_TYPE = serverContext.USER_TYPE;
const SERVICE_PORT = serverContext.SERVICE_PORT;
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      markerCluster : null,
      geojson: null,
      driversFilter: '*',
      numUser: null,
      sidebar:null,
      isTableMap : false,
      isCommand : false,
      isLogin : true,
      username:"",
      password:"",
      isLoginFailed:false,
      session : null,
      isRestoring : true
    };
    this.isServer = this.props.isServer?this.props.isServer:"false";
    this.geojsonDivision = {};
    this.geoPathDivision = {};
    this.geojsonLayer = null;
    this.mapDataUrl = this.props.mapDataUrl?this.props.mapDataUrl:null;
    this.geoCollection = {};
    this.prevGeoCollection = null;
    this._mapNode = null;
    this.isTyping = false;
    this.onEachFeature = this.onEachFeature.bind(this);
    this.pointToLayer = this.pointToLayer.bind(this);
    this.filterFeatures = this.filterFeatures.bind(this);
    this.filterGeoJSONLayer = this.filterGeoJSONLayer.bind(this);
    this.getDataFromUrl = this.getDataFromUrl.bind(this);
    this.getScooterDataFromServer = this.getScooterDataFromServer.bind(this);
    this.updateScooterDataFromServer = this.updateScooterDataFromServer.bind(this);
    this.formatScooterData = this.formatScooterData.bind(this);
    this.getScooterDeviceData = this.getScooterDeviceData.bind(this);
    this.getScooterPositionData = this.getScooterPositionData.bind(this);
    this.getScooterGroupData = this.getScooterGroupData.bind(this);
    this.generateIcon = this.generateIcon.bind(this);
    this.showIcons = this.showIcons.bind(this);
    this.hideIcons = this.hideIcons.bind(this);
    this.markerAndIcons = this.markerAndIcons.bind(this);
    this.updateGeojsonPath = this.updateGeojsonPath.bind(this);
    this.handleTMButtonClick = this.handleTMButtonClick.bind(this);
    this.handleTButtonClick = this.handleTButtonClick.bind(this);
    this.loginScooterServer = this.loginScooterServer.bind(this);
    this.restoreSession = this.restoreSession.bind(this);

  }

  componentDidMount() {
    this.restoreSession();
    if (!this.state.map) {
      this.init(this._mapNode);
      //var target = document.getElementById('testGlobal');
      //console.log("map init");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    ////console.log("checkedItem",this.props.checkedItem);
    if(this.props.isTyping){
    }
    else{
      if ((this.props.geoData||this.props.geojsonForPath) && this.state.map && !this.state.markerCluster ) {
        //console.log("test2 geodata",this.props.geoData);
        this.addGeoJSONLayer(this.props.geoData,this.props.geojsonForPath);
        return;
      }
      if(prevProps.isTrajet !== this.props.isTrajet){
        if(this.props.isTrajet) {this.updateGeojsonPath(this.props.geojsonForPath);}
        else{
          for (var i in this.geoPathDivision) {
            this.state.map.removeLayer(this.geoPathDivision[i]);
          }
          this.geoPathDivision = {};
        }
        return;
      }
      if(md5(JSON.stringify(prevProps.checkedItem))!==md5(JSON.stringify(this.props.checkedItem))){
        if(this.props.isTrajet){
          for(var index in this.geojsonDivision){
            if(this.props.checkedItem.length===0){
              this.state.markerCluster.addLayer(this.geojsonDivision[index]);
              this.state.map.addLayer(this.geoPathDivision[index]);
            }else {
              if(this.props.checkedItem.indexOf(index)===-1){
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
      }
      if(md5(JSON.stringify(prevProps.geoData))!==md5(JSON.stringify(this.props.geoData))){
        //console.log("geoData changed");
        this.filterGeoJSONLayer();
        return;
      }
    }
  }

  componentWillUnmount() {
    this.state.map.remove();
  }

  handleTMButtonClick(event){
    this.props.actions.toggleTable(!this.state.isTableMap,"1");
    this.setState({
      isTableMap:!this.state.isTableMap
    })
  }
  handleTButtonClick(event){
    this.props.actions.toggleTable(true,"2");
    this.setState({
      isTableMap:false
    })
  }
  getData() {
    if(this.mapDataUrl){
      //console.log("before getDataFromUrl",this.mapDataUrl);
      this.getDataFromUrl(this.mapDataUrl);
      if(window.mapDataUrl) delete window.mapDataUrl;
    }
    this.isTrajet = this.props.isTrajet;
    this.checkDataSource = setInterval(
      () => {
        ////console.log("window.mapDataUrl",window.mapDataUrl);
        if(window.mapDataUrl&&(!this.mapDataUrl||md5(JSON.stringify(window.mapDataUrl))!==md5(JSON.stringify(this.mapDataUrl)))){
          //console.log("mapDataUrl differ");
          this.mapDataUrl = window.mapDataUrl;
          this.getDataFromUrl(this.mapDataUrl);
          delete window.mapDataUrl;
        }
        if(window.geojsonUrl&&(!this.geojsonUrl||md5(JSON.stringify(window.geojsonUrl))!==md5(JSON.stringify(this.geojsonUrl)))){
          //console.log("geojsonUrl differ");
          this.geojsonUrl = window.geojsonUrl;
          this.getGeojsonFromUrl(window.geojsonUrl);
          delete window.geojsonUrl;
        }
        if(window.isTrajet&&window.isTrajet!==this.isTrajet){
          //console.log("isTrajet differ");
          this.isTrajet = window.isTrajet;
          this.props.actions.isTrajet(this.isTrajet);
          delete window.isTrajet;
        }
        if(window.isScooter&&window.isScooter!==this.isScooter){
          //console.log("isScooter differ");
          this.isScooter = window.isScooter;
          this.props.actions.isScooter(this.isScooter);
          delete window.isScooter;
        }
      },
      100
    );
  }
  getDataFromUrl(url){
    var cur = this;
    //console.log("map data from url",url);
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: url,
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
      cur.props.actions.getDataFromUrlForMap(res.data);
    }).catch(function (error) {
      //console.log(error);
    });;
  }
  getGeojsonFromUrl(url){
    var cur = this;
    //console.log("getGeojsonFromUrl",url);
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: url,
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
        cur.props.actions.receiveGeoDataFromUrl(res.data);
    }).catch(function (error) {
      //console.log(error);
    });
  }
  restoreSession(){
    let cur = this;
    axios.defaults.withCredentials = true;
    let request = {
      method: 'get',
      url: "http://vps92599.ovh.net:8082/api/session"
    };
    let step1 = new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        resolve(res.data);
      }).catch(function (error) {
        reject(error);
      });
    });
    step1.then(
      (value)=>{
        //console.log("log success",value);
        this.setState({
          isLogin:false,
          session:value,
          isRestoring:false
        });
        cur.props.actions.sendSession(value);
        cur.updateScooterDataFromServer();
        cur.updateScooterData = setInterval(()=>{
          cur.updateScooterDataFromServer();
        },20000);
      }
    ).catch(
      (value)=>{
        this.setState({
          isRestoring:false
        });
        //console.log("log failed");
      }
    );
  }
  loginScooterServer(){
    let cur = this;
    let email = this.username.value;
    let password = this.password.value;
    let data = {
      email: this.username.value,
      password: this.password.value,
      undefined : false
    };
    let formData="";
    axios.defaults.withCredentials = true;
    for (var i in data) {
      formData = formData.concat(i,"=",data[i],'&')
    }
    formData = formData.substr(0,formData.length-1);
    let request = {
      method: 'post',
      url: "http://vps92599.ovh.net:8082/api/session",
      data: formData
    };
    let step1 = new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        //console.log("result ",res);
        resolve(res.data);
      }).catch(function (error) {
        reject(error);
      });
    });
    step1.then(
      (value)=>{
        //console.log("log success",value);
        this.setState({
          isLogin:false,
          session:value
        });
        cur.props.actions.sendSession(value);
        cur.updateScooterDataFromServer();
        cur.updateScooterData = setInterval(()=>{
          cur.updateScooterDataFromServer();
        },20000);
      }
    ).catch(
      (value)=>{
        this.setState({
          isLoginFailed:true
        });
        //console.log(value);
      }
    );
  }
  /*updateScooterDataFromServer(){
    var cur = this;
    if(window.mapDataUrl) delete window.mapDataUrl;
    //console.log("get Scooter Data From Server");
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: "http://www.mobion.io/lastposition.php"
    }).then(function(res) {
      //console.log("result",res.status);
      if(res.status==200){
        //cur.getScooterDataFromServer();
        let Devices = cur.getScooterDeviceData();
        let Groups = cur.getScooterGroupData();
        let Positions = cur.getScooterPositionData();
        Promise.all([Devices, Groups, Positions]).then(values => {
          //console.log("get data from java server",values);
          cur.formatScooterDataAll(values);
        });
      }
    }).catch(function (error) {
      //console.log(error);
    });;
  }*/
  updateScooterDataFromServer(){
    var cur = this;
    let Devices = cur.getScooterDeviceData();
    let Groups = cur.getScooterGroupData();
    let Positions = cur.getScooterPositionData();
    Promise.all([Devices, Groups, Positions]).then(values => {
      //console.log("get data from java server",values);
      cur.formatScooterDataAll(values);
    });
  }
  getScooterDataFromServer(){
    var cur = this;
    //console.log("get Scooter Data From Server");
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    axios({
      method: 'get',
      url: "http://www.mobion.io/fichier.txt",
      headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain'
      }
    }).then(function(res) {
      if (res.status==304||res.status==200) {
        ////console.log("result",res.data);
        cur.formatScooterData(res.data);
      }

    }).catch(function (error) {
      //console.log(error);
    });;
  }
  formatScooterData(data){
    let scooterData = {
      "@graph":[]
    }
    let lines = data.split(/[\r\n]+/g);
    //console.log("format scooter data ",lines);
    lines.map((value,index)=>{
      if(value.length>0){
        let details = value.split(' | ');
        //863977030761766 | Scooter79 | Kilometre | 2017-07-13 13:27:35 | 48.8371616666667 | 2.334425 | 74 Avenue Denfert-Rochereau, Paris, Île-de-France, FR
        let scooterDetails={
          "mobile":"imei:"+details[0],
          "mileage" : details[2]+"Km",
          "date":details[3],
          "lat":details[4],
          "long":details[5],
          "address":details[6]
        }
        scooterData["@graph"].push(scooterDetails);
      }
    });
    this.props.actions.isScooter(true);
    this.props.actions.getDataFromUrlForMap(scooterData);
    //console.log("formatScooterData",scooterData);
  }
  findPositonIndex(id,data){
    for (var i = 0; i < data.length; i++) {
      if(data[i]["deviceId"]===id){
        return i;
      }
    }
    return -1;
  }
  findGroupIndex(id,data){
    for (var i = 0; i < data.length; i++) {
      if(data[i]["id"]===id){

        return i;
      }
    }
    return -1;
  }
  formatScooterDataAll(data){
    let scooterData = {
      "@graph":[]
    }
    let scooterList = {
      "@graph":[]
    }
    let scooterTableList = [];
    //[Devices, Groups, Positions]
    data[0].map((value,index)=>{
      if(value){
        let positionIndex = this.findPositonIndex(value["id"],data[2]);
        let groupIndex = this.findGroupIndex(value["groupId"],data[1]);
        //console.log("positionIndex",positionIndex);
        //console.log("positionIndex",groupIndex);
        //863977030761766 | Scooter79 | Kilometre | 2017-07-13 13:27:35 | 48.8371616666667 | 2.334425 | 74 Avenue Denfert-Rochereau, Paris, Île-de-France, FR
        let scooterDetails={
          "mobile":value["uniqueId"]?"imei:"+value["uniqueId"]:"To be getted",
          "mileage" : positionIndex>=0?(data[2][positionIndex]["attributes"]["totalDistance"]/1000).toFixed(2)+"Km":"To be getted",
          "date":positionIndex>=0?data[2][positionIndex]["deviceTime"]:"To be getted",
          "lat":positionIndex>=0?data[2][positionIndex]["latitude"]:null,
          "long":positionIndex>=0?data[2][positionIndex]["longitude"]:null,
          "speed":positionIndex>=0?data[2][positionIndex]["speed"]+"Km/h": "To be getted",
          "address":positionIndex>=0?data[2][positionIndex]["address"]:"To be getted",
          "attributes":value["attributes"]?value["attributes"]:"To be getted",
          "category":value["category"]?value["category"]:"To be getted",
          "contact":value["contact"]?value["contact"]:"To be getted",
          "geofenceIds":value["geofenceIds"]?value["geofenceIds"]:"To be getted",
          "groupId":value["groupId"]?value["groupId"]:"To be getted",
          "group":groupIndex>=0?data[1][groupIndex]["name"]:"Unknown Group",
          "id":value["id"]?value["id"]:"To be getted",
          "lastUpdate":value["lastUpdate"]?value["lastUpdate"]:"To be getted",
          "model":value["model"]?value["model"]:"To be getted",
          "name":value["name"]?value["name"].replace( /\D+/g, ''):"To be getted",
          "phone":value["phone"]?value["phone"]:"To be getted",
          "positionId":value["positionId"]?value["positionId"]:"To be getted",
          "status" : value["status"]?value["status"]:"To be getted"
        }

        let scooter = {
          "@id":value["name"].replace( /\D+/g, ''),
          "broader" : "ScooterList"
        }
        let timeString = null;
        if(positionIndex>=0){
          let deviceTime = data[2][positionIndex]["deviceTime"];
          let updateTime = new Date(deviceTime);
          let clientTime = new Date();
          let timeDifs = ((clientTime.getTime()-updateTime.getTime())/60/1000).toFixed(1);
          timeString = timeDifs?(timeDifs>=60?(timeDifs>=1440?(timeDifs/1440).toFixed(1)+' Days ago':(timeDifs/60).toFixed(1)+' Hours ago'):(timeDifs)+' Minutes ago'):null;
        }
        let scooterListTableData = {
          "name":value["name"].replace( /\D+/g, ''),
          "updateTime":timeString?timeString:"Unknown",
          "status":value["status"]?value["status"]:"Not Getted"
        }
        //console.log("scooterList",scooterListTableData);
        scooterData["@graph"].push(scooterDetails);
        scooterTableList.push(scooterListTableData);
        scooterList["@graph"].push(scooter);
        //console.log("scooterDetails",scooterData,scooterList);
      }
    });
    this.props.actions.isScooter(true);
    this.props.actions.getDataFromUrlForTree(scooterList);
    this.props.actions.getDataFromUrlForMap(scooterData);
    this.props.actions.sendScooterTableList(scooterTableList);
    //console.log("formatScooterDataALL",scooterData,scooterList);
  }
  getScooterDeviceData(){
    let request = {
      method: 'get',
      url: "http://vps92599.ovh.net:8082/api/devices",
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    };
    return new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        resolve(res.data);
        //console.log("getScooterDeviceData",Devices);
      }).catch(function (error) {
        reject(error);
      });
    });
  }
  getScooterPositionData(){
    let request = {
      method: 'get',
      url: "http://vps92599.ovh.net:8082/api/positions",
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    };
    return new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        resolve(res.data);
        //console.log("getScooterDeviceData",Devices);
      }).catch(function (error) {
        reject(error);
      });
    });
  }

  getScooterGroupData(){
    let request = {
      method: 'get',
      url: "http://vps92599.ovh.net:8082/api/groups",
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    };
    return new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        resolve(res.data);
        //console.log("getScooterDeviceData",Devices);
      }).catch(function (error) {
        reject(error);
      });
    });
  }
  addGeoJSONLayer(geojson,geojsonForPath) {
    var markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom : false
    });
    var geojsonLayer;
    markerCluster.on('clusterclick', function (a) {
       if(a.layer._zoom === mapContext.params.maxZoom){
         if(a.layer.getAllChildMarkers().length>100){
           //console.log('cluster ' + a.layer.getAllChildMarkers().length);
         }else {
           a.layer.spiderfy();
         }

       }
    });
    if(this.props.isTrajet){
      for (var geojsonIndex in geojson) {
          geojsonLayer = L.geoJson(geojson[geojsonIndex], {
          onEachFeature: this.onEachFeature,
          pointToLayer: this.pointToLayer,
          filter: this.filterFeatures
        });
        this.geojsonDivision[geojson[geojsonIndex].features[0].properties.Name] = geojsonLayer;
        markerCluster.addLayer(geojsonLayer);
      }
    }else{
      //console.log("!isTrajet geojson",geojson);
        geojsonLayer = _.size(geojson)>0?L.geoJson(geojson, {
        onEachFeature: this.onEachFeature,
        pointToLayer: this.pointToLayer,
        filter: this.filterFeatures
      }):null;
      this.geojsonLayer = geojsonLayer;
      geojsonLayer&&this.props.isScooter?this.zoomToFeature(this.geojsonLayer):null;
      geojsonLayer?markerCluster.addLayer(geojsonLayer):null;
    }
    geojsonLayer?geojsonLayer.addTo(this.state.map):null;
    var cogList = document.getElementsByClassName("fa-cog");
    //console.log("cogList",cogList);
    for (var i = 0; i < cogList.length; i++) {
      cogList[i].parentElement.onclick=(e)=>{
        e.stopPropagation();
        this.setState({
          isCommand : true
        });
      }
    }
    this.props.isTrajet?this.updateGeojsonPath(geojsonForPath):null;
    //TODO
    this.setState(
      {
        markerCluster:markerCluster
     });
  }
  updateGeojsonPath(geojsonForPath){
    //console.log("this.isTrajet",this.isTrajet);
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
    for (var index in geojsonForPath["features"]) {
      var geojsonLayerForPath = L.geoJson(geojsonForPath["features"][index], {
        style: function(feature) {
          switch (feature.properties.Name) {
              case "71": return myStyle_1;
              case "97":   return myStyle_2;
          }
        }
      });
      geojsonLayerForPath?geojsonLayerForPath.addTo(this.state.map):null;
      this.geoPathDivision[geojsonForPath["features"][index]["properties"]["Name"]] = geojsonLayerForPath;
    }
  }
  filterGeoJSONLayer() {
    this.state.markerCluster.clearLayers();

    for (var i in this.geoPathDivision) {
      this.state.map.removeLayer(this.geoPathDivision[i]);
    }
    this.geojsonLayer?this.geojsonLayer.clearLayers():null;
    this.geojsonDivision = {};
    this.geoPathDivision = {};
    this.addGeoJSONLayer(this.props.geoData,this.props.geojsonForPath);
    //if(!this.props.isTrajet)this.zoomToFeature(this.geojsonDivision);
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
    if(!iconIndex||iconIndex === 0) {
      template['isAnchor'] = true;
    }
    var iconHTMLElement =  L.MyMarkers.icon(template).createIcon();
    var outerHTMLElement = iconHTMLElement.outerHTML;
    return outerHTMLElement;
  }
  showIcons(marker){
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
      maxZoom : 18
    };
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }
  filterFeatures(feature, layer) {
    console.log("filterFeatures",feature);
    if(!feature.geometry.coordinates[0]||!feature.geometry.coordinates[1]) return false;
    return true;
  }
  markerAndIcons(info){
    //generateIcon(count,iconIndex,iconStyle,color,className,number)
    var cur = this;
    ////console.log("info",info);
    var markerAndIconsString = "";
    var iconNum = info?info.length:0;
    if(info){
      for(var i=0;i<iconNum;i++){
        markerAndIconsString = markerAndIconsString.concat(cur.generateIcon(
          iconNum-1,
          i,
          info[i]['icon'],
          info[i]['color'],
          i===0?null:'surround',
          info[i]['icon']==="number"?info[i]['number']:null));
        //markerAndIconsString = markerAndIconsString.concat(cur.generateIcon(iconNum-1,i,info[i][0],'CADETBLUE','surround',info[i][0]==="number"?info[i][1]:null));
      }
    }else{
      markerAndIconsString = this.generateIcon();
    }
    return markerAndIconsString;
  }
  pointToLayer(feature, latlng) {
    var cur = this;
    if(feature.geometry.type ==="Point"){
      var markers = this.markerAndIcons(feature.properties.markerAndIcons?feature.properties.markerAndIcons:null);
      var testMarker = L.marker(latlng,{icon: L.divIcon({className: 'markers', html:markers, iconSize:[35,35],iconAnchor : [17,42]}),riseOnHover:true})
                        .on('click',(e)=>{
                          //console.log("click button, show sidebar",cur.props.actions);
                          cur.props.actions.clickMarker(e.target,feature);
                          document.getElementById('carte').style.width="48%";
                          setTimeout(()=>{
                            this.state.map.invalidateSize();
                            this.state.map.panTo(e.target.getLatLng());
                          },501);

                        },);
      return testMarker;
    }else{
      return null;
    }
  }

  onEachFeature(feature, marker) {
    var cur = this;
    if (feature.geometry.type ==="Point"&&feature.properties) {
      var isChanged = false;
      marker.on('mouseover', function (e) {
        if(!isChanged) {
          //console.log(marker);
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
    //TODO set params from url or global value
    let map = L.map(id, config.params);
    map.on('click',function () {
      cur.props.actions.closeSideBar();
      document.getElementById('carte').style.width="74%";
      setTimeout(()=>{
        map.invalidateSize();
      },501);
    })
    L.control.zoom({ position: "bottomleft"}).addTo(map);
    L.control.scale({ position: "bottomleft"}).addTo(map);
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);
    ////console.log("map",map._layers[Object.keys(map._layers)[0]]);
    this.props.actions.sendMapRef(map);
    this.setState({ map:map, tileLayer:tileLayer});
  }

  render() {
    var cur = this;
    const buttonGroupStyle ={
      "margin": "10px",
      "padding": "0px",
      "cursor": "pointer",
      "position":"absolute",
      "right":"2%"
    }
    //console.log("render map");

    return (
      <div id="mapUI">
        {
          cur.props.isTyping &&
            <LoadingPage/>
        }
        {
          cur.state.isCommand &&
            <CommandModal
              close={()=>{
                cur.setState({
                  isCommand : false
                });
              }}
              show={cur.state.isCommand}/>
        }
        {
          cur.state.isLogin &&
            <LoginModal
              close={()=>{
                cur.setState({
                  isLogin : false
                });
              }}
              username = {(username)=>{cur.username = username}}
              password = {(password)=>{cur.password = password}}
              login = {()=>{cur.loginScooterServer()}}
              isLoginFailed = {this.state.isLoginFailed}
              isRestoring = {this.state.isRestoring}
              show={cur.state.isLogin}/>
        }
        <div className="btn-group-vertical btn-group-sm leaflet-control" style={buttonGroupStyle}>
          <button type="button" className="btn btn-default">
            <i className="fa fa-crosshairs"></i>
          </button>
          <button type="button" className="btn btn-info" disabled = {!this.props.tableData||this.props.tableData.length===0?true:false} onClick = {this.handleTMButtonClick}>
            <i className="fa fa-map"></i>/
            <i className="fa fa-table"></i>
          </button>
          <button type="button" className="btn btn-primary" disabled = {!this.props.tableData||this.props.tableData.length===0?true:false} onClick = {this.handleTButtonClick}>
            <i className="fa fa-table"></i>
          </button>
          <button type="button" className="btn btn-danger">
            <i className="fa fa-cog"></i>
          </button>
          <button type="button" className="btn btn-success">
            <i className="fa fa-check"></i>
          </button>
          <button type="button" className="btn btn-warning">
            <i className="fa fa-exclamation-triangle"></i>
          </button>
        </div>
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
  checkedItem : state.checkedItem,
  isTrajet : state.isTrajet,
  isScooter : state.isScooter,
  tableData : state.tableData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
