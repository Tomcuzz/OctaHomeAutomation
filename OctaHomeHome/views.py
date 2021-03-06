from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect
from OctaHomeWeather.views import *
import datetime
from astral import Astral

from django.utils.timezone import utc
from OctaHomeCore.views.base import *
from OctaHomeCore.models import *


class handleHomeView(viewRequestHandler):
	Home = None
	Weather = None
	
	def getViewParameters(self):
		try:
			self.Home = Home.objects.get(IsRemote=False)
			self.Weather = self.Home.WeatherLocation.getWeather()
		except Home.DoesNotExist:
			self.Home = None
			self.Weather = None
		
		if self.Home != None:
			houseName = self.Home.Name
		else:
			houseName = 'OctaHome'
		
		try:
			background = self.getCorrectBackground()
			rain = self.getRainLevel()
		except:
			self.Weather = None
			background = self.getCorrectBackground()
			rain = self.getRainLevel()
		
		parameters = {'housename': houseName, 'background':background, 'rain':rain}
		
		return parameters
	
	def getTemplate(self):
		return 'OctaHomeHome/Home'
	
	def getCorrectBackground(self):
		if self.Weather == None:
			return "day-sunny"
		
		city_name = 'London'
		a = Astral()
		a.solar_depression = 'civil'
		city = a[city_name]
		now = datetime.datetime.utcnow().replace(tzinfo=utc)
		sun = city.sun(date=datetime.datetime.now(), local=True) 
		
		if now < sun['dawn']:
			#night
			return self.getNightBackground()
		elif now < sun['sunrise']:
			#sunrise
			return self.getSunSetRiseBackground()
		elif now < sun['sunset']:
			#day
			return self.getDayBackground()
		elif now < sun['dusk']:
			#sunset
			return self.getSunSetRiseBackground()
		else:
			#night
			return self.getNightBackground()
	
	def getSunSetRiseBackground(self):
		return "sunset-clearsky"
			
	def getNightBackground(self):
		weatherNum = self.Weather.getWeatherTypeNum(0, 1)
		if 28 <= int(weatherNum) <= 30:
			return "night-lightning"
		else:
			return "night-clearsky"
	
	def getDayBackground(self):
		weatherNum = self.Weather.getWeatherTypeNum()
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
	
	
	def getRainLevel(self):
		if self.Weather == None:
			return "norain"
		
		city_name = 'London'
		a = Astral()
		a.solar_depression = 'civil'
		city = a[city_name]
		now = datetime.datetime.utcnow().replace(tzinfo=utc)
		sun = city.sun(date=datetime.datetime.now(), local=True) 
		
		if now < sun['dawn']:
			#night
			weatherNum = self.Weather.getWeatherTypeNum(0, 1)
		elif now < sun['sunrise']:
			#sunrise
			weatherNum = self.Weather.getWeatherTypeNum()
		elif now < sun['sunset']:
			#day
			weatherNum = self.Weather.getWeatherTypeNum()
		elif now < sun['dusk']:
			#sunset
			weatherNum = self.Weather.getWeatherTypeNum(0, 1)
		else:
			#night
			weatherNum = self.Weather.getWeatherTypeNum(0, 1)
		
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
		
	def getSidebarUrlName(self):
		return 'Home'
