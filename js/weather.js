let latitude = 52.52; // latitude coordinate
let longitude = 13.41; // longitude coordinate  
let units = "metric"; //metric or imperial (celsius/fahrenheit)

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var mmddyy=true;

setInterval(time, 1000);
time();

function time(){

  let time = new Date();	
  if(mmddyy)
    document.getElementById('date').innerText = new Intl.DateTimeFormat('en-US',{'month':'short','day':'2-digit','year':'2-digit'}).format(time).replace(',','').replace(/ /g,'/');
  else
    document.getElementById('date').innerText = new Intl.DateTimeFormat('en-GB',{'day':'2-digit','month':'2-digit','year':'2-digit'}).format(time).replace(',','').replace(/ /g,'/');

    var Hour = time.getHours() % 12 ? time.getHours() % 12 : 12;
    Hour = Hour == 0 ? 12         : Hour;
    Hour = Hour < 10 ? "0" + Hour : Hour;
    var Minute = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    var Meridiem = time.getHours() < 12 ? "AM" : "PM";
    //Meridiem = Meridiem.fontsize(2);
    var clock = document.getElementById("time");
	var timeText = Hour + ":" + Minute + " " + '<span style="font-size:80%">' + Meridiem + '</span>';
	clock.innerHTML = timeText;
}


function getWeather(){
  if(latitude === "" || longitude === "" || units === ""){
	document.getElementById('summaryVal').innerHTML= 'Enter coordinates';
    return;
  }

  // Open Meteo API endpoint - no API key required
  var temperatureUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
  var openMeteoURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=${temperatureUnit}&timezone=auto`;

  fetch(openMeteoURL)
	.then(response => {
		if(response.status !== 200){
			document.getElementById('summaryVal').innerHTML= 'Error '+ response.status;
			return Promise.reject();
		}
		return response.json();
	})
	.then(data => {
		showCurrentWeatherFromOpenMeteo(data);
		showTodayForecastFromOpenMeteo(data);
	})
	.catch((error)=>{
		console.error('Open Meteo API Error:', error);
		document.getElementById('summaryVal').innerHTML= 'Weather data unavailable';
		document.getElementById('minMaxVal').innerHTML = '-- / --';
		document.getElementById('precipVal').innerHTML = '--%';
	})
}

function showCurrentWeatherFromOpenMeteo(data){
	var unitSymbol = units === 'imperial' ? 'F' : 'C';
    document.getElementById('currentTempVal').innerHTML= leadingZero(Math.round(data.current_weather.temperature)) + "\u00B0" + unitSymbol;
	
	// Open Meteo provides weather code, convert to description
	var weatherDescription = getWeatherDescription(data.current_weather.weathercode);
	document.getElementById('summaryVal').innerHTML= weatherDescription;
	
	// Render weather icon based on weather code
	renderConditionIconFromCode(data.current_weather.weathercode);
}

function showTodayForecastFromOpenMeteo(data){
	try{
		// Open Meteo provides daily data with accurate min/max temperatures
		var dailyData = data.daily;
		var unitSymbol = units === 'imperial' ? 'F' : 'C';
		
		if(dailyData && dailyData.temperature_2m_min && dailyData.temperature_2m_max){
			var todayMin = Math.round(dailyData.temperature_2m_min[0]);
			var todayMax = Math.round(dailyData.temperature_2m_max[0]);
			
			document.getElementById('minMaxVal').innerHTML = leadingZero(todayMin) + "\u00B0" + unitSymbol + ' / ' + leadingZero(todayMax) + "\u00B0" + unitSymbol;
		} else {
			document.getElementById('minMaxVal').innerHTML = '-- / --';
		}

		// Handle precipitation data
		var precipPercent = 0;
		if(dailyData && dailyData.precipitation_probability_max){
			precipPercent = Math.round(dailyData.precipitation_probability_max[0]);
		}
		
		document.getElementById('precipVal').innerHTML = precipPercent + '%';
	}
	catch(e){
		console.error('Open Meteo forecast parsing error:', e);
		// fallback UI if parsing fails
        document.getElementById('minMaxVal').innerHTML = '-- / --';
		document.getElementById('precipVal').innerHTML = '--%';
	}
}

function getWeatherDescription(weatherCode){
	// Open Meteo weather codes (WMO Weather interpretation codes)
	const weatherDescriptions = {
		0: "Clear sky",
		1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
		45: "Foggy", 48: "Depositing rime fog",
		51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
		56: "Light freezing drizzle", 57: "Dense freezing drizzle",
		61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
		66: "Light freezing rain", 67: "Heavy freezing rain",
		71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
		77: "Snow grains",
		80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
		85: "Slight snow showers", 86: "Heavy snow showers",
		95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
	};
	return weatherDescriptions[weatherCode] || "Unknown";
}

function renderConditionIconFromCode(weatherCode){
	var container = document.getElementById('conditionIcon');
	if(!container){ return; }
	
	var main = getWeatherMainFromCode(weatherCode);
	var isNight = false; // Open Meteo doesn't provide day/night info in current weather
	container.innerHTML = conditionToSVG(main, isNight);
}

function getWeatherMainFromCode(weatherCode){
	// Convert Open Meteo weather codes to main weather categories
	if(weatherCode === 0 || weatherCode === 1) return "clear";
	if(weatherCode === 2 || weatherCode === 3) return "cloud";
	if(weatherCode >= 45 && weatherCode <= 48) return "mist";
	if(weatherCode >= 51 && weatherCode <= 67) return "rain";
	if(weatherCode >= 71 && weatherCode <= 77) return "snow";
	if(weatherCode >= 80 && weatherCode <= 86) return "rain";
	if(weatherCode >= 95 && weatherCode <= 99) return "thunder";
	return "cloud"; // default
}

function formatLocalHourMinute(utcMs, tzOffsetSec){
	var d = new Date(utcMs + tzOffsetSec*1000);
	// Use 12-hour format to match existing clock styling
	var hours = d.getUTCHours();
	var minutes = d.getUTCMinutes();
	var meridiem = hours < 12 ? 'AM' : 'PM';
	hours = hours % 12;
	hours = hours ? hours : 12; // 0 -> 12
	var mm = minutes < 10 ? ('0'+minutes) : minutes;
	return hours + ':' + mm + ' ' + meridiem;
}

function renderConditionIcon(weatherObj){
	var container = document.getElementById('conditionIcon');
	if(!container){ return; }
	if(!weatherObj){ container.innerHTML = ''; return; }
	var main = (weatherObj.main || '').toLowerCase();
	var icon = (weatherObj.icon || '').toLowerCase();
	var isNight = icon.startsWith('n');
	container.innerHTML = conditionToSVG(main, isNight);
}

function conditionToSVG(main, isNight){
	// 27x27 to match other icons
	if(main.indexOf('clear')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
	}
	if(main.indexOf('cloud')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.5 1"/><path d="M5 20h12"/></svg>';
	}
	if(main.indexOf('rain')!==-1 || main.indexOf('drizzle')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.5 1"/><path d="M5 20h12"/><path d="M8 22l1-2M12 22l1-2M16 22l1-2"/></svg>';
	}
	if(main.indexOf('thunder')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.5 1"/><path d="M5 20h12"/><path d="M13 11l-2 5h3l-2 5"/></svg>';
	}
	if(main.indexOf('snow')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4 6l16 12M4 18L20 6"/></svg>';
	}
	if(main.indexOf('mist')!==-1 || main.indexOf('fog')!==-1 || main.indexOf('haze')!==-1 || main.indexOf('smoke')!==-1){
		return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M2 16h20M4 20h16"/></svg>';
	}
	// default cloud
	return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.5 1"/><path d="M5 20h12"/></svg>';
}


function leadingZero(val){
	if(val<10 && val>=0)
	{
		return '0'+val;
	}
  else if(val>-10 && val<=0){
    return '-0'+Math.abs(val);
  }
	else{
		return val;
	}
}

function getFormatedTime(){
	let d = new Date();
	if(_12hour)
        return new Intl.DateTimeFormat('en-US',{'hour':'2-digit','minute':'2-digit','hour12':true}).format(d);

    return new Intl.DateTimeFormat('en-US',{'hour':'2-digit','minute':'2-digit','hour12':false}).format(d);
}

//updates the weather each hour
setInterval(getWeather, 1*60*60*1000);

function getCurrentLocation(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function(position) {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				// Update the UI with new coordinates
				document.getElementById('summaryVal').innerHTML = 'Location updated';
				getWeather();
			},
			function(error) {
				console.error('Error getting location:', error);
				document.getElementById('summaryVal').innerHTML = 'Location access denied';
			}
		);
	} else {
		document.getElementById('summaryVal').innerHTML = 'Geolocation not supported';
	}
}

//Lively ipc: https://github.com/rocksdanister/lively/wiki/Web-Guide-IV-:-Interaction
function livelyPropertyListener(name, val)
{
  switch(name) {
  	case "uiCheck":
	  if(val)
	  {
		document.getElementById('card').style.visibility = "visible";
	  }
	  else
	  {
	  	document.getElementById('card').style.visibility = "hidden";
	  }
  	  break;
	case "latitudeInput":
	  latitude = val;
	  break;    
	case "longitudeInput":
	  longitude = val;
	  break;
	case "unit":
	  if(val == 0)
	  	units = "metric"; 
	  else
	  	units = "imperial"; 
	  //last item on property, check weather now.
	  getWeather();
	  break;  
	case "btnRefresh":
	  //update weather.
	  getWeather();
	  break;
	case "btnGetLocation":
	  //get user's current location
	  getCurrentLocation();
	  break;
	}
}