var fs = require('fs');
var child = require('child_process');
var ProgressBar = require('progress');
var gui = {};

gui.open = function(group) {
    var pos = 1;
    var bar = new ProgressBar('start server [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: 1000
    });

    var timer = setInterval(function () {
        bar.tick(pos++);
    }, 100);

    setTimeout(function(){
        clearInterval(timer);
        bar.tick(1000);
        bar.terminate();
        console.log("服务已启动，访问http://localhost:8088?group=" + group);
        child.exec('open http://localhost:8088?group=' + group);
    }, 4000);

    var cp = child.fork(path.resolve(__dirname, 'server.js'), {
        silent: true
    });
    cp.on('message', function(msg){

    });

    process.on('exit', function(){
        cp.kill();
        console.log('exit');
    });
};


module.exports = gui;
