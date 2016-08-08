// var Ascii = require('ascii');
var fs = require('fs');
var Zip = require('jszip');
var md5 = require('md5');
var path = require('path');
var child = require('child_process');
var gui = require('./gui');
var ProgressBar = require('progress');
var cache = require('memory-cache');
var md5 = require('md5');
var Client = require('./lib/client/client');
var Message = require('./lib/client/message');

var cli = {};
var socket, group;

var _ = {}, config, watchTimer, output, outputPath;

cli.version = function() {
    // var pic = new Ascii('logo.png');
    // pic.convert(function(err, result) {
    //     console.log(result);
    // });
    var pkg = fs.readFileSync(cli.execPath + '/package.json');
    pkg = JSON.parse(pkg);
    console.log('');
    console.log('');
    console.log('');
    console.log('');
    console.log('              o                            _');
    console.log('   ===========|                        ,--/  \\');
    console.log('   ==百度外卖 |                    []==]_____/');
    console.log('    ==========|                         \\   \\');
    console.log('              |_____________             \\   \\');
    console.log('        __  /  _,-----._     )           ｜   \\ ');
    console.log('       |_||/_-~         `.  /            ｜   | ]] ');
    console.log('         |//    百度外卖  \\ |            /   /_-~ ~-_');
    console.log('         //________________||           /  //________\\');
    console.log('        //__|______________| \\_________/  //_/.-\\ \\~-.');
    console.log('       ((_________________/_-o__________//_/ /   \\,\\   \\');
    console.log('        |__/(  ((====)o===--~~」            (   ( (o/)  )');
    console.log("             \\  ``=='  /                     \\   `--'  /");
    console.log("              `-.___,-'     2016 Linxi        `-.___,-'");
    console.log('                            version', pkg.version);
    console.log('');
    console.log('');
    console.log('');
    process.exit();
}

cli.help = function(){
    var content = [
        '',
        '  Options:',
        '',
        '    -h,        output usage information',
        '    -v,        output the version number',
        '    watch,     start the offline dev tool and watch the change of the configured folder',
        '    open,      open the GUI page',
        ''
    ];
    console.log(content.join('\n'));
    process.exit();
};

cli.run = function(argv){
    cli.processCWD = process.cwd();
    cli.execPath = process.execPath;
    group = md5(Math.random() * 10000000 + Date.now());
    cache.put('group', group);

    setUpSockect(group, function(){
        var first = argv[2];
        if(first === '-h' ||  first === '--help'){
            cli.help();
        } else if(first === '-v' || first === '--version'){
            cli.version();
        } else if(first === 'watch'){
            cli.watch();
            packAndRelease();
            gui.open(group);
        } else if(first === 'open'){
            gui.open(group);
        } else {
        }
    });
};

cli.watch = function(argv){
    var configPath = cli.processCWD + '/offline-config.json';
    var stat = fs.statSync(configPath);
    if(stat.isFile()){
        var jsData = fs.readFileSync(configPath);
        try{
            config = JSON.parse(jsData);
        } catch (e){
            console.error('"offline-config.json" parse error\n, see https://github.com/lin-xi/wmOffline');
            return;
        }
        var root = path.resolve(cli.processCWD, config.watch);
        if(root == cli.processCWD){
            console.log("config [watch] can not be the project root directory, it must be a child directory");
        } else {
            console.log("监听中...[" + root  + "]");
            runWatch(root);
        }
    } else {
        console.error('no file "offline-config.json" found in current fold\n, see https://github.com/lin-xi/wmOffline');
    }
};

function runWatch(path) {
    fs.watch(path, {
        persistent: true
    }, function (type, file) {
        if (watchTimer) {
            clearTimeout(watchTimer);
        }
        watchTimer = setTimeout(function () {
            console.log('>>', path + '/' + file);
            packAndRelease();
        }, 1000);
    });
}

function setUpSockect(group, func){
    socket = new Client(group);
    socket.ready(function(){
        var pkg = fs.readFileSync(cli.execPath + '/package.json');
        pkg = JSON.parse(pkg);

        socket.checkVersion(pkg.version, function(result){
            if(result.content == 1){
                console.log('有新版本发布，正在升级...');
                console.log('npm update wm-offline -g');
                child.exec('npm update wm-offline -g', function(err, stdout, stderr){
                    console.log(stdout);
                    console.log('已更新至最新版本,请重新客户端');
                    process.exit();
                });
            } else {
                func && func();
            }
        });
    });
}

function packAndRelease() {
    var root = path.resolve(cli.processCWD, config.watch);

    var pos = 1;
    var bar = new ProgressBar('zip [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: 100
    });
    var timer = setInterval(function () {
        bar.tick(pos++);
    }, 100);

    output = 'output_' + md5(Date.now()) + '.zip';
    // output = 'output.zip';
    outputPath = cli.processCWD + '/' + output;
    var zip = new Zip();
    traverse(zip, root, true);
    // console.log('traverse done:');
    zip.file('socket-client.js', fs.readFileSync(cli.execPath + '/socket-client.js'));
    zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (content) {
        // console.log("done");
        try{
            fs.writeFileSync(outputPath, content);
            clearInterval(timer);
            bar.tick(100);
            bar.terminate();
            console.log('\n');

            doUpload(function(url){
                // fs.unlink(outputPath);
                socket.updateUrl(url);
            });
        }catch(e){
            console.error(e);
        }
    });
}


function traverse(zip, filePath, first) {
    var state = fs.statSync(filePath);
    if (state.isDirectory()) {
        // folderHandle(path);
        var fz;
        if(first){
            fz = zip;
        } else {
            var foler = filePath.replace(path.dirname(filePath)+ '/', '')
            fz = zip.folder(foler);
            // console.log('add folder:' + foler);
        }
        var files = fs.readdirSync(filePath);
        if (files) {
            files.forEach(function (item, index) {
                var tmpPath = filePath + '/' + item;
                var fileStat = fs.statSync(tmpPath);
                if (fileStat) {
                    if (fileStat.isDirectory()) {
                        traverse(fz, tmpPath, false);
                    } else {
                        fz.file(item, inject(tmpPath));
                        // console.log('add file:'+ item);
                        // fileHandle(tmpPath);
                    }
                }
            });
        }
    } else {
        // fileHandle(path);
        // console.log('add file:'+ filePath);
        var fp = filePath.replace(path.dirname(filePath) + '/', '');
        zip.file(fp);
    }
}

function inject(filePath){
    var ext = path.extname(filePath);
    if(ext == '.html'){
        var js = '<script src="http://10.199.129.14:8999/socket.io/socket.io.js"></script><script src="socket-client.js"></script>';
        var text = fs.readFileSync(filePath, 'utf8');
        text = text.replace(/<\!--(.*?)-->/mg, '');
        text = text.replace(/<\/body>/, js + '</body>');
        return new Buffer(text);
    } else {
        return fs.readFileSync(filePath);
    }
}

function doUpload(func) {
    var deploy = config.deploy;
    if (deploy && deploy.length > 0) {
        deploy.forEach(function (item, i) {
            var httpOption;
            var mats = item.receiver.match(/http:\/\/([^:]+):(\d+)(.*?)$/);
            if (mats.length > 0) {
                httpOption = {
                    host: mats[1],
                    port: mats[2],
                    path: mats[3],
                    method: "POST",
                };
            }
            var fileData = _.read(outputPath);
            var toPath = item.to + '/' + output;
            _.upload(httpOption, {
                to: toPath
            }, fileData, 'tmp_name', function (e, body) {
                var url = 'http://'+ mats[1] + ':8086' + item.to.replace('/home/map/odp_cater/webroot', '') + output;
                console.log('\n');
                console.log('[upload] ', output, " >> ", toPath);
                console.log('[url] ', url);
                func && func(url);
            }, function (err) {
                console.log('error', err);
            });
        });
    }
}

var TEXT_FILE_EXTS = [
        'css', 'tpl', 'js', 'php',
        'txt', 'json', 'xml', 'htm',
        'text', 'xhtml', 'html', 'md',
        'conf', 'po', 'config', 'tmpl',
        'coffee', 'less', 'sass', 'jsp',
        'scss', 'manifest', 'bak', 'asp',
        'tmp', 'haml', 'jade', 'aspx',
        'ashx', 'java', 'py', 'c', 'cpp',
        'h', 'cshtml', 'asax', 'master',
        'ascx', 'cs', 'ftl', 'vm', 'ejs',
        'styl', 'jsx', 'handlebars'
    ],
    IMAGE_FILE_EXTS = [
        'svg', 'tif', 'tiff', 'wbmp',
        'png', 'bmp', 'fax', 'gif',
        'ico', 'jfif', 'jpe', 'jpeg',
        'jpg', 'woff', 'cur', 'webp',
        'swf', 'ttf', 'eot', 'woff2'
    ],
    MIME_MAP = {
        //text
        'css': 'text/css',
        'tpl': 'text/html',
        'js': 'text/javascript',
        'jsx': 'text/javascript',
        'php': 'text/html',
        'asp': 'text/html',
        'jsp': 'text/jsp',
        'txt': 'text/plain',
        'json': 'application/json',
        'xml': 'text/xml',
        'htm': 'text/html',
        'text': 'text/plain',
        'md': 'text/plain',
        'xhtml': 'text/html',
        'html': 'text/html',
        'conf': 'text/plain',
        'po': 'text/plain',
        'config': 'text/plain',
        'coffee': 'text/javascript',
        'less': 'text/css',
        'sass': 'text/css',
        'scss': 'text/css',
        'styl': 'text/css',
        'manifest': 'text/cache-manifest',
        //image
        'svg': 'image/svg+xml',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'wbmp': 'image/vnd.wap.wbmp',
        'webp': 'image/webp',
        'png': 'image/png',
        'bmp': 'image/bmp',
        'fax': 'image/fax',
        'gif': 'image/gif',
        'ico': 'image/x-icon',
        'jfif': 'image/jpeg',
        'jpg': 'image/jpeg',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'eot': 'application/vnd.ms-fontobject',
        'woff': 'application/font-woff',
        'woff2': 'application/font-woff',
        'ttf': 'application/octet-stream',
        'cur': 'application/octet-stream'
    };

_.read = function (path, convert) {
    var content;
    if (fs.existsSync(path)) {
        content = fs.readFileSync(path);
        if (!_.isTextFile(path)) {
            content = _.readBuffer(content);
        }
    } else {
        console.log('unable to read file[' + path + ']: No such file or directory.');
    }
    return content;
};

_.readBuffer = function (buffer) {
    if (_.isUtf8(buffer)) {
        buffer = buffer.toString('utf8');
        if (buffer.charCodeAt(0) === 0xFEFF) {
            buffer = buffer.substring(1);
        }
    } else {
        //buffer = getIconv().decode(buffer, 'gbk');
    }
    return buffer;
};

_.upload = function (opt, data, content, subpath, callback, errorFn) {
    if (typeof content === 'string') {
        content = new Buffer(content, 'utf8');
    } else if (!(content instanceof Buffer)) {
        console.error('unable to upload content [' + (typeof content) + ']');
    }
    data = data || {};
    var endl = '\r\n';
    var boundary = '-----np' + Math.random();
    var collect = [];
    for (var key in data) {
        collect.push('--' + boundary + endl);
        collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
        collect.push(endl);
        collect.push(data[key] + endl);
    }
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="file"; filename="' + subpath + '"' + endl);
    collect.push(endl);
    collect.push(content);
    collect.push('--' + boundary + '--' + endl);

    var length = 0;
    collect.forEach(function (ele) {
        length += ele.length;
    });

    opt = opt || {};
    opt.method = opt.method || 'POST';
    opt.headers = {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': length
    };
    var http = require('http');
    var req = http.request(opt, function (res) {
        var status = res.statusCode;
        var body = '';
        res.on('data', function (chunk) {
                body += chunk;
            })
            .on('end', function () {
                if (status >= 200 && status < 300 || status === 304) {
                    callback(null, body);
                } else {
                    callback(status);
                }
            })
            .on('error', function (err) {
                errorFn(err.message || err);
            });
    });
    collect.forEach(function (d) {
        req.write(d);
        if (d instanceof Buffer) {
            req.write(endl);
        }
    });
    req.end();
};

_.isTextFile = function (path) {
    return _.getFileTypeReg('text').test(path || '');
};

_.isImageFile = function (path) {
    return _.getFileTypeReg('image').test(path || '');
};

_.isUtf8 = function (bytes) {
    var i = 0;
    while (i < bytes.length) {
        if (( // ASCII
                0x00 <= bytes[i] && bytes[i] <= 0x7F
            )) {
            i += 1;
            continue;
        }
        if (( // non-overlong 2-byte
                (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF)
            )) {
            i += 2;
            continue;
        }
        if (
            ( // excluding overlongs
                bytes[i] == 0xE0 &&
                (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || ( // straight 3-byte
                ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
                    bytes[i] == 0xEE ||
                    bytes[i] == 0xEF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || ( // excluding surrogates
                bytes[i] == 0xED &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            )
        ) {
            i += 3;
            continue;
        }
        if (
            ( // planes 1-3
                bytes[i] == 0xF0 &&
                (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || ( // planes 4-15
                (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || ( // plane 16
                bytes[i] == 0xF4 &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            )
        ) {
            i += 4;
            continue;
        }
        return false;
    }
    return true;
};

_.getFileTypeReg = function (type) {
    var map = [];
    if (type === 'text') {
        map = TEXT_FILE_EXTS;
    } else if (type === 'image') {
        map = IMAGE_FILE_EXTS;
    } else {
        console.log('invalid file type [' + type + ']');
    }
    map = map.join('|');
    return new RegExp('\\.(?:' + map + ')$', 'i');
};


module.exports = cli;
