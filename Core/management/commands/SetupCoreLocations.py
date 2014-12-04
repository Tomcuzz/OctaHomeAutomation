from django.core.management.base import BaseCommand, CommandError
from Core.locationmodels import *
from Core.weathermodels import *

class Command(BaseCommand):
	help = "Set Up Core Model Items (World, Country, House, Rooms)"

	def handle(self, *args, **options):
		world = World()
		world.Name = 'Earth'
		world.save()
		
		countryName = self.getAskForDetail('Country Name')
		country = Country()
		country.Name = countryName
		country.World = world
		country.save()
		
		
		homeLocationString = self.getAskForDetail('House Location (6 digit number from the met office)(London Is: 352409) [xxxxxx]:',
			"No Location Code Entered Please Enter Your Home Location (6 digit number from the met office)",
			'', 6, True)
		homeLocation = WeatherLocation.objects.get(locationId=homeLocationString)
		
		homeName = self.getAskForDetail('House Name')
		home = Home()
		home.IsRemote = True
		home.Name = homeName
		home.Country = country
		home.WeatherLocation = homeLocation
		home.save()
		
		roomsAdded = 0
		while True:
			roomName = self.getAskForDetail('Room Name', "Nothing Entered Please Enter Room Name Or Type 'FINISH'", "Room Name (Or 'FINISH' To End):")
			if roomName == 'FINISH':
				if roomsAdded != 0:
					break
			else:
				room = Room()
				room.Name = roomName
				room.Home = home
				room.save()
				
				roomsAdded = roomsAdded + 1
		
	def getAskForDetail(self, detailName, errorMessage='', prompt='', specificLength=0, onlyDigits=False):
		toReturn = ''
		print "Please enter " + detailName
		if prompt != '':
			message = prompt
		else:
			message = detailName + ":"
		
		while True:
			toReturn = raw_input(message)
			if toReturn and (specificLength == 0 or len(toReturn) == specificLength) and ((not onlyDigits) or toReturn.isdigit()):
				break
			else:
				if errorMessage != '':
					print errorMessage
				else:
					print "Input Error Please Enter " + detailName
		return toReturn
