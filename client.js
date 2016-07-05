// var Ascii = require('ascii');
var cli = {};

cli.version = function() {
    // var pic = new Ascii('logo.png');
    // pic.convert(function(err, result) {
    //     console.log(result);
    // });
    console.log('version 0.0.1');
}

cli.run = function(argv){
    cli.processCWD = process.cwd();

    var first = argv[2];
    if(argv.length < 3 || first === '-h' ||  first === '--help'){
        cli.help();
    } else if(first === '-v' || first === '--version'){
        cli.version();
    } else if(first[0] === '-'){
        cli.help();
    } else {
    }
};

function hasArgv(argv, search){
    var pos = argv.indexOf(search);
    var ret = false;
    while(pos > -1){
        argv.splice(pos, 1);
        pos = argv.indexOf(search);
        ret = true;
    }
    return ret;
}

module.exports = cli;
