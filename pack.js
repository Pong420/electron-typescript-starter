// @ts-check
const builder = require('electron-builder');

const license = 'LICENSE';
const productName = 'Electron App';

/**
 * @type {builder.Configuration}
 */
const config = {
  productName: productName,
  appId: productName,
  directories: {
    buildResources: 'public',
    output: 'release'
  },
  files: ['dist/**/*', 'package.json'],
  mac: {
    target: ['dmg', 'pkg', 'zip'],
    darkModeSupport: true,
    icon: 'public/icon/icon.png',
    type: 'distribution'
  },
  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ]
  },
  pkg: {
    license
  },
  win: {
    target: ['nsis', 'portable', 'zip'],
    icon: 'public/icon/icon.ico'
  },
  nsis: {
    installerIcon: 'public/icon/icon.ico',
    license,
    warningsAsErrors: false
  },
  linux: {
    target: ['AppImage', 'deb', 'snap'],
    icon: './public/icon/512x512.png',
    desktop: {
      Type: 'Application',
      Encoding: 'UTF-8',
      Name: productName,
      Terminal: 'false'
    }
  },
  snap: {
    grade: 'stable'
  }
};

builder
  .build({
    config
  })
  .catch(error => {
    console.error(error);
  });
