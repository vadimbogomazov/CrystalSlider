const webpack = require('webpack');

module.exports = {
  entry: './src/crystalslider.js',
  
  output: {
    path: __dirname + '/dist/',
    filename: 'crystalslider.min.js',
    library: 'CrystalSlider',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015'],
          plugins: ['babel-plugin-add-module-exports'],
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
    	sourceMap: true,
      compress: {
        warnings: false
      }
    })
  ]
};