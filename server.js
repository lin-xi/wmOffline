var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, 'page/build')));
app.set('views', path.join(__dirname, 'page/build'));//模板文件的目录，__dirname当前文件所在路径
app.set('view engine', 'jade');//设置渲染引擎

app.use('/', function(req, res, next) {
    res.render('index');
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.listen('8088');
