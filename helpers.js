function Http(){
    this.url=null;
    this.params = null;
    this.headers = null;
    // use this for post requests
    this.post = function(url,callFunction){

    }
    // use this for get requests
    this.get = function(baseUrl,params,callFunction){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status == 200) {
                   (typeof params == 'function') ? params(xmlhttp.responseText) : (typeof callFunction != 'undefined') ? callFunction(xmlhttp.responseText) : '';
               }
               else if (xmlhttp.status == 400) {
                   console.log('There was an error 400');
               }
               else {
                    console.log('something else other than 200 was returned');
               }
            }
        };
        var stringedParams = (typeof params == 'object') ? this.convertParams(params) : '';
        xmlhttp.open("GET",(baseUrl+"?"+stringedParams), true);
        xmlhttp.send();
    }
    this.convertParams = function(params){
        var arrParams = [];
        for (var key in params)
        {
            arrParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return arrParams.join('&');
    }
}

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

function LiveBetting(){
    var http = new Http();
    this.url;
    this.liveData;
    this.load = function(params,callFunction){
        var self=this;
        http.get(this.url,{METHOD:'LIVE_LISTVIEW',type:'json',dty:7,fc:1},function(data){
            var parsetData=null;
            try {
               parsetData = JSON.parse(data);
            } catch (e) {
               console.log('the resposne data are not json!');
               return;
            }
            self.liveData = parsetData;
            callFunction(parsetData);
        });
    }

    this.indexOfObject = function(arr,key,val){
        for(var i=0; i<arr.length; i++){
            if (arr[i][key] == val) {
                return i;
            }
        }
        return -1;
    }

    this.moveObjects = function(match,filter,convertedData){
        var res = {};
        var index=-1;
        for(var key in filter){
            var value = filter[key];
            if (value == 'id') {
                index = this.indexOfObject(convertedData,key,match[key]);
            }
            if (typeof value != 'object') res[key] = match[key];
            if (typeof value == 'object' && value) {
                if (index > -1) {
                    if (Object.keys(value).length ==0) {
                        convertedData[index][key].push(match);
                    } else {
                        var subData = this.moveObjects(match,value,convertedData[index][key]);
                        if(subData) convertedData[index][key].push(subData);
                    }                    
                } else {
                    if (Object.keys(value).length ==0) {
                        res[key] = [match];
                    } else {
                        var subData = this.moveObjects(match,value,convertedData);
                        if(subData) res[key] = [subData];
                    }
                }
            }
            if (key == 'keepLast') {
                if (value != undefined && value != '') {
                    res[value] = match;
                    delete res[key];
                } else {
                    res[key] = match;
                }
            }
        }

        if (index > -1) res = false;

        return res;
    }

    this.convertDataByGroup = function(matches,filter){

        var convertedData = [];
        for (var key in matches) { // loop all matches
            var match = matches[key];
            var filteredMatch = this.moveObjects(match,filter,convertedData);
            if(filteredMatch) convertedData.push(filteredMatch);
        }
        return convertedData;
    }
}
var LiveBetting = new LiveBetting();

Element.prototype.live = function(liveData){
    var self = this;
    this.liveObj = new function(){
        this.updateAll = function(oldQuote,newQuote){
            if (typeof oldQuote == 'object' && typeof newQuote == 'object') {
                for(var key in oldQuote){
                    if (newQuote[key]) {
                        if (typeof newQuote[key] == 'function') continue;
                        if (typeof newQuote[key] == 'object') {
                            this.updateAll(oldQuote[key],newQuote[key])
                        } else {
                            oldQuote[key] = newQuote[key];
                        }
                    }
                }
            }
            return oldQuote;
        }
        this.update = function(){
            for(var i=0; i<self.children.length; i++){
                
            }
        }
        this.buildAction = function(attr){
            var actionText = {};
            for (var key in attr){
                if (key.toLocaleLowerCase().substr(0,6) == 'action') {
                    if (attr[key].constructor == Array){
                        if(attr[key].length < 1) continue;
                        if(attr[key].length == 1){
                            actionText[key.toLocaleLowerCase().substr(6)] = attr[key];
                            delete attr[key];
                            continue;
                        }
                        if(attr[key].length == 2){
                            if (attr[key][1].constructor == Object) {
                                var text = attr[key][1].text ? attr[key][1].text : '';
                                var elAttr = attr[key][1];
                                delete elAttr.text;
                                actionText[key.toLocaleLowerCase().substr(6)] = el(attr[key][0],elAttr,text);
                                elAttr.text = text;

                            } else {
                                var element = document.createElement(attr[key][0]);
                                element.innerText = attr[key][1];
                                actionText[key.toLocaleLowerCase().substr(6)] = element;
                            }
                            delete attr[key];
                            continue;
                        }
                    }
                    attr[key.substr(6)] = attr[key];
                    actionText[key.toLocaleLowerCase().substr(6)] = attr[key];
                    delete attr[key];
                }
            }
            return {attr:attr,action:actionText};
        }
        this.create = function(attributes,append=true,data=false){
            var next = [];
            var data = data ? data : liveData;
            var attr = {};
            for (var k in attributes) {
                attr[k] = attributes[k];
            }
            var build = this.buildAction(attr);
            attr=build.attr;
            
            attr['value'] = [];
            for (var key in data){
                if (attr[key] != undefined) {
                    if (attr[key].constructor == Array) {
                        var firstKey = attr[key][0];
                        var element = document.createElement(firstKey);
                        element.innerText = data[key];
                        if(attr[key][1] == 'value') attr['value'].push(element);
                        delete attr[key];
                        continue;
                    }
                    if (attr[key].constructor == Object){
                        var length = build.action.limit ? build.action.limit : data[key].length;
                        for (var i = 0; i < length; i++) {
                            next[i] = this.create(attr[key],false,data[key][i]);
                        }
                        delete attr[key];
                        continue;
                    }
                    attr[key] = data[key];
                }
            }
            var text = attr.value[0] ? attr.value[0] : '';
            attr.value.slice(0,1);
            for (var k in build.action) {
                if(build.action[k] instanceof Element) attr['value'].push(build.action[k]);
            }
            var textEl = attr.value;
            delete attr.value;

            var first = el('div',attr,text); //generete element

            for (var i = 1; i < textEl.length; i++) {
                first.appendChild(textEl[i])
            }
            if (next[0]) {
                for (var key in next) {
                    first.appendChild(next[key]);
                }
            } 
            if (append) {
                self.appendChild(first);
            }
            return first;
        }
    }
    return this.liveObj;
}

function load(){
    LiveBetting.url = 'https://www.betium.it/res/client/wbe/proxybetting.aspx';
    LiveBetting.load({
            METHOD:'LIVE_LISTVIEW',
            type:'json',
            dty:7,
            fc:1
        },function(data){

            var list = data._ListData;
            list = LiveBetting.convertDataByGroup(list,{
                GroupId:'id',
                GroupDesc:'',
                ManiList:{
                    ManiID:'id',
                    ManiDesc:'',
                    MatchList:{}
                }
            });
            console.log(list);
            var div = document.createElement('div');
            for (var i = 0; i < list.length; i++) {
                // create group
                var group = div.live(list[i]).create({
                    GroupId:'id',
                    GroupDesc:['span','value'],
                    ActionClass:'group',
                    ManiList:{
                        ManiID:'id',
                        ManiDesc:['span','value'],
                        ActionClass:'mani',
                        MatchList:{
                            BrMatchid:'id',
                            MatchName:['span','value'],
                            ActionLimit:[1],
                            Class_Data:{
                                ClassIdOrder:'id',
                                ClassDesc:['span','value'],
                                Odds_Data:{
                                    GamePkID:'id',
                                    GameOdd:['span','value'],
                                    GameName:['span','value'],
                                    ActionAll:['span',{class:'class-test',text:'All data here'}],
                                }
                            }
                        }
                    }
                });
        }
        console.log(div);
    });
}

load();