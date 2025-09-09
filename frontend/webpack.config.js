const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true, // сжатие
        port: 9022,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: "./index.html"
    }),
        new CopyPlugin({
            patterns: [
                { from: "./src/templates", to: "templates" },
                { from: "./src/static/images", to: "images"},
                { from: "./src/styles", to: "styles"},
                { from: "./src/static/fonts", to: "static/fonts"},
                { from: "./node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css" },
                { from: "./node_modules/bootstrap/dist/js/bootstrap.min.js", to: "js" },
                { from: "./node_modules/@popperjs/core/dist/umd/popper.min.js", to: "js" }, // для модального окна, для bootstrap
                { from: "./node_modules/chart.js/dist/chart.umd.min.js", to: "js" }, // круги на главной странице
                { from: "./node_modules/flatpickr/dist/flatpickr.min.css", to: "css" }, // JS-библиотека для работы с полями выбора даты и времени
                { from: "./node_modules/flatpickr/dist/flatpickr.min.js", to: "js" }, // JS-библиотека для работы с полями выбора даты и времени
            ],
        }),
    ],

};

