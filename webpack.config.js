const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-source-map',

    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    plugins:[
        new webpack.HotModuleReplacementPlugin()
    ],
    
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 9000,
        historyApiFallback: true,
        watchOptions: {
          ignored: /node_modules/
        }
      }
};