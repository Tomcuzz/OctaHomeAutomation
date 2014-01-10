from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from threading import Thread
from Lights.background import *
import time

class Command(BaseCommand):
	args = '<poll_id poll_id ...>'
	help = 'Start up server with the nesasery background tasks'
	shutdown = False
	
	def handle(self, *args, **options):
		LightsBackground().backgroundLoop(self)
		#t = Thread(target=self.backgroundLoop()) #LightsBackground().backgroundLoop(self))
		#t.start()
		#call_command('runserver', '0.0.0.0:80')
		#self.shutdown = True
		#t.join()
	
	def backgroundLoop(self):
		while not self.shutdown:
			print "Strated Ok"
			time.sleep(5)
