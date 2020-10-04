const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    library: "TypingTester",
    libraryTarget: "window",
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
