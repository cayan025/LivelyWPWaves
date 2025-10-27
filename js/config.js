const CONFIG_STORAGE_KEY = 'wavex_config';
const WEATHER_CACHE_KEY = 'wavex_weather_cache';

const ConfigManager = {
    defaultConfig: {
        latitude: 52.52,
        longitude: 13.41,
        units: "metric",
        lastLocationUpdate: null,
        lastWeatherUpdate: null,
        autoDetectLocation: true
    },

    load() {
        try {
            const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (stored) {
                const config = JSON.parse(stored);
                return { ...this.defaultConfig, ...config };
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
        return { ...this.defaultConfig };
    },

    save(config) {
        try {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    },

    update(updates) {
        const current = this.load();
        const updated = { ...current, ...updates };
        return this.save(updated) ? updated : current;
    },

    loadWeatherCache() {
        try {
            const cached = localStorage.getItem(WEATHER_CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            console.error('Error loading weather cache:', error);
        }
        return null;
    },

    saveWeatherCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error('Error saving weather cache:', error);
            return false;
        }
    },

    isWeatherCacheValid() {
        const cache = this.loadWeatherCache();
        if (!cache || !cache.timestamp) return false;

        const ONE_HOUR = 60 * 60 * 1000;
        const age = Date.now() - cache.timestamp;
        return age < ONE_HOUR;
    },

    clearWeatherCache() {
        try {
            localStorage.removeItem(WEATHER_CACHE_KEY);
        } catch (error) {
            console.error('Error clearing weather cache:', error);
        }
    }
};
