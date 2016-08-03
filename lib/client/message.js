var md5 = require('md5');

function Message(){
    this.group = '';
    this.type = '';
    this.content = '';
    this.from = '';
}

module.exports = Message;
