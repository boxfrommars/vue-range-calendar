'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'calendar.js'
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },

  // example: if you wish to apply custom babel options
  // instead of using vue-loader's default:
  babel: {
    presets: [],
    plugins: []
  },
};