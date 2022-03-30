// references:
// https://github.com/diegohaz/webpack-spawn-plugin/blob/master/src/index.js
const { spawn } = require('child_process');
const minimatch = require('minimatch');

/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").NormalModule} NormalModule */

/** @type {NodeJS.Timeout} */
let timeout;
let pid = 0;

const ElectronFilesPatterns = ['**/electron/**/*.ts', '**/index.html'];

class ElectronPlugin {
  /** @type {string[]} */
  patterns = [];

  /**
   * @param {string[]} [patterns]
   */
  constructor(patterns = ElectronFilesPatterns) {
    this.patterns = patterns;
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const callback = () => {
      if (!compiler.watchMode) return;

      const { modifiedFiles = new Set() } = compiler;

      const match = this.patterns.some(
        pattern => !!minimatch.match([...modifiedFiles], pattern, { matchBase: true }).length
      );

      if (!modifiedFiles.size || match) {
        clearTimeout(timeout);

        if (pid) {
          try {
            process.kill(pid);
            pid = 0;
          } catch (error) {
            console.error(error);
          }
        }

        timeout = setTimeout(() => {
          const childProcess = spawn('yarn', ['electron', 'dist/main.js']);
          pid = childProcess.pid;
        }, 500);
      }
    };

    compiler.hooks.done.tap('ElectronPlugin', callback);
  }
}

module.exports = { ElectronPlugin, ElectronFilesPatterns };
