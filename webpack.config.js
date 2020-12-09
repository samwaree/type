const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
  return {
    entry: './src/index.js',
    output: {
      library: 'TypingTester',
      libraryTarget: 'window',
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    watch: env === 'dev' ? true : false,
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: './src/themes', to: 'themes' },
          { from: './src/style.css', to: '' },
          {
            from: env === 'dev' ? './src/init.dev.js' : './src/init.js',
            to: 'init.js',
          },
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
};
