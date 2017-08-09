const actionTypes = require('../actiontype/actionType');
const defaultTreeData = {"@graph":[]};//require('json!../data/test/World_Heritage_Sites.skos.jsonld');
//const defaultTreeData = require('json!../data/test/scooterTree.jsonld');
const defaultMapData = {"@graph":[]};//require('json!../data/test/exemple_villes.jsonld');
//const defaultMapData = require('json!../data/test/scooter2.jsonld');
const ScooterInfo = require('../Context/scooterInfo');
var jsonld = require('jsonld');
var _ = require('lodash');
var simplify = require('simplify-geometry');
var Immutable = require('immutable');
var treeConstructor = function (rawData,countList,root,rawMapData, checkedList){
  if(!countList["Exclued Data"]||countList["Exclued Data"]==0){
    var tree ={};
  }else{
    var tree ={
      "Exclued Data":{
        checked: false,
        checkbox: false,
        collapsed:true,
        children:{},
        markerAndIcons:[],
        num:countList["Exclued Data"]
      }
    };
  }
  var timeList = updateTime(rawMapData);
  var scooterStatus = status(rawMapData);
  var treeData = buildTree(tree,root,rawData["@graph"],countList,timeList,scooterStatus,checkedList);
  for(var num in root){
    countParentsNum(treeData,formatString(root[num]));
  }
  console.log("treeData",treeData);
  return treeData;
}
var treeNameMap = function(rawTreeData){
  var treeNameMap={};
  console.log("treeNameMap",rawTreeData);
  rawTreeData["@graph"].map((value,index)=>{
    if(!treeNameMap[value["@id"]]&&value["@id"]&&value["skos:prefLabel"]){
      treeNameMap[value["@id"]]=value["skos:prefLabel"]
    }
  })
  console.log("treeNameMap result",treeNameMap);
  return treeNameMap
}
var formatString = function(strings){
  return strings;
  var temp = strings.split(':');
  //console.log("formatString",strings);
  try {
    var format =temp.length===1?temp[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," "):
                                temp[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
    return format
  } catch (e) {
    console.log("format error",strings);
  }


}
var buildTree = function(tree,parentId,rawData,countList,TimeList, Status, CheckedList){
  rawData.map((value)=>{
    var id = value["@id"]?value["@id"]:"Default ID";
    var broader = value["broader"]?value["broader"]:null;
    var name = value["prefLabel"]?value["prefLabel"]["@value"]:null;
    var language = value["prefLabel"]?value["prefLabel"]["@language"]:null;
    var markerAndIcons = value["markerAndIcons"]?value["markerAndIcons"]:null;//[{"icon":"motorcycle","color":"CADETBLUE","number":null}];
    var updateTime = TimeList?(TimeList[id]?TimeList[id]:null):null;
    var scooterStatus = Status?(Status[id]?Status[id]:null):null;
    if((typeof broader === 'object')&&broader){
      broader.map((value)=>{
        if (parentId.indexOf(value)!=-1) {
          if(formatString(value) in tree){
            tree[formatString(value)]["children"][formatString(id)] = {
              checked: CheckedList?(CheckedList.indexOf(id)===-1?false:true):false,
              checkbox: true,
              collapsed:true,
              children:{},
              markerAndIcons:markerAndIcons,
              num:countList[formatString(id)]?countList[formatString(id)]:0,
              updateTime : updateTime,
              scooterStatus : scooterStatus
            };
          }
          else{
            var child = {};
            child[formatString(id)]= {
              checked: CheckedList?(CheckedList.indexOf(id)===-1?false:true):false,
              checkbox: true,
              collapsed:true,
              children:{},
              markerAndIcons:markerAndIcons,
              num:countList[formatString(id)]?countList[formatString(id)]:0,
              updateTime : updateTime,
              scooterStatus : scooterStatus
            };
            tree[formatString(value)] = {
              checked: false,
              checkbox: true,
              collapsed:false,
              children:child,
              markerAndIcons:[],
              num:0
            };
          }
          buildTree(tree[formatString(value)]["children"],[id],rawData,countList,TimeList);
        }
      })
    }
    else if(broader){
      if (parentId.indexOf(broader)!==-1) {
        if(formatString(broader) in tree){
          tree[formatString(broader)]["children"][formatString(id)] = {
            checked: CheckedList?(CheckedList.indexOf(id)===-1?false:true):false,
            checkbox: true,
            collapsed:true,
            children:{},
            markerAndIcons:markerAndIcons,
            num:countList[formatString(id)]?countList[formatString(id)]:0,
            updateTime : updateTime,
            scooterStatus : scooterStatus
          };
        }
        else{
          var child = {};
          child[formatString(id)]= {
            checked: CheckedList?(CheckedList.indexOf(id)===-1?false:true):false,
            checkbox: true,
            collapsed:true,
            children:{},
            markerAndIcons:markerAndIcons,
            num:countList[formatString(id)]?countList[formatString(id)]:0,
            updateTime : updateTime,
            scooterStatus : scooterStatus
          };
          tree[formatString(broader)]={
            checked: false,
            checkbox: true,
            collapsed:false,
            children:child,
            markerAndIcons:[],
            num:0
          };
        }
        buildTree(tree[formatString(broader)]["children"],[id],rawData,countList,TimeList);
      }
    }
  });
  //console.log("buildTree tree",tree);
  return tree
}
var checkedItem = function(treeData,checkedList){
  for(var obj in treeData){
    if(_.size(treeData[obj]["children"])>0){
      treeData[obj]["checked"]&&checkedList.indexOf(obj)===-1?checkedList.push(obj):null;
      checkedItem(treeData[obj]["children"],checkedList);
    }
    else{
      treeData[obj]["checked"]&&checkedList.indexOf(obj)===-1?checkedList.push(obj):null;
    }
  }
  console.log("checkedList",checkedList);
  return checkedList;
}
var countItem = function(geoData,isTrajet){
  if(_.size(geoData["@graph"])>0){
    var countList = geoData["@graph"].reduce(function (allNames, instance) {
      var name = formatString(instance["subject"]||instance["mobile"]?instance["subject"]||ScooterInfo[parseInt(formatString(instance["mobile"].split(':')[1]))]:"Exclued Data");
      if (name in allNames) {
        allNames[name]++;
      }
      else {
        allNames[name] = 1;
      }
      var graph = instance["@graph"]?instance["@graph"]:null;
      if (graph&&graph.length>=0) {
        for (var i = 0; i < graph.length; i++) {
          if (graph[i]["@id"] in allNames) {
            allNames[graph[i]["@id"]]++;
          }
          else {
            allNames[graph[i]["@id"]] = 1;
          }
        }
      }
      return allNames;
    }, {});
  }else{
    var countList = {};
  }
  console.log("countList",countList);
  return countList;
}
var updateTime = function(rawData){
  let updateTime = {};
  rawData["@graph"].map((instance,index)=>{
    var scooterId = instance["mobile"]?instance["mobile"].split(':')[1]:null;
    scooterId?scooterId =ScooterInfo[parseInt(scooterId)]:null;
    updateTime[scooterId] = instance["date"]
  })
  console.log("updateTime",updateTime);
  return updateTime;
}
var status = function(rawData){
  let status = {};
  rawData["@graph"].map((instance,index)=>{
    var scooterId = instance["mobile"]?instance["mobile"].split(':')[1]:null;
    scooterId?scooterId =ScooterInfo[parseInt(scooterId)]:null;
    status[scooterId] = instance["status"]
  })
  console.log("status",status);
  return status;
}
var findRoot = function(data,stateRoot){
  var flattenId = [];
  var flattenBroader = [];
  var tempRoot = [];
  data["@graph"].map((value)=>{
    var id = value["@id"];
    var broader;
    if(value["broader"]){
      broader = value["broader"];
    }else {
      tempRoot.push(value["@id"]);
    }
    if(typeof broader=="object"){
      for(var obj in broader){
        flattenBroader.indexOf(broader[obj])==-1?flattenBroader.push(broader[obj]):null;
      }
    }else {
      flattenBroader.indexOf(broader)==-1?flattenBroader.push(broader):null;
    }
    flattenId.indexOf(id)==-1?flattenId.push(id):null;

  })
  var root =tempRoot.length>0?tempRoot:_.difference(flattenBroader,flattenId);
  //console.log("find root",root,flattenId,flattenBroader);
  return [root,flattenId,flattenBroader];

}
var countParentsNum = function(tree,parentId){
  if(tree[parentId]["children"]&&_.size(tree[parentId]["children"])>0){
    for(var obj in tree[parentId]["children"]){
      tree[parentId]["num"]=tree[parentId]["num"]+countParentsNum(tree[parentId]["children"],obj);
    }
    return tree[parentId]["num"]
  }
  else{
    return tree[parentId]["num"];
  }
}
var linkStringInLabel = function(labels){
  var stringFinal="";
  if(!labels["@value"]){
    for(var obj in labels){
      stringFinal =labels[obj]["@value"].concat(stringFinal);
    }
  }else{
    stringFinal = labels["@value"];
  }
  return stringFinal;
}
var globalContentSearch = function(rawData,isScooter,isTrajet,checkedItem,keyword){
  var geojson = {};
  var dataForTable = [];
  var geojsonForPath = {
  "type": "FeatureCollection",
  "features": []
  };
  var relatedRawData={
    "@graph":[]
  }
  var matchedRawData={
    "@graph":[]
  }
  var geoLine = {};
  var keyWordList = _.words(_.toLower(keyword),/\S*\w/g);
  rawData["@graph"].map((instance,index) =>{
    var timestamp = instance["date"]||instance["http://purl.org/dc/terms/date"]?instance["date"]||instance["http://purl.org/dc/terms/date"]:null;
    var imei = instance["mobile"]?instance["mobile"].split(':')[1]:null;
    var scooterId = instance["name"].replace( /\D+/g, ''),
    timestamp = new Date(timestamp);
    var name = formatString(instance["label"]?linkStringInLabel(instance["label"]):"scooter");
    var subject = formatString(instance["subject"]?instance["subject"]:scooterId?scooterId:"Exclued Data");
    var graph = instance["@graph"]?instance["@graph"]:null;
    var abstract = formatString(instance["abstract"]?instance["abstract"]["@value"]:"No Abstract Found");
    var markerAndIcons = instance["markerAndIcons"]?instance["markerAndIcons"]:null;
    var lat = instance["lat"];
    var long = instance["long"];
    var mileage = instance["mileage"]?instance["mileage"]:null;
    var address = instance["address"]?instance["address"]:null;
    var group = instance["group"]?instance["group"]:null;
    var phone = instance["phone"]?instance["phone"]:null;
    var speed = instance["speed"]?instance["speed"]:null;
    var status = instance["status"]?instance["status"]:null;
    var related = false;
    var matched = false;
    var temp = (_.values(instance));
    //console.log('globalContentSearch',temp);
    if(_.size(keyWordList)>0){
      for(var obj in temp){
        if(!related){
          if (typeof temp[obj] != 'object'){
            for(var index in keyWordList){
              if(!related){
                if(_.toLower(temp[obj]).includes(keyWordList[index])||_.toLower(scooterId).includes(keyWordList[index])){
                    related = true;
                    //TODO read data and construct a table of "@graph", then if linked to "@graph", checked
                    if(!checkedItem||checkedItem.length===0||_.indexOf(checkedItem,subject)>=0){
                      matched = true;
                    }
                    else if(graph&&graph.length>0){
                      for (var i = 0; i < graph.length; i++) {
                        if(_.indexOf(checkedItem,graph[i]["@id"])>=0&&graph[i]["@type"].slice(0,5)==="skos:"){
                          matched = true;
                          return;
                        }
                      }
                    }
                  }
              }
            }
          }
          else{
              var value = (_.values(temp[obj]));
              for(var indexV in value){
                if(!related){
                  for(var indexK in keyWordList){
                    if(!related){
                      if(_.toLower(value[indexV]).includes(keyWordList[indexK])||_.toLower(scooterId).includes(keyWordList[index])){
                        related = true;
                        if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
                          matched = true;
                        }else if(graph&&graph.length>0){
                          for (var i = 0; i < graph.length; i++) {
                            if(_.indexOf(checkedItem,graph[i]["@id"])>=0&&graph[i]["@type"].slice(0,5)==="skos:"){
                              matched = true;
                              return;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
        }
      }
    }
    else{
      related=true;
      if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
          matched = true;
        }
      else if(graph&&graph.length>0){
          for (var i = 0; i < graph.length; i++) {
            if(_.indexOf(checkedItem,graph[i]["@id"])>=0&&graph[i]["@type"].slice(0,5)==="skos:"){
              matched = true;
              break;
            }
          }
        }
    }
    if(matched){
        if(isTrajet){
          matchedRawData["@graph"].push(instance);
          var temp = {
            "timestamp" : timestamp.getTime(),
            "coordinates": [long,lat],
            "scooterId" : scooterId,
            "date":timestamp.toLocaleDateString(),
            "time":timestamp.toLocaleTimeString()
          }
          geoLine[scooterId]?null:geoLine[scooterId]=[];
          geoLine[scooterId].push(temp);
        }
        else{
          var feature;
          if(isScooter){
            feature =
            {
              "type": "Feature",
              "properties": {
                "Details": "",
                "Name": scooterId,
                "markerAndIcons":[
                  {icon:"motorcycle",color:"CADETBLUE",number:null},
                  {icon:"cog",color:"#ff4d4d",number:null},
                  {icon:"number",color:"#cc6699",number:scooterId},
                  {icon:"battery-full",color:"Green",number:null}],
                "Date" : timestamp.toLocaleDateString(),
                "Time" : timestamp.toLocaleTimeString(),
                "Battery Status" : "To be Getted",
                "Mileage" : mileage,
                "Address" : address,
                "Speed" : "To be Getted",
                "IMEI" : imei,
                "Group" : group,
                "Phone" : phone,
                "Status" : status,
                "Speed" : speed
              },
              "geometry": {
                "type": "Point",
                "coordinates": [long,lat]
              }
            };
            if(!geojson["features"]){
              geojson ={
                "type": "FeatureCollection",
                "features": []
              };
            }
          }
          else {
            feature =
            {
              "type": "Feature",
              "properties": {
                "Subject": subject,
                "Name": name,
                "Abstract":abstract,
                "markerAndIcons":markerAndIcons
              },
              "geometry": {
                "type": "Point",
                "coordinates": [long,lat]
              }
            };
            if(!geojson["features"]){
              geojson ={
                "type": "FeatureCollection",
                "features": []
              };
            }
          }
          geojson["features"].push(feature);
          matchedRawData["@graph"].push(instance);
          dataForTable.push(feature.properties);
        }
      }
    if(related){
        relatedRawData["@graph"].push(instance);
    }
  });
  if(isTrajet) {
      geoLine = _.sortBy(geoLine, ['timestamp']);
      for(var count in geoLine){
        for(var obj in geoLine[count]){
          if(obj==0){
              var feature ={
                "type": "Feature",
                "properties": {
                  "Subject": "scooterTracer",
                  "Name": geoLine[count][obj]["scooterId"],
                  "markerAndIcons":null
                },
                "geometry": {
                  "type": "LineString",
                  "coordinates": []
                }
              };
              geojsonForPath["features"].push(feature);
          }
          geojsonForPath["features"][geojsonForPath["features"].length-1].geometry.coordinates.push(geoLine[count][obj]["coordinates"]);
        }
      }
      for(var count in geoLine){
        geojson[count]={
        "type": "FeatureCollection",
        "features": []
        };
        for(var obj in geoLine[count]){
          var dateTemp =  timestamp.toLocaleDateString();
          var feature ={
            "type": "Feature",
            "properties": {
              "Details": "",
              "Name": geoLine[count][obj]["scooterId"],
              "markerAndIcons":[
                {icon:"motorcycle",color:"CADETBLUE",number:null},
                {icon:"number",color:"CADETBLUE",number:"Bon"}],
              "Date" : geoLine[count][obj]['date'],
              "Time" : geoLine[count][obj]['time'],
              "Battery Status" : "To be Getted",
              "Speed" : "To be Getted"
            },
            "geometry": {
              "type": "Point",
              "coordinates": geoLine[count][obj]["coordinates"]
            }
          };
          geojson[count]["features"].push(feature);
        }
      }
    }
  console.log("globalContentSearch",[geojson,matchedRawData,relatedRawData,geojsonForPath,dataForTable]);
  return [geojson,matchedRawData,relatedRawData,geojsonForPath,dataForTable];
}
var updateTreeNum = function(tree,countList){
  var temp ={};
  for(var obj in tree){
    temp[obj]={};
    for(var obj2 in tree[obj]){
      if(obj2=="children"){
        temp[obj][obj2]=_.size(tree[obj][obj2])>0?updateTreeNum(tree[obj][obj2],countList):{};
      }else if (obj2=="num") {
        temp[obj][obj2]=countList[obj]?countList[obj]:0;
      }else{
        temp[obj][obj2]=tree[obj][obj2];
      }
    }
  }
  return temp;
}
const defaultGeoJson = globalContentSearch(defaultMapData,false,false);
//console.log('reducer window',window.infoKeyForPanel);
const initialState = {
  content: "hello",
  lastChange:null,
  treeData : {},
  urlDataForMap :null,
  urlDataForTree :null,
  geoData : null,//defaultGeoJson[0],
  serverData:null,
  keyword : null,
  root : null,
  isInfo : false,
  isTable : false,
  tableData: null,//defaultGeoJson[4],
  Info : null,
  dynamicUrl : null,
  isTyping : false,
  isTrajet : false,
  isScooter : false,
  geojsonForPath :defaultGeoJson[3],
  checkedItem : [],
  nameMap : {},
  tableType : 1,
  mapRef : null,
  scooterTableList : [],
  checkList : [],
  session : null
};
var reducer = function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CLICK:
      return Object.assign({}, state, {
        content: "lol"
      })
    case actionTypes.SetLastChangeState:
      return Object.assign({}, state, {
        lastChange:action.change
      })
    case actionTypes.UpdateTreeData:
      console.log("UpdateTreeData :",action.newdata,action.typeAction);
      if(action.typeAction =="collapsed"){
        return Object.assign({}, state, {
          treeData:action.newdata,
        })
      }else if(action.typeAction =="checked"){
        var checkedlist=[];
        var tempCheckedItem = checkedItem(action.newdata,checkedlist);
        var findRootResults = findRoot(state.urlDataForTree?state.urlDataForTree:defaultTreeData,state.root);
        var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isScooter,state.isTrajet,
          tempCheckedItem,state.keyword);
        if(!state.isTrajet){
          return Object.assign({}, state, {
            treeData:action.newdata,
            geoData: globalContentSearchResult[0],
            root:findRootResults[0],
            checkedItem : tempCheckedItem,
            tableData : globalContentSearchResult[4]
          })
        }else{
          return Object.assign({}, state, {
            treeData:action.newdata,
            root:findRootResults[0],
            checkedItem : tempCheckedItem,
            tableData : globalContentSearchResult[4]
          })
        }
      }

    case actionTypes.UseDefaultTreeData :
      console.log("UseDefaultTreeData");
      var findRootResults = findRoot(defaultTreeData,state.root);
      var defaultTree = treeConstructor(defaultTreeData,countItem(defaultMapData,state.isTrajet),findRootResults[0],defaultMapData);
      var nameMap = treeNameMap(defaultTreeData);
      return Object.assign({}, state, {
        treeData:defaultTree,
        root:findRootResults[0],
        nameMap : nameMap
      })
    case actionTypes.GetDataFromUrlForMap:
      console.log("GetDataFromUrlForMap",action.urlDataForMap);
      var checkedlist=[];
      var findRootResults = findRoot(state.urlDataForTree?state.urlDataForTree:defaultTreeData,state.root);
      var globalContentSearchResult = globalContentSearch(action.urlDataForMap,state.isScooter,state.isTrajet,checkedItem(state.treeData,checkedlist),state.keyword);
      var nameMap = treeNameMap(state.urlDataForTree?state.urlDataForTree:defaultTreeData);
      return Object.assign({}, state, {
        urlDataForMap:action.urlDataForMap,
        treeData:treeConstructor(state.urlDataForTree?state.urlDataForTree:defaultTreeData,countItem(globalContentSearchResult[1],state.isTrajet),findRootResults[0],action.urlDataForMap,state.checkedItem),
        geoData:globalContentSearchResult[0],
        geojsonForPath : globalContentSearchResult[3],
        root:findRootResults[0],
        tableData : globalContentSearchResult[4],
        nameMap: nameMap
      })
    case actionTypes.GetDataFromUrlForTree:
      console.log("GetDataFromUrlForTree",action.urlDataForTree);
      var checkedlist=[];
      var findRootResults = findRoot(action.urlDataForTree,state.root);
      var treeConstructorResult = treeConstructor(action.urlDataForTree,countItem(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isTrajet),findRootResults[0],state.urlDataForMap?state.urlDataForMap:defaultMapData,state.checkedItem);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isScooter,state.isTrajet,state.checkedItem,state.keyword);
      var nameMap = treeNameMap(action.urlDataForTree);
      return Object.assign({}, state, {
        geoData:globalContentSearchResult[0],
        urlDataForTree:action.urlDataForTree,
        treeData:treeConstructorResult,
        root:findRootResults[0],
        nameMap : nameMap
      })
    case actionTypes.GetDataFromUrlForTreeAndMap:
      console.log("GetDataFromUrlForTreeAndMap",action.urlDataForTree,action.urlDataForMap);
      return Object.assign({}, state, {
        treeData:treeConstructor(action.urlDataForTree,countItem(action.urlDataForMap,state.isTrajet),state.root,action.urlDataForMap)
      })
    case actionTypes.UpdateServerData:
      return Object.assign({}, state, {
        serverData:action.serverData
      })
    case actionTypes.GlobalSearch:
      console.log("GlobalSearch",action.keyword);
      var checkedlist=[];
      var tempCheckedItem = checkedItem(state.treeData,checkedlist);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isScooter,state.isTrajet,tempCheckedItem,action.keyword);
      var countItemResult = countItem(globalContentSearchResult[2]);//all matched points
      var updateTreeNumResult = updateTreeNum(state.treeData,countItemResult)
      for(var num in state.root){
        countParentsNum(updateTreeNumResult,formatString(state.root[num]));
      }
      return Object.assign({}, state, {
        geoData:globalContentSearchResult[0],
        geojsonForPath : globalContentSearchResult[3],
        keyword:action.keyword,
        treeData:updateTreeNumResult,
        tableData:globalContentSearchResult[4]
      })
    case actionTypes.ClickMarker:
      console.log("ClickMarker","marker",action.marker,"info",action.info);
      return Object.assign({}, state, {
        isInfo : true,
        Info : action.info
      })
    case actionTypes.CloseSideBar:
      console.log("CloseSideBar");
      return Object.assign({}, state, {
        isInfo : false
      })
    case actionTypes.ReceiveGeoDataFromUrl:
      console.log("ReceiveGeoDataFromUrl");
      return Object.assign({}, state, {
        geoData : action.geodata
      })
    case actionTypes.IsTyping:
      console.log("isTyping",action.typing);
      return Object.assign({}, state, {
        isTyping : action.typing
      })
    case actionTypes.IsTrajet:
      console.log("isTrajet",action.trajet);
      return Object.assign({}, state, {
        isTrajet : action.trajet
      })
    case actionTypes.IsScooter:
      console.log("isScooter",action.scooter);
      return Object.assign({}, state, {
        isScooter : action.scooter
      })
    case actionTypes.ToggleTable:
      console.log("ToggleTable",action.isTable,action.tableType);
      return Object.assign({}, state, {
        isTable : action.isTable,
        tableType : action.tableType
      })
    case actionTypes.SendMapRef:
      console.log("send map ref",action.mapRef);
      return Object.assign({}, state, {
        mapRef : action.mapRef
      })
    case actionTypes.SendScooterTableList:
      console.log("Send Scooter Table List",action.scooterTableList);
      return Object.assign({}, state, {
        scooterTableList : action.scooterTableList
      })
    case actionTypes.SendSession:
      console.log("Send Session",action.session);
      return Object.assign({}, state, {
        session : action.session
      })
    case actionTypes.SendCheckedList:
      console.log("Send Check List",action.checkedList);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isScooter,state.isTrajet,
        action.checkedList,state.keyword);
      return Object.assign({}, state, {
        checkList : action.checkedList,
        geoData : globalContentSearchResult[0],
        tableData : globalContentSearchResult[4],
        checkedItem : action.checkedList,
      })
    default:
      return state;
  }
};

module.exports = reducer;
