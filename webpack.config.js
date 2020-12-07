const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'TypingTester',
    libraryTarget: 'window',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/themes', to: 'themes' },
        { from: './src/style.css', to: '' },
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'type',
      favicon: './src/assets/favicon.ico',
      template: './src/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ['file-loader'],
      },
    ],
  },
};
