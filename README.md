# The Great Wave - Animated Wallpaper

An animated live wallpaper inspired by "The Great Wave off Kanagawa" by Hokusai, featuring dynamic parallax effects and real-time weather information for the [Lively Wallpaper](https://rocksdanister.github.io/lively/) app.

## Features

- Beautiful parallax scrolling ocean waves
- Real-time weather display with automatic location detection
- Automatic weather updates every hour
- Dynamic weather icons based on current conditions
- Temperature display with min/max forecasts
- Precipitation probability
- Customizable settings through Lively Wallpaper interface

## Requirements

- Windows 10 or later
- [Lively Wallpaper app](https://rocksdanister.github.io/lively/) (Free and open-source)
- Internet connection for weather data

## Installation Instructions

### Step 1: Download Lively Wallpaper

If you don't have Lively Wallpaper installed:

1. Visit [Lively Wallpaper website](https://rocksdanister.github.io/lively/)
2. Download and install the application
3. Launch Lively Wallpaper

### Step 2: Download This Wallpaper

**Option A: From GitHub (Recommended)**
1. Click the green **Code** button at the top of this repository
2. Select **Download ZIP**
3. Extract the ZIP file to a location you can easily find (e.g., `Downloads` folder)

**Option B: From Releases**
1. Go to the **Releases** section on the right side of the GitHub page
2. Download the latest release ZIP file
3. Extract it to your preferred location

### Step 3: Add to Lively Wallpaper

1. Open the **Lively Wallpaper** app
2. Click the **+** (Add Wallpaper) button in the top-left corner
3. Select **Browse** from the menu
4. Navigate to the extracted wallpaper folder
5. Select the entire folder or the `LivelyInfo.json` file
6. Lively will import and add the wallpaper to your library

### Step 4: Apply the Wallpaper

1. Find "The Great Wave" in your Lively Wallpaper library
2. Right-click on the wallpaper thumbnail
3. Select **Set as Wallpaper**
4. Choose which monitor(s) to apply it to

## Customization Options

Once the wallpaper is applied, you can customize it through the Lively Wallpaper settings:

### Accessing Settings

1. Right-click on the Lively Wallpaper system tray icon
2. Select **Settings** or **Customize**
3. Choose the wallpaper you want to customize

### Available Settings

**UI Visibility**
- Toggle the weather card display on/off
- Useful if you prefer just the animated waves

**Weather Location**
- **Automatic (Recommended)**: Detects your location automatically
  - Click "Use Current Location" to enable auto-detection
  - Location updates once per day automatically

- **Manual**: Enter specific coordinates
  - **Latitude**: Enter your location's latitude (e.g., 52.52)
  - **Longitude**: Enter your location's longitude (e.g., 13.41)
  - Find your coordinates at [LatLong.net](https://www.latlong.net/)

**Temperature Units**
- **Metric (°C)**: Celsius temperature display
- **Imperial (°F)**: Fahrenheit temperature display

**Manual Refresh**
- **Refresh Button**: Manually update weather data
- **Get Location Button**: Manually detect your current location

## How It Works

### Weather System

The wallpaper uses the Open-Meteo API (free, no API key required) to fetch weather data:

- **On First Launch**: Automatically detects your location and fetches weather
- **Subsequent Launches**: Uses cached data for instant display
- **Automatic Updates**: Weather refreshes every 60 minutes
- **Location Updates**: Your location is checked once per 24 hours (if auto-detect is enabled)
- **Offline Support**: Displays last cached weather data when offline

### Data Storage

All settings and weather data are stored locally in your browser's localStorage:
- No external database required
- No personal data sent to external servers
- Weather data cached to minimize API requests

### Browser Permissions

When you first use automatic location detection, your browser will ask for permission to access your location. Click **Allow** to enable this feature.

## Troubleshooting

### Wallpaper Doesn't Load

- Ensure you've extracted the entire folder from the ZIP file
- Make sure all files (HTML, CSS, JS, images) are present
- Try restarting Lively Wallpaper
- Check that your graphics drivers are up-to-date

### Weather Not Showing

- **"Location access denied"**: Click "Use Current Location" again and allow browser permission
- **"Weather data unavailable"**: Check your internet connection
- **Blank weather display**: Try clicking the Refresh button in settings
- **Old weather data**: Weather updates hourly; use Refresh button for immediate update

### Location Not Detected

- Make sure browser location permissions are enabled
- Try entering coordinates manually using [LatLong.net](https://www.latlong.net/)
- Some networks/VPNs may block location services

### Performance Issues

- Close other running wallpapers
- Reduce the number of monitors using the wallpaper
- Update your graphics drivers
- Consider hiding the weather UI if you only want the animation

## Weather Data Attribution

This wallpaper uses weather data from [Open-Meteo.com](https://open-meteo.com/):
- Free weather API with no API key required
- Provides accurate weather forecasts
- No registration needed

## Credits

- Original artwork inspiration: "The Great Wave off Kanagawa" by Katsushika Hokusai
- Wallpaper created by: rocksdanister
- Weather integration and optimization by: Claude
- Built for: [Lively Wallpaper](https://rocksdanister.github.io/lively/)

## License

See `license.txt` for details.

## Support & Feedback

For issues or questions:
- Check the [Lively Wallpaper Wiki](https://github.com/rocksdanister/lively/wiki)
- Visit the [Lively Wallpaper GitHub](https://github.com/rocksdanister/lively)
- Review this README for troubleshooting tips

## Additional Resources

- [How to find your coordinates](https://www.latlong.net/)
- [Lively Wallpaper documentation](https://github.com/rocksdanister/lively/wiki)
- [Open-Meteo weather API](https://open-meteo.com/)

---

Enjoy your animated Great Wave wallpaper with live weather!
