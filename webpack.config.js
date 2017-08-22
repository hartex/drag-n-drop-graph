const helpers = require('./config/helpers');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-source-map',

    entry: {
        vendor: './src/vendor.js',
        app: './src/main.js'
    },

    output: {
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
                include: [helpers.root('src', 'styles')]
            },
        ]
    },

    plugins: [
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