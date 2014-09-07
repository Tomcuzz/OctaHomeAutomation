from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
	help = "Set Up All Server Veriables"

	def handle(self, *args, **options):
		call_command('migrate', interactive=True)
		call_command('SetupUser', interactive=True)
		call_command('SetupWeather', interactive=True)
		call_command('SetupCoreLocations', interactive=True)