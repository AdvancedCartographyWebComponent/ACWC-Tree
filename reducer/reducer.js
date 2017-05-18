const actionTypes = require('../actiontype/actionType');
const defaultTreeData = require('json!../data/World_Heritage_Sites.skos.jsonld');
const defaultMapData = require('json!../data/exemple_villes.jsonld');
var _ = require('lodash');
var treeConstructor = function (rawData,countList){
  ////console.log("treeConstructor");
  var results = findRoot(rawData);
  var tree ={};
  //console.log("results",results[0][0],results[2]);
  var treeData = buildTree(tree,results[0][0],rawData["@graph"],countList);
  countParentsNum(treeData,results[0][0]);
  /*var treeData = rawData["@graph"].reduce(function (treeData, instance, index, array) {
    var id = instance["@id"];
    var broader = instance["broader"];
    if(typeof broader === 'object'){
      broader.map((value)=>{
        if (value in treeData) {
          var num = countList[id]?countList[id]:0;
          treeData[value]["num"]=treeData[value]["num"]+num;
          treeData[value]["children"][id]={
            checked: false,
            checkbox: true,
            collapsed:true,
            children:null,
            num:num
          };
        }
        else {
          var temp={}
          var num = countList[id]?countList[id]:0;
          temp[id]={
            checked: false,
            checkbox: true,
            collapsed:true,
            children:null,
            num:num
          };
          treeData[value] = {
            checked: false,
            checkbox: true,
            collapsed:true,
            children:temp,
            num:num
          };
        }
      })
    }
    else{
      if (broader in treeData) {
        var num = countList[id]?countList[id]:0;
        treeData[broader]["num"]=treeData[broader]["num"]+num;
        treeData[broader]["children"][id]={
          checked: false,
          checkbox: true,
          collapsed:true,
          children:null,
          num:num
        };
      }
      else {
        var num = countList[id]?countList[id]:0;
        var temp={}
        temp[id]={
          checked: false,
          checkbox: true,
          collapsed:true,
          children:null,
          num:num
        };
        treeData[broader] = {
          checked: false,
          checkbox: true,
          collapsed:true,
          children:temp,
          num:num
        };
      }
    }

    return treeData;
  }, {});*/
  return treeData;
}

var buildTree = function(tree,parentId,rawData,countList){
  //console.log("buildTree parent parentId object",parentId);
  rawData.map((value)=>{
    var id = value["@id"];
    var broader = value["broader"];
    ////console.log("typeof broader === 'object'",typeof broader === 'object');
    if(typeof broader === 'object'){
      broader.map((value)=>{
        if (value === parentId) {
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
      })
    }
    else{
      if (broader === parentId) {
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
      buildTree(tree[broader]["children"],id,rawData,countList);
    }
  }});//(parentId)==-1?null:parentId;
  //if(!parent) return tree;
  //tree[parentId]["children"]=child;
  //console.log("buildTree parent tree",tree);
  //console.log("buildTree parent children",child);
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
var checkedItem = function(treeData){
  //console.log("call checkedItem, show treeData",treeData);
  var checkedList = [];
  for(var obj in treeData){
    //console.log("obj in treeData",obj);
    for(var obj2 in treeData[obj]["children"]){
      //console.log("obj2",obj2);
      treeData[obj]["children"][obj2]["checked"]?checkedList.push(obj2):null;
    }
  }
  //console.log("List",checkedList);
  return checkedList;
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
    console.log("countParentsNum parentId",parentId);
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
      //console.log("UpdateTreeData :",action.newdata);

      var geojson = geojsonConstructor(state.urlDataForMap?state.urlDataForMap:defaultMapData,checkedItem(action.newdata));
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
      var geojson = geojsonConstructor(action.urlDataForMap,checkedItem(state.treeData));
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
