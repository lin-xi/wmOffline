var fs = require('fs');
var io = require('socket.io-client');
var Message = require('./message.js');

function Client(group) {
    this.group = group;
    this.init();
}

Client.prototype.init = function() {
    var me = this;
    me._eventHub = {};
    me._eventQueue = {};

    me.socket = io.connect('ws://172.17.134.167:8999/offline');
    me.socket.on('connect', function(data) {
        var msg = new Message();
        msg.type = 'join';
        msg.group = me.group;
        me.send(msg, function(data){
            me.state = 'connected';
            me.ready && me.ready();
        });
    });

    me.socket.on('message', function(msg) {
        var funcs = me._eventHub[msg.type];
        if(funcs && funcs.length > 0){
            funcs.forEach(function(func){
                func && func(msg);
            });
        }
        var funcs = me._eventQueue[msg.type];
        while(funcs && funcs.length > 0){
            var func = funcs.pop();
            func && func(msg);
        }
    });

    me.socket.on('error', function(data) {
        console.log(data);
    });
};

Client.prototype.send = function(msg, func) {
    msg.group = this.group;
    this.onInnerMessage(msg.type + '_response', function(data){
        func && func(data);
    })
    this.socket.emit(msg.type, msg);
};

Client.prototype.onMessage = function(evt, func) {
    var me = this;
    if(!me._eventHub[evt]){
        me._eventHub[evt] = [];
    }
    me._eventHub[evt].push(func);
};

Client.prototype.ready = function(func) {
    var me = this;
    me.ready = func;
    if(me.state == 'connected'){
        me.ready && me.ready();
    }
};

Client.prototype.onInnerMessage = function(evt, func) {
    var me = this;
    if(!me._eventQueue[evt]){
        me._eventQueue[evt] = [];
    }
    me._eventQueue[evt].push(func);
};

Client.prototype.checkVersion = function(ver, func) {
    var msg = new Message();
    msg.type = 'checkVersion';
    msg.content = {version: ver};
    this.send(msg, function(result){
        func && func(result);
    });
};

Client.prototype.updateUrl = function(url, func) {
    var msg = new Message();
    msg.type = 'updateUrl';
    msg.content = {url: url};
    this.send(msg, function(result){
        func && func(result);
    });
};

module.exports = Client;
