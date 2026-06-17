// Metro configurado para monorepo pnpm + NativeWind.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Permite resolver paquetes del workspace (packages/*). En SDK 55 basta con
// observar la raíz del monorepo y añadir su node_modules a la búsqueda; el
// resolver por defecto ya maneja los symlinks de pnpm (sin disableHierarchicalLookup).
config.watchFolders = [...config.watchFolders, workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
