var fs = require('fs');
var net = require('net');
var child = require('child_process');
var ProgressBar = require('progress');
var path = require('path');
var gui = {};

gui.open = function(group) {
    var pos = 1;
    var bar = new ProgressBar('start server [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: 1000
    });

    var timer = setInterval(function() {
        bar.tick(pos++);
    }, 100);

    var lastTimer = setTimeout(function() {
        clearInterval(timer);
        bar.tick(1000);
        bar.terminate();
        console.log("服务已启动，访问http://localhost:8088?group=" + group);
        if (process.platform == 'win32' || process.platform == 'win64') {
            child.exec('start http://localhost:8088?group=' + group);
        } else {
            child.exec('open http://localhost:8088?group=' + group);
        }
    }, 2000);

    portIsOccupied(8088, function(){
        var cp = child.fork(path.resolve(__dirname, 'server.js'), {
            silent: false
        });
        cp.on('message', function(msg) {

        });
        cp.on('error', function(msg) {
            console.log(msg);
        });
    })

    process.on('exit', function() {
        console.log('exit');
    });

    // 检测端口是否被占用
    function portIsOccupied(port, func) {
        // 创建服务并监听该端口
        var server = net.createServer().listen(port)

        server.on('listening', function() { // 执行这块代码说明端口未被占用
            server.close() // 关闭服务
            func && func()
        })

        server.on('error', function(err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                console.error('The port【' + port + '】 is occupied, please kill the process.')
                process.exit();
            }
        })
    }
};

module.exports = gui;
