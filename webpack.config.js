const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
const pixi = path.join(phaserModule, 'build/custom/pixi.js')
const p2 = path.join(phaserModule, 'build/custom/p2.js')

module.exports = {
    entry: path.join(__dirname, 'src/app.ts'),
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            { test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader' },
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' }
        ],
    },
    plugins: [new HtmlWebpackPlugin({
        hash: true,
        title: 'the [prince] mission',
        template: './src/index.html',
        filename: './index.html'
    })],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
            assets: path.join(__dirname, 'assets/')
        }
    }
};
