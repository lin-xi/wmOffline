/* eslint-disable no-var */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

var md5 = new Date() * 1;
var svgoConfig = JSON.stringify({
    plugins: [
        {removeTitle: true},
        {convertColors: {shorthex: false}},
        {convertPathData: false}
    ]
});

module.exports = {
    entry: {
        main: "./src/main"
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name]_'+md5+'.js',
        chunkFilename: "[id].chunk_" + md5 +".js",
        publicPath: '' //网站运行时的访问路径
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./build/vendor-manifest.json')
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        // Webpack 提供了设置环境变量来优化代码
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        // new WebpackMd5Hash(),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: "common",
        //     minChunks: 2
        // }, ["main", "vendor"]),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'src/index.html'),
            inject: true
        }),
        new HtmlWebpackPlugin({
            filename: 'error.jade',
            template: path.join(__dirname, 'src/error.jade'),
            inject: false
        }),
        new AddAssetHtmlPlugin({
            filepath: require.resolve('./build/vendor.dll.js'),
            includeSourcemap: false
        }),
        new ExtractTextPlugin("[id].css", {allChunks: false})
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,// .js .jsx
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(
                    'css-loader!less-loader',
                    {publicPath: ''}
                )
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=2048&name=images/[name].[hash:8].[ext]'    // 内联 base64 URLs, 限定 <=8k 的图片, 其他的用 URL
            },
            {
                test: /.*\.svg$/,
                loaders: ['file-loader', 'svgo-loader?' + svgoConfig, 'url-loader?limit=2048&name=images/[name].[hash:8].[ext]' ]
            }
        ]
    }
};
