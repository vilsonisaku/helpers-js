this.el = function(type,attributes,text){
    this.helpers = new function(){
        this.el;
        this.syncUpdateObject = function(oldQuote,newQuote){
            if (typeof oldQuote == 'object' && typeof newQuote == 'object') {
                for(var key in oldQuote){
                    if (newQuote[key]) {
                        if (typeof newQuote[key] == 'function') continue;
                        if (typeof newQuote[key] == 'object') {
                            this.syncUpdateQuote(oldQuote[key],newQuote[key])
                        } else {
                            oldQuote[key] = newQuote[key];
                        }
                    }
                }
            }
        }

        this.removeEvent = function(type,index){
            $(this.el).each(function(){ // using jquery latter will be removed
                if($._data(this, "events")) delete $._data(this, "events")[type][index];
            });
        }
        this.checkEvents = function(){
            $(this.el).each(function(){ // using jquery latter will be removed
                console.log($._data(this, "events"));
            });
        }
    }
    
    if (typeof type != 'string') {
        this.helpers.el = type;
        return this.helpers;
    }
    var el = document.createElement(type);
    if (attributes) {
        if (attributes.constructor === String || attributes.constructor === Number) {
            el.appendChild(document.createTextNode(attributes));
        } else if (attributes.constructor === Object) { // if is object {}
            for (var key in attributes) {
                el.setAttribute(key,attributes[key]);
            }
        } else if (attributes.constructor === Array) { // if is array []
            if (attributes[0].constructor === Object) {
                el.setAttribute(attributes[0],attributes[1]);
            } else {
                for (var i = 0; i < attributes.length; i++) {
                    var attr = attributes[i];
                    el.setAttribute(attr[0],attr[1]);
                }
            }
        }
    }    
    if(typeof text === 'string' ||typeof text === 'number') el.appendChild(document.createTextNode(text));
    (typeof text === 'object') && el.appendChild(text);

    return el;
}