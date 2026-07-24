// LocalStorage Wrapper for player stats, currency, cosmetics & settings

const STORAGE_KEY = 'TICKFALL_HEIST_CLOCK_SAVE_V1';

const DEFAULT_SAVE = {
  vaultCoins: 250,
  heistChips: 0,
  stats: {
    gamesPlayed: 0,
    thiefWins: 0,
    detectiveWins: 0,
    totalSecondsPlayed: 0,
    floorsDescended: 0,
    floorsAscended: 0,
    camerasSmashed: 0,
    bombsDiffused: 0,
    highScoreThief: 0,
    highScoreDetective: 0
  },
  unlockedCosmetics: ['visor_default', 'outfit_default', 'trail_default'],
  equippedCosmetics: {
    thiefVisor: 'visor_default',
    thiefOutfit: 'outfit_default',
    detectiveVisor: 'visor_default',
    detectiveOutfit: 'outfit_default'
  },
  settings: {
    soundVolume: 0.8,
    musicVolume: 0.7,
    screenShake: true,
    particles: true,
    leftHandedMobile: false
  },
  unlockedAchievements: []
};

export class StorageManager {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_SAVE;
      return { ...DEFAULT_SAVE, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to load save data, using default:', e);
      return DEFAULT_SAVE;
    }
  }

  static save(saveObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }

  static getSettings() {
    const data = StorageManager.load();
    return data.settings;
  }

  static saveSettings(newSettings) {
    const data = StorageManager.load();
    data.settings = { ...data.settings, ...newSettings };
    StorageManager.save(data);
  }

  static addCoins(amount) {
    const data = StorageManager.load();
    data.vaultCoins = (data.vaultCoins || 0) + amount;
    StorageManager.save(data);
    return data.vaultCoins;
  }

  static recordMatchResult(winnerRole, timeTaken, chipsEarned, statsDelta = {}) {
    const data = StorageManager.load();
    data.stats.gamesPlayed++;
    if (winnerRole === 'THIEF') data.stats.thiefWins++;
    if (winnerRole === 'DETECTIVE') data.stats.detectiveWins++;
    data.stats.totalSecondsPlayed += Math.floor(timeTaken);

    // Merge stats
    for (const [key, val] of Object.entries(statsDelta)) {
      if (typeof data.stats[key] === 'number') {
        data.stats[key] += val;
      }
    }

    // Convert chips to Vault Coins 1:1 post-match
    data.vaultCoins += chipsEarned;

    StorageManager.save(data);
    return data;
  }
}
