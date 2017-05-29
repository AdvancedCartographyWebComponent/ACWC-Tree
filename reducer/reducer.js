const actionTypes = require('../actiontype/actionType');
const defaultTreeData = require('json!../data/test/World_Heritage_Sites.skos.jsonld');
const defaultMapData = require('json!../data/exemple_villes.jsonld');
var _ = require('lodash');
var Immutable = require('immutable');
var treeConstructor = function (rawData,countList,root){
  ////console.log("treeConstructor");
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
  //console.log("results",results[0][0],results[2]);
  var treeData = buildTree(tree,root,rawData["@graph"],countList);
  console.log("build tree",treeData);
  //treeData["Exclued Data"]=
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
  //console.log("buildTree parent parentId object",parentId);
  //var temp = rawData;
  //var punctuationless = s.split(':')[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");

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
        //TODO delete used data
      })
    }
    else{
      if (parentId.indexOf(broader)!=-1) {
        //console.log("broader matched",broader);
        //console.log("broader matched",id);
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
          //console.log("buildTree parent child",child);
          tree[formatString(broader)]={
            checked: false,
            checkbox: true,
            collapsed:true,
            children:child,
            num:0
          };
        //console.log("build branche",tree);
      }
      //delete unnecessary data
      buildTree(tree[formatString(broader)]["children"],id,rawData,countList);
    }
  }});
  return tree
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
      treeData[obj]["checked"]&&checkedList.indexOf(obj)==-1?checkedList.push(obj):null;
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
  if(_.size(geoData["@graph"])>0){
    var countList = geoData["@graph"].reduce(function (allNames, instance) {
      //console.log("instance",instance["subject"]?instance["subject"]:"Exclued Data");
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
  //console.log("countList",countList);
  return countList;

}
var findRoot = function(data,stateRoot){
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
  var root =stateRoot?stateRoot:_.difference(flattenBroader,flattenId);
  //console.log("flattenId",_.flatten(flattenId));
  //console.log("flattenBroader",t);
  return [root,flattenId,flattenBroader];

}
var countParentsNum = function(tree,parentId){
  if(tree[parentId]["children"]&&_.size(tree[parentId]["children"])>0){
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
  //console.log("globalContentSearch");
  var geojson = {
  "type": "FeatureCollection",
  "features": []
  };
  var relatedRawData={
    "@graph":[]
  }
  var keyWordList = _.words(_.toLower(keyword));
  //console.log("keyWordList",keyWordList);
  rawData["@graph"].map((instance,index) =>{
    //console.log("linkStringInLabel",linkStringInLabel(instance["label"]));
    var name = formatString(linkStringInLabel(instance["label"]));
    //console.log("linkStringInLabel",linkStringInLabel(instance["label"]));
    //console.log("subject",instance["subject"]);
    var subject = formatString(instance["subject"]?instance["subject"]:"Exclued Data");
    //console.log("subject",subject);
    var lat = instance["lat"];
    var long = instance["long"];
    var related = false;
    //console.log("checkedItem",checkedItem);
    if(!checkedItem||checkedItem.length==0||_.indexOf(checkedItem,subject)>=0){
      //console.log("checkedItem",checkedItem)
      var temp = (_.values(instance));
      //console.log("temp",temp);
      if(_.size(keyWordList)>0){
          for(var obj in temp){
          if(!related){
            if (typeof temp[obj] != 'object'){
              for(var index in keyWordList){
                if(!related){
                  //console.log("temp[obj].includes(keyWordList[index])",temp[obj],temp[obj].includes(keyWordList[index]));
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
      //console.log("related after loop",related);
      if(related){
        var feature =
        {
          "type": "Feature",
          "properties": {      
            "Subject": subject,
            "NAME": name
          },
          "geometry": {
            "type": "Point",
            "coordinates": [long,lat]
          }
        };
        geojson["features"].push(feature);
        relatedRawData["@graph"].push(instance);
        //console.log("globalContentSearch geojson",geojson);
      }
  }});

  return [geojson,relatedRawData];
}
var updateTreeNum = function(tree,countList){
  var temp ={};
  //console.log("in updateTreeNum tree",tree);
  //console.log("countList",countList);
  for(var obj in tree){
    temp[obj]={};
    for(var obj2 in tree[obj]){
      if(obj2=="children"){
        temp[obj][obj2]=_.size(tree[obj][obj2])>0?updateTreeNum(tree[obj][obj2],countList):{};
      }else if (obj2=="num") {
        //console.log("obj",obj);
        //console.log("countlist Amalfi Coast",countList["Amalfi Coast"]);
        temp[obj][obj2]=countList[obj]?countList[obj]:0;
      }else{
        temp[obj][obj2]=tree[obj][obj2];
      }
    }
  }
  return temp;
}
const defaultGeoJson = globalContentSearch(defaultMapData)[0];
//console.log("defaultTree",defaultTree);
//console.log("defaultGeoJson",defaultGeoJson);
const initialState = {
  content: "hello",
  lastChange:null,
  treeData : {},
  urlDataForMap :null,
  urlDataForTree :null,
  geoData : defaultGeoJson,
  serverData:null,
  keyword : null,
  root : null
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
      //console.log("countItem",countItem(globalContentSearchResult[1]));
      return Object.assign({}, state, {
        //TODO root problem
        treeData:updateTreeNumResult,
        geoData: globalContentSearchResult[0],
        root:findRootResults[0]
      })
    case actionTypes.UseDefaultTreeData :
      ////console.log("UseDefaultData",defaultTreeData);
      var findRootResults = findRoot(defaultTreeData,state.root);
      var defaultTree = treeConstructor(defaultTreeData,countItem(defaultMapData),findRootResults[0]);
      return Object.assign({}, state, {
        treeData:defaultTree,
        root:findRootResults[0]
      })
    case actionTypes.GetDataFromUrlForMap:
      console.log("GetDataFromUrlForMap",action.urlDataForMap);
      //console.log("treeConstructor",treeConstructor(state.urlDataForTree?state.urlDataForTree:defaultTreeData,countItem(action.urlDataForMap),state.root));
      var checkedlist=[];
      var findRootResults = findRoot(state.urlDataForTree?state.urlDataForTree:defaultTreeData,state.root);
      var globalContentSearchResult = globalContentSearch(action.urlDataForMap,checkedItem(state.treeData,checkedlist),state.keyword);
      console.log("globalContentSearchResult",globalContentSearchResult,"countItem",countItem(globalContentSearchResult[1]),"checkedlist",checkedlist);
      //findRootResults[0].push("Exclued Data")
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
      //console.log("UpdateServerData :",action.serverData);
      return Object.assign({}, state, {
        serverData:action.serverData
      })
    case actionTypes.GlobalSearch:
      console.log("GlobalSearch",action.keyword);
      var checkedlist=[];
      var tempCheckedItem = checkedItem(state.treeData,checkedlist);
      //console.log("keyword exists");
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

      //return
    default:
      return state;
  }
};

module.exports = reducer;
