const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Forzamos a Metro a que SOLO busque módulos en la carpeta del proyecto
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
];

// Bloqueamos la búsqueda en carpetas superiores (esto mata el leak de módulos de C:\Users\Roberto1)
config.watchFolders = [__dirname];

const { resolver } = config;

config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts, 'mp3', 'mp4', 'm4v', 'MP4', 'mov'],
};

module.exports = config;
