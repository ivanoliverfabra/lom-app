/* eslint-disable import/order */
import path from 'path';

import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { productName } from './package.json';

const rootDir = process.cwd();

const config: ForgeConfig = {
  packagerConfig: {
    // Create asar archive for main, renderer process files
    asar: true,
    // Set executable name
    executableName: 'LegendOfMushroom',
    // Set application copyright
    appCopyright: 'Copyright (C) 2024 Fabra',
    // Set application icon
    icon: path.resolve(rootDir, 'assets/icons/icon'),
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: productName,
      iconUrl: 'https://utfs.io/f/6lmjelcPneS1Zq5Ndc9Gij5UzbakgYZQwhqN32oGcr7D4XmP',
      setupIcon: 'assets/icons/icon.ico',
    }),
    new MakerDMG(
      {
        name: productName,
        icon: 'assets/icons/icon.icns',
        format: 'ULFO',
        contents: [
          {
            x: 192,
            y: 240,
            type: 'file',
            path: `${process.cwd()}/out/${productName}-darwin-x64/${productName}.app`,
          },
          { x: 466, y: 240, type: 'link', path: '/Applications' },
        ],
      },
      ['darwin'],
    ),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'config/vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'config/vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'config/vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
