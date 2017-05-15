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
 useDefaultData() {
    return {
      type: actionTypes.UseDefaultData
    }
  },
  updateServerData(serverData) {
    return {
      type: actionTypes.UpdateServerData,
      serverData
    }
  },
  getDataFromUrl(urlData) {
    return {
      type: actionTypes.GetDataFromUrl,
      urlData
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
