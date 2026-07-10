import Settings from '../models/Settings.js';

let settingsCache = {
  vatPercentage: 5,
  serviceFeePercentage: 10,
  assignMode: 'manual'
};

export const loadSettings = async () => {
  try {
    const settingsList = await Settings.find();
    for (const s of settingsList) {
      settingsCache[s.key] = s.value;
    }
    console.log('[Settings Cache] Loaded settings successfully:', settingsCache);
  } catch (err) {
    console.error('[Settings Cache] Failed to load settings from DB:', err.message);
  }
};

export const getSetting = (key, defaultValue) => {
  return settingsCache[key] !== undefined ? settingsCache[key] : defaultValue;
};

export const setSettingInMemory = (key, value) => {
  settingsCache[key] = value;
};
