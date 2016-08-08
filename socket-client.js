alert('socket-client');

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
    alert(window.io);

    me.socket = io.connect('ws://10.199.129.14:8999/offline');
    me.socket.on('connect', function(data) {
        alert('connect true');

        var msg = new Message();
        msg.type = 'join';
        msg.group = me.group;
        me.socket.send(msg, function(data){
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
    });
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

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var group = getQueryString('group');
alert(group);
var cli = new Client(group);
cli.ready(function(){
    cli.onMessage('reload', function(data){
        alert(data.content.url);

        location.href = data.content.url;
    });
});
