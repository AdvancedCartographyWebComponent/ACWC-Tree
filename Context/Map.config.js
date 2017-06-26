console.log("Map config");
module.exports = {
  params: {
    center: window.mapContext?(window.mapContext.center?window.mapContext.center:[48.836703,2.334345]):[48.836703,2.334345],
    zoomControl: false,
    zoom: window.mapContext?(window.mapContext.zoom?window.mapContext.zoom:6):6,
    maxZoom: 18,
    minZoom: 1,
    scrollwheel: false,
    legends: true,
    infoControl: false,
    attributionControl: true
  },
  tileLayer : {
    uri: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    params: {
      minZoom: 1,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      id: '',
      accessToken: ''
    }
  }
};
