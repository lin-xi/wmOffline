// var Ascii = require('ascii');
var fs = require('fs');
var Zip = require('jszip');
var md5 = require('md5');
var path = require('path');
var cli = {};

var _ = {}, config, watchTimer, output, outputPath;

cli.version = function() {
    // var pic = new Ascii('logo.png');
    // pic.convert(function(err, result) {
    //     console.log(result);
    // });
    console.log('version 0.0.5');
}

cli.help = function(){
    var content = [
        '',
        '  Options:',
        '',
        '    -h, --help     output usage information',
        '    -v, --version  output the version number',
        '    start,     start the offline dev tool and watch the change of the current folder',
        ''
    ];
    console.log(content.join('\n'));
};

cli.run = function(argv){
    cli.processCWD = process.cwd();

    var first = argv[2];
    if(first === '-h' ||  first === '--help'){
        cli.help();
    } else if(first === '-v' || first === '--version'){
        cli.version();
    } else if(first === 'start'){
        cli.watch();
        packAndRelease();
    } else {
    }
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
        var root = path.resolve(cli.processCWD, config.root);
        if(root == cli.processCWD){
            console.log("config [root] can not be the project root directory, it must be a child directory");
        } else {
            console.log("[wathing root [" + root  + "] ...");
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

function packAndRelease() {
    var root = path.resolve(cli.processCWD, config.root);
    console.log('[ziping...]')
    // output = 'output_' + md5(Date.now()) + '.zip';
    output = 'output.zip';
    outputPath = cli.processCWD + '/' + output;
    var zip = new Zip();
    traverse(zip, root);

    console.log('traverse done:');
    zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (content) {
        console.log("done");
        try{
            fs.writeFileSync(outputPath, content);
            console.log("[zip done]");
            doUpload(function(){
                    //fs.unlink(outputPath);
            });
        }catch(e){
            console.error(e);
        }
    });
}

function traverse(zip, filePath) {
    var state = fs.statSync(filePath);
    if (state.isDirectory()) {
        // folderHandle(path);
        var foler = filePath.replace(path.dirname(filePath)+ '/', '')
        var fz = zip.folder(foler);
        console.log('add folder:' + foler);
        var files = fs.readdirSync(filePath);
        if (files) {
            files.forEach(function (item, index) {
                var tmpPath = filePath + '/' + item;
                var fileStat = fs.statSync(tmpPath);
                if (fileStat) {
                    if (fileStat.isDirectory()) {
                        traverse(fz, tmpPath);
                    } else {
                        fz.file(item, fs.readFileSync(tmpPath));
                        console.log('add file:'+ item);
                        // fileHandle(tmpPath);
                    }
                }
            });
        }
    } else {
        // fileHandle(path);
        console.log('add file:'+ filePath);
        var fp = filePath.replace(path.dirname(filePath) + '/', '');
        zip.file(fp);
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
                console.log('[upload] ', output, " >> ", toPath);
                console.log('[url] ', "http://cp01-shimiao01.epc.baidu.com:8086/static/offline/"+output);
                func && func();
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
