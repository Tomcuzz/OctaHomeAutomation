from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect
from django.utils.timezone import utc
from models import *
import urllib
import json
import datetime

def WeatherMain(request):
	raise Http404

def updateLocations():
	apiKey = "c07dabd7-a7b1-4136-8f4c-0afd4716bcfd"
	url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key=" + apiKey
	page = urllib.urlopen(url).read()
	jsonResult = json.loads(page)
	
	
	locationItems = jsonResult['Locations']['Location']
	
	for location in locationItems:
		try:
			weatherLocationObject = WeatherLocations.objects.get(locationId=location['id'])
			
		except WeatherLocations.DoesNotExist:
			weatherLocationObject = WeatherLocations(locationId=location['id'])
		
		weatherLocationObject.name = location['name']
		weatherLocationObject.region = location['region']
		try:
			weatherLocationObject.unitaryAuthArea = location['unitaryAuthArea']
		except KeyError:
			weatherLocationObject.unitaryAuthArea = ""
		weatherLocationObject.longitude = location['longitude']
		weatherLocationObject.latitude = location['latitude']
		try:
			weatherLocationObject.elevation = location['elevation']
		except KeyError:
			weatherLocationObject.elevation = ""
		
		weatherLocationObject.save()

def getWeatherArray(location):
	try:
		localWeatherObject = Weather.objects.get(Postcode=location)
		if localWeatherObject.LoadDate < datetime.datetime.utcnow().replace(tzinfo=utc) - datetime.timedelta(hours=1):
			localWeatherObject = updateWeather(location)
	except Weather.DoesNotExist:
		localWeatherObject = updateWeather(location)
	
	return json.loads(localWeatherObject.FiveDayWeatherString)

def return5DayWeatherItem(location):
	try:
		localWeatherObject = Weather.objects.get(Postcode=location)
		if localWeatherObject.LoadDate < datetime.datetime.utcnow().replace(tzinfo=utc) - datetime.timedelta(hours=1):
			localWeatherObject = updateWeather(location)
	except Weather.DoesNotExist:
		localWeatherObject = updateWeather(location)
	
	return json.loads(localWeatherObject.FiveDayWeatherString)

def updateWeather(location):
	apiKey = "c07dabd7-a7b1-4136-8f4c-0afd4716bcfd"
	fivedayurl = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/" + location + "?res=daily&key=" + apiKey
	fivedaypage = urllib.urlopen(fivedayurl).read()
	
	try:
		localWeatherObject = Weather.objects.get(Postcode=location)
		localWeatherObject.FiveDayWeatherString = fivedaypage
		localWeatherObject.save()
	except Weather.DoesNotExist:
		localWeatherObject = Weather(Postcode=location, FiveDayWeatherString=fivedaypage)
		localWeatherObject.save()
	
	return localWeatherObject

def getTempUnits(location):
	weatherItem = return5DayWeatherItem(location)
	if weatherItem['SiteRep']['Wx']['Param'][0]['units'] == "F":
		return "fahrenheit"
	else:
		return "celsius"

def getTempMax(loaction, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][0]['Dm']

def getTempMin(loaction, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][1]['Nm']

def getFeelsLikeTemp(loaction, day=0, forDay=True):
	weatherItem = return5DayWeatherItem(location)
	if forDay:
		dayInt = 0
		tempKey = "FDm"
	else:
		dayInt = 1
		tempKey = "FNm"
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][dayInt][tempKey]

def getHumidity(loaction, day=0, forDay=True):
	weatherItem = return5DayWeatherItem(location)
	if forDay:
		dayInt = 0
		tempKey = "Hn"
	else:
		dayInt = 1
		tempKey = "Hm"
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][dayInt][tempKey]

def getWindDirection(location, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][0]['D']

def getWindSpeed(location, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][0]['S']

def getWindGust(loaction, day=0, forDay=True):
	weatherItem = return5DayWeatherItem(location)
	if forDay:
		dayInt = 0
		tempKey = "Gn"
	else:
		dayInt = 1
		tempKey = "Gm"
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][dayInt][tempKey]

def getWeatherTypeNum(location, day=0, isNight=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][isNight]['W']

def getMaxUVIndex(location, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][0]['U']

def getPrecipitationProbability(loaction, day=0, forDay=True):
	weatherItem = return5DayWeatherItem(location)
	if forDay:
		dayInt = 0
		tempKey = "PPd"
	else:
		dayInt = 1
		tempKey = "PPn"
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][dayInt][tempKey]

def getVisibilityNum(loaction, day=0):
	weatherItem = return5DayWeatherItem(location)
	return weatherItem['SiteRep']['DV']['Location']['Period'][day]['Rep'][0]['V']

def getVisibilityText(loaction, day=0):
	visabilityNum = getVisibilityNum(loaction, day)
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

def getWeatherTypeText(location, day=0, isNight=0):
	weatherNum = getWeatherTypeNum(location, day, isNight)
	if weatherNum == "NA":
		return "Not available"
	elif weatherNum == "0":
		return "Clear night"
	elif weatherNum == "1":
		return "Sunny day"
	elif weatherNum == "2":
		return "Partly cloudy" #(Night)
	elif weatherNum == "3":
		return "Partly cloudy" #(day)
	elif weatherNum == "4":
		return "Not available" #Not used
	elif weatherNum == "5":
		return "Mist"
	elif weatherNum == "6":
		return "Fog"
	elif weatherNum == "7":
		return "Cloudy"
	elif weatherNum == "8":
		return "Overcast"
	elif weatherNum == "9":
		return "Light rain shower" #(night)
	elif weatherNum == "10":
		return "Light rain shower" #(day)
	elif weatherNum == "11":
		return "Drizzle"
	elif weatherNum == "12":
		return "Light rain"
	elif weatherNum == "13":
		return "Heavy rain shower" #(night)
	elif weatherNum == "14":
		return "Heavy rain shower" #(day)
	elif weatherNum == "15":
		return "Heavy rain"
	elif weatherNum == "16":
		return "Sleet shower" #(night)
	elif weatherNum == "17":
		return "Sleet shower" #(day)
	elif weatherNum == "18":
		return "Sleet"
	elif weatherNum == "19":
		return "Hail shower" #(night)
	elif weatherNum == "20":
		return "Hail shower" #(day)
	elif weatherNum == "21":
		return "Hail"
	elif weatherNum == "22":
		return "Light snow shower" #(night)
	elif weatherNum == "23":
		return "Light snow shower" #(day)
	elif weatherNum == "24":
		return "Light snow"
	elif weatherNum == "25":
		return "Heavy snow shower" #(night)
	elif weatherNum == "26":
		return "Heavy snow shower" #(day)
	elif weatherNum == "27":
		return "Heavy snow"
	elif weatherNum == "28":
		return "Thunder shower" #(night)
	elif weatherNum == "29":
		return "Thunder shower" #(day)
	elif weatherNum == "30":
		return "Thunder"
	else:
		return "Not available"
