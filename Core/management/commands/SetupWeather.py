from django.core.management.base import BaseCommand, CommandError
from Weather.views import *

class Command(BaseCommand):
	help = "Set Up Database Weather Locations"

	def handle(self, *args, **options):
		print "Updating Weather Locations (This May Take A While Depending On Your Internet Connection)"
		updateLocations()