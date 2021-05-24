/*
 * @Descripttion: 
 * @Date: 2021-03-15 21:09:24
 * @LastEditTime: 2021-04-27 22:11:47
 * @LastEditors: kiki
 * @Author: Kiki
 */
const {
    merge
} = require('webpack-merge');
const common = require('./webpack.config.js');
const path = require('path');
const config = require('./src/utils/config')
module.exports = merge(common, {
    mode: 'development', // 设置mode
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        disableHostCheck: true,
        hot: true, // 热更新
        contentBase: [path.join(__dirname, '../static')], // 静态资源
        proxy: {
            '/api': {
                target: config.baseInfo.domain,
                pathRewrite: {'^/api' : ''},
                changeOrigin: true,     // target是域名的话，需要这个参数，
                secure: false,   
            }
        },
    },
});