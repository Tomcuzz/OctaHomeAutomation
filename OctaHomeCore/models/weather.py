from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.timezone import utc
import urllib
import json
import datetime

class WeatherLocationManager(models.Manager):
	def updateLocations(self):
		apiKey = settings.MET_OFFICE_API_KEY
		if apiKey != "":
			try:
				url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key=" + apiKey
				page = urllib.urlopen(url).read()
				jsonResult = json.loads(page)
				
				locationItems = jsonResult['Locations']['Location']
				
				for location in locationItems:
					try:
						weatherLocationObject = WeatherLocation.objects.get(locationId=location['id'])
						
					except WeatherLocation.DoesNotExist:
						weatherLocationObject = WeatherLocation()
						weatherLocationObject.locationId = str(location['id'])
					
					weatherLocationObject.name = location['name']
					weatherLocationObject.longitude = location['longitude']
					weatherLocationObject.latitude = location['latitude']
					
					if location.has_key("region"):
						weatherLocationObject.region = location['region']
					if location.has_key("unitaryAuthArea"):
						weatherLocationObject.unitaryAuthArea = location['unitaryAuthArea']
					if location.has_key('elevation'):
						weatherLocationObject.elevation = location['elevation']
					
					weatherLocationObject.save()
			except IOError, e:
				pass
			except AttributeError, e:
				pass


class WeatherLocation(models.Model):
	objects = WeatherLocationManager()
	
	locationId = models.TextField()
	name = models.TextField()
	region = models.TextField(default="")
	unitaryAuthArea = models.TextField(default="")
	longitude = models.TextField()
	latitude = models.TextField()
	elevation = models.TextField(default="")
	
	weather = models.OneToOneField('Weather', related_name='WeatherLocation', null=True)
	
	def getWeather(self):
		if self.weather == None:
			#Get WEATHER FROM INTERNET HERE
			weatherItem = Weather.objects.create()
			weatherItem.save()
			self.weather = weatherItem
			self.save()
			self.weather.update()
		elif self.weather.LoadDate < datetime.datetime.utcnow().replace(tzinfo=utc) - datetime.timedelta(hours=1):
			#UPDATE THE WEATHER ITEM
			self.weather.update()
		
		return self.weather
	
		
	class Meta:
		db_table = u'WeatherLocations'


class Weather(models.Model):
	
	LoadDate = models.DateTimeField(auto_now=True)
	MesurementUnits = models.TextField(default="[]")
	FiveDayWeather = models.TextField(default="[]")
	
	def setMesurementUnits(self, units):
		self.MesurementUnits = json.dumps(units)
	
	def getMesurementUnits(self):
		if self.MesurementUnits == "":
			return []
		else:
			return json.loads(self.MesurementUnits)
	
	
	def setFiveDayWeather(self, weather):
		self.FiveDayWeather = json.dumps(weather)
	
	def getFiveDayWeather(self):
		if self.FiveDayWeather == "":
			return []
		else:
			return json.loads(self.FiveDayWeather)
	
	
	def update(self):
		try:
			apiKey = settings.MET_OFFICE_API_KEY
			fivedayurl = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/" + self.WeatherLocation.locationId + "?res=daily&key=" + apiKey
			weatherArray = json.loads(urllib.urlopen(fivedayurl).read())
			self.setMesurementUnits(weatherArray['SiteRep']['Wx']['Param'])
			self.setFiveDayWeather(weatherArray['SiteRep']['DV'])
			self.LoadDate = timezone.now()
			self.save()
		except IOError, e:
			pass
		except AttributeError, e:
			pass
	
	def getTempUnits(self):
		if self.getMesurementUnits()[0]['units'] == "F":
			return "Fahrenheit"
		else:
			return "Celsius"
	
	def getTempMax(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][0]['Dm']
	
	def getTempMin(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][1]['Nm']
	
	def getFeelsLikeTemp(self, day=0, forDay=True):
		if forDay:
			dayInt = 0
			tempKey = "FDm"
		else:
			dayInt = 1
			tempKey = "FNm"
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][dayInt][tempKey]
	
	def getHumidity(self, day=0, forDay=True):
		if forDay:
			dayInt = 0
			tempKey = "Hn"
		else:
			dayInt = 1
			tempKey = "Hm"
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][dayInt][tempKey]
	
	def getWindDirection(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][0]['D']
	
	def getWindSpeed(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][0]['S']
	
	def getWindGust(self, day=0, forDay=True):
		if forDay:
			dayInt = 0
			tempKey = "Gn"
		else:
			dayInt = 1
			tempKey = "Gm"
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][dayInt][tempKey]
	
	def getWeatherTypeNum(self, day=0, isNight=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][isNight]['W']
	
	def getMaxUVIndex(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][0]['U']
	
	def getPrecipitationProbability(self, day=0, forDay=True):
		if forDay:
			dayInt = 0
			tempKey = "PPd"
		else:
			dayInt = 1
			tempKey = "PPn"
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][dayInt][tempKey]
	
	def getVisibilityNum(self, day=0):
		return self.getFiveDayWeather()['Location']['Period'][day]['Rep'][0]['V']
	
	def getVisibilityText(self, day=0):
		visabilityNum = self.getVisibilityNum(day)
		if visabilityNum == "UN":
			return "Unknown"
		elif visabilityNum == "VP":
			return "Less than 1km" #Very poor
		elif visabilityNum == "PO":
			return "Between 1-4 km" #Poor
		elif visabilityNum == "MO":
			return "Between 4-10 km" #Moderate
		elif visabilityNum == "GO":
			return "Between 10-20 km" #Good
		elif visabilityNum == "VG":
			return "Between 20-40 km" #Very good
		elif visabilityNum == "EX":
			return "More than 40 km" #Excellent
		else:
			return "Unavalable"
	
	def getWeatherTypeText(self, day=0, isNight=0):
		weatherNum = int(self.getWeatherTypeNum(day, isNight))
		if -1 < weatherNum < 31:
			return "Not available"
		else:
			states = ["Clear night", 
				"Sunny day", 
				"Partly cloudy", 
				"Partly cloudy", 
				"Not available", 
				"Mist", 
				"Fog", 
				"Cloudy", 
				"Overcast", 
				"Light rain shower", 
				"Light rain shower", 
				"Drizzle",
				"Light rain", 
				"Heavy rain shower", 
				"Heavy rain shower", 
				"Heavy rain", 
				"Sleet shower", 
				"Sleet shower", 
				"Sleet", 
				"Hail shower", 
				"Hail shower", 
				"Hail", 
				"Light snow shower", 
				"Light snow shower", 
				"Light snow", 
				"Heavy snow shower", 
				"Heavy snow shower", 
				"Heavy snow", 
				"Thunder shower", 
				"Thunder shower", 
				"Thunder"]
			
			return states[weatherNum]
	
	class Meta:
		db_table = u'WeatherForcast'


