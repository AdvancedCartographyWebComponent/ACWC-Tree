(function(window, document, undefined) {
    "use strict";
    L.MyMarkers = {};
    L.MyMarkers.version = "1.0.1";
    L.MyMarkers.Icon = L.Icon.extend({
        options: {
            iconSize: [ 35, 45 ],
            iconAnchor: [ 17, 42 ],
            popupAnchor: [ 1, -32 ],
            shadowAnchor: [ 10, 12 ],
            shadowSize: [ 36, 16 ],
            className: "my-marker",
            prefix: "",
            extraClasses: "",
            shape: "circle",
            icon: "",
            innerHTML: "",
            svgBorderColor: "#fff",
            svgOpacity: 1,
            color: "red",
            number: ""
        },
        initialize: function(options) {
            options = L.Util.setOptions(this, options);
        },
        createIcon: function() {
            var div = document.createElement("div"), options = this.options;
            if (options.icon) {
                div.innerHTML = this._createInner();
            }
            if (options.innerHTML) {
                div.innerHTML = options.innerHTML;
            }
            if (options.bgPos) {
                div.style.backgroundPosition = -options.bgPos.x + "px " + -options.bgPos.y + "px";
            }
            this._setIconStyles(div, options.shape + "-" + options.markerColor);
            return div;
        },
        _createInner: function() {
            var iconColorStyle = "", iconNumber = "", options = this.options;
            if (options.color) {
                iconColorStyle = "style='color: " + options.color + "' ";
            }
            if (options.number) {
                iconNumber = "number='" + options.number + "' ";
            }
            return "<i " + iconNumber + iconColorStyle +"class='" + options.extraClasses + " " + options.prefix + " " + options.icon + "'></i>";
        },
        _setIconStyles: function(img, name) {
            var options = this.options, size = L.point(options[name === "shadow" ? "shadowSize" : "iconSize"]), anchor, leafletName;
            if (name === "shadow") {
                anchor = L.point(options.shadowAnchor || options.iconAnchor);
                leafletName = "shadow";
            } else {
                anchor = L.point(options.iconAnchor);
                leafletName = "icon";
            }
            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }
            img.className = "leaflet-marker-" + leafletName  + " " + options.className;
            if (anchor) {
                img.style.marginLeft = -anchor.x + "px";
                img.style.marginTop = -anchor.y + "px";
            }
            if (options.color){
              img.style.color = options.color;
            }
        },
        createShadow: function() {
            var div = document.createElement("div");
            this._setIconStyles(div, "shadow");
            return div;
        }
    });
    L.MyMarkers.icon = function(options) {
        return new L.MyMarkers.Icon(options);
    };
})(window, document);
