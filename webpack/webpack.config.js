// @ts-check
const fs = require('fs/promises');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { merge } = require('webpack-merge');
const { resolveTsconfigPaths } = require('./resolveTsconfigPaths');
const { ElectronPlugin } = require('./ElectronPlugin');

/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {import('webpack').WebpackOptionsNormalized} WebpackOptionsNormalized
 * @typedef {Partial<Configuration> & Pick<Partial<WebpackOptionsNormalized>, 'devServer'>} Config
 */

const outDir = 'dist';

/**
 * @param {Record<string, any>} env
 * @param {Record<string, any>} argv
 */
module.exports = async (env, argv) => {
  /** @type {Config} */
  const main = {
    entry: './electron/main.ts',
    target: 'electron-main',
    output: {
      filename: 'main.js'
    }
  };

  /** @type {Config} */
  const preload = {
    entry: './electron/preload.ts',
    target: 'electron-preload',
    output: {
      filename: 'preload.js'
    }
  };

  /** @type {Config} */
  const renderer = {
    entry: './src/index.ts',
    target: 'electron-renderer',
    output: {
      filename: 'renderer.[contenthash].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Electron',
        template: path.join(__dirname, '..', 'index.html')
      })
    ],
    devServer: env.WEBPACK_SERVE && {
      devMiddleware: {
        writeToDisk: true
      },
      open: false,
      hot: process.env.DEV_SERVER_HMR !== 'false',
      port: process.env.DEV_SERVER_PORT ? Number(process.env.DEV_SERVER_PORT) : 8080
    }
  };

  /** @type {Config} */
  const common = {
    mode: argv.mode,
    module: {
      rules: [
        {
          test: /\.tsx?$|\.jsx?$/,
          loader: 'ts-loader',
          include: path.join(__dirname, '../'),
          exclude: /node_modules/,
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        ...resolveTsconfigPaths({
          tsConfig: require('../tsconfig.json')
        })
      }
    },
    plugins: [new ForkTsCheckerWebpackPlugin(), new ElectronPlugin()]
  };

  if (argv.mode === 'production') {
    await fs.rm(outDir, { force: true, recursive: true });
  }

  return [main, preload, renderer].map(config => merge(common, config));
};
