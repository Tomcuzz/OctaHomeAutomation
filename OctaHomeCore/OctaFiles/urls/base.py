from django.conf import settings
from django.utils import importlib
from django.conf.urls import patterns, include, url

class OctaUrls(object):
	@classmethod
	def getAllUrls(cls):
		#Import All Url files so that they appear
		for app in settings.INSTALLED_APPS:
			try:
				importlib.import_module(app + ".OctaFiles.urls")
			except: 
				pass
		
		urls = cls.getUrls()
		for aClass in cls.__subclasses__():
			urls.extend(aClass.getAllUrls())
		
		return urls
		
	@classmethod
	def getUrls(cls):
		return []