var fs = require('fs');
var net = require('net');
var child = require('child_process');
var chalk = require('chalk');
var ora = require('ora');
var path = require('path');

function browser(group) {
    var spinner = ora().start();
    var server = net.createServer().listen(8088);
    server.on('listening', function () {
        server.close();
        child.fork(path.resolve(__dirname, '../../server.js'), {
            silent: false
        });
        console.log(chalk.green('服务已启动，访问http://localhost:8088?group=' + group));
        if (process.platform == 'win32' || process.platform == 'win64') {
            child.exec('start http://localhost:8088?group=' + group);
        } else {
            child.exec('open http://localhost:8088?group=' + group);
        }
        spinner.stop();
    });
    server.on('error', function () {
        console.log(chalk.red('The port【8088】is occupied, please kill the process.'));
        spinner.stop();
    });
};

module.exports = browser;
