'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './dist/main.js',
  output: {
    filename: './dist/calendar.js'
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
  }
};