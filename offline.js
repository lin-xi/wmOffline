'use strict';

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


var fs = require('fs');
var path = require('path');
var buf = require('buffer');
var getDirName = require("path").dirname;

var config, srcPath, outPath;
var basePath = process.cwd();
var folders = [],
    md5Files = {
        js: {},
        css: {},
        image: {},
        html: {},
        pack: {}
    };
var startTime = new Date();
var watchTimer, watchFlag = false;

var runStack = ['traverse', 'jsPack', 'cssPack', 'html', 'release', 'watch'];
var queue;
var _ = {};

function traverse(path, handle) {
    var state = fs.statSync(path);
    if (state.isDirectory()) {
        var files = fs.readdirSync(path);
        if (!files) {
            console.log('read dir error');
        } else {
            folders.push(path);

            files.forEach(function (item, index) {
                var tmpPath = path + '/' + item;
                var fileStat = fs.statSync(tmpPath);
                if (!fileStat) {
                    console.log('stat error');
                } else {
                    if (fileStat.isDirectory()) {
                        traverse(tmpPath, handle);
                    } else {
                        handle(tmpPath);
                    }
                }
            });
        }
    } else {
        handle(path);
    }
}

function setup() {
    console.log('                                                 ');
    console.log('                    ,,                           ');
    console.log('                   *MM                           ');
    console.log('                    MM                           ');
    console.log('  M"""MMV  .gP"Ya   MM,dMMb.  `7Mb,od8,  g6"Yb.  ');
    console.log('     AMV  ,M\'    Yb MM    \`Mb  MM\'   \"\' 8)   MM  ');
    console.log('    AMV   8M""""""  MM     M8  MM       ,pm9mMM  ');
    console.log('   AMV  , YM.    ,  MM.   ,M9  MM      8M    MM  ');
    console.log('  AMMmmmM  `Mbmmd\'  P^YbmdP\' .JMML.     `Moo9^Yo.');
    console.log('=================================================== Version 1.0.8');

    getConfig();
    srcPath = relative2absolute(config.base, basePath);
    outPath = relative2absolute(config.output, basePath);
    if (outPath.slice(-1) == '/' || outPath.slice(-1) == '\\') {
        outPath = outPath.slice(0, -1);
    }
    if (config.clean) {
        deleteFolder(outPath);
    }
    queue = runStack.slice(0);
    run();
}

function getConfig() {
    var jsData = fs.readFileSync(basePath + '/zebra-config.json', "utf-8");
    config = JSON.parse(jsData);
}

function run() {
    var task = queue.shift();
    switch (task) {
        case 'traverse':
            runTraverse();
            break;
        case 'jsPack':
            runJsPack();
            break;
        case 'cssPack':
            runCssPack();
            break;
        case 'html':
            runHtml();
            break;
        case 'watch':
            runWatch();
            break;
        case 'release':
            runRelease();
            break;
    }
}

function runTraverse() {
    folders = [];
    var js = config.rules.js;
    var timer;
    traverse(srcPath, function (path) {
        if (timer) {
            clearTimeout(timer);
        }
        setTimeout(function () {
            run();
        }, 1000);

        var ext = path.split('.');
        ext = ext[ext.length - 1];
        switch (ext) {
            case 'js':
                preproccessJs(path);
                break;
            case 'css':
                preproccessCss(path);
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                preproccessImage(path);
                break;
            case 'html':
                md5Files.html[path] = path;
                break;
            default:
                preproccessFile(path);
                break;
        }
    });
}

function runJsPack() {
    var js = config.rules.js;
    if (!js.pack) {
        run();
        return;
    }
    for (var p in js.pack) {
        var outFile = outPath + '/' + p;
        if (js.md5 && js.md5.exclude.indexOf(outFile) == -1) {
            outFile = getMd5Name(outFile);
            md5Files.pack[p] = outFile.replace(outPath, '');
        }
        var files = js.pack[p];
        var packTemp = [];
        files.forEach(function (item, idx) {
            var filePath = outPath + '/' + item;
            var relativePath = filePath.replace(outPath, '');
            packTemp.push(fs.readFileSync(filePath, "utf-8"));
            fs.unlinkSync(filePath);
            md5Files.js[relativePath] = md5Files.pack[p];
        });
        var outData = packTemp.join(';');

        writeFile(outFile, outData, 'utf-8');
        console.log('> Pack [' + outFile + ']');
    }
    run();
}

function runCssPack() {
    var css = config.rules.css;
    if (!css.pack) {
        run();
        return;
    }
    for (var p in css.pack) {
        var outFile = outPath + '/' + p;
        if (css.md5 && css.md5.exclude.indexOf(outFile) == -1) {
            outFile = getMd5Name(outFile);
            md5Files.pack[p] = outFile.replace(outPath, '');
        }
        var files = css.pack[p];
        var packTemp = [];
        files.forEach(function (item, idx) {
            var filePath = outPath + '/' + item;
            packTemp.push(fs.readFileSync(filePath, "utf-8"));
            fs.unlinkSync(filePath);
        });
        var outData = packTemp.join(';');
        writeFile(outFile, outData, 'utf-8');
        console.log('> Pack [' + outFile + ']');
    }
    run();
}

function runHtml() {
    var loaded = {};
    var rule = config.rules;
    var replacePath = true;

    var htmls = md5Files.html;
    for (var path in htmls) {
        var relativePath = path.replace(srcPath, ''); // /build/dust/..
        var outFile = outPath + relativePath;
        var data = fs.readFileSync(path, "utf-8");

        //替换requireJs data-main路径
        data = data.replace(/<script(?:.*?)data-main=("(.*?)"|'(.*?)')(?:.*?)><\/script>/mg, function (s0, s1) {
            return '<script src="' + getNewMd5Name(s1) + '"></script>';
        });
        if (rule.js.md5 || rule.js.pack) {
            //替换js路径
            data = data.replace(/<script(?:.*?)src=("(.*?)"|'(.*?)')(?:.*?)><\/script>/mg, function (s0, s1) {
                var nmd = getNewMd5Name(s1);
                if (!loaded[nmd]) {
                    loaded[nmd] = true;
                    return '<script src="' + nmd + '"></script>';
                } else {
                    return '';
                }
            });
        }
        if (rule.css.pack || rule.css.md5) {
            //替换css路径
            data = data.replace(/<link(.*?)>/mg, function (s0, s1) {
                return '<link' + s1.replace(/href=("(.*?)"|'(.*?)')/, function (ss0, ss1) {
                    return 'href="' + getNewMd5Name(ss1) + '"';
                }) + '>';
            });
        }
        if (rule.image.md5) {
            //替换css路径
            data = data.replace(/<img(.*?)\/>/mg, function (s0, s1) {
                return '<img' + s1.replace(/src=("(.*?)"|'(.*?)')/, function (ss0, ss1) {
                    return 'src="' + getNewMd5Name(ss1) + '"';
                }) + '/>';
            });
        }

        //资源列表
        if (rule.html.resourceMap) {
            data = data.replace(/<\/head>/, function () {
                var json = {};
                if (md5Files['js']) {
                    var temp = md5Files['js'];
                    for (var file in temp) {
                        json[file] = temp[file];
                    }
                }
                if (md5Files['css']) {
                    var temp = md5Files['css'];
                    for (var file in temp) {
                        json[file] = temp[file];
                    }
                }
                return '<script type="text/javascript">var resourceMap=' + JSON.stringify(json) + '</script></head>';
            });
        }

        writeFile(outFile, data, 'utf-8');
    }
}

function runWatch() {
    var args = process.argv.slice(2);
    var cmd = args[0];
    if (cmd) {
        cmd = cmd.slice(1);
        if (args[0] == '-w' && folders.length > 0) {
            if (!watchFlag) {
                folders.forEach(function (item, index) {
                    watchDir(item);
                });
                console.log('[watch]...');
                watchFlag = true;
            }
        }
    }
}

function runRelease() {
    var args = process.argv.slice(2);
    var cmd = args[0];
    if (cmd) {
        cmd = cmd.slice(1);
        if (cmd.indexOf('d') > -1) {
            doUpload();
        }
    }
}

function watchDir(path) {
    fs.watch(path, {
        persistent: true
    }, function (type, file) {
        if (watchTimer) {
            clearTimeout(watchTimer);
        }
        watchTimer = setTimeout(function () {
            console.log('>>', path + '/' + file);
            // traverse(srcPath, 0);
            queue = ['traverse', 'jsPack', 'cssPack', 'html', 'release'];
            run();
        }, 700);
    });
}

function getNewMd5Name(path) {
    var np = path.replace(/['"]/g, '');
    var rule = config.rules;
    var names = np.split('.');
    var ft = names[names.length - 1];
    switch (ft) {
        case 'js':
        case 'css':
            var mname;
            // if (rule.js.pack) {
            //     for (var k in rule[ft].pack) {
            //         var pf = rule[ft].pack[k];
            //         if (pf.some(function (item) {
            //                 if (item == path) {
            //                     mname = md5Files.pack[k];
            //                     return true;
            //                 }
            //             })) {
            //             break;
            //         }
            //     }
            // } else {
            //     mname = md5Files[ft]['/' + np];
            // }
            mname = md5Files[ft]['/' + np];
            break;
        case 'image':
            mname = md5Files['image']['/' + np];
            break;
    }
    if (!mname) {
        mname = np
    } else {
        mname = mname.slice(1);
    }
    return mname;
}


function getMd5Name(name) {
    var names = name.split('.');
    var ft = names.pop();
    return names.join('.') + '_' + md5() + '.' + ft;
}

function relative2absolute(path, base) {
    if (path.match(/^\//)) {
        return path;
    }
    var pathParts = path.split('/');
    var basePathParts = base.split('/');

    var item = pathParts[0];
    while (item === '.' || item === '..') {
        if (item === '..') {
            basePathParts.pop();
        }
        pathParts.shift();
        item = pathParts[0];
    }
    return basePathParts.join('/') + '/' + pathParts.join('/');
}

function preproccessJs(path) {
    var jsData = fs.readFileSync(path, "utf-8");
    var relativeOutPath = outPath.replace(basePath, ''), // /build
        relativePath = path.replace(srcPath, ''), // /build/dust/..
        relativeDir = getDirName(path).replace(srcPath, ''); // /dust/...
    var outFile = outPath + relativePath;
    var js = config.rules.js;

    if (js.compile) {
        //给module注入路径
        var reg = /module\s*\(\s*(function\s*\(.*?\)\s*\{)/;
        jsData = jsData.replace(reg, function (s0, s1) {
            return 'module("' + relativeOutPath + relativePath + '", ' + s1;
        });

        //将require的相对路径换成绝对路径
        var reg2 = /require\(([^\)]+)\)/g;
        jsData = jsData.replace(reg2, function (s0, s1) {
            var rpath = s1.slice(1, -1);
            if (/^(\.\/)|(\.\.\/)/.test(rpath)) {
                rpath = relative2absolute(rpath, relativeDir);
            }
            if (rpath.slice(-3) != '.js') {
                rpath += '.js';
            }
            return 'require("' + relativeOutPath + rpath + '")';
        });
    }

    //将inline的内容注入
    var reg3 = /__inline\(([^\)]+)\)/g;
    jsData = jsData.replace(reg3, function (s0, s1) {
        var rpath = s1.slice(1, -1);
        if (/^(\.\/)|(\.\.\/)/.test(rpath)) {
            rpath = srcPath + relative2absolute(rpath, relativeDir);
        }
        return '"' + getFileAsString(rpath) + '"';
    });

    if (js.uglify) {
        console.log('> Uglify [' + path + ']');
        jsData = doUglify(jsData);
    }
    if (js.md5) {
        if (js.pack) {
            md5Files.js[relativePath] = outFile.replace(outPath, '');
        } else {
            outFile = getMd5Name(outFile);
            md5Files.js[relativePath] = outFile.replace(outPath, '');
        }
    }
    writeFile(outFile, jsData, 'utf-8');
}

function preproccessCss(path) {
    var css = config.rules.css;
    if (css.compress) {
        var relativePath = path.replace(srcPath, ''); // /build/dust/..
        var outFile = outPath + relativePath;
        var cssData = fs.readFileSync(path, "utf-8");
        cssData = cssData.replace(/\r\n|\n/mg, '');
        if (!css.pack && css.md5 && css.md5.exclude.indexOf(path) == -1) {
            outFile = getMd5Name(outFile);
            md5Files.css[relativePath] = outFile.replace(outPath, '');
        }
        writeFile(outFile, cssData, 'utf-8');
    }
}

function preproccessImage(path) {
    var image = config.rules.image;
    var relativePath = path.replace(srcPath, ''); // /build/dust/..
    var outFile = outPath + relativePath;
    var imageData = fs.readFileSync(path, "binary");
    if (image.md5 && image.md5.exclude.indexOf(path) == -1) {
        outFile = getMd5Name(outFile);
        md5Files.image[relativePath] = outFile, replace(outPath, '');
    }
    writeFile(outFile, imageData, 'binary');
}

function preproccessHTML(path) {

}

function preproccessFile(path) {
    var relativePath = path.replace(srcPath, ''); // /build/dust/..
    var outFile = outPath + relativePath;
    if (_.isTextFile(path)) {
        var fileData = fs.readFileSync(path, "utf-8");
        writeFile(outFile, fileData, 'utf-8');
    } else {
        var fileData = fs.readFileSync(path, "binary");
        writeFile(outFile, fileData, 'binary');
    }
}


function getFileAsString(path) {
    var fileData = fs.readFileSync(path, "utf-8");
    fileData = fileData.replace(/\r|\n|\t/mg, '');
    fileData = fileData.replace(/'/mg, "\\'"); // '
    fileData = fileData.replace(/"/mg, '\\"'); // "
    return fileData;
}

function writeFile(path, contents, type) {
    var dir = getDirName(path);
    var dirs = dir.split('/'),
        temp = dirs.shift();
    while (dirs.length > 0) {
        temp += '/' + dirs.shift();
        if (!fs.existsSync(temp)) {
            fs.mkdirSync(temp);
        }
    }
    if (type == 'binary') {
        fs.writeFileSync(path, contents.toString('binary'), "binary");
    } else {
        fs.writeFileSync(path, contents, 'utf-8');
    }
}

function done() {
    var time = (new Date() - startTime) / 1000;
    console.log('[done] ' + time + 's');
    startTime = new Date();
}

function deleteFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        //fs.rmdirSync(path);
    }
}

function doWatch() {
    preproccessHTML();
    var args = process.argv.slice(2);
    var cmd = args[0];
    if (cmd) {
        cmd = cmd.slice(1);
        if (cmd.indexOf('d') > -1) {
            doUpload();
        } else if (args[0] == '-w' && folders.length > 0) {
            if (!watchFlag) {
                folders.forEach(function (item, index) {
                    watchDir(item);
                });
                console.log('[watch]...');
                watchFlag = true;
            }
        }
    }
}

function md5(n) {
    return (Math.random() * 65535 * new Date()).toString(36);
}


function doUpload() {
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
            var absPath = relative2absolute(item.from, basePath);
            traverse(absPath, function (path) {
                uploadFile(path);
            });

            function uploadFile(path) {
                var fileData = _.read(path);
                var toPath = item.to + path.replace(outPath, '');
                _.upload(httpOption, {
                    to: toPath
                }, fileData, 'tmp_name', function (e, body) {
                    console.log('[upload] ', path, " >> ", toPath);
                }, function (err) {
                    console.log('error', err);
                });
            }
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

//开始
setup();
