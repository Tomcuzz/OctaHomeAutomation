from django.core.management.base import BaseCommand, CommandError
from OctaHomeCore.models.weather import *
from django.conf import settings

class Command(BaseCommand):
	help = "Set Up Database Weather Locations"

	def handle(self, *args, **options):
		if settings.MET_OFFICE_API_KEY != "":
			print "Updating Weather Locations (This May Take A While Depending On Your Internet Connection)"
			WeatherLocation.objects.updateLocations()
			print "Weather Location Update Complete!"
		else:
			print "ERROR: No API Key Found, Please Get A API Key From The MET Office"
