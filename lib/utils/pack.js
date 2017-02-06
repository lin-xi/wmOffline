var JSZip = require('jszip');
var fs = require('fs');
var path = require('path');
var serverConfig = require('../server-config');
function pack(filePath, isBuildPattern) {
    var zip = new JSZip();
    packageFiles(zip, filePath, true, isBuildPattern);
    return zip;
}

function injectJS(filePath, isBuildPattern) {
    var ext = path.extname(filePath);
    if (ext == '.html') {
        var js = '<script src="http://' + serverConfig.host + '/socket.io/socket.io.js"></script><script src="socket-client.js"></script>';
        var text = fs.readFileSync(filePath, 'utf8');
        if (isBuildPattern) {
            text = text.replace(/<script\s*id\s*=\s*["']wmapp["']><\/script>/g, '<script src=\"../wmapp.js\"></script>');
        } else {
            text = text.replace(/<script\s*id\s*=\s*["']wmapp["']><\/script>/g, '<script src=\"../wmapp.js\"></script>');
            text = text.replace(/<\!--(.*?)-->/mg, '');
            text = text.replace(/<\/head>/, js + '</head>');
        }
        return new Buffer(text);
    } else {
        return fs.readFileSync(filePath);
    }
}

function packageFiles(zip, filePath, root, isBuildPattern) {
    var fsStat = fs.statSync(filePath);
    if (fsStat.isFile()) {
        zip.file(path.basename(filePath), injectJS(filePath, isBuildPattern));
        return;
    }
    if (fsStat.isDirectory()) {
        if (!root) {
            zip = zip.folder(path.basename(filePath));
        }
        var files = fs.readdirSync(filePath);
        files.forEach(function (itemPath) {
            packageFiles(zip, path.resolve(filePath, itemPath), false, isBuildPattern);
        });
    }
}
module.exports = pack;