const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    library: "TypingTester",
    libraryTarget: "window",
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  watch: true,
  plugins: [
    new HtmlWebpackPlugin({
      title: "Type",
      favicon: "./src/assets/favicon.ico",
      template: "./src/index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ["file-loader"],
      },
    ],
  },
};
