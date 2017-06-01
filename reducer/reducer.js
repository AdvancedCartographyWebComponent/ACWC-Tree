const actionTypes = require('../actiontype/actionType');
const defaultTreeData = require('json!../data/test/World_Heritage_Sites.skos.jsonld');
const defaultMapData = require('json!../data/test/exemple_villes.jsonld');
var _ = require('lodash');
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
  console.log("build tree",treeData);
  for(var num in root){
    countParentsNum(treeData,formatString(root[num]));
  }
  return treeData;
}
var formatString = function(strings){
  var temp = strings.split(':');
  var format =temp.length==1?temp[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," "):temp[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
  return format
}
var buildTree = function(tree,parentId,rawData,countList){
  rawData.map((value)=>{
    var id = value["@id"];
    var broader = value["broader"];
    var name = value["prefLabel"]?value["prefLabel"]["@value"]:null;
    var language = value["prefLabel"]?value["prefLabel"]["@language"]:null;
    if(typeof broader === 'object'){
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
        buildTree(tree[formatString(value)]["children"],id,rawData);
        }
      })
    }
    else{
      if (parentId.indexOf(broader)!=-1) {
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
      buildTree(tree[formatString(broader)]["children"],id,rawData,countList);
    }
  }});
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
var countItem = function(geoData){
  if(_.size(geoData["@graph"])>0){
    var countList = geoData["@graph"].reduce(function (allNames, instance) {
      var name = formatString(instance["subject"]?instance["subject"]:"Exclued Data");
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
  var root =stateRoot?stateRoot:_.difference(flattenBroader,flattenId);
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
var globalContentSearch = function(rawData,checkedItem,keyword){
  var geojson = {
  "type": "FeatureCollection",
  "features": []
  };
  var relatedRawData={
    "@graph":[]
  }
  var keyWordList = _.words(_.toLower(keyword));
  rawData["@graph"].map((instance,index) =>{
    var name = formatString(linkStringInLabel(instance["label"]));
    var subject = formatString(instance["subject"]?instance["subject"]:"Exclued Data");
    var abstract = formatString(instance["abstract"]?instance["abstract"]["@value"]:"No Abstract Found");
    var lat = instance["lat"];
    var long = instance["long"];
    var related = false;
    if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
      var temp = (_.values(instance));
      if(_.size(keyWordList)>0){
          for(var obj in temp){
          if(!related){
            if (typeof temp[obj] != 'object'){
              for(var index in keyWordList){
                if(!related){
                  if(_.toLower(temp[obj]).includes(keyWordList[index])){
                    related = true;
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
                    if(_.toLower(value[indexV]).includes(keyWordList[indexK])){
                        related = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      else{related=true;}
      if(related){
        var feature =
        {
          "type": "Feature",
          "properties": {
            "Subject": subject,
            "NAME": name,
            "Abstract":abstract
          },
          "geometry": {
            "type": "Point",
            "coordinates": [long,lat]
          }
        };
        geojson["features"].push(feature);
        relatedRawData["@graph"].push(instance);
      }
  }});

  return [geojson,relatedRawData];
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
const defaultGeoJson = globalContentSearch(defaultMapData)[0];
const initialState = {
  content: "hello",
  lastChange:null,
  treeData : {},
  urlDataForMap :null,
  urlDataForTree :null,
  geoData : defaultGeoJson,
  serverData:null,
  keyword : null,
  root : null,
  isInfo : false,
  Info : null
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
      console.log("UpdateTreeData :",action.newdata);
      var checkedlist=[];
      var tempCheckedItem = checkedItem(action.newdata,checkedlist);
      var findRootResults = findRoot(state.urlDataForTree?state.urlDataForTree:defaultTreeData,state.root);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,
        tempCheckedItem,state.keyword);
      var countItemResult = countItem(globalContentSearchResult[1]);
      var updateTreeNumResult = updateTreeNum(action.newdata,countItemResult)
      for(var num in state.root){
        countParentsNum(updateTreeNumResult,formatString(state.root[num]));
      }
      console.log("countItemResult",countItemResult);
      return Object.assign({}, state, {
        treeData:updateTreeNumResult,
        geoData: globalContentSearchResult[0],
        root:findRootResults[0]
      })
    case actionTypes.UseDefaultTreeData :
      var findRootResults = findRoot(defaultTreeData,state.root);
      var defaultTree = treeConstructor(defaultTreeData,countItem(defaultMapData),findRootResults[0]);
      return Object.assign({}, state, {
        treeData:defaultTree,
        root:findRootResults[0]
      })
    case actionTypes.GetDataFromUrlForMap:
      console.log("GetDataFromUrlForMap",action.urlDataForMap);
      var checkedlist=[];
      var findRootResults = findRoot(state.urlDataForTree?state.urlDataForTree:defaultTreeData,state.root);
      var globalContentSearchResult = globalContentSearch(action.urlDataForMap,checkedItem(state.treeData,checkedlist),state.keyword);
      console.log("globalContentSearchResult",globalContentSearchResult,"countItem",countItem(globalContentSearchResult[1]),"checkedlist",checkedlist);
      console.log("findRootResults",findRootResults[0]);
      return Object.assign({}, state, {
        urlDataForMap:action.urlDataForMap,
        treeData:treeConstructor(state.urlDataForTree?state.urlDataForTree:defaultTreeData,countItem(globalContentSearchResult[1]),findRootResults[0]),
        geoData:globalContentSearchResult[0],
        root:findRootResults[0]
      })
    case actionTypes.GetDataFromUrlForTree:
      console.log("GetDataFromUrlForTree",action.urlDataForTree);
      var checkedlist=[];
      var findRootResults = findRoot(action.urlDataForTree,state.root);
      var treeConstructorResult = treeConstructor(action.urlDataForTree,countItem(state.urlDataForMap?state.urlDataForMap:defaultMapData),findRootResults[0]);
      return Object.assign({}, state, {
        urlDataForTree:action.urlDataForTree,
        treeData:treeConstructorResult,
        root:findRootResults[0]
      })
    case actionTypes.GetDataFromUrlForTreeAndMap:
      console.log("GetDataFromUrlForTreeAndMap",action.urlDataForTree,action.urlDataForMap);

      return Object.assign({}, state, {
        treeData:treeConstructor(action.urlDataForTree,countItem(action.urlDataForMap),state.root)
      })
    case actionTypes.UpdateServerData:
      return Object.assign({}, state, {
        serverData:action.serverData
      })
    case actionTypes.GlobalSearch:
      console.log("GlobalSearch",action.keyword);
      var checkedlist=[];
      var tempCheckedItem = checkedItem(state.treeData,checkedlist);
      var globalContentSearchResult = globalContentSearch(state.urlDataForMap?state.urlDataForMap:defaultMapData,tempCheckedItem,action.keyword);
      var countItemResult = countItem(globalContentSearchResult[1]);
      console.log("countItem",countItemResult);
      console.log("new geojson from GlobalSearch",globalContentSearchResult[0]);
      var updateTreeNumResult = updateTreeNum(state.treeData,countItemResult)
      console.log("updateTreeNum",updateTreeNumResult);
      for(var num in state.root){
        countParentsNum(updateTreeNumResult,formatString(state.root[num]));
      }
      console.log("countParentsNumResult",updateTreeNumResult);
      return Object.assign({}, state, {
        geoData:globalContentSearchResult[0],
        keyword:action.keyword,
        treeData:updateTreeNumResult
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
    default:
      return state;
  }
};

module.exports = reducer;
