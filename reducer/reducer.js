const actionTypes = require('../actiontype/actionType');
const defaultTreeData = require('json!../data/test/World_Heritage_Sites.skos.jsonld');
const defaultMapData = require('json!../data/exemple_villes.jsonld');
var _ = require('lodash');
var Immutable = require('immutable');
var treeConstructor = function (rawData,countList){
  ////console.log("treeConstructor");
  var results = findRoot(rawData);
  var tree ={};
  //console.log("results",results[0][0],results[2]);
  var treeData = buildTree(tree,results[0],rawData["@graph"],countList);
  for(var num in results[0]){
    countParentsNum(treeData,results[0][num]);
  }
  return treeData;
}
var buildTree = function(tree,parentId,rawData,countList){
  //console.log("buildTree parent parentId object",parentId);
  //var temp = rawData;
  rawData.map((value)=>{
    var id = value["@id"];
    var broader = value["broader"];
    var name = value["prefLabel"]?value["prefLabel"]["@value"]:null;
    var language = value["prefLabel"]?value["prefLabel"]["@language"]:null;
    ////console.log("typeof broader === 'object'",typeof broader === 'object');.
    if(typeof broader === 'object'){
      broader.map((value)=>{
        if (parentId.indexOf(value)!=-1) {
          //console.log("value matched",value);
          if(value in tree){
            tree[value]["children"][id] = {
              checked: false,
              checkbox: true,
              collapsed:true,
              children:{},
              num:countList[id]?countList[id]:0
            };
          }
          else{
            var child = {};
            child[id]= {
              checked: false,
              checkbox: true,
              collapsed:true,
              children:{},
              num:countList[id]?countList[id]:0
            };
            tree[value] = {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:child,
            num:0
          };
        }
        buildTree(tree[value]["children"],id,rawData);
        }
        //TODO delete used data
      })
    }
    else{
      if (parentId.indexOf(broader)!=-1) {
        //console.log("broader matched",broader);
        //console.log("broader matched",id);
        if(broader in tree){
          tree[broader]["children"][id] = {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:{},
            num:countList[id]?countList[id]:0
          };
        }
        else
        {
          var child = {};
          child[id]= {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:{},
            num:countList[id]?countList[id]:0
          };
          //console.log("buildTree parent child",child);
          tree[broader]={
            checked: false,
            checkbox: true,
            collapsed:true,
            children:child,
            num:0
          };
        //console.log("build branche",tree);
      }
      //delete unnecessary data
      buildTree(tree[broader]["children"],id,rawData,countList);
    }
  }});
  return tree
}
var geojsonConstructor = function(rawData,checkedItem){
  var geojson = {
  "type": "FeatureCollection",
  "features": []
  };
  rawData["@graph"].map((instance,index) =>{
    var name = instance["label"]["@value"];
    var subject = instance["subject"];
    var lat = instance["lat"];
    var long = instance["long"];
    //console.log("checkedItem",checkedItem);
    if(!checkedItem||checkedItem.length==0||checkedItem.indexOf(subject)>=0){
      //console.log("find it",subject);
      var feature = {
        "type": "Feature",
        "properties": {
          "NAME": name,
          "subject": subject
        },
        "geometry": {
          "type": "Point",
          "coordinates": [long,lat]
        }
      };
      geojson["features"].push(feature);
    }
  });
  return geojson;
}
var checkedItem = function(treeData,checkedList){
  //console.log("call checkedItem, show treeData",treeData);

  for(var obj in treeData){
    //console.log("obj in treeData",obj);
    //console.log("checkedList",checkedList);
    if(_.size(treeData[obj]["children"])>0){
      //console.log("obj children find",treeData[obj]["children"]);
      checkedItem(treeData[obj]["children"],checkedList);
      //console.log("checkedList",checkedList);
    }
    else{
      treeData[obj]["checked"]?checkedList.push(obj):null;
      //console.log("i am in ",obj,"checked?",treeData[obj]["checked"]);
      //console.log("checkedList",checkedList);
      //console.log("checked?",treeData[obj]["checked"]);

    }
  }
  //console.log("checkedList",checkedList);
  return checkedList;
  //console.log("List",checkedList);

}
var countItem = function(geoData){
  //console.log("call checkedItem, show treeData",treeData);
  var countList = geoData["@graph"].reduce(function (allNames, instance) {
    var name = instance["subject"];
    if (name in allNames) {
      allNames[name]++;
    }
    else {
      allNames[name] = 1;
    }
    return allNames;
  }, {});
  //console.log("countList",countList);
  return countList;

}
var findRoot = function(data){
  //var t = _.flattenDeep(defaultTreeData);
  //console.log("defaultTreeData",defaultTreeData);
  var flattenId = [];
  var flattenBroader = [];
  data["@graph"].map((value)=>{
    var id = value["@id"];
    var broader = value["broader"];
    if(typeof broader=="object"){
      for(var obj in broader){
        flattenBroader.indexOf(broader[obj])==-1?flattenBroader.push(broader[obj]):null;
      }
    }else {
      flattenBroader.indexOf(broader)==-1?flattenBroader.push(broader):null;
    }
    flattenId.indexOf(id)==-1?flattenId.push(id):null;

  })
  var root =_.difference(flattenBroader,flattenId);
  //console.log("flattenId",_.flatten(flattenId));
  //console.log("flattenBroader",t);
  return [root,flattenId,flattenBroader];

}
var countParentsNum = function(tree,parentId){
  if(_.size(tree[parentId]["children"])>0){
    //console.log("countParentsNum parentId",parentId);
    for(var obj in tree[parentId]["children"]){
      tree[parentId]["num"]=tree[parentId]["num"]+countParentsNum(tree[parentId]["children"],obj);
    }
    return tree[parentId]["num"]
  }
  else{
    return tree[parentId]["num"];
  }
}
const defaultTree = treeConstructor(defaultTreeData,countItem(defaultMapData));
const defaultGeoJson = geojsonConstructor(defaultMapData);
//console.log("defaultTree",defaultTree);
//console.log("defaultGeoJson",defaultGeoJson);
const initialState = {
  content: "hello",
  lastChange:null,
  treeData : {},
  urlDataForMap :null,
  urlDataForTree :null,
  geoData : defaultGeoJson,
  serverData:null
  // Loads default language content (en) as an initial state
};
var reducer = function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CLICK:
      //console.log("click :",action.id);
      return Object.assign({}, state, {
        content: "lol"
      })
    case actionTypes.SetLastChangeState:
      //console.log("State Now :",state.lastChange);
      //console.log("SetLastChangeState :",action.change);
      return Object.assign({}, state, {
        lastChange:action.change
      })
    case actionTypes.UpdateTreeData:
      console.log("UpdateTreeData :",action.newdata);
      var checkedlist=[];
      //var temp = checkedItem(action.newdata,checkedlist);
      //console.log("checkedItem", temp);
      var geojson = geojsonConstructor(state.urlDataForMap?state.urlDataForMap:defaultMapData,checkedItem(action.newdata,checkedlist));
      console.log("new geojson",geojson);
      return Object.assign({}, state, {
        treeData:action.newdata,
        geoData: geojson
      })
    case actionTypes.UseDefaultTreeData :
      ////console.log("UseDefaultData",defaultTreeData);
      return Object.assign({}, state, {
        treeData:defaultTree
      })
    case actionTypes.GetDataFromUrlForMap:
      console.log("GetDataFromUrlForMap",action.urlDataForMap);
      console.log("treeConstructor",treeConstructor(state.urlDataForTree?state.urlDataForTree:defaultTreeData,countItem(action.urlDataForMap)));
      var checkedlist=[];
      var geojson = geojsonConstructor(action.urlDataForMap,checkedItem(state.treeData,checkedlist));
      console.log("geojson",geojson);
      return Object.assign({}, state, {
        urlDataForMap:action.urlDataForMap,
        treeData:treeConstructor(defaultTreeData,countItem(action.urlDataForMap)),
        geoData:geojson
      })
    case actionTypes.GetDataFromUrlForTree:
      console.log("GetDataFromUrlForTree",action.urlDataForTree);
      return Object.assign({}, state, {
        urlDataForTree:action.urlDataForTree,
        treeData:treeConstructor(action.urlDataForTree,countItem(state.urlDataForMap?state.urlDataForMap:defaultMapData))
      })
    case actionTypes.GetDataFromUrlForTreeAndMap:
      console.log("GetDataFromUrlForTreeAndMap",action.urlDataForTree,action.urlDataForMap);

      return Object.assign({}, state, {
        treeData:treeConstructor(action.urlDataForTree,countItem(action.urlDataForMap))
      })
    case actionTypes.UpdateServerData:
      //console.log("UpdateServerData :",action.serverData);
      return Object.assign({}, state, {
        serverData:action.serverData
      })
    default:
      return state;
  }
};

module.exports = reducer;
