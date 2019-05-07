const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
    plugins: [
        new HtmlWebPackPlugin({
            template: "src/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    module: {
        rules: [{
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        minimize: true
                    }
                }]
            },
            {
                test: /\.(png|jpe?g|svg)/i,
                use: [{
                        loader: "url-loader",
                        options: {
                            name: "./img/[hash].[ext]",
                            limit: 10000
                        }
                    },
                    {
                        loader: "img-loader"
                    }
                ]
            },
            {
                test: /\.(mp4|mp3|js)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: './assets/[name].[ext]',
                        limit: 10000
                    },
                }],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                    "sass-loader"
                ]
            }
        ]
    }
};