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

//create element with attr and text
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
    this.liveData=[];
    this.odds={};
    this.liveUpdate={};
    this.dataSelection;
    this.intervalId;
    this.UpDown=false;
    this.startInterval = function(time,params,callFunction){
        if (this.liveUpdate == undefined) return;
        var self = this;
        this.intervalId = setInterval(function(){
            self.load(params,function(data){
                    callFunction(data);
                });
        },time);
    }

    this.removeUpDownClass = function(oddHtml){
        var cl = oddHtml.className.split(' ');
        var upIndex = cl.indexOf('up');
        var downIndex = cl.indexOf('down');
        if (upIndex > -1) {
            cl.splice(upIndex,1);
        }
        if (downIndex > -1) {
            cl.splice(downIndex,1);
        }
        oddHtml.className = cl.join(' ');
    }

    this.setUpDownClass = function(oddHtml,newValue){
        var floatHtmlText = parseFloat(oddHtml.innerText);
        var floatNewText = parseFloat(newValue);
        if( floatHtmlText != NaN && floatNewText != NaN ){
            if (floatHtmlText > floatNewText) {
                oddHtml.className = oddHtml.className+' down';
                return true;
            } else if(floatHtmlText < floatNewText) {
                oddHtml.className = oddHtml.className+' up';
                return true;
            }
        }
        return false;
    }

    this.updateOdds = function(data,defaultData,parentHtml=false){
        if (data == undefined || this.liveData == undefined) return;

        if (defaultData === false) defaultData = this.liveData;
        if (data.constructor == Array) {
            if (!this.dataSelection) return; //liveBetting.liveData
            var keys = Object.keys(this.dataSelection);
            var ids = [];
            var key=false;
            if(!data[0]) {
                for(var e in defaultData){
                    defaultData[e].UpdateHTML.remove();
                    defaultData.splice(e,1);
                }
                return;
            }
            for (var ii = 0; ii < keys.length; ii++) {
                if(data[0][keys[ii]]){
                    key = keys[ii];
                    break;
                }
            }
            for (var i = 0; i < data.length; i++) { // add new values html

                var defaultIndex = this.indexOfObject(defaultData,key,data[i][key]);

                if (defaultIndex > -1) {
                    this.updateOdds(data[i],defaultData[defaultIndex],defaultData[defaultIndex].UpdateHTML);
                } else {
                    var addData = data[i];
                    var selections = this.dataSelection[key];
                    if(parentHtml) parentHtml.live(addData).create( selections,"update");
                    //parentHtml.appendChild(htmlData);
                    defaultData.push(addData);
                }
                ids.push(data[i][key]);
                
            }

            for (var t = 0; t < defaultData.length; t++) { // loop to remove the old
                if(ids.indexOf(defaultData[t][key]) == -1){
                    removeData = defaultData[t];
                    if(removeData.UpdateHTML) removeData.UpdateHTML.remove();
                    defaultData.splice(t,1);
                }
            }
        } else if (data.constructor == Object) {
            var updateKeys = {};
            if (defaultData.hasOwnProperty('UpdateKeys')) {
                updateKeys = defaultData['UpdateKeys'];
            }
            
            for(var key in data){
                if (data[key] == null) continue; // when the value is null
                if (data[key].constructor == Array || data[key].constructor == Object ) {
                    this.updateOdds(data[key],defaultData[key],defaultData.UpdateHTML);
                    continue;
                }
                if (defaultData.hasOwnProperty(key)) defaultData[key] = data[key];

                if (updateKeys.hasOwnProperty(key)) {
                    if (defaultData.hasOwnProperty("UpdateHTML")) {
                        if (updateKeys[key].constructor == Function) {
                            updateKeys[key](defaultData['UpdateHTML'],data[key]); // execute the function with two parameters
                        } else {
                            var item = defaultData['UpdateHTML'];
                            if (updateKeys[key] != "")
                            item = item.getElementsByClassName(updateKeys[key])[0];
                            if(!item) continue;
                            if (defaultData.hasOwnProperty('UpDown')) {
                                this.removeUpDownClass(item);
                                if(this.setUpDownClass(item,data[key])) item.innerText = data[key];
                            } else {
                                item.innerText = data[key];
                            }
                            
                        }                       
                    }
                }
                

            }
        }
    }
    this.load = function(params,callFunction){
        var self=this;
        http.get(this.url,params,function(data){
            var parsetData=null;
            try {
               parsetData = JSON.parse(data);
            } catch (e) {
               console.log('the resposne data are not json!');
               return;
            }
            //self.liveData = parsetData;
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

            if (value == 'id') {
                delete match[key];
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
var liveBetting = new LiveBetting();

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

        this.getObjectValue = function(obj,path,theKey){ 
            if (path[0] == undefined || !obj) return ''; 
            if (obj.hasOwnProperty(theKey)) { 
                return obj[theKey]; 
            }
            var key = path[0];
            if(obj.hasOwnProperty(key)){ 
                
                var newPath = path.join(',').split(',');
                newPath.splice(0,1); 
                return this.getObjectValue(obj[key],newPath,theKey); 
            } 
        }

        this.insertValues = function(attr,data,path){
            if (attr.constructor == Function) {
                var ob = attr();
                var key = Object.keys(ob)[0];
                setTimeout(function(){
                    ob[key](data.UpdateHTML,data[key]); // execute the function
                });
                return attr;
            }
            if (attr.constructor != String) return attr;

            var addKeys = attr.split('{');
            if(addKeys.length == 1) return addKeys[0];
            var dataValue = addKeys.splice(0,1);
            for (var i = 0; i < addKeys.length; i++) {
                var addKey = addKeys[i].split('}');
                if (data.hasOwnProperty(addKey[0])) {
                    dataValue += data[addKey[0]]+addKey[1];
                } else {
                    var value = this.getObjectValue(liveData,path,addKey[0]); // start with the single group (liveData) 
                    dataValue += value ? value : '';
                    dataValue += addKey[1];
                }
            }
            return dataValue;
        }
        this.buildAction = function(attr,data,path){ // execute all action
            var actionText = {};
            for (var key in attr){
                if (key.toLocaleLowerCase().substr(0,6) == 'action') {

                    if (attr[key].constructor == Array && key.substr(6).toLocaleLowerCase() != "update" ){
                        if(attr[key].length < 1) continue;
                        if(attr[key].length == 1){
                            actionText[key.toLocaleLowerCase().substr(6)] = attr[key];
                            delete attr[key];
                            continue;
                        }
                        if(attr[key].length == 2){
                            if (attr[key][1].constructor == Object) {
                                
                                var subAttr = attr[key][1];
                                
                                var value = subAttr.value ? this.insertValues(subAttr.value,data,path) : '';
                                delete subAttr.value;
                                actionText[key.toLocaleLowerCase().substr(6)] = el(attr[key][0],subAttr,value);
                                subAttr.value = value;

                            } else {
                                var element = document.createElement(attr[key][0]);
                                element.innerText = attr[key][1];
                                actionText[key.toLocaleLowerCase().substr(6)] = element;
                            }

                            delete attr[key];
                            continue;
                        }
                    }
                    var dataValue = this.insertValues(attr[key],data,path);
                    attr[key.substr(6)] = dataValue;
                    actionText[key.toLocaleLowerCase().substr(6)] = dataValue;
                    delete attr[key];
                }
            }
            return {attr:attr,action:actionText};
        }

        this.startLiveUpdate = function(HTMLObject,firstKeyName,secondKeyId){ //start live interval
            if (!liveBetting.odds.hasOwnProperty(firstKeyName)) {
                liveBetting.odds[firstKeyName] = {};
            }
            liveBetting.odds[firstKeyName][secondKeyId] = HTMLObject; // set odds key with html object ex:firstKey=GameOdd and secondKey=26919325
        }

        this.customOptions = function(action,d){  // decide what to do with costum options
            if (action.updateinterval != undefined) {
                //this.startLiveUpdate(d.htmlObj,d.key,d.class);
            }
            if (action.updown != undefined) {
                if (action.updown[0] == true || action.updown[0] == 'true') {
                    d.data.UpDown = true;
                }
            }
            if (action.lockvalues != undefined) {
                var lockClass = action.lockvalues[0][0];
                var index = action.lockvalues[0].indexOf(d.value);
                if (index > 0) {
                    d.htmlObj.innerText = "";
                    d.htmlObj.className = lockClass;
                }
            }
            if (action.buildmenu != undefined) {
                if (action.buildmenu[0].constructor == Object) {

                }
            }
        }

        this.renderObjectValue = function (subOb,data,path,key){
            var allSubAttr = {};
            for (var subk in subOb) {
                allSubAttr[subk] = subOb[subk];
            }
            var buildSubAttr = this.buildAction(subOb,data,path);
            var subObAttr = buildSubAttr.attr;
            var subText = (subObAttr.value == '') ? data[key] : this.insertValues(subObAttr.value,data,path);
            var subEl = subObAttr.element ? subObAttr.element : 'div';
            delete subObAttr.value;
            delete subObAttr.element;
            var text = el(subEl,subObAttr,subText);

            this.customOptions(buildSubAttr.action,{htmlObj:text,class:buildSubAttr.action.class,key:key,value:data[key],data});

            for (var setSubk in allSubAttr) {
                subObAttr[setSubk] = allSubAttr[setSubk];
            }
            return text;
        }

        this.checkLimit = function(limit,objData){ // check limit data
            if (limit) {
                var arrLimit =limit[0].split('&');
                for (var y  in arrLimit) {
                    var limitData = arrLimit[y].split('='); 
                    if (objData.hasOwnProperty(limitData[0])) { // check the key
                        if (objData[limitData[0]] == limitData[1]) {
                            return true;
                        }
                    }
                }
            } else {
                return true;
            }
        }

        this.create = function(attributes,append=true,data=false,path=false,recursionIndex=0){ // generate html from data 
            var next = [];
            recursionIndex++;
            var data = data ? data : liveData;
            if(!path) path=[];
            var dataAttr = {};
            for (var k in attributes) {
                if (attributes[k].constructor == Array && attributes[k][0] == "id" && append != "update") {
                    if(!liveBetting.dataSelection) liveBetting.dataSelection = {};
                    if (!liveBetting.dataSelection.hasOwnProperty(k)) liveBetting.dataSelection[k] = attributes;
                }
                dataAttr[k] = attributes[k];
            }
            var build = this.buildAction(dataAttr,data,path);
            var attr=build.attr;

            if(build.action.limit && append != "update" && !this.checkLimit(build.action.limit,data)) return false;

            var ID ='';
            if(attr['value'] == undefined) attr['value'] = [];

            for (var key in data){
                
                if (attr.hasOwnProperty(key)) {
                    if (attr[key].constructor == Array) {
                        var firstKey = attr[key][0];
                        if (typeof attr[key][1] != "undefined" && attr[key][1].constructor == Object) { // add html with attributes and texts
                            var obAttr = attr[key][1];
                            if (obAttr.value == undefined) continue;
                            var text = '';
                            var obValue = obAttr.value;
                            if (obValue.constructor == Object) {
                                text = this.renderObjectValue(obValue,data,path,key);
                            } else if (obValue.constructor == Array) {
                                text = [];
                                for (var i = 0; i < obValue.length; i++) {
                                    text.push(this.renderObjectValue(obValue[i],data,path,key));
                                }
                            } else {
                                text = (obAttr.value == '') ? data[key] : obValue;
                            }
                            
                            delete obAttr.value;
                            if(text.constructor == Array){
                                for (var arrIndex in text) {
                                    attr['value'].push(el(firstKey,obAttr,text[arrIndex]));
                                }
                            } else {
                                attr['value'].push(el(firstKey,obAttr,text));
                            }
                            obAttr.value = obValue;
                        } else {
                            // add html with only texts
                            var element = document.createElement(firstKey);
                            element.innerText = data[key];
                            if(attr[key][1] == 'value') attr['value'].push(element);
                        }

                        if (attr[key][0] == "id") {
                            ID = {key:key,value:data[key]}
                            var id = data[key];
                        }
                        delete attr[key];
                        continue;
                    }
                    if (attr[key].constructor == Object){ // check next objects
                        var length = data[key].length;
                        for (var i = 0; i < length; i++) {
                            var objData = data[key][i];

                            path.push(key);
                            path.push(i);
                            var nextEl = this.create(attr[key],false,objData,path,recursionIndex); // here pass all objects
                            if(nextEl) next.push(nextEl);
                            if(append==true || append == "update") path = [];
                            if(recursionIndex==2) {
                                path = [path[0],path[1]];
                            }
                            if(recursionIndex==3) {
                                 path = [path[0],path[1],path[2],path[3]];
                            }
                        }

                        delete attr[key];
                        continue;
                    }
                    
                    attr[key] = data[key];
                }
            }
            var text = attr.value[0] ? attr.value[0] : '';
            attr.value.slice(0,1); // remove first
            var pEl = build.action.parentelement ? build.action.parentelement : 'div';

            delete build.action.parentelement;
            delete attr.ParentElement;
            for (var k in build.action) {
                if(build.action[k] instanceof Element) attr['value'].push(build.action[k]);
            }
            var textEl = attr.value;

            var updateKeys = {};
            if(attr.Update != undefined){
                for (var i = 0; i < attr.Update.length; i++) {
                    for( var kk in attr.Update[i]){
                        updateKeys[kk] = attr.Update[i][kk];
                    }           
                }
            }
            
            delete attr.value;
            delete attr.Update;

            var first = el(pEl,attr,text); //generete element

            if (ID.key != undefined){
                data['UpdateHTML'] = first;
                data['UpdateKeys'] = updateKeys;

            }

            for (var i = 1; i < textEl.length; i++) {

                first.appendChild(textEl[i])
            }
            if (next[0]) {
                for (var key in next) {
                    first.appendChild(next[key]);
                }
            } 
            if (append == "update") {
                 if (this.checkLimit(build.action.limit,data))
                    self.appendChild(first);
            }
            if (append==true) {
                liveBetting.liveData.push(data);
                self.appendChild(first);
            }
            return first;
        }
    }
    return this.liveObj;
}

function load(){
    liveBetting.url = document.location.origin+'/res/client/wbe/proxybetting.aspx';
    liveBetting.load({
            METHOD:'LIVE_LISTVIEW',
            type:'json',
            // dty:7,
            // fc:1
        },function(data){

            var list = data._ListData;
            list = liveBetting.convertDataByGroup(list,{
                GroupId:'id',
                GroupDesc:'',
                ManiList:{
                    ManiID:'id',
                    ManiDesc:'',
                    MatchList:{}
                }
            });
            var div = document.createElement('div');
            div.className = "test-live-data";
            for (var i = 0; i < list.length; i++) {
                // create group
                var group = div.live(list[i]).create({
                    GroupId:['id'],
                    ActionClass:'group gr_{GroupId}',
                    ActionBuildMenu:[{
                        ActionParentElement:'ul',
                        ActionElement:'li',
                        ActionClass:'menu-item',
                        ActionId:'menu_{GroupId}',
                        GroupDesc:['span','value'],
                    }],
                    ActionParentElement:'ul',
                    ManiList:{
                        ManiID:['id'],
                        ActionClass:'mani {ManiID}',
                        ActionParentElement:'li',
                        MatchList:{
                            BrMatchid:['id'],
                            Current_Time:['li',{class:'timeLive',value:[{element:'span', class:'time-text',value:'{Current_Time} \''}] }],
                            ScoreDetails:['li',{class:'results',value:[{element:'span',value:function(){
                                return {ScoreDetails:function(html,value){
                                        updateResults(html,value)
                                }}
                            }, class:'results-text'}] }],
                            MatchName:['li',{class:'matchLive',value:{value:'',element:'span',ActionOnClick:"document.location.href = document.location.origin+'/Holder.bet?page=livebetting&event={BrMatchid}'"}}],
                            ActionParentElement:'ul',
                            ActionClass:'match {BrMatchid}',
                            ActionUpdate:[{Current_Time:updateCurrentTime},{ScoreDetails:updateResults}],
                            Class_Data:{
                                ClassId:['id'],
                                ActionParentElement:'li',
                                ClassDesc:['li',{class:'stats',value:{element:'i',ActionOnClick:'openBRStats({ManiID} , {BrMatchid})',value:' ',class:'glyphicon glyphicon-stats'}}],
                                ActionClass:'odds',
                                ActionLimit:["ClassId=3&ClassId=89&ClassId=63&ClassId=2"],
                                Odds_Data:{
                                    GamePkID:['id'],
                                    ActionParentElement:'ul',
                                    ActionClass:'block-{GamePkID}',
                                    GameOdd:['li',
                                        {
                                            class:'odd',
                                            value:{
                                                element:'a',
                                                ActionOnClick:"document.location.href = document.location.origin+'/Holder.bet?page=livebetting&event={BrMatchid}&mani={ManiID}&quote={GamePkID}&cod={cod}&offerNumber={OfferNumber}'",
                                                ActionClass:'odd-val {GamePkID}',
                                                ActionLockValues:[['glyphicon glyphicon-lock','','0.00','-']],
                                                ActionUpDown:[true], // when use [] dont print as attribute
                                                value:''
                                            } 
                                        }],
                                    ActionUpdate:[{GameOdd:'odd-val'}],
                                    GameName:['li',{class:'name',value:''}],
                                },
                                //ActionAll:['li',{class:'fa fa-chevron-down'}],
                            }
                        }
                    }
                });
        }
        liveBetting.startInterval(4000,{METHOD:'LIVE_LISTVIEW',type:'json'},function(data){
            var list = data._ListData;
            if (list == undefined) return;
            list = liveBetting.convertDataByGroup(list,{
                GroupId:'id',
                GroupDesc:'',
                ManiList:{
                    ManiID:'id',
                    ManiDesc:'',
                    MatchList:{}
                }
            });
            liveBetting.updateOdds(list,false,div);
        });
        document.getElementsByClassName('statsBoxContent')[0].innerHTML = "";
        document.getElementsByClassName('statsBoxContent')[0].prepend(div);
    });
}

load();

function updateResults(html,value){
    var resultHtml = html.getElementsByClassName('results-text')[0];
    resultHtml.innerText= jvScore.buildScoreDetails(1,value,false,'-');
}


function updateCurrentTime(html,value){
    var timeHtml = html.getElementsByClassName('time-text')[0];
    timeHtml.innerText = value + " '";
}


function JvScore(){

    this.buildScoreDetails = function(groupId,tempScore, type,middle='<br/>'){
        var realScore = ''
        var tempScore = tempScore ? tempScore : "0-0";
        switch(groupId.toString()){
            case "1":
                realScore = calculateScoreSum(tempScore)
                break;
            case "2":
                if (type == "full") {
                    realScore = calculateScoreFull(tempScore)
                } else {
                    realScore = calculateScoreDisplay(tempScore)        
                }
                break;
            case "7":
                if (type == "full") {
                    realScore = calculateScoreFull(tempScore)
                } else {
                    realScore = calculateScoreDisplay(tempScore)        
                }
                break;
            case "8":
                realScore = displayLastScore(tempScore)
                break;
            case "17":
                realScore = calculateScoreSum(tempScore)
                break;
        }
        if(realScore.indexOf('-')){ realScore = realScore.split('-').join(middle)};
        if(realScore.indexOf(':')){ realScore = realScore.split(':').join(middle)};
        return realScore;
    }

    function calculateScoreSum(tempScore){
        var homeScore = 0
        var awayScore = 0
        var splittedScore = tempScore.split('|')
        for(var i = 0; i< splittedScore.length; i++){
            var subSplittedScore = splittedScore[i].split('-');
            if(subSplittedScore.length > 1){
                homeScore += parseInt(subSplittedScore[0], 10)
                awayScore += parseInt(subSplittedScore[1], 10)
            }
        }
        return homeScore + '-' + awayScore;
    }

    function calculateScoreDisplay(tempScore){
        resScore = '0:0'
        var splittedScore = tempScore.split('|')
        resScore = ''
        for(var i = 0; i < splittedScore.length; i++){
            if(i > 0){
                resScore += ' '
            }
            var subSplittedScore = splittedScore[i].split('-');
            resScore = subSplittedScore[0] + ':' + subSplittedScore[1];
        }
        return resScore;
    }

    function calculateScoreFull(tempScore){
        resScore = '0-0'
        var splittedScore = tempScore.split('|')
        resScore = ''
        for(var i = 0; i < splittedScore.length; i++){
            if(i > 0){
                resScore += ' | '
            }
            var subSplittedScore = splittedScore[i].split('-');
            resScore += subSplittedScore[0] + '-' + subSplittedScore[1];
        }
        return resScore;    
    }

    function displayLastScore(tempScore){
        var resScore = '0-0'
        var splittedScore = tempScore.split('|')
        var len = splittedScore.length
        resScore = splittedScore[len-1];
        return resScore;
    }
}

var jvScore = new JvScore();
