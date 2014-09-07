from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
	call_command('migrate', interactive=True)
	call_command('SetupUser', interactive=True)
	call_command('SetupWeather', interactive=True)