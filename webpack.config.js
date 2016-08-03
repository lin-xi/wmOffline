var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var host = "localhost";
var port = "8088";

// host可以改为ip 用于手机测试
module.exports = {
    host: host,
    port: port,
    resolve: {
        root: path.resolve('./page/src'),
        extensions: ['', '.js', '.jsx']
    },
    entry: {
        main: [
            'webpack-dev-server/client?http://' + host + ':' + port,
            'webpack/hot/only-dev-server',
            "./page/src/main",
        ],
    },
    devtool: 'cheap-source-map', //https://github.com/webpack/docs/wiki/configuration#devtool
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        chunkFilename: "[id].chunk.js",
        publicPath: '', //网站运行时的访问路径
    },
    plugins: [
        // 热替换 防止报错插件
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'page/src/index.html'),
            chunks: ['main'],
            inject: true
        })
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,// .js .jsx
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                include: [
                    // 只去解析运行目录下的 src文件夹
                    path.join(process.cwd(), 'page/src'),
                ],
            },
            {
                test: /\.css$/,
                // loader: ExtractTextPlugin.extract("style-loader", "css-loader")
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.less$/,
                // loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
                loader: 'url-loader?limit=2048&name=images/[hash:8].[name].[ext]'
            }
        ]
    }
};
