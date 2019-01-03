const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: {
        'main': [
            '@babel/polyfill',
            './assets/js/main.js',
            // './style/index.scss'
        ],
        'passwordRecovery': [
            './assets/js/passwordRecovery.js'
        ]
    },

    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                options: {
                    presets: ['@babel/env']
                }
            },
            {
                test: /\.(scss|css)$/,

                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            }
        ]
    },

    plugins: [
        new UglifyJSPlugin(),
        new ExtractTextPlugin('style/[name].css'),
    ]
};