/*
 * @Descripttion: 
 * @Date: 2021-03-15 21:09:24
 * @LastEditTime: 2021-04-29 15:37:11
 * @LastEditors: kiki
 * @Author: Kiki
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version} = require("./static/version.json");
const HappyPack = require('happypack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {   CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack')
const CopyPlugin = require("copy-webpack-plugin");
var srcDir = path.resolve(process.cwd(), "src"); // 路径定义
var glob = require("glob")
//入口文件定义
var entries = function () {
    var entryFiles = glob.sync(srcDir + "/js/*.{js,jsx,ts}");
    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(
            filePath.lastIndexOf("/") + 1,
            filePath.lastIndexOf(".")
        );
        map[filename] = filePath;
    }
    return map;
};
let htmlWebpackPluginBase = {}; //html_webpack_plugins插件公共部分
if (process.env.NODE_ENV !== "development") {
    htmlWebpackPluginBase = {
        //部分省略，具体看minify的配置
        minify: {
            //是否对大小写敏感，默认false
            caseSensitive: true,
            //是否简写boolean格式的属性如：disabled="disabled" 简写为disabled  默认false
            collapseBooleanAttributes: true,
            //是否去除空格，默认false
            collapseWhitespace: true,
            //是否压缩html里的css（使用clean-css进行的压缩） 默认值false；
            minifyCSS: true,
            //是否压缩html里的js（使用uglify-js进行的压缩）
            minifyJS: true,
            removeAttributeQuotes: true,
            //是否移除注释 默认false
            removeComments: true,
            //从脚本和样式删除的注释 默认false
            removeCommentsFromCDATA: true,
        },
    };
}
let html_plugins = function () {
    var entryHtml = glob.sync(srcDir + "/page/*.{ejs,html}");
    var r = [];
    var entriesFiles = entries();
    for (var i = 0; i < entryHtml.length; i++) {
        var filePath = entryHtml[i];
        var filename = filePath.substring(
            filePath.lastIndexOf("/") + 1,
            filePath.lastIndexOf(".")
        );
        var conf = {
            template: filePath,
            // home页应该在根路径 index.html
            filename: filename + ".html?v=" + version,
            ...htmlWebpackPluginBase,
        }
        conf.chunks = [];
        //如果和入口js文件同名
        if (filename in entriesFiles) { //chunks:["入口文件名"]设置
            conf.chunks = [filename];
        }
        //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
        //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
        r.push(new HtmlWebpackPlugin(conf));
    }
    return r;
}
// html_plugins()
module.exports = {
    entry: entries(),
    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './dist'),
        publicPath: ''
    },
    //警告 webpack 的性能提示
    performance: {
        hints: 'warning',
        //入口起点的最大体积
        maxEntrypointSize: 50000000,
        //生成文件的最大体积
        maxAssetSize: 30000000,
        //只给出 js 文件的性能提示
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith('.js');
        }
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: ['ts-loader']
        },
        {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, /* "style-loader", */ "css-loader"], // 从右向左解析原则
            // include: [path.resolve(__dirname, "src/asset"),path.resolve(__dirname, "src/asset/css")], // 匹配哪些目录
            exclude: /node_modules/,
        },
        {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader, // 外链式
                "style-loader", // 内嵌式
                "css-loader",
                "postcss-loader",
                "sass-loader",
            ], // 从右向左解析原则
            // include: [path.resolve(__dirname, "src/asset"),path.resolve(__dirname, "src/asset/scss")],
            exclude: /node_modules/,
        },
        {
            test: /\.(jpe?g|png|gif|ogg|mp3)$/,
            use: ['url-loader'],
        },
        {
            test: /\.html$/,
            loader: 'html-loader'
        },
        {
            test: /\.js$/,
            use: ["happypack/loader?id=babel"],
            include: [path.resolve(__dirname, "src/js")],
            exclude: /node_modules/,
        },
        {
            test: /\.json$/,
            loader: 'json-loader'
        }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify('1.0.0'),
            // platform: JSON.stringify(process.env.environment),
        }),
        ...html_plugins(), // 注意引入时的顺序
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [{
                from: './src/assets/',
                to: './assets'
            }],
        }),
        /****   使用HappyPack实例化    *****/
        new HappyPack({
            // 用唯一的标识符id来代表当前的HappyPack 处理一类特定的文件
            id: "babel",
            // 如何处理.js文件，用法和Loader配置是一样的
            loaders: ["babel-loader?cacheDirectory=true"],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new webpack.ProvidePlugin({
            $: "jQuery"
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            jQuery: path.resolve(__dirname, 'static/jquery.min.js')
        },
        extensions: ["*", ".js", ".json", ".ts"], // webpack会根据extensions定义的后缀查找文件(频率较高的文件类型优先写在前面)
    },
};
