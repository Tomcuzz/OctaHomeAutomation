from django.db import models

class WeatherLocations(models.Model):
	locationId = models.TextField()
	name = models.TextField()
	region = models.TextField()
	unitaryAuthArea = models.TextField()
	longitude = models.TextField()
	latitude = models.TextField()
	elevation = models.TextField()
	
	class Meta:
		db_table = u'WeatherLocations'

class Weather(models.Model):
	Postcode = models.TextField()
	LoadDate = models.DateTimeField(auto_now=True)
	FiveDayWeatherString = models.TextField(default="")
	
	class Meta:
		db_table = u'Weather'