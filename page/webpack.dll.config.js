var path = require('path');
var webpack = require('webpack');

// host可以改为ip 用于手机测试
module.exports = {
    entry: {
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    externals: {
        // 在浏览器端对应window.React
        // 'npm-react': 'React',
        // zepto后续要拆分出去
        // 'npm-zepto': 'Zepto'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        // Webpack 提供了设置环境变量来优化代码
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.DllPlugin({
            path: path.join(__dirname, 'build', '[name]-manifest.json'), //定义 manifest 文件生成的位置
            name: '[name]_library' //dll bundle 输出到那个全局变量上, 和 output.library 一样即可。
        })
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,// .js .jsx
                loader: 'babel', // 'babel-loader' is also a legal name to reference
            }
        ]
    }
};
