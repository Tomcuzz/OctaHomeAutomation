from django.core.management.base import BaseCommand, CommandError
from Core.models import *

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
		
		homeName = self.getAskForDetail('House Name')
		home = Home()
		home.Name = homeName
		home.Country = country
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
		
	def getAskForDetail(self, detailName, errorMessage='', prompt=''):
		toReturn = ''
		print "Please enter " + detailName
		if prompt != '':
			message = prompt
		else:
			message = detailName + ":"
		
		while True:
			toReturn = raw_input(message)
			if toReturn:
				break
			else:
				if errorMessage != '':
					print errorMessage
				else:
					print "Nothing Entered Please Enter " + detailName
		return toReturn
