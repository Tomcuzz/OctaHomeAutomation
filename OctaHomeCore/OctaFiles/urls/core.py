from OctaHomeCore.messagecommands import *
from OctaHomeCore.OctaFiles.urls.base import *
from django.utils import importlib
from django.conf import settings

#Import All Menu files so that they appear
for app in settings.INSTALLED_APPS:
	try:
		importlib.import_module(app + ".OctaFiles.menus")
	except: 
		pass

class CoreOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Core/Messages/(?P<command>\w+)/$', handleMessageCommand.as_view(), name='MessagesCommand'),
		]