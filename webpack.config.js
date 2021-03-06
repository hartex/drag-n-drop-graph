const helpers = require('./config/helpers');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-source-map',

    entry: {
        vendor: './src/vendor.js',
        app: './src/main.js'
    },

    output: {
        publicPath: '/',
        filename: '[name].js',
        path: helpers.root('dist')
    },

    resolve: {
        extensions: ['.js', '.css', '.html'],
        modules: [helpers.root('src'), helpers.root('node_modules')]
    },

    module: {
        rules: [
            {
                test: /\.css/,
                use: ['style-loader', 'css-loader'],
                include: [helpers.root('src')]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: 'file-loader'
            }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([{from: 'assets', to: 'assets'}]),

        new webpack.HotModuleReplacementPlugin(),
        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {}
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor']
        }),
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ],

    devServer: {
        contentBase: helpers.root('dist'),
        port: 9000,
        historyApiFallback: true,
        watchOptions: {
            ignored: /node_modules/
        }
    }
};