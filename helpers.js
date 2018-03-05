this.el = function(type,attributes = [],text){
    var el = document.createElement(type);
    if (typeof attributes === "string") {
        el.appendChild(document.createTextNode(attributes));
    } else if (typeof attributes === "object" && attributes.length === undefined) { // if is object {}
        for (var key in attributes) {
            el.setAttribute(key,attributes[key]);
        }
    } else if (typeof attributes === "object" && typeof attributes.length === 'number') { // if is array []
        if (typeof attributes[0] !== "object") {
            el.setAttribute(attributes[0],attributes[1]);
        } else {
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                el.setAttribute(attr[0],attr[1]);
            }
        }
    }
    (text) && el.appendChild(document.createTextNode(text));
    return el;
}