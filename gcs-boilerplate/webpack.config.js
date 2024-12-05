import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import TerserPlugin from "terser-webpack-plugin";

const entry = Object.fromEntries([
  ...glob
    .sync("./src/views/*.{jsx,tsx}")
    .map((file) => [path.basename(file).split(".")[0], `./${file}`]),
  ...glob
    .sync("./src/views/*/index.{jsx,tsx}")
    .map((file) => [path.basename(path.dirname(file)), `./${file}`]),
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(?:jsx?|tsx?)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  // ビューで使用できるライブラリはバンドルしない
  externals: {
    "@basemachina/view": "@basemachina/view",
    react: "react",
    dayjs: "dayjs",
    "@chakra-ui/react": "@chakra-ui/react",
    "@chakra-ui/react@2": "@chakra-ui/react@2",
    "react-chartjs-2": "react-chartjs-2",
    "react-chartjs-2@5": "react-chartjs-2@5",
  },
  mode: "production",
};
