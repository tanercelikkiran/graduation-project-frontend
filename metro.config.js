const path = require("path");
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// react-native-svg-transformer ekleme
config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    unstable_allowRequireContext: true, // Metro hata vermesin diye
};

// SVG desteği ekleme
config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...config.resolver.sourceExts, "svg"],
};

// Missing asset registry hatasını düzeltme
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "missing-asset-registry-path": path.resolve(
        __dirname,
        "node_modules/react-native/Libraries/Image/AssetRegistry"
    ),
};

module.exports = config;
