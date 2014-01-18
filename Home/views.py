from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect
from Weather.views import *
import datetime
from astral import Astral

def HomeMain(request):
	if not request.user.is_authenticated():
                return redirect('/Login?next=%s' % request.path)
        else:
		return render(request, 'pages/Home.html', {'background':getCorrectBackground(request), 'rain':getRainLevel(request)})


def getCorrectBackground(request):
	city_name = 'London'
	a = Astral()
	a.solar_depression = 'civil'
	city = a[city_name]
	now = datetime.datetime.utcnow().replace(tzinfo=utc)
	sun = city.sun(date=datetime.datetime.now(), local=True) 
	
	location = request.user.home_location
	
	if now < sun['dawn']:
		#night
		return getNightBackground(location)
	elif now < sun['sunrise']:
		#sunrise
		return getSunSetRiseBackground(location)
	elif now < sun['sunset']:
		#day
		return getDayBackground(location)
	elif now < sun['dusk']:
		#sunset
		return getSunSetRiseBackground(location)
	else:
		#night
		return getNightBackground(location)

def getSunSetRiseBackground(location):
	return "sunset-clearsky"
		
def getNightBackground(location):
	weatherNum = getWeatherTypeNum(location, 0, 1)
	if 28 <= int(weatherNum) <= 30:
		return "night-lightning"
	else:
		return "night-clearsky"

def getDayBackground(location):
	weatherNum = getWeatherTypeNum(location)
	if 0 <= int(weatherNum) <= 4:
		return "day-sunny"
	elif 5 <= int(weatherNum) <= 6:
		return "day-fog"
	elif 7 <= int(weatherNum) <= 21:
		return "day-overcast"
	elif 22 <= int(weatherNum) <= 27:
		return "day-snow"
	elif 28 <= int(weatherNum) <= 30:
		return "night-lightning"
	else:
		return "day-sunny"
		
		
def getRainLevel(request):
	location = request.user.home_location
	city_name = 'London'
	a = Astral()
	a.solar_depression = 'civil'
	city = a[city_name]
	now = datetime.datetime.utcnow().replace(tzinfo=utc)
	sun = city.sun(date=datetime.datetime.now(), local=True) 
	
	if now < sun['dawn']:
		#night
		weatherNum = getWeatherTypeNum(location, 0, 1)
	elif now < sun['sunrise']:
		#sunrise
		weatherNum = getWeatherTypeNum(location)
	elif now < sun['sunset']:
		#day
		weatherNum = getWeatherTypeNum(location)
	elif now < sun['dusk']:
		#sunset
		weatherNum = getWeatherTypeNum(location, 0, 1)
	else:
		#night
		weatherNum = getWeatherTypeNum(location, 0, 1)
	
	if 0 <= int(weatherNum) <= 8:
		return "norain"
	elif 9 <= int(weatherNum) <= 10:
		return "lightrain"
	elif int(weatherNum) == 11:
		return "drizzel"
	elif int(weatherNum) == 12:
		return "lightrain"
	elif 13 <= int(weatherNum) <= 15:
		return "heavyrain"
	elif 16 <= int(weatherNum) <= 27:
		return "norain"
	elif 28 <= int(weatherNum) <= 29:
		return "heavyrain"
	else:
		return "norain"