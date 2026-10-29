// Dynamic config: the unlocked edition gets its own name and package id so both install side by side.
const unlocked = process.env.APP_VARIANT === 'unlocked';

module.exports = ({ config }) => ({
  ...config,
  name: unlocked ? `${config.name} (Unlocked)` : config.name,
  ios: { ...config.ios, bundleIdentifier: unlocked ? 'com.janisuchin.arabicjourney.unlocked' : 'com.janisuchin.arabicjourney' },
  android: { ...config.android, package: unlocked ? 'com.janisuchin.arabicjourney.unlocked' : 'com.janisuchin.arabicjourney' },
});
