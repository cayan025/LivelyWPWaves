const LocationManager = {
    isRequestingLocation: false,
    locationPromise: null,
    lockInstanceId: null,

    detectLocation() {
        if (this.locationPromise) {
            return this.locationPromise;
        }

        this.locationPromise = new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.locationPromise = null;
                reject(new Error('Geolocation not supported'));
                return;
            }

            const lockId = ConfigManager.acquireLocationRequestLock();
            if (!lockId) {
                this.locationPromise = null;
                reject(new Error('Location request already in progress'));
                return;
            }

            this.lockInstanceId = lockId;

            const options = {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 1000 * 60 * 60
            };

            this.isRequestingLocation = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.isRequestingLocation = false;
                    ConfigManager.releaseLocationRequestLock(this.lockInstanceId);
                    this.lockInstanceId = null;

                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                    };
                    ConfigManager.setLocationPermission(true);
                    this.locationPromise = null;
                    resolve(location);
                },
                (error) => {
                    this.isRequestingLocation = false;
                    ConfigManager.releaseLocationRequestLock(this.lockInstanceId);
                    this.lockInstanceId = null;
                    this.locationPromise = null;

                    const errorMessages = {
                        1: 'Location access denied',
                        2: 'Location unavailable',
                        3: 'Location request timeout'
                    };

                    if (error.code === 1) {
                        ConfigManager.setLocationPermission(false);
                    }

                    reject(new Error(errorMessages[error.code] || 'Location error'));
                },
                options
            );
        });

        return this.locationPromise;
    },

    async updateLocationIfNeeded(config) {
        if (!config.sharedAcrossScreens) {
            return config;
        }

        const hasPermission = ConfigManager.getLocationPermission();

        if (hasPermission && config.latitude && config.longitude) {
            const ONE_DAY = 24 * 60 * 60 * 1000;
            const lastUpdate = config.lastLocationUpdate;

            if (lastUpdate && (Date.now() - lastUpdate) < ONE_DAY) {
                return config;
            }
        }

        if (!config.autoDetectLocation) {
            return config;
        }

        if (this.isRequestingLocation) {
            return config;
        }

        if (ConfigManager.isLocationRequestInProgress()) {
            console.log('Another instance is requesting location, waiting...');
            return await this.waitForLocationFromAnotherInstance(config);
        }

        try {
            const location = await this.detectLocation();
            const updatedConfig = ConfigManager.update({
                latitude: location.latitude,
                longitude: location.longitude,
                lastLocationUpdate: location.timestamp,
                locationPermissionGranted: true
            });

            return updatedConfig;
        } catch (error) {
            console.error('Location detection failed:', error.message);

            if (error.message === 'Location request already in progress') {
                return await this.waitForLocationFromAnotherInstance(config);
            }

            if (error.message === 'Location access denied') {
                const storedConfig = ConfigManager.load();
                if (storedConfig.latitude && storedConfig.longitude) {
                    return storedConfig;
                }
            }

            return config;
        }
    },

    async waitForLocationFromAnotherInstance(config, maxWaitTime = 15000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = 500;

            const syncHandler = (newConfig) => {
                if (newConfig.latitude && newConfig.longitude && newConfig.lastLocationUpdate) {
                    clearInterval(intervalId);
                    ConfigManager.cleanup();
                    resolve(newConfig);
                }
            };

            ConfigManager.onConfigSync(syncHandler);

            const intervalId = setInterval(() => {
                const currentConfig = ConfigManager.load();
                const elapsed = Date.now() - startTime;

                if (currentConfig.latitude && currentConfig.longitude && currentConfig.lastLocationUpdate) {
                    clearInterval(intervalId);
                    ConfigManager.cleanup();
                    resolve(currentConfig);
                } else if (elapsed >= maxWaitTime) {
                    clearInterval(intervalId);
                    ConfigManager.cleanup();
                    resolve(config);
                } else if (!ConfigManager.isLocationRequestInProgress()) {
                    clearInterval(intervalId);
                    ConfigManager.cleanup();
                    resolve(config);
                }
            }, checkInterval);
        });
    },

    async requestLocationUpdate() {
        if (this.isRequestingLocation) {
            return {
                success: false,
                error: 'Location request already in progress'
            };
        }

        try {
            const location = await this.detectLocation();

            const updatedConfig = ConfigManager.update({
                latitude: location.latitude,
                longitude: location.longitude,
                lastLocationUpdate: location.timestamp,
                autoDetectLocation: true,
                locationPermissionGranted: true
            });

            return {
                success: true,
                location: location,
                config: updatedConfig
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    useFallbackLocation() {
        const config = ConfigManager.load();
        if (config.latitude && config.longitude && config.lastLocationUpdate) {
            return config;
        }
        return null;
    }
};
