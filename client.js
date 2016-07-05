// var Ascii = require('ascii');
var fs = require('fs');
var zip = require('adm-zip');
var cli = {};

var _ = {}, folders = [], releaseConfig, watchTimer, output;

cli.version = function() {
    // var pic = new Ascii('logo.png');
    // pic.convert(function(err, result) {
    //     console.log(result);
    // });
    console.log('version 0.0.5');
}

cli.run = function(argv){
    cli.processCWD = process.cwd();

    var first = argv[2];
    if(first === '-h' ||  first === '--help'){
        cli.help();
    } else if(first === '-v' || first === '--version'){
        cli.version();
    } else if(first === 'start'){
        cli.watch();
    } else {
    }
};

cli.watch = function(argv){
    var configPath = cli.processCWD + '/offline-config.json';
    var stat = fs.statSync(configPath);
    if(stat.isFile()){
        var jsData = fs.readFileSync(configPath);
        releaseConfig = JSON.parse(jsData);
        runWatch(cli.processCWD);
    } else {
        console.error('no file "offline-config.json" found in current fold');
    }
};

cli.help = function(){
    var content = [
        '',
        '  Options:',
        '',
        '    -h, --help     output usage information',
        '    -v, --version  output the version number',
        '    start     start the offline dev tool and watch the change of the current folder',
        ''
    ]);
    console.log(content.join('\n'));
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

function packAndRelease(path, handle) {
    var zip = new Zip();
    zip.addLocalFolder(cli.processCWD);
    output = cli.processCWD + '/output_' + md5(Date.now()) + '.zip';
    zip.writeZip(output);
    doUpload();
}

function doUpload() {
    var deploy = releaseConfig.deploy;
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
            var fileData = _.read(output);
            var toPath = item.to + path.replace(outPath, '');
            _.upload(httpOption, {
                to: toPath
            }, fileData, 'tmp_name', function (e, body) {
                console.log('[upload] ', path, " >> ", toPath);
            }, function (err) {
                console.log('error', err);
            });
        });
    }
}

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
