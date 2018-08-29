const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const server = {
    entry: "./src/server/index.ts",

    output: {
        filename: "index.js",
        path: __dirname + "/dist/server"
    },

    resolve: {
        extensions: [".ts", ".js"],
        plugins: [new TsconfigPathsPlugin({
            configFile: "./src/server/tsconfig.json"
        })]
    },

    target: "node",

    node: { __dirname: false },

    externals: [nodeExternals()],

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: './src/server/tsconfig.json'
                }
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(["./dist"]),
        new CopyWebpackPlugin([
            {
                from: "./package.json",
                to: "..",
                transform: (content, path) => {
                    var packageJson = JSON.parse(content.toString());
                    packageJson.scripts.start = "node server/index.js";
                    delete packageJson.devDependencies;
                    delete packageJson.jest;
                    return new Buffer(JSON.stringify(packageJson));
                }
            },
            {
                from: "./yarn.lock",
                to: ".."
            }
        ])
    ]
};

const client = {
    entry: "./src/public/app.tsx",
    output: {
        filename: "app.[chunkhash].js",
        path: __dirname + "/dist/public"
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        plugins: [new TsconfigPathsPlugin({
            configFile: "./src/public/tsconfig.json"
        })]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: './src/public/tsconfig.json'
                }
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.[contenthash].css"
        }),
        new HtmlWebpackPlugin({
            template: "./src/public/index.html",
            inject: "body"
        }),
        new CopyWebpackPlugin([
            {
                from: "./src/public/assets",
                to: "assets"
            },
            { from: "./src/public/manifest.json" },
            { from: "./src/public/favicon.ico" }
        ])
    ]

    // // When importing a module whose path matches one of the following, just
    // // assume a corresponding global variable exists and use that instead.
    // // This is important because it allows us to avoid bundling all of our
    // // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // }
};

const common = { server, client };
module.exports = common;
