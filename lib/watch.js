var pack = require('./utils/pack');
var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var Client = require('./client/client');
var doUpload = require('./utils/upload');
var browser = require('./utils/browser');
var chalk = require('chalk');
var watchTimer = null;
var group = null;
var socket = null;
function watch(projectPath) {
    group = md5(Math.random() * 10000000 + Date.now());
    setUpSocket().then(function () {
        browser(group);
        zipAndUpload(projectPath);
        runWatch(projectPath);
    }, function (e) {
        console.log(e);
    });
}


function zipAndUpload(projectPath) {
    var config = JSON.parse(fs.readFileSync(path.resolve(projectPath, './offline-config.json')));
    var zip = pack(path.resolve(projectPath, config.watch), false);
    zip.file('socket-client.js', injectClientJS());
    zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (content) {
        var zipPath = path.resolve(projectPath, './output_' + md5(Date.now()) + '.zip');
        fs.writeFileSync(zipPath, content);
        doUpload(zipPath).then(function (url) {
            socket.updateUrl(url);
        });
    }, function (error) {
        console.log(chalk.red(error));
    });
}

function injectClientJS() {
    var text = fs.readFileSync(path.resolve(__dirname, './mobile/socket-client.js'), 'utf8');
    text = text.replace(/\{\{(.*?)\}\}/mg, function (s0, s1) {
        return group;
    });
    return new Buffer(text);
}

function runWatch(projectPath) {
    var config = JSON.parse(fs.readFileSync(path.resolve(projectPath, './offline-config.json')));
    fs.watch(path.resolve(projectPath, config.watch), {
        persistent: true
    }, function () {
        if (watchTimer) {
            clearTimeout(watchTimer);
        }
        watchTimer = setTimeout(function () {
            zipAndUpload(projectPath);
        }, 1000);
    });
}

function setUpSocket() {
    socket = new Client(group);
    return new Promise(function (resolve, reject) {
        socket.ready(function () {
            resolve();
        });
    })

}
module.exports = watch;


