const actionTypes = require('../actiontype/actionType');

let actions = {
  click(id) {
    return {
      type: actionTypes.CLICK,
      id
    }
  },
  setLastChangeState(change) {
    return {
      type: actionTypes.SetLastChangeState,
      change
    }
  },
  updateTreeData(newdata) {
    return {
      type: actionTypes.UpdateTreeData,
      newdata
    }
  },
 useDefaultTreeData() {
    return {
      type: actionTypes.UseDefaultTreeData
    }
  },
  updateServerData(serverData) {
    return {
      type: actionTypes.UpdateServerData,
      serverData
    }
  },
  getDataFromUrlForMap(urlDataForMap) {
    return {
      type: actionTypes.GetDataFromUrlForMap,
      urlDataForMap
    }
  },
  getDataFromUrlForTree(urlDataForTree) {
    return {
      type: actionTypes.GetDataFromUrlForTree,
      urlDataForTree
    }
  },
  getDataFromUrlForTreeAndMap(urlDataForTree,urlDataForMap) {
    return {
      type: actionTypes.GetDataFromUrlForTreeAndMap,
      urlDataForTree,
      urlDataForMap
    }
  },
  globalSearch(keyword) {
    return {
      type: actionTypes.GlobalSearch,
      keyword
    }
  },
  clickMarker(marker,info){
    return{
      type: actionTypes.ClickMarker,
      marker,
      info
    }
  },
  closeSideBar(){
    return{
      type: actionTypes.CloseSideBar,
    }
  },
  receiveGeoDataFromUrl(geodata){
    return{
      type: actionTypes.ReceiveGeoDataFromUrl,
      geodata
    }
  }
};
module.exports = actions;
/*
export function click(id) {
  return {
    type: actionTypes.CLICK,
    id
  }
}
export function setLastChangeState(change) {
  return {
    type: actionTypes.SetLastChangeState,
    change
  }
}
export function updateTreeData(newdata) {
  return {
    type: actionTypes.UpdateTreeData,
    newdata
  }
}
*/
