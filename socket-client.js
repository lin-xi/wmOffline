function Message(){
    this.group = '';
    this.type = '';
    this.content = '';
    this.from = '';
}

function Client(group) {
    this.group = group;
    this.init();
}

Client.prototype.init = function() {
    var me = this;
    me._eventHub = {};
    me._eventQueue = {};

    me.socket = io.connect('ws://10.199.129.14:8999/offline');
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
};

Client.prototype.leave = function(msg, func) {
    var msg = new Message();
    msg.type = 'leave';
    this.send(msg);
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

Client.prototype.onInnerMessage = function(evt, func) {
    var me = this;
    if(!me._eventQueue[evt]){
        me._eventQueue[evt] = [];
    }
    me._eventQueue[evt].push(func);
};

Client.prototype.ready = function(func) {
    var me = this;
    me.ready = func;
    if(me.state == 'connected'){
        me.ready && me.ready();
    }
};

var group = '{{group}}';
var cli = new Client(group);
cli.ready(function(){
    cli.onMessage('reload', function(data){
        var result = confirm("检测到有更新，是否重新加载?");
        if(result){
            cli.leave();
            location.href = data.content.url;
        }
    });
});
