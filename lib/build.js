var pack = require('./utils/pack');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var ora = require('ora');
function build(projectPath) {
    var spinner = ora(chalk.blue('building....')).start();
    var config = JSON.parse(fs.readFileSync(path.resolve(projectPath, './offline-config.json')));
    var zip = pack(path.resolve(projectPath, config.watch), true);
    zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (content) {
        fs.writeFileSync(path.resolve(projectPath, 'release.zip'), content);
        spinner.stop();
        console.log(chalk.green('build success!'));

    });
}

module.exports = build;