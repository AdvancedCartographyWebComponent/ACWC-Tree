const actionTypes = require('../actiontype/actionType');
const defaultTreeData = require('json!../data/test/World_Heritage_Sites.skos.jsonld');
//const defaultTreeData = require('json!../data/test/scooterTree.jsonld');
const defaultMapData = require('json!../data/test/exemple_villes.jsonld');
//const defaultMapData = require('json!../data/test/scooter2.jsonld');
const ScooterInfo = require('../Context/scooterInfo');
var _ = require('lodash');
var simplify = require('simplify-geometry');
var Immutable = require('immutable');
var treeConstructor = function (rawData,countList,root){
  if(!countList["Exclued Data"]||countList["Exclued Data"]==0){
    var tree ={};
  }else{
    var tree ={
      "Exclued Data":{
        checked: false,
        checkbox: false,
        collapsed:true,
        children:{},
        num:countList["Exclued Data"]
      }
    };
  }
  var treeData = buildTree(tree,root,rawData["@graph"],countList);
  console.log("buildTree result",treeData);
  for(var num in root){
    countParentsNum(treeData,formatString(root[num]));
  }
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
var buildTree = function(tree,parentId,rawData,countList){
  //console.log("buildTree parentId",parentId);
  rawData.map((value)=>{
    var id = value["@id"]?value["@id"]:"Default ID";
    var broader = value["broader"]?value["broader"]:null;
    var name = value["prefLabel"]?value["prefLabel"]["@value"]:null;
    var language = value["prefLabel"]?value["prefLabel"]["@language"]:null;
    if((typeof broader === 'object')&&broader){
      broader.map((value)=>{
        if (parentId.indexOf(value)!=-1) {
          if(formatString(value) in tree){
            tree[formatString(value)]["children"][formatString(id)] = {
              checked: false,
              checkbox: true,
              collapsed:true,
              children:{},
              num:countList[formatString(id)]?countList[formatString(id)]:0
            };
          }
          else{
            var child = {};
            child[formatString(id)]= {
              checked: false,
              checkbox: true,
              collapsed:true,
              children:{},
              num:countList[formatString(id)]?countList[formatString(id)]:0
            };
            tree[formatString(value)] = {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:child,
            num:0
          };
        }
        buildTree(tree[formatString(value)]["children"],[id],rawData);
        }
      })
    }
    else if(broader){
      if (parentId.indexOf(broader)!==-1) {
        if(formatString(broader) in tree){
          tree[formatString(broader)]["children"][formatString(id)] = {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:{},
            num:countList[formatString(id)]?countList[formatString(id)]:0
          };
        }
        else
        {
          var child = {};
          child[formatString(id)]= {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:{},
            num:countList[formatString(id)]?countList[formatString(id)]:0
          };
          tree[formatString(broader)]={
            checked: false,
            checkbox: true,
            collapsed:true,
            children:child,
            num:0
          };
      }
      buildTree(tree[formatString(broader)]["children"],[id],rawData,countList);
    }
  }});
  //console.log("buildTree tree",tree);
  return tree
}
var checkedItem = function(treeData,checkedList){
  for(var obj in treeData){
    if(_.size(treeData[obj]["children"])>0){
      checkedItem(treeData[obj]["children"],checkedList);
    }
    else{
      treeData[obj]["checked"]&&checkedList.indexOf(obj)==-1?checkedList.push(obj):null;    }
  }
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
      return allNames;
    }, {});
  }else{
    var countList = {};
  }
  return countList;
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
  console.log("find root",root,flattenId,flattenBroader);
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
var globalContentSearch = function(rawData,isTrajet,checkedItem,keyword){
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
    var scooterId = instance["mobile"]?instance["mobile"].split(':')[1]:null;
    //console.log("scooterId",scooterId,parseInt(scooterId),ScooterInfo[parseInt(scooterId)]);
    scooterId?scooterId =ScooterInfo[parseInt(scooterId)]:null;
    timestamp = timestamp?timestamp.slice(0,18).replace(/\D/g,""):null;
    var name = formatString(instance["label"]?linkStringInLabel(instance["label"]):"scooter");
    var subject = formatString(instance["subject"]?instance["subject"]:scooterId?scooterId:"Exclued Data");
    //console.log("subject",subject);
    var abstract = formatString(instance["abstract"]?instance["abstract"]["@value"]:"No Abstract Found");
    var markerAndIcons = instance["markerAndIcons"]?instance["markerAndIcons"]:null;
    var lat = instance["lat"];
    var long = instance["long"];
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
                  if(_.toLower(temp[obj]).includes(keyWordList[index])){
                    related = true;
                    if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
                      matched = true;
                    }
                  }
                }
              }
            }else{
              var value = (_.values(temp[obj]));
              for(var indexV in value){
                if(!related){
                  for(var indexK in keyWordList){
                  if(!related){
                    if(_.toLower(value[indexV]).includes(keyWordList[indexK])){
                        related = true;
                        if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
                          matched = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }else{
        related=true;
        if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
          matched = true;
        }
      }
      if(matched){
        if(isTrajet){
          matchedRawData["@graph"].push(instance);
          var dateWithTime = instance["@id"].split('/')[2];
          var temp = {
            "timestamp" : timestamp,
            "coordinates": [long,lat],
            "scooterId" : scooterId,
            "date":dateWithTime.split('T')[0],
            "time":dateWithTime.split('T')[1]
          }
          geoLine[scooterId]?null:geoLine[scooterId]=[];
          geoLine[scooterId].push(temp);
        }else{
          var feature =
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
          var dateTemp =  Math.floor(parseInt(geoLine[count][obj]["timestamp"]/100000));
          var feature ={
            "type": "Feature",
            "properties": {
              "Details": "",
              "Name": geoLine[count][obj]["scooterId"],
              "markerAndIcons":[
                {icon:"motorcycle",color:"CADETBLUE",number:null},
                {icon:"number",color:"CADETBLUE",number:dateTemp%1000}],
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
    console.log("globalContentSearch",dataForTable);
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
const defaultGeoJson = globalContentSearch(defaultMapData,false);
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
  geojsonForPath :defaultGeoJson[3],
  checkedItem : [],
  nameMap : {}
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
        var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isTrajet,
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
      var defaultTree = treeConstructor(defaultTreeData,countItem(defaultMapData,state.isTrajet),findRootResults[0]);
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
      var globalContentSearchResult = globalContentSearch(action.urlDataForMap,state.isTrajet,checkedItem(state.treeData,checkedlist),state.keyword);
      var nameMap = treeNameMap(state.urlDataForTree?state.urlDataForTree:defaultTreeData);
      return Object.assign({}, state, {
        urlDataForMap:action.urlDataForMap,
        treeData:treeConstructor(state.urlDataForTree?state.urlDataForTree:defaultTreeData,countItem(globalContentSearchResult[1],state.isTrajet),findRootResults[0]),
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
      var treeConstructorResult = treeConstructor(action.urlDataForTree,countItem(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isTrajet),findRootResults[0]);
      var nameMap = treeNameMap(action.urlDataForTree);
      return Object.assign({}, state, {
        urlDataForTree:action.urlDataForTree,
        treeData:treeConstructorResult,
        root:findRootResults[0],
        nameMap : nameMap
      })
    case actionTypes.GetDataFromUrlForTreeAndMap:
      console.log("GetDataFromUrlForTreeAndMap",action.urlDataForTree,action.urlDataForMap);
      return Object.assign({}, state, {
        treeData:treeConstructor(action.urlDataForTree,countItem(action.urlDataForMap,state.isTrajet),state.root)
      })
    case actionTypes.UpdateServerData:
      return Object.assign({}, state, {
        serverData:action.serverData
      })
    case actionTypes.GlobalSearch:
      console.log("GlobalSearch",action.keyword);
      var checkedlist=[];
      var tempCheckedItem = checkedItem(state.treeData,checkedlist);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,state.isTrajet,tempCheckedItem,action.keyword);
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
    case actionTypes.ToggleTable:
      console.log("ToggleTable",action.isTable);
      return Object.assign({}, state, {
        isTable : action.isTable
      })
    default:
      return state;
  }
};

module.exports = reducer;
