const CONFIG_STORAGE_KEY = 'wavex_config';
const WEATHER_CACHE_KEY = 'wavex_weather_cache';
const LOCATION_PERMISSION_KEY = 'wavex_location_permission';

const ConfigManager = {
    defaultConfig: {
        latitude: 52.52,
        longitude: 13.41,
        units: "metric",
        lastLocationUpdate: null,
        lastWeatherUpdate: null,
        autoDetectLocation: true,
        locationPermissionGranted: false,
        sharedAcrossScreens: true
    },

    listeners: [],

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
            this.broadcastChange(config);
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
            this.broadcastWeatherChange(cacheData);
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
    },

    setLocationPermission(granted) {
        try {
            localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                granted: granted,
                timestamp: Date.now()
            }));
            this.update({ locationPermissionGranted: granted });
        } catch (error) {
            console.error('Error saving location permission:', error);
        }
    },

    getLocationPermission() {
        try {
            const stored = localStorage.getItem(LOCATION_PERMISSION_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return data.granted;
            }
        } catch (error) {
            console.error('Error loading location permission:', error);
        }
        return false;
    },

    broadcastChange(config) {
        window.dispatchEvent(new CustomEvent('wavex-config-changed', {
            detail: config
        }));
    },

    broadcastWeatherChange(weatherData) {
        window.dispatchEvent(new CustomEvent('wavex-weather-changed', {
            detail: weatherData
        }));
    },

    onConfigChange(callback) {
        const handler = (event) => callback(event.detail);
        window.addEventListener('wavex-config-changed', handler);
        this.listeners.push({ event: 'wavex-config-changed', handler });
        return handler;
    },

    onWeatherChange(callback) {
        const handler = (event) => callback(event.detail);
        window.addEventListener('wavex-weather-changed', handler);
        this.listeners.push({ event: 'wavex-weather-changed', handler });
        return handler;
    },

    setupStorageSync() {
        window.addEventListener('storage', (event) => {
            if (event.key === CONFIG_STORAGE_KEY && event.newValue) {
                try {
                    const newConfig = JSON.parse(event.newValue);
                    window.dispatchEvent(new CustomEvent('wavex-config-synced', {
                        detail: newConfig
                    }));
                } catch (error) {
                    console.error('Error parsing synced config:', error);
                }
            } else if (event.key === WEATHER_CACHE_KEY && event.newValue) {
                try {
                    const newWeather = JSON.parse(event.newValue);
                    window.dispatchEvent(new CustomEvent('wavex-weather-synced', {
                        detail: newWeather
                    }));
                } catch (error) {
                    console.error('Error parsing synced weather:', error);
                }
            }
        });
    },

    onConfigSync(callback) {
        const handler = (event) => callback(event.detail);
        window.addEventListener('wavex-config-synced', handler);
        this.listeners.push({ event: 'wavex-config-synced', handler });
        return handler;
    },

    onWeatherSync(callback) {
        const handler = (event) => callback(event.detail);
        window.addEventListener('wavex-weather-synced', handler);
        this.listeners.push({ event: 'wavex-weather-synced', handler });
        return handler;
    },

    cleanup() {
        this.listeners.forEach(({ event, handler }) => {
            window.removeEventListener(event, handler);
        });
        this.listeners = [];
    }
};

ConfigManager.setupStorageSync();
