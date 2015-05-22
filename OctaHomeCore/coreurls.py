from django.conf.urls import url
from messagecommands import *
from inputoutputviews import *
from django.db import models
from django.utils import importlib
from django.conf import settings

#Import All Menu files so that they appear
for app in settings.INSTALLED_APPS:
	try:
		importlib.import_module(app + ".OctaFiles.menus")
	except: 
		pass

urlpatterns = [
	url(r'^Messages/(?P<command>\w+)/$', handleMessageCommand.as_view(), name='MessagesCommand'),
]
