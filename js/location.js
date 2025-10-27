const LocationManager = {
    detectLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            const options = {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 1000 * 60 * 60
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                    };
                    resolve(location);
                },
                (error) => {
                    const errorMessages = {
                        1: 'Location access denied',
                        2: 'Location unavailable',
                        3: 'Location request timeout'
                    };
                    reject(new Error(errorMessages[error.code] || 'Location error'));
                },
                options
            );
        });
    },

    async updateLocationIfNeeded(config) {
        if (!config.autoDetectLocation) {
            return config;
        }

        const ONE_DAY = 24 * 60 * 60 * 1000;
        const lastUpdate = config.lastLocationUpdate;

        if (lastUpdate && (Date.now() - lastUpdate) < ONE_DAY) {
            return config;
        }

        try {
            const location = await this.detectLocation();
            const updatedConfig = ConfigManager.update({
                latitude: location.latitude,
                longitude: location.longitude,
                lastLocationUpdate: location.timestamp
            });

            return updatedConfig;
        } catch (error) {
            console.error('Location detection failed:', error.message);
            return config;
        }
    },

    async requestLocationUpdate() {
        try {
            const location = await this.detectLocation();

            const updatedConfig = ConfigManager.update({
                latitude: location.latitude,
                longitude: location.longitude,
                lastLocationUpdate: location.timestamp,
                autoDetectLocation: true
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
    }
};
